import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Coins,
  RefreshCcw,
  ShieldCheck,
  TimerReset,
  UserCheck,
  Vote,
  Wallet,
} from 'lucide-react';

type DemoStage = 'preparation' | 'voting' | 'whitelist' | 'sale' | 'distribution';
type PopupType = 'error' | 'success' | 'info';

const stageOrder: DemoStage[] = ['voting', 'preparation', 'whitelist', 'sale', 'distribution'];

const demoProject = {
  name: 'GramPad Genesis Demo',
  symbol: 'GDEMO',
  logo: '/logo.png',
  banner: 'https://images.unsplash.com/photo-1640826514546-63d12d6a59b6?auto=format&fit=crop&w=1200&h=420&q=80',
  description:
    'A simulated TON-first IDO project used to teach the full GramPad lifecycle without wallet signatures, gas, or real funds.',
  rate: 100,
  softCap: 2500,
  hardCap: 5000,
  minBuy: 50,
  maxBuy: 1500,
  tgePercent: 20,
  vestingMonths: 6,
};

const fakeWallets = [
  'UQDemo...A1',
  'UQDemo...B2',
  'UQDemo...C3',
  'UQDemo...D4',
];

const stageMeta: Record<DemoStage, {
  title: string;
  eyebrow: string;
  icon: typeof ShieldCheck;
  description: string;
}> = {
  preparation: {
    title: 'Preparation',
    eyebrow: 'Admin review',
    icon: ShieldCheck,
    description: 'After voting is won, project information, sale terms, vesting, liquidity rules, KYC, audit status, and contract readiness are reviewed.',
  },
  voting: {
    title: 'Voting',
    eyebrow: 'Community signal',
    icon: Vote,
    description: 'Simulate community votes. Make upvotes greater than or equal to downvotes to pass into preparation.',
  },
  whitelist: {
    title: 'Whitelist',
    eyebrow: 'Access control',
    icon: UserCheck,
    description: 'Simulate connecting a wallet and whitelisting it before sale participation opens.',
  },
  sale: {
    title: 'Sale',
    eyebrow: 'Escrow contribution',
    icon: Coins,
    description: 'Contribute mock USDT into the demo IDO. Raised amount determines success or refund at distribution.',
  },
  distribution: {
    title: 'Distribution / Failed',
    eyebrow: 'Claim or refund',
    icon: TimerReset,
    description: 'If soft cap is reached, claim TGE and monthly vesting. If soft cap fails, claim a 100% mock refund.',
  },
};

export default function SimulationPage() {
  const [stageIndex, setStageIndex] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletIndex, setWalletIndex] = useState(0);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [whitelisted, setWhitelisted] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('500');
  const [purchases, setPurchases] = useState<number[]>([]);
  const [claimedTokens, setClaimedTokens] = useState(0);
  const [claimedRefund, setClaimedRefund] = useState(false);
  const [elapsedMonth, setElapsedMonth] = useState(0);
  const [message, setMessage] = useState('Start in voting. Add upvotes or downvotes, then advance to test pass/fail logic.');
  const [popup, setPopup] = useState<{ title: string; body: string; type: PopupType } | null>(null);

  const stage = stageOrder[stageIndex];
  const meta = stageMeta[stage];
  const StageIcon = meta.icon;
  const connectedWallet = fakeWallets[walletIndex];

  const showPopup = (title: string, body: string, type: PopupType = 'info') => {
    setMessage(body);
    setPopup({ title, body, type });
  };

  const totals = useMemo(() => {
    const invested = purchases.reduce((sum, amount) => sum + amount, 0);
    const allocation = invested * demoProject.rate;
    const softCapReached = invested >= demoProject.softCap;
    const votePassed = upvotes >= downvotes && upvotes + downvotes > 0;
    const tgeTokens = allocation * (demoProject.tgePercent / 100);
    const lockedTokens = Math.max(0, allocation - tgeTokens);
    const vestingProgress = Math.min(1, elapsedMonth / demoProject.vestingMonths);
    const unlockedTokens = softCapReached
      ? Math.min(allocation, tgeTokens + lockedTokens * vestingProgress)
      : 0;
    const claimableTokens = Math.max(0, unlockedTokens - claimedTokens);
    const progress = Math.min(100, (invested / demoProject.softCap) * 100);

    return {
      invested,
      allocation,
      softCapReached,
      votePassed,
      tgeTokens,
      unlockedTokens,
      claimableTokens,
      progress,
    };
  }, [claimedTokens, downvotes, elapsedMonth, purchases, upvotes]);

  const connectFakeWallet = () => {
    setWalletConnected(true);
    setMessage(`Fake wallet connected: ${connectedWallet}. No real wallet or TON transaction is used.`);
  };

  const switchWallet = () => {
    const nextIndex = (walletIndex + 1) % fakeWallets.length;
    setWalletIndex(nextIndex);
    setWalletConnected(true);
    setMessage(`Switched to fake wallet ${fakeWallets[nextIndex]}.`);
  };

  const advanceStage = () => {
    if (stage === 'voting') {
      if (!totals.votePassed) {
        showPopup(
          'IDO Failed: Vote Not Won',
          'This IDO cannot advance because voting did not win. Upvotes must be greater than or equal to downvotes.',
          'error'
        );
        return;
      }
      setStageIndex(1);
      setMessage('Voting passed. Preparation stage is open for review and launch readiness checks.');
      return;
    }

    if (stage === 'preparation') {
      setStageIndex(2);
      setMessage('Preparation completed. Whitelist stage is open.');
      return;
    }

    if (stage === 'whitelist') {
      if (!whitelisted) {
        setMessage('Whitelist at least one fake wallet before sale starts.');
        return;
      }
      setStageIndex(3);
      setMessage('Sale is live. Simulate USDT contribution from the whitelisted wallet.');
      return;
    }

    if (stage === 'sale') {
      setStageIndex(4);
      setElapsedMonth(0);
      setClaimedTokens(0);
      setClaimedRefund(false);
      setMessage(
        totals.softCapReached
          ? 'Soft cap achieved. Distribution is active and TGE claim is enabled.'
          : 'Soft cap failed. 100% refund is enabled for the mock contribution.'
      );
      return;
    }

    setMessage('You are already at distribution. Use previous stage or simulate claims/refund.');
  };

  const previousStage = () => {
    setStageIndex(current => Math.max(0, current - 1));
    setMessage('Moved back one stage for testing. Simulation state is preserved.');
  };

  const whitelistWallet = () => {
    if (!walletConnected) {
      setMessage('Connect a fake wallet first.');
      return;
    }
    setWhitelisted(true);
    setMessage(`${connectedWallet} is now whitelisted for the simulated sale.`);
  };

  const addPurchase = () => {
    if (!walletConnected) {
      setMessage('Connect a fake wallet before purchasing.');
      return;
    }
    if (!whitelisted) {
      setMessage('This fake wallet is not whitelisted yet.');
      return;
    }

    const amount = Number(purchaseAmount);
    if (!Number.isFinite(amount) || amount < demoProject.minBuy || amount > demoProject.maxBuy) {
      setMessage(`Purchase must be between ${demoProject.minBuy} and ${demoProject.maxBuy} USDT.`);
      return;
    }
    if (totals.invested + amount > demoProject.hardCap) {
      setMessage('Purchase exceeds the hard cap in this simulation.');
      return;
    }

    setPurchases(current => [...current, amount]);
    setMessage(`${amount.toLocaleString()} mock USDT contributed. Allocation updated instantly.`);
  };

  const claimTokens = () => {
    if (!totals.softCapReached) {
      setMessage('Token claim is disabled because soft cap failed.');
      return;
    }
    if (totals.claimableTokens <= 0) {
      setMessage('No new tokens are claimable yet. Advance simulated months.');
      return;
    }
    setClaimedTokens(current => current + totals.claimableTokens);
    setMessage(`Claimed ${totals.claimableTokens.toLocaleString()} ${demoProject.symbol} in the simulation.`);
  };

  const claimRefund = () => {
    if (totals.softCapReached) {
      setMessage('Refund is disabled because soft cap was achieved.');
      return;
    }
    if (claimedRefund) {
      setMessage('Refund already claimed in this simulation.');
      return;
    }
    setClaimedRefund(true);
    setMessage(`Refunded ${totals.invested.toLocaleString()} mock USDT. No real funds moved.`);
  };

  const resetSimulation = () => {
    setStageIndex(0);
    setWalletConnected(false);
    setWalletIndex(0);
    setUpvotes(0);
    setDownvotes(0);
    setWhitelisted(false);
    setPurchases([]);
    setClaimedTokens(0);
    setClaimedRefund(false);
    setElapsedMonth(0);
    setMessage('Simulation reset. Start again from voting.');
  };

  return (
    <>
      {popup && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--gp-border)] bg-[var(--gp-surface)] p-6 shadow-2xl">
            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${
              popup.type === 'error'
                ? 'border-rose-400/25 bg-rose-400/10 text-rose-300'
                : popup.type === 'success'
                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                  : 'border-sky-400/25 bg-sky-400/10 text-sky-300'
            }`}>
              {popup.type === 'error' ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            </div>
            <h2 className="text-2xl font-black text-[var(--gp-text)]">{popup.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--gp-muted)]">{popup.body}</p>
            <button
              onClick={() => setPopup(null)}
              className="btn-white-text mt-6 w-full rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-sky-400/15 bg-gradient-to-br from-sky-500/[0.16] via-cyan-400/[0.07] to-transparent p-6 sm:p-9">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="gp-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Real flow, mock data
            </div>
            <h1 className="gp-display-font mt-5 text-4xl font-black tracking-[-0.045em] text-[var(--gp-text)] sm:text-6xl">
              IDO Lifecycle Simulation
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--gp-muted)]">
              Walk through a demo GramPad project from preparation to voting, whitelist, sale, distribution,
              claim, vesting, or refund. This is a safe training environment with fake wallets and mock USDT.
            </p>
          </div>

          <button
            onClick={resetSimulation}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--gp-border)] px-5 py-3 text-sm font-bold text-[var(--gp-muted)] transition hover:text-[var(--gp-text)]"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset demo
          </button>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[28px] border border-[var(--gp-border)] bg-[var(--gp-surface)]">
        <div className="relative h-64 overflow-hidden bg-slate-900">
          <img src={demoProject.banner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <img
                src={demoProject.logo}
                alt={demoProject.name}
                className="h-20 w-20 rounded-3xl border-4 border-[var(--gp-surface)] bg-[var(--gp-surface)] object-cover shadow-xl"
              />
              <div>
                <span className="rounded-full bg-sky-400/15 px-3 py-1 text-[10px] font-black uppercase text-sky-200">
                  Demo project
                </span>
                <h2 className="mt-2 text-3xl font-black text-white">{demoProject.name}</h2>
                <p className="text-sm font-bold text-slate-300">${demoProject.symbol}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-xs text-white backdrop-blur">
              Current stage: <strong className="text-sky-300">{meta.title}</strong>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-7">
          <div className="space-y-3">
            {stageOrder.map((item, index) => {
              const itemMeta = stageMeta[item];
              const Icon = itemMeta.icon;
              const active = item === stage;

              return (
                <button
                  key={item}
                  onClick={() => {
                    setStageIndex(index);
                    setMessage(`Jumped to ${itemMeta.title}. State is preserved so users can test any stage.`);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-sky-400/45 bg-sky-400/[0.08]'
                      : 'border-[var(--gp-border)] bg-white/[0.025] hover:border-sky-400/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                      active ? 'border-sky-400/35 bg-sky-400/10 text-sky-300' : 'border-[var(--gp-border)] text-[var(--gp-muted)]'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">
                        {itemMeta.eyebrow}
                      </span>
                      <h3 className="mt-1 text-base font-black text-[var(--gp-text)]">{itemMeta.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-[var(--gp-muted)]">{itemMeta.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-[var(--gp-border)] bg-black/[0.08] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/[0.08] text-sky-300">
                <StageIcon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">{meta.eyebrow}</span>
                <h2 className="mt-1 text-2xl font-black text-[var(--gp-text)]">{meta.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--gp-muted)]">{meta.description}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-sky-400/30 bg-sky-400/[0.10] p-4 shadow-[0_18px_50px_rgba(0,152,234,0.10)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                <p className="text-xs font-semibold leading-6 text-[var(--gp-text)]">{message}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--gp-border)] p-4">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--gp-muted)]">Soft cap</span>
                <strong className="mt-2 block text-xl text-[var(--gp-text)]">${demoProject.softCap.toLocaleString()}</strong>
              </div>
              <div className="rounded-2xl border border-[var(--gp-border)] p-4">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--gp-muted)]">Hard cap</span>
                <strong className="mt-2 block text-xl text-[var(--gp-text)]">${demoProject.hardCap.toLocaleString()}</strong>
              </div>
              <div className="rounded-2xl border border-[var(--gp-border)] p-4">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--gp-muted)]">Rate</span>
                <strong className="mt-2 block text-xl text-[var(--gp-text)]">1 USDT = {demoProject.rate} {demoProject.symbol}</strong>
              </div>
              <div className="rounded-2xl border border-[var(--gp-border)] p-4">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--gp-muted)]">Vesting</span>
                <strong className="mt-2 block text-xl text-[var(--gp-text)]">{demoProject.tgePercent}% TGE + {demoProject.vestingMonths} months</strong>
              </div>
            </div>

            {stage === 'preparation' && (
              <div className="mt-6 space-y-3">
                {['Project metadata reviewed', 'Tokenomics and caps prepared', 'KYC/audit status checked', 'IDO contract parameters ready'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[var(--gp-muted)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            )}

            {stage === 'voting' && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => {
                    setUpvotes(votes => votes + 1);
                    setMessage('Upvote added. Advance phase when you want to test the voting result.');
                  }}
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4 text-left font-bold text-emerald-300"
                >
                  Upvote project
                  <span className="mt-2 block text-3xl font-black">{upvotes}</span>
                </button>
                <button
                  onClick={() => {
                    setDownvotes(votes => votes + 1);
                    setMessage('Downvote added. If downvotes exceed upvotes, advancing will fail the IDO.');
                  }}
                  className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.08] p-4 text-left font-bold text-rose-300"
                >
                  Downvote project
                  <span className="mt-2 block text-3xl font-black">{downvotes}</span>
                </button>
              </div>
            )}

            {stage === 'whitelist' && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={walletConnected ? switchWallet : connectFakeWallet}
                  className="btn-white-text inline-flex items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
                >
                  <Wallet className="h-4 w-4" />
                  {walletConnected ? `Switch wallet (${connectedWallet})` : 'Connect fake wallet'}
                </button>
                <button
                  onClick={whitelistWallet}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-5 py-3 text-sm font-bold text-emerald-300"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {whitelisted ? 'Wallet whitelisted' : 'Whitelist wallet'}
                </button>
              </div>
            )}

            {stage === 'sale' && (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={walletConnected ? switchWallet : connectFakeWallet}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-400/[0.08] px-5 py-3 text-sm font-bold text-sky-300"
                  >
                    <Wallet className="h-4 w-4" />
                    {walletConnected ? connectedWallet : 'Connect fake wallet'}
                  </button>
                  <input
                    type="number"
                    min={demoProject.minBuy}
                    max={demoProject.maxBuy}
                    value={purchaseAmount}
                    onChange={event => setPurchaseAmount(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-[var(--gp-border)] bg-black/20 px-4 py-3 text-sm text-[var(--gp-text)] outline-none focus:border-sky-400/45"
                  />
                  <button
                    onClick={addPurchase}
                    className="btn-white-text rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
                  >
                    Buy demo tokens
                  </button>
                </div>
                <p className="text-xs text-[var(--gp-muted)]">
                  Tip: buy at least {demoProject.softCap.toLocaleString()} USDT total to make the IDO succeed, or less to test refund.
                </p>
              </div>
            )}

            {stage === 'distribution' && (
              <div className="mt-6 space-y-4">
                {totals.softCapReached ? (
                  <>
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 text-sm text-emerald-300">
                      Soft cap achieved. TGE and vesting claims are enabled.
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--gp-muted)]">
                        Advance simulated month: {elapsedMonth} / {demoProject.vestingMonths}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={demoProject.vestingMonths}
                        value={elapsedMonth}
                        onChange={event => {
                          setElapsedMonth(Number(event.target.value));
                          setMessage('Vesting month advanced. Claimable amount recalculated.');
                        }}
                        className="w-full accent-[#0098EA]"
                      />
                    </div>
                    <button
                      onClick={claimTokens}
                      className="btn-white-text w-full rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
                    >
                      Claim {totals.claimableTokens.toLocaleString()} {demoProject.symbol}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] p-4 text-sm text-rose-300">
                      Soft cap failed. Token claims are disabled and 100% refund is available.
                    </div>
                    <button
                      onClick={claimRefund}
                      className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-5 py-3 text-sm font-bold text-emerald-300"
                    >
                      {claimedRefund ? 'Refund already claimed' : `Claim 100% refund (${totals.invested.toLocaleString()} USDT)`}
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 border-t border-[var(--gp-border)] pt-5 sm:flex-row sm:justify-between">
              <button
                onClick={previousStage}
                disabled={stageIndex === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--gp-border)] px-5 py-3 text-sm font-bold text-[var(--gp-muted)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous stage
              </button>
              <button
                onClick={advanceStage}
                className="btn-white-text inline-flex items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3 text-sm font-bold text-white"
              >
                Advance phase
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ['Raised', `$${totals.invested.toLocaleString()} USDT`],
          ['Allocation', `${totals.allocation.toLocaleString()} ${demoProject.symbol}`],
          ['Claimed', `${claimedTokens.toLocaleString()} ${demoProject.symbol}`],
          ['Refund', claimedRefund ? 'Claimed' : totals.softCapReached ? 'Disabled' : 'Available if failed'],
        ].map(([label, value]) => (
          <div key={label} className="gp-panel rounded-2xl p-5">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--gp-muted)]">{label}</span>
            <strong className="mt-3 block text-xl font-black text-[var(--gp-text)]">{value}</strong>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-[28px] border border-[var(--gp-border)] bg-white/[0.025] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[var(--gp-text)]">Soft cap progress</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--gp-muted)]">
              The final distribution result depends on whether simulated raised USDT reaches the soft cap.
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
            totals.softCapReached ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'
          }`}>
            {totals.softCapReached ? 'Soft cap achieved' : 'Soft cap not reached'}
          </span>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0098EA] to-cyan-300"
            style={{ width: `${totals.progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-bold text-[var(--gp-muted)]">
          <span>{totals.progress.toFixed(1)}% of soft cap</span>
          <span>Soft cap: ${demoProject.softCap.toLocaleString()} USDT</span>
        </div>
      </section>
      </main>
    </>
  );
}
