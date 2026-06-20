import { FormEvent, useEffect, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import {
  Address,
  beginCell,
  StateInit,
  storeStateInit,
  toNano,
} from '@ton/core';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Plus,
  Rocket,
  Save,
  ShieldCheck,
  Shuffle,
  UploadIcon,
  Wallet,
  X,
} from 'lucide-react';
import { AIAudit, AdminSession, LaunchpadProject, ProjectApplication, SwapSettings, WalletState } from '../types.js';
import TokenLauncher from './TokenLauncher.js';
import { cellToBase64 } from '../ton/gramStarter.js';
import {
  GramPadUniversalLocker,
  storeDeploy,
} from '../../contracts/build/GramPadUniversalLocker_GramPadUniversalLocker.js';
import {
  buildConfigureSwapJettonWalletsPayload,
  buildFundSwapTonPayload,
  buildSetSwapMaxBuyPayload,
  buildSetSwapRatePayload,
  buildSwapReserveTopUpPayload,
  buildSetSwapPausedPayload,
  buildSwapDeployment,
  buildSwapOwnerWithdrawGramPayload,
  buildSwapOwnerWithdrawTonPayload,
  buildSwapOwnerWithdrawUsdtPayload,
  getUserJettonWalletAddress,
  maxBuyRawFromLabel,
  parseSwapAmount,
  deriveSwapWallets,
  rateScaledFromLabel,
  SWAP_DEPLOY_TON,
  SWAP_FUND_TON,
  waitForSwapDeployment,
} from '../ton/simpleSwap.js';

interface AdminPortalProps {
  session: AdminSession;
  onSessionChange: (session: AdminSession) => void;
  wallet: WalletState;
  onOpenConnect: () => void;
  onProjectChanged: () => void;
  onDeploySuccess: (project: LaunchpadProject) => void;
}

type AdminView = 'overview' | 'projects' | 'applications' | 'create' | 'swap' | 'lplocker';
type ApplicationStatus = NonNullable<ProjectApplication['status']>;

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#080E1A]/75 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-400/45 focus:outline-none';

const labelClass =
  'mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400';

const applicationStatusLabels: Record<ApplicationStatus, string> = {
  in_review: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const applicationStatusClasses: Record<ApplicationStatus, string> = {
  in_review: 'border-amber-400/20 bg-amber-400/[0.08] text-amber-300',
  approved: 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300',
  rejected: 'border-rose-400/20 bg-rose-400/[0.08] text-rose-300',
};

export default function AdminPortal({
  session,
  onSessionChange,
  wallet,
  onOpenConnect,
  onProjectChanged,
  onDeploySuccess,
}: AdminPortalProps) {
  const [tonConnectUI] = useTonConnectUI();

  const [view, setView] = useState<AdminView>('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [projects, setProjects] = useState<LaunchpadProject[]>([]);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState('');

  const [editing, setEditing] = useState<LaunchpadProject | null>(null);
  const [saving, setSaving] = useState(false);

  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ApplicationStatus>>({});
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [applicationFilter, setApplicationFilter] = useState<'all' | ApplicationStatus>('all');
  const [swapSettings, setSwapSettings] = useState<SwapSettings>({
    contractAddress: '',
    ownerAddress: '',
    gramMasterAddress: String((import.meta as any).env.VITE_GRAMX_MASTER || '').trim(),
    gramSymbol: 'GRAM',
    gramDecimals: Number((import.meta as any).env.VITE_GRAMX_DECIMALS || 9),
    usdtMasterAddress: String((import.meta as any).env.VITE_TON_USDT_MASTER || '').trim(),
    usdtSymbol: 'USDT',
    usdtDecimals: Number((import.meta as any).env.VITE_TON_USDT_DECIMALS || 6),
    rateScaled: '1000000000',
    rateScale: 1_000_000_000,
    rateLabel: '1',
    maxBuyRaw: '0',
    maxBuyLabel: '0',
    deploymentId: '',
    gramWalletAddress: '',
    usdtWalletAddress: '',
    paused: false,
    updatedAt: 0,
  });
  const [swapSaving, setSwapSaving] = useState(false);
  const [swapWithdrawDrafts, setSwapWithdrawDrafts] = useState({
    topupGramAmount: '',
    tonAmount: '',
    gramAmount: '',
    usdtAmount: '',
    destination: '',
  });
  const UNIVERSAL_LOCKER_ADDRESS =
  (import.meta as any).env.VITE_UNIVERSAL_LOCKER_ADDRESS || '';

  const adminFetch = async (url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);

    if (session.csrfToken && init?.method && init.method !== 'GET') {
      headers.set('X-CSRF-Token', session.csrfToken);
    }

    const response = await fetch(url, { ...init, headers });
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) onSessionChange({ authenticated: false });
      throw new Error(data.error || 'Admin request failed.');
    }

    return data;
  };

  const loadAdminData = async () => {
    setLoading(true);
    setActionError('');

    try {
      const [projectData, applicationData, swapData] = await Promise.all([
        adminFetch('/api/admin/projects'),
        adminFetch('/api/admin/applications'),
        adminFetch('/api/admin/swap/settings'),
      ]);

      setProjects(Array.isArray(projectData) ? projectData : []);
      setApplications(Array.isArray(applicationData) ? applicationData : []);
      if (swapData && typeof swapData === 'object') {
        setSwapSettings(swapData);
      }
    } catch (error: any) {
      setActionError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.authenticated) loadAdminData();
  }, [session.authenticated]);

  const requireWallet = () => {
    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      throw new Error('Connect wallet first.');
    }

    return wallet.address;
  };

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Login failed.');

      setPassword('');
      onSessionChange(data);
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await adminFetch('/api/admin/logout', { method: 'POST' });
    } finally {
      onSessionChange({ authenticated: false });
      setProjects([]);
      setApplications([]);
    }
  };

  const toggleVisibility = async (project: LaunchpadProject) => {
    setActionError('');

    try {
      const data = await adminFetch(
        `/api/admin/projects/${encodeURIComponent(project.id)}/visibility`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: project.enabled === false }),
        }
      );

      setProjects(current =>
        current.map(item => (item.id === project.id ? data.project : item))
      );

      onProjectChanged();
    } catch (error: any) {
      setActionError(error.message);
    }
  };

  const saveProject = async (event: FormEvent) => {
    event.preventDefault();

    if (!editing) return;

    setSaving(true);
    setActionError('');

    const editableFields = [
      'name',
      'description',
      'logo',
      'banner',
      'website',
      'telegram',
      'twitter',
      'discord',
      'github',
      'kycStatus',
      'auditStatus',
      'promoted',
      'listingStatus',
      'cliffDurationDays',
      'aiAudit',
    ] as const;

    const payload = editableFields.reduce<Record<string, unknown>>((next, field) => {
      const value = editing[field];
      if (value !== undefined) next[field] = value;
      return next;
    }, {});

    try {
      const updated = await adminFetch(
        `/api/admin/projects/${encodeURIComponent(editing.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      setProjects(current =>
        current.map(item => (item.id === updated.id ? updated : item))
      );

      setEditing(null);
      onProjectChanged();
    } catch (error: any) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateApplicationStatus = async (application: ProjectApplication) => {
    const status = statusDrafts[application.id] || application.status || 'in_review';

    setUpdatingApplicationId(application.id);
    setActionError('');

    try {
      const data = await adminFetch(
        `/api/admin/applications/${encodeURIComponent(application.id)}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );

      setApplications(current =>
        current.map(item => (item.id === application.id ? data.application : item))
      );

      setStatusDrafts(current => {
        const next = { ...current };
        delete next[application.id];
        return next;
      });
    } catch (error: any) {
      setActionError(error.message);
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const prepareUniversalLockerDeployment = async (ownerAddress: string) => {
    const owner = Address.parse(ownerAddress);
    const deploymentId = BigInt(Date.now());

    const contract = await GramPadUniversalLocker.fromInit(
    owner,
    deploymentId
    );

    if (!contract.init) {
      throw new Error('Failed to construct universal locker state.');
    }

    const stateInit: StateInit = contract.init;
    const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();

    const deployPayload = beginCell()
      .store(storeDeploy({ $$type: 'Deploy', queryId: deploymentId }))
      .endCell();

    return {
      contract,
      deploymentId,
      deploymentMessage: {
        address: contract.address.toString(),
        amount: toNano('0.25').toString(),
        stateInit: cellToBase64(stateInitCell),
        payload: cellToBase64(deployPayload),
      },
    };
  };

  const deployLpLockerContract = async (event: FormEvent) => {
    event.preventDefault();

    setAction('deploy-lplocker');
    setMessage(null);
    setActionError('');
    setDeployedAddress('');

    try {
      const owner = requireWallet();
      const deployment = await prepareUniversalLockerDeployment(owner);

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [deployment.deploymentMessage],
      });

      const address = deployment.contract.address.toString();

      setDeployedAddress(address);
      setMessage({
        type: 'success',
        text: `Universal LP/token locker deployed. Add VITE_UNIVERSAL_LOCKER_ADDRESS="${address}" to .env and restart the app.`,
      });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({
          type: 'error',
          text: error.message || 'LP locker deployment failed.',
        });
      }
    } finally {
      setAction(null);
    }
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage({ type: 'success', text: 'Copied to clipboard.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to copy.' });
    }
  };

  const saveSwapSettingsDraft = async (next: SwapSettings) => {
    setSwapSaving(true);
    setActionError('');
    try {
      const saved = await adminFetch('/api/admin/swap/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      setSwapSettings(saved);
      setMessage({ type: 'success', text: 'Swap settings saved.' });
      return saved as SwapSettings;
    } catch (error: any) {
      setActionError(error.message);
      throw error;
    } finally {
      setSwapSaving(false);
    }
  };

  const deploySwapContract = async () => {
    setAction('deploy-swap');
    setActionError('');
    setMessage(null);

    try {
      const ownerAddress = requireWallet();
      const rateScaled = rateScaledFromLabel(swapSettings.rateLabel);
      const maxBuyRaw = maxBuyRawFromLabel(swapSettings.maxBuyLabel || '0', Number(swapSettings.usdtDecimals));
      const deployment = await buildSwapDeployment({
        ownerAddress,
        gramMasterAddress: swapSettings.gramMasterAddress,
        gramDecimals: Number(swapSettings.gramDecimals),
        usdtMasterAddress: swapSettings.usdtMasterAddress,
        usdtDecimals: Number(swapSettings.usdtDecimals),
        rateScaled,
        maxBuyRaw,
      });

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [deployment.deploymentMessage],
      });

      await waitForSwapDeployment(
        deployment.contract,
        60_000
      );

      const nextSettings: SwapSettings = {
        ...swapSettings,
        ownerAddress,
        contractAddress: deployment.contract.address.toString(),
        deploymentId: deployment.deploymentId.toString(),
        rateScaled: rateScaled.toString(),
        rateScale: 1_000_000_000,
        maxBuyRaw: maxBuyRaw.toString(),
        paused: false,
      };

      await saveSwapSettingsDraft(nextSettings);
      setMessage({
        type: 'success',
        text: `Swap contract deployed and confirmed at ${deployment.contract.address.toString()}. You can now configure Jetton wallets.`,
      });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Swap deployment failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  const configureSwapJettonWallets = async () => {
    setAction('configure-swap');
    setActionError('');
    setMessage(null);

    try {
      const ownerAddress = requireWallet();
      if (!swapSettings.contractAddress) {
        throw new Error('Deploy the swap contract first.');
      }

      if (swapSettings.ownerAddress && ownerAddress !== swapSettings.ownerAddress) {
        throw new Error('Connect the same owner wallet that deployed this swap contract.');
      }

      const { gramWalletAddress, usdtWalletAddress } = await deriveSwapWallets(
        swapSettings.contractAddress,
        swapSettings.gramMasterAddress,
        swapSettings.usdtMasterAddress
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: swapSettings.contractAddress,
            amount: toNano('0.05').toString(),
            payload: buildConfigureSwapJettonWalletsPayload(gramWalletAddress, usdtWalletAddress),
          },
        ],
      });

      const nextSettings: SwapSettings = {
        ...swapSettings,
        ownerAddress,
        gramWalletAddress: gramWalletAddress.toString(),
        usdtWalletAddress: usdtWalletAddress.toString(),
      };

      await saveSwapSettingsDraft(nextSettings);
      setMessage({ type: 'success', text: 'Swap Jetton wallets configured and saved.' });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Swap wallet configuration failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  const fundSwapTonReserve = async () => {
    setAction('fund-swap-ton');
    setActionError('');
    setMessage(null);

    try {
      requireWallet();
      if (!swapSettings.contractAddress) {
        throw new Error('Deploy the swap contract first.');
      }

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: swapSettings.contractAddress,
            amount: toNano(SWAP_FUND_TON).toString(),
            payload: buildFundSwapTonPayload(),
          },
        ],
      });

      setMessage({ type: 'success', text: 'TON reserve funding transaction sent.' });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Funding TON reserve failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  const fundSwapGramReserve = async () => {
    setAction('fund-swap-gram');
    setActionError('');
    setMessage(null);

    try {
      const owner = requireWallet();
      if (!swapSettings.contractAddress) {
        throw new Error('Deploy the swap contract first.');
      }
      if (!swapWithdrawDrafts.topupGramAmount.trim()) {
        throw new Error(`Enter ${swapSettings.gramSymbol || 'GRAM'} top-up amount.`);
      }

      const amount = parseSwapAmount(
        swapWithdrawDrafts.topupGramAmount.trim(),
        Number(swapSettings.gramDecimals)
      );
      const ownerGramWallet = await getUserJettonWalletAddress(
        owner,
        swapSettings.gramMasterAddress
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: ownerGramWallet.toString(),
            amount: toNano('0.15').toString(),
            payload: buildSwapReserveTopUpPayload(
              amount,
              swapSettings.contractAddress,
              owner
            ),
          },
        ],
      });

      setMessage({
        type: 'success',
        text: `${swapSettings.gramSymbol || 'GRAM'} reserve top-up transaction sent.`,
      });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Funding GRAM reserve failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  const toggleSwapPaused = async () => {
    setAction('toggle-swap');
    setActionError('');
    setMessage(null);

    try {
      requireWallet();
      if (!swapSettings.contractAddress) {
        throw new Error('Deploy the swap contract first.');
      }

      const nextPaused = !swapSettings.paused;
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: swapSettings.contractAddress,
            amount: toNano('0.05').toString(),
            payload: buildSetSwapPausedPayload(nextPaused),
          },
        ],
      });

      await saveSwapSettingsDraft({ ...swapSettings, paused: nextPaused });
      setMessage({ type: 'success', text: `Swap ${nextPaused ? 'paused' : 'resumed'} successfully.` });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Failed to update swap state.' });
      }
    } finally {
      setAction(null);
    }
  };

  const updateSwapRateOnChain = async () => {
    setAction('update-swap-rate');
    setActionError('');
    setMessage(null);

    try {
      const owner = requireWallet();
      if (!swapSettings.contractAddress) {
        throw new Error('Deploy the swap contract first.');
      }

      if (swapSettings.ownerAddress && owner !== swapSettings.ownerAddress) {
        throw new Error('Connect the same owner wallet that deployed this swap contract.');
      }

      const rateScaled = rateScaledFromLabel(swapSettings.rateLabel);

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: swapSettings.contractAddress,
            amount: toNano('0.05').toString(),
            payload: buildSetSwapRatePayload(rateScaled),
          },
        ],
      });

      await saveSwapSettingsDraft({
        ...swapSettings,
        ownerAddress: owner,
        rateScaled: rateScaled.toString(),
        rateScale: 1_000_000_000,
      });

      setMessage({ type: 'success', text: 'Swap rate update transaction sent and settings synced.' });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Failed to update swap rate.' });
      }
    } finally {
      setAction(null);
    }
  };

  const updateSwapMaxBuyOnChain = async () => {
    setAction('update-swap-max-buy');
    setActionError('');
    setMessage(null);

    try {
      const owner = requireWallet();
      if (!swapSettings.contractAddress) {
        throw new Error('Deploy the swap contract first.');
      }

      if (swapSettings.ownerAddress && owner !== swapSettings.ownerAddress) {
        throw new Error('Connect the same owner wallet that deployed this swap contract.');
      }

      const maxBuyRaw = maxBuyRawFromLabel(swapSettings.maxBuyLabel || '0', Number(swapSettings.usdtDecimals));

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: swapSettings.contractAddress,
            amount: toNano('0.05').toString(),
            payload: buildSetSwapMaxBuyPayload(maxBuyRaw),
          },
        ],
      });

      await saveSwapSettingsDraft({
        ...swapSettings,
        ownerAddress: owner,
        maxBuyRaw: maxBuyRaw.toString(),
      });

      setMessage({
        type: 'success',
        text: maxBuyRaw === 0n
          ? 'Max buy set to unlimited on-chain.'
          : 'Max buy update transaction sent and settings synced.',
      });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Failed to update max buy.' });
      }
    } finally {
      setAction(null);
    }
  };

  const withdrawSwapAsset = async (asset: 'ton' | 'gram' | 'usdt') => {
    setAction(`withdraw-swap-${asset}`);
    setActionError('');
    setMessage(null);

    try {
      const owner = requireWallet();
      if (!swapSettings.contractAddress) {
        throw new Error('Deploy the swap contract first.');
      }

      const destination = swapWithdrawDrafts.destination.trim() || owner;
      Address.parse(destination);

      let amount = 0n;
      let payload = '';
      let label = '';

      if (asset === 'ton') {
        if (!swapWithdrawDrafts.tonAmount.trim()) throw new Error('Enter TON amount.');
        amount = toNano(swapWithdrawDrafts.tonAmount.trim());
        payload = buildSwapOwnerWithdrawTonPayload(amount, destination);
        label = 'TON';
      } else if (asset === 'gram') {
        if (!swapWithdrawDrafts.gramAmount.trim()) throw new Error(`Enter ${swapSettings.gramSymbol || 'GRAM'} amount.`);
        amount = parseSwapAmount(swapWithdrawDrafts.gramAmount.trim(), Number(swapSettings.gramDecimals));
        payload = buildSwapOwnerWithdrawGramPayload(amount, destination);
        label = swapSettings.gramSymbol || 'GRAM';
      } else {
        if (!swapWithdrawDrafts.usdtAmount.trim()) throw new Error('Enter USDT amount.');
        amount = parseSwapAmount(swapWithdrawDrafts.usdtAmount.trim(), Number(swapSettings.usdtDecimals));
        payload = buildSwapOwnerWithdrawUsdtPayload(amount, destination);
        label = 'USDT';
      }

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: swapSettings.contractAddress,
            amount: toNano('0.15').toString(),
            payload,
          },
        ],
      });

      setMessage({ type: 'success', text: `${label} withdraw transaction sent.` });
    } catch (error: any) {
      if (error.message !== 'Connect wallet first.') {
        setMessage({ type: 'error', text: error.message || 'Withdraw failed.' });
      }
    } finally {
      setAction(null);
    }
  };

  if (!session.authenticated) {
    return (
      <div className="mx-auto flex min-h-[68vh] max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="gp-panel w-full max-w-md rounded-3xl p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/[0.08] text-sky-400">
            <LockKeyhole className="h-5 w-5" />
          </div>

          <h1 className="gp-display-font mt-5 text-2xl font-semibold text-white">
            Admin sign in
          </h1>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Secure access to project deployment, listing controls, and project applications.
          </p>

          <form onSubmit={login} className="mt-7 space-y-4">
            <label>
              <span className={labelClass}>Admin email</span>
              <input
                className={inputClass}
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
            </label>

            <label>
              <span className={labelClass}>Password</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </label>

            {loginError && (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-xs text-rose-300">
                {loginError}
              </div>
            )}

            <button
              disabled={loggingIn}
              className="btn-white-text flex w-full items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-400 disabled:opacity-60"
            >
              {loggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Sign in securely
            </button>
          </form>
        </div>
      </div>
    );
  }

  const enabledCount = projects.filter(project => project.enabled !== false).length;

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'projects' as const, label: 'Projects', icon: FileText },
    { id: 'applications' as const, label: 'Applications', icon: CheckCircle2 },
    { id: 'create' as const, label: 'Create project', icon: Plus },
    { id: 'swap' as const, label: 'Swap', icon: Shuffle },
    { id: 'lplocker' as const, label: 'LP Locker', icon: UploadIcon },
  ];
  const owner = wallet.connected && wallet.address ? wallet.address : '';

  const filteredApplications =
    applicationFilter === 'all'
      ? applications
      : applications.filter(
          app => (app.status || 'in_review') === applicationFilter
        );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="gp-chip inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
            Protected workspace
          </div>

          <h1 className="gp-display-font mt-3 text-3xl font-semibold text-white">
            Admin dashboard
          </h1>

          <p className="mt-1 text-xs text-slate-500">Signed in as {session.email}</p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 self-start rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-rose-400/20 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mb-7 flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1.5">
        {navItems.map(item => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                view === item.id
                  ? 'btn-white-text bg-[#0098EA] text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" /> {item.label}
            </button>
          );
        })}
      </div>

      {actionError && (
        <div className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-xs text-rose-300">
          {actionError}
        </div>
      )}

      {message && (
        <div
          className={`mb-5 rounded-xl border p-3 text-xs ${
            message.type === 'success'
              ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300'
              : 'border-rose-400/20 bg-rose-400/[0.07] text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {view === 'overview' && (
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            ['Total projects', projects.length, 'All deployed project records'],
            ['Visible projects', enabledCount, 'Shown on the user portal'],
            ['Applications', applications.length, 'Read-only founder submissions'],
          ].map(([label, value, detail]) => (
            <div key={String(label)} className="gp-panel rounded-2xl p-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {label}
              </span>

              <strong className="mt-3 block text-3xl font-black text-white">
                {value}
              </strong>

              <span className="mt-2 block text-xs text-slate-500">{detail}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'projects' && (
        <div className="gp-panel overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
            <div>
              <h2 className="font-bold text-white">Project management</h2>
              <p className="mt-1 text-xs text-slate-500">
                Metadata can be edited. On-chain sale terms remain immutable.
              </p>
            </div>

            {loading && <Loader2 className="h-4 w-4 animate-spin text-sky-400" />}
          </div>

          <div className="divide-y divide-white/[0.06]">
            {projects.map(project => (
              <div
                key={project.id}
                className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={project.logo}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-xl border border-white/[0.08] bg-slate-900 object-cover"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="truncate text-sm text-white">{project.name}</strong>

                      <span className="rounded-md bg-sky-400/10 px-2 py-0.5 text-[9px] font-bold uppercase text-sky-400">
                        ${project.symbol}
                      </span>

                      <span
                        className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ${
                          project.enabled === false
                            ? 'bg-rose-400/10 text-rose-300'
                            : 'bg-emerald-400/10 text-emerald-300'
                        }`}
                      >
                        {project.enabled === false ? 'Disabled' : 'Visible'}
                      </span>
                      <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold uppercase text-slate-300">
                        {project.listingStatus || 'auto'}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {project.idoStage} · {project.idoContractAddress || 'No contract address'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing({ ...project })}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-[10px] font-bold text-slate-300 transition hover:border-sky-400/25 hover:text-sky-300"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => toggleVisibility(project)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold transition ${
                      project.enabled === false
                        ? 'border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/[0.06]'
                        : 'border-rose-400/20 text-rose-300 hover:bg-rose-400/[0.06]'
                    }`}
                  >
                    {project.enabled === false ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    {project.enabled === false ? 'Enable' : 'Disable'}
                  </button>
                </div>
              </div>
            ))}

            {!loading && projects.length === 0 && (
              <div className="p-10 text-center text-xs text-slate-500">
                No deployed projects found.
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'swap' && (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="gp-panel rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-white">GRAM / USDT swap contract</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Deploy, configure Jetton wallets, and publish the swap configuration used by the user portal.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label>
                <span className={labelClass}>Owner address</span>
                <input
                  className={inputClass}
                  value={owner}
                  onChange={event => setSwapSettings(current => ({ ...current, ownerAddress: event.target.value }))}
                  placeholder="Owner wallet EQ..."
                />
              </label>

              <label>
                <span className={labelClass}>GRAM symbol</span>
                <input
                  className={inputClass}
                  value={swapSettings.gramSymbol}
                  onChange={event => setSwapSettings(current => ({ ...current, gramSymbol: event.target.value }))}
                  placeholder="GRAM"
                />
              </label>

              <label>
                <span className={labelClass}>GRAM Jetton master</span>
                <input
                  className={inputClass}
                  value={swapSettings.gramMasterAddress}
                  onChange={event => setSwapSettings(current => ({ ...current, gramMasterAddress: event.target.value }))}
                  placeholder="GRAM master EQ..."
                />
              </label>

              <label>
                <span className={labelClass}>GRAM decimals</span>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={18}
                  value={swapSettings.gramDecimals}
                  onChange={event => setSwapSettings(current => ({ ...current, gramDecimals: Number(event.target.value || 0) }))}
                />
              </label>

              <label>
                <span className={labelClass}>USDT Jetton master</span>
                <input
                  className={inputClass}
                  value={swapSettings.usdtMasterAddress}
                  onChange={event => setSwapSettings(current => ({ ...current, usdtMasterAddress: event.target.value }))}
                  placeholder="USDT master EQ..."
                />
              </label>

              <label>
                <span className={labelClass}>USDT decimals</span>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={18}
                  value={swapSettings.usdtDecimals}
                  onChange={event => setSwapSettings(current => ({ ...current, usdtDecimals: Number(event.target.value || 0) }))}
                />
              </label>

              <label className="sm:col-span-2">
                <span className={labelClass}>Rate: how many {swapSettings.gramSymbol || 'GRAM'} for 1 USDT</span>
                <input
                  className={inputClass}
                  value={swapSettings.rateLabel}
                  onChange={event => {
                    const nextRateLabel = event.target.value;
                    setSwapSettings(current => ({
                      ...current,
                      rateLabel: nextRateLabel,
                      rateScaled: /^[0-9]+(\.[0-9]+)?$/.test(nextRateLabel || '')
                        ? rateScaledFromLabel(nextRateLabel).toString()
                        : current.rateScaled,
                    }));
                  }}
                  placeholder="1"
                />
              </label>

              <label className="sm:col-span-2">
                <span className={labelClass}>Maximum buy in USDT (`0` = unlimited)</span>
                <input
                  className={inputClass}
                  value={swapSettings.maxBuyLabel || '0'}
                  onChange={event => {
                    const nextMaxBuyLabel = event.target.value;
                    setSwapSettings(current => ({
                      ...current,
                      maxBuyLabel: nextMaxBuyLabel,
                      maxBuyRaw: /^[0-9]+(\.[0-9]+)?$/.test(nextMaxBuyLabel || '')
                        ? maxBuyRawFromLabel(nextMaxBuyLabel, Number(current.usdtDecimals)).toString()
                        : current.maxBuyRaw || '0',
                    }));
                  }}
                  placeholder="0"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => saveSwapSettingsDraft(swapSettings)}
                disabled={swapSaving}
                className="btn-white-text flex items-center gap-2 rounded-xl bg-[#0098EA] px-4 py-3 text-xs font-bold text-white disabled:opacity-60"
              >
                {swapSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save settings
              </button>

              {wallet.connected ? (
                <>
                  <button
                    onClick={deploySwapContract}
                    disabled={action === 'deploy-swap'}
                    className="flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/[0.08] px-4 py-3 text-xs font-bold text-sky-300"
                  >
                    {action === 'deploy-swap' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                    Deploy contract
                  </button>

                  <button
                    onClick={configureSwapJettonWallets}
                    disabled={!swapSettings.contractAddress || action === 'configure-swap'}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs font-bold text-slate-200 disabled:opacity-50"
                  >
                    {action === 'configure-swap' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
                    Configure Jetton wallets
                  </button>

                  <button
                    onClick={updateSwapRateOnChain}
                    disabled={!swapSettings.contractAddress || action === 'update-swap-rate'}
                    className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-xs font-bold text-emerald-300 disabled:opacity-50"
                  >
                    {action === 'update-swap-rate' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Update on-chain rate
                  </button>

                  <button
                    onClick={updateSwapMaxBuyOnChain}
                    disabled={!swapSettings.contractAddress || action === 'update-swap-max-buy'}
                    className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.08] px-4 py-3 text-xs font-bold text-amber-300 disabled:opacity-50"
                  >
                    {action === 'update-swap-max-buy' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Update max buy
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConnect}
                  className="btn-white-text flex items-center gap-2 rounded-xl bg-[#0098EA] px-4 py-3 text-xs font-bold text-white"
                >
                  <Wallet className="h-4 w-4" />
                  Connect owner wallet
                </button>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="gp-panel rounded-2xl p-5">
              <h3 className="font-bold text-white">Deployment details</h3>
              <div className="mt-4 space-y-3">
                {[
                  ['Swap contract', swapSettings.contractAddress || 'Not deployed'],
                  ['GRAM wallet', swapSettings.gramWalletAddress || 'Not configured'],
                  ['USDT wallet', swapSettings.usdtWalletAddress || 'Not configured'],
                  ['Deployment ID', swapSettings.deploymentId || 'Pending'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      {label}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="min-w-0 flex-1 truncate font-mono text-xs text-slate-200" title={String(value)}>
                        {value}
                      </div>
                      {String(value).includes(' ') || !value || String(value).includes('Not ') || String(value).includes('Pending') ? null : (
                        <button
                          onClick={() => copyText(String(value))}
                          className="rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gp-panel rounded-2xl p-5">
              <h3 className="font-bold text-white">Operational actions</h3>
              <p className="mt-1 text-xs text-slate-500">
                After deployment, keep some TON inside the contract for outgoing Jetton transfer gas.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <label>
                      <span className={labelClass}>Fund {swapSettings.gramSymbol || 'GRAM'} reserve</span>
                      <input
                        className={inputClass}
                        value={swapWithdrawDrafts.topupGramAmount}
                        onChange={event =>
                          setSwapWithdrawDrafts(current => ({ ...current, topupGramAmount: event.target.value }))
                        }
                        placeholder="1000"
                      />
                    </label>
                    <button
                      onClick={fundSwapGramReserve}
                      disabled={!swapSettings.contractAddress || action === 'fund-swap-gram'}
                      className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-left text-xs font-bold text-emerald-300 disabled:opacity-50"
                    >
                      {action === 'fund-swap-gram' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4 text-emerald-300" />}
                      <span>Fund {swapSettings.gramSymbol || 'GRAM'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={fundSwapTonReserve}
                  disabled={!swapSettings.contractAddress || action === 'fund-swap-ton'}
                  className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-xs font-bold text-slate-200 disabled:opacity-50"
                >
                  <span>Fund TON reserve ({SWAP_FUND_TON} TON)</span>
                  {action === 'fund-swap-ton' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4 text-sky-400" />}
                </button>

                <button
                  onClick={toggleSwapPaused}
                  disabled={!swapSettings.contractAddress || action === 'toggle-swap'}
                  className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-xs font-bold text-slate-200 disabled:opacity-50"
                >
                  <span>{swapSettings.paused ? 'Resume swap' : 'Pause swap'}</span>
                  {action === 'toggle-swap' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-sky-400" />}
                </button>
              </div>
            </div>

            <div className="gp-panel rounded-2xl p-5">
              <h3 className="font-bold text-white">Owner withdraw</h3>
              <p className="mt-1 text-xs text-slate-500">
                Uses the existing owner-only withdraw messages from the swap contract.
              </p>

              <div className="mt-4 space-y-4">
                <label>
                  <span className={labelClass}>Destination address</span>
                  <input
                    className={inputClass}
                    value={swapWithdrawDrafts.destination}
                    onChange={event =>
                      setSwapWithdrawDrafts(current => ({ ...current, destination: event.target.value }))
                    }
                    placeholder="Optional. Defaults to connected owner wallet."
                  />
                </label>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <label>
                        <span className={labelClass}>Withdraw TON amount</span>
                        <input
                          className={inputClass}
                          value={swapWithdrawDrafts.tonAmount}
                          onChange={event =>
                            setSwapWithdrawDrafts(current => ({ ...current, tonAmount: event.target.value }))
                          }
                          placeholder="0.5"
                        />
                      </label>
                      <button
                        onClick={() => withdrawSwapAsset('ton')}
                        disabled={!swapSettings.contractAddress || action === 'withdraw-swap-ton'}
                        className="btn-white-text flex items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {action === 'withdraw-swap-ton' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                        Withdraw TON
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <label>
                        <span className={labelClass}>Withdraw {swapSettings.gramSymbol || 'GRAM'} amount</span>
                        <input
                          className={inputClass}
                          value={swapWithdrawDrafts.gramAmount}
                          onChange={event =>
                            setSwapWithdrawDrafts(current => ({ ...current, gramAmount: event.target.value }))
                          }
                          placeholder="1000"
                        />
                      </label>
                      <button
                        onClick={() => withdrawSwapAsset('gram')}
                        disabled={!swapSettings.contractAddress || action === 'withdraw-swap-gram'}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs font-bold text-slate-200 disabled:opacity-50"
                      >
                        {action === 'withdraw-swap-gram' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4 text-sky-400" />}
                        Withdraw {swapSettings.gramSymbol || 'GRAM'}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <label>
                        <span className={labelClass}>Withdraw USDT amount</span>
                        <input
                          className={inputClass}
                          value={swapWithdrawDrafts.usdtAmount}
                          onChange={event =>
                            setSwapWithdrawDrafts(current => ({ ...current, usdtAmount: event.target.value }))
                          }
                          placeholder="500"
                        />
                      </label>
                      <button
                        onClick={() => withdrawSwapAsset('usdt')}
                        disabled={!swapSettings.contractAddress || action === 'withdraw-swap-usdt'}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs font-bold text-slate-200 disabled:opacity-50"
                      >
                        {action === 'withdraw-swap-usdt' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4 text-sky-400" />}
                        Withdraw USDT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-400/15 bg-sky-400/[0.06] p-5 text-xs leading-6 text-slate-300">
              <strong className="block text-sm text-white">Reserve top-up</strong>
              <p className="mt-2">
                To add GRAM or USDT liquidity, send those Jettons from the owner wallet to the swap contract address. Empty forward payload transfers are treated as reserve top-ups.
              </p>
              <p className="mt-2">
                Deploy uses about {SWAP_DEPLOY_TON} TON. Configuration and admin actions each need a small extra TON confirmation.
              </p>
            </div>
          </div>
        </div>
      )}

{view === 'lplocker' && (
  <div className="gp-panel overflow-hidden rounded-2xl">
    <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
      <div>
        <h2 className="font-bold text-white">LP / Token Locker</h2>
        <p className="mt-1 text-xs text-slate-500">
          Universal locker contract management.
        </p>
      </div>
    </div>

    <div className="p-5">
      {UNIVERSAL_LOCKER_ADDRESS ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
          <h3 className="text-lg font-bold text-white">
            Universal Locker Already Configured
          </h3>

          <p className="mt-2 text-xs text-slate-400">
            The locker contract is already deployed and configured.
          </p>

          <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#080E1A]/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Locker Address
            </div>

            <div className="mt-1 break-all font-mono text-xs text-emerald-500">
              {UNIVERSAL_LOCKER_ADDRESS}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-sky-400/15 bg-sky-400/[0.06] p-5">
          <h3 className="text-lg font-bold text-white">
            Universal LP / Token Locker
          </h3>

          <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400">
            This deploys one locker contract that can accept any Jetton or LP
            Jetton.
          </p>

          <form onSubmit={deployLpLockerContract} className="mt-5">
            {wallet.connected ? (
              <button
                disabled={action === 'deploy-lplocker'}
                className="btn-white-text flex items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
              >
                {action === 'deploy-lplocker' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                Deploy LP Locker Contract
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenConnect}
                className="btn-white-text flex items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
              >
                <Wallet className="h-4 w-4" />
                Connect owner wallet
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  </div>
)}

      {view === 'applications' && (
        <div className="space-y-4">
          <div className="gp-panel rounded-2xl p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-white">Project applications</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review founder submissions and filter by status.
                </p>
              </div>

              <select
                value={applicationFilter}
                onChange={event =>
                  setApplicationFilter(event.target.value as 'all' | ApplicationStatus)
                }
                className="w-full rounded-xl border border-sky-400/20 bg-[#080E1A] px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-400 sm:w-[190px]"
              >
                <option value="all">All ({applications.length})</option>
                <option value="in_review">
                  In Review ({applications.filter(app => (app.status || 'in_review') === 'in_review').length})
                </option>
                <option value="approved">
                  Approved ({applications.filter(app => (app.status || 'in_review') === 'approved').length})
                </option>
                <option value="rejected">
                  Rejected ({applications.filter(app => (app.status || 'in_review') === 'rejected').length})
                </option>
              </select>
            </div>
          </div>

        <div className="space-y-3">
          {filteredApplications.map(application => {
            const expanded = expandedApplication === application.id;
            const status = application.status || 'in_review';
            const selectedStatus = statusDrafts[application.id] || status;
            const statusChanged = selectedStatus !== status;

            return (
              <article key={application.id} className="gp-panel rounded-2xl">
                <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <button
                    onClick={() => setExpandedApplication(expanded ? null : application.id)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {application.logo && (
                        <img
                          src={application.logo}
                          alt="Logo"
                          className="h-10 w-10 shrink-0 rounded-xl border border-white/[0.08] bg-slate-900 object-cover"
                        />
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm text-white">
                            {application.projectName}
                          </strong>

                          <span className="rounded-md bg-sky-400/10 px-2 py-0.5 text-[9px] font-bold text-sky-400">
                            ${application.tokenSymbol}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${applicationStatusClasses[status]}`}
                          >
                            {applicationStatusLabels[status]}
                          </span>

                          <span className="text-[10px] text-slate-500">
                            {application.category}
                          </span>
                        </div>

                        <p className="mt-1 text-[11px] text-slate-500">
                          {application.contactName} · {application.contactEmail} ·{' '}
                          {new Date(application.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {expanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <select
                      className="rounded-xl border border-white/[0.08] bg-[#080E1A]/75 px-3 py-2 text-xs font-semibold text-white focus:border-sky-400/45 focus:outline-none"
                      value={selectedStatus}
                      onChange={event =>
                        setStatusDrafts(current => ({
                          ...current,
                          [application.id]: event.target.value as ApplicationStatus,
                        }))
                      }
                    >
                      <option value="in_review">In review</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>

                    <button
                      onClick={() => updateApplicationStatus(application)}
                      disabled={!statusChanged || updatingApplicationId === application.id}
                      className="btn-white-text flex items-center gap-1.5 rounded-xl bg-[#0098EA] px-3.5 py-2 text-[10px] font-bold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingApplicationId === application.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Update status
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-white/[0.07] p-5">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ['Product status', application.productStatus],
                        ['Contact', `${application.contactName}, ${application.contactRole}`],
                        ['Telegram', application.contactTelegram],
                        ['Country', application.companyCountry],
                        ['Legal entity', application.legalEntity || 'Not provided'],
                        ['Team', `${application.teamSize} members`],
                        ['KYC ready', application.kycReady ? 'Yes' : 'No'],
                        ['Audit', application.auditStatus],
                        ['Target raise', `$${application.targetRaiseUsdt.toLocaleString()} USDT`],
                        ['Soft cap', `$${application.softCapUsdt.toLocaleString()} USDT`],
                        ['Token price', `$${application.tokenPriceUsdt} USDT`],
                        ['Liquidity', `${application.liquidityPercent}%`],
                        ['Total supply', application.totalSupply],
                        ['Decimals', application.decimals],
                        ['Timeline', application.launchTimeline],
                        ['Community', application.communitySize || 'Not provided'],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <span className={labelClass}>{label}</span>
                          <p className="break-words text-xs leading-5 text-slate-300">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {[
                      ['Project summary', application.projectSummary],
                      ['Team background', application.teamBackground],
                      [
                        'Vesting plan',
                        `Vesting Duration: ${application.vestingDurationMonths} months\nCliff Duration: ${application.vestingCliffMonths} months\nTGE Unlock: ${application.vestingTgePercent}%`,
                      ],
                      ['Additional notes', application.additionalNotes || 'None'],
                    ].map(([label, value]) => (
                      <div key={label} className="mt-5 border-t border-white/[0.06] pt-5">
                        <span className={labelClass}>{label}</span>
                        <p className="whitespace-pre-wrap text-xs leading-6 text-slate-300">
                          {value}
                        </p>
                      </div>
                    ))}

                    <div className="mt-5 flex flex-wrap gap-2">
                      {[
                        ['Website', application.website],
                        ['Whitepaper', application.whitepaper],
                        ['Pitch deck', application.pitchDeck],
                        ['GitHub', application.github],
                        ['Telegram', application.telegram],
                        ['Twitter', application.twitter],
                        ['Discord', application.discord],
                        ['Facebook', application.facebook],
                        ['Instagram', application.instagram],
                        ['Reddit', application.reddit],
                        ['Medium', application.medium],
                        ['Audit report', application.auditLink],
                      ]
                        .filter(([, url]) => url)
                        .map(([label, url]) => (
                          <a
                            key={label}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-sky-400/15 bg-sky-400/[0.06] px-3 py-2 text-[10px] font-bold text-sky-300"
                          >
                            {label}
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {!loading && filteredApplications.length === 0 && (
            <div className="gp-panel rounded-2xl p-10 text-center text-xs text-slate-500">
              No applications found for the selected status.
            </div>
          )}
        </div>
        </div>
      )}

      {view === 'create' && (
        <TokenLauncher
          wallet={wallet}
          onOpenConnect={onOpenConnect}
          csrfToken={session.csrfToken || ''}
          onDeploySuccess={project => {
            setProjects(current => [project, ...current]);
            onDeploySuccess(project);
          }}
        />
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveProject}
            className="gp-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-5 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Edit {editing.name}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Display and verification data only. Contract terms cannot be changed here.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {(['name', 'logo', 'banner', 'website', 'telegram', 'twitter', 'discord', 'github'] as const).map(
                field => (
                  <label key={field}>
                    <span className={labelClass}>
                      {field === 'logo' || field === 'banner' ? `${field} link` : field}
                    </span>

                    <input
                      className={inputClass}
                      type={
                        field === 'logo' ||
                        field === 'banner' ||
                        field === 'website' ||
                        field === 'telegram' ||
                        field === 'twitter' ||
                        field === 'discord' ||
                        field === 'github'
                          ? 'url'
                          : 'text'
                      }
                      placeholder={
                        field === 'logo'
                          ? 'https://example.com/logo.png'
                          : field === 'banner'
                            ? 'https://example.com/banner.jpg'
                            : undefined
                      }
                      value={String(editing[field] || '')}
                      onChange={event =>
                        setEditing(current =>
                          current ? { ...current, [field]: event.target.value } : current
                        )
                      }
                    />
                  </label>
                )
              )}

              <label>
                <span className={labelClass}>KYC status</span>
                <select
                  className={inputClass}
                  value={editing.kycStatus}
                  onChange={event =>
                    setEditing(current =>
                      current
                        ? {
                            ...current,
                            kycStatus: event.target.value as LaunchpadProject['kycStatus'],
                          }
                        : current
                    )
                  }
                >
                  <option value="not_submitted">Not submitted</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>Audit status</span>
                <select
                  className={inputClass}
                  value={editing.auditStatus}
                  onChange={event =>
                    setEditing(current =>
                      current
                        ? {
                            ...current,
                            auditStatus: event.target.value as LaunchpadProject['auditStatus'],
                          }
                        : current
                    )
                  }
                >
                  <option value="not_submitted">Not submitted</option>
                  <option value="pending">Pending</option>
                  <option value="automated_review">Automated review</option>
                  <option value="verified">Verified</option>
                  <option value="issues_found">Issues found</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>Homepage listing</span>
                <select
                  className={inputClass}
                  value={editing.listingStatus || 'auto'}
                  onChange={event =>
                    setEditing(current =>
                      current
                        ? {
                            ...current,
                            listingStatus: event.target.value as LaunchpadProject['listingStatus'],
                            enabled: event.target.value !== 'hidden',
                          }
                        : current
                    )
                  }
                >
                  <option value="auto">Auto: live or past by contract stage</option>
                  <option value="under_review">Under review</option>
                  <option value="hidden">Hidden from portal</option>
                </select>
              </label>
              <label className="flex items-center gap-3 self-end rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <input
                  type="checkbox"
                  checked={editing.promoted === true}
                  onChange={event =>
                    setEditing(current =>
                      current ? { ...current, promoted: event.target.checked } : current
                    )
                  }
                />
                <span className="text-xs font-semibold text-slate-300">
                  Promote in home scrolling bar
                </span>
              </label>

              <label>
                <span className={labelClass}>Cliff duration days</span>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={3650}
                  value={editing.cliffDurationDays ?? 0}
                  onChange={event =>
                    setEditing(current =>
                      current
                        ? {
                            ...current,
                            cliffDurationDays: Math.max(0, Number(event.target.value) || 0),
                          }
                        : current
                    )
                  }
                />
                <span className="mt-1 block text-[10px] text-slate-500">
                  Metadata repair only. Keep it equal to the deployed IDO contract cliff.
                </span>
              </label>

              <label className="sm:col-span-2">
                <span className={labelClass}>Description</span>
                <textarea
                  className={`${inputClass} min-h-32 resize-y`}
                  value={editing.description}
                  onChange={event =>
                    setEditing(current =>
                      current ? { ...current, description: event.target.value } : current
                    )
                  }
                />
              </label>

              <div className="sm:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white">AI audit</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Update the public AI audit summary shown on the project details page.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={labelClass}>Trust score</span>
                    <input
                      className={inputClass}
                      type="number"
                      min={0}
                      max={100}
                      value={editing.aiAudit?.trustScore ?? 0}
                      onChange={event =>
                        setEditing(current =>
                          current
                            ? {
                                ...current,
                                aiAudit: {
                                  trustScore: Number(event.target.value || 0),
                                  riskLevel: current.aiAudit?.riskLevel || 'MEDIUM',
                                  utilityRating: current.aiAudit?.utilityRating || 'GOOD',
                                  liquidityAnalysis: current.aiAudit?.liquidityAnalysis || '',
                                  whitelistRecommendation: current.aiAudit?.whitelistRecommendation || '',
                                  overallEvaluation: current.aiAudit?.overallEvaluation || '',
                                  concerns: current.aiAudit?.concerns || [],
                                  recommendations: current.aiAudit?.recommendations || [],
                                } satisfies AIAudit,
                              }
                            : current
                        )
                      }
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Risk level</span>
                    <select
                      className={inputClass}
                      value={editing.aiAudit?.riskLevel || 'MEDIUM'}
                      onChange={event =>
                        setEditing(current =>
                          current
                            ? {
                                ...current,
                                aiAudit: {
                                  trustScore: current.aiAudit?.trustScore ?? 0,
                                  riskLevel: event.target.value as AIAudit['riskLevel'],
                                  utilityRating: current.aiAudit?.utilityRating || 'GOOD',
                                  liquidityAnalysis: current.aiAudit?.liquidityAnalysis || '',
                                  whitelistRecommendation: current.aiAudit?.whitelistRecommendation || '',
                                  overallEvaluation: current.aiAudit?.overallEvaluation || '',
                                  concerns: current.aiAudit?.concerns || [],
                                  recommendations: current.aiAudit?.recommendations || [],
                                } satisfies AIAudit,
                              }
                            : current
                        )
                      }
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </label>

                  <label>
                    <span className={labelClass}>Utility rating</span>
                    <select
                      className={inputClass}
                      value={editing.aiAudit?.utilityRating || 'GOOD'}
                      onChange={event =>
                        setEditing(current =>
                          current
                            ? {
                                ...current,
                                aiAudit: {
                                  trustScore: current.aiAudit?.trustScore ?? 0,
                                  riskLevel: current.aiAudit?.riskLevel || 'MEDIUM',
                                  utilityRating: event.target.value as AIAudit['utilityRating'],
                                  liquidityAnalysis: current.aiAudit?.liquidityAnalysis || '',
                                  whitelistRecommendation: current.aiAudit?.whitelistRecommendation || '',
                                  overallEvaluation: current.aiAudit?.overallEvaluation || '',
                                  concerns: current.aiAudit?.concerns || [],
                                  recommendations: current.aiAudit?.recommendations || [],
                                } satisfies AIAudit,
                              }
                            : current
                        )
                      }
                    >
                      <option value="EXCELLENT">EXCELLENT</option>
                      <option value="GOOD">GOOD</option>
                      <option value="SPECULATIVE">SPECULATIVE</option>
                      <option value="POOR">POOR</option>
                    </select>
                  </label>

                  <label className="sm:col-span-2">
                    <span className={labelClass}>Liquidity analysis</span>
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      value={editing.aiAudit?.liquidityAnalysis || ''}
                      onChange={event =>
                        setEditing(current =>
                          current
                            ? {
                                ...current,
                                aiAudit: {
                                  trustScore: current.aiAudit?.trustScore ?? 0,
                                  riskLevel: current.aiAudit?.riskLevel || 'MEDIUM',
                                  utilityRating: current.aiAudit?.utilityRating || 'GOOD',
                                  liquidityAnalysis: event.target.value,
                                  whitelistRecommendation: current.aiAudit?.whitelistRecommendation || '',
                                  overallEvaluation: current.aiAudit?.overallEvaluation || '',
                                  concerns: current.aiAudit?.concerns || [],
                                  recommendations: current.aiAudit?.recommendations || [],
                                } satisfies AIAudit,
                              }
                            : current
                        )
                      }
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className={labelClass}>Whitelist recommendation</span>
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      value={editing.aiAudit?.whitelistRecommendation || ''}
                      onChange={event =>
                        setEditing(current =>
                          current
                            ? {
                                ...current,
                                aiAudit: {
                                  trustScore: current.aiAudit?.trustScore ?? 0,
                                  riskLevel: current.aiAudit?.riskLevel || 'MEDIUM',
                                  utilityRating: current.aiAudit?.utilityRating || 'GOOD',
                                  liquidityAnalysis: current.aiAudit?.liquidityAnalysis || '',
                                  whitelistRecommendation: event.target.value,
                                  overallEvaluation: current.aiAudit?.overallEvaluation || '',
                                  concerns: current.aiAudit?.concerns || [],
                                  recommendations: current.aiAudit?.recommendations || [],
                                } satisfies AIAudit,
                              }
                            : current
                        )
                      }
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className={labelClass}>Overall evaluation</span>
                    <textarea
                      className={`${inputClass} min-h-28 resize-y`}
                      value={editing.aiAudit?.overallEvaluation || ''}
                      onChange={event =>
                        setEditing(current =>
                          current
                            ? {
                                ...current,
                                aiAudit: {
                                  trustScore: current.aiAudit?.trustScore ?? 0,
                                  riskLevel: current.aiAudit?.riskLevel || 'MEDIUM',
                                  utilityRating: current.aiAudit?.utilityRating || 'GOOD',
                                  liquidityAnalysis: current.aiAudit?.liquidityAnalysis || '',
                                  whitelistRecommendation: current.aiAudit?.whitelistRecommendation || '',
                                  overallEvaluation: event.target.value,
                                  concerns: current.aiAudit?.concerns || [],
                                  recommendations: current.aiAudit?.recommendations || [],
                                } satisfies AIAudit,
                              }
                            : current
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="btn-white-text flex items-center gap-2 rounded-xl bg-[#0098EA] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
