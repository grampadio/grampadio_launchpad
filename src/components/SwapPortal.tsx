import { useEffect, useMemo, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { ArrowDownUp, Droplets, Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';
import { WalletState, SwapSettings } from '../types.js';
import {
  buildSwapTonToGramPayload,
  buildSwapJettonTransferPayload,
  formatUnits,
  getSwapContractDetails,
  getUserJettonBalance,
  getUserJettonWalletAddress,
  getUserTonBalance,
  parseSwapAmount,
  quoteGramOut,
  quoteGramOutFromTon,
  quoteTonOut,
  quoteUsdtOut,
  SWAP_JETTON_TRANSFER_TON,
} from '../ton/simpleSwap.js';
import { toNano } from '@ton/core';

const explainSwapError = (error: any) => {
  const message = error?.message || 'Swap failed.';
  if (String(message).includes('709')) {
    return 'Swap failed with exit code 709. This usually means the Jetton wallet did not have enough TON budget to forward the transfer, or the swap contract rejected the forwarded message before execution completed.';
  }
  return message;
};

interface SwapPortalProps {
  wallet: WalletState;
  onOpenConnect: () => void;
}

type SwapAsset = 'GRAMX' | 'USDT' | 'TON';
type SwapRoute = 'usdt-to-gram' | 'gram-to-usdt' | 'ton-to-gram' | 'gram-to-ton';

const getSwapRoute = (fromAsset: SwapAsset, toAsset: SwapAsset): SwapRoute => {
  if (fromAsset === 'USDT' && toAsset === 'GRAMX') return 'usdt-to-gram';
  if (fromAsset === 'TON' && toAsset === 'GRAMX') return 'ton-to-gram';
  if (fromAsset === 'GRAMX' && toAsset === 'USDT') return 'gram-to-usdt';
  return 'gram-to-ton';
};

export default function SwapPortal({ wallet, onOpenConnect }: SwapPortalProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [config, setConfig] = useState<SwapSettings | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [fromAsset, setFromAsset] = useState<SwapAsset>('USDT');
  const [toAsset, setToAsset] = useState<SwapAsset>('GRAMX');
  const direction = useMemo(() => getSwapRoute(fromAsset, toAsset), [fromAsset, toAsset]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balances, setBalances] = useState<{ gram: string; usdt: string; ton: string }>({
    gram: '0',
    usdt: '0',
    ton: '0',
  });

  const loadSwap = async (withSpinner = true) => {
    if (withSpinner) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const configRes = await fetch('/api/swap/config');
      const configData = await configRes.json();

      if (!configRes.ok) {
        throw new Error(configData.error || 'Failed to load swap configuration.');
      }

      setConfig(configData);

      if (configData.contractAddress) {
        const nextDetails = await getSwapContractDetails(configData.contractAddress);
        setDetails(nextDetails);
      } else {
        setDetails(null);
      }
    } catch (nextError: any) {
      setError(nextError.message || 'Failed to load swap.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSwap();
  }, []);

  useEffect(() => {
    if (
      !wallet.connected ||
      !wallet.address ||
      !config?.gramMasterAddress ||
      !config?.usdtMasterAddress
    ) {
      setBalances({ gram: '0', usdt: '0', ton: '0' });
      return;
    }

    let cancelled = false;

    const loadBalances = async () => {
      try {
        const [gramBalance, usdtBalance, tonBalance] = await Promise.all([
          getUserJettonBalance(wallet.address!, config.gramMasterAddress),
          getUserJettonBalance(wallet.address!, config.usdtMasterAddress),
          getUserTonBalance(wallet.address!),
        ]);

        if (cancelled) return;

        setBalances({
          gram: formatUnits(gramBalance, config.gramDecimals, 4),
          usdt: formatUnits(usdtBalance, config.usdtDecimals, 2),
          ton: formatUnits(tonBalance, 9, 4),
        });
      } catch {
        if (!cancelled) {
          setBalances({ gram: '0', usdt: '0', ton: '0' });
        }
      }
    };

    loadBalances();

    return () => {
      cancelled = true;
    };
  }, [
    wallet.connected,
    wallet.address,
    config?.gramMasterAddress,
    config?.usdtMasterAddress,
    config?.gramDecimals,
    config?.usdtDecimals,
  ]);

  const quote = useMemo(() => {
    if (!config || !amount) return '';

    try {
      const rateScaled = BigInt(config.rateScaled || '0');
      const tonRateScaled = BigInt(config.tonRateScaled || '0');
      if (rateScaled <= 0n) return '';

      if (direction === 'gram-to-usdt') {
        const parsed = parseSwapAmount(amount, config.gramDecimals);
        const out = quoteUsdtOut(
          parsed,
          rateScaled,
          config.gramDecimals,
          config.usdtDecimals
        );

        return formatUnits(out, config.usdtDecimals, 4);
      }

      if (direction === 'gram-to-ton') {
        if (tonRateScaled <= 0n) return '';
        const parsed = parseSwapAmount(amount, config.gramDecimals);
        const out = quoteTonOut(parsed, tonRateScaled, config.gramDecimals);

        return formatUnits(out, 9, 4);
      }

      if (direction === 'ton-to-gram') {
        if (tonRateScaled <= 0n) return '';
        const parsed = parseSwapAmount(amount, 9);
        const out = quoteGramOutFromTon(parsed, tonRateScaled, config.gramDecimals);

        return formatUnits(out, config.gramDecimals, 4);
      }

      const parsed = parseSwapAmount(amount, config.usdtDecimals);
      const out = quoteGramOut(
        parsed,
        rateScaled,
        config.gramDecimals,
        config.usdtDecimals
      );

      return formatUnits(out, config.gramDecimals, 4);
    } catch {
      return '';
    }
  }, [amount, config, direction]);

  const maxBuyExceeded = useMemo(() => {
    if (!config || !amount) return false;

    const maxBuyRaw = BigInt(config.maxBuyRaw || '0');
    if (maxBuyRaw === 0n) return false;

    try {
      if (direction === 'usdt-to-gram') {
        const parsed = parseSwapAmount(amount, config.usdtDecimals);
        return parsed > maxBuyRaw;
      }

      if (direction === 'ton-to-gram' || direction === 'gram-to-ton') {
        return false;
      }

      const parsed = parseSwapAmount(amount, config.gramDecimals);
      const rateScaled = BigInt(config.rateScaled || '0');

      if (rateScaled <= 0n) return false;

      const usdtEquivalent = quoteUsdtOut(
        parsed,
        rateScaled,
        config.gramDecimals,
        config.usdtDecimals
      );

      return usdtEquivalent > maxBuyRaw;
    } catch {
      return false;
    }
  }, [amount, config, direction]);

  const handleSwap = async () => {
    if (!config?.contractAddress) {
      setError('Swap contract is not configured yet.');
      return;
    }

    if (!wallet.connected || !wallet.address) {
      onOpenConnect();
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      if (direction === 'ton-to-gram') {
        const inputAmount = parseSwapAmount(amount, 9);

        if (inputAmount <= 0n) {
          throw new Error('Enter a valid amount.');
        }

        const payload = buildSwapTonToGramPayload(0n);

        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              address: config.contractAddress,
              amount: inputAmount.toString(),
              payload,
            },
          ],
        });

        setSuccess('TON swap transaction sent. Refresh after TON confirms the swap.');
        setAmount('');
        window.setTimeout(() => loadSwap(false), 4000);
        return;
      }

      const inputMaster =
        direction === 'gram-to-usdt' || direction === 'gram-to-ton'
          ? config.gramMasterAddress
          : config.usdtMasterAddress;

      const inputDecimals =
        direction === 'gram-to-usdt' || direction === 'gram-to-ton'
          ? config.gramDecimals
          : config.usdtDecimals;

      const inputAmount = parseSwapAmount(amount, inputDecimals);

      if (inputAmount <= 0n) {
        throw new Error('Enter a valid amount.');
      }

      if (maxBuyExceeded) {
        throw new Error(
          config.maxBuyRaw === '0'
            ? 'Max buy is unlimited.'
            : `Swap exceeds the maximum buy limit of ${config.maxBuyLabel || '0'} USDT.`
        );
      }

      const userJettonWallet = await getUserJettonWalletAddress(
        wallet.address,
        inputMaster
      );

      const payload = buildSwapJettonTransferPayload(
        inputAmount,
        config.contractAddress,
        wallet.address,
        direction === 'gram-to-ton' ? 1 : 0,
        0n
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: userJettonWallet.toString(),
            amount: toNano(SWAP_JETTON_TRANSFER_TON).toString(),
            payload,
          },
        ],
      });

      setSuccess('Swap transaction sent. Refresh after TON confirms the swap.');
      setAmount('');
      window.setTimeout(() => loadSwap(false), 4000);
    } catch (nextError: any) {
      setError(explainSwapError(nextError));
    } finally {
      setBusy(false);
    }
  };

  const fromSymbol =
    direction === 'gram-to-usdt' || direction === 'gram-to-ton'
      ? config?.gramSymbol || 'GRAMX'
      : direction === 'ton-to-gram'
        ? 'TON'
        : config?.usdtSymbol || 'USDT';

  const toSymbol =
    direction === 'gram-to-usdt'
      ? config?.usdtSymbol || 'USDT'
      : direction === 'gram-to-ton'
        ? 'TON'
        : config?.gramSymbol || 'GRAMX';

  const fromBalance =
    direction === 'gram-to-usdt' || direction === 'gram-to-ton'
      ? balances.gram
      : direction === 'ton-to-gram'
        ? balances.ton
        : balances.usdt;

  const fixedRateLabel =
    direction === 'ton-to-gram' || direction === 'gram-to-ton'
      ? `1 TON = ${config?.tonRateLabel || '1'} ${config?.gramSymbol || 'GRAMX'}`
      : `1 USDT = ${config?.rateLabel || '1'} ${config?.gramSymbol || 'GRAMX'}`;

  const handleFlip = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setAmount('');
    setError('');
    setSuccess('');
  };

  const handleFromAssetChange = (nextAsset: SwapAsset) => {
    if (nextAsset === 'GRAMX') {
      setFromAsset('GRAMX');
      setToAsset(toAsset === 'GRAMX' ? 'USDT' : toAsset);
      return;
    }

    setFromAsset(nextAsset);
    setToAsset('GRAMX');
  };

  const handleToAssetChange = (nextAsset: SwapAsset) => {
    if (nextAsset === 'GRAMX') {
      setToAsset('GRAMX');
      setFromAsset(fromAsset === 'GRAMX' ? 'USDT' : fromAsset);
      return;
    }

    setToAsset(nextAsset);
    setFromAsset('GRAMX');
  };

  const fromOptions: SwapAsset[] =
    toAsset === 'GRAMX' ? ['USDT', 'TON'] : ['GRAMX'];
  const toOptions: SwapAsset[] =
    fromAsset === 'GRAMX' ? ['USDT', 'TON'] : ['GRAMX'];

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="gp-chip inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
            GramPad Swap
          </div>

          <h1 className="gp-display-font mt-3 text-2xl font-semibold leading-tight text-[var(--gp-text)] sm:text-3xl">
            USDT / TON / GRAMX swap
          </h1>

          <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--gp-muted)] sm:text-sm">
            A clean reserve-backed swap for community access. No order book, no noise,
            just direct fixed-rate routes between GRAMX, USDT, and TON. May be required when you want to vote a project.
          </p>
        </div>

        <button
          onClick={() => loadSwap(false)}
          disabled={refreshing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface)] px-4 py-2.5 text-xs font-bold text-[var(--gp-text)] transition hover:border-sky-400/30 disabled:opacity-60 sm:w-auto"
        >
          <RefreshCcw
            className={`h-4 w-4 text-sky-400 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="gp-panel rounded-3xl p-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-sky-400" />
        </div>
      ) : !config?.contractAddress ? (
        <div className="gp-panel rounded-3xl p-8 text-center text-sm text-[var(--gp-muted)]">
          Swap contract is not deployed yet.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
          <div className="gp-panel rounded-2xl p-3 sm:rounded-[32px] sm:p-6">
            <div className="rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-surface)] p-3 sm:rounded-[28px] sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">
                  Swap
                </span>

                <span className="w-fit rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[10px] font-bold text-sky-300">
                  {fromSymbol} → {toSymbol}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-page)] p-3 sm:rounded-3xl sm:p-4">
                  <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gp-muted)] sm:flex-row sm:items-center sm:justify-between">
                    <span>You pay</span>
                    <span className="truncate">
                      Balance: {fromBalance} {fromSymbol}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      value={amount}
                      onChange={event => setAmount(event.target.value)}
                      inputMode="decimal"
                      placeholder="0.0"
                      className="min-w-0 flex-1 bg-transparent !text-3xl !font-black !tracking-[-0.04em] text-[var(--gp-text)] outline-none placeholder:text-slate-500 sm:!text-4xl"
                    />

                    <select
                      value={fromAsset}
                      onChange={event => handleFromAssetChange(event.target.value as SwapAsset)}
                      className="w-full rounded-2xl border border-sky-400/15 bg-sky-400/[0.08] px-4 py-3 text-sm font-black text-sky-500 outline-none sm:w-auto"
                    >
                      {fromOptions.map(option => (
                        <option key={option} value={option}>
                          {option === 'GRAMX' ? config?.gramSymbol || 'GRAMX' : option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-[var(--gp-page)] text-sky-400 transition-all duration-200 hover:rotate-180 hover:border-sky-400/50 hover:bg-sky-400/10 active:scale-95"
                  >
                    <ArrowDownUp className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>

                <div className="rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-page)] p-3 sm:rounded-3xl sm:p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gp-muted)]">
                    You receive
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 break-all text-3xl font-black tracking-[-0.04em] text-[var(--gp-text)] sm:text-4xl">
                      {quote || '0.0'}
                    </div>

                    <select
                      value={toAsset}
                      onChange={event => handleToAssetChange(event.target.value as SwapAsset)}
                      className="w-full rounded-2xl border border-emerald-400/15 bg-emerald-800/[0.08] px-4 py-3 text-sm font-black text-emerald-500 outline-none sm:w-auto"
                    >
                      {toOptions.map(option => (
                        <option key={option} value={option}>
                          {option === 'GRAMX' ? config?.gramSymbol || 'GRAMX' : option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-page)] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gp-muted)]">
                    Fixed rate
                  </span>

                  <p className="mt-2 break-words text-sm font-black text-[var(--gp-text)] sm:text-base">
                    {fixedRateLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-page)] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gp-muted)]">
                    Route limit
                  </span>

                  <p className="mt-2 text-sm font-black text-[var(--gp-text)] sm:text-base">
                    {direction === 'ton-to-gram' || direction === 'gram-to-ton'
                      ? 'No USDT cap on TON route'
                      : config.maxBuyRaw === '0'
                        ? 'Unlimited'
                        : `${config.maxBuyLabel || '0'} USDT`}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-page)] p-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gp-muted)]">
                  Contract
                </span>

                <p
                  className="mt-2 break-all font-mono text-[11px] text-sky-500 sm:text-xs"
                  title={config.contractAddress}
                >
                  {config.contractAddress}
                </p>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/[0.08] p-3 text-xs leading-5 text-rose-300 sm:text-sm">
                  {error}
                </div>
              )}

              {maxBuyExceeded && !error && (
                <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-3 text-xs leading-5 text-amber-300 sm:text-sm">
                  This swap amount is above the current maximum buy limit of{' '}
                  {config.maxBuyLabel || '0'} USDT.
                </div>
              )}

              {success && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-3 text-xs leading-5 text-emerald-300 sm:text-sm">
                  {success}
                </div>
              )}

              <button
                onClick={handleSwap}
                disabled={busy || !amount || details?.details?.paused || maxBuyExceeded}
                className="btn-white-text mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0098EA] px-5 py-4 text-sm font-black transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Droplets className="h-4 w-4" />
                )}

                {wallet.connected ? `Swap ${fromSymbol}` : 'Connect wallet to swap'}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="gp-panel rounded-2xl p-4 sm:rounded-[28px] sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sky-400" />

                <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--gp-text)] sm:text-sm">
                  Swap status
                </h2>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  [
                    'GRAMX reserve',
                    `${
                      details
                        ? formatUnits(
                            details.details.gramReserve,
                            config.gramDecimals,
                            4
                          )
                        : '0'
                    } ${config.gramSymbol}`,
                  ],
                  [
                    'USDT reserve',
                    `${
                      details
                        ? formatUnits(
                            details.details.usdtReserve,
                            config.usdtDecimals,
                            2
                          )
                        : '0'
                    } USDT`,
                  ],
                  [
                    'TON reserve',
                    `${
                      details
                        ? formatUnits(
                            details.details.tonReserve,
                            9,
                            4
                          )
                        : '0'
                    } TON`,
                  ],
                  ['Total swaps', details ? String(details.details.totalSwapCount) : '0'],
                  ['Contract state', details?.details?.paused ? 'Paused' : 'Active'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-surface)] p-4"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gp-muted)]">
                      {label}
                    </div>

                    <div className="mt-2 break-all text-sm font-black text-[var(--gp-text)] sm:text-base">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gp-panel rounded-2xl p-4 sm:rounded-[28px] sm:p-6">
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--gp-text)] sm:text-sm">
                What this swap is
              </h2>

              <ul className="mt-4 list-disc space-y-3 pl-4 text-xs leading-5 text-[var(--gp-muted)] sm:text-sm sm:leading-6">
                <li>Fixed-rate GRAMX / USDT and GRAMX / TON routes backed by contract reserves.</li>
                <li>
                  Jetton routes use one signed transfer. TON to GRAMX sends TON directly to the contract.
                </li>
                <li>
                  Admin must keep GRAMX, USDT, and TON reserves funded for smooth swaps.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
