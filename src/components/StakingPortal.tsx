import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { CHAIN } from '@tonconnect/protocol';
import { Address, toNano } from '@ton/core';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Coins,
  Gauge,
  Loader2,
  Lock,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { WalletState } from '../types.js';
import {
  buildClaimStakingRewardsPayload,
  buildOwnerWithdrawAnyJettonPayload,
  buildOwnerWithdrawGramxPayload,
  buildOwnerWithdrawTonPayload,
  buildRewardTopUpPayload,
  buildSetGramxJettonWalletPayload,
  buildSetDurationRoiPayload,
  buildSetFlexUnstakeFeePayload,
  buildStakeGramxPayload,
  buildUnstakePayload,
  formatTokenAmount,
  getStakingErrorMessage,
  getStakingDashboard,
  getStakingPoolDetails,
  getUserGramxBalance,
  getUserGramxWalletAddress,
  getUserStakingDetails,
  getUserTonBalance,
  GRAMX_DECIMALS,
  GRAMX_MASTER_ADDRESS,
  parseGRAMXAmount,
  prepareStakingDeployment,
  STAKING_CONTRACT_ADDRESS,
  STAKING_DEFAULT_APR_BPS,
  STAKING_DEFAULT_FLEX_FEE_BPS,
  STAKING_DEFAULT_MIN_GRAMX,
  STAKING_DURATIONS,
  stakingPlanRoiForDuration,
  stakeKindFromChain,
  type StakeKind,
} from '../ton/staking.js';

interface StakingPortalProps {
  wallet: WalletState;
  onOpenConnect: () => void;
}

type PoolDetails = Awaited<ReturnType<typeof getStakingPoolDetails>>;
type UserStakeDetails = Awaited<ReturnType<typeof getUserStakingDetails>>;
type StakePosition = UserStakeDetails['stakes'][number];

const cardClass = 'gp-panel rounded-3xl p-5 sm:p-7';
const inputClass = 'w-full rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 transition focus:border-sky-400/45 focus:outline-none';
const labelClass = 'mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400';
const stakingNetwork = String((import.meta as any).env.VITE_TONCENTER_ENDPOINT || '')
  .includes('testnet')
  ? CHAIN.TESTNET
  : CHAIN.MAINNET;

const shortAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-6)}`;

const dateFromSeconds = (value: bigint | number | string) => {
  const seconds = Number(value);
  if (!seconds) return 'Not started';
  return new Date(seconds * 1000).toLocaleString();
};

const durationLabel = (seconds: bigint | number | string) =>
  STAKING_DURATIONS.find(item => item.seconds === BigInt(seconds))?.label ||
  `${Math.round(Number(seconds) / 86400)} days`;

const durationDaysFromSeconds = (seconds: bigint | number | string) =>
  Math.round(Number(seconds) / 86400);

const formatTonAmount = (value: bigint) => {
  const whole = value / 1000000000n;
  const fraction = (value % 1000000000n).toString().padStart(9, '0').slice(0, 4).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
};

export default function StakingPortal({ wallet, onOpenConnect }: StakingPortalProps) {
  const [tonConnectUI] = useTonConnectUI();

  const [pool, setPool] = useState<PoolDetails | null>(null);
  const [userStake, setUserStake] = useState<UserStakeDetails | null>(null);
  const [gramxBalance, setGramxBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [stakeAmount, setStakeAmount] = useState('');
  const [rewardTopUpAmount, setRewardTopUpAmount] = useState('');
  const [withdrawTonAmount, setWithdrawTonAmount] = useState('');
  const [withdrawGramxAmount, setWithdrawGramxAmount] = useState('');
  const [withdrawAnyJettonWallet, setWithdrawAnyJettonWallet] = useState('');
  const [withdrawAnyJettonAmount, setWithdrawAnyJettonAmount] = useState('');
  const [roiPercent, setRoiPercent] = useState('0');
  const [roiDurationDays, setRoiDurationDays] = useState('30');
  const [flexFeePercent, setFlexFeePercent] = useState(String(STAKING_DEFAULT_FLEX_FEE_BPS / 100));
  const [stakeKind, setStakeKind] = useState<StakeKind>('flex');
  const [stakeDuration, setStakeDuration] = useState<bigint>(STAKING_DURATIONS[1].seconds);

  const [deployGramxMaster, setDeployGramxMaster] = useState(GRAMX_MASTER_ADDRESS);
  const [deployPlanRois, setDeployPlanRois] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      STAKING_DURATIONS.map(duration => [
        String(durationDaysFromSeconds(duration.seconds)),
        String(STAKING_DEFAULT_APR_BPS / 100),
      ])
    )
  );
  const [deployMinStake, setDeployMinStake] = useState(STAKING_DEFAULT_MIN_GRAMX);
  const [deployFlexFee, setDeployFlexFee] = useState(String(STAKING_DEFAULT_FLEX_FEE_BPS / 100));
  const [deployedAddress, setDeployedAddress] = useState('');
  const [stakeView, setStakeView] = useState<'active' | 'closed'>('active');

  const contractAddress = STAKING_CONTRACT_ADDRESS;
  const isConfigured = Boolean(contractAddress);

  const isOwner = useMemo(() => {
    if (!pool || !wallet.address) return false;
    try {
      return Address.parse(pool.owner).equals(Address.parse(wallet.address));
    } catch {
      return pool.owner.toLowerCase() === wallet.address.toLowerCase();
    }
  }, [pool, wallet.address]);


const planRoiValues = pool?.plans
  ? STAKING_DURATIONS.map(duration => Number(stakingPlanRoiForDuration(pool.plans, duration.seconds)) / 100)
  : [];
const planRoiLabel = planRoiValues.length
  ? `${Math.min(...planRoiValues).toLocaleString()}%-${Math.max(...planRoiValues).toLocaleString()}%`
  : 'Loading...';

  const activeStakes = userStake?.activeStakes || [];
  const allStakes = userStake?.stakes || [];
  const closedStakes = allStakes.filter(stake => !stake.active);
  const visibleStakes = stakeView === 'active' ? activeStakes : closedStakes;
  const hasActiveStake = activeStakes.length > 0;

  useEffect(() => {
    if (!pool?.plans) return;
    const selectedDuration = STAKING_DURATIONS.find(
      item => String(durationDaysFromSeconds(item.seconds)) === roiDurationDays
    );
    if (!selectedDuration) return;
    setRoiPercent(String(Number(stakingPlanRoiForDuration(pool.plans, selectedDuration.seconds)) / 100));
  }, [pool?.plans, roiDurationDays]);

  const loadStaking = async () => {
    if (!isConfigured) return;
    setLoading(true);
    setMessage(null);

    try {
      if (wallet.connected && wallet.address) {
        const dashboard = await getStakingDashboard(wallet.address, contractAddress, 0, 20);
        const balance = await getUserGramxBalance(
          wallet.address,
          dashboard.pool.gramxMaster
        );

        setPool(dashboard.pool);
        setRoiPercent(String(Number(dashboard.pool.annualRoiBasisPoints) / 100));
        setFlexFeePercent(String(Number(dashboard.pool.flexUnstakeFeeBasisPoints) / 100));
        setUserStake(dashboard.user);
        setGramxBalance(balance);
      } else {
        const poolData = await getStakingPoolDetails(contractAddress);
        setPool(poolData);
        setRoiPercent(String(Number(poolData.annualRoiBasisPoints) / 100));
        setFlexFeePercent(String(Number(poolData.flexUnstakeFeeBasisPoints) / 100));
        setUserStake(null);
        setGramxBalance(0n);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to load staking data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaking();
  }, [contractAddress, wallet.connected, wallet.address]);

  const afterTransaction = async (text: string) => {
    setMessage({ type: 'success', text });
    setTimeout(() => {
      loadStaking();
    }, 4000);
  };

  const requireWallet = () => {
    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      throw new Error('Connect wallet first.');
    }
    return wallet.address;
  };

  const requireTonBalance = async (owner: string, required: bigint, actionLabel: string) => {
    const balance = await getUserTonBalance(owner);
    if (balance < required) {
      throw new Error(
        `${actionLabel} needs at least ${formatTonAmount(required)} TON in the connected wallet. Current balance is ${formatTonAmount(balance)} TON.`
      );
    }
  };

  const stakeGramx = async (event: FormEvent) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (!(submitter instanceof HTMLButtonElement) || submitter.dataset.action !== 'create-stake') {
      return;
    }
    setAction('stake');
    setMessage(null);

    try {
      const userAddress = requireWallet();
      if (!pool?.walletConfigured) throw new Error('Staking contract wallet is not configured yet.');

      const amount = parseGRAMXAmount(stakeAmount);
      const userGramxWallet = await getUserGramxWalletAddress(userAddress, pool.gramxMaster);
      const payload = buildStakeGramxPayload(
        amount,
        contractAddress,
        userAddress,
        stakeKind,
        stakeDuration
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [
          {
            address: userGramxWallet.toString(),
            amount: toNano('0.1').toString(),
            payload,
          },
        ],
      });

      setStakeAmount('');
      await afterTransaction(`New ${stakeKind.toUpperCase()} stake position sent. This stake keeps the on-chain ROI snapshot.`);
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Stake failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  const claimRewards = async (stakeId: bigint | number | string) => {
    setAction(`claim-${stakeId}`);
    setMessage(null);

    try {
      requireWallet();

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [
          {
            address: contractAddress,
            amount: toNano('0.18').toString(),
            payload: buildClaimStakingRewardsPayload(stakeId),
          },
        ],
      });

      await afterTransaction(`Reward claim sent for stake #${stakeId}.`);
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: getStakingErrorMessage(error, 'Claim failed.') });
      }
    } finally {
      setAction(null);
    }
  };

  const unstakeGramx = async (stake: StakePosition) => {
    const stakeId = stake.stakeId;
    setAction(`unstake-${stakeId}`);
    setMessage(null);

    try {
      requireWallet();

      const kind = stakeKindFromChain(stake.stakeKind);
      const maturityAt = Number(stake.maturityAt || 0n);
      const matured = maturityAt <= Math.floor(Date.now() / 1000);
      const locked = kind === 'locked' && !matured;
      const flexEarly = kind === 'flex' && !matured;

      if (locked) throw new Error('This LOCKED stake is not mature yet.');

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [
          {
            address: contractAddress,
            amount: toNano('0.18').toString(),
            payload: buildUnstakePayload(stakeId),
          },
        ],
      });

      await afterTransaction(
        flexEarly
          ? `FLEX unstake sent for stake #${stakeId}. Early withdrawal fee is deducted on-chain.`
          : `Unstake sent for stake #${stakeId}.`
      );
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: getStakingErrorMessage(error, 'Unstake failed.') });
      }
    } finally {
      setAction(null);
    }
  };

  const topUpRewards = async (event: FormEvent) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (!(submitter instanceof HTMLButtonElement) || submitter.dataset.action !== 'fund-rewards') {
      return;
    }
    setAction('topup');
    setMessage(null);

    try {
      const userAddress = requireWallet();
      if (!isOwner) throw new Error('Only staking owner can fund rewards.');

      const amount = parseGRAMXAmount(rewardTopUpAmount);
      const previousReserve = pool?.rewardReserve || 0n;
      const ownerGramxWallet = await getUserGramxWalletAddress(
        userAddress,
        pool?.gramxMaster || GRAMX_MASTER_ADDRESS
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [
          {
            address: ownerGramxWallet.toString(),
            amount: toNano('0.35').toString(),
            payload: buildRewardTopUpPayload(amount, contractAddress, userAddress),
          },
        ],
      });

      setRewardTopUpAmount('');
      setMessage({
        type: 'success',
        text: 'Reward funding sent. Waiting for the staking contract to confirm the reserve...',
      });

      for (let attempt = 0; attempt < 15; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const updatedPool = await getStakingPoolDetails(contractAddress);

        if (updatedPool.rewardReserve >= previousReserve + amount) {
          setPool(updatedPool);
          await loadStaking();
          setMessage({
            type: 'success',
            text: `Reward reserve funded successfully with ${formatTokenAmount(amount)} GRAMX.`,
          });
          return;
        }
      }

      throw new Error(
        'The wallet submitted the GRAMX transfer, but the staking contract did not confirm the reward reserve increase. The Jetton transfer may have been returned.'
      );
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: getStakingErrorMessage(error, 'Reward top-up failed.') });
      }
    } finally {
      setAction(null);
    }
  };

  const updateRoi = async (event: FormEvent) => {
    event.preventDefault();
    setAction('roi');
    setMessage(null);

    try {
      requireWallet();
      if (!isOwner) throw new Error('Only staking owner can update ROI.');

      const bps = BigInt(Math.round(Number(roiPercent) * 100));

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [
          {
            address: contractAddress,
            amount: toNano('0.05').toString(),
            payload: buildSetDurationRoiPayload(Number(roiDurationDays), bps),
          },
        ],
      });

      await afterTransaction(`${roiDurationDays}-day annual ROI update sent. New stakes for this duration will use the updated ROI.`);
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'ROI update failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  const configureStakingJettonWallet = async () => {
    setAction('configure-wallet');
    setMessage(null);

    try {
      const owner = requireWallet();
      await requireTonBalance(owner, toNano('0.045'), 'Staking Jetton wallet configuration');
      if (!isOwner) throw new Error('Only the staking owner can configure the Jetton wallet.');
      if (!pool) throw new Error('Load staking contract data first.');
      if (pool.walletConfigured) throw new Error('Staking Jetton wallet is already configured.');

      const stakingGramxWallet = await getUserGramxWalletAddress(
        contractAddress,
        pool.gramxMaster
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [{
          address: contractAddress,
          amount: toNano('0.03').toString(),
          payload: buildSetGramxJettonWalletPayload(stakingGramxWallet),
        }],
      });

      setMessage({
        type: 'success',
        text: 'Wallet submitted the setup transaction. Waiting for on-chain confirmation...',
      });

      for (let attempt = 0; attempt < 12; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const updatedPool = await getStakingPoolDetails(contractAddress);

        if (updatedPool.walletConfigured) {
          setPool(updatedPool);
          setMessage({
            type: 'success',
            text: `Staking Jetton wallet configured: ${updatedPool.gramxWallet}`,
          });
          return;
        }
      }

      throw new Error(
        'The wallet accepted the request, but no configuration transaction reached the staking contract. Check the connected owner wallet transaction history.'
      );
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({
          type: 'error',
          text: getStakingErrorMessage(error, 'Jetton wallet configuration failed.'),
        });
      }
    } finally {
      setAction(null);
    }
  };

  const withdrawOwnerTon = async (event: FormEvent) => {
    event.preventDefault();
    setAction('withdraw-ton');
    setMessage(null);

    try {
      const owner = requireWallet();
      if (!isOwner) throw new Error('Only the staking owner can withdraw TON.');

      const amount = toNano(withdrawTonAmount);
      if (amount <= 0n) throw new Error('Enter a valid TON amount.');

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [{
          address: contractAddress,
          amount: toNano('0.05').toString(),
          payload: buildOwnerWithdrawTonPayload(amount, owner),
        }],
      });

      setWithdrawTonAmount('');
      await afterTransaction('Owner TON withdrawal sent.');
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: getStakingErrorMessage(error, 'TON withdrawal failed.') });
      }
    } finally {
      setAction(null);
    }
  };

  const withdrawOwnerGramx = async (event: FormEvent) => {
    event.preventDefault();
    setAction('withdraw-gramx');
    setMessage(null);

    try {
      const owner = requireWallet();
      if (!isOwner) throw new Error('Only the staking owner can withdraw GRAMX.');

      const amount = parseGRAMXAmount(withdrawGramxAmount);
      if (amount <= 0n) throw new Error('Enter a valid GRAMX amount.');

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [{
          address: contractAddress,
          amount: toNano('0.18').toString(),
          payload: buildOwnerWithdrawGramxPayload(amount, owner),
        }],
      });

      setWithdrawGramxAmount('');
      await afterTransaction('Owner GRAMX fee withdrawal sent.');
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: getStakingErrorMessage(error, 'GRAMX withdrawal failed.') });
      }
    } finally {
      setAction(null);
    }
  };

  const withdrawOwnerAnyJetton = async (event: FormEvent) => {
    event.preventDefault();
    setAction('withdraw-any-jetton');
    setMessage(null);

    try {
      const owner = requireWallet();
      if (!isOwner) throw new Error('Only the staking owner can withdraw tokens.');
      if (!withdrawAnyJettonWallet.trim()) throw new Error('Enter the Jetton wallet address.');

      let amount = 0n;
      try {
        amount = BigInt(String(withdrawAnyJettonAmount || '0'));
      } catch {
        throw new Error('Token amount must be a whole number in base units.');
      }
      if (amount <= 0n) throw new Error('Enter a positive token amount in base units.');

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [{
          address: contractAddress,
          amount: toNano('0.18').toString(),
          payload: buildOwnerWithdrawAnyJettonPayload(withdrawAnyJettonWallet, amount, owner),
        }],
      });

      setWithdrawAnyJettonWallet('');
      setWithdrawAnyJettonAmount('');
      await afterTransaction('Owner token emergency withdrawal sent.');
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: getStakingErrorMessage(error, 'Token withdrawal failed.') });
      }
    } finally {
      setAction(null);
    }
  };

  const deployContract = async (event: FormEvent) => {
    event.preventDefault();
    setAction('deploy');
    setMessage(null);
    setDeployedAddress('');

    try {
      const owner = requireWallet();
      await requireTonBalance(owner, toNano('0.08'), 'Staking contract deployment');

      const deployment = await prepareStakingDeployment({
        owner,
        gramxMaster: deployGramxMaster,
        annualRoiPercent: Math.max(...Object.values(deployPlanRois).map(value => Number(value) || 0)),
        planRoiPercents: {
          sevenDays: Number(deployPlanRois['7']) || 0,
          thirtyDays: Number(deployPlanRois['30']) || 0,
          threeMonths: Number(deployPlanRois['90']) || 0,
          nineMonths: Number(deployPlanRois['270']) || 0,
          twelveMonths: Number(deployPlanRois['365']) || 0,
        },
        minStake: deployMinStake,
        flexUnstakeFeePercent: Number(deployFlexFee),
      });

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [
          deployment.deploymentMessage,
        ],
      });

      setMessage({
        type: 'success',
        text: 'Deploy submitted with duration ROI plans. Waiting for on-chain confirmation...',
      });

      const address = deployment.contract.address.toString();

      for (let attempt = 0; attempt < 15; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const deployedPool = await getStakingPoolDetails(address);
          setDeployedAddress(address);
          setPool(deployedPool);
          setMessage({
            type: 'success',
            text: `Staking contract deployed at ${address}. Now click "Configure staking Jetton wallet" to finish setup.`,
          });
          return;
        } catch {
          // The account may not be active yet while the deployment is finalizing.
        }
      }

      throw new Error(
        `Contract deployment was submitted at ${address}, but it was not confirmed yet. Check Tonviewer and try refresh.`
      );
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Deployment failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  const configureDeployedStakingWallet = async () => {
    setAction('configure-deployed-wallet');
    setMessage(null);

    try {
      const owner = requireWallet();
      await requireTonBalance(owner, toNano('0.045'), 'Staking Jetton wallet configuration');
      if (!deployedAddress) throw new Error('Deploy staking contract first.');

      const stakingGramxWallet = await getUserGramxWalletAddress(deployedAddress, deployGramxMaster);

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [{
          address: deployedAddress,
          amount: toNano('0.1').toString(),
          payload: buildSetGramxJettonWalletPayload(stakingGramxWallet),
        }],
      });

      setMessage({
        type: 'success',
        text: 'Configure staking Jetton wallet submitted. Waiting for confirmation...',
      });

      for (let attempt = 0; attempt < 15; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const deployedPool = await getStakingPoolDetails(deployedAddress);
        if (deployedPool.walletConfigured) {
          setPool(deployedPool);
          setMessage({
            type: 'success',
            text: `Staking contract configured. Add VITE_STAKING_CONTRACT_ADDRESS="${deployedAddress}" to .env and restart the app.`,
          });
          return;
        }
      }

      throw new Error('Configure transaction was submitted, but wallet configuration was not confirmed yet.');
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: getStakingErrorMessage(error, 'Staking wallet configuration failed.') });
      }
    } finally {
      setAction(null);
    }
  };

  const statCards: Array<[string, string, string, LucideIcon]> = [
    [
  'Plan ROI',
  planRoiLabel,
  'Duration-specific yearly ROI',
  Gauge,
],
    ['Total staked', `${formatTokenAmount(pool?.totalStaked || 0n)} GRAMX`, 'Across all active positions', Coins],
    ['Reward reserve', `${formatTokenAmount(pool?.rewardReserve || 0n)} GRAMX`, 'Pre-funded rewards available', Banknote],
    ['Stake positions', `${String(pool?.totalStakePositions || 0n)}`, 'Total positions created', Lock],
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-sky-400/15 bg-gradient-to-br from-sky-500/[0.16] via-cyan-400/[0.07] to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="gp-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
              <ShieldCheck className="h-3.5 w-3.5" /> GRAMX staking
            </div>
            <h1 className="gp-gradient-text gp-display-font mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
  Stake GRAMX. Earn Rewards.
</h1>

<p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
  Stake GRAMX through flexible or locked positions to earn rewards and increase your IDO participation allocations.
</p>
          </div>

          <button
            type="button"
            onClick={loadStaking}
            disabled={loading || !isConfigured}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-300 transition hover:text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh staking data
          </button>
        </div>
      </section>

      {message && (
        <div className={`mt-6 flex items-start gap-2 rounded-2xl border p-4 text-xs ${message.type === 'success' ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300' : 'border-rose-400/20 bg-rose-400/[0.07] text-rose-300'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}
          <span className="break-words">{message.text}</span>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(([label, value, detail, Icon]) => (
          <div key={String(label)} className="gp-panel rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
              <Icon className="h-4 w-4 text-sky-400" />
            </div>
            <strong className="mt-3 block text-2xl font-black text-white">{value}</strong>
            <span className="mt-2 block text-xs text-slate-500">{detail}</span>
          </div>
        ))}
      </div>

      {!isConfigured && (
        <section className={`${cardClass} mt-6`}>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.08] p-3 text-sky-400">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Deploy GRAMX staking contract</h2>
              <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-400">
                Connect the owner wallet, deploy this contract, then add the generated address to `VITE_STAKING_CONTRACT_ADDRESS`.
              </p>
            </div>
          </div>

          <form onSubmit={deployContract} className="mt-6 grid gap-5 lg:grid-cols-4">
            <label className="lg:col-span-2">
              <span className={labelClass}>GRAMX Jetton master address</span>
              <input className={inputClass} required value={deployGramxMaster} onChange={event => setDeployGramxMaster(event.target.value)} placeholder="EQ..." />
            </label>

            <label>
              <span className={labelClass}>FLEX early unstake fee (%)</span>
              <input className={inputClass} type="number" min="0" max="50" step="0.01" required value={deployFlexFee} onChange={event => setDeployFlexFee(event.target.value)} />
            </label>

            <label>
              <span className={labelClass}>Minimum stake (GRAMX)</span>
              <input className={inputClass} required value={deployMinStake} onChange={event => setDeployMinStake(event.target.value)} />
            </label>

            <div className="rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-4 lg:col-span-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className={labelClass}>Duration ROI plans</span>
                  <p className="text-xs leading-5 text-slate-500">
                    Set yearly ROI for each staking duration before deployment. FLEX and LOCKED both use the selected duration ROI.
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">Stored on-chain</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[...STAKING_DURATIONS]
                  .sort((a, b) => Number(a.seconds - b.seconds))
                  .map(duration => {
                    const days = String(durationDaysFromSeconds(duration.seconds));
                    return (
                      <label key={duration.seconds.toString()}>
                        <span className={labelClass}>{duration.label} ROI (%)</span>
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          max="1000"
                          step="0.01"
                          required
                          value={deployPlanRois[days] || '0'}
                          onChange={event => setDeployPlanRois(current => ({
                            ...current,
                            [days]: event.target.value,
                          }))}
                        />
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-end lg:col-span-4">
              {wallet.connected ? (
                <button type="submit" disabled={action === 'deploy'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400 disabled:opacity-60">
                  {action === 'deploy' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  Deploy staking contract
                </button>
              ) : (
                <button type="button" onClick={onOpenConnect} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white">
                  <Wallet className="h-4 w-4" /> Connect owner wallet
                </button>
              )}
            </div>
          </form>

          <label className="mt-5 block">
            <span className={labelClass}>Already deployed staking contract address</span>
            <input
              className={inputClass}
              value={deployedAddress}
              onChange={event => setDeployedAddress(event.target.value.trim())}
              placeholder="Paste deployed staking contract address to configure it"
            />
          </label>

          {deployedAddress && (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-xs text-emerald-300">
              <div>
                New staking contract: <span className="font-mono">{deployedAddress}</span>
              </div>
              <button
                type="button"
                onClick={configureDeployedStakingWallet}
                disabled={action === 'configure-deployed-wallet'}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
              >
                {action === 'configure-deployed-wallet' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Configure staking Jetton wallet
              </button>
            </div>
          )}
        </section>
      )}

      {isConfigured && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className={cardClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Your staking dashboard</h2>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Contract: <span className="font-mono text-slate-400">{shortAddress(contractAddress)}</span>
                </p>
              </div>

              {!wallet.connected && (
                <button type="button" onClick={onOpenConnect} className="rounded-xl bg-[#0098EA] px-4 py-2.5 text-xs font-bold btn-white-text">
                  Connect wallet
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ['Wallet GRAMX', `${formatTokenAmount(gramxBalance)} GRAMX`],
                ['Total active staked', `${formatTokenAmount(userStake?.stake || 0n)} GRAMX`],
                ['Total pending rewards', `${formatTokenAmount(userStake?.pendingReward || 0n)} GRAMX`],
                ['Total positions', String(userStake?.totalStakePositions || 0n)],
                ['Active positions', String(userStake?.activeStakePositions || 0n)],
                ['Status', hasActiveStake ? 'Active staking' : 'No active stake'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
                  <strong className="mt-2 block text-lg font-black text-white">{value}</strong>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Staking plans</h3>
                  <p className="mt-1 text-[11px] text-slate-500">Yearly ROI</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-500">On-chain plans</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-5">
                {[...STAKING_DURATIONS]
                  .sort((a, b) => Number(a.seconds - b.seconds))
                  .map(duration => (
                    <div key={duration.seconds.toString()} className="rounded-xl border border-white/[0.07] bg-black/10 p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{duration.label}</span>
                      <strong className="mt-2 block text-lg font-black text-sky-500">
                        {Number(stakingPlanRoiForDuration(pool?.plans, duration.seconds)) / 100}%
                      </strong>
                    </div>
                  ))}
              </div>
            </div>

            <form onSubmit={stakeGramx} className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr_0.8fr_auto]">
              <label>
                <span className={labelClass}>Stake GRAMX</span>
                <input className={inputClass} required value={stakeAmount} onChange={event => setStakeAmount(event.target.value)} placeholder={`Minimum ${formatTokenAmount(pool?.minStake || 0n)} GRAMX`} />
              </label>

              <label>
                <span className={labelClass}>Mode</span>
                <select className={inputClass} value={stakeKind} onChange={event => setStakeKind(event.target.value as StakeKind)}>
                  <option value="locked">LOCKED</option>
                  <option value="flex">FLEX</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>Duration</span>
                <select className={inputClass} value={stakeDuration.toString()} onChange={event => setStakeDuration(BigInt(event.target.value))}>
                {[...STAKING_DURATIONS]
                .sort((a, b) => Number(b.seconds - a.seconds))
                .map(duration => (
                <option key={duration.seconds.toString()} value={duration.seconds.toString()}>
                {duration.label} · {Number(stakingPlanRoiForDuration(pool?.plans, duration.seconds)) / 100}% yearly ROI
                </option>
                ))}
                </select>
              </label>

              <button
                type="submit"
                data-action="create-stake"
                disabled={action === 'stake' || !wallet.connected || pool?.paused}
                className="flex items-center justify-center gap-2 self-end rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold btn-white-text transition hover:bg-sky-400 disabled:opacity-50"
              >
                {action === 'stake' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Create new stake
              </button>
            </form>

          <div className="mt-8">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h3 className="text-lg font-bold text-white">Your stake positions</h3>

    <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
      <button
        type="button"
        onClick={() => setStakeView('active')}
        className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
          stakeView === 'active'
            ? 'bg-[#0098EA] btn-white-text'
            : 'text-slate-400 hover:btn-white-text'
        }`}
      >
        Active ({activeStakes.length})
      </button>

      <button
        type="button"
        onClick={() => setStakeView('closed')}
        className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
          stakeView === 'closed'
            ? 'bg-[#0098EA] btn-white-text'
            : 'text-slate-400 hover:btn-white-text'
        }`}
      >
        Closed ({closedStakes.length})
      </button>
    </div>
  </div>

  {visibleStakes.length === 0 ? (
    <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 text-sm text-slate-400">
      {stakeView === 'active'
        ? 'No active stake position. Create a new FLEX or LOCKED stake above.'
        : 'No closed stake position yet.'}
    </div>
  ) : (
    <div className="mt-4 space-y-4">
      {visibleStakes.map((stake) => {
        const kind = stakeKindFromChain(stake.stakeKind);
        const maturityAt = Number(stake.maturityAt || 0n);
        const matured = maturityAt <= Math.floor(Date.now() / 1000);
        const locked = stake.active && kind === 'locked' && !matured;
        const flexEarly = stake.active && kind === 'flex' && !matured;
        const roi = Number(stake.roiBasisPoints || 0n) / 100;

        return (
          <div key={stake.stakeId.toString()} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-300">
                    Stake #{stake.stakeId.toString()}
                  </span>

                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    stake.active
                      ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300'
                      : 'border-slate-400/20 bg-slate-400/[0.06] text-slate-400'
                  }`}>
                    {stake.active ? 'Active' : 'Closed'}
                  </span>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
                    {kind}
                  </span>
                </div>

                <strong className="mt-3 block text-2xl font-black text-white">
                  {formatTokenAmount(stake.amount)} GRAMX
                </strong>

                <p className="mt-2 text-xs text-slate-500">
                  ROI {roi}% · {durationLabel(stake.duration)} · Started {dateFromSeconds(stake.startedAt)}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Pending reward
                </span>
                <strong className="mt-1 block text-lg font-black text-emerald-300">
                  {formatTokenAmount(stake.pendingReward)} GRAMX
                </strong>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
              <div>
                Maturity:{' '}
                <span className={locked ? 'text-amber-300' : 'text-emerald-300'}>
                  {dateFromSeconds(stake.maturityAt)}
                </span>
              </div>
              <div>
                Claimed:{' '}
                <span className="text-slate-300">
                  {formatTokenAmount(stake.claimedRewards)} GRAMX
                </span>
              </div>
              <div>
                Owner:{' '}
                <span className="font-mono text-slate-300">
                  {shortAddress(stake.owner)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => unstakeGramx(stake)}
                disabled={action === `unstake-${stake.stakeId}` || !wallet.connected || !stake.active || locked}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-bold text-slate-300 transition hover:text-white disabled:opacity-50"
              >
                {action === `unstake-${stake.stakeId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {flexEarly
                  ? `Unstake FLEX (${Number(pool?.flexUnstakeFeeBasisPoints || 0n) / 100}% fee)`
                  : locked
                    ? 'Locked until maturity'
                    : 'Unstake position'}
              </button>

              <button
                type="button"
                onClick={() => claimRewards(stake.stakeId)}
                disabled={action === `claim-${stake.stakeId}` || !wallet.connected || !stake.active || stake.pendingReward <= 0n || locked}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/[0.12] disabled:opacity-50"
              >
                {action === `claim-${stake.stakeId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
                Claim rewards
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>
          </section>

          <section className={cardClass}>
            <h2 className="text-xl font-bold text-white">Pool transparency</h2>

            <div className="mt-5 space-y-3 text-xs">
              {[
                ['Owner', pool?.owner],
                ['GRAMX master', pool?.gramxMaster],
                ['Staking Jetton wallet', pool?.gramxWallet],
                ['Reward paid', `${formatTokenAmount(pool?.totalRewardsPaid || 0n)} GRAMX`],
                ['FLEX fees collected', `${formatTokenAmount(pool?.totalFeesCollected || 0n)} GRAMX`],
                ['Active stakers', String(pool?.activeStakerCount || 0n)],
                ['Total stake positions', String(pool?.totalStakePositions || 0n)],
                ['Status', pool?.paused ? 'Paused' : 'Active'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3">
                  <span className="font-bold uppercase tracking-[0.1em] text-slate-500">{label}</span>
                  <span className="break-all text-right font-mono text-slate-300">{value}</span>
                </div>
              ))}
            </div>

            {isOwner && (
              <div className="mt-6 space-y-5 rounded-2xl border border-sky-400/15 bg-sky-400/[0.045] p-4">
                <h3 className="text-sm font-bold text-white">Owner controls</h3>

                {!pool?.walletConfigured && (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.07] p-3">
                    <p className="text-[11px] leading-5 text-amber-200">
                      The staking contract GRAMX Jetton wallet is not configured. Staking and
                      GRAMX transfers will not work until this setup transaction succeeds.
                    </p>
                    <button
                      type="button"
                      onClick={configureStakingJettonWallet}
                      disabled={action === 'configure-wallet'}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50"
                    >
                      {action === 'configure-wallet' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wallet className="h-4 w-4" />
                      )}
                      Configure staking Jetton wallet
                    </button>
                  </div>
                )}

                <form onSubmit={topUpRewards} className="grid gap-3">
                  <label>
                    <span className={labelClass}>Reward top-up (GRAMX)</span>
                    <input className={inputClass} value={rewardTopUpAmount} onChange={event => setRewardTopUpAmount(event.target.value)} placeholder="50000" />
                  </label>

                  <button
                    type="submit"
                    data-action="fund-rewards"
                    disabled={action === 'topup'}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-4 py-2.5 text-xs font-bold btn-white-text disabled:opacity-50"
                  >
                    {action === 'topup' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                    Fund reward reserve
                  </button>
                </form>

                <form onSubmit={updateRoi} className="grid gap-3">
                  <label>
                    <span className={labelClass}>Staking duration plan</span>
                    <select
                      className={inputClass}
                      value={roiDurationDays}
                      onChange={event => setRoiDurationDays(event.target.value)}
                    >
                      {[...STAKING_DURATIONS]
                        .sort((a, b) => Number(a.seconds - b.seconds))
                        .map(duration => {
                          const days = durationDaysFromSeconds(duration.seconds);
                          return (
                            <option key={duration.seconds.toString()} value={String(days)}>
                              {duration.label} ({days} days)
                            </option>
                          );
                        })}
                    </select>
                  </label>

                  <label>
                    <span className={labelClass}>Annual ROI for selected duration (%)</span>
                    <input className={inputClass} type="number" min="0" max="1000" step="0.01" value={roiPercent} onChange={event => setRoiPercent(event.target.value)} />
                  </label>

                  <button type="submit" disabled={action === 'roi'} className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 disabled:opacity-50">
                    {action === 'roi' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
                    Update duration ROI
                  </button>
                </form>

                <div className="border-t border-white/[0.08] pt-5">
                  <h4 className="text-xs font-bold text-white">Recover contract assets</h4>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    Owner-only emergency recovery. TON, GRAMX, and any Jetton wallet owned by this staking contract can be withdrawn without staking-status restrictions.
                  </p>
                </div>

                <form onSubmit={withdrawOwnerTon} className="grid gap-3">
                  <label>
                    <span className={labelClass}>Withdraw TON to owner wallet</span>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      value={withdrawTonAmount}
                      onChange={event => setWithdrawTonAmount(event.target.value)}
                      placeholder="1"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={action === 'withdraw-ton'}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 disabled:opacity-50"
                  >
                    {action === 'withdraw-ton' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                    Withdraw TON
                  </button>
                </form>

                <form onSubmit={withdrawOwnerGramx} className="grid gap-3">
                  <label>
                    <span className={labelClass}>
                      Withdraw GRAMX amount
                    </span>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      step="0.000000001"
                      required
                      value={withdrawGramxAmount}
                      onChange={event => setWithdrawGramxAmount(event.target.value)}
                      placeholder="100"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={action === 'withdraw-gramx'}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 disabled:opacity-50"
                  >
                    {action === 'withdraw-gramx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                    Withdraw GRAMX
                  </button>
                </form>

                <form onSubmit={withdrawOwnerAnyJetton} className="grid gap-3 rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] p-4">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">Withdraw any Jetton wallet</h4>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      Enter the Jetton wallet address owned by this staking contract and the exact token amount in base units.
                    </p>
                  </div>

                  <label>
                    <span className={labelClass}>Jetton wallet address</span>
                    <input
                      className={inputClass}
                      required
                      value={withdrawAnyJettonWallet}
                      onChange={event => setWithdrawAnyJettonWallet(event.target.value)}
                      placeholder="EQ..."
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Token amount base units</span>
                    <input
                      className={inputClass}
                      required
                      value={withdrawAnyJettonAmount}
                      onChange={event => setWithdrawAnyJettonAmount(event.target.value)}
                      placeholder="1000000"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={action === 'withdraw-any-jetton'}
                    className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-2.5 text-xs font-bold text-rose-200 disabled:opacity-50"
                  >
                    {action === 'withdraw-any-jetton' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                    Withdraw Any Token
                  </button>
                </form>

                <form
                  onSubmit={async event => {
                    event.preventDefault();
                    setAction('fee');
                    setMessage(null);

                    try {
                      requireWallet();

                      const bps = BigInt(Math.round(Number(flexFeePercent) * 100));

                      await tonConnectUI.sendTransaction({
                        validUntil: Math.floor(Date.now() / 1000) + 600,
                        network: stakingNetwork,
                        messages: [
                          {
                            address: contractAddress,
                            amount: toNano('0.05').toString(),
                            payload: buildSetFlexUnstakeFeePayload(bps),
                          },
                        ],
                      });

                      await afterTransaction('FLEX early unstake fee update sent.');
                    } catch (error: any) {
                      if (error.message !== 'Connect wallet first.') {
                        setMessage({ type: 'error', text: error.message || 'Fee update failed.' });
                      }
                    } finally {
                      setAction(null);
                    }
                  }}
                  className="grid gap-3"
                >
                  <label>
                    <span className={labelClass}>FLEX early unstake fee (%)</span>
                    <input className={inputClass} type="number" min="0" max="50" step="0.01" value={flexFeePercent} onChange={event => setFlexFeePercent(event.target.value)} />
                  </label>

                  <button type="submit" disabled={action === 'fee'} className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 disabled:opacity-50">
                    {action === 'fee' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Update FLEX fee
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
