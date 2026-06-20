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
  buildOwnerWithdrawGramxPayload,
  buildOwnerWithdrawTonPayload,
  buildRewardTopUpPayload,
  buildSetGramxJettonWalletPayload,
  buildSetAnnualRoiPayload,
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
  GRAMX_DECIMALS,
  GRAMX_MASTER_ADDRESS,
  parseGRAMXAmount,
  prepareStakingDeployment,
  STAKING_CONTRACT_ADDRESS,
  STAKING_DEFAULT_APR_BPS,
  STAKING_DEFAULT_FLEX_FEE_BPS,
  STAKING_DEFAULT_MIN_GRAMX,
  STAKING_DURATIONS,
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
  const [roiPercent, setRoiPercent] = useState('0');
  const [flexFeePercent, setFlexFeePercent] = useState(String(STAKING_DEFAULT_FLEX_FEE_BPS / 100));
  const [stakeKind, setStakeKind] = useState<StakeKind>('flex');
  const [stakeDuration, setStakeDuration] = useState<bigint>(STAKING_DURATIONS[1].seconds);

  const [deployGramxMaster, setDeployGramxMaster] = useState(GRAMX_MASTER_ADDRESS);
  const [deployRoi, setDeployRoi] = useState('0');
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


const annualRoiPercent = pool
  ? Number(pool.annualRoiBasisPoints) / 100
  : 0;

  const activeStakes = userStake?.activeStakes || [];
  const allStakes = userStake?.stakes || [];
  const closedStakes = allStakes.filter(stake => !stake.active);
  const visibleStakes = stakeView === 'active' ? activeStakes : closedStakes;
  const hasActiveStake = activeStakes.length > 0;

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
            amount: toNano('0.32').toString(),
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
            payload: buildSetAnnualRoiPayload(bps),
          },
        ],
      });

      await afterTransaction('Annual ROI update sent. New stakes will use the updated ROI.');
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
      requireWallet();
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
          amount: toNano('0.12').toString(),
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
      const withdrawableGramx =
        (pool?.totalFeesCollected || 0n) + (pool?.rewardReserve || 0n);
      if (amount > withdrawableGramx) {
        throw new Error('Amount exceeds the reward reserve plus collected FLEX fees.');
      }

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

  const deployContract = async (event: FormEvent) => {
    event.preventDefault();
    setAction('deploy');
    setMessage(null);
    setDeployedAddress('');

    try {
      const owner = requireWallet();

      const deployment = await prepareStakingDeployment({
        owner,
        gramxMaster: deployGramxMaster,
        annualRoiPercent: Number(deployRoi),
        minStake: deployMinStake,
        flexUnstakeFeePercent: Number(deployFlexFee),
      });
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: stakingNetwork,
        messages: [
          deployment.deploymentMessage,
          deployment.setupMessages[0],
        ],
      });

      setMessage({
        type: 'success',
        text: 'Deploy and Jetton wallet setup submitted. Waiting for on-chain confirmation...',
      });

      const address = deployment.contract.address.toString();

      for (let attempt = 0; attempt < 15; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const deployedPool = await getStakingPoolDetails(address);
          if (deployedPool.walletConfigured) {
            setDeployedAddress(address);
            setMessage({
              type: 'success',
              text: `Staking contract deployed and configured. Add VITE_STAKING_CONTRACT_ADDRESS="${address}" to .env and restart the app.`,
            });
            return;
          }
        } catch {
          // The account may not be active yet while the deployment is finalizing.
        }
      }

      throw new Error(
        `Contract deployment was submitted at ${address}, but Jetton wallet configuration was not confirmed.`
      );
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Deployment failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  const statCards: Array<[string, string, string, LucideIcon]> = [
    [
  'Annual ROI',
  annualRoiPercent === null ? 'Loading...' : `${annualRoiPercent.toLocaleString()}%`,
  'Fetched from smart contract',
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
              <span className={labelClass}>Annual ROI (%)</span>
              <input className={inputClass} type="number" min="0" max="1000" step="0.01" required value={deployRoi} onChange={event => setDeployRoi(event.target.value)} />
            </label>

            <label>
              <span className={labelClass}>FLEX early unstake fee (%)</span>
              <input className={inputClass} type="number" min="0" max="50" step="0.01" required value={deployFlexFee} onChange={event => setDeployFlexFee(event.target.value)} />
            </label>

            <label className="lg:col-span-2">
              <span className={labelClass}>Minimum stake (GRAMX)</span>
              <input className={inputClass} required value={deployMinStake} onChange={event => setDeployMinStake(event.target.value)} />
            </label>

            <div className="flex items-end lg:col-span-2">
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

          {deployedAddress && (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-xs text-emerald-300">
              New staking contract: <span className="font-mono">{deployedAddress}</span>
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

            <form onSubmit={stakeGramx} className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr_0.8fr_auto]">
              <label>
                <span className={labelClass}>Stake GRAMX</span>
                <input className={inputClass} required value={stakeAmount} onChange={event => setStakeAmount(event.target.value)} placeholder={`Minimum ${formatTokenAmount(pool?.minStake || 0n)} GRAMX`} />
              </label>

              <label>
                <span className={labelClass}>Mode</span>
                <select className={inputClass} value={stakeKind} onChange={event => setStakeKind(event.target.value as StakeKind)}>
                  <option value="flex">FLEX</option>
                  <option value="locked">LOCKED</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>Duration</span>
                <select className={inputClass} value={stakeDuration.toString()} onChange={event => setStakeDuration(BigInt(event.target.value))}>
                  {STAKING_DURATIONS.map(duration => (
                    <option key={duration.seconds.toString()} value={duration.seconds.toString()}>
                      {duration.label}
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
                    <span className={labelClass}>Annual ROI (%)</span>
                    <input className={inputClass} type="number" min="0" max="1000" step="0.01" value={roiPercent} onChange={event => setRoiPercent(event.target.value)} />
                  </label>

                  <button type="submit" disabled={action === 'roi'} className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 disabled:opacity-50">
                    {action === 'roi' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
                    Update on-chain ROI
                  </button>
                </form>

                <div className="border-t border-white/[0.08] pt-5">
                  <h4 className="text-xs font-bold text-white">Recover contract assets</h4>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    Owner-only recovery. TON can be withdrawn without a retained reserve.
                    GRAMX withdrawal uses collected FLEX fees first, then reward reserve.
                    Active stake principal cannot be withdrawn.
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
                      Withdraw GRAMX reserve + fees (available{' '}
                      {formatTokenAmount(
                        (pool?.rewardReserve || 0n) + (pool?.totalFeesCollected || 0n)
                      )})
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
                    disabled={
                      action === 'withdraw-gramx' ||
                      (pool?.rewardReserve || 0n) + (pool?.totalFeesCollected || 0n) <= 0n
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 disabled:opacity-50"
                  >
                    {action === 'withdraw-gramx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                    Withdraw GRAMX
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
