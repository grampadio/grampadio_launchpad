import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
  Link,
} from 'react-router-dom';
import { useTonWallet, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { LaunchpadProject, WalletState, AdminSession } from './types.js';
import Navbar from './components/Navbar.js';
import LaunchpadList from './components/LaunchpadList.js';
import LaunchpadDetails from './components/LaunchpadDetails.js';
import LpLockerPortal from './components/LpLockerPortal.js';
import Dashboard from './components/Dashboard.js';
import HowItWorks from './components/HowItWorks.js';
import HomePage from './components/HomePage.js';
import AdminPortal from './components/AdminPortal.js';
import ProjectApplicationForm from './components/ProjectApplicationForm.js';
import StakingPortal from './components/StakingPortal.js';
import SwapPortal from './components/SwapPortal.js';
import WalletConnectModal from './components/WalletConnectModal.js';
import InfoPage, { InfoPageKey } from './components/InfoPage.js';
import SimulationPage from './components/SimulationPage.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  Loader2,
  AlertCircle,
  Send,
  Twitter,
  Linkedin,
  Mail,
  BotIcon,
} from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

interface ProjectDetailRouteProps {
  projects: LaunchpadProject[];
  portfolioProjects: LaunchpadProject[];
  wallet: WalletState;
  tonAddress?: string;
  onOpenConnect: () => void;
  onOpenSwap: () => void;
  triggerNotification: (msg: string, type: 'success' | 'warn') => void;
}

function ProjectDetailRoute({
  projects,
  portfolioProjects,
  wallet,
  tonAddress,
  onOpenConnect,
  onOpenSwap,
  triggerNotification,
}: ProjectDetailRouteProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const cachedProject = [...projects, ...portfolioProjects].find(p => p.id === id) || null;
  const [project, setProject] = useState<LaunchpadProject | null>(cachedProject);
  const [loading, setLoading] = useState(!cachedProject);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // If we already have the project loaded in state for this id, do not re-fetch
    if (project && project.id === id) {
      setLoading(false);
      return;
    }

    if (cachedProject && cachedProject.id === id) {
      setProject(cachedProject);
      setLoading(false);
      return;
    }

    const loadProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const query = tonAddress ? `?address=${encodeURIComponent(tonAddress)}` : '';
        const res = await fetch(`/api/projects/${encodeURIComponent(id)}${query}`);
        if (!res.ok) {
          throw new Error('Project not found');
        }
        const data = await res.json();
        if (isMounted) {
          setProject(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load project');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProject();
    return () => {
      isMounted = false;
    };
  }, [id, tonAddress]);

  const refreshCurrentProject = async () => {
    if (!id) return;
    try {
      const query = tonAddress ? `?address=${encodeURIComponent(tonAddress)}` : '';
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}${query}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (e) {
      console.error('Failed to refresh project:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-sky-400" />
        <p className="text-sm font-semibold text-slate-400">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="rounded-3xl border border-white/10 bg-[#0c1322] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
            <AlertCircle className="h-7 w-7 text-rose-400" />
          </div>
          <h3 className="text-xl font-black text-white">Project Not Found</h3>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            The project could not be found or may have concluded. Explore all ongoing and upcoming IDOs on the launchpad.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate('/explore')}
              className="rounded-xl bg-[#0098EA] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-sky-400 active:scale-95"
            >
              Explore Projects
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LaunchpadDetails
      project={project}
      wallet={wallet}
      onBack={() => {
        if (window.history.length > 2) {
          navigate(-1);
        } else {
          navigate('/explore');
        }
      }}
      onOpenConnect={onOpenConnect}
      onOpenSwap={onOpenSwap}
      onProjectUpdate={refreshCurrentProject}
      onContributeSuccess={() => {
        refreshCurrentProject();
        triggerNotification('Contribution completed. Progress has been updated.', 'success');
      }}
      onStageAdvance={() => {
        refreshCurrentProject();
        triggerNotification('Campaign stage advanced! Real-time smart contract conditions evolved successfully.', 'success');
      }}
    />
  );
}

function InfoRouteWrapper({ pageKey }: { pageKey?: InfoPageKey }) {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const validKeys: InfoPageKey[] = [
    'listing-rules',
    'refund-policy',
    'risk-disclaimer',
    'faq',
    'terms',
    'privacy',
    'trust-mechanics',
  ];

  const activeKey: InfoPageKey =
    pageKey || (slug && validKeys.includes(slug as InfoPageKey) ? (slug as InfoPageKey) : 'listing-rules');

  return (
    <InfoPage
      page={activeKey}
      onApply={() => navigate('/apply')}
      onBackHome={() => navigate('/')}
    />
  );
}

export default function App() {
  const tonAddress = useTonAddress();
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('grampad-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Sync Wallet state
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    walletType: null,
    network: 'mainnet',
  });

  const [projects, setProjects] = useState<LaunchpadProject[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<LaunchpadProject[]>([]);
  const [projectQuery, setProjectQuery] = useState({ page: 1, search: '', stage: 'all' });
  const [projectPagination, setProjectPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [projectStats, setProjectStats] = useState({
    totalRaised: 0,
    totalProjects: 0,
    liveProjects: 0,
  });
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isOpenConnectModal, setIsOpenConnectModal] = useState(false);
  const [globalNotification, setGlobalNotification] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession>({ authenticated: false });

  // Load one server-side page for the Explore view.
  const fetchProjects = async (query = projectQuery) => {
    setLoadingProjects(true);
    try {
      const params = new URLSearchParams({
        page: String(query.page),
        limit: '20',
        search: query.search,
        stage: query.stage,
      });
      if (tonAddress) params.set('address', tonAddress);
      const url = `/api/projects?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data?.projects)) {
        setProjects(data.projects);
        setProjectPagination(data.pagination);
        setProjectStats(data.stats);
        setBackendError(null);
      } else if (data && data.error) {
        setProjects([]);
        setBackendError(data.error);
      } else {
        setProjects([]);
        setBackendError(
          "The running Grampad server returned an outdated projects response. Restart the server so the paginated API and current frontend use the same version."
        );
      }
    } catch (e: any) {
      console.error('Failed to fetch launchpad projects:', e);
      setProjects([]);
      setBackendError(e.message || "Network request failed to retrieve projects list.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const isExploreOrHome =
    location.pathname === '/' ||
    location.pathname === '/explore' ||
    location.pathname === '/home';

  useEffect(() => {
    if (isExploreOrHome) {
      fetchProjects(projectQuery);
    }
  }, [tonAddress, isExploreOrHome]);

  useEffect(() => {
    if (location.pathname !== '/portfolio' || !tonAddress) {
      if (!tonAddress) setPortfolioProjects([]);
      return;
    }

    const fetchPortfolioProjects = async () => {
      try {
        const res = await fetch(`/api/portfolio-projects?address=${encodeURIComponent(tonAddress)}`);
        const data = await res.json();
        setPortfolioProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch portfolio projects:', error);
        setPortfolioProjects([]);
      }
    };

    fetchPortfolioProjects();
  }, [location.pathname, tonAddress]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('grampad-theme', theme);
  }, [theme]);

  useEffect(() => {
    const restoreAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/session', { cache: 'no-store' });
        const data = await response.json();
        setAdminSession(response.ok ? data : { authenticated: false });
      } catch {
        setAdminSession({ authenticated: false });
      }
    };
    restoreAdminSession();
  }, []);

  // Update wallet state based on real TON address connection change
  useEffect(() => {
    if (tonAddress) {
      const appName = tonWallet?.device.appName;
      const walletType: WalletState['walletType'] =
        appName === 'mytonwallet' || appName === 'tonhub' || appName === 'telegram'
          ? appName
          : 'tonkeeper';
      setWallet({
        connected: true,
        address: tonAddress,
        walletType,
        network: 'mainnet',
      });
    } else {
      setWallet({
        connected: false,
        address: null,
        walletType: null,
        network: 'mainnet',
      });
    }
  }, [tonAddress, tonWallet]);

  // Handle wallet connecting trigger
  const handleConnectWallet = () => {
    tonConnectUI.openModal();
  };

  const handleDisconnect = async () => {
    try {
      await tonConnectUI.disconnect();
      triggerNotification('Disconnected successfully from TON Mainnet.', 'warn');
    } catch (e: any) {
      console.error(e);
    }
  };

  // Helpers for temporary global floating bubbles
  const triggerNotification = (message: string, type: 'success' | 'warn') => {
    setGlobalNotification({ message, type });
    setTimeout(() => {
      setGlobalNotification(null);
    }, 4500);
  };

  return (
    <div className="gp-app relative flex min-h-screen flex-col overflow-x-hidden bg-transparent text-slate-100">
      <ScrollToTop />

      {/* Subtle dynamic backing lights */}
      <div className="pointer-events-none absolute left-[8%] top-0 h-96 w-96 rounded-full bg-[#0098EA]/[0.075] blur-[130px]" />
      <div className="pointer-events-none absolute right-[4%] top-56 h-[28rem] w-[28rem] rounded-full bg-blue-500/[0.045] blur-[150px]" />

      {/* Primary Header Navigation Bar */}
      <Navbar
        wallet={wallet}
        onOpenConnectModal={() => setIsOpenConnectModal(true)}
        onDisconnect={handleDisconnect}
        theme={theme}
        onToggleTheme={() => setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'))}
      />

      {/* Floating Notification Popover */}
      <AnimatePresence>
        {globalNotification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-20 right-4 z-50 rounded-2xl border border-[#1E2E4E] p-4 text-xs font-semibold shadow-xl flex items-center gap-2.5 max-w-sm bg-[#121B2E] text-white"
          >
            {globalNotification.type === 'success' ? (
              <div className="h-5.5 w-5.5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Coins className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
              </div>
            ) : (
              <AlertCircle className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            )}
            <span className="leading-relaxed">{globalNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body Frame Container */}
      <main className="flex-1 pb-16 relative">
        {backendError && (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 mb-2">
            <div className="rounded-2xl border border-red-500/25 bg-red-950/15 p-5 backdrop-blur-md text-slate-100 font-sans space-y-3.5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-red-500/5 blur-[50px] pointer-events-none rounded-full" />
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 h-8 w-8 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                  <AlertCircle className="h-4.5 w-4.5 text-red-400" />
                </div>
                <div className="space-y-1 ml-0.5">
                  <h4 className="font-bold text-sm tracking-tight text-white">MongoDB Connection / Network Issue Detected</h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    Grampad could not reach its project database:
                  </p>
                  <div className="mt-2.5 rounded-lg bg-black/40 px-3 py-2 text-[10.5px] font-mono text-amber-200/90 whitespace-pre-wrap overflow-x-auto border border-white/5 max-h-36 overflow-y-auto">
                    {backendError}
                  </div>
                </div>
              </div>
              <div className="border-t border-red-500/10 pt-3.5 pl-0 sm:pl-12 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
                <div className="space-y-1">
                  <span className="font-semibold text-white block">🛠️ Action Required (IP Access / Setup Issue)</span>
                  <p className="leading-relaxed">
                    If this is a MongoDB TLS/SSL error (SSL alert number 80), you must authorize access in your MongoDB Atlas Dashboard:
                    Go to <strong className="text-slate-200">Network Access</strong> → click <strong className="text-slate-200">Add IP Address</strong> → choose <strong className="text-slate-200">"Allow Access From Anywhere" (0.0.0.0/0)</strong>.
                  </p>
                </div>
                <button
                  onClick={() => fetchProjects(projectQuery)}
                  className="shrink-0 self-start sm:self-center px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 transition-all text-xs font-semibold text-red-300 active:scale-95"
                >
                  Retry Connect
                </button>
              </div>
            </div>
          </div>
        )}

        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <HomePage
                onExplore={() => navigate('/explore')}
                onHowItWorks={() => navigate('/how-it-works')}
                onApply={() => navigate('/apply')}
                onSelectProject={(id) => navigate(`/project/${id}`)}
              />
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Explore Projects List */}
          <Route
            path="/explore"
            element={
              <LaunchpadList
                projects={projects}
                loading={loadingProjects}
                wallet={wallet}
                pagination={projectPagination}
                stats={projectStats}
                onQueryChange={(query) => {
                  setProjectQuery(query);
                  fetchProjects(query);
                }}
                onSelectProject={(id) => navigate(`/project/${id}`)}
                onOpenConnect={() => setIsOpenConnectModal(true)}
              />
            }
          />

          {/* Project Details Deep Link Route */}
          <Route
            path="/project/:id"
            element={
              <ProjectDetailRoute
                projects={projects}
                portfolioProjects={portfolioProjects}
                wallet={wallet}
                tonAddress={tonAddress}
                onOpenConnect={() => setIsOpenConnectModal(true)}
                onOpenSwap={() => navigate('/swap')}
                triggerNotification={triggerNotification}
              />
            }
          />

          {/* Portals & Actions */}
          <Route path="/apply" element={<ProjectApplicationForm />} />

          <Route
            path="/staking"
            element={
              <StakingPortal
                wallet={wallet}
                onOpenConnect={() => setIsOpenConnectModal(true)}
              />
            }
          />

          <Route
            path="/lplocker"
            element={
              <LpLockerPortal
                wallet={wallet}
                onOpenConnect={() => tonConnectUI.openModal()}
              />
            }
          />

          <Route
            path="/swap"
            element={
              <SwapPortal
                wallet={wallet}
                onOpenConnect={() => setIsOpenConnectModal(true)}
              />
            }
          />

          <Route
            path="/portfolio"
            element={
              <Dashboard
                wallet={wallet}
                projects={portfolioProjects}
                onSelectProject={(id) => navigate(`/project/${id}`)}
                onOpenConnect={() => setIsOpenConnectModal(true)}
              />
            }
          />

          <Route
            path="/how-it-works"
            element={
              <HowItWorks
                onExplore={() => navigate('/explore')}
                onapply={() => navigate('/apply')}
                walletConnected={wallet.connected}
                onConnectWallet={() => setIsOpenConnectModal(true)}
              />
            }
          />
          <Route path="/guide" element={<Navigate to="/how-it-works" replace />} />

          {/* Admin & Simulation */}
          <Route
            path="/batmanlogin"
            element={
              <AdminPortal
                session={adminSession}
                onSessionChange={setAdminSession}
                wallet={wallet}
                onOpenConnect={() => setIsOpenConnectModal(true)}
                onProjectChanged={() => fetchProjects(projectQuery)}
                onDeploySuccess={(newProj) => {
                  setProjects(currentProjects => [newProj, ...currentProjects].slice(0, 20));
                  fetchProjects({ page: 1, search: '', stage: 'all' });
                  triggerNotification(`$${newProj.symbol} launched successfully on Grampad.`, 'success');
                }}
              />
            }
          />
          <Route path="/admin" element={<Navigate to="/batmanlogin" replace />} />

          <Route path="/simulation" element={<SimulationPage />} />

          {/* Info and Legal Pages */}
          <Route path="/info/:slug" element={<InfoRouteWrapper />} />
          <Route path="/listing-rules" element={<InfoRouteWrapper pageKey="listing-rules" />} />
          <Route path="/trust-mechanics" element={<InfoRouteWrapper pageKey="trust-mechanics" />} />
          <Route path="/faq" element={<InfoRouteWrapper pageKey="faq" />} />
          <Route path="/refund-policy" element={<InfoRouteWrapper pageKey="refund-policy" />} />
          <Route path="/risk-disclaimer" element={<InfoRouteWrapper pageKey="risk-disclaimer" />} />
          <Route path="/terms" element={<InfoRouteWrapper pageKey="terms" />} />
          <Route path="/privacy" element={<InfoRouteWrapper pageKey="privacy" />} />

          {/* Unmatched wildcard fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Connection Handshake overlays modal */}
      <WalletConnectModal
        isOpen={isOpenConnectModal}
        onClose={() => setIsOpenConnectModal(false)}
        onConnect={handleConnectWallet}
      />

      {/* Transparent page footer */}
      <footer className="border-t border-white/[0.06] bg-black/10 py-10 pb-25">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Col 1 */}
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-3 text-left">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                  <img
                    src="/logo.webp?v=2"
                    alt="Grampad logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="leading-none">
                  <span className="gp-display-font block text-[30px] font-semibold text-white">
                    Grampad<span className="text-sky-600">.io</span>
                  </span>
                </div>
              </Link>
              <p className="max-w-sm text-xs leading-relaxed text-slate-500">
                The first trusted IDO launchpad built for safer fundraising on TON with escrow-based raises, liquidity locking, milestone fund releases, transparent and automatic investor refund protection.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://t.me/grampadio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-sky-400/30 hover:text-sky-400"
                  title="Telegram Channel"
                >
                  <Send className="h-4 w-4" />
                </a>

                <a
                  href="https://t.me/grampadio_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-sky-400/30 hover:text-sky-400"
                  title="Telegram Group"
                >
                  <BotIcon className="h-4 w-4" />
                </a>

                <a
                  href="https://x.com/grampadio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-sky-400/30 hover:text-sky-400"
                  title="Twitter / X"
                >
                  <Twitter className="h-4 w-4" />
                </a>

                <a
                  href="https://www.linkedin.com/company/grampad-io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-sky-400/30 hover:text-sky-400"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>

                <a
                  href="mailto:hello@grampad.io"
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-sky-400/30 hover:text-sky-400"
                  title="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-200">Platform</h3>
              <div className="flex flex-col items-start gap-2">
                <Link
                  to="/listing-rules"
                  className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-sky-300"
                >
                  Apply for listing
                </Link>
                <Link
                  to="/trust-mechanics"
                  className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-sky-300"
                >
                  How protection works
                </Link>
                <Link
                  to="/faq"
                  className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-sky-300"
                >
                  FAQ
                </Link>
                <Link
                  to="/swap"
                  className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-sky-300"
                >
                  Swap
                </Link>
              </div>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-200">Legal</h3>
              <div className="flex flex-col items-start gap-2">
                <Link
                  to="/refund-policy"
                  className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-sky-300"
                >
                  Refund policy
                </Link>
                <Link
                  to="/risk-disclaimer"
                  className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-sky-300"
                >
                  Risk disclaimer
                </Link>
                <Link
                  to="/terms"
                  className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-sky-300"
                >
                  Terms and conditions
                </Link>
                <Link
                  to="/privacy"
                  className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-sky-300"
                >
                  Privacy policy
                </Link>
              </div>
            </div>
          </div>
          <p className="pt-2 text-xs text-slate-400/70 text-center mt-20">
            © 2026 Grampad. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
