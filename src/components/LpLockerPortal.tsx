import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { CHAIN } from '@tonconnect/protocol';
import { Address, toNano } from '@ton/core';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Unlock,
  Wallet,
} from 'lucide-react';
import { WalletState, LockerLockRecord } from '../types.js';
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

const normalizeAddress = (addr: string): string => {
  if (!addr) return '';
  try {
    return Address.parse(addr.trim()).toString();
  } catch {
    return addr.trim();
  }
};

const getTokenInfoFromRegistry = (registry: LockerTokenRegistry, addressStr: string) => {
  if (!addressStr) return undefined;
  const raw = addressStr.trim();
  const norm = normalizeAddress(raw);

  const keys = [raw, norm].filter(Boolean);
  for (const k of keys) {
    if (registry[k] && registry[k].symbol && registry[k].symbol !== 'TOKEN' && registry[k].symbol !== 'Token') {
      return registry[k];
    }
  }

  const foundKey = Object.keys(registry).find(k => {
    const matches = k.toLowerCase() === raw.toLowerCase() || k.toLowerCase() === norm.toLowerCase();
    return matches && registry[k]?.symbol && registry[k].symbol !== 'TOKEN' && registry[k].symbol !== 'Token';
  });
  if (foundKey) return registry[foundKey];

  return registry[raw] || registry[norm] || undefined;
};

const resolveLockSymbol = (lock: any, registry: LockerTokenRegistry, fallbackSymbol: string = 'TOKEN'): string => {
  if (lock.symbol && lock.symbol !== 'TOKEN' && lock.symbol !== 'Token') {
    return lock.symbol.toUpperCase();
  }

  const regWallet = getTokenInfoFromRegistry(registry, lock.jettonWallet);
  if (regWallet?.symbol && regWallet.symbol !== 'TOKEN' && regWallet.symbol !== 'Token') {
    return regWallet.symbol.toUpperCase();
  }

  if (lock.jettonMaster) {
    const regMaster = getTokenInfoFromRegistry(registry, lock.jettonMaster);
    if (regMaster?.symbol && regMaster.symbol !== 'TOKEN' && regMaster.symbol !== 'Token') {
      return regMaster.symbol.toUpperCase();
    }
  }

  const gramxMaster = String((import.meta as any).env.VITE_GRAMX_MASTER || '').trim();
  if (gramxMaster) {
    try {
      if (
        (lock.jettonMaster && Address.parse(lock.jettonMaster).equals(Address.parse(gramxMaster))) ||
        (lock.jettonWallet && Address.parse(lock.jettonWallet).equals(Address.parse(gramxMaster)))
      ) {
        return 'GRAMX';
      }
    } catch {}
  }

  if (fallbackSymbol && fallbackSymbol !== 'TOKEN' && fallbackSymbol !== 'Token') {
    return fallbackSymbol.toUpperCase();
  }

  return 'TOKEN';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [lockView, setLockView] = useState<'active' | 'closed' | 'all'>('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tokenRegistry, setTokenRegistry] = useState<LockerTokenRegistry>(loadLockerTokenRegistry);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const [allLocksList, setAllLocksList] = useState<LockerLockRecord[]>([]);
  const [allLockView, setAllLockView] = useState<'active' | 'closed' | 'all'>('all');
  const [allLocksSearch, setAllLocksSearch] = useState('');
  const [allLocksPage, setAllLocksPage] = useState(1);

  const handleCopyAddress = (addr: string) => {
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

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
    const wKey = jettonWalletAddress.trim();
    const wNorm = normalizeAddress(jettonWalletAddress);
    const mKey = masterAddress.trim();
    const mNorm = normalizeAddress(masterAddress);
    const sym = (symbol || 'TOKEN').toUpperCase();

    setTokenRegistry(current => {
      const next = { ...current };
      const entry = { masterAddress: mKey || mNorm, symbol: sym, decimals };

      if (wKey) next[wKey] = entry;
      if (wNorm) next[wNorm] = entry;
      if (mKey) next[mKey] = entry;
      if (mNorm) next[mNorm] = entry;

      window.localStorage.setItem(lockerTokenRegistryKey, JSON.stringify(next));
      return next;
    });
  };

  const loadLocker = async () => {
    if (!isConfigured) return;

    setLoading(true);
    setMessage(null);

    try {
      try {
        const details = await getLockerDetails(lockerAddress);
        setLocker(details);
      } catch {
        // Safe fallback if contract overview call is slow
      }

      // Fetch ALL platform locks once
      const res = await fetch('/api/locker/locks');
      if (res.ok) {
        const json = await res.json();
        const globalLocks: LockerLockRecord[] = json.locks || [];
        setAllLocksList(globalLocks);

        // Update token registry from all locks
        globalLocks.forEach(g => {
          if (g.symbol && g.jettonWallet) {
            rememberTokenForWallet(
              g.jettonWallet,
              g.jettonMaster || g.jettonWallet,
              g.symbol,
              g.decimals ?? DEFAULT_JETTON_DECIMALS
            );
          }
        });

        // Filter user-specific locks in memory
        if (wallet.connected && wallet.address) {
          const userAddrStr = wallet.address;
          const userLocksList = globalLocks.filter(d => {
            if (!d.owner || !userAddrStr) return false;
            try {
              return Address.parse(d.owner).equals(Address.parse(userAddrStr));
            } catch {
              return d.owner.toLowerCase() === userAddrStr.toLowerCase();
            }
          });

          const formattedLocks = userLocksList.map(d => ({
            lockId: d.id,
            owner: d.owner,
            jettonWallet: d.jettonWallet,
            jettonMaster: d.jettonMaster,
            amount: parseLockerTokenAmount(d.amount, d.decimals ?? DEFAULT_JETTON_DECIMALS),
            formattedAmount: d.amount,
            lockedAt: BigInt(Math.floor((d.createdAt || Date.now()) / 1000)),
            unlockTime: BigInt(d.unlockTime),
            withdrawn: d.withdrawn,
            active: !d.withdrawn,
            symbol: d.symbol || 'TOKEN',
            decimals: d.decimals ?? DEFAULT_JETTON_DECIMALS,
          }));

          setUserLocks({
            user: userAddrStr,
            activeLocks: BigInt(formattedLocks.filter(l => !l.withdrawn).length),
            totalLocks: BigInt(formattedLocks.length),
            lockIds: formattedLocks.map((_, idx) => BigInt(idx + 1)),
            locks: formattedLocks as any,
            activeLockItems: formattedLocks.filter(l => !l.withdrawn) as any,
            closedLockItems: formattedLocks.filter(l => l.withdrawn) as any,
          });

          if (jettonMaster) {
            try {
              const balance = await getUserJettonBalance(userAddrStr, jettonMaster);
              setJettonBalance(balance);
            } catch {}
          }
        } else {
          setUserLocks(null);
          setJettonBalance(0n);
        }
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to load locker data from database.',
      });
    } finally {
      setLoading(false);
    }
  };

  const syncNetworkWithDb = async (userAddress: string) => {
    try {
      const data = await getUserLockerDetails(userAddress, lockerAddress);
      if (data.locks && data.locks.length > 0) {
        for (const lock of data.locks) {
          let symbol = 'TOKEN';
          let decimals = DEFAULT_JETTON_DECIMALS;
          let masterAddress = lock.jettonWallet;

          const registryInfo = getTokenInfoFromRegistry(tokenRegistry, lock.jettonWallet);
          if (registryInfo?.symbol) {
            symbol = registryInfo.symbol;
            decimals = registryInfo.decimals;
            masterAddress = registryInfo.masterAddress || lock.jettonWallet;
          } else {
            try {
              const meta = await getJettonMetadata(lock.jettonWallet);
              if (meta?.symbol) {
                symbol = meta.symbol;
                decimals = meta.decimals ?? DEFAULT_JETTON_DECIMALS;
                masterAddress = (meta as any).masterAddress || lock.jettonWallet;
                rememberTokenForWallet(lock.jettonWallet, masterAddress, symbol, decimals);
              }
            } catch {}
          }

          const formattedAmt = formatLockerTokenAmount(lock.amount, decimals);

          await fetch('/api/locker/locks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: lock.lockId.toString(),
              owner: lock.owner,
              jettonWallet: lock.jettonWallet,
              jettonMaster: masterAddress,
              symbol,
              decimals,
              amount: formattedAmt,
              rawAmount: lock.amount.toString(),
              unlockTime: Number(lock.unlockTime),
              withdrawn: lock.withdrawn,
            }),
          }).catch(() => {});

          // 1 second delay between each coin during network sync to prevent rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      console.error('Network sync with DB error:', err);
    }
  };

  const handleRefreshLocks = async () => {
    if (loading || isSyncing) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/locker/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: wallet.address || '' }),
      });

      const json = await res.json();
      if (json.inProgress) {
        setMessage({
          type: 'success',
          text: json.message || 'Lock sync is already running in the background.',
        });
        setLoading(false);
        return;
      }

      setIsSyncing(true);
      setMessage({
        type: 'success',
        text: 'Syncing on-chain locks in server background...',
      });

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/locker/sync/status');
          if (statusRes.ok) {
            const statusJson = await statusRes.json();
            if (!statusJson.inProgress) {
              clearInterval(pollInterval);
              setIsSyncing(false);
              setLoading(false);
              await loadLocker();
              setMessage({
                type: 'success',
                text: 'Locks successfully synced from blockchain.',
              });
            }
          }
        } catch {
          clearInterval(pollInterval);
          setIsSyncing(false);
          setLoading(false);
        }
      }, 2000);
    } catch (error: any) {
      setIsSyncing(false);
      setLoading(false);
      setMessage({
        type: 'error',
        text: error.message || 'Refresh failed.',
      });
    }
  };

  const metadataProcessingSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadLocker();
  }, [wallet.connected, wallet.address, lockerAddress]);

  useEffect(() => {
    const list = [...(userLocks?.locks || []), ...allLocksList];
    if (list.length === 0) return;

    let isSubscribed = true;

    const processQueue = async () => {
      for (const lock of list) {
        if (!isSubscribed) break;

        const target = lock.jettonWallet || (lock as any).jettonMaster;
        if (!target) continue;

        const currentSym = resolveLockSymbol(lock, tokenRegistry, '');
        if (currentSym !== 'TOKEN') continue;

        if (metadataProcessingSet.current.has(target)) continue;
        metadataProcessingSet.current.add(target);

        try {
          const meta = await getJettonMetadata(target);
          if (!isSubscribed) break;

          if (meta?.symbol && meta.symbol !== 'TOKEN') {
            const sym = meta.symbol.toUpperCase();
            const master = (meta as any).masterAddress || (lock as any).jettonMaster || lock.jettonWallet;

            rememberTokenForWallet(
              lock.jettonWallet,
              master,
              sym,
              meta.decimals ?? DEFAULT_JETTON_DECIMALS
            );

            const lockIdStr = String((lock as any).id || (lock as any).lockId || '');
            if (lockIdStr) {
              await fetch('/api/locker/locks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: lockIdStr,
                  owner: lock.owner,
                  jettonWallet: lock.jettonWallet,
                  jettonMaster: master,
                  symbol: sym,
                  decimals: meta.decimals ?? DEFAULT_JETTON_DECIMALS,
                  amount: (lock as any).formattedAmount || (lock as any).amount || '0',
                  unlockTime: Number(lock.unlockTime),
                  withdrawn: lock.withdrawn,
                }),
              }).catch(() => {});
            }
          }
        } catch (err) {
          console.warn(`Background metadata fetch for ${target} failed:`, err);
        }

        // Wait 1 second (1000ms) delay between each coin request to prevent rate limiting / 429 errors!
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    processQueue();

    return () => {
      isSubscribed = false;
    };
  }, [userLocks, allLocksList]);

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

      // Persist lock record to Database
      try {
        await fetch('/api/locker/locks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: String(userLocks?.totalLocks ? userLocks.totalLocks + 1n : Date.now()),
            owner: user,
            jettonWallet: userJettonWallet.toString(),
            jettonMaster,
            symbol: tokenSymbol || 'TOKEN',
            decimals,
            amount: amount.trim(),
            rawAmount: parsedAmount.toString(),
            unlockTime: Number(unlockTime),
          }),
        });
      } catch (err) {
        console.error('Failed to save lock record to DB:', err);
      }

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

      try {
        await fetch(`/api/locker/locks/${lockId}/withdraw`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to update DB lock withdrawn status:', err);
      }

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
      const tokenInfo = getTokenInfoFromRegistry(tokenRegistry, lock.jettonWallet);
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

  useEffect(() => {
    setAllLocksPage(1);
  }, [allLockView, allLocksSearch]);

  const baseAllLocks = useMemo(() => {
    let list = [...allLocksList];
    if (allLockView === 'active') list = list.filter(l => !l.withdrawn);
    else if (allLockView === 'closed') list = list.filter(l => l.withdrawn);
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  }, [allLocksList, allLockView]);

  const filteredAllLocks = useMemo(() => {
    const q = allLocksSearch.trim().toLowerCase();
    if (!q) return baseAllLocks;

    return baseAllLocks.filter(l => {
      const values = [
        l.id,
        l.owner,
        l.jettonWallet,
        l.jettonMaster,
        l.symbol,
        l.amount,
      ];
      return values.some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [baseAllLocks, allLocksSearch]);

  const totalAllLocksPages = Math.max(1, Math.ceil(filteredAllLocks.length / pageSize));
  const pagedAllLocks = filteredAllLocks.slice(
    (allLocksPage - 1) * pageSize,
    allLocksPage * pageSize
  );

  const overallTotalLocks = allLocksList.length || Number(locker?.totalLockedPositions || 0n);
  const overallActiveLocks = allLocksList.filter(l => !l.withdrawn).length || Number(locker?.activeLockPositions || 0n);
  const overallClosedLocks = allLocksList.filter(l => l.withdrawn).length || Number(locker?.totalWithdrawnPositions || 0n);

  const activeLocks = userLocks?.activeLockItems || [];
  const closedLocks = userLocks?.closedLockItems || [];

  const decimalsForDisplay = Number(tokenDecimals || DEFAULT_JETTON_DECIMALS);

  const stats = [
    ['Active locks', String(overallActiveLocks), 'Platform active lock positions', Lock],
    ['Total locks', String(overallTotalLocks), 'All platform lock positions', Coins],
    ['Closed locks', String(overallClosedLocks), 'Platform withdrawn positions', Unlock],
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
            onClick={handleRefreshLocks}
            disabled={loading || isSyncing || !isConfigured}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-300 transition hover:text-white disabled:opacity-50"
          >
            {isSyncing || loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isSyncing ? 'Syncing locks...' : loading ? 'Loading...' : 'Refresh locks'}
          </button>
        </div>
      </section>

      {message && (
        <div className={`mt-6 flex items-start gap-2 rounded-2xl border p-4 text-xs ${message.type === 'success' ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-600' : 'border-rose-400/20 bg-rose-400/[0.07] text-rose-300'}`}>
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
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
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
            <section className={`${cardClass} mt-8`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-sky-400" />
                  <h2 className="text-xl font-bold text-white">All Locked Tokens</h2>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Global list of all Jetton & LP token locks across the platform.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
                {[
                  ['all', `All (${allLocksList.length})`],
                  ['active', `Active (${allLocksList.filter(l => !l.withdrawn).length})`],
                  ['closed', `Closed (${allLocksList.filter(l => l.withdrawn).length})`],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAllLockView(id as 'active' | 'closed' | 'all')}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                      allLockView === id
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
                  value={allLocksSearch}
                  onChange={event => setAllLocksSearch(event.target.value)}
                  placeholder="Search ID, owner, wallet, master, symbol..."
                />
              </label>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.06]">
              <div className="hidden grid-cols-[1.2fr_1.8fr_1fr_1.3fr_0.8fr_1.4fr] gap-3 border-b border-white/[0.06] bg-white/[0.025] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                <span>Amount</span>
                <span>Jetton wallet</span>
                <span>Locked At</span>
                <span>Unlock time</span>
                <span>Status</span>
                <span className="text-right">Owner</span>
              </div>

              {pagedAllLocks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No platform locks found matching your search.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {pagedAllLocks.map(lock => {
                    const matured = Number(lock.unlockTime) <= Math.floor(Date.now() / 1000);
                    const tokenInfo = getTokenInfoFromRegistry(tokenRegistry, lock.jettonWallet);
                    const rowDecimals = lock.decimals ?? tokenInfo?.decimals ?? decimalsForDisplay;
                    const rowSymbol = resolveLockSymbol(lock, tokenRegistry, tokenSymbol);
                    const displayAmount = lock.amount || formatLockerTokenAmount(lock.rawAmount || '0', rowDecimals);

                    const walletExplorerUrl = `https://${lockerNetwork === CHAIN.TESTNET ? 'testnet.' : ''}tonviewer.com/${lock.jettonWallet}`;
                    const ownerExplorerUrl = `https://${lockerNetwork === CHAIN.TESTNET ? 'testnet.' : ''}tonviewer.com/${lock.owner}`;
                    const masterAddr = lock.jettonMaster || tokenInfo?.masterAddress;
                    const masterExplorerUrl = masterAddr
                      ? `https://${lockerNetwork === CHAIN.TESTNET ? 'testnet.' : ''}tonviewer.com/${masterAddr}`
                      : '';

                    return (
                      <div
                        key={lock.id}
                        className="grid gap-3 px-4 py-4 text-xs lg:grid-cols-[1.2fr_1.8fr_1fr_1.3fr_0.8fr_1.4fr] lg:items-center"
                      >
                        <div>
                          <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                            Amount
                          </span>
                          <p className="font-extrabold text-white text-sm">
                            {displayAmount}{' '}
                            <span className="text-sky-400 font-mono font-black">{rowSymbol}</span>
                          </p>
                        </div>

                        <div>
                          <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                            Jetton wallet
                          </span>
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="font-mono text-slate-200 font-bold text-xs tracking-tight">
                              {shortAddress(lock.jettonWallet)}
                            </span>
                            <a
                              href={walletExplorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="View Jetton Wallet on Tonviewer"
                              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-sky-400 transition hover:border-sky-400 hover:bg-sky-400/20"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyAddress(lock.jettonWallet)}
                              title="Copy Address"
                              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-400 transition hover:border-sky-400 hover:text-white"
                            >
                              {copiedAddress === lock.jettonWallet ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          {masterAddr && (
                            <div className="mt-1 flex items-center gap-1 whitespace-nowrap text-[10px] text-slate-400">
                              <span className="font-mono">
                                Master: {shortAddress(masterAddr)}
                              </span>
                              {masterExplorerUrl && (
                                <a
                                  href={masterExplorerUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sky-400 hover:text-sky-300 transition"
                                  title="View Jetton Master on Tonviewer"
                                >
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                            Created at
                          </span>
                          <p className="text-slate-300">
                            {lock.createdAt ? new Date(lock.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </p>
                        </div>

                        <div>
                          <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                            Unlock time
                          </span>
                          <p className={matured ? 'text-emerald-600' : 'text-amber-600'}>
                            {dateFromSeconds(lock.unlockTime)}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                              lock.withdrawn
                                ? 'border-slate-400/20 bg-slate-400/[0.06] text-slate-400'
                                : matured
                                  ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-600'
                                  : 'border-amber-400/20 bg-amber-400/[0.08] text-amber-600'
                            }`}
                          >
                            {lock.withdrawn ? 'Closed' : matured ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>

                        <div className="flex items-center justify-start lg:justify-end gap-1.5 whitespace-nowrap">
                          <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                            Owner:
                          </span>
                          <span className="font-mono text-slate-300 font-semibold">
                            {shortAddress(lock.owner)}
                          </span>
                          <a
                            href={ownerExplorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="View Owner on Tonviewer"
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-sky-400 transition hover:border-sky-400 hover:bg-sky-400/20"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyAddress(lock.owner)}
                            title="Copy Owner Address"
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-400 transition hover:border-sky-400 hover:text-white"
                          >
                            {copiedAddress === lock.owner ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
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
                Showing {pagedAllLocks.length} of {filteredAllLocks.length} locks
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={allLocksPage <= 1}
                  onClick={() => setAllLocksPage(current => Math.max(1, current - 1))}
                  className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40"
                >
                  Prev
                </button>

                <span className="text-xs font-bold text-slate-400">
                  Page {allLocksPage} / {totalAllLocksPages}
                </span>

                <button
                  type="button"
                  disabled={allLocksPage >= totalAllLocksPages}
                  onClick={() => setAllLocksPage(current => Math.min(totalAllLocksPages, current + 1))}
                  className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

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

                <div>
                  {wallet.connected ? (
                    <button
                      disabled={action === 'lock' || locker?.paused || metadataLoading}
                      className="btn-white-text flex w-full items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400 disabled:opacity-50"
                    >
                      {action === 'lock' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Lock token
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenConnect}
                      className="btn-white-text flex w-full items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
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

                <div className="flex justify-between gap-4 pt-3">
                  <span>Status</span>
                  <span className={locker?.paused ? 'text-rose-300' : 'text-emerald-600'}>
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
                <div className="hidden grid-cols-[1.2fr_2fr_1.3fr_1fr_1fr] gap-3 border-b border-white/[0.06] bg-white/[0.025] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:grid">
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
                      const tokenInfo = getTokenInfoFromRegistry(tokenRegistry, lock.jettonWallet);
                      const rowDecimals = (lock as any).decimals ?? tokenInfo?.decimals ?? decimalsForDisplay;
                      const rowSymbol = resolveLockSymbol(lock, tokenRegistry, tokenSymbol);
                      const displayAmount = (lock as any).formattedAmount || formatLockerTokenAmount(lock.amount, rowDecimals);

                      const walletExplorerUrl = `https://${lockerNetwork === CHAIN.TESTNET ? 'testnet.' : ''}tonviewer.com/${lock.jettonWallet}`;
                      const masterAddr = (lock as any).jettonMaster || tokenInfo?.masterAddress;
                      const masterExplorerUrl = masterAddr
                        ? `https://${lockerNetwork === CHAIN.TESTNET ? 'testnet.' : ''}tonviewer.com/${masterAddr}`
                        : '';

                      return (
                        <div
                          key={lock.lockId.toString()}
                          className="grid gap-3 px-4 py-4 text-xs lg:grid-cols-[1.2fr_2fr_1.3fr_1fr_1fr] lg:items-center"
                        >
                          <div>
                            <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                              Amount
                            </span>
                            <p className="font-extrabold text-white text-sm">
                              {displayAmount}{' '}
                              <span className="text-sky-400 font-mono font-black">{rowSymbol}</span>
                            </p>
                          </div>

                          <div>
                            <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                              Jetton wallet
                            </span>
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="font-mono text-slate-200 font-bold text-xs tracking-tight">
                                {shortAddress(lock.jettonWallet)}
                              </span>
                              <a
                                href={walletExplorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="View Jetton Wallet on Tonviewer"
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-sky-400 transition hover:border-sky-400 hover:bg-sky-400/20"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopyAddress(lock.jettonWallet)}
                                title="Copy Address"
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-400 transition hover:border-sky-400 hover:text-white"
                              >
                                {copiedAddress === lock.jettonWallet ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            {masterAddr && (
                              <div className="mt-1 flex items-center gap-1 whitespace-nowrap text-[10px] text-slate-400">
                                <span className="font-mono">
                                  Master: {shortAddress(masterAddr)}
                                </span>
                                {masterExplorerUrl && (
                                  <a
                                    href={masterExplorerUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sky-400 hover:text-sky-300 transition"
                                    title="View Jetton Master on Tonviewer"
                                  >
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="lg:hidden text-[10px] font-bold uppercase text-slate-500">
                              Unlock time
                            </span>
                            <p className={matured ? 'text-emerald-600' : 'text-amber-600'}>
                              {dateFromSeconds(lock.unlockTime)}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                                lock.withdrawn
                                  ? 'border-slate-400/20 bg-slate-400/[0.06] text-slate-400'
                                  : matured
                                    ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-600'
                                    : 'border-amber-400/20 bg-amber-400/[0.08] text-amber-600'
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
