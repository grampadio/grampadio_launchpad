import { useEffect, useState } from 'react';
import { Search, Loader2, Calendar, ShieldCheck, CheckCircle, TrendingUp, ArrowUpRight, Activity, LockKeyhole, ChevronLeft, ChevronRight, Users, Target, Sparkles, Coins, Rocket, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { LaunchpadProject, WalletState } from '../types.js';
import { DEFAULT_PROJECT_BANNER, DEFAULT_PROJECT_LOGO, projectAssetOrDefault } from '../constants/assets.js';

interface LaunchpadListProps {
  projects: LaunchpadProject[];
  loading: boolean;
  wallet: WalletState;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalRaised: number;
    totalProjects: number;
    liveProjects: number;
  };
  onQueryChange: (query: { page: number; search: string; stage: string }) => void;
  onSelectProject: (id: string) => void;
  onOpenConnect: () => void;
}

export default function LaunchpadList({
  projects,
  loading,
  wallet,
  pagination,
  stats,
  onQueryChange,
  onSelectProject,
  onOpenConnect,
}: LaunchpadListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'vote' | 'preparation' | 'whitelist' | 'sale' | 'distribution' | 'my'>('all');
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const pageStartIndex = (currentPage - 1) * pagination.limit;
  const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onQueryChange({ page: 1, search: searchTerm, stage: activeFilter });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const changePage = (page: number) => {
    onQueryChange({
      page: Math.min(totalPages, Math.max(1, page)),
      search: searchTerm,
      stage: activeFilter,
    });
    document.getElementById('project-grid-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getStageBadge = (stage: LaunchpadProject['idoStage'],status:string) => {
    switch (stage) {
      case 'upcoming':
        return (
          <span className="gp-project-stage-badge inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-slate-950/90 px-2.5 py-1 text-xs font-semibold text-amber-300 shadow-lg backdrop-blur-md">
            <Calendar className="h-3 w-3 text-amber-400" />
            Upcoming
          </span>
        );
      case 'vote':
        return (
          <span className="gp-project-stage-badge inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-slate-950/90 px-2.5 py-1 text-xs font-semibold text-blue-300 shadow-lg backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Vote Stage
          </span>
        );
      case 'preparation':
        return (
          <span className="gp-project-stage-badge inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-slate-950/90 px-2.5 py-1 text-xs font-semibold text-purple-300 shadow-lg backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            Preparation
          </span>
        );
      case 'whitelist':
        return (
          <span className="gp-project-stage-badge inline-flex items-center gap-1.5 rounded-full border border-amber-400/45 bg-slate-950/90 px-2.5 py-1 text-xs font-semibold text-amber-300 shadow-lg backdrop-blur-md">
            <Calendar className="h-3 w-3 text-amber-400" />
            Whitelist Active
          </span>
        );
      case 'sale':
        return (
          <span className="gp-project-stage-badge inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-slate-950/90 px-2.5 py-1 text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sale
          </span>
        );
      case 'distribution':
        return (
          <>
          <span className="gp-project-stage-badge inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-slate-950/90 px-2.5 py-1 text-xs font-semibold text-sky-300 shadow-lg backdrop-blur-md">
            <CheckCircle className="h-3 w-3 text-sky-400" />
            Completed
          </span>
          {
            status === "failed"?
            <span className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/90 px-2.5 py-1 text-xs font-semibold btn-white-text shadow-lg backdrop-blur-md">
            <AlertTriangle className="h-3 w-3 btn-white-text" />
            Failed
          </span>
          :""
          }
          
          </>
        );
    }
  };

  // Math helper for display progress
  const getProgressPercentage = (raised: number, hardCap: number) => {
    const pct = (raised / hardCap) * 100;
    return Math.min(100, Math.max(0, pct));
  };

  // Calculating global launchpad statistics for dashboard in USDT
  const totalUSDTRaised = stats.totalRaised;
  const totalProjectsCount = stats.totalProjects;
  const liveCount = stats.liveProjects;
  const activeStages = ['upcoming', 'vote', 'voting', 'preparation', 'whitelist', 'sale'];
  const isSearching = searchTerm.trim().length > 0;
  const visibleProjects = isSearching
    ? projects
    : activeFilter === 'all'
    ? projects.filter(
        project => {
          const stage = String(project.idoStage || '').toLowerCase();
          return activeStages.includes(stage) &&
          project.listingStatus !== 'hidden' &&
          project.listingStatus !== 'under_review';
        }
      )
    : activeFilter === 'upcoming'
      ? projects.filter(project => project.idoStage === 'upcoming' || project.listingStatus === 'upcoming')
      : projects;

  return (
    <div id="launchpad-list-section" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      
      {/* 1. Protocol Hero / Stat Dashboard Banner */}
      <div className="gp-explore-hero relative mb-8 overflow-hidden rounded-[32px] border border-sky-400/10 p-6 sm:p-9 lg:p-11">
        <div className="absolute -right-16 -top-24 h-96 w-96 rounded-full bg-[#0098EA]/[0.16] blur-[100px]" />
        <div className="absolute -bottom-32 left-[38%] h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-[80px]" />
        <div className="absolute inset-y-0 right-0 hidden w-[45%] opacity-50 lg:block" style={{ backgroundImage: 'linear-gradient(135deg, transparent 25%, rgba(0,152,234,.07) 25%, rgba(0,152,234,.07) 50%, transparent 50%, transparent 75%, rgba(0,152,234,.07) 75%)', backgroundSize: '34px 34px' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="gp-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
              </span>
              TON launch market
            </div>
            <h1 className="gp-gradient-text gp-display-font mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
              Discover the next wave of TON-native projects.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400 sm:text-[15px]">
              Grampad is a TON-native IDO launchpad where vetted projects raise USDT through transparent, smart-contract-powered token sales. Community voting, gated allocations, and vesting come together in one verifiable launch flow.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="gp-explore-proof"><ShieldCheck className="h-3.5 w-3.5 text-sky-400" /> On-chain settlement</span>
              <span className="gp-explore-proof"><LockKeyhole className="h-3.5 w-3.5 text-cyan-300" /> Escrow protected</span>
              <span className="gp-explore-proof"><Sparkles className="h-3.5 w-3.5 text-violet-300" /> AI Trust Review</span>
            </div>
          </div>

          {/* Aggregated Stat Counters */}
          <div className="grid min-w-[310px] grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.07] shadow-2xl backdrop-blur-xl">
            <div className="gp-explore-stat px-4 py-5 sm:px-5">
              <Coins className="mb-4 h-4 w-4 text-sky-400" />
              <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Total raised</span>
              <span className="mt-2 block text-xl font-black tracking-tight text-white sm:text-2xl">
                ${totalUSDTRaised.toLocaleString()}
              </span>
              <span className="text-[9px] font-semibold text-sky-400">USDT</span>
            </div>
            <div className="gp-explore-stat px-4 py-5 sm:px-5">
              <Rocket className="mb-4 h-4 w-4 text-cyan-300" />
              <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Projects</span>
              <span className="mt-2 block text-xl font-black tracking-tight text-white sm:text-2xl">
                {totalProjectsCount}
              </span>
              <span className="text-[9px] font-semibold text-slate-500">launched</span>
            </div>
            <div className="gp-explore-stat px-4 py-5 sm:px-5">
              <Activity className="mb-4 h-4 w-4 text-emerald-400" />
              <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Live now</span>
              <span className="mt-2 block text-xl font-black tracking-tight text-emerald-400 sm:text-2xl">
                {liveCount}
              </span>
              <span className="text-[9px] font-semibold text-slate-500">active sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project stage filters and search */}
      <div className="gp-explore-toolbar mb-7 flex flex-col gap-4 rounded-2xl border border-white/[0.07] p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
        
        {/* Launch lifecycle filters */}
        <div className="flex flex-wrap gap-1 self-start xl:self-auto">
          {(['all', 'upcoming', 'vote', 'preparation', 'whitelist', 'sale', 'distribution', 'my'] as const).map((filter) => {
            const label = filter === 'all' ? 'All Active' :
                          filter === 'upcoming' ? 'Upcoming' :
                          filter === 'vote' ? 'Voting' :
                          filter === 'preparation' ? 'Preparation' :
                          filter === 'whitelist' ? 'Whitelist' :
                          filter === 'sale' ? 'Live Sale' :
                          filter === 'distribution' ? 'Completed' : 'My Portfolio';

            // Check connection first if selecting portfolio
            const isDisabled = filter === 'my' && !wallet.connected;

            return (
              <button
                key={filter}
                onClick={() => {
                  if (isDisabled) {
                    onOpenConnect();
                    return;
                  }
                  setActiveFilter(filter);
                  onQueryChange({ page: 1, search: searchTerm, stage: filter });
                }}
                className={`relative rounded-xl px-3.5 py-2.5 text-[11px] font-bold transition ${
                  activeFilter === filter
                    ? 'bg-[#0098EA] btn-white-text shadow-[0_8px_25px_rgba(0,152,234,0.22)]'
                    : isDisabled 
                      ? 'cursor-not-allowed text-slate-600'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {label}
                {filter === 'my' && !wallet.connected && (
                  <span className="block text-[8px] font-normal leading-3 text-[#0098EA]">Requires sign</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Searching bar */}
        <div className="relative w-full shrink-0 xl:w-80">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects or tickers"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="w-full rounded-xl border border-white/[0.08] bg-black/15 py-3 pl-11 pr-4 text-xs text-white placeholder-slate-600 transition focus:border-sky-400/40 focus:bg-white/[0.04]"
          />
        </div>
      </div>

      {/* 3. Grid of Projects */}
      <div id="project-grid-start" className="scroll-mt-24" />
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0098EA]" />
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E2E4E] p-12 text-center bg-slate-950/20">
          <TrendingUp className="h-10 w-10 text-slate-500 mb-3" />
          <h3 className="font-semibold text-lg text-slate-200">No IDO Projects Detected</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {activeFilter === 'my' 
              ? "You haven't launched or contributed to any tokens on this network yet."
              : `Try exploring other stages or adjust your search words.`}
          </p>
        </div>
      ) : (
        <>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => {
            const raisedPercent = getProgressPercentage(project.raised, project.hardCap);
            const softCapPercent = getProgressPercentage(project.softCap, project.hardCap);

            return (
              <motion.div
                key={project.id}
                layoutId={`card-${project.id}`}
                onClick={() => onSelectProject(project.id)}
                className="gp-project-card group flex cursor-pointer flex-col overflow-hidden rounded-[24px] text-white transition duration-300 hover:-translate-y-1.5"
              >
                {/* Banner wrapper */}
                <div className="gp-project-banner relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={projectAssetOrDefault(project.banner, DEFAULT_PROJECT_BANNER)}
                    alt={project.name}
                    className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.06] group-hover:opacity-100"
                  />
                  <div className="gp-project-banner-fade absolute inset-0" />
                  {/* Project status badge */}
                  <div className="absolute top-3 left-3">
                    {getStageBadge(project.idoStage,project.status)}
                  </div>

                  {/* Trust Score AI Audit Badge */}
                  {project.aiAudit && (
                    <div className="gp-project-trust-badge absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-white/20 bg-slate-950/90 px-2.5 py-1 text-[10px] font-bold shadow-lg backdrop-blur-md">
                      <ShieldCheck className={`h-3.5 w-3.5 ${
                        project.aiAudit.trustScore >= 90 ? 'text-[#00D2FF]' :
                        project.aiAudit.trustScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                      }`} />
                      <span className="text-slate-300 font-mono">
                        Trust <span className="text-white">{project.aiAudit.trustScore}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Content body */}
                <div className="relative flex flex-1 flex-col p-5 sm:p-6">
                  
                  {/* Logo overlay offset */}
                  <div className="gp-project-logo absolute -top-10 left-5 h-16 w-16 overflow-hidden rounded-2xl border-[4px] bg-slate-900 shadow-xl sm:left-6">
                    <img
                      src={projectAssetOrDefault(project.logo, DEFAULT_PROJECT_LOGO)}
                      alt={`${project.name} Logo`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details section */}
                  <div className="mt-9">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="max-w-[210px] truncate text-lg font-extrabold tracking-tight text-white transition group-hover:text-sky-300">
                        {project.name}
                      </h4>
                      <span className="gp-project-symbol rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-300">
                        ${project.symbol}
                      </span>
                    </div>
                    
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400 leading-relaxed min-h-[32px]">
                      {project.description}
                    </p>
                  </div>

                  {/* Standardized stats grid */}
                  <div className="gp-project-stats mt-5 grid grid-cols-2 gap-3 border-y py-4 text-xs">
                    <div>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600"><TrendingUp className="h-3 w-3" /> Token rate</span>
                      <span className="font-semibold text-slate-200 mt-1 block font-mono">
                        1 USDT = {project.rate.toLocaleString()} {project.symbol}
                      </span>
                    </div>
                    <div>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600"><LockKeyhole className="h-3 w-3" /> Linear Vesting</span>
                      <span className="font-semibold text-emerald-400 mt-1 block font-mono">
                        {project.vestingMonths ?? Math.max(1, Math.ceil((project.vestingDays || 90) / 30))} months
                      </span>
                    </div>
                    <div>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600"><Target className="h-3 w-3" /> Allocation</span>
                      <span className="font-semibold text-slate-200 mt-1 block font-mono">
                        {project.minBuy} - {project.maxBuy} USDT
                      </span>
                    </div>
                    <div>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600"><Users className="h-3 w-3" /> Participation</span>
                      <span className="font-semibold font-mono text-[#0098EA] mt-1 block">
                        {project.idoStage === 'upcoming' ? 'Scheduled' :
                         project.idoStage === 'vote' ? `${project.votesUp + project.votesDown} Votes` :
                         project.idoStage === 'whitelist' ? `${project.whitelistCount} Registered` :
                         project.idoStage === 'preparation' ? 'Params locked' : `${project.contributionsCount} Contributors`}
                      </span>
                    </div>
                  </div>

                  {/* progress tracking block */}
                  <div className="mt-5 flex flex-col font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-emerald-400 font-mono">
                        ${project.raised.toLocaleString()} <span className="text-slate-400 font-normal">USDT raised</span>
                      </span>
                      <span className="text-slate-300 font-mono">{raisedPercent.toFixed(1)}%</span>
                    </div>

                    <div className="gp-project-progress relative h-2 w-full overflow-hidden rounded-full">
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-washed bg-rose-400 opacity-60 z-10"
                        style={{ left: `${softCapPercent}%` }}
                        title={`Soft Cap threshold: ${project.softCap} USDT`}
                      />
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#0098EA] to-cyan-300"
                        style={{ width: `${raisedPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                      <span>Soft: ${project.softCap.toLocaleString()} USDT</span>
                      <span>Hard: ${project.hardCap.toLocaleString()} USDT</span>
                    </div>
                  </div>

                  {/* Card bottom footer detail CTA */}
                  <div className="gp-project-footer mt-5 flex items-center justify-between border-t pt-4">
                    <span className="text-[10px] text-slate-400 font-medium font-sans">
                      {project.idoStage === 'upcoming' ? 'Launch Scheduled' :
                       project.idoStage === 'vote' ? 'Voting Phase Active' :
                       project.idoStage === 'whitelist' ? 'Whitelisting Open' :
                       project.idoStage === 'preparation' ? 'Deploying Vesting' :
                       project.idoStage === 'sale' ? 'Sale Stage Live' : 'Claims & Distributions'}
                    </span>
                    <span className="gp-project-cta flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-400">
                      {project.idoStage === 'upcoming' ? 'View upcoming' :
                       project.idoStage === 'vote' ? 'Review & Vote' :
                       project.idoStage === 'whitelist' ? 'Join whitelist' : 'View project'}
                      <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 sm:flex-row">
            <span className="text-[11px] font-medium text-slate-500">
              Showing <strong className="text-slate-300">{pageStartIndex + 1}-{Math.min(pageStartIndex + pagination.limit, pagination.total)}</strong> of{' '}
              <strong className="text-slate-300">{pagination.total}</strong> projects
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-9 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] font-bold text-slate-300 transition hover:border-sky-400/30 hover:text-sky-400 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {visiblePageNumbers.map((page, index) => {
                const previousPage = visiblePageNumbers[index - 1];
                return (
                  <span key={page} className="contents">
                    {previousPage && page - previousPage > 1 && (
                      <span className="px-1 text-xs text-slate-500">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => changePage(page)}
                      aria-current={page === currentPage ? 'page' : undefined}
                      className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold transition ${
                        page === currentPage
                          ? 'bg-[#0098EA] text-white shadow-[0_8px_24px_rgba(0,152,234,0.2)]'
                          : 'border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-sky-400/30 hover:text-sky-400'
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}

              <button
                type="button"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-9 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] font-bold text-slate-300 transition hover:border-sky-400/30 hover:text-sky-400 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        </>
      )}

    </div>
  );
}
