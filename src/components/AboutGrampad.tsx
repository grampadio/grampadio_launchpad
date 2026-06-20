import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  FileCheck2,
  Landmark,
  LockKeyhole,
  RefreshCcw,
  Send,
  ShieldCheck,
  TimerReset,
  TrendingUp,
  Rocket,
  Coins,
  Flame,
  Twitter,
} from 'lucide-react';

interface AboutGrampadProps {
  onExplore: () => void;
  onHowItWorks: () => void;
  onApply?: () => void;
}

const taglines = ['Verified Launch', 'Liquidity Secured', 'Investor First'];

const TYPE_SPEED = 120;
const DELETE_SPEED = 80;
const HOLD_DELAY = 2200;

const sponsoredProjects = [
  { logo: '/logo.png', name: 'GramX', status: 'Live' },
  { logo: '/logo.png', name: 'TONPad AI', status: 'Coming Soon' },
  { logo: '/logo.png', name: 'MegaGram', status: 'Live' },
  { logo: '/logo.png', name: 'DeFiGram', status: 'Coming Soon' },
];

const topProjects = [
  {
    name: 'GramX',
    symbol: 'GRAMX',
    raised: '$128,500',
    status: 'Live',
    roi: '+240%',
  },
  {
    name: 'TON Starter',
    symbol: 'TSTART',
    raised: '$84,200',
    status: 'Live',
    roi: '+180%',
  },
  {
    name: 'DeFiGram',
    symbol: 'DFG',
    raised: '$61,900',
    status: 'Upcoming',
    roi: '+95%',
  },
];

const features = [
  {
    icon: Landmark,
    title: 'Escrow-Based Fundraising',
    description:
      'Investor funds controlled by Smart contract rules instead of direct project custody.',
  },
  {
    icon: LockKeyhole,
    title: 'Liquidity Protection',
    description:
      'Upto 50% Liquidity lock automatically to help reduce post-launch rug-pull risk.',
  },
  {
    icon: TimerReset,
    title: 'Milestone Based Fund Release',
    description:
      'Project funds to founders released step-by-step as per provided roadmap proof.',
  },
  {
    icon: RefreshCcw,
    title: 'Investor Refund Protection',
    description:
      'If sale or liquidity conditions fail, eligible users can move to a refund path.',
  },
  {
    icon: BadgeCheck,
    title: 'Ai Trust Score',
    description:
      'The Projects is evaluated using Ai models using audit, KYC, vesting, and founder history.',
  },
  {
    icon: Eye,
    title: 'Transparent Funding',
    description:
      'Users can inspect raised amount, contract address, vesting, claims, and lock status.',
  },
];

function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const stepTime = 20;
    const increment = value / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

export default function AboutGrampad({
  onExplore,
  onHowItWorks,
  onApply,
}: AboutGrampadProps) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = taglines[taglineIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (typedText.length < currentText.length) {
            setTypedText(currentText.slice(0, typedText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), HOLD_DELAY);
          }
        } else {
          if (typedText.length > 0) {
            setTypedText(currentText.slice(0, typedText.length - 1));
          } else {
            setIsDeleting(false);
            setTaglineIndex(prev => (prev + 1) % taglines.length);
          }
        }
      },
      isDeleting ? DELETE_SPEED : TYPE_SPEED
    );

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, taglineIndex]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[var(--gp-page)] text-[var(--gp-text)]">
      <style>{`
        @keyframes gpMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .gp-marquee {
          animation: gpMarquee 26s linear infinite;
        }
      `}</style>

<div className="relative z-20 w-full overflow-hidden border-b border-[var(--gp-border)] bg-[#2c9cf4]/10 py-2">
  <div className="flex min-w-max animate-[gpMarquee_35s_linear_infinite] gap-4 whitespace-nowrap">
    {[...sponsoredProjects, ...sponsoredProjects, ...sponsoredProjects, ...sponsoredProjects].map(
      (project, index) => (
        <div
          key={`${project.name}-${index}`}
          className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--gp-border)] bg-[var(--gp-surface)] px-4 py-1.5 text-xs font-bold"
        >
          <img
            src={project.logo}
            alt={project.name}
            className="h-6 w-6 rounded-full object-cover"
          />

          <span>{project.name}</span>

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              project.status === 'Live'
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'bg-amber-400/10 text-amber-400'
            }`}
          >
            {project.status}
          </span>
        </div>
      )
    )}
  </div>
</div>

      <div className="pointer-events-none absolute -left-40 -top-52 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(44,156,244,0.35),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-56 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(44,156,244,0.35),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(44,156,244,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(44,156,244,0.07)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_85%,transparent)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16 text-center">
        <div className="mx-auto max-w-5xl">
          <img
            src="/logo.png"
            alt="GramPad Logo"
            className="mx-auto mb-6 h-[100px] w-[100px] rounded-[32px] object-cover shadow-[0_24px_60px_rgba(44,156,244,0.35)]"
          />

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2c9cf4]/20 bg-[#2c9cf4]/10 px-5 py-2.5 font-bold tracking-[-0.02em] text-[#0077d9]">
            First Trusted AI-Powered IDO Launchpad
          </div>

          <h1 className="gp-display-font mb-7 text-[clamp(48px,9vw,118px)] font-black leading-[0.9] tracking-[-0.035em]">
            GramPad.io
            <br />
            <span className="inline-flex min-h-[1em] items-center text-[#2c9cf4]">
              {typedText}
              <span className="ml-1 inline-block h-[0.85em] w-[3px] animate-pulse rounded-full bg-[#2c9cf4]" />
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-4xl text-[clamp(18px,2.1vw,26px)] font-medium leading-[1.45] tracking-[-0.03em] text-[var(--gp-muted)]">
            Gram&apos;s first trusted IDO launchpad built for safer fundraising on TON
            with escrow-based raises, liquidity locking, milestone fund releases,
            and automatic investor refund protection.
          </p>

          <button
            onClick={onExplore}
            className="btn-white-text mb-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-[#2c9cf4] to-[#0077ff] px-7 py-4 text-lg font-black shadow-[0_18px_42px_rgba(44,156,244,0.35)]"
          >
            Explore Live Projects <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <div className="flex flex-wrap justify-center gap-3 max-md:flex-col">
            <a
              href="https://t.me/grampadio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--gp-border)] bg-[#2c9cf4]/10 px-7 py-3.5 font-black tracking-[-0.03em] text-[var(--gp-text)] transition hover:-translate-y-0.5 hover:bg-[var(--gp-surface)]"
            >
              <Send className="h-4 w-4 text-[#2c9cf4]" />
              Telegram
            </a>

            <a
              href="https://x.com/grampadio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--gp-border)] bg-[#2c9cf4]/10 px-7 py-3.5 font-black tracking-[-0.03em] text-[var(--gp-text)] transition hover:-translate-y-0.5 hover:bg-[var(--gp-surface)]"
            >
              <Twitter className="h-4 w-4 text-[#2c9cf4]" />
              X / Twitter
            </a>
          </div>

          <p className="mt-8 font-bold tracking-[-0.025em] text-[var(--gp-muted)]">
            Trusted launches. Safer fundraising. Built for TON.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-400">
              Top Performing Projects
            </span>
            <h2 className="gp-display-font mt-2 text-3xl font-black tracking-[-0.04em]">
              Trending launches on GramPad.
            </h2>
          </div>

          <button
            onClick={onExplore}
            className="hidden rounded-xl border border-[var(--gp-border)] px-4 py-2.5 text-xs font-bold text-[var(--gp-muted)] transition hover:text-[var(--gp-text)] sm:block"
          >
            View all
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topProjects.map(project => (
            <article
              key={project.name}
              className="gp-panel rounded-3xl p-5 transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2c9cf4]/10">
                  <Rocket className="h-6 w-6 text-[#2c9cf4]" />
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black text-emerald-400">
                  {project.status}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-black">{project.name}</h3>
              <p className="text-xs font-bold text-[var(--gp-muted)]">
                {project.symbol}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--gp-border)] bg-white/[0.03] p-3">
                  <p className="text-[10px] font-bold text-[var(--gp-muted)]">
                    Raised
                  </p>
                  <p className="mt-1 text-sm font-black">{project.raised}</p>
                </div>

                <div className="rounded-2xl border border-[var(--gp-border)] bg-white/[0.03] p-3">
                  <p className="text-[10px] font-bold text-[var(--gp-muted)]">
                    Growth
                  </p>
                  <p className="mt-1 text-sm font-black text-emerald-400">
                    {project.roi}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="gp-panel rounded-3xl p-7 text-center">
            <Coins className="mx-auto h-7 w-7 text-[#2c9cf4]" />
            <h3 className="mt-4 text-4xl font-black">
              $<AnimatedNumber value={284500} />
            </h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--gp-muted)]">
              Total Raised
            </p>
          </div>

          <div className="gp-panel rounded-3xl p-7 text-center">
            <Rocket className="mx-auto h-7 w-7 text-[#2c9cf4]" />
            <h3 className="mt-4 text-4xl font-black">
              <AnimatedNumber value={18} />
            </h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--gp-muted)]">
              Total Projects
            </p>
          </div>

          <div className="gp-panel rounded-3xl p-7 text-center">
            <Flame className="mx-auto h-7 w-7 text-[#2c9cf4]" />
            <h3 className="mt-4 text-4xl font-black">
              <AnimatedNumber value={4} />
            </h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--gp-muted)]">
              Live Now
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-400">
            Why Grampad.io?
          </span>
          <h2 className="gp-display-font mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Built for safer TON launches.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="gp-panel rounded-2xl p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#0098EA]/15 bg-[#0098EA]/[0.07] text-sky-400">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-black">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[var(--gp-muted)]">
                    {description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="gp-panel overflow-hidden rounded-[32px] p-7 text-center sm:p-10">
          <FileCheck2 className="mx-auto h-10 w-10 text-[#2c9cf4]" />

          <h2 className="gp-display-font mt-5 text-3xl font-black tracking-[-0.03em] sm:text-5xl">
            Launch your First project on <span className='text-[#2c9cf4]'>GramPad.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--gp-muted)]">
            Apply for IDO review, submit your project details, tokenomics,
            vesting, audit/KYC proof, and launch plan.
          </p>

          <button
            onClick={onApply}
            className="btn-white-text mt-7 inline-flex items-center gap-2 rounded-full bg-[#0098EA] px-7 py-3.5 text-sm font-black transition hover:bg-sky-400"
          >
            Apply Now <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}