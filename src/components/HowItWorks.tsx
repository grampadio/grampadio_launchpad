import { useState } from 'react';
import {
  HelpCircle, Vote, ShieldCheck, UserCheck, Flame, Coins, Calculator, CheckCircle2, Calendar,
  ArrowRight, Sparkles, AlertCircle, TrendingUp, Info, Lock, Key, Award, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HowItWorksProps {
  onExplore: () => void;
  onapply: () => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

export default function HowItWorks({ onExplore, onapply, walletConnected, onConnectWallet }: HowItWorksProps) {
  const [selectedStep, setSelectedStep] = useState<number>(0);

  // Dynamic Simulator State
  const [calcInvestment, setCalcInvestment] = useState<string>('500');
  const [calcTokenRate, setCalcTokenRate] = useState<string>('20'); // 1 USDC = 20 Tokens
  const [calcLockedDays, setCalcLockedDays] = useState<number>(90);
  const [calcVestingTGE, setCalcVestingTGE] = useState<number>(20); // 20% release at TGE

  // Steps data
  const steps = [
    {
      icon: <Calendar className="h-6 w-6 text-amber-400" />,
      title: "Upcoming Stage",
      badge: "Scheduled Launch",
      description: "After carefully review every new project enters an upcoming stage first. Investors can review the project profile, token details, and launch timeline before community voting begins.",
      insight: "This creates a clean pre-launch buffer instead of mixing scheduling with the voting stage.You get time to makeup your mind after quick research from your side, if you should invest in this project or not.",
      stats: "DYOR before making up mind to invest in any project ",
      ownerMessage: "Owner gets gets a buffer time to prepare for marketings about their IDO is going to live live on grampad.io"
    },
    {
      icon: <Vote className="h-6 w-6 text-sky-400" />,
      title: "Voting Stage",
      badge: "Community Power",
      description: "The launch begins with community voting. Investors cast gas-optimized TON votes to decide whether the project should proceed toward preparation, whitelist registration, and fundraising.",
      insight: "Keeps projects accountable. Spammers and rug-pulls are filtered out before raising a single penny.",
      stats: "Community voting determines whether the project can proceed",
      ownerMessage: "Community voting validates market demand before fundraising begins. A successful vote creates trust, social proof, and stronger investor confidence in your project."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      title: "Preparation & Evaluation",
      badge: "Launch Readiness",
      description: "After voting is won, GramPad reviews the project information, token parameters, ownership states, smart contract configuration, and monthly vesting controls.",
      insight: "AI flags and rates the project based on hidden backdoor functions or malicious transfer limits autonomously on the TON Blockchain.",
      stats: "Contract, tokenomics, KYC, audit, and vesting readiness checks",
      ownerMessage: "This stage helps identify launch risks early and improves project credibility. Passing evaluation demonstrates transparency, professionalism, and readiness to raise funds."

    },
    {
      icon: <UserCheck className="h-6 w-6 text-purple-400" />,
      title: "Whitelist Enrollment",
      badge: "Allocation Fairness",
      description: "Investors register their TON addresses to claim allocation weight. Our lottery contracts secure fair seat-distributions while preventing malicious gas-bumping script-bots of private listing sales.",
      insight: "Guarantees priority allocation access. You can register your interest with a single click.",
      stats: "Builds an engaged investor base before the public sale begins.",
      ownerMessage: "Build a list of interested investors before the sale starts. A strong whitelist increases engagement, participation rates, and fundraising efficiency."

    },
    {
      icon: <Coins className="h-6 w-6 text-amber-400" />,
      title: "Live  Sale",
      badge: "Seed Phase & Soft Cap Refund Guarantee",
      description: "Once the countdown ends, the sale goes live! Contribute USDT stablecoins directly into the launchpool. Your deposit instantly allocates locked Project Jettons at discounted IDO rates. Plus, you are fully protected by our Hardcoded Soft Cap Refund guarantee.",
      insight: "If the project fails to meet its minimum required Soft Cap target by the close of the IDO, our smart contract automatically unlocks the Refund function so you can reclaim 100% of your USDT with zero fees or penalties.",
      stats: "Open and Transparent fun raise",
      ownerMessage: "Automated token distribution and vesting reduce manual workload and operational risk. Transparent claim schedules help maintain long-term community trust."
    },
    {
      icon: <Flame className="h-6 w-6 text-rose-400" />,
      title: "Distribution",
      badge: "Vested Token Claims",
      description: "After a successful sale, contributors claim project tokens according to the TGE share and monthly vesting periods stored in the IDO contract.",
      insight: "Claims and failed-sale refunds are verified by the deployed project contract. Investor can also claim 100% of their invetment within 2 Hours of the listing of the project if he thinks they will lose it. he can either claim 100% of investment amount or remaining amount after claim TGE, within 2 hours of the window.",
      stats: "100% Automated Safe Refund if Soft Cap is not met.",
      ownerMessage: "Automated token distribution and vesting reduce manual workload and operational risk. Transparent claim schedules and refunds will help to make stronger investor's trust."
    }
  ];

  // Calculators
  const investAmt = Number(calcInvestment) || 0;
  const rate = Number(calcTokenRate) || 0;
  const totalTokens = investAmt * rate;
  const tgeReleaseAmount = (totalTokens * calcVestingTGE) / 100;
  const dynamicVestedAmount = totalTokens - tgeReleaseAmount;
  const monthlyUnlocks = calcLockedDays > 0 ? (dynamicVestedAmount / (calcLockedDays / 30)) : 0;

  return (
    <div id="how-it-works-view" className="gp-docs mx-auto max-w-7xl px-4 py-10 sm:px-6 font-sans">

      <section className="overflow-hidden rounded-[2rem] border border-sky-400/15 bg-gradient-to-br from-sky-500/[0.16] via-cyan-400/[0.07] to-transparent p-6 sm:p-8 mb-10 ">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="gp-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
              <ShieldCheck className="h-3.5 w-3.5" />  Investor Security Education
            </div>

            <h1 className="gp-gradient-text gp-display-font mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
              How Grampad works for Investors and Owners
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Learn how Grampad combines community voting, whitelist controls, sales, and on-chain vesting for transparent TON launches, and how its unique than other launchpads.
            </p>
          </div>

        </div>
      </section>


      <div className="gp-docs-panel rounded-2xl p-6 sm:p-8 backdrop-blur-md mb-12 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-5 w-5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">
              Open and Transparent Fund Raise
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            Decides how much its effective based on investors research
          </h2>

          <p className="mt-3 max-w-3xl text-xs leading-7 text-slate-400">
            The IDO completes in 6 open and transparent onchian stages.If project fails on voting Grampad.io smart contract can not proceed to next stage, if it wins it proceed for next steps and raise funds. Still if it does not reach to soft cap,Grampad.io smart contract automatically refunds its investors.
          </p>
        </div>

        {/* Grid: interactive roadmap timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">

          {/* Left Interactive Side: lifecycle steps list */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Launch Campaign Stepper
              </span>
              <span className="text-[10px] font-mono text-[#0098ea] bg-[#0098EA]/5 border border-[#0098EA]/10 px-2 py-0.5 rounded">
                Standardized Workflow
              </span>
            </div>

            {steps.map((st, idx) => {
              const isSelected = selectedStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedStep(idx)}
                  className={`gp-how-step w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-4 active:scale-98 ${isSelected
                      ? 'gp-how-step-active bg-[#0F1D33] border-[#0098EA]/50 text-white shadow-[0_0_15px_rgba(0,152,234,0.15)] scale-[1.01]'
                      : 'bg-[#080E1A]/60 border-slate-850 text-slate-400 hover:border-slate-800 hover:bg-slate-900/20'
                    }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#0098EA]/20 border border-[#0098EA]/30' : 'bg-slate-900 border border-slate-850'
                    }`}>
                    {st.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-slate-500">Step {idx + 1} of {steps.length}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-[#0098EA]/10 text-[#0098ea]' : 'bg-slate-900 text-slate-500'
                        }`}>
                        {st.badge}
                      </span>
                    </div>
                    <h3 className={`mt-1 text-sm font-extrabold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {st.title}
                    </h3>
                    <p className="text-[11px] text-slate-450 truncate mt-0.5">
                      {st.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane based on selected steps (7 columns) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="gp-docs-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[440px]"
              >
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#0098EA]/5 blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-[#0098EA]/10 border border-[#0098EA]/20 flex items-center justify-center">
                      {steps[selectedStep].icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#0098ea] font-black tracking-wider block bg-[#0098EA]/10 rounded px-2 py-0.5 w-max">
                        {steps[selectedStep].badge}
                      </span>
                      <h2 className="text-xl font-extrabold text-white mt-1 tracking-tight">
                        {steps[selectedStep].title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
                    {steps[selectedStep].description}
                  </p>

                  {/* Golden Insight highlight block */}
                  <div className="p-4 rounded-xl border border-sky-500/10 bg-sky-500/5 flex items-start gap-3 mb-6">
                    <Info className="h-4 w-4 text-[#0098EA] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-200">How It Protects Investors</h4>
                      <p className="text-[12px] text-slate-400 leading-relaxed mt-1 font-sans">
                        {steps[selectedStep].insight}
                      </p>
                    </div>
                  </div>

                  {/* Golden Insight highlight block */}
                  <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 flex items-start gap-3 mb-6">
                    <Info className="h-4 w-4 text-[#0098EA] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-200">How It be helpful for Project Owner</h4>
                      <p className="text-[12px] text-slate-400 leading-relaxed mt-1 font-sans ">
                        {steps[selectedStep].ownerMessage}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom metrics summary bar */}
                <div className="pt-6 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">TON System Variable</span>
                    <span className="text-xs font-bold text-white font-mono mt-0.5">
                      {steps[selectedStep].stats}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedStep((prev) => (prev + 1) % steps.length)}
                    className="gp-how-secondary rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:text-[#0098EA] transition duration-250 py-1.5 px-4 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Step View</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#0098EA]" />
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>



      {/* Milestone-Based Fund Release Section */}
      <div className="gp-docs-panel rounded-2xl p-6 sm:p-8 backdrop-blur-md mb-12 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-5 w-5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">
              Milestone-Based Fund Release
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            Raised funds are released step-by-step, not all at once.
          </h2>

          <p className="mt-3 max-w-3xl text-xs leading-7 text-slate-400">
            Before any IDO goes live, the project owner and GramPad define clear fund-release terms.
            These terms are visible to investors before contribution, so everyone knows how the raised capital will be unlocked after the sale.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <span className="text-[10px] font-black uppercase text-sky-400">45%</span>
              <h4 className="mt-1 text-sm font-black text-white">Liquidity</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Reserved for DEX/CEX liquidity to support market trading.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <span className="text-[10px] font-black uppercase text-emerald-400">25%</span>
              <h4 className="mt-1 text-sm font-black text-white">After Listing</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Released only after the token is successfully listed on approved DEX/CEX.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <span className="text-[10px] font-black uppercase text-amber-400">25%</span>
              <h4 className="mt-1 text-sm font-black text-white">Price Protection</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Released after 7 days if price does not drop below agreed protection limits.
              </p>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <span className="text-[10px] font-black uppercase text-violet-400">5%</span>
              <h4 className="mt-1 text-sm font-black text-white">Platform Fee</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                GramPad platform fee for launch support, review, and infrastructure.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <span className="text-[10px] font-black uppercase text-rose-400">Refund Rule</span>
              <h4 className="mt-1 text-sm font-black text-white">Investor Safety</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                If agreed milestones fail, protected funds can remain locked or move to refund state.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-slate-950/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-[#0098EA]" />
              <h3 className="text-sm font-black text-white">Example: $100,000 Raised</h3>
            </div>

            <div className="grid gap-2 font-mono text-xs sm:grid-cols-2">
              <div className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-slate-400">Liquidity Allocation</span>
                <strong className="text-sky-400">$45,000</strong>
              </div>

              <div className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-slate-400">After Listing Release</span>
                <strong className="text-emerald-400">$25,000</strong>
              </div>

              <div className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-slate-400">7-Day Price Protection Release</span>
                <strong className="text-amber-400">$25,000</strong>
              </div>

              <div className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-slate-400">GramPad Platform Fee</span>
                <strong className="text-violet-400">$5,000</strong>
              </div>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              The exact release structure may differ per project, but every milestone rule is shown publicly before investors contribute.
            </p>
          </div>
        </div>
      </div>


      {/* Why GramPad Is Different */}
<div className="gp-docs-panel rounded-2xl p-6 sm:p-8 backdrop-blur-md mb-12 relative overflow-hidden">
  <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#0098EA]/10 blur-3xl" />

  <div className="relative">
    <div className="flex items-center gap-2 mb-3">
      <Award className="h-5 w-5 text-[#0098EA]" />
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0098EA]">
        GramPad Advantage
      </span>
    </div>

    <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
      How GramPad is different from other launchpads
    </h2>

    <p className="mt-3 max-w-3xl text-xs leading-7 text-slate-400">
      GramPad is built around investor safety and project accountability using escrow-based raises,
      liquidity locking, milestone fund releases, and automatic investor refund protection.
    </p>

    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {[
        {
          title: 'Escrow-Based Raises',
          desc: 'Raised funds are held under launch rules instead of being released directly to the project owner.',
          color: 'sky',
        },
        {
          title: 'Liquidity Locking',
          desc: 'A defined portion of raised funds is reserved for liquidity and can be locked for investor protection.',
          color: 'emerald',
        },
        {
          title: 'Milestone Fund Releases',
          desc: 'Project funds can be released step-by-step after listing, liquidity, and agreed delivery milestones.',
          color: 'amber',
        },
        {
          title: 'Automatic Refund Protection',
          desc: 'If soft cap or protected conditions fail, eligible investors can reclaim contributions through refund rules.',
          color: 'rose',
        },
        {
          title: 'Community Approval First',
          desc: 'Projects pass through voting before fundraising, helping investors filter weak or risky launches early.',
          color: 'violet',
        },
          {
          title: 'Investor Fund Security',
          desc: 'Within 2 hours of refund window investors can claim either 100% of their investment amount or remainining after after TGE claim based on their choice.',
          color: 'cyan',
          },
      ].map((item) => {
        const styles: Record<string, string> = {
          sky: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
          emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
          amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
          rose: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
          violet: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
          cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
        };

        return (
          <div
            key={item.title}
            className={`rounded-xl border p-4 ${styles[item.color]}`}
          >
            <h4 className="text-sm font-black text-white">{item.title}</h4>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              {item.desc}
            </p>
          </div>
        );
      })}
    </div>
  </div>
</div>

      {/* Simulator Section: Dynamic Calculator */}
      <div className="gp-docs-panel rounded-2xl p-6 sm:p-8 backdrop-blur-md mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-5 w-5 text-sky-400" />
          <h2 className="text-lg font-black uppercase tracking-wider text-white">
            Interactive Pool Allocation Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl mb-8 leading-relaxed font-sans">
          Estimate allocation payouts, linear lock releases, and token distributions instantly based on seed rate variables. Enter your contribution parameters below:
        </p>

        <div className="grid gap-6 lg:grid-cols-12">

          {/* Input Controls */}
          <div className="lg:col-span-5 space-y-4 font-sans">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-450 block mb-1.5">
                USDT Contribution Size ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-mono font-bold">$</span>
                <input
                  type="number"
                  value={calcInvestment}
                  onChange={(e) => setCalcInvestment(e.target.value)}
                  className="gp-how-control w-full bg-[#080E1A] border border-slate-800 rounded-xl py-2 pl-7 pr-3 text-xs text-white font-mono focus:border-[#0098EA] outline-none transition"
                  placeholder="500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Maximum limits dynamically capped on launching contracts.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-450 block mb-1.5">
                  Launchpool Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcTokenRate}
                    onChange={(e) => setCalcTokenRate(e.target.value)}
                    className="gp-how-control w-full bg-[#080E1A] border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono focus:border-[#0098EA] outline-none transition"
                    placeholder="20"
                  />
                  <span className="absolute right-3.5 top-2 text-[10px] font-bold text-slate-500 font-mono">/USDT</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-450 block mb-1.5">
                  TGE Release (%)
                </label>
                <div className="relative">
                  <select
                    value={calcVestingTGE}
                    onChange={(e) => setCalcVestingTGE(Number(e.target.value))}
                    className="gp-how-control w-full bg-[#080E1A] border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:border-[#0098EA] outline-none transition"
                  >
                    <option value={0}>0% (Full Lock)</option>
                    <option value={10}>10% Release</option>
                    <option value={20}>20% Release</option>
                    <option value={50}>50% Release</option>
                    <option value={100}>100% (No Lock)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-450 block mb-1.5">
                Vesting Escrow Duration: <span className="text-white font-mono font-black">{calcLockedDays} Days</span>
              </label>
              <input
                type="range"
                min={30}
                max={360}
                step={30}
                value={calcLockedDays}
                onChange={(e) => setCalcLockedDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0098EA]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>30 Days</span>
                <span>180 Days</span>
                <span>360 Days (Secure)</span>
              </div>
            </div>
          </div>

          {/* Output Payout Display Visual Card */}
          <div className="gp-docs-subpanel lg:col-span-7 rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 block bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded w-max">
                Projected Unlocks
              </span>

              <div className="grid grid-cols-2 divide-x divide-slate-850">
                <div className="pr-4 font-mono">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block">Total Allocated Reward</span>
                  <span className="text-xl font-black text-white mt-1.5 block">
                    {totalTokens.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">TOKENS</span>
                  </span>
                  <span className="text-[10px] text-[#0098ea] mt-0.5 block">Equivalent base reward</span>
                </div>

                <div className="pl-4 font-mono">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block">TGE Initial Release</span>
                  <span className="text-xl font-black text-emerald-400 mt-1.5 block">
                    {tgeReleaseAmount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">TOKENS</span>
                  </span>
                  <span className="text-[10px] text-slate-550 mt-0.5 block">Unlocked on distribution day</span>
                </div>
              </div>

              {/* Graphic representations of locks */}
              <div className="gp-how-inset p-3.5 rounded-xl border border-slate-850 bg-slate-950 font-mono text-[11px] space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Vesting Locked Vault Size:</span>
                  <span className="text-white font-bold">{dynamicVestedAmount.toLocaleString()} TOKENS</span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden flex relative">
                  <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${calcVestingTGE}%` }} />
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${100 - calcVestingTGE}%` }} />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 block" /> TGE Unlocked: {calcVestingTGE}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 block" /> Escrow Vesting Lock: {100 - calcVestingTGE}%
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated monthly releases */}
            <div className="mt-5 pt-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <span className="text-slate-400">
                Linear release estimate: <span className="text-[#0098ea] font-bold">~{monthlyUnlocks.toLocaleString(undefined, { maximumFractionDigits: 1 })} Tokens / month</span>
              </span>

              <span className="text-[10.5px] text-slate-500 font-sans flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#0098EA]" /> Securing launch against dumping
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* Contract-Level Soft Cap Refund Safeguard highlight */}
      <div className="gp-docs-alert rounded-2xl p-6 mb-12 font-sans relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl" />
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
            <AlertCircle className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-rose-450">
              Contract-Level Investor Protection
            </span>
            <h3 className="text-base font-black text-white mt-1">Guaranteed Soft Cap Refunds & Risk Mitigation</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-1.5">
              To protect contributors from underfunded launches, Grampad enforces smart-contract soft-cap rules. If an IDO fails to reach its designated <strong>Soft Cap</strong> before the sale closes:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-xs text-slate-350">
              <li>The pool state changes permanently to <span className="text-rose-400 font-bold">Failed</span>, and the project creator is blocked from accessing any capital or minting assets.</li>
              <li>Every contributor gains instantaneous, contract-level authorization to invoke the <span className="text-emerald-450 font-semibold">"Refund Contribution"</span> protocol.</li>
              <li>You receive exactly <strong>100% of your USDT back</strong> directly to your TON wallet balance, completely fee-free.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to action banners */}
      <div className="gp-docs-cta rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white">Ready to inspect TON community listings?</h3>
          <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
            Connect your TON wallet to begin voting, auditing, and participating in live launchpools securely!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!walletConnected && (
            <button
              onClick={onapply}
              className="gp-how-secondary rounded-xl border border-slate-800 bg-[#0F1D33] hover:bg-[#0F1D35] px-4 py-2.5 text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer"
            >
              List Your Project
            </button>
          )}

          <button
            onClick={onExplore}
            className="rounded-xl bg-[#0098EA] hover:opacity-90 active:scale-95 transition-all btn-white-text px-5 py-2.5 text-xs font-bold font-mono shadow-md cursor-pointer flex items-center gap-1"
          >
            <span>GO TO EXPLORE</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
