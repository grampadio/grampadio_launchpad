import {
  Address,
  beginCell,
  StateInit,
  storeStateInit,
  toNano,
} from '@ton/core';
import { JettonMaster, JettonWallet, TonClient } from '@ton/ton';
import {
  GramStarterIdo,
  storeAdvanceStage,
  storeChangeAdmin,
  storeClaimAllocation,
  storeDeploy,
  storeFundContractTon,
  storeRefundUSDT,
  storeSetAdminBlocked,
  storeSetJettonWallets,
  storeSuperWithdrawAnyJetton,
  storeSuperWithdrawJetton,
  storeSuperWithdrawTon,
  storeVote,
  storeWithdrawRaisedUSDT,
  storeWithdrawRemainingSaleTokens,
} from '../../contracts/build/GramStarterIdo_GramStarterIdo.js';

export const MAINNET_USDT_MASTER =
  'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
export const USDT_DECIMALS = Number(
  (import.meta as any).env.VITE_TON_USDT_DECIMALS || 6
);
export const CONTRACT_TON_RESERVE = toNano('0.1');

export const getTonClient = () =>
  new TonClient({
    endpoint:
      (import.meta as any).env.VITE_TONCENTER_ENDPOINT || '',
    apiKey: (import.meta as any).env.VITE_TONCENTER_API_KEY,
  });

export const cellToBase64 = (cell: ReturnType<typeof beginCell> | any) =>
  cell.toBoc().toString('base64');

export const parseTokenAmount = (value: string | number, decimals: number): bigint => {
  const normalized = String(value).trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error('Invalid token amount.');
  }

  const [whole, fraction = ''] = normalized.split('.');
  if (fraction.length > decimals) {
    throw new Error(`Amount supports at most ${decimals} decimal places.`);
  }

  return (
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, '0'))
  );
};

export const parseUSDTAmount = (
  value: string | number,
  decimals = USDT_DECIMALS
) => parseTokenAmount(value, decimals);

export const buildVotePayload = (upvote: boolean) =>
  cellToBase64(
    beginCell().store(storeVote({ $$type: 'Vote', upvote })).endCell()
  );

export const buildAdvanceStagePayload = (nextStage: 3 | 4 | 5) =>
  cellToBase64(
    beginCell()
      .store(storeAdvanceStage({ $$type: 'AdvanceStage', nextStage: BigInt(nextStage) }))
      .endCell()
  );

export const buildSetIdoJettonWalletsPayload = (
  usdtJettonWallet: string,
  saleTokenJettonWallet: string
) =>
  cellToBase64(
    beginCell()
      .store(
        storeSetJettonWallets({
          $$type: 'SetJettonWallets',
          usdtJettonWallet: Address.parse(usdtJettonWallet),
          saleTokenJettonWallet: Address.parse(saleTokenJettonWallet),
        })
      )
      .endCell()
  );

export const buildClaimPayload = () =>
  cellToBase64(
    beginCell().store(storeClaimAllocation({ $$type: 'ClaimAllocation' })).endCell()
  );

export const buildRefundPayload = () =>
  cellToBase64(
    beginCell().store(storeRefundUSDT({ $$type: 'RefundUSDT' })).endCell()
  );

export const buildWithdrawRaisedUsdtPayload = () =>
  cellToBase64(
    beginCell().store(storeWithdrawRaisedUSDT({ $$type: 'WithdrawRaisedUSDT' })).endCell()
  );

export const buildWithdrawRemainingSaleTokensPayload = () =>
  cellToBase64(
    beginCell().store(storeWithdrawRemainingSaleTokens({ $$type: 'WithdrawRemainingSaleTokens' })).endCell()
  );

export const buildSetAdminBlockedPayload = (blocked: boolean) =>
  cellToBase64(
    beginCell().store(storeSetAdminBlocked({ $$type: 'SetAdminBlocked', blocked })).endCell()
  );

export const buildChangeAdminPayload = (newAdmin: string) =>
  cellToBase64(
    beginCell()
      .store(storeChangeAdmin({ $$type: 'ChangeAdmin', newAdmin: Address.parse(newAdmin) }))
      .endCell()
  );

export const buildSuperWithdrawJettonPayload = (
  asset: 0 | 1,
  amount: bigint,
  destination: string
) =>
  cellToBase64(
    beginCell()
      .store(
        storeSuperWithdrawJetton({
          $$type: 'SuperWithdrawJetton',
          asset: BigInt(asset),
          amount,
          destination: Address.parse(destination),
        })
      )
      .endCell()
  );

export const buildSuperWithdrawAnyJettonPayload = (
  jettonWallet: string,
  amount: bigint,
  destination: string
) =>
  cellToBase64(
    beginCell()
      .store(
        storeSuperWithdrawAnyJetton({
          $$type: 'SuperWithdrawAnyJetton',
          jettonWallet: Address.parse(jettonWallet),
          amount,
          destination: Address.parse(destination),
        })
      )
      .endCell()
  );

export const buildSuperWithdrawTonPayload = (amount: bigint, destination: string) =>
  cellToBase64(
    beginCell()
      .store(
        storeSuperWithdrawTon({
          $$type: 'SuperWithdrawTon',
          amount,
          destination: Address.parse(destination),
        })
      )
      .endCell()
  );

export const buildFundIdoTonPayload = () =>
  cellToBase64(
    beginCell().store(storeFundContractTon({ $$type: 'FundContractTon' })).endCell()
  );

export const getIdoContract = (address: string) =>
  GramStarterIdo.fromAddress(Address.parse(address));

export const getIdoContractLightStatus = async (contractAddress: string) => {
  const address = Address.parse(contractAddress.trim());
  const client = getTonClient();
  const state = await client.getContractState(address);
  if (state.state !== 'active') {
    throw new Error('The IDO contract is not active on the configured TON network.');
  }

  return {
    address: address.toString(),
    tonBalance: state.balance,
  };
};

export const getIdoAdminField = async (contractAddress: string, field: string) => {
  const address = Address.parse(contractAddress.trim());
  const client = getTonClient();
  const contract = client.open(GramStarterIdo.fromAddress(address));

  switch (field) {
    case 'tonBalance':
      return (await client.getContractState(address)).balance;
    case 'version':
      return contract.getGetContractVersion();
    case 'tonReserve':
      return contract.getGetTonReserve();
    case 'deploymentId':
      return contract.getGetDeploymentId();
    case 'stage':
      return contract.getGetIdoState();
    case 'failedReason':
      return contract.getGetFailedReason();
    case 'raised':
      return contract.getGetRaisedCapital();
    case 'softCap':
      return contract.getGetSoftCap();
    case 'hardCap':
      return contract.getGetHardCap();
    case 'minBuy':
      return contract.getGetMinBuy();
    case 'maxBuy':
      return contract.getGetMaxBuy();
    case 'soldTokens':
      return contract.getGetSoldTokens();
    case 'owner':
      return contract.getGetAdmin();
    case 'superAdmin':
      return contract.getGetSuperadmin();
    case 'adminBlocked':
      return contract.getGetAdminBlocked();
    case 'raisedUsdtWithdrawn':
      return contract.getGetRaisedUsdtWithdrawn();
    case 'saleTokenRequired':
      return contract.getGetSaleTokenRequired();
    case 'saleTokenDeposited':
      return contract.getGetSaleTokenDeposited();
    case 'saleTokenClaimed':
      return contract.getGetSaleTokenClaimed();
    case 'tgeBasisPoints':
      return contract.getGetTgeBasisPoints();
    case 'cliffDuration':
      return contract.getGetCliffDuration();
    case 'vestingPeriods':
      return contract.getGetMonthlyVestingPeriods();
    case 'distributionStartedAt':
      return contract.getGetDistributionStartedAt();
    case 'usdtRefunded':
      return contract.getGetUsdtRefunded();
    case 'upvotes':
      return contract.getGetUpvotes();
    case 'downvotes':
      return contract.getGetDownvotes();
    case 'participantCount':
      return contract.getGetParticipantCount();
    case 'claimsProcessed':
      return contract.getGetClaimsProcessed();
    case 'refundsProcessed':
      return contract.getGetRefundsProcessed();
    case 'usdtMaster':
      return contract.getGetUsdtJettonMaster();
    case 'usdtDecimals':
      return contract.getGetUsdtDecimals();
    case 'saleTokenMaster':
      return contract.getGetSaleTokenJettonMaster();
    case 'usdtWallet':
      return contract.getGetUsdtJettonWallet();
    case 'saleTokenWallet':
      return contract.getGetSaleTokenJettonWallet();
    case 'remainingSaleTokensWithdrawn':
      return contract.getGetRemainingSaleTokensWithdrawn();
    case 'walletsConfigured':
      return contract.getGetJettonWalletsConfigured();
    default:
      throw new Error(`Unknown IDO field: ${field}`);
  }
};

export const getIdoAdminDetails = async (contractAddress: string) => {
  const address = Address.parse(contractAddress.trim());
  const client = getTonClient();
  const state = await client.getContractState(address);
  if (state.state !== 'active') {
    throw new Error('The IDO contract is not active on the configured TON network.');
  }

  const contract = client.open(GramStarterIdo.fromAddress(address));
  const [
    version,
    tonReserve,
    deploymentId,
    stage,
    failedReason,
    raised,
    softCap,
    hardCap,
    minBuy,
    maxBuy,
    soldTokens,
    owner,
    superAdmin,
    adminBlocked,
    raisedUsdtWithdrawn,
    saleTokenRequired,
    saleTokenDeposited,
    saleTokenClaimed,
    tgeBasisPoints,
    cliffDuration,
    vestingPeriods,
    distributionStartedAt,
    usdtRefunded,
    upvotes,
    downvotes,
    participantCount,
    claimsProcessed,
    refundsProcessed,
    usdtMaster,
    usdtDecimals,
    saleTokenMaster,
    usdtWallet,
    saleTokenWallet,
    remainingSaleTokensWithdrawn,
    walletsConfigured,
  ] = await Promise.all([
    contract.getGetContractVersion(),
    contract.getGetTonReserve(),
    contract.getGetDeploymentId(),
    contract.getGetIdoState(),
    contract.getGetFailedReason(),
    contract.getGetRaisedCapital(),
    contract.getGetSoftCap(),
    contract.getGetHardCap(),
    contract.getGetMinBuy(),
    contract.getGetMaxBuy(),
    contract.getGetSoldTokens(),
    contract.getGetAdmin(),
    contract.getGetSuperadmin(),
    contract.getGetAdminBlocked(),
    contract.getGetRaisedUsdtWithdrawn(),
    contract.getGetSaleTokenRequired(),
    contract.getGetSaleTokenDeposited(),
    contract.getGetSaleTokenClaimed(),
    contract.getGetTgeBasisPoints(),
    contract.getGetCliffDuration(),
    contract.getGetMonthlyVestingPeriods(),
    contract.getGetDistributionStartedAt(),
    contract.getGetUsdtRefunded(),
    contract.getGetUpvotes(),
    contract.getGetDownvotes(),
    contract.getGetParticipantCount(),
    contract.getGetClaimsProcessed(),
    contract.getGetRefundsProcessed(),
    contract.getGetUsdtJettonMaster(),
    contract.getGetUsdtDecimals(),
    contract.getGetSaleTokenJettonMaster(),
    contract.getGetUsdtJettonWallet(),
    contract.getGetSaleTokenJettonWallet(),
    contract.getGetRemainingSaleTokensWithdrawn(),
    contract.getGetJettonWalletsConfigured(),
  ]);

  return {
    address: address.toString(),
    tonBalance: state.balance,
    version,
    tonReserve,
    deploymentId,
    stage,
    failedReason,
    raised,
    softCap,
    hardCap,
    minBuy,
    maxBuy,
    soldTokens,
    owner,
    superAdmin,
    adminBlocked,
    raisedUsdtWithdrawn,
    saleTokenRequired,
    saleTokenDeposited,
    saleTokenClaimed,
    tgeBasisPoints,
    cliffDuration,
    vestingPeriods,
    distributionStartedAt,
    usdtRefunded,
    upvotes,
    downvotes,
    participantCount,
    claimsProcessed,
    refundsProcessed,
    usdtMaster,
    usdtDecimals,
    saleTokenMaster,
    usdtWallet,
    saleTokenWallet,
    remainingSaleTokensWithdrawn,
    walletsConfigured,
  };
};

export const getIdoConfigurationStatus = async (contractAddress: string) => {
  const address = Address.parse(contractAddress);
  const client = getTonClient();
  const state = await client.getContractState(address);
  if (state.state !== 'active') {
    throw new Error('The IDO contract is not active on TON yet.');
  }

  const contract = client.open(GramStarterIdo.fromAddress(address));
  const [version, owner, superAdmin, stage, configured, saleTokenRequired, saleTokenDeposited] = await Promise.all([
    contract.getGetContractVersion(),
    contract.getGetAdmin(),
    contract.getGetSuperadmin(),
    contract.getGetIdoState(),
    contract.getGetJettonWalletsConfigured(),
    contract.getGetSaleTokenRequired(),
    contract.getGetSaleTokenDeposited(),
  ]);

  return {
    version,
    owner,
    superAdmin,
    stage,
    configured,
    saleTokenRequired,
    saleTokenDeposited,
  };
};

export const getIdoRecoveryDetails = async (contractAddress: string) => {
  const address = Address.parse(contractAddress.trim());
  const client = getTonClient();
  const state = await client.getContractState(address);
  if (state.state !== 'active') {
    throw new Error('This IDO contract is not active on the configured TON network.');
  }

  const contract = client.open(GramStarterIdo.fromAddress(address));
  const readGetter = async <T>(name: string, getter: () => Promise<T>) => {
    try {
      return await getter();
    } catch (error: any) {
      const rpcMessage = error?.message || String(error);
      throw new Error(
        `The address is active, but IDO getter "${name}" failed. ` +
        `Confirm this is the GramPad IDO contract address on the configured network, not a Jetton master or Jetton wallet. ${rpcMessage}`
      );
    }
  };

  // Check compatibility first so an unrelated active contract produces a useful error.
  const version = await readGetter('get_contract_version', () =>
    contract.getGetContractVersion()
  );
  if (version !== 13n && version !== 14n) {
    throw new Error(
      `Unsupported IDO contract version ${version}. Recovery supports GramPad IDO versions 13 and 14.`
    );
  }

  const deploymentId = await readGetter('get_deployment_id', () => contract.getGetDeploymentId());
  const owner = await readGetter('get_admin', () => contract.getGetAdmin());
  const usdtDecimals = await readGetter('get_usdt_decimals', () => contract.getGetUsdtDecimals());
  const softCap = await readGetter('get_soft_cap', () => contract.getGetSoftCap());
  const hardCap = await readGetter('get_hard_cap', () => contract.getGetHardCap());
  const minBuy = await readGetter('get_min_buy', () => contract.getGetMinBuy());
  const maxBuy = await readGetter('get_max_buy', () => contract.getGetMaxBuy());
  const saleTokenMaster = await readGetter('get_sale_token_jetton_master', () =>
    contract.getGetSaleTokenJettonMaster()
  );
  const saleTokenRequired = await readGetter('get_sale_token_required', () =>
    contract.getGetSaleTokenRequired()
  );
  const saleTokenDeposited = await readGetter('get_sale_token_deposited', () =>
    contract.getGetSaleTokenDeposited()
  );
  const tgeBasisPoints = await readGetter('get_tge_basis_points', () =>
    contract.getGetTgeBasisPoints()
  );
  const cliffDuration = await readGetter('get_cliff_duration', () =>
    contract.getGetCliffDuration()
  );
  const vestingMonths = await readGetter('get_monthly_vesting_periods', () =>
    contract.getGetMonthlyVestingPeriods()
  );
  const walletsConfigured = await readGetter('get_jetton_wallets_configured', () =>
    contract.getGetJettonWalletsConfigured()
  );

  if (!walletsConfigured) throw new Error('IDO Jetton wallets are not configured.');
  if (saleTokenDeposited < saleTokenRequired) {
    throw new Error('The required sale-token deposit is not complete.');
  }

  const unit = 10n ** usdtDecimals;
  const toDisplayNumber = (value: bigint) =>
    Number(value / unit) + Number(value % unit) / Number(unit);

  return {
    address: address.toString(),
    owner: owner.toString(),
    deploymentId,
    version: Number(version),
    usdtDecimals: Number(usdtDecimals),
    softCap: toDisplayNumber(softCap),
    hardCap: toDisplayNumber(hardCap),
    minBuy: toDisplayNumber(minBuy),
    maxBuy: toDisplayNumber(maxBuy),
    saleTokenMaster: saleTokenMaster.toString(),
    saleTokenRequired,
    saleTokenDeposited,
    vestingTgePercent: Number(tgeBasisPoints) / 100,
    cliffDurationDays: Math.floor(Number(cliffDuration) / 86400),
    vestingMonths: Number(vestingMonths),
  };
};

const addressGetterArgument = (address: string) => ({
  type: 'slice' as const,
  cell: beginCell().storeAddress(Address.parse(address)).endCell(),
});

export const getUserHasVoted = async (
  contractAddress: string,
  userAddress: string
) => {
  const result = await getTonClient().runMethod(
    Address.parse(contractAddress),
    'get_user_has_voted',
    [addressGetterArgument(userAddress)]
  );
  return result.stack.readBoolean();
};

export const getUserVote = async (
  contractAddress: string,
  userAddress: string
) => {
  const result = await getTonClient().runMethod(
    Address.parse(contractAddress),
    'get_user_vote',
    [addressGetterArgument(userAddress)]
  );
  return result.stack.readBoolean();
};

export const getUserContribution = async (
  contractAddress: string,
  userAddress: string
) => {
  const result = await getTonClient().runMethod(
    Address.parse(contractAddress),
    'get_user_contribution',
    [addressGetterArgument(userAddress)]
  );
  return result.stack.readBigNumber();
};

export const buildJettonTransferPayload = (
  amount: bigint,
  destination: Address,
  responseDestination: Address,
  forwardTonAmount = toNano('0.05'),
  forwardPayload?: ReturnType<typeof beginCell>
) => {
  const transfer = beginCell()
    .storeUint(0xf8a7ea5, 32)
    .storeUint(BigInt(Date.now()), 64)
    .storeCoins(amount)
    .storeAddress(destination)
    .storeAddress(responseDestination)
    .storeBit(0)
    .storeCoins(forwardTonAmount);

  if (forwardPayload) {
    transfer.storeBit(1).storeRef(forwardPayload);
  } else {
    transfer.storeBit(0);
  }

  return cellToBase64(transfer.endCell());
};

interface DeploymentInput {
  owner: string;
  superAdmin: string;
  saleTokenMaster: string;
  saleTokenDecimals: number;
  softCap: number;
  hardCap: number;
  minBuy: number;
  maxBuy: number;
  rate: number;
  vestingTgePercent: number;
  cliffDurationDays?: number;
  vestingMonths: number;
}

export const prepareIdoDeployment = async (input: DeploymentInput) => {
  const softCapAmount = parseUSDTAmount(input.softCap);
  const hardCapAmount = parseUSDTAmount(input.hardCap);
  const minBuyAmount = parseUSDTAmount(input.minBuy);
  const maxBuyAmount = parseUSDTAmount(input.maxBuy);

  if (maxBuyAmount > hardCapAmount) {
    throw new Error('Maximum Participation Buy cannot exceed the Hard Cap.');
  }

  const owner = Address.parse(input.owner);
  const superAdmin = Address.parse(input.superAdmin);

  if (owner.equals(superAdmin)) {
    throw new Error(
      'Project creation blocked: the creator wallet and permanent superadmin wallet must be different. Configure VITE_LAUNCHPAD_WALLET with another testnet wallet.'
    );
  }

  const usdtMasterAddress = Address.parse(
    (import.meta as any).env.VITE_TON_USDT_MASTER || MAINNET_USDT_MASTER
  );
  const saleTokenMasterAddress = Address.parse(input.saleTokenMaster);
  const saleTokenUnit = 10n ** BigInt(input.saleTokenDecimals);
  const usdtUnit = 10n ** BigInt(USDT_DECIMALS);
  const tokenPriceMicroUsdt = BigInt(
    Math.max(1, Math.round(Number(usdtUnit) / input.rate))
  );
  const deploymentId = BigInt(Date.now());

  const contract = await GramStarterIdo.fromInit(
    owner,
    superAdmin,
    CONTRACT_TON_RESERVE,
    usdtMasterAddress,
    saleTokenMasterAddress,
    softCapAmount,
    hardCapAmount,
    minBuyAmount,
    maxBuyAmount,
    tokenPriceMicroUsdt,
    saleTokenUnit,
    BigInt(Math.round(input.vestingTgePercent * 100)),
    BigInt(Math.max(0, Math.floor(input.cliffDurationDays || 0)) * 24 * 60 * 60),
    BigInt(input.vestingTgePercent >= 100 ? 0 : Math.max(1, input.vestingMonths)),
    BigInt(USDT_DECIMALS),
    deploymentId
  );

  if (!contract.init) {
    throw new Error('Failed to construct IDO contract state.');
  }

  const client = getTonClient();
  const usdtMaster = client.open(JettonMaster.create(usdtMasterAddress));
  const saleTokenMaster = client.open(JettonMaster.create(saleTokenMasterAddress));
  let idoUsdtWallet: Address;
  let idoSaleTokenWallet: Address;
  let ownerSaleTokenWallet: Address;

  try {
    idoUsdtWallet = await usdtMaster.getWalletAddress(contract.address);
  } catch (error) {
    throw new Error(
      `Could not derive the IDO USDT Jetton wallet from ${usdtMasterAddress.toString()}. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  try {
    idoSaleTokenWallet = await saleTokenMaster.getWalletAddress(contract.address);
  } catch (error) {
    throw new Error(
      `Could not derive the IDO sale-token Jetton wallet from ${saleTokenMasterAddress.toString()}. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  try {
    ownerSaleTokenWallet = await saleTokenMaster.getWalletAddress(owner);
  } catch (error) {
    throw new Error(
      `Could not derive your sale-token Jetton wallet from ${saleTokenMasterAddress.toString()}. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const saleTokenRequired =
    (hardCapAmount * saleTokenUnit) / tokenPriceMicroUsdt;
  let ownerSaleBalance = 0n;

  try {
    const ownerWalletState = await client.getContractState(ownerSaleTokenWallet);
    if (ownerWalletState.state !== 'active') {
      throw new Error(
        `Your sale-token Jetton wallet ${ownerSaleTokenWallet.toString()} is not initialized. Transfer some of this Jetton to the connected owner wallet first.`
      );
    }

    ownerSaleBalance = await client
      .open(JettonWallet.create(ownerSaleTokenWallet))
      .getBalance();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('not initialized')) {
      throw error;
    }
    throw new Error(
      `Could not read the connected owner's sale-token balance. Confirm this is a valid Jetton master and that the owner holds this token. ${message}`
    );
  }

  if (ownerSaleBalance < saleTokenRequired) {
    throw new Error(
      `Insufficient sale-token balance. Required ${saleTokenRequired.toString()} base units, available ${ownerSaleBalance.toString()}.`
    );
  }

  const stateInit: StateInit = contract.init;
  const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();
  const deployPayload = beginCell()
    .store(storeDeploy({ $$type: 'Deploy', queryId: deploymentId }))
    .endCell();
  const configurePayload = beginCell()
    .store(
      storeSetJettonWallets({
        $$type: 'SetJettonWallets',
        usdtJettonWallet: idoUsdtWallet,
        saleTokenJettonWallet: idoSaleTokenWallet,
      })
    )
    .endCell();

  return {
    contract,
    deploymentId,
    usdtDecimals: USDT_DECIMALS,
    saleTokenRequired,
    encodedTokenomics: {
      softCap: softCapAmount,
      hardCap: hardCapAmount,
      minBuy: minBuyAmount,
      maxBuy: maxBuyAmount,
    },
    deploymentMessage: {
      address: contract.address.toString(),
      amount: toNano('0.25').toString(),
      stateInit: cellToBase64(stateInitCell),
      payload: cellToBase64(deployPayload),
    },
    setupMessages: [
      {
        address: contract.address.toString(),
        amount: toNano('0.25').toString(),
        payload: cellToBase64(configurePayload),
      },
      {
        address: ownerSaleTokenWallet.toString(),
        amount: toNano('0.25').toString(),
        payload: buildJettonTransferPayload(
          saleTokenRequired,
          contract.address,
          owner,
          toNano('0.15')
        ),
      },
    ],
  };
};

export const waitForContract = async (
  contract: GramStarterIdo,
  predicate: (opened: any) => Promise<boolean>,
  timeoutMs = 90_000,
  timeoutMessage = 'The smart-contract transaction was not confirmed in time.'
) => {
  const opened = getTonClient().open(contract);
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      if (await predicate(opened)) {
        return;
      }
    } catch (error) {
      lastError = error;
      // The contract may not be active yet.
    }
    await new Promise(resolve => setTimeout(resolve, 3_000));
  }

  const detail = lastError instanceof Error ? ` Last RPC error: ${lastError.message}` : '';
  throw new Error(`${timeoutMessage}${detail}`);
};

export const waitForIdoDeployment = async (
  contract: GramStarterIdo,
  timeoutMs = 60_000
) => {
  const client = getTonClient();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const state = await client.getContractState(contract.address);

    if (state.state === 'active') {
      const opened = client.open(contract);
      const version = await opened.getGetContractVersion();
      if (version !== 14n) {
        throw new Error(`Unexpected IDO contract version ${version.toString()}.`);
      }
      return;
    }

    if (state.lastTransaction) {
      throw new Error(
        `The deployment transaction reached ${contract.address.toString()}, but the account did not become active.`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 3_000));
  }

  throw new Error(
    `No deployment transaction reached ${contract.address.toString()}. The wallet accepted the request locally but did not broadcast it to TON testnet.`
  );
};
