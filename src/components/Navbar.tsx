import { useState } from 'react';
import { WalletState } from '../types.js';
import {
  Smartphone,
  LogOut,
  HelpCircle,
  LayoutGrid,
  BriefcaseBusiness,
  Moon,
  Sun,
  Building2,
  Coins,
  Lock,
  LockIcon,
  UserCircle,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';

export type AppTab =
  | 'explore'
  | 'apply'
  | 'swap'
  | 'staking'
  | 'portfolio'
  | 'guide'
  | 'home'
  | 'admin'
  | 'info'
  | 'simulation'
  | 'lplocker';

interface NavbarProps {
  wallet: WalletState;
  onOpenConnectModal: () => void;
  onDisconnect: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export default function Navbar({
  wallet,
  onOpenConnectModal,
  onDisconnect,
  theme,
  onToggleTheme,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getAbbreviatedAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const mobileItems = [
    { key: 'home' as const, label: 'Home', icon: Building2 },
    { key: 'explore' as const, label: 'Explore', icon: LayoutGrid },
    { key: 'staking' as const, label: 'Stake', icon: Coins },
    { key: 'lplocker' as const, label: 'Locker', icon: LockIcon },
    { key: 'guide' as const, label: 'Help', icon: HelpCircle },
  ];

  const openPortfolio = () => {
    setActiveTab('portfolio');
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    onDisconnect();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#05070d]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-[1440px] min-w-0 items-center justify-between gap-2 px-3 sm:h-[72px] sm:px-6 lg:px-8">
          <button
            onClick={() => setActiveTab('home')}
            className="flex min-w-0 flex-1 items-center gap-1 text-left sm:flex-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden sm:h-14 sm:w-14">
              <img
                src="/logo.webp?v=2"
                alt="Grampad logo"
                className="h-[70%] w-[70%] object-contain"
              />
            </div>
            <div className="min-w-0 leading-none">
              <span className="gp-display-font block truncate text-[21px] font-semibold text-white sm:text-[30px]">
                Grampad<span className='text-sky-600'>.io</span>
              </span>
            </div>
          </button>

          <nav className="hidden items-center rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 md:flex">
            {[
               { key: 'home' as const, label: 'Home', icon: Building2 },
              { key: 'explore' as const, label: 'Explore', icon: LayoutGrid },
              { key: 'staking' as const, label: 'Staking', icon: Coins },
              { key: 'lplocker' as const, label: 'Locker', icon: Lock },
              { key: 'guide' as const, label: 'How it works', icon: HelpCircle },
              { key: 'swap' as const, label: 'Swap', icon: ArrowUpDown },
             
            ].map(item => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    activeTab === item.key
                      ? 'bg-white/[0.08] text-white shadow-sm'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-sky-400" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="gp-theme-toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-slate-400 transition hover:text-sky-400 sm:h-10 sm:w-10"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {wallet.connected && wallet.address ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex max-w-[132px] items-center gap-1.5 rounded-xl border border-sky-400/20 bg-sky-400/[0.07] px-2.5 py-2 text-xs transition hover:border-sky-400/40 hover:bg-sky-400/[0.12] sm:max-w-none sm:gap-2 sm:px-3"
                >
                  <UserCircle className="h-5 w-5 text-sky-400" />

                  <span className="hidden font-mono text-slate-200 sm:inline-block">
                    {getAbbreviatedAddress(wallet.address)}
                  </span>

                  <span className="font-mono text-[10px] text-slate-200 sm:hidden">
                    {wallet.address.slice(0, 3)}..{wallet.address.slice(-3)}
                  </span>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080c14] shadow-2xl">
                    <button
                      onClick={openPortfolio}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <BriefcaseBusiness className="h-4 w-4 text-sky-400" />
                      Portfolio
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 border-t border-white/[0.06] px-4 py-3 text-left text-xs font-semibold text-rose-300 transition hover:bg-rose-400/[0.08]"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenConnectModal()}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0098EA] px-3 py-2.5 text-[11px] font-extrabold btn-white-text shadow-[0_10px_35px_rgba(0,152,234,0.2)] transition hover:bg-sky-400 active:scale-[0.98] sm:gap-2 sm:px-4 sm:text-xs"
              >
                <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Connect</span>
                <span className="hidden sm:inline">Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

<nav className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-surface)] p-1.5 shadow-2xl backdrop-blur-xl md:hidden">
  <div className="grid grid-cols-5 gap-1">
    {mobileItems.map(item => {
      const Icon = item.icon;
      const isActive = activeTab === item.key;

      return (
        <button
          key={item.key}
          onClick={() => setActiveTab(item.key)}
          className={`flex text-[#fff] h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-[9px] leading-none transition ${
            isActive
              ? 'bg-[#0098EA]  btn-text-white shadow-[0_8px_22px_rgba(0,152,234,0.28)]'
              : 'text-[var(--gp-muted)] hover:bg-[#2c9cf4]/10 hover:text-[var(--gp-text)]'
          }`}
        >
          <Icon
            className={`h-4 w-4 shrink-0 ${
              isActive ? 'text-[fff]' : 'btn-text-white'
            }`}
          />
          <span className="block max-w-full truncate">{item.label}</span>
        </button>
      );
    })}
  </div>
</nav>
    </>
  );
}
