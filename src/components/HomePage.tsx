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
import { HomePageData } from '../types.js';
import { DEFAULT_PROJECT_BANNER, DEFAULT_PROJECT_LOGO } from '../constants/assets.js';

interface HomePageProps {
  onExplore: () => void;
  onHowItWorks: () => void;
  onApply?: () => void;
    onSelectProject: (id: string) => void;
}

const taglines = ['Verified Launch', 'Liquidity Secured', 'Investor First'];

const TYPE_SPEED = 120;
const DELETE_SPEED = 80;
const HOLD_DELAY = 2200;

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
      'Upto 50% of raised funds can be automatically allocated to liquidity and locked based on project rating and backing',
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
    title: '100% Transparent Funding',
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

export default function HomePage({
  
  onExplore,
  onHowItWorks,
  onApply,
  onSelectProject
}: HomePageProps) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [homeData, setHomeData] = useState<HomePageData>({
    trendingProjects: [],
    promotedProjects: [],
    liveProjects: [],
    upcomingProjects: [],
    underReviewProjects: [],
    pastProjects: [],
    stats: { totalRaised: 0, totalProjects: 0, liveProjects: 0 },
  });
  const [loadingHome, setLoadingHome] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const marqueeProjects = homeData.promotedProjects.length > 0
    ? Array.from(
        { length: Math.max(6, homeData.promotedProjects.length) },
        (_, index) => homeData.promotedProjects[index % homeData.promotedProjects.length]
      )
    : [];

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const response = await fetch('/api/home');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load home data.');
        setHomeData(data);
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setLoadingHome(false);
      }
    };
    loadHomeData();
  }, []);

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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const renderProjectCard = (
    project: HomePageData['liveProjects'][number],
    badge: string,
    showCountdown = false
  ) => {
    const progress = project.hardCap > 0
      ? Math.min(100, (project.raised / project.hardCap) * 100)
      : 0;
    const softCapPercent = project.hardCap > 0
      ? Math.min(100, (project.softCap / project.hardCap) * 100)
      : 0;
    const getTargetTime = (value: any) => {
  if (!value) return Date.now();

  if (typeof value === 'number') {
    return value < 10_000_000_000 ? value * 1000 : value;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

function getCountdownParts(targetTime: number, now: number) {
  const diff = Math.max(0, targetTime - now);
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const countdown = showCountdown
  ? getCountdownParts(getTargetTime(project.startTime), now)
  : null;

    return (
      <article
        key={project.id}
        onClick={() => onSelectProject(project.id)}
        className="gp-panel cursor-pointer overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative h-40 overflow-hidden bg-slate-900">
          <img
            src={project.banner || DEFAULT_PROJECT_BANNER}
            alt={`${project.name} banner`}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span
  className={`absolute right-4 top-4 rounded-full border border-white/15 px-3 py-1 text-[10px] font-black uppercase btn-white-text backdrop-blur-md ${
    project.status === 'failed'
      ? 'bg-rose-500'
      : 'bg-sky-500'
  }`}
>
  {project.status}
</span>
          <div className="absolute bottom-3 left-4">
            <img
              src={project.logo || DEFAULT_PROJECT_LOGO}
              alt={`${project.name} logo`}
              className="h-14 w-14 rounded-2xl border-4 border-[var(--gp-surface)] bg-[var(--gp-surface)] object-cover shadow-lg"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 pt-5">
          <div>
            <h3 className="line-clamp-1 text-lg  text-[var(--gp-text)]">
              {project.name}
            </h3>
            <p className="text-xs font-bold text-[var(--gp-muted)]">${project.symbol}</p>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5 pt-4">
{showCountdown && (
  <div className="rounded-2xl border border-[#2c9cf4]/20 bg-[#2c9cf4]/10 p-4">
    <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#2c9cf4]">
      Starts In
    </p>

    <div className="grid grid-cols-4 gap-2">
      {[
        { label: 'Days', value: countdown?.days, color: 'text-sky-500 border-emerald-400/20 bg-sky-400/10'},
        { label: 'Hours', value: countdown?.hours, color: 'text-sky-500 border-emerald-400/20 bg-sky-400/10'},
        { label: 'Mins', value: countdown?.minutes, color: 'text-sky-500 border-emerald-400/20 bg-sky-400/10' },
        { label: 'Secs', value: countdown?.seconds, color: 'text-sky-500 border-emerald-400/20 bg-sky-400/10'},
      ].map(item => (
        <div
          key={item.label}
          className={`rounded-xl border px-2 py-3 text-center ${item.color}`}
        >
          <p className="text-lg font-black leading-none">
            {String(item.value).padStart(2, '0')}
          </p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-wider opacity-80">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
{!showCountdown && (
   <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--gp-border)] bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold uppercase text-[var(--gp-muted)]">Raised</p>
              <p className="mt-1 text-sm font-black text-[var(--gp-text)]">
                ${project.raised.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--gp-border)] bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold uppercase text-[var(--gp-muted)]">Progress</p>
              <p className="mt-1 text-sm font-black text-emerald-400">{progress.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col font-sans">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
              <span className="font-mono text-emerald-400">
                ${project.raised.toLocaleString()} <span className="font-normal text-slate-400">USDT raised</span>
              </span>
              <span className="font-mono text-slate-300">{progress.toFixed(1)}%</span>
            </div>

            <div className="gp-project-progress relative h-2 w-full overflow-hidden rounded-full">
              <div
                className="absolute bottom-0 top-0 z-10 w-0.5 bg-rose-400 opacity-60"
                style={{ left: `${softCapPercent}%` }}
                title={`Soft Cap threshold: ${project.softCap} USDT`}
              />
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0098EA] to-cyan-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
              <span>Soft: ${project.softCap.toLocaleString()} USDT</span>
              <span>Hard: ${project.hardCap.toLocaleString()} USDT</span>
            </div>
          </div>
         </>
          )}
        </div>
      </article>
    );
  };

  const projectSections = [
    {
      label: 'Live IDO',
      title: 'Live IDOs',
      description: 'Deployed project pools that are active before distribution.',
      projects: homeData.liveProjects,
      badge: 'Live',
    },
    {
      label: 'Coming next',
      title: 'Upcoming IDOs',
      description: 'Projects configured by admin as upcoming before launch.',
      projects: homeData.upcomingProjects,
      badge: 'Upcoming',
    },
    {
      label: 'Completed pools',
      title: 'Past IDOs',
      description: 'Deployed projects that have reached distribution.',
      projects: homeData.pastProjects,
      badge: 'Past',
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[var(--gp-page)] text-[var(--gp-text)]">
      <style>{`
        @keyframes gpMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .gp-marquee {
          display: flex;
          width: max-content;
          animation: gpMarquee 32s linear infinite;
          will-change: transform;
        }
        .gp-marquee-group {
          display: flex;
          flex-shrink: 0;
          gap: 1rem;
          padding-right: 1rem;
        }
      `}</style>

      {homeData.promotedProjects.length > 0 && (
        <div className="relative z-20 w-full overflow-hidden border-b border-[var(--gp-border)] bg-[#2c9cf4]/10 py-2">
          <div className="gp-marquee whitespace-nowrap">
            {[0, 1].map(groupIndex => (
              <div key={groupIndex} className="gp-marquee-group" aria-hidden={groupIndex === 1}>
                {marqueeProjects.map((project, projectIndex) => (
                  <div
                    onClick={() => onSelectProject(project.id)}
                    key={`${groupIndex}-${project.id}-${projectIndex}`}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--gp-border)] bg-[var(--gp-surface)] px-4 py-1.5 text-xs font-bold"
                  >
                    <img
                      src={project.logo || DEFAULT_PROJECT_LOGO}
                      alt={project.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span>{project.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        project.idoStage === 'sale'
                          ? 'bg-emerald-400/10 text-emerald-400'
                          : 'bg-amber-400/10 text-amber-400'
                      }`}
                    >
                      {project.idoStage === 'sale' ? 'Live' : project.idoStage}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

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

          <p className="mx-auto mb-8 max-w-4xl text-[clamp(18px,2.1vw,26px)] font-medium leading-[1.45]  text-[var(--gp-muted)]">
            The first trusted IDO launchpad built for safer fundraising on TON
            with escrow-based raises, liquidity locking, milestone fund releases, transparent
            and automatic investor refund protection.
          </p>

          <button
            onClick={onExplore}
            className=" hover:-translate-y-0.5 hover:bg-[var(--gp-surface)] cursor-pointer btn-white-text mb-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-[#2c9cf4] to-[#0077ff] px-7 py-4 text-lg font-black shadow-[0_18px_42px_rgba(44,156,244,0.35)]"
          >
            Explore Projects <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <div className="flex flex-wrap justify-center gap-3 max-md:flex-col">
            <a
              href="https://t.me/grampadio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--gp-border)] bg-sky-500/20 px-7 py-3.5  text-[var(--gp-text)] transition hover:-translate-y-0.5 hover:bg-[var(--gp-surface)]"
            >
              <Send className="h-4 w-4 text-[#2c9cf4]" />
              Telegram
            </a>

            <a
              href="https://x.com/grampadio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--gp-border)] bg-sky-500/20 px-7 py-3.5  text-[var(--gp-text)] transition hover:-translate-y-0.5 hover:bg-[var(--gp-surface)]"
            >
              <Twitter className="h-4 w-4 text-[#2c9cf4]" />
              X / Twitter
            </a>
          </div>

          <p className="mt-8 font-bold  text-[var(--gp-muted)]">
            Trusted launches. Safer fundraising. Built for TON.
          </p>
        </div>
      </section>
<section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6">
  <div className="grid gap-4 md:grid-cols-3">
    {[
      {
        icon: Coins,
        label: 'Total Raised',
        value: <>$<AnimatedNumber value={homeData.stats.totalRaised} /></>,
      },
      {
        icon: Rocket,
        label: 'Total Projects',
        value: <AnimatedNumber value={homeData.stats.totalProjects} />,
      },
      {
        icon: Flame,
        label: 'Live Now',
        value: <AnimatedNumber value={homeData.stats.liveProjects} />,
      },
    ].map(({ icon: Icon, label, value }) => (
      <div
        key={label}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#2c9cf4]/40 hover:bg-white/[0.07]"
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#2c9cf4]/15 blur-2xl transition group-hover:bg-[#2c9cf4]/25" />

        <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#2c9cf4]/20 bg-[#2c9cf4]/10 shadow-[0_10px_25px_rgba(44,156,244,0.15)]">
          <Icon className="h-5 w-5 text-[#2c9cf4]" />
        </div>

        <h3 className="relative mt-4 text-3xl font-black tracking-[-0.03em] text-white">
          {value}
        </h3>

        <p className="relative mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--gp-muted)]">
          {label}
        </p>
      </div>
    ))}
  </div>
</section>

      <section className="relative z-10 mx-auto max-w-7xl space-y-14 px-4 pb-16 sm:px-6">
        {projectSections.map(section => (
          <div key={section.title}>
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-400">
                  {section.label}
                </span>
                <h2 className="gp-display-font mt-2 text-3xl">
                  {section.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[var(--gp-muted)]">
                  {section.description}
                </p>
              </div>

              <button
                onClick={onExplore}
                className="hidden rounded-xl border border-[var(--gp-border)] px-4 py-2.5 text-xs font-bold text-[var(--gp-muted)] transition hover:text-[var(--gp-text)] sm:block"
              >
                View all
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {section.projects.map(project =>
                renderProjectCard(project, section.badge, section.badge === 'Upcoming')
              )}

              {!loadingHome && section.projects.length === 0 && (
                <div className="gp-panel rounded-3xl p-8 text-center text-sm text-[var(--gp-muted)] md:col-span-3">
                  No {section.title.toLowerCase()} are available yet.
                </div>
              )}
            </div>
          </div>
        ))}
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
