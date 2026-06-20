import { useState, FormEvent, useRef } from 'react';
import { Smartphone, Sparkles, Loader2, Coins, Calendar, ArrowRight, ShieldCheck, Heart, Info, UploadCloud, Link, FileImage, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { CHAIN } from '@tonconnect/protocol';
import { LaunchpadProject, WalletState } from '../types.js';
import { getIdoConfigurationStatus, getIdoRecoveryDetails, prepareIdoDeployment, waitForContract, waitForIdoDeployment } from '../ton/gramStarter.js';
import { Address } from '@ton/core';
import { DEFAULT_PROJECT_BANNER, DEFAULT_PROJECT_LOGO, projectAssetOrDefault } from '../constants/assets.js';
import { getJettonMetadata } from '../ton/universalLocker.js';

interface TokenLauncherProps {
  wallet: WalletState;
  onOpenConnect: () => void;
  onDeploySuccess: (newProject: LaunchpadProject) => void;
  csrfToken: string;
}

export default function TokenLauncher({ wallet, onOpenConnect, onDeploySuccess, csrfToken }: TokenLauncherProps) {
  const [tonConnectUI] = useTonConnectUI();
  const idoNetwork = String((import.meta as any).env.VITE_TONCENTER_ENDPOINT || '')
    .includes('testnet')
    ? CHAIN.TESTNET
    : CHAIN.MAINNET;
  // Input states in USDT
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState(9);
  const [totalSupply, setTotalSupply] = useState(1000000);
  const [rate, setRate] = useState(100);
  const [softCap, setSoftCap] = useState(10000);
  const [hardCap, setHardCap] = useState(30000);
  const [minBuy, setMinBuy] = useState(50);
  const [maxBuy, setMaxBuy] = useState(1000);
  const [durationDays, setDurationDays] = useState(4);
  const [vestingTgePercent, setVestingTgePercent] = useState(20);
  const [cliffDurationDays, setCliffDurationDays] = useState(0);
  const [vestingMonths, setVestingMonths] = useState(3);
  const [logo, setLogo] = useState('');
  const [banner, setBanner] = useState('');
  const [description, setDescription] = useState('');
  const [jettonAddress, setJettonAddress] = useState('');
  const [jettonMetadataLoading, setJettonMetadataLoading] = useState(false);
  const [jettonMetadataError, setJettonMetadataError] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([
    { platform: 'website', url: '' },
    { platform: 'telegram', url: '' },
    { platform: 'twitter', url: '' }
  ]);

  // Device upload states
  const [logoSource, setLogoSource] = useState<'url' | 'upload'>('url');
  const [bannerSource, setBannerSource] = useState<'url' | 'upload'>('url');
  const [logoError, setLogoError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState('');
  const [bannerFileName, setBannerFileName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Ref handles for file input elements
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Logo & Banner device upload helpers
  // Important: uploaded images stay as File objects and are sent with FormData.
  // The `logo` and `banner` state values below are only local preview URLs, not Base64 strings.
  const handleLogoUpload = (file: File) => {
    setLogoError(null);

    const maxBytes = 1 * 1024 * 1024; // 1 MB limit
    if (file.size > maxBytes) {
      setLogoFile(null);
      setLogo('');
      setLogoFileName('');
      setLogoError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max logo file size is 1 MB.`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setLogoFile(null);
      setLogo('');
      setLogoFileName('');
      setLogoError('Unsupported file type. Please upload an image format (PNG, JPG, SVG, WEBP).');
      return;
    }

    setLogoFile(file);
    setLogo(URL.createObjectURL(file));
    setLogoFileName(file.name);
  };

  const handleBannerUpload = (file: File) => {
    setBannerError(null);

    const maxBytes = 2 * 1024 * 1024; // 2 MB limit
    if (file.size > maxBytes) {
      setBannerFile(null);
      setBanner('');
      setBannerFileName('');
      setBannerError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max banner file size is 2 MB.`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setBannerFile(null);
      setBanner('');
      setBannerFileName('');
      setBannerError('Unsupported file type. Please upload an image format (PNG, JPG, WEBP).');
      return;
    }

    setBannerFile(file);
    setBanner(URL.createObjectURL(file));
    setBannerFileName(file.name);
  };

  const clearLogo = () => {
    setLogo('');
    setLogoFile(null);
    setLogoFileName('');
    setLogoError(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const clearBanner = () => {
    setBanner('');
    setBannerFile(null);
    setBannerFileName('');
    setBannerError(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  // Dynamic Social Links helpers
  const availablePlatforms = [
    { value: 'website', label: 'Website 🌐' },
    { value: 'telegram', label: 'Telegram 💬' },
    { value: 'twitter', label: 'Twitter (X) 🐦' },
    { value: 'whitepaper', label: 'Whitepaper 📚' },
    
    { value: 'discord', label: 'Discord 👾' },
    { value: 'facebook', label: 'Facebook 👥' },
    { value: 'instagram', label: 'Instagram 📸' },
    { value: 'github', label: 'GitHub 📁' },
    { value: 'reddit', label: 'Reddit 🤖' },
    { value: 'medium', label: 'Medium 📖' }
  ];

  const handleAddSocialLink = () => {
    const usedPlatforms = socialLinks.map(l => l.platform);
    const nextAvailable = availablePlatforms.find(p => !usedPlatforms.includes(p.value))?.value || 'website';
    setSocialLinks([...socialLinks, { platform: nextAvailable, url: '' }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    const list = [...socialLinks];
    list.splice(index, 1);
    setSocialLinks(list);
  };

  const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    const list = [...socialLinks];
    list[index][field] = value;
    setSocialLinks(list);
  };

  // AI Prompt Support
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<'meme' | 'defi' | 'utility'>('meme');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGlow, setAiGlow] = useState(false);

  // Deploying transaction state
  const [deployStep, setDeployStep] = useState<'idle' | 'signing' | 'broadcasting' | 'complete'>('idle');
  const [broadcastStage, setBroadcastStage] = useState<'deployment' | 'setup' | 'deposit'>('deployment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingDeployment, setPendingDeployment] = useState<Awaited<ReturnType<typeof prepareIdoDeployment>> | null>(null);
  const [deploymentTxBoc, setDeploymentTxBoc] = useState('');
  const [deploymentProgress, setDeploymentProgress] = useState({
    deployed: false,
    configured: false,
    deposited: false,
  });
  const [recoveryAddress, setRecoveryAddress] = useState('');
  const [recoveryDetails, setRecoveryDetails] = useState<Awaited<ReturnType<typeof getIdoRecoveryDetails>> | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMetadata, setRecoveryMetadata] = useState({
    name: '',
    symbol: '',
    description: '',
    rate: '100',
    totalSupply: '1000000',
    decimals: '9',
    durationDays: '30',
    logo: '',
    banner: '',
  });

  const loadJettonMetadata = async () => {
    setJettonMetadataLoading(true);
    setJettonMetadataError('');
    try {
      const metadata = await getJettonMetadata(jettonAddress);
      setName(metadata.name);
      setSymbol(metadata.symbol.toUpperCase());
      setDecimals(metadata.decimals);
      if (Number.isFinite(metadata.totalSupply) && metadata.totalSupply > 0) {
        setTotalSupply(metadata.totalSupply);
      }
    } catch (error: any) {
      setJettonMetadataError(
        error?.message || 'Could not load details from this Jetton master address.'
      );
    } finally {
      setJettonMetadataLoading(false);
    }
  };

  // Auto AI Generation handler
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleAIGenerate = async () => {
  if (!aiPrompt.trim()) return;

  setGeneratingAI(true);
  setErrorMsg(null);

  try {
    const res = await fetch('/api/projects/ai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ theme: aiPrompt, category: aiCategory }),
    });

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    setName(data.name || '');
    setSymbol(data.symbol || '');
    setDescription(data.description || '');
    setRate(Number(data.suggestedRate) || 50);
    setHardCap(Number(data.suggestedHardcap) || 25000);
    setSoftCap(Number(data.suggestedSoftcap) || 10000);

    setAiGlow(true);
    setTimeout(() => setAiGlow(false), 3000);

  } catch (err: any) {
    console.error(err);
    setErrorMsg('Failed to run AI tokenomics assist: ' + err.message);
  } finally {
    await delay(3000);
    setGeneratingAI(false);
  }
};
  const handleDeployProject = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      return;
    }

    if (!name.trim() || !symbol.trim() || !description.trim() || !jettonAddress.trim()) {
      setErrorMsg('Please specify Token Name, Symbol, Description, and the sale-token Jetton master address.');
      return;
    }

    if (softCap >= hardCap) {
      setErrorMsg('Soft Cap must be strictly lower than Hard Cap.');
      return;
    }

    if (maxBuy <= minBuy) {
      setErrorMsg('Maximum Participation Buy must be higher than Minimum Buy.');
      return;
    }

    if (maxBuy > hardCap) {
      setErrorMsg('Maximum Participation Buy cannot exceed the Hard Cap.');
      return;
    }

    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) {
      setErrorMsg('IDO Sale Duration must be a whole number between 1 and 365 days.');
      return;
    }
    if (!Number.isInteger(cliffDurationDays) || cliffDurationDays < 0 || cliffDurationDays > 3650) {
      setErrorMsg('Cliff Duration must be a whole number between 0 and 3650 days.');
      return;
    }

    const launchpadWallet = (import.meta as any).env.VITE_LAUNCHPAD_WALLET;
    try {
      if (!launchpadWallet) {
        throw new Error('VITE_LAUNCHPAD_WALLET must be configured as the permanent superadmin.');
      }

      const deployment = await prepareIdoDeployment({
        owner: wallet.address,
        superAdmin: launchpadWallet,
        saleTokenMaster: jettonAddress.trim(),
        saleTokenDecimals: decimals,
        softCap,
        hardCap,
        minBuy,
        maxBuy,
        rate,
        vestingTgePercent,
        cliffDurationDays,
        vestingMonths,
      });

      setPendingDeployment(deployment);
      setDeploymentTxBoc('');
      setDeploymentProgress({ deployed: false, configured: false, deposited: false });
      setDeployStep('idle');
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to prepare IDO deployment.');
      setDeployStep('idle');
    }
  };

  const deployIdoContract = async () => {
    if (!pendingDeployment) return;
    setErrorMsg(null);
    setDeployStep('signing');

    try {
      try {
        const existingStatus = await getIdoConfigurationStatus(
          pendingDeployment.contract.address.toString()
        );
        if (existingStatus.version === 13n || existingStatus.version === 14n) {
          setDeploymentProgress(current => ({
            ...current,
            deployed: true,
            configured: current.configured || existingStatus.configured,
          }));
          setDeployStep('idle');
          return;
        }
      } catch {
        // Not active yet; continue with wallet deployment transaction.
      }

      const deploymentTransaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: idoNetwork,
        messages: [pendingDeployment.deploymentMessage],
      };

      const deploymentResult = await tonConnectUI.sendTransaction(deploymentTransaction);
      setBroadcastStage('deployment');
      setDeployStep('broadcasting');
      await waitForIdoDeployment(pendingDeployment.contract);
      setDeploymentTxBoc(deploymentResult.boc);
      setDeploymentProgress(current => ({ ...current, deployed: true }));
      setDeployStep('idle');
    } catch (err: any) {
      setErrorMsg(err.message || 'IDO contract deployment failed.');
      setDeployStep('idle');
    }
  };

  const refreshIdoDeploymentStatus = async () => {
    if (!pendingDeployment) return;
    setErrorMsg(null);
    setDeployStep('broadcasting');

    try {
      const status = await getIdoConfigurationStatus(
        pendingDeployment.contract.address.toString()
      );
      if (status.version !== 13n && status.version !== 14n) {
        throw new Error(`Unsupported IDO contract version ${status.version.toString()}.`);
      }
      setDeploymentProgress(current => ({
        ...current,
        deployed: true,
        configured: current.configured || status.configured,
      }));
    } catch (err: any) {
      setErrorMsg(
        err.message ||
        'Deployment is not visible on the configured TON network yet. Wait a little and refresh again.'
      );
    } finally {
      setDeployStep('idle');
    }
  };

  const configureIdoWallets = async () => {
    if (!pendingDeployment || !deploymentProgress.deployed) return;
    setErrorMsg(null);
    setDeployStep('signing');

    try {
      if (!wallet.address) {
        throw new Error('Connect the project owner wallet before configuring Jetton wallets.');
      }

      const status = await getIdoConfigurationStatus(
        pendingDeployment.contract.address.toString()
      );
      if (status.version !== 13n && status.version !== 14n) {
        throw new Error(`Unsupported IDO contract version ${status.version.toString()}.`);
      }
      if (status.configured) {
        setDeploymentProgress(current => ({ ...current, configured: true }));
        throw new Error('Jetton wallets are already configured for this IDO contract.');
      }
      if (status.stage !== 0n) {
        throw new Error(
          `Jetton wallets can only be configured during contract stage 0. Current stage is ${status.stage.toString()}.`
        );
      }

      const sender = Address.parse(wallet.address);
      if (!sender.equals(status.owner) && !sender.equals(status.superAdmin)) {
        throw new Error(
          `The connected wallet is not authorized. Connect the project owner wallet ${status.owner.toString()} or the launchpad super-admin wallet.`
        );
      }

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: idoNetwork,
        messages: [pendingDeployment.setupMessages[0]],
      });
      setBroadcastStage('setup');
      setDeployStep('broadcasting');
      await waitForContract(pendingDeployment.contract, async opened => {
        return await opened.getGetJettonWalletsConfigured();
      }, 90_000, 'IDO Jetton-wallet configuration was not confirmed.');
      setDeploymentProgress(current => ({ ...current, configured: true }));
      setDeployStep('idle');
    } catch (err: any) {
      setErrorMsg(err.message || 'IDO Jetton-wallet configuration failed.');
      setDeployStep('idle');
    }
  };

  const depositIdoTokens = async () => {
    if (!pendingDeployment || !deploymentProgress.configured) return;
    setErrorMsg(null);
    setDeployStep('signing');

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: idoNetwork,
        messages: [pendingDeployment.setupMessages[1]],
      });
      setBroadcastStage('deposit');
      setDeployStep('broadcasting');
      await waitForContract(pendingDeployment.contract, async opened => {
        const deposited = await opened.getGetSaleTokenDeposited();
        return deposited >= pendingDeployment.saleTokenRequired;
      }, 90_000, 'Sale-token deposit was not confirmed by the IDO contract.');
      setDeploymentProgress(current => ({ ...current, deposited: true }));
      setDeployStep('idle');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sale-token deposit failed.');
      setDeployStep('idle');
    }
  };

  const syncProjectToDatabase = async () => {
    if (!pendingDeployment || !deploymentProgress.deposited || !wallet.address) return;
    setErrorMsg(null);
    setDeployStep('broadcasting');
    setBroadcastStage('deposit');

    try {
      const socialsPayload = {
        website: '',
        telegram: '',
        twitter: '',
        discord: '',
        facebook: '',
        instagram: '',
        github: '',
        reddit: '',
        medium: '',
      };

      socialLinks.forEach(link => {
        if (link.platform && link.url.trim()) {
          socialsPayload[link.platform as keyof typeof socialsPayload] = link.url.trim();
        }
      });

      const formData = new FormData();

      const payload: Record<string, string> = {
        name,
        symbol,
        decimals: String(decimals),
        totalSupply: String(totalSupply),
        logo: logoSource === 'url' ? logo : '',
        banner: bannerSource === 'url' ? banner : '',
        description,
        creator: wallet.address,
        rate: String(rate),
        softCap: String(softCap),
        hardCap: String(hardCap),
        minBuy: String(minBuy),
        maxBuy: String(maxBuy),
        durationDays: String(durationDays),
        vestingTgePercent: String(vestingTgePercent),
        cliffDurationDays: String(cliffDurationDays || 0),
        vestingMonths: String(vestingMonths),
        txHash: deploymentTxBoc,
        jettonAddress,
        idoContractAddress: pendingDeployment.contract.address.toString(),
        contractDeploymentId: pendingDeployment.deploymentId.toString(),
        contractVersion: '14',
        usdtDecimals: String(pendingDeployment.usdtDecimals),
        saleTokenRequired: pendingDeployment.saleTokenRequired.toString(),
        ...socialsPayload,
      };

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (logoSource === 'upload' && logoFile) {
        formData.append('logoFile', logoFile);
      }

      if (bannerSource === 'upload' && bannerFile) {
        formData.append('bannerFile', bannerFile);
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });
      const newProject = await res.json();

      if (res.status !== 201) {
        throw new Error(newProject.error || 'Server error occurred.');
      }

      setDeployStep('complete');
      setTimeout(() => {
        onDeploySuccess(newProject);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Project database sync failed.');
      setDeployStep('idle');
    }
  };

  const loadRecoveryContract = async () => {
    setRecoveryLoading(true);
    setErrorMsg(null);
    try {
      if (!wallet.address) throw new Error('Connect the project owner wallet first.');
      const details = await getIdoRecoveryDetails(recoveryAddress);
      if (!Address.parse(details.owner).equals(Address.parse(wallet.address))) {
        throw new Error('The connected wallet is not the owner of this IDO contract.');
      }
      setRecoveryDetails(details);
      setSoftCap(details.softCap);
      setHardCap(details.hardCap);
      setMinBuy(details.minBuy);
      setMaxBuy(details.maxBuy);
      setJettonAddress(details.saleTokenMaster);
      setVestingTgePercent(details.vestingTgePercent);
      setCliffDurationDays(details.cliffDurationDays);
      setVestingMonths(details.vestingMonths);
    } catch (error: any) {
      setRecoveryDetails(null);
      setErrorMsg(error.message || 'Could not load the deployed IDO contract.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const syncRecoveredProject = async () => {
    if (!recoveryDetails || !wallet.address) return;
    setRecoveryLoading(true);
    setErrorMsg(null);
    try {
      const recoveryRate = Number(recoveryMetadata.rate);
      const recoverySupply = Number(recoveryMetadata.totalSupply);
      const recoveryDecimals = Number(recoveryMetadata.decimals);
      const recoveryDuration = Number(recoveryMetadata.durationDays);
      if (
        !recoveryMetadata.name.trim() ||
        !recoveryMetadata.symbol.trim() ||
        !recoveryMetadata.description.trim() ||
        recoveryRate <= 0
      ) {
        throw new Error('Enter project name, symbol, description, and presale rate.');
      }
      if (!Number.isInteger(recoveryDuration) || recoveryDuration < 1 || recoveryDuration > 365) {
        throw new Error('Sale duration must be a whole number between 1 and 365 days.');
      }
      if (!Number.isInteger(recoveryDecimals) || recoveryDecimals < 0 || recoveryDecimals > 18) {
        throw new Error('Token decimals must be a whole number between 0 and 18.');
      }

      const socialsPayload: Record<string, string> = {};
      socialLinks.forEach(link => {
        if (link.platform && link.url.trim()) socialsPayload[link.platform] = link.url.trim();
      });

      const formData = new FormData();
      const payload: Record<string, string> = {
        name: recoveryMetadata.name.trim(),
        symbol: recoveryMetadata.symbol.trim(),
        decimals: String(recoveryDecimals),
        totalSupply: String(recoverySupply),
        logo: recoveryMetadata.logo,
        banner: recoveryMetadata.banner,
        description: recoveryMetadata.description.trim(),
        creator: wallet.address,
        rate: String(recoveryRate),
        softCap: String(recoveryDetails.softCap),
        hardCap: String(recoveryDetails.hardCap),
        minBuy: String(recoveryDetails.minBuy),
        maxBuy: String(recoveryDetails.maxBuy),
        durationDays: String(recoveryDuration),
        vestingTgePercent: String(recoveryDetails.vestingTgePercent),
        cliffDurationDays: String(recoveryDetails.cliffDurationDays),
        vestingMonths: String(recoveryDetails.vestingMonths),
        txHash: `recovered:${recoveryDetails.address}`,
        jettonAddress: recoveryDetails.saleTokenMaster,
        idoContractAddress: recoveryDetails.address,
        contractDeploymentId: recoveryDetails.deploymentId.toString(),
        contractVersion: String(recoveryDetails.version),
        usdtDecimals: String(recoveryDetails.usdtDecimals),
        saleTokenRequired: recoveryDetails.saleTokenRequired.toString(),
        ...socialsPayload,
      };
      Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
      if (logoSource === 'upload' && logoFile) formData.append('logoFile', logoFile);
      if (bannerSource === 'upload' && bannerFile) formData.append('bannerFile', bannerFile);

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });
      const project = await response.json();
      if (!response.ok) throw new Error(project.error || 'Recovery sync failed.');
      setDeployStep('complete');
      setTimeout(() => onDeploySuccess(project), 1200);
    } catch (error: any) {
      setErrorMsg(error.message || 'Recovery sync failed.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div id="token-launcher-section" className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 max-w-2xl">
        <div className="gp-chip inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">Project launcher</div>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl">Launch on Grampad</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Configure your sale, deploy a dedicated IDO contract, and move through preparation, community voting, whitelist, sale, and distribution.
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Left Column: Form & Assist Box (8cols in Desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <section className="gp-panel rounded-[24px] p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-white">Recover deployed project</h2>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Use this when all on-chain deployment steps succeeded but the project was not
              saved to MongoDB. No blockchain transaction is sent.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-4 py-3 font-mono text-xs text-white placeholder:text-slate-600 focus:border-sky-400/45 focus:outline-none"
                value={recoveryAddress}
                onChange={event => setRecoveryAddress(event.target.value.trim())}
                placeholder="Existing IDO contract address EQ..."
              />
              <button
                type="button"
                onClick={loadRecoveryContract}
                disabled={recoveryLoading || !recoveryAddress || !wallet.connected}
                className="rounded-xl bg-[#0098EA] px-5 py-3 text-xs font-bold text-white disabled:opacity-40"
              >
                {recoveryLoading ? 'Checking...' : 'Load contract'}
              </button>
            </div>

            {recoveryDetails && (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                <p className="text-xs font-bold text-emerald-300">Deployment verified on-chain</p>
                <div className="mt-3 grid gap-2 text-[11px] text-slate-400 sm:grid-cols-2">
                  <span>Hard cap: {recoveryDetails.hardCap} USDT</span>
                  <span>Max buy: {recoveryDetails.maxBuy} USDT</span>
                  <span>Vesting: {recoveryDetails.vestingMonths} months</span>
                  <span>Sale tokens funded: yes</span>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-slate-400">
                  Enter the off-chain project details below, then sync.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    className="rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600"
                    value={recoveryMetadata.name}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, name: event.target.value }))}
                    placeholder="Project name"
                  />
                  <input
                    className="rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600"
                    value={recoveryMetadata.symbol}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, symbol: event.target.value }))}
                    placeholder="Token symbol"
                  />
                  <input
                    type="number"
                    min="0.000001"
                    step="any"
                    className="rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600"
                    value={recoveryMetadata.rate}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, rate: event.target.value }))}
                    placeholder="Tokens per 1 USDT"
                  />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600"
                    value={recoveryMetadata.totalSupply}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, totalSupply: event.target.value }))}
                    placeholder="Total token supply"
                  />
                  <input
                    type="number"
                    min="0"
                    max="18"
                    step="1"
                    className="rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600"
                    value={recoveryMetadata.decimals}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, decimals: event.target.value }))}
                    placeholder="Token decimals"
                  />
                  <input
                    type="number"
                    min="1"
                    max="365"
                    step="1"
                    className="rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600"
                    value={recoveryMetadata.durationDays}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, durationDays: event.target.value }))}
                    placeholder="Sale duration in days"
                  />
                  <input
                    className="rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600"
                    value={recoveryMetadata.logo}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, logo: event.target.value }))}
                    placeholder="Logo URL (optional)"
                  />
                  <input
                    className="rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 sm:col-span-2"
                    value={recoveryMetadata.banner}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, banner: event.target.value }))}
                    placeholder="Banner URL (optional)"
                  />
                  <textarea
                    className="min-h-24 rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 sm:col-span-2"
                    value={recoveryMetadata.description}
                    onChange={event => setRecoveryMetadata(current => ({ ...current, description: event.target.value }))}
                    placeholder="Project description"
                  />
                </div>
                <button
                  type="button"
                  onClick={syncRecoveredProject}
                  disabled={recoveryLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.12] px-5 py-3 text-sm font-bold text-emerald-300 disabled:opacity-40"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Sync recovered project to database
                </button>
              </div>
            )}
          </section>
          
          {/* A. AI Assistant Panel */}
          {/* <div className="rounded-3xl border border-[#0098EA]/30 bg-gradient-to-br from-[#0B1E38]/90 to-[#070E1B]/95 p-6 shadow-xl shadow-[#0098EA]/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-[#0098EA] animate-pulse" />
              <h3 className="font-bold text-lg text-white"> Smart AI Tokenomics Assistant</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mb-4">
              Describe your project theme idea (meme narrative, yield protocols, gaming mechanics) and our AI will engineer optimized Jetton parameters, names, symbols, caps, and rates instantly!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="E.g., A sleepy koala coin on TON with reward distribution mechanics."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#070B14]/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#0098EA] focus:outline-none focus:bg-[#070B14]"
                />
              </div>

 
              <div className="flex gap-2">
                <select
                  value={aiCategory}
                  onChange={(e: any) => setAiCategory(e.target.value)}
                  className="rounded-xl border border-[#1E2E4E]/60 bg-[#070B14]/80 px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-[#0098EA]"
                >
                  <option value="meme">Meme Coin</option>
                  <option value="defi">DeFi Protocol</option>
                  <option value="utility">Utility Token</option>
                </select>

                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={generatingAI || !aiPrompt.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0098EA] to-[#00D2FF] px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#0098EA]/20 hover:opacity-95 transition disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Engineering...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Assist
                    </>
                  )}
                </button>
              </div>
            </div>
          </div> */}

          {/* B. Official Token deployer form parameters */}
          <form 
            onSubmit={handleDeployProject}
            className={`gp-panel rounded-[24px] p-6 transition-all sm:p-8 ${
              aiGlow ? 'border-emerald-300/30 ring-1 ring-emerald-300/15' : ''
            } ${pendingDeployment ? 'pointer-events-none opacity-60' : ''}`}
          >
            <div className="mb-7 border-b border-white/[0.07] pb-5">
              <h3 className="text-xl font-extrabold tracking-tight text-white">Project configuration</h3>
              <p className="mt-1 text-xs text-slate-500">All deployment parameters are immutable once confirmed.</p>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400">
                {errorMsg}
              </div>
            )}

            {/* Grid wrapper for standard details */}
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* SECTION: Core Token Details */}
              <div className="sm:col-span-2 mb-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  Core Token Specifications
                </h4>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sale Token Jetton Master Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g., EQBxY3GSD_v0V6_YfHlO..."
                    value={jettonAddress}
                    onChange={(event) => {
                      setJettonAddress(event.target.value.trim());
                      setJettonMetadataError('');
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-[#1E2E4E]/65 bg-[#0B0F19]/50 px-4 py-2.5 font-mono text-sm text-[#0098EA] placeholder-slate-500 focus:border-[#0098EA] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={loadJettonMetadata}
                    disabled={jettonMetadataLoading || !jettonAddress}
                    className="flex min-w-28 items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {jettonMetadataLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {jettonMetadataLoading ? 'Loading' : 'Fetch details'}
                  </button>
                </div>
                {jettonMetadataError ? (
                  <p className="mt-2 text-xs font-medium text-rose-400">{jettonMetadataError}</p>
                ) : (
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    Fetches the token name, symbol, decimals, and total supply from the Jetton master.
                  </p>
                )}
              </div>

              {/* Token Name */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Token Name</label>
                <input
                  type="text"
                  placeholder="E.g., Durov Star"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#0098EA] focus:outline-none focus:bg-[#0B0F19]"
                  required
                />
              </div>

              {/* Ticker / Symbol */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Symbol Ticker</label>
                <input
                  type="text"
                  placeholder="E.g., STAR"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#0098EA] focus:outline-none focus:bg-[#0B0F19]"
                  required
                />
              </div>

              {/* Decimals */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Decimals (Jetton Standard)</label>
                <input
                  type="number"
                  value={decimals>0?decimals:""}
                  onChange={(e) => setDecimals(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                  min="0"
                  max="18"
                  required
                />
              </div>

              {/* Total Supply */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Total Supply</label>
                <input
                  type="number"
                  value={totalSupply>0?totalSupply:""}
                  onChange={(e) => setTotalSupply(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                  min="1"
                  required
                />
              </div>

              {/* SECTION: Launchpool Targets & Terms */}
              <div className="sm:col-span-2 border-t border-[#1E2E4E]/30 pt-6 mt-4">
                <h4 className="text-xs font-black text-[#0098EA] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0098EA]" />
                  Sale Targets & Terms
                </h4>
                <p className="text-[11px] text-slate-400 mb-4 font-sans leading-relaxed">
                  Configure the sale token, contribution limits, pricing, and monthly vesting schedule.
                </p>
              </div>

              {/* Presale Token Rate */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Presale rate (per 1 USDT)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={rate>0?rate:""}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm pr-20 text-white focus:border-[#0098EA] focus:outline-none"
                   
                    required
                  />
                  <span className="absolute top-3.5 right-4 text-xs font-bold font-mono text-[#0098EA] uppercase">
                    ${symbol || 'JETTON'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block font-semibold">
               Buyers will receive {rate.toLocaleString()} {symbol || 'JETTON'} tokens for every 1 USDT contributed, at a token price of {(1 / rate).toFixed(6)} USDT.
                </span>
              </div>

              {/* Duration deployment */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">IDO Sale Duration (Days)</label>
                <input
                  type="number"
                  value={durationDays>0?durationDays:""}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                  min="1"
                  max="365"
                  step="1"
                  required
                />
                <span className="mt-1 block text-[10px] text-slate-500">Supported sale duration: 1 to 365 days.</span>
              </div>

              {/* Soft Cap */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Soft Cap (USDT)</label>
                <input
                  type="number"
                  value={softCap>0?softCap:""}
                  onChange={(e) => setSoftCap(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                  min="1"
                  required
                />
              </div>

              {/* Hard Cap */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Hard Cap (USDT)</label>
                <input
                  type="number"
                  value={hardCap>0?hardCap:""}
                  onChange={(e) => setHardCap(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                  min="1"
                  required
                />
              </div>

              {/* Minimum Purchase */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Min Contribution Limit (USDT)</label>
                <input
                  type="number"
                  value={minBuy>0?minBuy:""}
                  onChange={(e) => setMinBuy(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                  min="1"
                  required
                />
              </div>

              {/* Maximum Purchase */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Max Contribution Limit (USDT)</label>
                <input
                  type="number"
                  value={maxBuy>0?maxBuy:""}
                  onChange={(e) => setMaxBuy(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                  min="1"
                  required
                />
              </div>

              {/* Vesting Setup */}
              <div className="gp-vesting-panel sm:col-span-2 rounded-2xl p-5">
                <div className="gp-vesting-header flex items-center gap-2 mb-3 border-b pb-2">
                  <Coins className="h-4 w-4 text-[#0098EA]" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Investor Vesting & Claim Setup</h4>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* TGE Percent */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">TGE Unlock Share</label>
                      <span className="text-xs font-bold text-[#0098EA] font-mono">{vestingTgePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={vestingTgePercent}
                      onChange={(e) => setVestingTgePercent(Number(e.target.value))}
                      className="gp-vesting-range w-full h-1.5 rounded-lg accent-[#0098EA] cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      The percentage of pre-purchased tokens unlocked instantly at Token Generation Event. (Remaining {100 - vestingTgePercent}% vests linearly).
                    </span>
                  </div>

                  {/* Vesting Months */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Linear Vesting Period (Months)</label>
                    <input
                      type="number"
                      value={vestingMonths > 0 ? vestingMonths : ""}
                      onChange={(e) => setVestingMonths(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                      min="0"
                      max="120"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      The remaining allocation unlocks in equal 30-day monthly periods. Set 0 only when TGE unlock is 100%.
                    </span>
                  </div>

                  {/* Cliff Duration Days */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Cliff Duration (Days, Optional)</label>
                    <input
                      type="number"
                      value={cliffDurationDays > 0 ? cliffDurationDays : ""}
                      onChange={(e) => setCliffDurationDays(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2 text-sm text-white focus:border-[#0098EA] focus:outline-none"
                      min="0"
                      max="3650"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Optional. Default 0 days. Linear vesting starts after this cliff; the smart contract stores it as seconds.
                    </span>
                  </div>
                </div>
              </div>

              {/* Logo Field (URL or Device Upload) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">
                    Logo Avatar (150x150 px, 1:1 Ratio)
                  </label>
                  <div className="flex rounded-lg bg-slate-950 p-0.5 border border-[#1E2E4E]/30 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setLogoSource('url'); clearLogo(); }}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-1 transition ${
                        logoSource === 'url' ? 'bg-[#0098EA] text-black font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Link className="h-2.5 w-2.5" />
                      URL Link
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLogoSource('upload'); clearLogo(); }}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-1 transition ${
                        logoSource === 'upload' ? 'bg-[#0098EA] text-black font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <UploadCloud className="h-2.5 w-2.5" />
                      Upload File
                    </button>
                  </div>
                </div>

                {logoSource === 'url' ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... (Square 150x150 width/height recommended)"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none focus:bg-[#0B0F19]"
                    />
                    <span className="text-[10px] text-slate-500 font-medium font-sans">Required dimensions: 150px width × 150px height (Square aspect ratio, max 1MB).</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={logoInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />
                    
                    {!logo ? (
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                        className="border-2 border-dashed border-[#1E2E4E]/80 hover:border-[#0098EA]/65 rounded-xl bg-[#0B0F19]/30 p-4 text-center cursor-pointer hover:bg-[#0B0F19]/50 transition duration-200"
                      >
                        <UploadCloud className="h-6 w-6 text-slate-500 mx-auto mb-1 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-300 block">Click or Drag & Drop</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">PNG, JPG, SVG, WEBP up to 1 MB (Square 150×150 px, 1:1 Aspect Ratio)</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-slate-300 font-sans">
                        <div className="flex items-center gap-2.5 truncate">
                          <img src={logo} alt="Logo preview" className="h-8 w-8 rounded-lg object-cover border border-emerald-500/20 shadow-md shrink-0" />
                          <div className="truncate text-left">
                            <p className="font-semibold text-white/90 truncate max-w-[120px] sm:max-w-none">{logoFileName || 'logo_image.png'}</p>
                            <p className="text-[9px] text-[#0098EA]">1:1 Aspect ratio validated safely</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearLogo}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {logoError && (
                      <p className="text-[10px] font-semibold text-rose-400 mt-1 leading-relaxed bg-rose-500/5 p-1 px-2 rounded border border-rose-500/10">
                        {logoError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Banner Field (URL or Device Upload) */}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">
                    Project Banner Header (1200x400 px, 3:1 Ratio)
                  </label>
                  <div className="flex rounded-lg bg-slate-950 p-0.5 border border-[#1E2E4E]/30 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setBannerSource('url'); clearBanner(); }}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-1 transition ${
                        bannerSource === 'url' ? 'bg-[#0098EA] text-black font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Link className="h-2.5 w-2.5" />
                      URL Link
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBannerSource('upload'); clearBanner(); }}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-1 transition ${
                        bannerSource === 'upload' ? 'bg-[#0098EA] text-black font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <UploadCloud className="h-2.5 w-2.5" />
                      Upload File
                    </button>
                  </div>
                </div>

                {bannerSource === 'url' ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... (Landscape 1200x400px recommended)"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none focus:bg-[#0B0F19]"
                    />
                    <span className="text-[10px] text-slate-500 font-medium font-sans">Required dimensions: 1200px width × 400px height (Landscape 3:1 aspect ratio, max 2MB).</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={bannerInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBannerUpload(file);
                      }}
                    />
                    
                    {!banner ? (
                      <div
                        onClick={() => bannerInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleBannerUpload(file);
                        }}
                        className="border-2 border-dashed border-[#1E2E4E]/80 hover:border-[#0098EA]/65 rounded-xl bg-[#0B0F19]/30 p-5 text-center cursor-pointer hover:bg-[#0B0F19]/50 transition duration-200"
                      >
                        <UploadCloud className="h-8 w-8 text-slate-500 mx-auto mb-1.5 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-300 block">Click or Drag & Drop</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">PNG, JPG, WEBP up to 2 MB (Landscape 1200×400 px, 3:1 Aspect Ratio)</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-slate-300 font-sans">
                        <div className="flex items-center gap-3 truncate">
                          <img src={banner} alt="Banner preview" className="h-10 w-20 rounded bg-slate-900 border border-emerald-500/20 object-cover shadow-md shrink-0" />
                          <div className="truncate text-left">
                            <p className="font-semibold text-white/90 truncate max-w-[150px] sm:max-w-none">{bannerFileName || 'banner_image.png'}</p>
                            <p className="text-[9px] text-[#0098EA]">3:1 Landscape aspect ratio validated safely</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearBanner}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {bannerError && (
                      <p className="text-[10px] font-semibold text-rose-400 mt-1 leading-relaxed bg-rose-500/5 p-1 px-2 rounded border border-rose-500/10">
                        {bannerError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Short Pitch description */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Launchpool Description Pitch</label>
                <textarea
                  placeholder="Explain token utility, roadmap milestones, lockup conditions, and community vesting rules..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[#1E2E4E]/60 bg-[#0B0F19]/40 px-4 py-2.5 text-sm text-white focus:border-[#0098EA] focus:outline-none focus:bg-[#0B0F19]"
                  required
                />
              </div>

              {/* Dynamic social links list manager */}
              <div className="sm:col-span-2 border-t border-[#1E2E4E]/40 pt-5 mt-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0098EA]">
                      Project Media & Social Links
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Add dynamic official contacts (Telegram, Twitter, Discord, Website, etc.) to display on your IDO list page.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black bg-[#0098EA] hover:bg-[#0098EA]/90 rounded-xl transition cursor-pointer"
                  >
                    + Add Link
                  </button>
                </div>

                {socialLinks.length === 0 ? (
                  <div className="text-center p-6 rounded-xl border border-[#1E2E4E]/40 bg-[#0B0F19]/20">
                    <span className="text-xs text-slate-400">No social media links added yet. Click "+ Add Link" to add one!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {socialLinks.map((link, idx) => {
                      const placeholder = 
                        link.platform === 'telegram' ? 'https://t.me/your_community' :
                        link.platform === 'twitter' ? 'https://twitter.com/your_handle' :
                        link.platform === 'website' ? 'https://yourproject.io' :
                        link.platform === 'discord' ? 'https://discord.gg/your_invite' :
                        link.platform === 'facebook' ? 'https://facebook.com/your_page' :
                        link.platform === 'instagram' ? 'https://instagram.com/your_brand' :
                        link.platform === 'github' ? 'https://github.com/your_repo' :
                        link.platform === 'reddit' ? 'https://reddit.com/r/your_subreddit' :
                        link.platform === 'whitepaper' ? 'https://yourwhitepaperlink.com' :
                        'https://your_platform.com/...';

                      return (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/20 p-3 rounded-xl border border-slate-800/40">
                          {/* Platform Selection */}
                          <div className="w-full sm:w-48 shrink-0">
                            <select
                              value={link.platform}
                              onChange={(e) => handleSocialLinkChange(idx, 'platform', e.target.value)}
                              className="w-full rounded-lg border border-[#1E2E4E]/60 bg-[#0B1220] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-[#0098EA] focus:outline-none"
                            >
                              {availablePlatforms.map((plat) => (
                                <option key={plat.value} value={plat.value} className="bg-[#0B0F19] text-white">
                                  {plat.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Link Input URL */}
                          <div className="w-full flex-1">
                            <input
                              type="url"
                              placeholder={placeholder}
                              value={link.url}
                              onChange={(e) => handleSocialLinkChange(idx, 'url', e.target.value)}
                              className="w-full rounded-lg border border-[#1E2E4E]/60 bg-[#0B0F19]/60 px-3 py-2 text-xs text-white focus:border-[#0098EA] focus:outline-none focus:bg-[#0B0F19]"
                            />
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSocialLink(idx)}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-850 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                            title="Remove channel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Submit button trigger */}
            <div className="mt-8 border-t border-[#1E2E4E]/40 pt-6">
              {wallet.connected ? (
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0098EA] to-cyan-400 py-3 text-sm font-bold text-white hover:opacity-95 active:scale-95 transition shadow-lg shadow-sky-500/15 cursor-pointer"
                >
                  Prepare IDO Deployment
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConnect}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#1E2E4E] bg-slate-900/60 py-3 text-sm font-semibold text-[#0098EA] hover:border-[#0098EA]/50 hover:bg-[#1E2E4E]/10 transition-all cursor-pointer"
                >
                  Connect TON Wallet to Deploy
                </button>
              )}
            </div>

          </form>

          {pendingDeployment && (
            <section className="gp-panel rounded-[24px] p-6 sm:p-8">
              <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-5">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-white">
                    IDO deployment steps
                  </h3>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    Complete each transaction separately. Failed steps can be retried without
                    generating another contract address.
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Pending IDO contract
                  </span>
                  <span className="mt-1 block break-all font-mono text-xs text-sky-300">
                    {pendingDeployment.contract.address.toString()}
                  </span>
                  <button
                    type="button"
                    onClick={refreshIdoDeploymentStatus}
                    disabled={deployStep !== 'idle'}
                    className="mt-3 rounded-lg border border-sky-400/20 bg-sky-400/[0.08] px-3 py-2 text-[11px] font-bold text-sky-300 transition hover:bg-sky-400/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Refresh deployment status
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <span className="text-slate-500">Hard cap encoded</span>
                    <span className="text-right font-mono text-white">
                      {pendingDeployment.encodedTokenomics.hardCap.toString()}
                    </span>
                    <span className="text-slate-500">Maximum buy encoded</span>
                    <span className="text-right font-mono text-white">
                      {pendingDeployment.encodedTokenomics.maxBuy.toString()}
                    </span>
                  </div>
                </div>
                {!deploymentProgress.deployed && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDeployment(null);
                      setDeploymentTxBoc('');
                      setDeploymentProgress({ deployed: false, configured: false, deposited: false });
                    }}
                    className="self-start text-xs font-bold text-slate-400 transition hover:text-white"
                  >
                    Edit parameters and prepare again
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  {
                    number: 1,
                    title: 'Deploy IDO contract',
                    complete: deploymentProgress.deployed,
                    disabled: deploymentProgress.deployed,
                    action: deployIdoContract,
                    button: 'Deploy contract',
                  },
                  {
                    number: 2,
                    title: 'Configure Jetton wallets',
                    complete: deploymentProgress.configured,
                    disabled: !deploymentProgress.deployed || deploymentProgress.configured,
                    action: configureIdoWallets,
                    button: 'Configure wallets',
                  },
                  {
                    number: 3,
                    title: 'Deposit required sale tokens',
                    complete: deploymentProgress.deposited,
                    disabled: !deploymentProgress.configured || deploymentProgress.deposited,
                    action: depositIdoTokens,
                    button: 'Deposit sale tokens',
                  },
                ].map(step => (
                  <div
                    key={step.number}
                    className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                        step.complete
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-sky-400/10 text-sky-300'
                      }`}>
                        {step.complete ? '✓' : step.number}
                      </span>
                      <div>
                        <strong className="block text-sm text-white">{step.title}</strong>
                        <span className="text-[11px] text-slate-500">
                          {step.complete ? 'Confirmed on-chain' : 'Waiting for your action'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={step.action}
                      disabled={step.disabled || deployStep !== 'idle'}
                      className="rounded-xl bg-[#0098EA] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {step.complete ? 'Completed' : step.button}
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={syncProjectToDatabase}
                  disabled={!deploymentProgress.deposited || deployStep !== 'idle'}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.09] px-5 py-3 text-sm font-bold text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Sync completed project to database
                </button>
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Live Jetton Preview Card (4cols in Desktop) */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold ml-1">Live Deployed Card Preview</span>
          
          <div className="gp-live-preview overflow-hidden rounded-2xl text-white">
            <div className="gp-live-preview-banner relative h-28 w-full bg-slate-800">
              <img
                src={projectAssetOrDefault(banner, DEFAULT_PROJECT_BANNER)}
                alt="Banner Preview"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="gp-live-preview-fade absolute inset-0" />
              <div className="absolute right-3 top-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Preview
                </span>
              </div>
            </div>

            <div className="relative p-5 flex flex-col">
              {/* Logo shift */}
              <div className="gp-live-preview-logo absolute -top-8 left-4 h-14 w-14 overflow-hidden rounded-xl border-2 bg-slate-900 shadow">
                <img
                  src={projectAssetOrDefault(logo, DEFAULT_PROJECT_LOGO)}
                  alt="Avatar Preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-7 font-sans">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-base truncate max-w-[140px]">
                    {name || 'My Jetton Title'}
                  </h4>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-400 border border-emerald-500/20">
                    ${symbol || 'TKN'}
                  </span>
                </div>

                <p className="mt-2 text-slate-400 text-[11px] line-clamp-2 leading-relaxed min-h-[33px]">
                  {description || 'Provide a compelling description of your project using the form on the left or the AI Risk Score engineering assistant above.'}
                </p>
              </div>

              {/* Dynamic stats */}
              <div className="gp-live-preview-divider mt-4 grid grid-cols-2 gap-3.5 border-t pt-4 text-[11px] font-sans">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Linear Vesting</span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block">{vestingMonths} months</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Total Supply</span>
                  <span className="font-semibold font-mono text-white mt-0.5 block">{totalSupply.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Rate (1 USDT)</span>
                  <span className="font-semibold font-mono text-emerald-400 mt-0.5 block">
                    {rate.toLocaleString()} ${symbol || 'TKN'}
                  </span>
                </div>
              </div>

              {/* Target lines */}
              <div className="gp-live-preview-targets mt-4 p-3 rounded-xl flex justify-between items-center text-[10px] text-slate-450 font-sans font-semibold">
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Soft Cap</span>
                  <span className="font-extrabold text-white font-mono">${softCap.toLocaleString()}</span>
                </div>
                <div className="gp-live-preview-separator h-5 w-px" />
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Hard Cap</span>
                  <span className="font-extrabold text-white font-mono">${hardCap.toLocaleString()}</span>
                </div>
                <div className="gp-live-preview-separator h-5 w-px" />
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Limits</span>
                  <span className="font-extrabold text-white font-mono">${minBuy}-${maxBuy}</span>
                </div>
              </div>

              <div className="gp-live-preview-divider mt-4 flex items-center justify-between text-[10px] text-slate-500 border-t pt-3">
                <span className="flex items-center gap-1 font-semibold">
                  <Info className="h-3 w-3" />
                  Starts in 1. Voting Stage
                </span>
                <span className="font-bold">V1.0.0</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Broadcasting blockchain transaction overlay states */}
      <AnimatePresence>
        {deployStep !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D1A]/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-[#1E2E4E]/80 bg-[#121B2E] p-6 text-center text-white shadow-2xl"
            >
              {deployStep === 'signing' && (
                <div className="flex flex-col items-center py-8">
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center flex-col">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#0098EA] animate-spin" />
                    <Coins className="h-6 w-6 text-[#0098EA] animate-pulse" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Request Wallet Signature</h4>
                  <p className="text-xs text-slate-400">
                    Confirm the contract deployment first. After it is active, your wallet will request one more confirmation to configure and fund the IDO.
                  </p>
                </div>
              )}

              {deployStep === 'broadcasting' && (
                <div className="flex flex-col items-center py-8">
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center flex-col">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 animate-spin" />
                    <Smartphone className="h-6 w-6 text-emerald-400 animate-bounce" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Broadcasting Block Transactions</h4>
                  <p className="text-xs text-slate-400">
                    {broadcastStage === 'deployment'
                      ? 'Waiting for TON to confirm the contract deployment.'
                      : broadcastStage === 'setup'
                        ? 'Waiting for TON to confirm the IDO Jetton-wallet configuration.'
                        : 'Waiting for TON to confirm the sale-token deposit.'}
                  </p>
                </div>
              )}

              {deployStep === 'complete' && (
                <div className="flex flex-col items-center py-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-8 w-8 animate-bounce text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-1">Jetton IDO Seeded!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Congratulations! Your IDO project is now officially deployed and has entered stage 1: Voting. Community members can vote before preparation begins.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
