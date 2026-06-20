import { X, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: 'tonkeeper' | 'mytonwallet' | 'tonhub' | 'telegram') => void;
}

export default function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="ton-connect-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#090D1A]/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#1E2E4E] bg-[#0F182A] text-white shadow-2xl shadow-[#0098EA]/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E2E4E]/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl">
              <img src="/ton.png"></img>
              </span>
              <h3 className="font-semibold text-base tracking-tight">Connect TON Wallet</h3>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full bg-[#1E2E4E]/40 p-1.5 text-slate-400 hover:bg-[#1E2E4E]/50 hover:btn-text-white transition-all"
            >
              <X className="h-4 w-4 btn-text-white" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#0098EA]/10 to-[#00ffff]/5 text-[#0098EA] border border-[#0098EA]/20">
              <Smartphone className="h-7 w-7 animate-pulse" />
            </div>

            <h4 className="mb-2 font-bold text-lg text-white">Live Ledger Synchronizer</h4>
            <p className="mb-6 text-center text-xs text-slate-400 leading-relaxed max-w-xs">
              Connect your favorite TON wallet (Tonkeeper, Telegram Wallet, MyTonWallet, or Tonhub) to interact with live launchpools and cryptographically sign contract transactions.
            </p>

            <button
              onClick={() => {
                onConnect('tonkeeper');
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#0098EA] to-[#0052D4] btn-text-white hover:brightness-110 transition font-bold px-5 py-3.5 text-sm shadow-xl shadow-[#0098EA]/10"
            >
              <span className="btn-white-text">Connect TON Wallet</span>
              <ArrowRight className="h-4 w-4 btn-white-text" />
            </button>

            <div className="mt-5 flex items-center gap-1.5 text-[10px] text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Securely encoded on open-source @tonconnect protocol</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
