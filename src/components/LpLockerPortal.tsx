import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { CHAIN } from '@tonconnect/protocol';
import { Address, toNano } from '@ton/core';
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Unlock,
  Wallet,
} from 'lucide-react';
import { WalletState } from '../types.js';
import {
  buildConfigureLockPayload,
  buildEmergencyWithdrawLockerTonPayload,
  buildLockJettonPayload,
  buildWithdrawLockPayload,
  DEFAULT_JETTON_DECIMALS,
  formatLockerTokenAmount,
  getJettonMetadata,
  getLockerDetails,
  getUserJettonBalance,
  getUserJettonWalletAddress,
  getUserLockerDetails,
  parseLockerTokenAmount,
  UNIVERSAL_LOCKER_ADDRESS,
} from '../ton/universalLocker.js';

interface LpLockerPortalProps {
  wallet: WalletState;
  onOpenConnect: () => void;
}

type LockerDetails = Awaited<ReturnType<typeof getLockerDetails>>;
type UserLockerDetails = Awaited<ReturnType<typeof getUserLockerDetails>>;
type LockRow = UserLockerDetails['locks'][number];
type LockerTokenRegistry = Record<string, {
  masterAddress: string;
  symbol: string;
  decimals: number;
}>;

const cardClass = 'gp-panel rounded-3xl p-5 sm:p-7';
const lockerTokenRegistryKey = 'grampad_locker_token_registry';

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 transition focus:border-sky-400/45 focus:outline-none';

const labelClass =
  'mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400';
const lockerNetwork = String((import.meta as any).env.VITE_TONCENTER_ENDPOINT || '')
  .includes('testnet')
  ? CHAIN.TESTNET
  : CHAIN.MAINNET;

const shortAddress = (value: string) =>
  value ? `${value.slice(0, 6)}...${value.slice(-6)}` : '-';

const loadLockerTokenRegistry = (): LockerTokenRegistry => {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(lockerTokenRegistryKey) || '{}');
  } catch {
    return {};
  }
};

const dateFromSeconds = (value: bigint | number | string) => {
  const seconds = Number(value);
  if (!seconds) return '-';
  return new Date(seconds * 1000).toLocaleString();
};

const toUnixFromDateTimeLocal = (value: string) => {
  const ms = new Date(value).getTime();
  if (!Number.isFinite(ms)) return 0n;
  return BigInt(Math.floor(ms / 1000));
};

export default function LpLockerPortal({
  wallet,
  onOpenConnect,
}: LpLockerPortalProps) {
  const [tonConnectUI] = useTonConnectUI();

  const [locker, setLocker] = useState<LockerDetails | null>(null);
  const [userLocks, setUserLocks] = useState<UserLockerDetails | null>(null);
  const [jettonBalance, setJettonBalance] = useState<bigint>(0n);

  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [lockView, setLockView] = useState<'active' | 'closed' | 'all'>('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tokenRegistry, setTokenRegistry] = useState<LockerTokenRegistry>(loadLockerTokenRegistry);

  const [jettonMaster, setJettonMaster] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('TOKEN');
  const [tokenDecimals, setTokenDecimals] = useState(String(DEFAULT_JETTON_DECIMALS));
  const [amount, setAmount] = useState('');
  const [unlockAt, setUnlockAt] = useState('');
  const [emergencyTonAmount, setEmergencyTonAmount] = useState('');

  const lockerAddress = UNIVERSAL_LOCKER_ADDRESS;
  const isConfigured = Boolean(lockerAddress);
  const pageSize = 8;
  const isOwner = useMemo(() => {
    if (!locker?.owner || !wallet.address) return false;
    try {
      return Address.parse(locker.owner).equals(Address.parse(wallet.address));
    } catch {
      return false;
    }
  }, [locker?.owner, wallet.address]);

  const requireWallet = () => {
    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      throw new Error('Connect wallet first.');
    }

    return wallet.address;
  };

  const rememberTokenForWallet = (
    jettonWalletAddress: string,
    masterAddress: string,
    symbol: string,
    decimals: number
  ) => {
    const key = jettonWalletAddress.trim();
    if (!key) return;

    setTokenRegistry(current => {
      const next = {
        ...current,
        [key]: {
          masterAddress: masterAddress.trim(),
          symbol: (symbol || 'TOKEN').toUpperCase(),
          decimals,
        },
      };

      window.localStorage.setItem(lockerTokenRegistryKey, JSON.stringify(next));
      return next;
    });
  };

  const loadLocker = async () => {
    if (!isConfigured) return;

    setLoading(true);
    setMessage(null);

    try {
      const details = await getLockerDetails(lockerAddress);
      setLocker(details);

      if (wallet.connected && wallet.address) {
        const data = await getUserLockerDetails(wallet.address, lockerAddress);
        setUserLocks(data);

        if (jettonMaster) {
          const balance = await getUserJettonBalance(wallet.address, jettonMaster);
          setJettonBalance(balance);
        }
      } else {
        setUserLocks(null);
        setJettonBalance(0n);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to load locker data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocker();
  }, [wallet.connected, wallet.address, lockerAddress]);

  useEffect(() => {
    setPage(1);
  }, [lockView, search]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const master = jettonMaster.trim();
      if (!master || master.length < 20) {
        setTokenSymbol('TOKEN');
        setTokenDecimals(String(DEFAULT_JETTON_DECIMALS));
        setJettonBalance(0n);
        return;
      }

      setMetadataLoading(true);
      setMessage(null);

      try {
        const metadata = await getJettonMetadata(master);

        setTokenSymbol((metadata.symbol || 'TOKEN').toUpperCase());
        setTokenDecimals(String(metadata.decimals ?? DEFAULT_JETTON_DECIMALS));

        if (wallet.connected && wallet.address) {
          const jettonWalletAddress = await getUserJettonWalletAddress(wallet.address, master);
          rememberTokenForWallet(
            jettonWalletAddress.toString(),
            master,
            metadata.symbol || 'TOKEN',
            metadata.decimals ?? DEFAULT_JETTON_DECIMALS
          );
          const balance = await getUserJettonBalance(wallet.address, master);
          setJettonBalance(balance);
        }
      } catch (error: any) {
        setTokenSymbol('TOKEN');
        setTokenDecimals(String(DEFAULT_JETTON_DECIMALS));
        setJettonBalance(0n);

        setMessage({
          type: 'error',
          text: error.message || 'Failed to fetch Jetton metadata.',
        });
      } finally {
        setMetadataLoading(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [jettonMaster, wallet.connected, wallet.address]);

  const refreshJettonBalance = async () => {
    try {
      const user = requireWallet();

      if (!jettonMaster) {
        throw new Error('Enter Jetton/LP master address first.');
      }

      const balance = await getUserJettonBalance(user, jettonMaster);
      setJettonBalance(balance);
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to load token balance.',
        });
      }
    }
  };

  const afterTransaction = async (text: string) => {
    setMessage({ type: 'success', text });

    setTimeout(() => {
      loadLocker();
    }, 4000);
  };

  const lockToken = async (event: FormEvent) => {
    event.preventDefault();

    setAction('lock');
    setMessage(null);

    try {
      const user = requireWallet();

      if (!jettonMaster) throw new Error('Enter Jetton/LP master address.');
      if (!unlockAt) throw new Error('Choose unlock date and time.');

      const decimals = Number(tokenDecimals || DEFAULT_JETTON_DECIMALS);
      const unlockTime = toUnixFromDateTimeLocal(unlockAt);

      if (unlockTime <= BigInt(Math.floor(Date.now() / 1000))) {
        throw new Error('Unlock time must be in the future.');
      }

      const parsedAmount = parseLockerTokenAmount(amount, decimals);
      const userJettonWallet = await getUserJettonWalletAddress(user, jettonMaster);
      rememberTokenForWallet(userJettonWallet.toString(), jettonMaster, tokenSymbol, decimals);

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: lockerNetwork,
        messages: [
          {
            address: lockerAddress,
            amount: toNano('0.03').toString(),
            payload: buildConfigureLockPayload(unlockTime),
          },
          {
            address: userJettonWallet.toString(),
            amount: toNano('0.18').toString(),
            payload: buildLockJettonPayload(parsedAmount, lockerAddress, user),
          },
        ],
      });

      setAmount('');
      await afterTransaction(`${tokenSymbol || 'Token'} lock transaction sent.`);
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({
          type: 'error',
          text: error.message || 'Lock failed.',
        });
      }
    } finally {
      setAction(null);
    }
  };

  const withdrawLock = async (lock: LockRow) => {
    const lockId = lock.lockId;

    setAction(`withdraw-${lockId}`);
    setMessage(null);

    try {
      requireWallet();

      const now = Math.floor(Date.now() / 1000);
      if (Number(lock.unlockTime) > now) {
        throw new Error('This lock is not mature yet.');
      }

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: lockerNetwork,
        messages: [
          {
            address: lockerAddress,
            amount: toNano('0.18').toString(),
            payload: buildWithdrawLockPayload(lockId),
          },
        ],
      });

      await afterTransaction(`Withdraw sent for lock #${lockId}.`);
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({
          type: 'error',
          text: error.message || 'Withdraw failed.',
        });
      }
    } finally {
      setAction(null);
    }
  };

  const emergencyWithdrawTon = async (event: FormEvent) => {
    event.preventDefault();
    setAction('emergency-ton');
    setMessage(null);

    try {
      const owner = requireWallet();
      if (!isOwner) throw new Error('Only the Universal Locker owner can withdraw TON.');

      const withdrawalAmount = toNano(emergencyTonAmount);
      if (withdrawalAmount <= 0n) throw new Error('Enter a valid TON amount.');

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: lockerNetwork,
        messages: [{
          address: lockerAddress,
          amount: toNano('0.05').toString(),
          payload: buildEmergencyWithdrawLockerTonPayload(withdrawalAmount, owner),
        }],
      });

      setEmergencyTonAmount('');
      await afterTransaction('Emergency TON withdrawal sent to the owner wallet.');
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({
          type: 'error',
          text: error.message || 'Emergency TON withdrawal failed.',
        });
      }
    } finally {
      setAction(null);
    }
  };

  const baseLocks = useMemo(() => {
    const locks = userLocks?.locks || [];

    if (lockView === 'active') return locks.filter(lock => !lock.withdrawn);
    if (lockView === 'closed') return locks.filter(lock => lock.withdrawn);

    return locks;
  }, [userLocks, lockView]);

  const filteredLocks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseLocks;

    return baseLocks.filter(lock => {
      const tokenInfo = tokenRegistry[lock.jettonWallet];
      const values = [
        lock.lockId.toString(),
        lock.owner,
        lock.jettonWallet,
        tokenInfo?.masterAddress,
        tokenInfo?.symbol,
        lock.amount.toString(),
      ];

      return values.some(value => String(value || '').toLowerCase().includes(q));
    });
  }, [baseLocks, search, tokenRegistry]);

  const totalPages = Math.max(1, Math.ceil(filteredLocks.length / pageSize));

  const pagedLocks = filteredLocks.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const activeLocks = userLocks?.activeLockItems || [];
  const closedLocks = userLocks?.closedLockItems || [];

  const decimalsForDisplay = Number(tokenDecimals || DEFAULT_JETTON_DECIMALS);

  const stats = [
    ['Active locks', String(userLocks?.activeLocks || 0n), 'Your active lock positions', Lock],
    ['Total locks', String(userLocks?.totalLocks || 0n), 'All your lock positions', Coins],
    ['Closed locks', String(closedLocks.length), 'Withdrawn lock positions', Unlock],
    [
      'Token balance',
      `${formatLockerTokenAmount(jettonBalance, decimalsForDisplay)} ${tokenSymbol || 'TOKEN'}`,
      'Selected Jetton wallet balance',
      Wallet,
    ],
  ] as const;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-sky-400/15 bg-gradient-to-br from-sky-500/[0.16] via-cyan-400/[0.07] to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="gp-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
              <ShieldCheck className="h-3.5 w-3.5" /> Universal LP locker
            </div>

            <h1 className="gp-gradient-text gp-display-font mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
              Lock any LP or Jetton securely.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Users can lock any LP Jetton or normal Jetton by choosing the token master, amount, and unlock time.
            </p>
          </div>

          <button
            onClick={loadLocker}
            disabled={loading || !isConfigured}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-300 transition hover:text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh locks
          </button>
        </div>
      </section>

      {message && (
        <div className={`mt-6 flex items-start gap-2 rounded-2xl border p-4 text-xs ${message.type === 'success' ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300' : 'border-rose-400/20 bg-rose-400/[0.07] text-rose-300'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}
          <span className="break-words">{message.text}</span>
        </div>
      )}

      {!isConfigured && (
        <section className={`${cardClass} mt-6`}>
          <h2 className="text-xl font-bold text-white">Locker contract not configured</h2>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            Add your deployed locker address to <span className="font-mono">VITE_UNIVERSAL_LOCKER_ADDRESS</span> and restart the app.
          </p>
        </section>
      )}

      {isConfigured && (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value, detail, Icon]) => (
              <div key={label} className="gp-panel rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    {label}
                  </span>
                  <Icon className="h-4 w-4 text-sky-400" />
                </div>
                <strong className="mt-3 block text-xl font-black text-white">
                  {value}
                </strong>
                <span className="mt-2 block text-xs text-slate-500">
                  {detail}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
            <section className={cardClass}>
              <h2 className="text-xl font-bold text-white">Lock new LP / Jetton</h2>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Enter the Jetton master address. Symbol, decimals, and wallet balance will be fetched automatically.
              </p>

              <form onSubmit={lockToken} className="mt-6 grid gap-4">
                <label>
                  <span className={labelClass}>Jetton / LP master address</span>
                  <input
                    className={inputClass}
                    required
                    value={jettonMaster}
                    onChange={event => setJettonMaster(event.target.value.trim())}
                    placeholder="EQ..."
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className={labelClass}>Symbol</span>
                    <input
                      className={inputClass}
                      value={metadataLoading ? 'Fetching...' : tokenSymbol}
                      readOnly
                      placeholder="Auto"
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Decimals</span>
                    <input
                      className={inputClass}
                      value={metadataLoading ? 'Fetching...' : tokenDecimals}
                      readOnly
                      placeholder="Auto"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className={labelClass}>Amount</span>
                    <input
                      className={inputClass}
                      required
                      value={amount}
                      onChange={event => setAmount(event.target.value)}
                      placeholder="100"
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Unlock date and time</span>
                    <input
                      className={inputClass}
                      required
                      type="datetime-local"
                      value={unlockAt}
                      onChange={event => setUnlockAt(event.target.value)}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={refreshJettonBalance}
                    disabled={!wallet.connected || !jettonMaster || metadataLoading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-bold text-slate-300 transition hover:text-white disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Check balance
                  </button>

                  {wallet.connected ? (
                    <button
                      disabled={action === 'lock' || locker?.paused || metadataLoading}
                      className="btn-white-text flex items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400 disabled:opacity-50"
                    >
                      {action === 'lock' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Lock token
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenConnect}
                      className="btn-white-text flex items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
                    >
                      <Wallet className="h-4 w-4" />
                      Connect wallet
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-xs text-slate-400">
                <div className="flex justify-between gap-4 border-b border-white/[0.06] pb-3">
                  <span>Locker contract</span>
                  <span className="break-all text-right font-mono text-slate-300">
                    {shortAddress(lockerAddress)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-white/[0.06] py-3">
                  <span>Selected token balance</span>
                  <span className="text-right font-bold text-slate-300">
                    {formatLockerTokenAmount(jettonBalance, decimalsForDisplay)} {tokenSymbol}
                  </span>
                </div>

                <div className="flex justify-between gap-4 pt-3">
                  <span>Status</span>
                  <span className={locker?.paused ? 'text-rose-300' : 'text-emerald-300'}>
                    {locker?.paused ? 'Paused' : 'Active'}
                  </span>
                </div>
              </div>

              {isOwner && (
                <form
                  onSubmit={emergencyWithdrawTon}
                  className="mt-6 grid gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-amber-200">
                      Emergency TON recovery
                    </h3>
                    <p className="mt-2 text-[11px] leading-5 text-slate-400">
                      Owner only. This withdraws TON held by the locker contract and does
                      not move or unlock any user Jettons.
                    </p>
                  </div>

                  <label>
                    <span className={labelClass}>TON amount</span>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      value={emergencyTonAmount}
                      onChange={event => setEmergencyTonAmount(event.target.value)}
                      placeholder="0.1"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={action === 'emergency-ton'}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
                  >
                    {action === 'emergency-ton' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                    Withdraw stuck TON
                  </button>
                </form>
              )}
            </section>

            <section className={cardClass}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Your locked tokens</h2>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Row-wise view of your lock positions with search and pagination.
                  </p>
                </div>

                {!wallet.connected && (
                  <button
                    onClick={onOpenConnect}
                    className="btn-white-text rounded-xl bg-[#0098EA] px-4 py-2.5 text-xs font-bold text-white"
                  >
                    Connect wallet
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
                  {[
                    ['active', `Active (${activeLocks.length})`],
                    ['closed', `Closed (${closedLocks.length})`],
                    ['all', `All (${userLocks?.locks.length || 0})`],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLockView(id as 'active' | 'closed' | 'all')}
                      className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                        lockView === id
                          ? 'btn-white-text bg-[#0098EA] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <label className="relative min-w-full lg:min-w-[280px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    className={`${inputClass} pl-10`}
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search ID, wallet, master, symbol..."
                  />
                </label>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.06]">
                <div className="hidden grid-cols-[0.7fr_1fr_1.2fr_1.2fr_1fr_1fr] gap-3 border-b border-white/[0.06] bg-white/[0.025] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                  <span>ID</span>
                  <span>Amount</span>
                  <span>Jetton wallet</span>
                  <span>Unlock time</span>
                  <span>Status</span>
                  <span className="text-right">Action</span>
                </div>

                {pagedLocks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    {wallet.connected
                      ? 'No lock positions found.'
                      : 'Connect wallet to view your locks.'}
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {pagedLocks.map(lock => {
                      const matured = Number(lock.unlockTime) <= Math.floor(Date.now() / 1000);
                      const canWithdraw = !lock.withdrawn && matured;
                      const tokenInfo = tokenRegistry[lock.jettonWallet];
                      const rowDecimals = tokenInfo?.decimals ?? decimalsForDisplay;
                      const rowSymbol = tokenInfo?.symbol || tokenSymbol || 'TOKEN';

                      return (
                        <div
                          key={lock.lockId.toString()}
                          className="grid gap-3 px-4 py-4 text-xs lg:grid-cols-[0.7fr_1fr_1.2fr_1.2fr_1fr_1fr] lg:items-center"
                        >
                          <div>
                            <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                              ID
                            </span>
                            <p className="font-mono font-bold text-white">
                              #{lock.lockId.toString()}
                            </p>
                          </div>

                          <div>
                            <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                              Amount
                            </span>
                            <p className="font-bold text-white">
                              {formatLockerTokenAmount(lock.amount, rowDecimals)} {rowSymbol}
                            </p>
                          </div>

                          <div>
                            <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                              Jetton wallet
                            </span>
                            <p className="break-all font-mono text-slate-300">
                              {shortAddress(lock.jettonWallet)}
                            </p>
                            {tokenInfo?.masterAddress && (
                              <p className="mt-1 break-all font-mono text-[10px] text-sky-300">
                                {tokenInfo.symbol} master: {shortAddress(tokenInfo.masterAddress)}
                              </p>
                            )}
                          </div>

                          <div>
                            <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                              Unlock time
                            </span>
                            <p className={matured ? 'text-emerald-300' : 'text-amber-300'}>
                              {dateFromSeconds(lock.unlockTime)}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                                lock.withdrawn
                                  ? 'border-slate-400/20 bg-slate-400/[0.06] text-slate-400'
                                  : matured
                                    ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300'
                                    : 'border-amber-400/20 bg-amber-400/[0.08] text-amber-300'
                              }`}
                            >
                              {lock.withdrawn ? 'Closed' : matured ? 'Unlocked' : 'Locked'}
                            </span>
                          </div>

                          <div className="flex justify-start lg:justify-end">
                            <button
                              onClick={() => withdrawLock(lock)}
                              disabled={!canWithdraw || action === `withdraw-${lock.lockId}` || !wallet.connected}
                              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-[10px] font-bold text-slate-300 transition hover:text-white disabled:opacity-50"
                            >
                              {action === `withdraw-${lock.lockId}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5" />
                              )}
                              Withdraw
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing {pagedLocks.length} of {filteredLocks.length} locks
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(current => Math.max(1, current - 1))}
                    className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <span className="text-xs font-bold text-slate-400">
                    Page {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(current => Math.min(totalPages, current + 1))}
                    className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
