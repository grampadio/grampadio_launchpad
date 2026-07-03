import {
  Address,
  beginCell,
  StateInit,
  storeStateInit,
  toNano,
} from '@ton/core';
import { JettonMaster, JettonWallet } from '@ton/ton';
import {
  GramPadGramxStaking,
  storeClaimRewards,
  storeConfigureStake,
  storeDeploy,
  storeFundContractTon,
  storeOwnerWithdrawAnyJetton,
  storeOwnerWithdrawGramx,
  storeOwnerWithdrawTon,
  storeSetAnnualRoi,
  storeSetDurationRoi,
  storeSetFlexUnstakeFee,
  storeSetGramxJettonWallet,
  storeUnstake,
} from '../../contracts/build/GramPadGramxStaking_GramPadGramxStaking.js';
import {
  buildJettonTransferPayload,
  cellToBase64,
  getTonClient,
  parseTokenAmount,
} from './gramStarter.js';

export const GRAMX_DECIMALS = Number((import.meta as any).env.VITE_GRAMX_DECIMALS);
export const GRAMX_MASTER_ADDRESS = String((import.meta as any).env.VITE_GRAMX_MASTER || '').trim();
export const STAKING_CONTRACT_ADDRESS = String((import.meta as any).env.VITE_STAKING_CONTRACT_ADDRESS || '').trim();
export const STAKING_DEFAULT_APR_BPS = Number((import.meta as any).env.VITE_STAKING_DEFAULT_APR_BPS || 0);
export const STAKING_DEFAULT_MIN_GRAMX = String((import.meta as any).env.VITE_STAKING_DEFAULT_MIN_GRAMX || '100');
export const STAKING_DEFAULT_FLEX_FEE_BPS = Number((import.meta as any).env.VITE_STAKING_DEFAULT_FLEX_FEE_BPS || 500);

const stakingReadCache = new Map<string, { expiresAt: number; promise: Promise<any> }>();
const STAKING_READ_CACHE_MS = 2000;
const GRAMX_WALLET_CACHE_PREFIX = 'grampad-gramx-wallet';

export const STAKING_EXIT_REASONS: Record<number, string> = {
  130: 'The staking contract could not decode this message. Check that the frontend and deployed contract versions match.',
  1173: 'Invalid stake position index.',
  2512: 'Stake position was not found.',
  5637: 'No rewards are currently available to claim.',
  6699: 'This stake position is no longer active.',
  7529: 'Not enough TON was attached for reward-claim gas.',
  8808: 'The reward reserve is too low to pay the earned reward.',
  12648: 'The GRAMX amount is below the minimum stake.',
  15828: 'This locked stake has not reached maturity.',
  17062: 'The token amount is invalid.',
  18624: 'The staking Jetton wallet is already configured.',
  23376: 'Not enough TON was attached for contract gas.',
  23773: 'The connected wallet does not own this stake position.',
  28788: 'Not enough TON was attached for unstake gas.',
  32101: 'The staking GRAMX Jetton wallet is not configured.',
  35499: 'Only the staking contract owner can perform this action.',
  43959: 'The selected stake type is invalid.',
  45702: 'The selected staking duration is invalid.',
  46056: 'There is no GRAMX available to unstake.',
  46136: 'The FLEX unstake fee is too high.',
  46992: 'Staking is currently paused.',
  50546: 'The GRAMX transfer came from an unexpected Jetton wallet.',
  53544: 'Stake settings were not included with the GRAMX transfer.',
  56230: 'TON funding is required.',
  58668: 'The configured annual ROI is invalid.',
  59564: 'The GRAMX stake payload is invalid.',
  61068: 'The stake position index was not found.',
};

export const getStakingErrorMessage = (error: unknown, fallback: string) => {
  const raw = error instanceof Error ? error.message : String(error || '');
  const codeMatch = raw.match(/(?:exit(?:[_ ]code)?|code)\D*(-?\d+)/i);
  const code = codeMatch ? Number(codeMatch[1]) : undefined;

  if (code !== undefined && STAKING_EXIT_REASONS[code]) {
    return `${STAKING_EXIT_REASONS[code]} (Exit code ${code})`;
  }

  return raw || fallback;
};

const dedupeStakingRead = <T>(key: string, read: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const cached = stakingReadCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.promise as Promise<T>;
  }

  const promise = read().catch(error => {
    stakingReadCache.delete(key);
    throw error;
  });
  stakingReadCache.set(key, {
    expiresAt: now + STAKING_READ_CACHE_MS,
    promise,
  });

  return promise;
};

export const STAKING_DURATIONS = [
{ label: '12 months', seconds: 31536000n, monthsLabel: '12 months' },
{ label: '9 months', seconds: 23328000n, monthsLabel: '9 months' },
{ label: '3 months', seconds: 7776000n, monthsLabel: '3 months' },
{ label: '30 days', seconds: 2592000n, monthsLabel: '30 days' },
{ label: '7 days', seconds: 604800n, monthsLabel: '7 days' },
] as const;

const fallbackPlans = (roiBasisPoints: bigint) => ({
  sevenDaysRoiBasisPoints: roiBasisPoints,
  thirtyDaysRoiBasisPoints: roiBasisPoints,
  threeMonthsRoiBasisPoints: roiBasisPoints,
  nineMonthsRoiBasisPoints: roiBasisPoints,
  twelveMonthsRoiBasisPoints: roiBasisPoints,
});

export const stakingPlanRoiForDuration = (
  plans: ReturnType<typeof fallbackPlans> | undefined,
  durationSeconds: bigint | number | string
) => {
  const duration = BigInt(durationSeconds);
  if (!plans) return 0n;
  if (duration === 604800n) return plans.sevenDaysRoiBasisPoints;
  if (duration === 2592000n) return plans.thirtyDaysRoiBasisPoints;
  if (duration === 7776000n) return plans.threeMonthsRoiBasisPoints;
  if (duration === 23328000n) return plans.nineMonthsRoiBasisPoints;
  return plans.twelveMonthsRoiBasisPoints;
};

export type StakeKind = 'flex' | 'locked';

export const stakeKindToChain = (kind: StakeKind) => kind === 'flex' ? 0n : 1n;

export const stakeKindFromChain = (kind: bigint | number | string): StakeKind =>
  Number(kind) === 1 ? 'locked' : 'flex';

export const parseGRAMXAmount = (value: string | number) =>
  parseTokenAmount(value, GRAMX_DECIMALS);

export const formatTokenAmount = (
  value: bigint | number | string,
  decimals = GRAMX_DECIMALS,
  maxFraction = 4
) => {
  const amount = BigInt(value);
  const unit = 10n ** BigInt(decimals);
  const whole = amount / unit;
  const fraction = amount % unit;

  if (fraction === 0n || maxFraction <= 0) return whole.toString();

  const fractionText = fraction
    .toString()
    .padStart(decimals, '0')
    .slice(0, maxFraction)
    .replace(/0+$/, '');

  return fractionText ? `${whole}.${fractionText}` : whole.toString();
};

export const getUserTonBalance = async (ownerAddress: string) =>
  getTonClient().getBalance(Address.parse(ownerAddress));

export const roiBpsFromPercent = (value: string | number) =>
  BigInt(Math.round(Math.max(0, Math.min(1000, Number(value) || 0)) * 100));

export const buildStakeGramxPayload = (
  amount: bigint,
  stakingContractAddress = STAKING_CONTRACT_ADDRESS,
  responseAddress: string,
  stakeKind: StakeKind,
  durationSeconds: bigint
) => {
  const stakePayload = beginCell()
    .storeUint(0x4752414d, 32)
    .storeUint(stakeKindToChain(stakeKind), 8)
    .storeUint(durationSeconds, 32);

  return buildJettonTransferPayload(
    amount,
    Address.parse(stakingContractAddress),
    Address.parse(responseAddress),
    toNano('0.2'),
    stakePayload
  );
};

// buildRewardTopUpPayload must send JettonTransfer to owner GRAMX wallet
// destination = staking contract address
// responseDestination = owner address
// forwardTonAmount >= 0.05 TON
// forwardPayload = empty cell/slice, NOT stake payload

export function buildRewardTopUpPayload(
  amount: bigint,
  stakingContractAddress: string,
  ownerAddress: string
) {
  return beginCell()
    .storeUint(0xf8a7ea5, 32)
    .storeUint(Date.now(), 64)
    .storeCoins(amount)
    .storeAddress(Address.parse(stakingContractAddress))
    .storeAddress(Address.parse(ownerAddress))
    .storeBit(0) // no custom payload
    .storeCoins(toNano('0.06')) // important
    .storeBit(0) // empty forward payload
    .endCell()
    .toBoc()
    .toString('base64');
}

export const buildClaimStakingRewardsPayload = (stakeId: bigint | number | string) =>
  cellToBase64(
    beginCell()
      .store(storeClaimRewards({ $$type: 'ClaimRewards', stakeId: BigInt(stakeId) }))
      .endCell()
  );

export const buildConfigureStakePayload = (
  stakeKind: StakeKind,
  durationSeconds: bigint
) =>
  cellToBase64(
    beginCell()
      .store(storeConfigureStake({
        $$type: 'ConfigureStake',
        stakeKind: stakeKindToChain(stakeKind),
        durationSeconds,
      }))
      .endCell()
  );

export const buildUnstakePayload = (stakeId: bigint | number | string) =>
  cellToBase64(
    beginCell()
      .store(storeUnstake({ $$type: 'Unstake', stakeId: BigInt(stakeId) }))
      .endCell()
  );

export const buildSetAnnualRoiPayload = (annualRoiBasisPoints: bigint) =>
  cellToBase64(
    beginCell()
      .store(storeSetAnnualRoi({ $$type: 'SetAnnualRoi', annualRoiBasisPoints }))
      .endCell()
  );

export const buildSetDurationRoiPayload = (
  durationDays: number | bigint,
  annualRoiBasisPoints: bigint
) =>
  cellToBase64(
    beginCell()
      .store(storeSetDurationRoi({
        $$type: 'SetDurationRoi',
        durationDays: BigInt(durationDays),
        annualRoiBasisPoints,
      }))
      .endCell()
  );

export const buildSetFlexUnstakeFeePayload = (flexUnstakeFeeBasisPoints: bigint) =>
  cellToBase64(
    beginCell()
      .store(storeSetFlexUnstakeFee({ $$type: 'SetFlexUnstakeFee', flexUnstakeFeeBasisPoints }))
      .endCell()
  );

export const buildSetGramxJettonWalletPayload = (gramxJettonWallet: Address) =>
  cellToBase64(
    beginCell()
      .store(storeSetGramxJettonWallet({
        $$type: 'SetGramxJettonWallet',
        gramxJettonWallet,
      }))
      .endCell()
  );

export const buildFundStakingTonPayload = () =>
  cellToBase64(
    beginCell()
      .store(storeFundContractTon({ $$type: 'FundContractTon' }))
      .endCell()
  );

export const buildOwnerWithdrawTonPayload = (
  amount: bigint,
  destination: string
) =>
  cellToBase64(
    beginCell()
      .store(storeOwnerWithdrawTon({
        $$type: 'OwnerWithdrawTon',
        amount,
        destination: Address.parse(destination),
      }))
      .endCell()
  );

export const buildOwnerWithdrawGramxPayload = (
  amount: bigint,
  destination: string
) =>
  cellToBase64(
    beginCell()
      .store(storeOwnerWithdrawGramx({
        $$type: 'OwnerWithdrawGramx',
        amount,
        destination: Address.parse(destination),
      }))
      .endCell()
  );

export const buildOwnerWithdrawAnyJettonPayload = (
  jettonWallet: string,
  amount: bigint,
  destination: string
) =>
  cellToBase64(
    beginCell()
      .store(storeOwnerWithdrawAnyJetton({
        $$type: 'OwnerWithdrawAnyJetton',
        jettonWallet: Address.parse(jettonWallet),
        amount,
        destination: Address.parse(destination),
      }))
      .endCell()
  );

export const getStakingContract = (address = STAKING_CONTRACT_ADDRESS) =>
  GramPadGramxStaking.fromAddress(Address.parse(address));

export const getUserGramxWalletAddress = async (
  userAddress: string,
  gramxMaster = GRAMX_MASTER_ADDRESS
) => {
  if (!gramxMaster) throw new Error('GRAMX master address is not configured.');

  const cacheKey = `${GRAMX_WALLET_CACHE_PREFIX}:${gramxMaster}:${userAddress}`;
  try {
    const cachedAddress = localStorage.getItem(cacheKey);
    if (cachedAddress) {
      return Address.parse(cachedAddress);
    }
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const client = getTonClient();
      const master = client.open(JettonMaster.create(Address.parse(gramxMaster)));
      const walletAddress = await master.getWalletAddress(Address.parse(userAddress));

      try {
        localStorage.setItem(cacheKey, walletAddress.toString());
      } catch {
        // The derived address is still usable when persistent storage is blocked.
      }

      return walletAddress;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw new Error(
    `Could not derive the GRAMX Jetton wallet: ${
      lastError instanceof Error ? lastError.message : 'TON RPC request failed'
    }`
  );
};

export const getUserGramxBalance = async (
  userAddress: string,
  gramxMaster = GRAMX_MASTER_ADDRESS
) => dedupeStakingRead(
  `gramx-balance:${gramxMaster}:${userAddress}`,
  async () => {
    const client = getTonClient();
    const walletAddress = await getUserGramxWalletAddress(userAddress, gramxMaster);

    try {
      return await client.open(JettonWallet.create(walletAddress)).getBalance();
    } catch {
      return 0n;
    }
  }
);

export const getStakingPoolDetails = async (
  address = STAKING_CONTRACT_ADDRESS
) => {
  if (!address) throw new Error('Staking contract address is not configured.');

  const contract = getTonClient().open(getStakingContract(address));
  const [version, details, plansResult] = await Promise.all([
    contract.getGetContractVersion(),
    contract.getGetContractDetails(),
    contract.getGetStakingPlans().catch(() => null),
  ]);
  const plans = plansResult || fallbackPlans(details.annualRoiBasisPoints);

  return {
    contractVersion: Number(version),
    owner: details.owner.toString(),
    deploymentId: details.deploymentId,
    gramxMaster: details.gramxJettonMaster.toString(),
    gramxWallet: details.gramxJettonWallet.toString(),
    walletConfigured: details.jettonWalletConfigured,
    annualRoiBasisPoints: details.annualRoiBasisPoints,
    plans,
    flexUnstakeFeeBasisPoints: details.flexUnstakeFeeBasisPoints,
    minStake: details.minStake,
    paused: details.paused,
    totalStaked: details.totalStaked,
    rewardReserve: details.rewardReserve,
    totalRewardsPaid: details.totalRewardsPaid,
    totalFeesCollected: details.totalFeesCollected,
    stakerCount: details.activeStakerCount,
    activeStakerCount: details.activeStakerCount,
    totalStakePositions: details.totalStakePositions,
    nextStakeId: details.nextStakeId,
  };
};

const formatStakePosition = (stake: {
  stakeId: bigint;
  owner: Address;
  active: boolean;
  amount: bigint;
  pendingReward: bigint;
  roiBasisPoints: bigint;
  stakeKind: bigint;
  startedAt: bigint;
  duration: bigint;
  maturityAt: bigint;
  claimedRewards: bigint;
}) => ({
  stakeId: stake.stakeId,
  owner: stake.owner.toString(),
  active: stake.active,
  amount: stake.amount,
  stake: stake.amount,
  pendingReward: stake.pendingReward,
  stakeRoiBasisPoints: stake.roiBasisPoints,
  roiBasisPoints: stake.roiBasisPoints,
  stakeKind: stake.stakeKind,
  firstStakeAt: stake.startedAt,
  startedAt: stake.startedAt,
  duration: stake.duration,
  maturityAt: stake.maturityAt,
  claimedRewards: stake.claimedRewards,
});

const formatUserStakingDetails = (
  summary: {
    user: Address;
    totalStakePositions: bigint;
    activeStakePositions: bigint;
  },
  stakes: ReturnType<typeof formatStakePosition>[]
) => {
  const activeStakes = stakes.filter(stake => stake.active);
  const totalActiveStakeAmount = activeStakes.reduce(
    (sum, stake) => sum + stake.amount,
    0n
  );
  const totalPendingReward = activeStakes.reduce(
    (sum, stake) => sum + stake.pendingReward,
    0n
  );

  return {
    user: summary.user.toString(),
    totalStakePositions: summary.totalStakePositions,
    activeStakePositions: summary.activeStakePositions,
    stakeIds: stakes.map(stake => stake.stakeId),
    stakes,
    activeStakes,
    hasActiveStake: summary.activeStakePositions > 0n,
    stake: totalActiveStakeAmount,
    pendingReward: totalPendingReward,
  };
};

export const getStakingDashboard = async (
  userAddress: string,
  address = STAKING_CONTRACT_ADDRESS,
  offset = 0,
  limit = 20
) => dedupeStakingRead(
  `staking-dashboard:${address}:${userAddress}:${offset}:${limit}`,
  async () => {
    if (!address) throw new Error('Staking contract address is not configured.');

    const user = Address.parse(userAddress);
    const contract = getTonClient().open(getStakingContract(address));
    let dashboard;

    try {
      dashboard = await contract.getGetStakingDashboard(
        user,
        BigInt(Math.max(0, offset)),
        BigInt(Math.max(1, Math.min(20, limit)))
      );
    } catch {
      const [pool, userDetails] = await Promise.all([
        getStakingPoolDetails(address),
        getUserStakingDetails(userAddress, address),
      ]);
      return { pool, user: userDetails, offset: 0, nextOffset: userDetails.stakes.length, hasMore: false };
    }

    const details = dashboard.contractDetails;
    const plans = dashboard.stakingPlans || fallbackPlans(details.annualRoiBasisPoints);
    const stakes = Array.from(dashboard.positions.values())
      .map(formatStakePosition)
      .sort((left, right) => Number(left.stakeId - right.stakeId));

    return {
      pool: {
        contractVersion: 11,
        owner: details.owner.toString(),
        deploymentId: details.deploymentId,
        gramxMaster: details.gramxJettonMaster.toString(),
        gramxWallet: details.gramxJettonWallet.toString(),
        walletConfigured: details.jettonWalletConfigured,
        annualRoiBasisPoints: details.annualRoiBasisPoints,
        plans,
        flexUnstakeFeeBasisPoints: details.flexUnstakeFeeBasisPoints,
        minStake: details.minStake,
        paused: details.paused,
        totalStaked: details.totalStaked,
        rewardReserve: details.rewardReserve,
        totalRewardsPaid: details.totalRewardsPaid,
        totalFeesCollected: details.totalFeesCollected,
        stakerCount: details.activeStakerCount,
        activeStakerCount: details.activeStakerCount,
        totalStakePositions: details.totalStakePositions,
        nextStakeId: details.nextStakeId,
      },
      user: formatUserStakingDetails(dashboard.userSummary, stakes),
      offset: Number(dashboard.offset),
      nextOffset: Number(dashboard.nextOffset),
      hasMore: dashboard.hasMore,
    };
  }
);

export const getUserStakingDetails = async (
  userAddress: string,
  address = STAKING_CONTRACT_ADDRESS
) => {
  if (!address) throw new Error('Staking contract address is not configured.');

  const user = Address.parse(userAddress);
  const contract = getTonClient().open(getStakingContract(address));

  const summary = await contract.getGetUserSummary(user);
  const totalStakePositions = Number(summary.totalStakePositions || 0n);

  const stakeIds = await Promise.all(
    Array.from({ length: totalStakePositions }, (_, index) =>
      contract.getGetUserStakeIdByIndex(user, BigInt(index))
    )
  );

  const stakes = await Promise.all(
    stakeIds.map(stakeId => contract.getGetStakeDetails(stakeId))
  );

  return formatUserStakingDetails(summary, stakes.map(formatStakePosition));
};

interface StakingDeploymentInput {
  owner: string;
  gramxMaster: string;
  annualRoiPercent: number;
  planRoiPercents?: {
    sevenDays: number;
    thirtyDays: number;
    threeMonths: number;
    nineMonths: number;
    twelveMonths: number;
  };
  minStake: string;
  flexUnstakeFeePercent: number;
}

export const prepareStakingDeployment = async (
  input: StakingDeploymentInput
) => {
  const owner = Address.parse(input.owner);
  const gramxMaster = Address.parse(input.gramxMaster);
  const annualRoiBasisPoints = roiBpsFromPercent(input.annualRoiPercent);
  const planRois = input.planRoiPercents || {
    sevenDays: input.annualRoiPercent,
    thirtyDays: input.annualRoiPercent,
    threeMonths: input.annualRoiPercent,
    nineMonths: input.annualRoiPercent,
    twelveMonths: input.annualRoiPercent,
  };
  const sevenDaysRoiBasisPoints = roiBpsFromPercent(planRois.sevenDays);
  const thirtyDaysRoiBasisPoints = roiBpsFromPercent(planRois.thirtyDays);
  const threeMonthsRoiBasisPoints = roiBpsFromPercent(planRois.threeMonths);
  const nineMonthsRoiBasisPoints = roiBpsFromPercent(planRois.nineMonths);
  const twelveMonthsRoiBasisPoints = roiBpsFromPercent(planRois.twelveMonths);
  const minStake = parseGRAMXAmount(input.minStake);
  const flexUnstakeFeeBasisPoints = BigInt(
    Math.round(Math.max(0, Math.min(50, Number(input.flexUnstakeFeePercent) || 0)) * 100)
  );
  const deploymentId = BigInt(Date.now());

  const contract = await GramPadGramxStaking.fromInit(
    owner,
    gramxMaster,
    annualRoiBasisPoints,
    sevenDaysRoiBasisPoints,
    thirtyDaysRoiBasisPoints,
    threeMonthsRoiBasisPoints,
    nineMonthsRoiBasisPoints,
    twelveMonthsRoiBasisPoints,
    minStake,
    flexUnstakeFeeBasisPoints,
    deploymentId
  );

  if (!contract.init) {
    throw new Error('Failed to construct staking contract state.');
  }

  const stakingGramxWallet = await getUserGramxWalletAddress(
    contract.address.toString(),
    gramxMaster.toString()
  );

  const ownerGramxWallet = await getUserGramxWalletAddress(
    owner.toString(),
    gramxMaster.toString()
  );

  const stateInit: StateInit = contract.init;
  const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();

  const deployPayload = beginCell()
    .store(storeDeploy({ $$type: 'Deploy', queryId: deploymentId }))
    .endCell();

  return {
    contract,
    deploymentId,
    stakingGramxWallet,
    ownerGramxWallet,
    annualRoiBasisPoints,
    plans: {
      sevenDaysRoiBasisPoints,
      thirtyDaysRoiBasisPoints,
      threeMonthsRoiBasisPoints,
      nineMonthsRoiBasisPoints,
      twelveMonthsRoiBasisPoints,
    },
    deploymentMessage: {
      address: contract.address.toString(),
      amount: toNano('0.06').toString(),
      stateInit: cellToBase64(stateInitCell),
      payload: cellToBase64(deployPayload),
    },
    setupMessages: [
      {
        address: contract.address.toString(),
        amount: toNano('0.03').toString(),
        payload: buildSetGramxJettonWalletPayload(stakingGramxWallet),
      },
      {
        address: contract.address.toString(),
        amount: toNano('0.1').toString(),
        payload: buildFundStakingTonPayload(),
      },
    ],
  };
};
