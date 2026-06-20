/**
 * Types & Interfaces for the TON Blockchain Launchpad
 */

export interface TokenContribution {
  contributor: string;
  usdtAmount: number;
  tokenAmount: number;
  timestamp: number;
  claimedAmount?: number; // Total successfully claimed tokens so far
  refunded?: boolean; // Whether investor has claimed a refund due to failed soft cap
}

export interface AIAudit {
  trustScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  utilityRating: 'EXCELLENT' | 'GOOD' | 'SPECULATIVE' | 'POOR';
  liquidityAnalysis: string;
  whitelistRecommendation: string;
  overallEvaluation: string;
  concerns: string[];
  recommendations: string[];
}

export interface LaunchpadProject {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  logo: string;
  banner: string;
  description: string;
  creator: string;
  rate: number; // JETTON tokens per 1 USDT (e.g. 1 USDT = 10 JETTON)
  softCap: number; // in USDT
  hardCap: number; // in USDT
  minBuy: number; // in USDT
  maxBuy: number; // in USDT
  raised: number; // in USDT
  startTime: number; // timestamp ms
  endTime: number; // timestamp ms
  status: 'upcoming' | 'active' | 'success' | 'failed'; // Legacy status for list compatibility
  idoStage: 'vote' | 'preparation' | 'whitelist' | 'sale' | 'distribution' | 'upcoming';
  votesUp: number;
  votesDown: number;
  userVoted?: 'up' | 'down';
  votedAddresses?: Record<string, 'up' | 'down'>;
  userVoteProgress?: 'pending' | 'done';
  voteProgressByAddress?: Record<string, {
    status: 'pending' | 'done';
    voteType?: 'up' | 'down';
    txHash?: string;
    updatedAt: number;
  }>;
  whitelistCount: number;
  isUserWhitelisted?: boolean;
  whitelistedAddresses?: string[];
  vestingTgePercent: number; // e.g. 20 means 20% unlocked instantly
  cliffDurationDays?: number; // Optional claim cliff before linear vesting starts
  vestingMonths: number; // Monthly vesting periods used by the IDO contract
  vestingDays?: number; // Legacy records only
  liquidityPercent?: number; // Legacy records only
  lockedDays?: number; // Legacy records only
  distributionStartTime?: number; // timestamp when distribution began
  nextPhaseTime?: number; // timestamp ms till next phase starts
  contributionsCount: number;
  contributions: TokenContribution[];
  aiAudit?: AIAudit;
  kycStatus?: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  auditStatus?: 'not_submitted' | 'pending' | 'automated_review' | 'verified' | 'issues_found';
  website?: string;
  telegram?: string;
  twitter?: string;
  discord?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  reddit?: string;
  medium?: string;
  jettonAddress?: string; // Deployer contract address EQ...
  idoContractAddress?: string; // Unique IDO contract address EQ...
  contractDeploymentId?: string;
  contractVersion?: number;
  contractStage?: number;
  usdtDecimals?: number;
  saleTokenRequired?: string;
  chainTxHash?: string;
  enabled?: boolean;
  promoted?: boolean;
  listingStatus?: 'auto' | 'upcoming' | 'under_review' | 'hidden' | 'active';
}

export interface HomePageData {
  trendingProjects: LaunchpadProject[];
  promotedProjects: LaunchpadProject[];
  liveProjects: LaunchpadProject[];
  upcomingProjects: LaunchpadProject[];
  underReviewProjects: LaunchpadProject[];
  pastProjects: LaunchpadProject[];
  stats: {
    totalRaised: number;
    totalProjects: number;
    liveProjects: number;
  };
}

export interface SwapSettings {
  contractAddress: string;
  ownerAddress: string;
  gramMasterAddress: string;
  gramSymbol: string;
  gramDecimals: number;
  usdtMasterAddress: string;
  usdtSymbol: string;
  usdtDecimals: number;
  rateScaled: string;
  tonRateScaled?: string;
  rateScale: number;
  rateLabel: string;
  tonRateLabel?: string;
  maxBuyRaw?: string;
  maxBuyLabel?: string;
  deploymentId?: string;
  gramWalletAddress?: string;
  usdtWalletAddress?: string;
  paused?: boolean;
  updatedAt?: number;
}

export interface ProjectApplication {
  id: string;
  submittedAt: number;
  projectName: string;
  tokenSymbol: string;
  decimals: number;
  logo: string;
  category: string;
  projectSummary: string;
  productStatus: string;
  website: string;
  whitepaper: string;
  pitchDeck: string;
  github: string;
  telegram: string;
  twitter: string;
  discord: string;
  facebook: string;
  instagram: string;
  reddit: string;
  medium: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactTelegram: string;
  teamSize: number;
  teamBackground: string;
  companyCountry: string;
  legalEntity: string;
  kycReady: boolean;
  auditStatus: string;
  auditLink: string;
  jettonAddress: string;
  totalSupply: string;
  targetRaiseUsdt: number;
  softCapUsdt: number;
  tokenPriceUsdt: number;
  liquidityPercent: number;
  vestingDurationMonths: number;
  vestingCliffMonths: number;
  vestingTgePercent: number;
  launchTimeline: string;
  communitySize: string;
  referralSource: string;
  additionalNotes: string;
  consent: boolean;
  status?: 'in_review' | 'approved' | 'rejected';
}

export interface AdminSession {
  authenticated: boolean;
  email?: string;
  csrfToken?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  walletType: 'tonkeeper' | 'mytonwallet' | 'tonhub' | 'telegram' | null;
  network: 'mainnet' | 'testnet';
}

export interface TransactionRecord {
  id: string;
  type: 'buy' | 'create' | 'claim' | 'vote' | 'whitelist' | 'faucet' | 'refund';
  projectId: string;
  projectName: string;
  usdtAmount: number;
  tokenAmount: number;
  tokenSymbol: string;
  timestamp: number;
  txHash: string;
}
