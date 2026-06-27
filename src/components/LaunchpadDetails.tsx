import { useState, FormEvent, useEffect } from 'react';
import {
  ArrowLeft, Loader2, Coins, Globe, Send, Twitter, ShieldCheck, ShieldAlert,
  Users, Calendar, AlertCircle, Sparkles, CheckCircle2, ChevronRight, ThumbsUp, ThumbsDown, Vote, ClipboardCheck,
  Copy, Check, ExternalLink, RefreshCw, Shield, Award, HelpCircle,
  Facebook, Instagram, Github, MessageSquare, BookOpen,
  CookingPot,
  CoinsIcon,
  CheckSquare,
  CookingPotIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { CHAIN } from '@tonconnect/protocol';
import { LaunchpadProject, WalletState, AIAudit } from '../types.js';
import { Address, beginCell, toNano } from "@ton/core";
import { JettonMaster, JettonWallet } from "@ton/ton";
import { parseContractGetterAddress } from '../../contracts/runtimeAddress.js';
import { DEFAULT_PROJECT_BANNER, DEFAULT_PROJECT_LOGO, projectAssetOrDefault } from '../constants/assets.js';
import {
  buildAdvanceStagePayload,
  buildClaimPayload,
  buildRefundPayload,
  buildVotePayload,
  getIdoContract,
  getTonClient,
  getUserContribution,
  getUserHasVoted,
  getUserVote,
  MAINNET_USDT_MASTER,
  parseUSDTAmount,
  waitForContract,
} from '../ton/gramStarter.js';
import { getUserGramxBalance, GRAMX_DECIMALS } from '../ton/staking.js';

// Must exceed the forwarded TON below, otherwise the sender's Jetton wallet
// rejects the transfer before the IDO contract receives it.
const USDT_TRANSFER_GAS = "0.15";
const USDT_FORWARD_TON = "0.01";

interface LaunchpadDetailsProps {
  project: LaunchpadProject;
  wallet: WalletState;
  onBack: () => void;
  onOpenConnect: () => void;
  onOpenSwap?: () => void;
  onContributeSuccess: () => void;
  onStageAdvance?: () => void;
  onProjectUpdate?: () => void;
}

export default function LaunchpadDetails({
  project: initialProject,
  wallet,
  onBack,
  onOpenConnect,
  onOpenSwap,
  onContributeSuccess,
  onStageAdvance,
  onProjectUpdate
}: LaunchpadDetailsProps) {
  const [tonConnectUI] = useTonConnectUI();
  const tonNetwork = String((import.meta as any).env.VITE_TONCENTER_ENDPOINT || '')
    .includes('testnet')
    ? CHAIN.TESTNET
    : CHAIN.MAINNET;
  const [project, setProject] = useState<LaunchpadProject>(initialProject);
  const [activeTab, setActiveTab] = useState<'info' | 'audit' | 'contributions'>('info');
  const [contAmount, setContAmount] = useState<string>('');
  const [txStep, setTxStep] = useState<'idle' | 'wallet_sign' | 'confirming' | 'complete'>('idle');
  const [actionLoading, setActionLoading] = useState(false);
  const [userVoted, setUserVoted] = useState<boolean>(false);
  const [userWhitelisted, setUserWhitelisted] = useState<boolean>(false);

  // Custom AI Audit live auditing states
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AIAudit | null>(project.aiAudit || null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Feedback copy state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Live ticking countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timeDifference, setTimeDifference] = useState<number>(0)

  // Vesting claim states
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimSnapshot, setClaimSnapshot] = useState<{
    distributionStartedAt: number;
    vestedAmount: number;
    claimableAmount: number;
    claimedAmount: number;
    loading: boolean;
  }>({
    distributionStartedAt: 0,
    vestedAmount: 0,
    claimableAmount: 0,
    claimedAmount: 0,
    loading: false,
  });
  const [claimNowMs, setClaimNowMs] = useState(Date.now());
  const [gramxBalance, setGramxBalance] = useState<bigint>(0n);
  const [gramxBalanceLoading, setGramxBalanceLoading] = useState(false);
  const [voteGramxChecked, setVoteGramxChecked] = useState(false);
  const [voteSyncLoading, setVoteSyncLoading] = useState(false);

  // Creator advanced phase selector state
  const [showAdvanceModal, setShowAdvanceModal] = useState<boolean>(false);
  const [selectedNextPhaseDate, setSelectedNextPhaseDate] = useState<string>('');
  const [isConfirmingStage, setIsConfirmingStage] = useState<boolean>(false);
  const [confirmationChecked, setConfirmationChecked] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
     
      const countdownTarget =
        project.idoStage === 'upcoming'
          ? project.startTime
          : project.nextPhaseTime;
         
      if (countdownTarget) {
        const diff = countdownTarget - Date.now();

        setTimeDifference(diff);
        if (diff > 0) {
          const totalSecs = Math.floor(diff / 1000);
          const d = Math.floor(totalSecs / (3600 * 24));
          const h = Math.floor((totalSecs % (3600 * 24)) / 3600);
          const m = Math.floor((totalSecs % 3600) / 60);
          const s = totalSecs % 60;

          setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTime();
    
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [project.idoStage, project.nextPhaseTime, project.startTime]);

  useEffect(() => {
    const interval = window.setInterval(() => setClaimNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const refreshClaimSnapshot = async () => {
    if (!wallet.connected || !wallet.address || !project.idoContractAddress || project.idoStage !== 'distribution') {
      setClaimSnapshot(current => ({
        ...current,
        distributionStartedAt: 0,
        vestedAmount: 0,
        claimableAmount: 0,
        claimedAmount: 0,
        loading: false,
      }));
      return;
    }

    setClaimSnapshot(current => ({ ...current, loading: true }));
    try {
      const contributor = parseContractGetterAddress(wallet.address);
      const opened = getTonClient().open(getIdoContract(project.idoContractAddress));
      const [distributionStartedAt, vestedBase, claimableBase, claimedBase] = await Promise.all([
        opened.getGetDistributionStartedAt(),
        opened.getGetUserVestedAllocation(contributor),
        opened.getGetUserClaimableAllocation(contributor),
        opened.getGetUserClaimedAllocation(contributor),
      ]);
      const unit = 10 ** project.decimals;
      setClaimSnapshot({
        distributionStartedAt: Number(distributionStartedAt),
        vestedAmount: Number(vestedBase) / unit,
        claimableAmount: Number(claimableBase) / unit,
        claimedAmount: Number(claimedBase) / unit,
        loading: false,
      });
    } catch (error) {
      setClaimSnapshot(current => ({ ...current, loading: false }));
    }
  };

  useEffect(() => {
    refreshClaimSnapshot();
  }, [wallet.address, wallet.connected, project.id, project.idoStage, project.idoContractAddress]);

  const getNextStageInfo = (currentStage: string) => {
    switch (currentStage) {
      case 'vote':
        return {
          title: 'Preparation',
          desc: ' Vote to decide whether GRAMX should do this IDO or not by our community/GRAMX holder. IDO will only be Live if upvotes are greater than downvotes.',
          actionTab: 'info' as const
        };
      case 'upcoming':
        return {
          title: 'Vote',
          desc: 'This project is scheduled but not yet open for community voting. When the upcoming phase ends, voting begins first.',
          actionTab: 'info' as const
        };
      case 'preparation':
        return {
          title: 'Whitelist',
          desc: 'Project preparation is in progress. The Whitelist will automatically begin when the countdown ends.',

          actionTab: 'audit' as const
        };
      case 'whitelist':
        return {
          title: 'Sale',
          desc: 'Whitelist registration is now open. Join the whitelist to secure eligibility for token allocation and participation in sale.',
          actionTab: 'info' as const
        };
      case 'sale':
        return {
          title: 'Token/Refund',
          desc: 'The sale closes and monthly token vesting becomes available to verified contributors.',
          actionTab: 'contributions' as const
        };
      case 'distribution':
      default:
        return {
          title: 'Distribution Complete',
          desc: 'Contributors can claim vested allocations according to the on-chain monthly schedule.',
          actionTab: 'info' as const
        };
    }
  };

  const nextInfo = getNextStageInfo(project.idoStage);

  // Sync state if initial project changes
  useEffect(() => {
    setProject(initialProject);
    setAuditResult(initialProject.aiAudit || null);
  }, [initialProject]);

  // Refresh current project from API on demand
  const reloadProject = async () => {
    try {
      const url = wallet.connected && wallet.address
        ? `/api/projects?address=${encodeURIComponent(wallet.address)}`
        : `/api/projects`;
      const res = await fetch(url);
      const payload = await res.json();
      const list: LaunchpadProject[] = Array.isArray(payload) ? payload : payload.projects || [];
      const match = list.find(p => p.id === project.id);
      if (match) {
        setProject(match);
        setAuditResult(match.aiAudit || null);
        setUserVoted(!!match.userVoted);
        if (onProjectUpdate) {
          onProjectUpdate();
        }
      }
    } catch (e) {
      console.error('Failed to reload project stats:', e);
    }
  };

  useEffect(() => {
    if (wallet.connected && wallet.address) {
      reloadProject();
    }
  }, [wallet.address, wallet.connected, project.id]);

  // Math helper
  const raisedPercent = project.hardCap > 0
    ? Math.min(100, (project.raised / project.hardCap) * 100)
    : 0;
  const softPercent = project.hardCap > 0
    ? Math.min(100, (project.softCap / project.hardCap) * 100)
    : 0;
  const estTokens = Number(contAmount) ? Number(contAmount) * project.rate : 0;

  // Determine user participation
  const normalizeTonAddress = (value: string) => {
    try {
      return Address.parse(value).toString();
    } catch {
      return value.trim().toLowerCase();
    }
  };

  const sameTonAddress = (left: string, right: string) => {
    return normalizeTonAddress(left) === normalizeTonAddress(right);
  };

  const aggregatedContributions = Array.from(
    project.contributions.reduce((entries, contribution) => {
      const key = normalizeTonAddress(contribution.contributor);
      const existing = entries.get(key);

      if (existing) {
        existing.usdtAmount += contribution.usdtAmount;
        existing.tokenAmount += contribution.tokenAmount;
        existing.timestamp = Math.max(existing.timestamp, contribution.timestamp);
        existing.claimedAmount = (existing.claimedAmount || 0) + (contribution.claimedAmount || 0);
        existing.refunded = !!existing.refunded && !!contribution.refunded;
        return entries;
      }

      entries.set(key, { ...contribution });
      return entries;
    }, new Map<string, typeof project.contributions[number]>()).values()
  );

  const userContributions = wallet.connected && wallet.address
    ? aggregatedContributions.filter(c => sameTonAddress(c.contributor, wallet.address!))
    : [];
  const userContribution = userContributions.length > 0
    ? userContributions.reduce((total, contribution) => ({
      contributor: contribution.contributor,
      usdtAmount: total.usdtAmount + contribution.usdtAmount,
      tokenAmount: total.tokenAmount + contribution.tokenAmount,
      timestamp: Math.max(total.timestamp, contribution.timestamp),
      claimedAmount: (total.claimedAmount || 0) + (contribution.claimedAmount || 0),
      refunded: total.refunded && !!contribution.refunded,
    }), {
      contributor: wallet.address || '',
      usdtAmount: 0,
      tokenAmount: 0,
      timestamp: 0,
      claimedAmount: 0,
      refunded: true,
    })
    : null;

  const isCreator = wallet.connected && wallet.address && project.creator
    ? project.creator.toLowerCase() === wallet.address.toLowerCase()
    : false;
  const voteIsPending =
    wallet.connected &&
    wallet.address &&
    project.userVoteProgress === 'pending' &&
    !project.userVoted &&
    !userVoted;

  // Fetch initial status on mount
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      // Check if user voted or whitelisted in this local session
      setUserVoted(
        !!project.userVoted ||
        localStorage.getItem(`voted_${project.id}_${wallet.address}`) === 'true'
      );
      setUserWhitelisted(
        project.isUserWhitelisted === true ||
        localStorage.getItem(`whitelisted_${project.id}_${wallet.address}`) === 'true'
      );
    }
  }, [wallet.address, wallet.connected, project.id, project.isUserWhitelisted, project.userVoted]);

  // Handle Clipboard Copy
  const handleCopy = async (
    text: string,
    label: string,
    event?: { preventDefault: () => void; stopPropagation: () => void }
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };

  // Trigger Live Audit using server-side Ai
  const handleTriggerAIAudit = async () => {
    setAuditing(true);
    setAuditError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/ai-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAuditResult(data);
      await reloadProject();
    } catch (err: any) {
      console.error(err);
      setAuditError('AI contract audit failed to execute: ' + err.message);
    } finally {
      setAuditing(false);
    }
  };

  // Vote handler
  const handleVote = async (type: 'up' | 'down') => {
    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      return;
    }

    setActionLoading(true);
    setAuditError(null);
    setVoteGramxChecked(false);
    try {
      setGramxBalanceLoading(true);
      const nextBalance = await getUserGramxBalance(wallet.address);
      setGramxBalance(nextBalance);
      setVoteGramxChecked(true);

      if (nextBalance < 10n ** BigInt(GRAMX_DECIMALS)) {
        throw new Error('At least 1 GRAMX is required to vote on GramPad.');
      }

      if (!project.idoContractAddress) {
        throw new Error('This project does not have a deployed IDO contract.');
      }

      const idoContract = getIdoContract(project.idoContractAddress);
      const alreadyVoted = await getUserHasVoted(
        project.idoContractAddress,
        wallet.address
      );
      let confirmedVoteType = type;
      let txHash = 'on-chain-vote-sync';

      if (alreadyVoted) {
        confirmedVoteType = (await getUserVote(
          project.idoContractAddress,
          wallet.address
        )) ? 'up' : 'down';
      } else {
        const result = await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 360,
          messages: [
            {
              address: project.idoContractAddress,
              amount: toNano('0.1').toString(),
              payload: buildVotePayload(type === 'up'),
            }
          ]
        });
        txHash = result.boc;
        const pendingRes = await fetch(`/api/projects/${project.id}/vote-progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voteType: type,
            txHash,
            voterAddress: wallet.address,
          }),
        });
        const pendingData = await pendingRes.json();
        if (pendingRes.ok && pendingData.project) {
          setProject(pendingData.project);
        }
        await waitForContract(
          idoContract,
          () => getUserHasVoted(project.idoContractAddress!, wallet.address!)
        );
      }

      const res = await fetch(`/api/projects/${project.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteType: confirmedVoteType,
          txHash,
          voterAddress: wallet.address,
        })
      });
      const data = await res.json();
      if (res.status !== 200) throw new Error(data.error || 'Failed to register community vote.');

      localStorage.setItem(`voted_${project.id}_${wallet.address}`, 'true');
      setUserVoted(true);
      await reloadProject();
    } catch (err: any) {
      setAuditError(err.message || 'Transaction rejected by user or failed.');
    } finally {
      setGramxBalanceLoading(false);
      setActionLoading(false);
    }
  };

  const handleRefreshVoteStatus = async () => {
    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      return;
    }

    setVoteSyncLoading(true);
    setAuditError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/vote/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterAddress: wallet.address }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refresh vote status.');
      }
      if (data.project) {
        setProject(data.project);
        setAuditResult(data.project.aiAudit || null);
      }
      if (data.confirmed) {
        localStorage.setItem(`voted_${project.id}_${wallet.address}`, 'true');
        setUserVoted(true);
        await reloadProject();
      } else {
        localStorage.removeItem(`voted_${project.id}_${wallet.address}`);
        setUserVoted(false);
        setAuditError('No confirmed vote was found on-chain yet. You can submit the vote again, or refresh once more if the wallet transaction is still confirming.');
      }
    } catch (err: any) {
      setAuditError(err.message || 'Failed to refresh vote status.');
    } finally {
      setVoteSyncLoading(false);
    }
  };

  // Whitelist join handler
  const handleJoinWhitelist = async () => {
    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      return;
    }

    setActionLoading(true);
    setAuditError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join the project whitelist.');
      }

      localStorage.setItem(`whitelisted_${project.id}_${wallet.address}`, 'true');
      setUserWhitelisted(true);
      await reloadProject();
    } catch (err: any) {
      setAuditError(err.message || 'Failed to join the project whitelist.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAdvanceStageModal = () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    tomorrow.setMilliseconds(0);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

    setSelectedNextPhaseDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    setIsConfirmingStage(false);
    setConfirmationChecked(false);
    setShowAdvanceModal(true);
  };

  const handleConfirmAdvanceStage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedNextPhaseDate) {
      alert("Please select a valid date & time for the next phase commencement.");
      return;
    }

    if (!isConfirmingStage) {
      setIsConfirmingStage(true);
      return;
    }

    if (!confirmationChecked) {
      alert("Please tick the confirmation checkbox to verify that this action is irreversible on TON Mainnet.");
      return;
    }

    const nextStageByCurrent: Partial<Record<LaunchpadProject['idoStage'], LaunchpadProject['idoStage']>> = {
      upcoming: 'vote',
      vote: 'preparation',
      preparation: 'whitelist',
      whitelist: 'sale',
      sale: 'distribution',
    };
    const nextStage = nextStageByCurrent[project.idoStage] || null;
    if (!nextStage) {
      alert("This project is already in the final 'distribution' phase and cannot be advanced further.");
      return;
    }

    setAuditError(null);
    setActionLoading(true);
    setShowAdvanceModal(false);

    try {
      if (!project.idoContractAddress) {
        throw new Error('This project does not have a deployed IDO contract.');
      }

      const idoContract = getIdoContract(project.idoContractAddress);
      const nextPhaseTimestamp = Date.parse(selectedNextPhaseDate);
      const openedIdo = getTonClient().open(idoContract);
      let confirmedStage = Number(await openedIdo.getGetIdoState());
      let txHash = 'db-stage-transition';
      const targetContractStage =
        project.idoStage === 'whitelist' ? 3 :
          project.idoStage === 'sale' ? 4 :
            null;

      if (targetContractStage !== null && !(
        confirmedStage === targetContractStage ||
        (targetContractStage === 4 && confirmedStage === 5)
      )) {
        const result = await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 360,
          messages: [{
            address: project.idoContractAddress,
            amount: toNano('0.15').toString(),
            payload: buildAdvanceStagePayload(targetContractStage as 3 | 4),
          }],
        });
        txHash = result.boc;

        await waitForContract(idoContract, async opened => {
          confirmedStage = Number(await opened.getGetIdoState());
          return confirmedStage === targetContractStage ||
            (targetContractStage === 4 && confirmedStage === 5);
        });
      }

      const confirmedUiStage =
        confirmedStage === 5 ? 'distribution' : nextStage;

      const res = await fetch(`/api/projects/${project.id}/advance-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: confirmedUiStage,
          nextPhaseTime: nextPhaseTimestamp,
          contractStage: confirmedStage,
          txHash,
          adminAddress: wallet.address,
        })
      });
      const data = await res.json();
      if (res.status !== 200) throw new Error(data.error || 'Failed to advance campaign stage.');

      await reloadProject();
      if (onStageAdvance) {
        onStageAdvance();
      }
    } catch (err: any) {
      setAuditError(err.message);
    } finally {
      setActionLoading(false);
      setIsConfirmingStage(false);
      setConfirmationChecked(false);
    }
  };

  const handleClaimTokens = async () => {
    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      return;
    }

    setClaimError(null);
    setClaimSuccess(null);
    setClaimLoading(true);

    try {
      if (!project.idoContractAddress) {
        throw new Error('This project does not have a deployed IDO contract.');
      }

      const contributor = parseContractGetterAddress(wallet.address);
      const idoContract = getIdoContract(project.idoContractAddress);
      const opened = getTonClient().open(idoContract);
      const claimedBefore = await opened.getGetUserClaimedAllocation(contributor);
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: project.idoContractAddress,
            amount: toNano('0.18').toString(),
            payload: buildClaimPayload(),
          }
        ]
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      const txHash = result.boc;
      let totalClaimedBase = claimedBefore;
      await waitForContract(idoContract, async contract => {
        totalClaimedBase = await contract.getGetUserClaimedAllocation(contributor);
        return totalClaimedBase > claimedBefore;
      });
      const unit = 10 ** project.decimals;
      const claimedNow = Number(totalClaimedBase - claimedBefore) / unit;
      const totalClaimed = Number(totalClaimedBase) / unit;

      const res = await fetch(`/api/projects/${project.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor: wallet.address,
          claimedNow,
          totalClaimed,
          claimedNowBase: (totalClaimedBase - claimedBefore).toString(),
          totalClaimedBase: totalClaimedBase.toString(),
          txHash,
        })
      });
      const data = await res.json();
      if (res.status !== 200) throw new Error(data.error || 'Claiming failed.');

      if (data.project) {
        setProject(data.project);
        setAuditResult(data.project.aiAudit || null);
      } else {
        setProject(current => {
          let updatedFirstMatchingContribution = false;
          return {
            ...current,
            contributions: current.contributions.map(contribution => {
              if (!sameTonAddress(contribution.contributor, wallet.address!)) {
                return contribution;
              }

              if (updatedFirstMatchingContribution) {
                return { ...contribution, claimedAmount: 0 };
              }

              updatedFirstMatchingContribution = true;
              return { ...contribution, claimedAmount: Number(data.totalClaimed || totalClaimed) };
            }),
          };
        });
      }
      setClaimSuccess(`Successfully claimed ${data.claimedNow.toLocaleString()} ${project.symbol}! (Cumulative claimed: ${data.totalClaimed.toLocaleString()}). Transaction reference: ${txHash.slice(0, 10)}...`);
      setClaimSnapshot(current => ({
        ...current,
        claimableAmount: 0,
        claimedAmount: Number(data.totalClaimed || totalClaimed),
      }));
      refreshClaimSnapshot();
      reloadProject();
      onContributeSuccess(); // refresh parent and show top-level success toast
    } catch (err: any) {
      setClaimError(err.message || 'Transaction rejected by user or failed.');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      return;
    }

    setClaimError(null);
    setClaimSuccess(null);
    setClaimLoading(true);

    try {
      if (!project.idoContractAddress) {
        throw new Error('This project does not have a deployed IDO contract.');
      }

      const contributor = parseContractGetterAddress(wallet.address);
      const idoContract = getIdoContract(project.idoContractAddress);
      const client = getTonClient();
      const openedIdo = client.open(idoContract);
      const [
        stage,
        contributionBefore,
        alreadyRefunded,
        chainRaised,
        chainSoftCap,
        walletsConfigured,
        idoUsdtWalletAddress,
      ] = await Promise.all([
        openedIdo.getGetIdoState(),
        openedIdo.getGetUserContribution(contributor),
        openedIdo.getGetUserRefunded(contributor),
        openedIdo.getGetRaisedCapital(),
        openedIdo.getGetSoftCap(),
        openedIdo.getGetJettonWalletsConfigured(),
        openedIdo.getGetUsdtJettonWallet(),
      ]);

      if (!walletsConfigured) {
        throw new Error('The IDO USDT Jetton wallet is not configured.');
      }
      if (alreadyRefunded) {
        if (contributionBefore !== 0n) {
          throw new Error('The refund state is inconsistent on-chain. Please contact support.');
        }

        const recoveryResponse = await fetch(`/api/projects/${project.id}/refund`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contributor: wallet.address,
            txHash: `onchain-refund-recovery:${project.idoContractAddress}`,
          }),
        });
        const recoveryData = await recoveryResponse.json();
        if (!recoveryResponse.ok) {
          throw new Error(recoveryData.error || 'Could not synchronize the confirmed refund.');
        }

        const recoveredAmount = recoveryData.refundedAmount || 0;
        setClaimSuccess(
          `Your ${recoveredAmount.toLocaleString()} USDT refund was already completed on-chain. The project record is now synchronized.`
        );
        await reloadProject();
        onContributeSuccess();
        return;
      }
      if (contributionBefore <= 0n) {
        throw new Error('The IDO contract has no refundable USDT contribution for this wallet.');
      }
      if (stage !== 5n && !(stage === 4n && chainRaised < chainSoftCap)) {
        throw new Error(`Refund is not available in contract stage ${stage.toString()}.`);
      }

      const idoUsdtWalletState = await client.getContractState(idoUsdtWalletAddress);
      if (idoUsdtWalletState.state !== 'active') {
        throw new Error(
          `The configured IDO USDT Jetton wallet ${idoUsdtWalletAddress.toString()} is not active.`
        );
      }
      const idoUsdtBalance = await client
        .open(JettonWallet.create(idoUsdtWalletAddress))
        .getBalance();
      if (idoUsdtBalance < contributionBefore) {
        const decimals = Number(await openedIdo.getGetUsdtDecimals());
        const unit = 10 ** decimals;
        throw new Error(
          `The IDO USDT wallet does not contain enough USDT for this refund. ` +
          `Required ${Number(contributionBefore) / unit} USDT, available ${Number(idoUsdtBalance) / unit} USDT.`
        );
      }

      const idoTonState = await client.getContractState(Address.parse(project.idoContractAddress));
      if (idoTonState.balance < toNano('0.1')) {
        throw new Error('The IDO contract TON reserve is below 0.1 TON and must be funded before refunding.');
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        network: tonNetwork,
        messages: [
          {
            address: project.idoContractAddress,
            // The IDO forwards 0.12 TON to its Jetton wallet. Keep enough
            // headroom for compute, storage, action and response-message fees.
            amount: toNano('0.35').toString(),
            payload: buildRefundPayload(),
          }
        ]
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      const txHash = result.boc;
      await waitForContract(idoContract, async opened => {
        const [refunded, remainingContribution] = await Promise.all([
          opened.getGetUserRefunded(contributor),
          opened.getGetUserContribution(contributor),
        ]);
        return refunded && remainingContribution === 0n;
      }, 90_000, 'The refund transaction was not confirmed. It may have failed or the USDT Jetton transfer may have bounced.');

      // A bounced outgoing Jetton transfer restores the contribution. Give the
      // response path time to settle before recording the refund in the DB.
      await new Promise(resolve => setTimeout(resolve, 6_000));
      const [refundStillConfirmed, contributionAfter] = await Promise.all([
        openedIdo.getGetUserRefunded(contributor),
        openedIdo.getGetUserContribution(contributor),
      ]);
      if (!refundStillConfirmed || contributionAfter !== 0n) {
        throw new Error(
          'The IDO accepted the refund request, but its outgoing USDT transfer bounced. Check the configured IDO USDT Jetton wallet and its USDT balance.'
        );
      }

      const res = await fetch(`/api/projects/${project.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor: wallet.address,
          txHash
        })
      });
      const data = await res.json();
      if (res.status !== 200) throw new Error(data.error || 'Refund failed.');

      const refundVal = data.refundedAmount || 0;

      // Save a refund record in transactions
      const transactions = JSON.parse(localStorage.getItem('ton_launchpad_txs') || '[]');
      const newTx = {
        id: `tx-refund-${Math.random().toString(36).slice(2)}`,
        type: 'refund', // claim refund type
        projectId: project.id,
        projectName: project.name,
        usdtAmount: refundVal,
        tokenAmount: 0,
        tokenSymbol: 'USDT Refunded',
        timestamp: Date.now(),
        txHash: txHash
      };
      transactions.unshift(newTx);
      localStorage.setItem('ton_launchpad_txs', JSON.stringify(transactions));

      setClaimSuccess(`Successfully claimed 100% refund of ${refundVal.toLocaleString()} USDT back to your wallet! Transaction hash: ${txHash.slice(0, 10)}...`);

      await reloadProject();
      onContributeSuccess(); // Trigger parent fetch & toast notifications
    } catch (err: any) {
      setClaimError(err.message || 'Transaction rejected by user or failed.');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleContribute = async (e: FormEvent) => {
    e.preventDefault();
    setAuditError(null);

    const amt = Number(contAmount);
    if (!amt || isNaN(amt)) return;

    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      return;
    }

    if (amt < project.minBuy || amt > project.maxBuy) {
      setAuditError(`Contribution must be between ${project.minBuy} and ${project.maxBuy} USDT.`);
      return;
    }

    if (project.raised + amt > project.hardCap) {
      setAuditError(`Exceeds IDO hardcap allocation. Maximum remaining allocation is ${project.hardCap - project.raised} USDT.`);
      return;
    }
    if (!project.isUserWhitelisted) {
      setAuditError('Your connected wallet is not registered in this project whitelist.');
      return;
    }

    // Begin real TonConnect live signing on TON Mainnet
    setTxStep('wallet_sign');
    try {
      if (!project.idoContractAddress) {
        throw new Error('This project does not have a deployed IDO contract.');
      }

      const client = getTonClient();
      const userAddress = Address.parse(wallet.address);
      const recipientAddress = Address.parse(project.idoContractAddress);
      const idoContract = getIdoContract(project.idoContractAddress);
      const openedIdo = client.open(idoContract);
      const contractUsdtDecimals = Number(await openedIdo.getGetUsdtDecimals());
      const configuredUsdtDecimals = Number(
        (import.meta as any).env.VITE_TON_USDT_DECIMALS || 6
      );
      if (contractUsdtDecimals !== configuredUsdtDecimals) {
        throw new Error(
          `This project was deployed for ${contractUsdtDecimals}-decimal USDT, but the configured testnet USDT uses ${configuredUsdtDecimals} decimals. Redeploy this project before accepting contributions.`
        );
      }
      const contributionBefore = await getUserContribution(
        project.idoContractAddress,
        wallet.address
      );
      const TON_USDT_MASTER =
        (import.meta as any).env.VITE_TON_USDT_MASTER || MAINNET_USDT_MASTER;

      const usdtMaster = client.open(JettonMaster.create(Address.parse(TON_USDT_MASTER)));
      let userUsdtWallet: Address;

      try {
        userUsdtWallet = await usdtMaster.getWalletAddress(userAddress);
      } catch (error) {
        console.error('Invalid or unavailable USDT jetton master:', error);
        throw new Error(
          'The configured TON USDT contract is invalid or unavailable. Please restart the app after updating VITE_TON_USDT_MASTER.'
        );
      }
      const amountInUSDT = parseUSDTAmount(contAmount, contractUsdtDecimals);
      const openedUserUsdtWallet = client.open(JettonWallet.create(userUsdtWallet));
      const userBalance = await openedUserUsdtWallet.getBalance();

      if (userBalance < amountInUSDT) {
        throw new Error(
          `Insufficient USDT balance. This contribution requires ${contAmount} USDT.`
        );
      }

      const jettonTransferPayload = beginCell()
        .storeUint(0xf8a7ea5, 32)
        .storeUint(Date.now(), 64)
        .storeCoins(amountInUSDT)
        .storeAddress(recipientAddress)
        .storeAddress(userAddress)
        .storeBit(0)
        .storeCoins(toNano(USDT_FORWARD_TON))
        .storeBit(0)
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            // This is TON attached for gas. The USDT amount is encoded in the payload above.
            address: userUsdtWallet.toString(),
            amount: toNano(USDT_TRANSFER_GAS).toString(),
            payload: jettonTransferPayload.toBoc().toString("base64"),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      const txHash = result.boc; // Live signed transaction payload

      setTxStep('confirming');
      await waitForContract(idoContract, async () => {
        const contribution = await getUserContribution(
          project.idoContractAddress!,
          wallet.address!
        );
        return contribution >= contributionBefore + amountInUSDT;
      });

      const res = await fetch(`/api/projects/${project.id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor: wallet.address,
          usdtAmount: amt,
          txHash: txHash
        })
      });
      const data = await res.json();

      if (res.status !== 200) {
        throw new Error(data.error || 'Failed to submit buy payload.');
      }

      // Trigger local wallet transaction save record
      const transactions = JSON.parse(localStorage.getItem('ton_launchpad_txs') || '[]');
      const newTx = {
        id: `tx-${Math.random().toString(36).slice(2)}`,
        type: 'buy',
        projectId: project.id,
        projectName: project.name,
        usdtAmount: amt,
        tokenAmount: amt * project.rate,
        tokenSymbol: project.symbol,
        timestamp: Date.now(),
        txHash: txHash
      };
      transactions.unshift(newTx);
      localStorage.setItem('ton_launchpad_txs', JSON.stringify(transactions));

      setTxStep('complete');
      setTimeout(async () => {
        setTxStep('idle');
        setContAmount('');
        onContributeSuccess();
        await reloadProject();
      }, 1500);

    } catch (err: any) {
      setAuditError(err.message || 'Transaction rejected by user or failed.');
      setTxStep('idle');
    }
  };

  const getRiskColor = (level: string) => {
    if (level === 'LOW') return 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5';
    if (level === 'MEDIUM') return 'text-amber-400 border-amber-500/10 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/10 bg-rose-500/5';
  };

  const getUtilityColor = (util: string) => {
    if (util === 'EXCELLENT') return 'text-[#0098EA] bg-[#0098EA]/5 border-[#0098EA]/10';
    if (util === 'GOOD') return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
    return 'text-slate-400 bg-slate-500/5 border-slate-500/10';
  };

  const getVerificationMeta = (
    status: LaunchpadProject['kycStatus'] | LaunchpadProject['auditStatus'],
    kind: 'kyc' | 'audit'
  ) => {
    if (status === 'verified') {
      return { label: `${kind === 'kyc' ? 'KYC' : 'Audit'} verified`, className: 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400' };
    }
    if (status === 'automated_review') {
      return { label: 'AI Trust Review', className: 'border-sky-500/20 bg-sky-500/[0.08] text-sky-400' };
    }
    if (status === 'pending') {
      return { label: `${kind === 'kyc' ? 'KYC' : 'Audit'} pending`, className: 'border-amber-500/20 bg-amber-500/[0.08] text-amber-400' };
    }
    if (status === 'rejected' || status === 'issues_found') {
      return { label: kind === 'kyc' ? 'KYC rejected' : 'Audit issues found', className: 'border-rose-500/20 bg-rose-500/[0.08] text-rose-400' };
    }
    return { label: `${kind === 'kyc' ? 'KYC' : 'Audit'} not provided`, className: 'border-slate-700 bg-slate-900/60 text-slate-400' };
  };

  const kycVerification = getVerificationMeta(project.kycStatus || 'not_submitted', 'kyc');
  const auditVerification = getVerificationMeta(
    project.auditStatus || (project.aiAudit ? 'automated_review' : 'not_submitted'),
    'audit'
  );

  // Stepper helper
  const stages = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'vote', label: 'Vote' },
    { key: 'preparation', label: 'Preparation' },
    { key: 'whitelist', label: 'Whitelist' },
    { key: 'sale', label: 'Live Sale' },
    { key: 'distribution', label: 'Distribution / Failed' }
  ];

  // For nice voting percentage bar
  const totalVotes = project.votesUp + project.votesDown;
  const upvotePercent = totalVotes > 0 ? (project.votesUp / totalVotes) * 100 : 50;
  const hasVotingGramx = gramxBalance >= 10n ** BigInt(GRAMX_DECIMALS);
  const shouldShowSwapForVote = wallet.connected && voteGramxChecked && !gramxBalanceLoading && !hasVotingGramx;
  const isUpcoming = project.idoStage === 'upcoming';

  const [contAmountError, setContAmountError] = useState<string | null>(null);

  const handleContAmountChange = (value: string) => {
    setContAmount(value);

    const amount = Number(value);

    if (!value) {
      setContAmountError(null);
      return;
    }

    if (amount < project.minBuy) {
      setContAmountError(`Minimum contribution is ${project.minBuy} USDT.`);
      return;
    }

    if (amount > project.maxBuy) {
      setContAmountError(`Maximum contribution is ${project.maxBuy} USDT.`);
      return;
    }

    setContAmountError(null);
  };
  const isSoftCapMet = project.raised >= project.softCap;

  return (
    <div id="project-details-section" className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">

      {/* Sleek top navigation actions with integrated micro dev tools */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition duration-200 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] transition group-hover:border-emerald-300/20">
            <ArrowLeft className="h-4 w-4 text-emerald-500" />
          </div>
          <span>Back to Projects</span>
        </button>

        {/* Small, discrete Advanced Sandbox Button (Only visible to the genuine project creator) */}
        {wallet.connected && wallet.address && wallet.address.toLowerCase() === project.creator.toLowerCase() && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#0098EA]/20 bg-[#0098EA]/5 text-[10px] font-mono text-[#0098EA]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Project Admin</span>
            </div>
            {project.idoStage !== 'distribution' && (
              <button
                onClick={handleOpenAdvanceStageModal}
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-700/20 bg-emerald-700 px-3 py-2 text-[10px] font-bold btn-white-text transition hover:bg-emerald-300/[0.13]"
                title="Configure upcoming phase schedule and advance smart contract."
              >
                {actionLoading ? 'Bypassing...' : (
                  <>
                    <span>Advance Phase</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Milestones Timeline Card */}
      <div className="gp-panel mb-8 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-500">Launch lifecycle</span>
            <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[9px] font-semibold text-slate-400">TON verified</span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-400 flex items-center gap-1.5">
            Current Stage: <span className="text-white capitalize font-bold">{project.idoStage}</span>
          </span>
        </div>

        {/* Timeline representation */}
        <div className="relative pt-2 pb-1">
          {/* Timeline wire back */}
          <div className="gp-lifecycle-track absolute top-6 left-[10%] right-[10%] hidden h-[2px] md:block" />

          {/* Active timeline wire front */}
          <div
            className="absolute left-[10%] top-6 hidden h-[2px] bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all duration-700 md:block"
            style={{
              width: `${(() => {
                const stageIdx = stages.findIndex(s => s.key === project.idoStage);
                const safeIdx = Math.max(0, stageIdx);
                const maxIndex = stages.length - 1;

                return maxIndex > 0 ? (safeIdx / maxIndex) * 80 : 0;
              })()}%`,
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-2 relative z-10">
            {stages.map((st, idx) => {
              const stageIdx = stages.findIndex(s => s.key === project.idoStage);
              const isCompleted = stageIdx > idx;
              const isActive = project.idoStage === st.key;

              return (
                <div key={st.key} className="flex md:flex-col items-center md:text-center gap-3.5 md:gap-2.5">
                  {/* Circle Node */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${isActive ? 'border-[#0098EA] bg-[#0098EA] text-[#fff] shadow-[0_0_12px_rgba(0,152,234,0.3)] font-bold scale-110' :
                      isCompleted ? 'border-emerald-500/40 bg-emerald-500 text-[#fff] font-bold' :
                        'gp-lifecycle-node-pending text-slate-500'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-[#fff]" />
                    ) : (
                      <span className="font-mono text-xs">{idx + 1}</span>
                    )}
                  </div>

                  {/* labels */}
                  <div className="text-left md:text-center">
                    <span className={`block text-xs font-bold transition-all ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {st.label.replace(/^\d+\.\s+/, '')}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      {st.key === 'vote' ? `${project.votesUp + project.votesDown} votes cast` :
                        st.key === 'preparation' ? 'Standard audited' :
                          st.key === 'whitelist' ? `${project.whitelistCount} joined` :
                            st.key === 'sale' ? `${project.contributionsCount} active sales` : 'Claims unlocked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="gp-details-layout grid gap-8 lg:grid-cols-12 items-start">

        {/* Left deep-dive specs column (8 shares) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Hero space */}
          <div className="gp-details-hero relative overflow-hidden rounded-[28px] border border-slate-800 shadow-xl">
            {/* Banner block */}
            <div className="gp-details-banner h-52 sm:h-64 w-full overflow-hidden bg-slate-950 relative">
              <img
                src={projectAssetOrDefault(project.banner, DEFAULT_PROJECT_BANNER)}
                alt={project.name}
                className="h-full w-full object-cover opacity-85 hover:scale-105 transition duration-1000"
              />
              <div className="gp-details-banner-fade absolute inset-0" />
            </div>

            {/* Profile overlapping block with elegant alignment */}
            <div className="relative px-5 sm:px-8 pb-5 -mt-14 sm:-mt-16 flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="gp-details-logo h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-[22px] border-4 bg-slate-900 shadow-2xl shrink-0">
                <img
                  src={projectAssetOrDefault(project.logo, DEFAULT_PROJECT_LOGO)}
                  alt={`${project.name} Logo`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="gp-details-identity min-w-0 flex-1 rounded-2xl border border-slate-800/80 bg-[#0A101D]/95 p-4 sm:p-5 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                    {project.name}
                  </h1>

                  <span className="rounded border border-sky-500/20 bg-sky-500/10 px-1 py-1 text-[10px] font-black uppercase tracking-wider text-sky-400">
                    {project.symbol}
                  </span>

                  <span
                    className={` inline-flex rounded-full border px-1 py-1 text-[9px] font-bold uppercase tracking-wider ${kycVerification.className}`}
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                    {kycVerification.label}
                  </span>

                  {auditResult?.trustScore !== undefined && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-1 py-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[9px] font-bold uppercase text-emerald-400">
                        Trust Score
                      </span>
                      <span className="font-mono text-[10px] btn-white-text text-sky-500 border-sky-700 rounded-full  bg-emerald-500 px-1">
                        {auditResult.trustScore}/100
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-slate-400 text-xs leading-relaxed max-w-xl truncate">
                  {project.description}
                </p>

                {/* Social references */}
                <div className="mt-3 flex flex-wrap gap-2.5 items-center">
                  {project.website && (
                    <a
                      href={project.website.startsWith('http') ? project.website : `https://${project.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-[#0098EA] transition duration-200"
                    >
                      <Globe className="h-3 w-3 text-[#0098EA]" />
                      <span>Website</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  )}
                  {project.telegram && (
                    <a
                      href={project.telegram.startsWith('http') ? project.telegram : `https://${project.telegram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-sky-450 transition duration-200"
                    >
                      <Send className="h-3 w-3 text-sky-400" />
                      <span>Telegram</span>
                    </a>
                  )}
                  {project.twitter && (
                    <a
                      href={project.twitter.startsWith('http') ? project.twitter : `https://${project.twitter}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-white transition duration-200"
                    >
                      <Twitter className="h-3 w-3 text-sky-400" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {project.discord && (
                    <a
                      href={project.discord.startsWith('http') ? project.discord : `https://${project.discord}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-indigo-400 transition duration-200"
                    >
                      <MessageSquare className="h-3 w-3 text-indigo-400" />
                      <span>Discord</span>
                    </a>
                  )}
                  {project.facebook && (
                    <a
                      href={project.facebook.startsWith('http') ? project.facebook : `https://${project.facebook}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-blue-500 transition duration-200"
                    >
                      <Facebook className="h-3 w-3 text-blue-500" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {project.instagram && (
                    <a
                      href={project.instagram.startsWith('http') ? project.instagram : `https://${project.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-pink-500 transition duration-200"
                    >
                      <Instagram className="h-3 w-3 text-pink-400" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github.startsWith('http') ? project.github : `https://${project.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-amber-500 transition duration-200"
                    >
                      <Github className="h-3 w-3 text-slate-400" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {project.reddit && (
                    <a
                      href={project.reddit.startsWith('http') ? project.reddit : `https://${project.reddit}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-orange-500 transition duration-200"
                    >
                      <Globe className="h-3 w-3 text-orange-500" />
                      <span>Reddit</span>
                    </a>
                  )}
                  {project.medium && (
                    <a
                      href={project.medium.startsWith('http') ? project.medium : `https://${project.medium}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gp-details-social inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 px-2.5 py-1.5 text-[10px] font-semibold text-slate-350 hover:text-emerald-400 transition duration-200"
                    >
                      <BookOpen className="h-3 w-3 text-emerald-400" />
                      <span>Medium</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="gp-details-market-grid grid grid-cols-2 gap-px border-t border-slate-800 bg-slate-800 sm:grid-cols-4">
              <div className="gp-details-market-stat">
                <span>Raised</span>
                <strong>${project.raised.toLocaleString()}</strong>
                <small>{raisedPercent.toFixed(1)}% of target</small>
              </div>
              <div className="gp-details-market-stat">
                <span>Hard cap</span>
                <strong>${project.hardCap.toLocaleString()}</strong>
                <small>USDT allocation</small>
              </div>
              <div className="gp-details-market-stat">
                <span>IDO rate</span>
                <strong>{project.rate.toLocaleString()} ${project.symbol}</strong>
                <small>per 1 USDT</small>
              </div>
              <div className="gp-details-market-stat">
                <span>Participants</span>
                <strong>{project.contributionsCount.toLocaleString()}</strong>
                <small>verified contributions</small>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="gp-details-content rounded-[24px] border border-slate-800 bg-[#0A101D] shadow-xl p-4 sm:p-6">
            <div className="gp-details-tabs flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 p-1 text-xs sm:text-sm font-bold tracking-wide">
              <button
                onClick={() => setActiveTab('info')}
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 transition duration-200 cursor-pointer ${activeTab === 'info' ? 'bg-[#0098EA] btn-white-text shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
              >
                Launchpool Tokenomics
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 transition duration-200 flex items-center gap-1.5 cursor-pointer ${activeTab === 'audit' ? 'bg-[#0098EA] btn-white-text shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#00D2FF]" />
                <span> AI Risk Score</span>
              </button>

              <button
                onClick={() => setActiveTab('contributions')}
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 transition duration-200 cursor-pointer ${activeTab === 'contributions' ? 'bg-[#0098EA] btn-white-text shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
              >
                Contributors ({aggregatedContributions.length})
              </button>

            </div>

            {/* TAB PANELS */}
            <div className="mt-6">

              {/* TAB 1: INFO SECTION */}
              {activeTab === 'info' && (
                <div className="gp-tokenomics space-y-6">
                  <div className="gp-tokenomics-overview relative overflow-hidden rounded-2xl border border-[#0098EA]/20 p-5 sm:p-6">
                    <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#0098EA]/10 blur-3xl" />
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#0098EA]/20 bg-[#0098EA]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">
                          <Sparkles className="h-3 w-3" />
                          Investor allocation
                        </span>
                        <h2 className="mt-3 text-xl font-black tracking-tight text-white sm:text-2xl">
                          Transparent launch terms
                        </h2>
                        <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400">
                          Review the token supply, sale allocation, contract addresses, and vesting conditions before participating.
                        </p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Public sale rate</span>
                        <strong className="mt-1 block font-mono text-lg text-[#00D2FF]">
                          1 USDT = {project.rate.toLocaleString()} ${project.symbol}
                        </strong>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <div className="gp-tokenomics-kpi">
                        <span>Soft cap</span>
                        <strong>${project.softCap.toLocaleString()}</strong>
                        <small>USDT</small>
                      </div>
                      <div className="gp-tokenomics-kpi">
                        <span>Hard cap</span>
                        <strong>${project.hardCap.toLocaleString()}</strong>
                        <small>USDT</small>
                      </div>
                      <div className="gp-tokenomics-kpi">
                        <span>TGE unlock</span>
                        <strong>{project.vestingTgePercent !== undefined ? project.vestingTgePercent : 20}%</strong>
                        <small>at distribution</small>
                      </div>
                      <div className="gp-tokenomics-kpi">
                        <span>Linear vesting</span>
                        <strong>{project.vestingMonths ?? Math.max(1, Math.ceil((project.vestingDays || 90) / 30))}</strong>
                        <small>months</small>
                      </div>
                      <div className="gp-tokenomics-kpi">
                        <span>Cliff duration</span>
                        <strong>{project.cliffDurationDays || 0}</strong>
                        <small>days</small>
                      </div>
                    </div>
                  </div>
<div className="mt-4 grid gap-2">
  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
    <p className="text-[11px] leading-relaxed text-emerald-400">
      <strong className="font-black text-emerald-400">Soft Cap:</strong> Minimum raise needed for sale success. If not reached, investors can claim refunds.
    </p>
  </div>

  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3">
    <p className="text-[11px] leading-relaxed text-sky-400">
      <strong className="font-black text-sky-400">Hard Cap:</strong> Maximum amount that can be raised. Contributions stop once reached.
    </p>
  </div>

  <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
    <p className="text-[11px] leading-relaxed text-violet-400">
      <strong className="font-black text-violet-400">TGE Unlock:</strong> Percentage of purchased tokens released immediately at Token Generation Event.
    </p>
  </div>

  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
    <p className="text-[11px] leading-relaxed text-amber-400">
      <strong className="font-black text-amber-400">Linear Vesting:</strong> Remaining tokens unlock gradually over the vesting period.
    </p>
  </div>

  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
    <p className="text-[11px] leading-relaxed text-rose-400">
      <strong className="font-black text-rose-400">Cliff Duration:</strong> Initial waiting period before any vested tokens become claimable.
    </p>
  </div>
</div>


                  {/* Grid layout for structured token information */}
                  <div className="grid gap-5 xl:grid-cols-2">
                    <section className="gp-tokenomics-card rounded-2xl border border-slate-800 p-4 sm:p-5">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0098EA]" />
                        Jetton Contract Specifications
                      </h3>
                      <div className="gp-details-rows rounded-xl border border-slate-800 bg-slate-900/10 overflow-hidden divide-y divide-slate-800/60 font-sans">
                        <div className="flex justify-between items-center px-4 py-3 text-xs bg-slate-900/10">
                          <span className="text-slate-400 font-medium">Token standard</span>
                          <span className="text-white font-semibold">TON Jetton Asset Standard</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 text-xs bg-slate-900/10">
                          <span className="text-slate-400 font-medium">Ticker Symbol</span>
                          <span className="font-bold text-[#00D2FF]">${project.symbol}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 text-xs bg-slate-900/10">
                          <span className="text-slate-400 font-medium">Decimals Scale</span>
                          <span className="text-slate-200">{project.decimals || 9} decimals</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 text-xs bg-slate-900/10">
                          <span className="text-slate-405 font-medium">Deployed Total Supply</span>
                          <span className="font-mono font-bold text-white">{project.totalSupply.toLocaleString()} Tokens</span>
                        </div>
                        <div className="flex flex-col gap-2 p-4 bg-slate-900/10">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Contract Master Hash</span>
                          <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                            <code className="font-mono text-[10px] text-[#0098EA] select-all truncate">
                              {project.jettonAddress || 'Not configured'}
                            </code>
                            <button
                              type="button"
                              onClick={event => project.jettonAddress && handleCopy(project.jettonAddress, 'jetton', event)}
                              disabled={!project.jettonAddress}
                              className="text-slate-500 hover:text-[#0098EA] p-1.5 rounded hover:bg-slate-900 transition shrink-0 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                              title="Copy Contract Address"
                            >
                              {copiedText === 'jetton' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Seed distributions metrics */}
                    <section className="gp-tokenomics-card rounded-2xl border border-slate-800 p-4 sm:p-5">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0098EA]" />
                        Launchpool Targets & Terms
                      </h3>
                      <div className="gp-details-rows rounded-xl border border-slate-800 bg-slate-900/10 overflow-hidden divide-y divide-slate-800/60 font-sans">
                        <div className="flex justify-between items-center gap-3 px-4 py-3 text-xs bg-slate-950/25">
                          <span className="text-slate-450 font-medium shrink-0">IDO Smart Contract Address</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-[#0098EA] font-bold text-[10px] truncate max-w-[160px] sm:max-w-[320px]" title={project.idoContractAddress}>
                              {project.idoContractAddress || 'Not deployed'}
                            </span>
                            <button
                              type="button"
                              onClick={event => project.idoContractAddress && handleCopy(project.idoContractAddress, 'ido-contract', event)}
                              disabled={!project.idoContractAddress}
                              className="text-slate-500 hover:text-white p-0.5"
                            >
                              {copiedText === 'ido-contract' ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center px-4 py-3 text-xs">
                          <span className="text-slate-450 font-medium"> Rate</span>
                          <span className="font-mono font-bold text-sky-400">1 USDT = {project.rate.toLocaleString()} ${project.symbol}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 text-xs">
                          <span className="text-slate-450 font-medium">Investor TGE share</span>
                          <span className="font-bold text-white font-mono">{project.vestingTgePercent !== undefined ? project.vestingTgePercent : 20}% Unlocked</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 text-xs">
                          <span className="text-slate-450 font-medium">Investor Vest Period</span>
                          <span className="font-bold text-white font-mono">
                            {project.vestingMonths ?? Math.max(1, Math.ceil((project.vestingDays || 90) / 30))} Months Linear
                          </span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 text-xs">
                          <span className="text-slate-450 font-medium">Project Creator</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-slate-400 text-[10px] truncate max-w-[100px]">{project.creator}</span>
                            <button
                              type="button"
                              onClick={event => handleCopy(project.creator, 'creator', event)}
                              className="text-slate-600 hover:text-white p-0.5"
                            >
                              {copiedText === 'creator' ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 text-xs font-sans">
                          <span className="text-slate-450 font-medium">Sale End Time</span>
                          <span className="font-medium text-slate-300">{new Date(project.endTime).toLocaleString()}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Team and verification */}
                  <div className="gp-tokenomics-card rounded-2xl border border-slate-800 p-4 sm:p-5">
                    <h3 className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#0098EA]" />
                      Team & Verification
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="gp-tokenomics-verification rounded-xl border border-slate-800 bg-slate-900/10 p-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Users className="h-4 w-4 text-[#0098EA]" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Project owner</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <code className="min-w-0 flex-1 truncate text-[10px] text-slate-400" title={project.creator}>
                            {project.creator}
                          </code>
                          <button
                            type="button"
                            onClick={event => handleCopy(project.creator, 'team-creator', event)}
                            className="shrink-0 text-slate-500 transition hover:text-white"
                            title="Copy owner address"
                          >
                            {copiedText === 'team-creator' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="gp-tokenomics-verification rounded-xl border border-slate-800 bg-slate-900/10 p-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[#0098EA]" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Identity review</span>
                        </div>
                        <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${kycVerification.className}`}>
                          {kycVerification.label}
                        </span>
                        <p className="mt-2 text-[10px] leading-4 text-slate-500">KYC is marked verified only after platform review.</p>
                      </div>

                      <div className="gp-tokenomics-verification rounded-xl border border-slate-800 bg-slate-900/10 p-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#0098EA]" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Contract review</span>
                        </div>
                        <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${auditVerification.className}`}>
                          {auditVerification.label}
                        </span>
                        <p className="mt-2 text-[10px] leading-4 text-slate-500">
                          Public trust score: <strong className="text-slate-300">{project.aiAudit?.trustScore ?? 'Not scored'}{project.aiAudit ? '/100' : ''}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pitch description */}
                  <div className="gp-tokenomics-description p-5 rounded-2xl bg-slate-900/30 border border-slate-850/80">
                    <h4 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-2">Campaign Description Detail</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{project.description}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIT SECTION */}
              {activeTab === 'audit' && (
                <div className="space-y-6">

                  {auditing ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-950 border border-slate-800 animate-spin">
                        <Sparkles className="h-5 w-5 text-[#0098EA]" />
                      </div>
                      <p className="text-xs text-slate-400 font-mono text-center max-w-md mt-1 leading-relaxed">
                        Scanning smart contract bytecode, ownership controls, and monthly vesting parameters...
                      </p>
                    </div>
                  ) : auditResult ? (
                    <div className="space-y-6">

                      {/* Dashboard scoring metrics panel */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        {/* Gauge 1: Trust rating */}
                        <div className="rounded-xl border border-slate-800/60 bg-slate-950 p-4 flex items-center gap-4">
                          {/* Radial Score Gauge SVG */}
                          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                className="stroke-slate-800"
                                strokeWidth="4"
                                fill="transparent"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                className="stroke-[#0098EA]"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 26}`}
                                strokeDashoffset={`${2 * Math.PI * 26 * (1 - auditResult.trustScore / 100)}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-xs font-black font-mono text-white">{auditResult.trustScore}%</span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">Security Score</span>
                            <span className="text-sm font-extrabold text-white block mt-0.5">Verified High</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Standard Passed</span>
                          </div>
                        </div>

                        {/* Gauge 2: Risk rating */}
                        <div className={`rounded-xl border bg-slate-950 p-4 border-slate-800/65 flex items-center gap-3.5`}>
                          <div className={`h-11 w-11 flex items-center justify-center rounded-xl border ${getRiskColor(auditResult.riskLevel)}`}>
                            {auditResult.riskLevel === 'LOW' ? (
                              <ShieldCheck className="h-5.5 w-5.5" />
                            ) : (
                              <ShieldAlert className="h-5.5 w-5.5" />
                            )}
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-450">Risk Classification</span>
                            <span className={`text-xs font-black mt-1 inline-block ${auditResult.riskLevel === 'LOW' ? 'text-emerald-400' :
                                auditResult.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-rose-450'
                              }`}>
                              {auditResult.riskLevel} Risk Profile
                            </span>
                            <span className="text-[10px] text-slate-500 block font-mono">Vesting checks OK</span>
                          </div>
                        </div>

                        {/* Gauge 3: Utility index */}
                        <div className="rounded-xl border border-slate-800/65 bg-slate-950 p-4 flex items-center gap-3.5">
                          <div className={`h-11 w-11 flex items-center justify-center rounded-xl border ${getUtilityColor(auditResult.utilityRating)}`}>
                            <Award className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-455">Utility Rating</span>
                            <span className="text-xs font-black text-slate-200 mt-1 block">{auditResult.utilityRating}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">Thematic match specs</span>
                          </div>
                        </div>

                      </div>

                      {/* Split descriptions */}
                      <div className="grid gap-4 sm:grid-cols-2">

                        <div className="p-4 rounded-xl bg-slate-900/10 border border-slate-850">
                          <h5 className="font-extrabold text-white text-xs mb-1.5 flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-sky-400" />
                            Vesting Security
                          </h5>
                          <p className="text-slate-300 leading-relaxed text-[11.5px] font-sans">{auditResult.liquidityAnalysis}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/10 border border-slate-850">
                          <h5 className="font-extrabold text-white text-xs mb-1.5 flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-emerald-400" />
                            Advisory Allocation Security
                          </h5>
                          <p className="text-slate-300 leading-relaxed text-[11.5px] font-sans">{auditResult.whitelistRecommendation}</p>
                        </div>

                      </div>

                      {/* evaluation text */}
                      <div className="gp-audit-evaluation p-4 rounded-xl bg-[#090E1A] border border-slate-800 font-sans">
                        <h5 className="font-bold text-xs text-slate-350 tracking-wider uppercase mb-1.5">Comprehensive Evaluation</h5>
                        <p className="text-slate-300 leading-relaxed text-[11.5px]">{auditResult.overallEvaluation}</p>
                      </div>

                      {/* Concerns list */}
                      {auditResult.concerns && auditResult.concerns.length > 0 && (
                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                          <h5 className="font-black text-rose-400 text-xs tracking-wider uppercase mb-2 mr-1 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-rose-450" />
                            Bytecode Volatility Factors
                          </h5>
                          <ul className="list-disc list-inside text-rose-350 flex flex-col gap-1.5 text-[11px] font-medium leading-relaxed">
                            {auditResult.concerns.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* recommendations checklist */}
                      {auditResult.recommendations && auditResult.recommendations.length > 0 && (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                          <h5 className="font-black text-emerald-400 text-xs tracking-wider uppercase mb-2 mr-1 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-450" />
                            Best Practices Checklist
                          </h5>
                          <ul className="list-disc list-inside text-emerald-350 flex flex-col gap-1.5 text-[11px] font-medium leading-relaxed font-sans">
                            {auditResult.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-900/10 rounded-xl border border-slate-850 font-sans">
                      <HelpCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <h4 className="font-bold text-slate-300 text-sm">Security Ledger Missing</h4>
                      <p className="text-xs text-slate-500 mb-4 mt-1 max-w-sm mx-auto">
                        This token has not completed security scans on the blockchain. Trigger Ai secure audits to verify creator limits.
                      </p>
                      <button
                        onClick={handleTriggerAIAudit}
                        className="rounded-xl bg-[#0098EA] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition font-sans"
                      >
                        Initiate AI Smart Audit
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: CONTRIBUTIONS SECTION */}
              {activeTab === 'contributions' && (
                <div id="contributions-table-block" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                      <Users className="h-4 w-4 text-emerald-400" />
                      Contribution Ledger
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {aggregatedContributions.length} contributors
                    </span>
                  </div>

                  {aggregatedContributions.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border border-dashed border-slate-850 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-sans">
                      No stablecoins allocated to this pool yet. Be the first to join the Launchpool and secure discounted rates!
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950 font-mono">
                      <table className="w-full text-left text-xs text-slate-300 border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500 font-sans">
                            <th className="px-5 py-3.5">Contributor Target</th>
                            <th className="px-5 py-3.5 text-right">USDT Amount</th>
                            <th className="px-5 py-3.5 text-right">Locked Reward</th>
                            <th className="px-5 py-3.5 text-right">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-[11px]">
                          {aggregatedContributions.map((c, i) => (
                            <tr key={i} className="hover:bg-slate-900/10">
                              <td className="px-5 py-3.5 text-sky-400 select-all font-semibold">
                                {c.contributor.slice(0, 8)}...{c.contributor.slice(-8)}
                              </td>
                              <td className="px-5 py-3.5 text-right text-emerald-400 font-bold">
                                ${c.usdtAmount ? c.usdtAmount.toLocaleString() : 0} USDT
                              </td>
                              <td className="px-5 py-3.5 text-right text-white font-semibold">
                                {c.tokenAmount.toLocaleString()} ${project.symbol}
                              </td>
                              <td className="px-5 py-3.5 text-right text-slate-500">
                                {new Date(c.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right active participation card column (4 shares) */}
        <div className="lg:col-span-4 sticky top-6">
          {isUpcoming ? (
            <div className="gp-details-action-card rounded-[24px] border border-slate-800 bg-[#0A101D] p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-[#0098EA]/10 blur-2xl pointer-events-none" />
              <div className="text-center">
                <div className="mb-3 flex items-center justify-center gap-2">
                  {(timeDifference <= 0) ? <CookingPotIcon className="h-5 w-5 text-amber-400 animate-pulse" /> : <Calendar className="h-5 w-5 text-amber-400 animate-pulse" />}

                  <h3 className="text-sm font-extrabold uppercase text-white">
                    {(timeDifference <= 0) ? "Preparing to Vote" : "Voting Will Start in"}
                  </h3>
                </div>


                <div className="flex items-center justify-center gap-1.5 font-black text-lg tracking-wider">

                  {timeDifference > 0 ? (
                    <>

                      <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                        {String(timeLeft.days).padStart(2, '0')}d
                      </span>
                      <span className="text-slate-500">:</span>

                      <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                        {String(timeLeft.hours).padStart(2, '0')}h
                      </span>
                      <span className="text-slate-500">:</span>
                      <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                        {String(timeLeft.minutes).padStart(2, '0')}m
                      </span>
                      <span className="text-slate-500">:</span>
                      <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                        {String(timeLeft.seconds).padStart(2, '0')}s
                      </span>
                    </>
                  ) : <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                    VOTE will start in sometime
                  </span>

                  }

                </div>
              </div>
            </div>
          ) : (
            <div className="gp-details-action-card rounded-[24px] border border-slate-800 bg-[#0A101D] p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-[#0098EA]/10 blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-850">
                <Vote className="h-5 w-5 text-sky-400 animate-pulse" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                  Participation Hub
                </h3>
              </div>

              {/* Current Stage Details Card */}
              <div className="mb-4 rounded-xl border border-emerald-800/25 bg-emerald-800/10 p-4 font-sans relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <CookingPot className="h-4 w-4 text-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                    Current Stage
                  </span>
                </div>
                <div className='flex'>
                  <h3 className="text-xl font-black text-white tracking-tight mr-2">
                    {String(project.idoStage).toUpperCase()}
                  </h3>
                  <span className='text-rose-500 font-bold tracking-widest uppercase flex items-center border-rose-200'>

                    {project.idoStage == "distribution" && !isSoftCapMet ?
                      <>
                        <AlertCircle className='w-4 h-4 mr-1' /> {"Failed"}
                      </>


                      : ""}
                  </span>
                </div>


                <p className="text-emerald-8500 text-[12px] leading-relaxed">
                  {nextInfo.desc}
                </p>
              </div>

              {/* VOTING STAGE */}
              {project.idoStage === 'vote' && (
                <div className="space-y-4 font-sans text-xs">

                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-sky-600 text-center">
                    {timeDifference > 0 && (


                      " Voting Ends In"

                    )}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 font-black text-lg tracking-wider">

                    {timeDifference > 0 ? (
                      <>

                        <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-center flex items-center flex-row ">


                          <span className="rounded-lg border border-amber-400/25 bg-slate-950/80 px-2.5 py-1 text-amber-400">
                            {String(timeLeft.days).padStart(2, '0')}d
                          </span>
                          <span className="text-slate-500">:</span>

                          <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                            {String(timeLeft.hours).padStart(2, '0')}h
                          </span>
                          <span className="text-slate-500">:</span>
                          <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                            {String(timeLeft.minutes).padStart(2, '0')}m
                          </span>
                          <span className="text-slate-500">:</span>
                          <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                            {String(timeLeft.seconds).padStart(2, '0')}s
                          </span>
                        </div>
                      </>
                    ) : ""
                    }

                  </div>
                    {timeDifference > 0 && (
                    <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 leading-relaxed space-y-2">


                      <h4 className="flex items-center gap-1.5 font-bold text-rose-400">
                        <CoinsIcon className="h-4 w-4 text-rose-400" />
                        Voting Requirement
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        You must hold at least 1 GRAMX to vote.GRAMX does not deduct while voting. It just approve eligibility to vote.If you dont have GRAMX get it from any of below option.
                      </p>

                      <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                        <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-300">
                          Need 1 GRAMX to vote?
                        </p>
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://t.me/grampadio_bot"
                            className="flex items-center justify-center rounded-xl border border-emerald-500/80 bg-emerald-500/80 px-4 py-3 font-sans text-xs font-black uppercase tracking-wide btn-white-text transition  cursor-pointer"
                          >
                            Airdrop
                          </a>

                          <span className="text-center font-sans text-[10px] font-black uppercase text-slate-500">
                            OR
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenSwap?.()}
                            className="flex items-center justify-center rounded-xl border border-sky-600/25 bg-sky-500/80 px-4 py-3 !font-sans !text-xs !font-black !uppercase !tracking-wide btn-white-text transition cursor-pointer"
                          >
                            SWAP
                          </button>
                        </div>
                      </div>
                    </div>
                    )}

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Vote ratio</span>
                      <span className="font-mono text-[10px] text-slate-400">{totalVotes} total votes</span>
                    </div>

                    <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
                        style={{ width: `${upvotePercent}%` }}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 text-center">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-400">Upvotes</span>
                        <span className="mt-1 block text-lg font-black text-white">{project.votesUp}</span>
                      </div>
                      <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-center">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-rose-400">Downvotes</span>
                        <span className="mt-1 block text-lg font-black text-white">{project.votesDown}</span>
                      </div>
                    </div>
                  </div>

                  {isCreator ? (
                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-center leading-relaxed text-orange-400">
                      <p className="mb-1 font-bold">Creator Address Connected</p>
                      <p className="text-[10.5px] text-slate-300">
                        Project owners cannot vote on their own IDO listing.
                      </p>
                    </div>
                  ) : voteIsPending ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-center text-amber-300 shadow-md">
                        <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                        <span className="block text-xs font-bold uppercase tracking-wider">Vote transaction pending</span>
                        <p className="mt-1 text-[10.5px] text-slate-300">
                          We found a vote attempt from this wallet. If the TON transaction has confirmed, refresh the status to sync the UI with the smart contract.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRefreshVoteStatus}
                        disabled={voteSyncLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/80 px-4 py-3 text-xs font-black btn-white-text shadow transition hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw className={`h-4 w-4 ${voteSyncLoading ? 'animate-spin' : ''}`} />
                        {voteSyncLoading ? 'Checking Chain...' : 'Refresh Vote Status'}
                      </button>
                    </div>
                  ) : userVoted || project.userVoted ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/10 to-teal-400/5 p-4 text-center text-emerald-400 shadow-md">
                        <CheckCircle2 className="mx-auto mb-2 h-6 w-6" />
                        <span className="block text-xs font-bold uppercase tracking-wider">Vote already recorded</span>
                        <p className="mt-1 text-[10.5px] text-slate-300">
                          This wallet has already voted for this project. The UI will stay synced with the on-chain result.
                        </p>
                      </div>
                    </div>
                  ) : wallet.connected ? (
                    timeDifference > 0 ? (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleVote('up')}
                          disabled={actionLoading || gramxBalanceLoading}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/80 px-4 py-3 text-xs font-black btn-white-text shadow transition hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {actionLoading ? 'Submitting...' : 'Vote Up'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVote('down')}
                          disabled={actionLoading || gramxBalanceLoading}
                          className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/80 px-4 py-3 text-xs font-black btn-white-text shadow transition hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          {actionLoading ? 'Submitting...' : 'Vote Down'}
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-center text-xs font-bold text-rose-300">
                        Voting has been finished
                      </div>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenConnect}
                      className="w-full cursor-pointer rounded-xl bg-[#0098EA] py-3 text-xs font-extrabold btn-white-text shadow-lg transition duration-200"
                    >
                      Connect Wallet to Vote
                    </button>
                  )}

                  {auditError && (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-400/80 p-3 text-[11px] btn-white-text">
                      Error: {auditError}
                    </div>
                  )}


                </div>
              )}

              {/* Active Action Button inside Preparation phase */}
              {project.idoStage === 'preparation' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 text-center space-y-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 mx-auto">
                      <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                    </div>
                    <h4 className="font-bold text-purple-400 text-sm">Pool Configuration Freeze</h4>
                    <p className="text-slate-350 text-[11px] leading-relaxed">
                      Token Vesting vaults are currently anchoring to smart consensus registers. Live whitelist lotteries will deploy in the next transaction block dynamically.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed font-mono">
                    🔒 Static Ratio: 1 USDT = {project.rate.toLocaleString()} ${project.symbol}
                  </div>
                  {project.idoStage === 'preparation' && project.nextPhaseTime && (
                   
                      timeDifference >0? (<>
                           <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                              <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                          Whitelist Starts In
                        </span>
                      </div>



                      <div className="grid grid-cols-4 gap-2">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                          <div className="text-lg font-black text-white">{timeLeft.days}</div>
                          <div className="text-[10px] uppercase text-slate-500">Days</div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                          <div className="text-lg font-black text-white">{timeLeft.hours}</div>
                          <div className="text-[10px] uppercase text-slate-500">Hours</div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                          <div className="text-lg font-black text-white">{timeLeft.minutes}</div>
                          <div className="text-[10px] uppercase text-slate-500">Minutes</div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                          <div className="text-lg font-black text-white">{timeLeft.seconds}</div>
                          <div className="text-[10px] uppercase text-slate-500">Seconds</div>
                        </div>
                      </div>
                      </div>
                     
                   </>):(
                     <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-2 ">
                        
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400 ">
                          Whitelist Starts Soon
                        </span>
                      </div>
                      </div>
                   )
               
                  )}
                </div>
              )}

              {/* WHITELIST STAGE */}
              {project.idoStage === 'whitelist' && (
                <div className="space-y-4 font-sans text-xs">
                  {/* Countdown */}
                  {timeDifference > 0 ? (
                    <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-center">
                      <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        Whitelist Ends In
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-lg font-black tracking-wider">
                        <span className="rounded-lg border border-amber-400/25 bg-slate-950/80 px-1 py-1 text-amber-400">
                          {String(timeLeft.days).padStart(2, '0')}d
                        </span>

                        <span className="text-slate-500">:</span>

                        <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-1 py-1 text-[#0098EA]">
                          {String(timeLeft.hours).padStart(2, '0')}h
                        </span>

                        <span className="text-slate-500">:</span>

                        <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-1 py-1 text-[#0098EA]">
                          {String(timeLeft.minutes).padStart(2, '0')}m
                        </span>

                        <span className="text-slate-500">:</span>

                        <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                          {String(timeLeft.seconds).padStart(2, '0')}s
                        </span>
                      </div>
                    </div>
                  ):(
                      <div className="rounded-xl border border-sky-200 bg-sky-500/10 px-4 py-3 text-center font-mono">
                    
                    <span className="mt-1 block text-base font-black text-sky-400">
                      Sale will start soon
                    </span>
                  </div>
                  )}

                  {/* Whitelist count */}
                  <div className="rounded-xl border border-slate-800 bg-amber-400/10 px-4 py-3 text-center font-mono">
                    <span className="block text-[9px] font-bold uppercase text-slate-500">
                      Total Whitelist Registrants
                    </span>
                    <span className="mt-1 block text-base font-black text-amber-500">
                      {project.whitelistCount} Addresses
                    </span>
                  </div>

                  {/* Actions */}
                  {isCreator ? (
                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-center leading-relaxed text-orange-400">
                      <p className="mb-1 font-bold">Creator Address Connected</p>
                      <p className="text-[10.5px] text-slate-300">
                        As the creator of this project, you are ineligible to register for your own whitelist allotment lottery.
                      </p>
                    </div>
                  ) : userWhitelisted ? (
                    <div className="relative space-y-2 overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/10 to-teal-400/5 p-4 text-center text-emerald-400 shadow-md">
                      <div className="absolute right-0 top-0 h-10 w-10 rounded-full bg-emerald-500/5 blur-md" />
                      <ClipboardCheck className="mx-auto mb-1 h-6 w-6 animate-bounce text-emerald-400" />
                      <span className="block text-xs font-bold uppercase tracking-wider">
                        Address Whitelisted
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1.5">
                      {auditError && (
                        <div className="rounded-lg border border-rose-500/50 bg-rose-500/5 p-3 text-[11px] text-rose-300">
                          {auditError}
                        </div>
                      )}

                      {wallet.connected ? (
                        timeDifference > 0 ? (
                          <button
                            type="button"
                            onClick={handleJoinWhitelist}
                            disabled={actionLoading}
                            className="btn-white-text w-full cursor-pointer rounded-xl bg-emerald-500 py-3 text-xs font-black text-black shadow transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoading ? 'Joining Registry...' : 'Register for Whitelist Allocation'}
                          </button>) : <><button
                            type="button"
                            className="w-full rounded-xl bg-slate-400 py-3 text-xs font-bold font-extrabold btn-white-text shadow-lg duration-200"
                          >
                            Whitelist has been ended
                          </button>
                          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-center">

                            <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-400">
                              <AlertCircle className="h-4 w-4" />
                              Sale Will Starts in
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-lg font-black tracking-wider">
                              <span className="rounded-lg border border-amber-400/25 bg-slate-950/80 px-1 py-1 text-amber-400">
                                {String(timeLeft.days).padStart(2, '0')}d
                              </span>

                              <span className="text-slate-500">:</span>

                              <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-1 py-1 text-[#0098EA]">
                                {String(timeLeft.hours).padStart(2, '0')}h
                              </span>

                              <span className="text-slate-500">:</span>

                              <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-1 py-1 text-[#0098EA]">
                                {String(timeLeft.minutes).padStart(2, '0')}m
                              </span>

                              <span className="text-slate-500">:</span>

                              <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                                {String(timeLeft.seconds).padStart(2, '0')}s
                              </span>
                            </div>
                          </div></>
                      ) : (
                        <button
                          type="button"
                          onClick={onOpenConnect}
                          className="w-full cursor-pointer rounded-xl bg-[#0098EA] py-3 text-xs font-extrabold btn-white-text shadow-lg duration-200"
                        >
                          Connect Wallet to Register
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* LIVE SALE STAGE */}
              {project.idoStage === 'sale' && (
                <div className="space-y-4">
                  {project.idoStage === 'sale' && timeLeft.seconds > 0 ? (<>
                    <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-center">
                      <p className="mb-3 text-xs font-black uppercase tracking-wider text-sky-400">
                        Sale Ends In
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          ['Days', timeLeft.days],
                          ['Hours', timeLeft.hours],
                          ['Minutes', timeLeft.minutes],
                          ['Seconds', timeLeft.seconds],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border border-white/10 bg-black/20 p-3"
                          >
                            <div className="text-lg font-black text-white">{value}</div>
                            <div className="text-[10px] uppercase text-slate-500">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col text-xs font-sans">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-1 font-bold">Launchpool Raised Target</span>
                      <div className="flex justify-between items-end">
                        <span className="font-mono text-lg font-black text-emerald-400">${project.raised.toLocaleString()} <span className="text-xs text-slate-500 font-normal">USDT</span></span>
                        <span className="font-mono text-xs font-black text-[#00D2FF]">{raisedPercent.toFixed(1)}%</span>
                      </div>


                      <div className="relative h-2.5 w-full rounded-full bg-slate-950 overflow-hidden mt-2.5 border border-slate-850">
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-rose-400/50 z-10 animate-pulse"
                          title="Soft cap barrier"
                          style={{ left: `${softPercent}%` }}
                        />
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-500"
                          style={{ width: `${raisedPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between mt-1.5 text-[9px] text-slate-500 font-semibold font-mono uppercase tracking-wider">
                        <span>Soft Cap: ${project.softCap.toLocaleString()} USDT</span>
                        <span>Hard Cap: ${project.hardCap.toLocaleString()}</span>
                      </div>
                    </div>

                    <form onSubmit={handleContribute} className="space-y-4 pt-1 font-sans text-xs">
                      {auditError && (
                        <div className="rounded-lg border border-rose-500/10 bg-rose-300 text-rose-800 p-3 font-medium">
                          {auditError}
                        </div>
                      )}

                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-450">Select Contribution (USDT)</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="0.00"
                            value={contAmount}
                            onChange={(e) => handleContAmountChange(e.target.value)}
                            className={`w-full rounded-xl border bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${contAmountError
                                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                : 'border-slate-850 focus:border-[#0098EA] focus:ring-[#0098EA]'
                              }`}
                            min={project.minBuy}
                            max={project.maxBuy}
                            step="0.000001"
                            required
                          />

                          {contAmountError && (
                            <p className="mt-2 text-xs font-semibold text-rose-400">
                              {contAmountError}
                            </p>
                          )}
                          <span className="absolute top-3.5 right-4 text-xs font-black font-mono text-[#0098EA]">USDT</span>
                        </div>
                        <div className="flex justify-between mt-1.5 text-[9px] text-slate-500 font-bold px-1 font-mono">
                          <span>Min Allocation: ${project.minBuy} USDT</span>
                          <span>Max Allocation: ${project.maxBuy} USDT</span>
                        </div>
                      </div>

                      {estTokens > 0 && (
                        <div className="rounded-xl bg-slate-950 p-3 border border-slate-850 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Allocation:</span>
                          <span className="font-bold text-emerald-400">
                            +{estTokens.toLocaleString()} ${project.symbol}
                          </span>
                        </div>
                      )}

                      {wallet.connected ? (
                        <>
                          {!project.isUserWhitelisted && (
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center text-[10px] font-semibold text-amber-300">
                              This wallet is not in the project whitelist and cannot contribute.
                            </div>
                          )}
                          <button
                            type="submit"
                            disabled={!project.isUserWhitelisted}
                            className="w-full rounded-xl bg-sky-500 py-3 text-xs font-bold btn-white-text hover:opacity-90 active:scale-95 transition-all  cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {project.isUserWhitelisted ? 'Confirm' : 'Whitelist Required'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={onOpenConnect}
                          className="w-full rounded-xl border border-slate-850 bg-slate-950 py-3 text-xs font-bold btn-white-text hover:border-[#0098EA]/40 hover:bg-slate-900 transition-all cursor-pointer"
                        >
                          Connect Wallet to Participate
                        </button>
                      )}
                    </form>
                  </>
                  ) : (
                    <>
                      <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-center">
                        <p className="text-xs font-black uppercase tracking-wider text-rose-400">
                          Sale has been Ended
                        </p>
                      </div>
                      {timeDifference > 0 ? (
                        <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-center">
                          <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-400">

                            Distribution will starts in
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-lg font-black tracking-wider">
                            <span className="rounded-lg border border-amber-400/25 bg-slate-950/80 px-1 py-1 text-amber-400">
                              {String(timeLeft.days).padStart(2, '0')}d
                            </span>

                            <span className="text-slate-500">:</span>

                            <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-1 py-1 text-[#0098EA]">
                              {String(timeLeft.hours).padStart(2, '0')}h
                            </span>

                            <span className="text-slate-500">:</span>

                            <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-1 py-1 text-[#0098EA]">
                              {String(timeLeft.minutes).padStart(2, '0')}m
                            </span>

                            <span className="text-slate-500">:</span>

                            <span className="rounded-lg border border-[#0098EA]/25 bg-slate-950/80 px-2.5 py-1 text-[#0098EA]">
                              {String(timeLeft.seconds).padStart(2, '0')}s
                            </span>
                          </div>

                        </div>
                      ) :
                        <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-center">
                          Distribution will start soon
                        </div>
                      }
                    </>
                  )





                  }

                </div>
              )}

              {/* DISTRIBUTION STAGE */}
              {project.idoStage === 'distribution' && (() => {
                const isSoftCapMet = project.raised >= project.softCap;
                const totalAllocated = userContribution ? userContribution.tokenAmount : 0;
                const tgePercent = project.vestingTgePercent !== undefined ? project.vestingTgePercent : 20;
                const vestingMonths = project.vestingMonths ??
                  Math.max(1, Math.ceil((project.vestingDays || 90) / 30));
                const cliffDurationDays = project.cliffDurationDays || 0;
                const snapshotClaimed = claimSnapshot.claimedAmount > 0
                  ? claimSnapshot.claimedAmount
                  : userContribution ? (userContribution.claimedAmount || 0) : 0;
                const claimedAmount = Math.min(totalAllocated, snapshotClaimed);

                const tgeAmount = totalAllocated * (tgePercent / 100);
                const totalLockedPart = totalAllocated - tgeAmount;
                const distributionStartMs =
                  claimSnapshot.distributionStartedAt > 0
                    ? claimSnapshot.distributionStartedAt * 1000
                    : project.distributionStartTime || 0;
                const cliffEndMs = distributionStartMs + cliffDurationDays * 86400 * 1000;
                const monthMs = 30 * 86400 * 1000;
                const afterCliffMs = Math.max(0, claimNowMs - cliffEndMs);
                const completedVestingMonths = vestingMonths <= 0
                  ? 0
                  : Math.min(vestingMonths, Math.floor(afterCliffMs / monthMs));
                const nextUnlockMs =
                  vestingMonths <= 0 || completedVestingMonths >= vestingMonths
                    ? 0
                    : cliffEndMs + (completedVestingMonths + 1) * monthMs;
                const chainClaimableNow = Math.max(0, claimSnapshot.claimableAmount);
                const totalUnlockedSoFar = claimSnapshot.vestedAmount > 0
                  ? Math.min(totalAllocated, claimSnapshot.vestedAmount)
                  : Math.min(totalAllocated, claimedAmount + chainClaimableNow);
                const unlockedVestingPart = Math.max(0, totalUnlockedSoFar - tgeAmount);
                const claimableNow = chainClaimableNow;
                const lockedRemaining = Math.max(0, totalAllocated - totalUnlockedSoFar);
                const percentUnlockedTotal = totalAllocated > 0 ? (totalUnlockedSoFar / totalAllocated) * 100 : 0;
                const claimedPercent = totalAllocated > 0 ? Math.min(100, (claimedAmount / totalAllocated) * 100) : 0;
                const unlockedPercent = totalAllocated > 0 ? Math.min(100, (totalUnlockedSoFar / totalAllocated) * 100) : 0;
                const isBeforeCliff = distributionStartMs > 0 && cliffDurationDays > 0 && claimNowMs < cliffEndMs;
                const cliffCountdown = formatDuration(cliffEndMs - claimNowMs);
                const nextUnlockCountdown = formatDuration(nextUnlockMs - claimNowMs);

                if (!isSoftCapMet) {
                  const contributedUsdt = userContribution ? userContribution.usdtAmount : 0;
                  const isRefunded = userContribution ? !!userContribution.refunded : false;

                  return (
                    <div className="space-y-4 font-sans text-xs">
                      <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 text-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-rose-400 mx-auto animate-pulse" />
                        <h4 className="font-bold text-rose-400 text-sm">Campaign Ended: Soft Cap Failed</h4>
                        <p className="text-slate-350 text-[11px] leading-relaxed">
                          This launchpool closed without reaching its target soft cap of ${project.softCap.toLocaleString()} USDT total. Investors can retrieve a 100% refund of their contributions below.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-sky-500/10 p-4 space-y-2.5">
                        <h5 className="font-bold text-slate-350 text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                          <Coins className="h-3.5 w-3.5 text-rose-400" />
                          Campaign Failure Recovery Status
                        </h5>
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase font-semibold">Total Raised Capital</span>
                            <span className="text-rose-400 text-xs font-bold font-mono text-[11px]">${project.raised.toLocaleString()} USDT</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase font-semibold">Target Soft Cap</span>
                            <span className="text-white text-xs font-bold font-mono text-[11px]">${project.softCap.toLocaleString()} USDT</span>
                          </div>
                        </div>
                      </div>

                      {wallet.connected ? (
                        contributedUsdt > 0 ? (
                          <div className="space-y-4">
                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                                <span>Your Total Invested USDT Escrow:</span>
                                <span className="font-mono text-white text-xs font-black">
                                  {contributedUsdt.toLocaleString()} USDT
                                </span>
                              </div>

                              <div className="border-t border-slate-850/70 pt-2.5 space-y-2 text-[10px]">
                                <div className="flex justify-between items-center text-slate-400">
                                  <span>Gas Write Fee:</span>
                                  <span className="font-mono text-white">~0.05 TON</span>
                                </div>

                                <div className="flex justify-between items-center text-slate-450">
                                  <span>Refund Eligibility Status:</span>
                                  <span className={`font-mono font-bold ${isRefunded ? 'text-slate-500' : 'text-emerald-400'}`}>
                                    {isRefunded ? '100% Refund Claimed' : 'Eligible for 100% Refund'}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-[11px] font-black border-t border-dashed border-slate-800 pt-2.5">
                                  <span className="text-rose-400 uppercase">AVAILABLE FOR DIRECT WITHDRAWAL:</span>
                                  <span className={`font-mono text-xs font-black ${isRefunded ? 'text-slate-500' : 'text-emerald-400 '}`}>
                                    {isRefunded ? '0.00 USDT' : `${contributedUsdt.toLocaleString()} USDT`}
                                  </span>
                                </div>
                              </div>

                              {claimError && (
                                <div className="rounded-lg border border-rose-500/30 bg-rose-500/15 p-2.5 text-[10px] font-sans text-rose-400">
                                  {claimError}
                                </div>
                              )}

                              {claimSuccess && (
                                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 p-2.5 text-[10px] font-sans text-emerald-400">
                                  {claimSuccess}
                                </div>
                              )}

                              <button
                                onClick={handleRefund}
                                disabled={claimLoading || isRefunded}
                                className={`w-full rounded-xl font-bold py-2.5 text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer mt-1 ${!isRefunded
                                    ? ' bg-sky-500 btn-white-text hover:scale-[1.01] shadow-lg shadow-emerald-500/10'
                                    : 'bg-slate-500 btn-white-text cursor-not-allowed'
                                  }`}
                              >
                                {claimLoading ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Claiming Refund on Wallet...
                                  </>
                                ) : isRefunded ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>100% Refund Successfully Claimed</span>
                                  </>
                                ) : (
                                  <>
                                    <Coins className="h-3.5 w-3.5" />
                                    <span>Claim 100% USDT Refund ({contributedUsdt.toLocaleString()} USDT)</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-850 p-4 text-center text-slate-500 text-[11px] leading-relaxed font-semibold bg-slate-950/20">
                            Your connected wallet address did not participate in this project's allocation phase. Exploration of ongoing vetting projects and voting path is recommended!
                          </div>
                        )
                      ) : (
                        <button
                          onClick={onOpenConnect}
                          className="w-full rounded-xl bg-[#0098EA] btn-white-text py-3 text-xs shadow-lg cursor-pointer"
                        >
                          Connect Wallet to Claim Refund
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 font-sans text-xs">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto animate-pulse" />
                      <h4 className="font-bold text-emerald-400 text-sm">Campaign Successfully Finished</h4>
                      <p className="text-slate-350 text-[11px] leading-relaxed">
                        All sale conditions were satisfied. Claims are now active according to the on-chain monthly vesting rules.
                      </p>
                    </div>

                    <div className="rounded-xl border border-sky-400/30 bg-sky-400/20 p-4 space-y-2.5">
                      <h5 className="font-bold text-sky-350 text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-sky-400/30 pb-1.5">
                        <Coins className="h-3.5 w-3.5 text-[#0098EA]" />
                        Launchpool Vesting Setup
                      </h5>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">TGE Initial Unlock</span>
                          <span className="text-white text-xs font-bold font-mono text-[11px]">{tgePercent}% instantly</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">Vesting Schedule</span>
                          <span className="text-white text-xs font-bold font-mono text-[11px]">
                            {vestingMonths > 0 ? `${vestingMonths} months linear` : '100% at TGE'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">Cliff Before Linear Vesting</span>
                          <span className="text-white text-xs font-bold font-mono text-[11px]">
                            {cliffDurationDays > 0 ? `${cliffDurationDays} days` : 'No cliff'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {wallet.connected ? (
                      userContribution ? (
                        <div className="space-y-4">
                          <div className="rounded-xl bg-sky-400/20 p-4 border border-[#0098EA]/25 space-y-3 shadow-md">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wide">
                                <Calendar className="h-4 w-4 text-[#0098EA]" />
                                <span>Vesting Claim Schedule</span>
                              </div>
                              <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[9px] btn-white-text">
                                {completedVestingMonths} / {vestingMonths} months
                              </span>
                            </div>

                            {claimSnapshot.loading ? (
                              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-[11px] font-bold text-slate-400">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                                Reading claim status from contract...
                              </div>
                            ) : claimableNow > 0 ? (
                              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-center">
                                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                  {claimedAmount <= 0 ? 'TGE claim is ready' : 'Monthly vesting claim is ready'}
                                </p>
                                <p className="mt-1 font-mono text-sm font-black text-white">
                                  {claimableNow.toLocaleString()} ${project.symbol}
                                </p>
                              </div>
                            ) : isBeforeCliff ? (
                              <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-center">
                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                                  Cliff ends in
                                </p>
                                <p className="mt-1 font-mono text-sm font-black text-white">
                                  {cliffCountdown.days}d : {String(cliffCountdown.hours).padStart(2, '0')}h : {String(cliffCountdown.minutes).padStart(2, '0')}m : {String(cliffCountdown.seconds).padStart(2, '0')}s
                                </p>
                              </div>
                            ) : nextUnlockMs > 0 ? (
                              <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-3 text-center">
                                <p className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                                  Next monthly unlock in
                                </p>
                                <p className="mt-1 font-mono text-sm font-black text-white">
                                  {nextUnlockCountdown.days}d : {String(nextUnlockCountdown.hours).padStart(2, '0')}h : {String(nextUnlockCountdown.minutes).padStart(2, '0')}m : {String(nextUnlockCountdown.seconds).padStart(2, '0')}s
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Vesting schedule completed
                                </p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                                <span>Claimed {Math.round(claimedPercent)}%</span>
                                <span>Unlocked {Math.round(unlockedPercent)}%</span>
                              </div>
                              <div className="relative h-3 overflow-hidden rounded-full border border-slate-800 bg-slate-950">
                                <div
                                  className="absolute inset-y-0 left-0 rounded-full bg-sky-500/40"
                                  style={{ width: `${unlockedPercent}%` }}
                                />
                                <div
                                  className="absolute inset-y-0 left-0 rounded-full bg-emerald-400"
                                  style={{ width: `${claimedPercent}%` }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={refreshClaimSnapshot}
                                disabled={claimSnapshot.loading}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-400/[0.08] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-sky-300 transition hover:bg-sky-400/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${claimSnapshot.loading ? 'animate-spin' : ''}`} />
                                Refresh claim status
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                              <span>Your Total Escrow Allocation:</span>
                              <span className="font-mono text-white text-xs font-black">
                                {totalAllocated.toLocaleString()} ${project.symbol}
                              </span>
                            </div>

                            <div className="border-t border-slate-850/70 pt-2.5 space-y-2 text-[10px]">
                              <div className="flex justify-between items-center text-slate-400">
                                <span>TGE Share ({tgePercent}%)</span>
                                <span className="font-mono font-bold text-white">
                                  {tgeAmount.toLocaleString()} ${project.symbol}
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-slate-400">
                                <span>Linear Vest unlocked parts so far:</span>
                                <span className="font-mono font-bold text-white">
                                  {unlockedVestingPart.toLocaleString()} ${project.symbol} ({Math.round(unlockedPercent)}%)
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-slate-400 border-t border-slate-850/40 pt-2 text-[11px]">
                                <span>Total Unlocked:</span>
                                <span className="font-mono font-bold text-[#0098EA]">
                                  {totalUnlockedSoFar.toLocaleString()} ${project.symbol} ({Math.round(percentUnlockedTotal)}%)
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-slate-400">
                                <span>Successfully Claimed previously:</span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {claimedAmount.toLocaleString()} ${project.symbol}
                                </span>
                              </div>

                              {lockedRemaining > 0 && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span>Vesting escrow remaining locked:</span>
                                  <span className="font-mono">
                                    {lockedRemaining.toLocaleString()} ${project.symbol}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-[11px] font-black border-t border-dashed border-slate-800 pt-2.5">
                                <span className="text-[#00c5ee] uppercase">CONTRACT CLAIMABLE NOW:</span>
                                <span className="font-mono text-emerald-400 text-xs font-black animate-pulse">
                                  {claimableNow.toLocaleString()} ${project.symbol}
                                </span>
                              </div>
                              {claimedAmount > 0 && nextUnlockMs > 0 && claimableNow <= 0 && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span>Next claim window:</span>
                                  <span className="font-mono">
                                    {nextUnlockCountdown.days}d {String(nextUnlockCountdown.hours).padStart(2, '0')}h {String(nextUnlockCountdown.minutes).padStart(2, '0')}m
                                  </span>
                                </div>
                              )}
                            </div>

                            {claimError && (
                              <div className="rounded-lg border border-rose-500/30 bg-rose-500/15 p-2.5 text-[10px] font-sans text-rose-400">
                                {claimError}
                              </div>
                            )}

                            {claimSuccess && (
                              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 p-2.5 text-[10px] font-sans text-emerald-400">
                                {claimSuccess}
                              </div>
                            )}

                            {claimableNow > 0 || claimLoading ? (
                              <button
                                onClick={handleClaimTokens}
                                disabled={claimLoading}
                                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-sky-450 bg-[#0098EA] py-2.5 text-xs font-bold text-black btn-white-text shadow-lg shadow-emerald-500/10 transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer mt-1 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {claimLoading ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Claiming on wallet...
                                  </>
                                ) : (
                                  <>
                                    <Coins className="h-3.5 w-3.5" />
                                    {`Claim ${claimableNow.toLocaleString()} ${project.symbol}`}
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-center text-[11px] font-bold text-slate-400">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                Nothing claimable at this checkpoint
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-850 p-4 text-center text-slate-500 text-[11px] leading-relaxed font-semibold bg-slate-950/20">
                          Your connected wallet address did not participate during this active sale phase. Explore upcoming allocations and vote to screen listings!
                        </div>
                      )
                    ) : (
                      <button
                        onClick={onOpenConnect}
                        className="w-full rounded-xl bg-[#0098EA] btn-white-text font-black py-3 text-xs shadow-lg cursor-pointer"
                      >
                        Connect Wallet to Claim
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Animated Tx Ledger modal */}
      <AnimatePresence>
        {txStep !== 'idle' && (
          <div id="tx-signature-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B13]/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0F1624] p-6 text-center text-white shadow-2xl space-y-4"
            >
              {txStep === 'wallet_sign' && (
                <div className="flex flex-col items-center py-6 font-sans space-y-4">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-850" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#0098EA] animate-spin" />
                    <Coins className="h-5 w-5 text-[#0098EA] animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-base">Sign Investment Payload</h4>
                    <p className="text-xs text-slate-400 leading-relaxed px-2">
                      Transfer <span className="text-emerald-400 font-bold">${contAmount} USDT</span> to the launchpad. The wallet may separately show <span className="text-[#0098EA] font-bold">{USDT_TRANSFER_GAS} TON</span>, which is attached only to execute the USDT jetton transfer.
                    </p>
                  </div>
                </div>
              )}

              {txStep === 'confirming' && (
                <div className="flex flex-col items-center py-6 font-sans space-y-4">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-850" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 animate-spin" />
                    <Users className="h-5 w-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-base">Writing TON Block</h4>
                    <p className="text-xs text-slate-400 leading-relaxed px-4">
                      Waiting for the {contAmount} USDT jetton transfer to be confirmed on-chain. Your contribution will only be recorded after verification.
                    </p>
                  </div>
                </div>
              )}

              {txStep === 'complete' && (
                <div className="flex flex-col items-center py-6 font-sans space-y-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-6 w-6 text-emerald-400 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-base">USDT Allocation Settled!</h4>
                    <p className="text-xs text-slate-400 leading-relaxed px-2">
                      The USDT jetton transfer was confirmed on-chain and your token allocation has been recorded.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Advanced Stage Scheduler Modal */}
      <AnimatePresence>
        {showAdvanceModal && (
          <div id="advance-stage-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B13]/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F1624] p-6 text-white shadow-2xl space-y-5 text-left font-sans"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-[#0098EA]/10 border border-[#0098EA]/20 flex items-center justify-center text-[#0098EA]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0098EA] text-base uppercase tracking-wider">Schedule Next Phase</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Campaign Evolve & Date Lock</p>
                </div>
              </div>

              <form onSubmit={handleConfirmAdvanceStage} className="space-y-4">
                {!isConfirmingStage ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">Stage Evolvement Path</span>
                      <div className="flex items-center gap-2 text-xs bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800">
                        <span className="capitalize text-amber-400 font-bold">{project.idoStage}</span>
                        <span className="text-slate-600">➔</span>
                        <span className="capitalize text-emerald-400 font-extrabold font-sans">
                          {(() => {
                            if (project.idoStage === 'upcoming') return 'vote';
                            if (project.idoStage === 'vote') return 'preparation';
                            if (project.idoStage === 'preparation') return 'whitelist';
                            if (project.idoStage === 'whitelist') return 'sale';
                            if (project.idoStage === 'sale') return 'distribution';
                            return 'Completed';
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="next-phase-date-input" className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">
                        Next Phase Launch Date & Time
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="next-phase-date-input"
                          type="datetime-local"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-[#0098EA]/60 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none transition duration-205 cursor-pointer"
                          value={selectedNextPhaseDate}
                          onChange={(e) => setSelectedNextPhaseDate(e.target.value)}
                          onClick={(e) => {
                            try {
                              e.currentTarget.showPicker();
                            } catch (err) { }
                          }}
                          required
                        />
                        <div className="absolute right-3.5 text-slate-500 pointer-events-none">
                          <Calendar className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Presets Grid */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[9px] text-slate-500 font-medium self-center mr-1">Constants:</span>
                        {[
                          { label: '+5 Mins', ms: 5 * 60 * 1000 },
                          { label: '+1 Hour', ms: 60 * 60 * 1000 },
                          { label: '+1 Day', ms: 24 * 60 * 60 * 1000 },
                          { label: '+3 Days', ms: 3 * 24 * 60 * 60 * 1000 },
                          { label: '+7 Days', ms: 7 * 24 * 60 * 60 * 1000 }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              const d = new Date(Date.now() + preset.ms);
                              const year = d.getFullYear();
                              const month = String(d.getMonth() + 1).padStart(2, '0');
                              const day = String(d.getDate()).padStart(2, '0');
                              const hours = String(d.getHours()).padStart(2, '0');
                              const minutes = String(d.getMinutes()).padStart(2, '0');
                              setSelectedNextPhaseDate(`${year}-${month}-${day}T${hours}:${minutes}`);
                            }}
                            className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-[#0098EA]/50 text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1 pt-1">
                        <AlertCircle className="h-4 w-4 text-[#0098EA] shrink-0 mt-0.5" />
                        <span>The live ticking countdown timer in the Participation Hub will count down precisely to this selected timestamp.</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAdvanceModal(false)}
                        className="flex-1 text-center font-bold text-slate-400 rounded-xl border border-slate-800 hover:bg-slate-900 py-2.5 text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 text-center font-black bg-gradient-to-r from-sky-500 to-[#fff] text-black rounded-xl hover:scale-[1.015] py-2.5 text-xs transition duration-200 cursor-pointer shadow-lg shadow-[#0098EA]/10"
                      >
                        Advance Phase ➔
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Irreversible Confirmation Panel */}
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-3.5 text-xs text-rose-200 leading-relaxed font-sans">
                      <div className="flex items-center gap-2 pb-2 border-b border-rose-500/10 text-rose-400 font-extrabold uppercase tracking-wider">
                        <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 animate-pulse" />
                        <h4>On-Chain Intent Confirmation</h4>
                      </div>
                      <p className="font-medium text-[11px]">
                        Please read the following mainnet guidelines before deploying:
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 text-[11px] text-rose-300">
                        <li>This launches the phase-change transaction on <strong>TON Mainnet</strong>.</li>
                        <li>This action code <strong>CANNOT BE REVERTED</strong> once finalized.</li>
                        <li>Stage timing will be recorded until {new Date(selectedNextPhaseDate).toLocaleString()}</li>
                      </ul>

                      <label className="flex items-start gap-3 mt-3 p-3 bg-slate-950/60 rounded-xl border border-rose-500/20 hover:border-rose-400/40 transition cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 rounded border-rose-500/30 text-rose-500 focus:ring-rose-500 h-4 w-4 shrink-0 bg-[#0F1624] accent-rose-500"
                          checked={confirmationChecked}
                          onChange={(e) => setConfirmationChecked(e.target.checked)}
                        />
                        <span className="text-[11px] text-slate-300 select-none leading-snug">
                          I understand this stage change may trigger an irreversible TON transaction.
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingStage(false)}
                        className="flex-1 text-center font-bold text-slate-400 rounded-xl border border-slate-800 hover:bg-slate-900 py-2.5 text-xs transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!confirmationChecked}
                        className={`flex-1 text-center font-black rounded-xl py-2.5 text-xs transition duration-200 cursor-pointer shadow-lg ${confirmationChecked
                            ? "bg-rose-500 hover:bg-rose-600 text-white hover:scale-[1.015] shadow-rose-500/10"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                          }`}
                      >
                        Confirm & Evolve Stage
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
