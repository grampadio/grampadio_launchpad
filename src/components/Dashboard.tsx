import { useState, useEffect } from 'react';
import { Smartphone, Coins, Layers, CheckCircle2, TrendingUp, HelpCircle, AlertCircle, History, ExternalLink, Calendar, Vote, UserCheck } from 'lucide-react';
import { LaunchpadProject, WalletState, TransactionRecord } from '../types.js';
import { DEFAULT_PROJECT_LOGO, projectAssetOrDefault } from '../constants/assets.js';

interface DashboardProps {
  wallet: WalletState;
  projects: LaunchpadProject[];
  onSelectProject: (id: string) => void;
  onOpenConnect: () => void;
  
}

export default function Dashboard({ wallet, projects, onSelectProject, onOpenConnect }: DashboardProps) {
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>([]);

  // Load transactions from MongoDB
  useEffect(() => {
    if (!wallet.connected || !wallet.address) return;

    const loadTransactions = async () => {
      // 1. Seed from client cache immediately for zero-flicker UX
      const stored = localStorage.getItem('ton_launchpad_txs');
      if (stored) {
        try {
          setTxHistory(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse cached tx log', e);
        }
      }

      // 2. Fetch the true system source of truth from MongoDB
      try {
        const res = await fetch(`/api/transactions?address=${encodeURIComponent(wallet.address || '')}`);
        if (res.status === 200) {
          const remoteTxs = await res.json();
          if (Array.isArray(remoteTxs)) {
            setTxHistory(remoteTxs);
            localStorage.setItem('ton_launchpad_txs', JSON.stringify(remoteTxs));
          }
        }
      } catch (err) {
        console.error('Failed to retrieve transactions from MongoDB:', err);
      }
    };

    loadTransactions();
  }, [wallet.connected, wallet.address]);

  if (!wallet.connected || !wallet.address) {
    return (
      <div id="dashboard-not-connected" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center text-xs text-slate-300">
        <div className="max-w-md mx-auto rounded-3xl border border-[#1E2E4E]/50 bg-[#0F182A] p-8 text-white shadow-xl">
          <Smartphone className="h-12 w-12 text-[#0098EA] mx-auto mb-4 animate-pulse" />
          <h3 className="font-bold text-xl mb-2">Connect Your TON Wallet</h3>
          <p className="text-xs text-slate-450 mb-6 leading-relaxed">
            Connect your TON wallet to view Grampad allocations, launched projects, claims, and transaction history.
          </p>
          <button
            onClick={onOpenConnect}
            className="w-full rounded-xl bg-gradient-to-r from-[#0098EA] to-[#00D2FF] py-3 text-sm font-semibold btn-white-text hover:opacity-95 transition-all shadow-lg shadow-[#0098EA]/10 cursor-pointer"
          >
            Connect TON Wallet
          </button>
        </div>
      </div>
    );
  }

  // Filter projects I participated in
  const myContributions = projects.filter(project => {
    return project.contributions.some(
      contribution => contribution.contributor.toLowerCase() === wallet.address?.toLowerCase()
    );
  });

  // Filter projects I created
  const myCreatedProjects = projects.filter(
    project => project.creator.toLowerCase() === wallet.address?.toLowerCase()
  );

  return (
    <div id="investor-dashboard-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 text-white text-xs">
      
      {/* Wallet and portfolio overview cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 font-sans sm:grid-cols-2 sm:gap-6">
        
        {/* Wallet connection card */}
        <div className="flex h-40 min-w-0 flex-col justify-between rounded-2xl border border-[#1E2E4E]/50 bg-[#0F182A] p-5">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-450 font-bold mb-1 block">Wallet Connection</span>
            <div className="mt-2 flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#0098EA]/20 bg-[#0098EA]/10 text-[#00D2FF]">
                <Smartphone className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <span className="block truncate text-xs font-bold capitalize text-white">
                  {wallet.walletType || 'TON Wallet'}
                </span>
                <span className="mt-1 block truncate font-mono text-[10px] font-semibold text-slate-400 select-all" title={wallet.address}>
                  {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-3 border-t border-[#1E2E4E]/25 pt-3">
            <span className="shrink-0 text-[10px] font-semibold text-slate-500">Network</span>
            <span className="truncate rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-400">
              {wallet.network.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Dynamic global investment multipliers counter */}
        <div className="rounded-2xl border border-[#1E2E4E]/50 bg-[#0F182A] p-5 flex flex-col justify-between h-40">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Portfolio Metrics</span>
            <div className="grid grid-cols-2 gap-4 mt-2.5">
              <div>
                <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">Campaigns backed</span>
                <span className="text-lg font-extrabold font-mono text-white mt-1 block">{myContributions.length} IDO</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">Campaigns Launched</span>
                <span className="text-lg font-extrabold font-mono text-[#0098EA] mt-1 block">{myCreatedProjects.length} Pool</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1E2E4E]/25 pt-2 text-[9px] text-slate-500 font-bold">
            Real-time protocol metrics.
          </div>
        </div>

      </div>

      {/* Main Grid: My Participations vs My Launches */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* Left column: My Participations */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-base text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
            My Active Investments ({myContributions.length})
          </h3>

          {myContributions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1E2E4E]/40 p-10 text-center text-slate-500 bg-slate-950/10">
              <Coins className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-bounce" />
              <p className="font-semibold text-white">No active IDO allocations detected</p>
              <p className="text-[10.5px] max-w-xs mx-auto mt-1 leading-relaxed text-slate-400">
                Any launchpools you contribute USDT to during Active Sale phases will record automatically below with claiming vouchers.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {myContributions.map(project => {
                const myBuy = project.contributions.reduce((acc, c) => {
                  if (c.contributor.toLowerCase() === wallet.address?.toLowerCase()) {
                    return acc + (c.usdtAmount || 0);
                  }
                  return acc;
                }, 0);

                const claimableToken = myBuy * project.rate;

                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="group rounded-2xl border border-[#1E2E4E]/50 bg-[#0F182A] p-4.5 flex gap-4 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <img src={projectAssetOrDefault(project.logo, DEFAULT_PROJECT_LOGO)} className="h-12 w-12 rounded-xl object-cover border border-[#1E2E4E]/50 shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-white group-hover:text-[#0098EA] transition truncate text-sm">
                          {project.name}
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase font-sans shrink-0 ${
                          project.idoStage === 'sale' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                          project.idoStage === 'distribution' ? 'text-[#0098EA] bg-[#0098EA]/10 border border-[#0098EA]/20' :
                          'text-amber-400 bg-amber-500/10'
                        }`}>
                          IDO: {project.idoStage}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-3 border-t border-[#1E2E4E]/20 pt-3 text-xs font-sans">
                        <div className="min-w-0">
                          <span className="text-slate-500 block text-[9px] uppercase font-bold text-slate-400 truncate">Invested USDT</span>
                          <span className="font-mono text-emerald-400 font-extrabold block truncate">${myBuy.toLocaleString()}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-slate-500 block text-[9px] uppercase font-bold font-sans truncate">Allocation</span>
                          <span className="font-mono text-white font-extrabold block truncate text-ellipsis" title={`${claimableToken.toLocaleString()} $${project.symbol}`}>
                            {claimableToken.toLocaleString()} ${project.symbol}
                          </span>
                          
                        </div>
                        <div className="min-w-0">
                          <span className="text-slate-500 block text-[9px] uppercase font-bold font-sans truncate">Project Status</span>
                        <span
                        className={`uppercase font-mono font-extrabold block truncate text-ellipsis ${
                        project.status === 'failed'
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                        }`}
                        >
                        {project.status}
                        </span>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: My Deployed Projects */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-base text-slate-200 flex items-center gap-1.5">
            <Layers className="h-4.5 w-4.5 text-[#0098EA]" />
            Launched IDO Jetton Campaigns ({myCreatedProjects.length})
          </h3>

          {myCreatedProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1E2E4E]/40 p-10 text-center text-slate-500 bg-slate-950/10">
              <TrendingUp className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-pulse" />
              <p className="font-semibold text-white">No custom launches found</p>
              <p className="text-[10.5px] max-w-xs mx-auto mt-1 leading-relaxed text-slate-400">
                Create a transparent TON token sale with Grampad's staged launch workflow.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 font-sans">
              {myCreatedProjects.map(project => {
                const raisedPct = Math.min(100, (project.raised / project.hardCap) * 100);

                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="group rounded-2xl border border-[#1E2E4E]/50 bg-[#0F182A] p-4.5 flex flex-col hover:border-[#0098EA]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <img src={projectAssetOrDefault(project.logo, DEFAULT_PROJECT_LOGO)} className="h-11 w-11 rounded-xl object-cover border border-[#1E2E4E]/50 shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-white group-hover:text-[#0098EA] transition truncate text-sm">
                            {project.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-sky-400 uppercase shrink-0">
                            ${project.symbol}
                          </span>
                        </div>
                        <span className="text-[9px] text-[#0098EA] block mt-0.5 truncate select-all font-mono">Stage: {project.idoStage.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 border-t border-[#1E2E4E]/20 pt-3 flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] font-bold text-slate-400 mb-1 gap-1">
                        <span className="truncate">Sale Progress: ${project.raised.toLocaleString()} / ${project.hardCap.toLocaleString()} USDT</span>
                        <span className="text-[#0098EA] font-mono shrink-0">{raisedPct.toFixed(1)}%</span>
                      </div>
                      
                      <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#0098EA] to-[#00D2FF] rounded-full" style={{ width: `${raisedPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Persistent Blockchain Ledger Transactions Log */}
      <div className="mt-8 border-t border-[#1E2E4E]/30 pt-8 flex flex-col gap-4">
        <h3 className="font-bold text-base text-slate-200 flex items-center gap-1.5">
          <History className="h-4.5 w-4.5 text-[#00D2FF]" />
          Transaction History ({txHistory.length})
        </h3>

        {txHistory.length === 0 ? (
          <div className="rounded-xl bg-[#090E1A] p-6 text-center text-slate-500 border border-[#1E2E4E]/30 font-semibold text-xs">
            No local blocks logged in this browser sandbox yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#1E2E4E]/40 leading-relaxed bg-[#0F182A]">
            <table className="w-full text-left font-mono">
              <thead className="bg-[#0B0F19] text-slate-450 text-[9px] uppercase border-b border-[#1E2E4E]/40 whitespace-nowrap">
                <tr>
                  <th className="px-5 py-3 min-w-[160px]">Tx Hash Reference</th>
                  <th className="px-5 py-3 font-sans font-bold">Operation Type</th>
                  <th className="px-5 py-3 font-sans font-bold">IDO Project Name</th>
                  <th className="px-5 py-3 text-right">Sum (USDT)</th>
                  <th className="px-5 py-3 text-right">Rewards allocated</th>
                  <th className="px-5 py-3 text-right">Block timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2E4E]/20 text-[10.5px] text-slate-350">
                {txHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-[#0098EA] hover:underline flex items-center gap-1 truncate max-w-[150px] font-mono">
                        {tx.txHash.slice(0, 16)}...{tx.txHash.slice(-6)}
                        <ExternalLink className="h-3 w-3 inline shrink-0" />
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-extrabold uppercase text-[9px] shrink-0 ${
                        tx.type === 'buy' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-[#0098EA] bg-blue-500/10'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-sans font-medium text-white min-w-[120px]">{tx.projectName}</td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-extrabold whitespace-nowrap">
                      {tx.usdtAmount ? `$${tx.usdtAmount.toLocaleString()} USDT` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-white whitespace-nowrap">
                      {tx.tokenAmount > 0 ? `+${tx.tokenAmount.toLocaleString()} $${tx.tokenSymbol}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
