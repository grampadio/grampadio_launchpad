import { useEffect, useMemo, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { ArrowDownUp, ChevronDown, Droplets, Loader2, RefreshCcw, ShieldCheck, TrendingUp, Coins, Clock, ArrowUpRight, ArrowDownRight, Sparkles, AreaChart, CandlestickChart, Play, Square } from 'lucide-react';
import { WalletState, SwapSettings, SwapTransaction } from '../types.js';
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
    return 'Swap failed with exit code 709. This usually means the Jetton wallet did not have enough GRAM budget to forward the transfer, or the swap contract rejected the forwarded message before execution completed.';
  }
  return message;
};

interface SwapPortalProps {
  wallet: WalletState;
  onOpenConnect: () => void;
}

type SwapAsset = 'GRAMX' | 'USDT' | 'GRAM';
type SwapRoute = 'usdt-to-gram' | 'gram-to-usdt' | 'ton-to-gram' | 'gram-to-ton';

const getSwapRoute = (fromAsset: SwapAsset, toAsset: SwapAsset): SwapRoute => {
  if (fromAsset === 'USDT' && toAsset === 'GRAMX') return 'usdt-to-gram';
  if (fromAsset === 'GRAM' && toAsset === 'GRAMX') return 'ton-to-gram';
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

  // Chart and simulation states
  const [history, setHistory] = useState<{ time: number; open: number; high: number; low: number; close: number; volume: number }[]>([]);
  const [recentSwaps, setRecentSwaps] = useState<SwapTransaction[]>([]);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '1h'>('5m');
  const [chartType, setChartType] = useState<'candle' | 'line'>('line');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulatingSpeed, setSimulatingSpeed] = useState(15);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/swap/history?timeframe=${timeframe}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchRecentSwaps = async () => {
    try {
      const res = await fetch('/api/swap/transactions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecentSwaps(data);
      }
    } catch (err) {
      console.error('Failed to fetch recent swaps:', err);
    }
  };



  useEffect(() => {
    if (config) {
      setSimulating(!!config.simulationActive);
      setSimulatingSpeed(config.simulationSpeed || 15);
    }
  }, [config]);

  useEffect(() => {
    fetchHistory();
    fetchRecentSwaps();
    const interval = setInterval(() => {
      fetchHistory();
      fetchRecentSwaps();
    }, 5000);
    return () => clearInterval(interval);
  }, [timeframe]);

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

        setSuccess('GRAM swap transaction sent. Refresh after GRAM confirms the swap.');
        setAmount('');
        window.setTimeout(() => {
          loadSwap(false);
          fetchHistory();
          fetchRecentSwaps();
        }, 4000);
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

      setSuccess('Swap transaction sent. Refresh after GRAM confirms the swap.');
      setAmount('');
      window.setTimeout(() => {
        loadSwap(false);
        fetchHistory();
        fetchRecentSwaps();
      }, 4000);
    } catch (nextError: any) {
      setError(explainSwapError(nextError));
    } finally {
      setBusy(false);
    }
  };

  const fromSymbol =
    fromAsset === 'GRAMX'
      ? 'GRAMX'
      : fromAsset === 'GRAM'
        ? 'GRAM'
        : config?.usdtSymbol || 'USDT';

  const toSymbol =
    toAsset === 'GRAMX'
      ? 'GRAMX'
      : toAsset === 'GRAM'
        ? 'GRAM'
        : config?.usdtSymbol || 'USDT';

  const fromBalance =
    fromAsset === 'GRAMX'
      ? balances.gram
      : fromAsset === 'GRAM'
        ? balances.ton
        : balances.usdt;

  const fixedRateLabel =
    direction === 'ton-to-gram' || direction === 'gram-to-ton'
      ? `1 GRAM = ${config?.tonRateLabel || '1'} GRAMX`
      : `1 USDT = ${config?.rateLabel || '1'} GRAMX`;

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
    toAsset === 'GRAMX' ? ['USDT'] : ['GRAMX'];
  const toOptions: SwapAsset[] =
    fromAsset === 'GRAMX' ? ['USDT'] : ['GRAMX'];

  const renderChart = () => {
    if (history.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-slate-500 text-xs font-semibold">
          No trade history available. Use the developer panel to populate historical data.
        </div>
      );
    }

    const margin = { top: 20, right: 55, bottom: 30, left: 10 };
    const width = 600;
    const height = 280;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const prices = history.map(h => [h.high, h.low, h.open, h.close]).flat();
    const maxP = Math.max(...prices);
    const minP = Math.min(...prices);

    const priceDiff = maxP - minP || 0.0001;
    const maxPrice = maxP + priceDiff * 0.05;
    const minPrice = Math.max(0, minP - priceDiff * 0.05);

    const maxVolume = Math.max(...history.map(h => h.volume), 1);
    const stepX = history.length > 1 ? chartWidth / (history.length - 1) : chartWidth;

    const getX = (idx: number) => margin.left + idx * stepX;
    const getY = (price: number) => {
      const scale = (price - minPrice) / (maxPrice - minPrice);
      return margin.top + chartHeight - scale * chartHeight;
    };

    const activeIndex = hoveredIndex !== null ? hoveredIndex : history.length - 1;
    const activeData = history[activeIndex] || history[0];

    const gridCount = 4;
    const gridLines = Array.from({ length: gridCount + 1 }).map((_, i) => {
      const price = minPrice + ((maxPrice - minPrice) * i) / gridCount;
      const y = getY(price);
      return { price, y };
    });

    let linePath = '';
    let areaPath = '';
    if (chartType === 'line' && history.length > 0) {
      const points = history.map((h, i) => `${getX(i)},${getY(h.close)}`).join(' ');
      linePath = `M ${points}`;
      const firstX = getX(0);
      const lastX = getX(history.length - 1);
      const bottomY = margin.top + chartHeight;
      areaPath = `M ${firstX},${bottomY} L ${points} L ${lastX},${bottomY} Z`;
    }

    return (
      <div className="relative font-sans text-xs select-none">
        {/* OHLCV Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4 text-[11px] font-semibold text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>O: <span className="text-white font-bold">${activeData.open.toFixed(4)}</span></span>
            <span>H: <span className="text-emerald-400 font-bold">${activeData.high.toFixed(4)}</span></span>
            <span>L: <span className="text-rose-400 font-bold">${activeData.low.toFixed(4)}</span></span>
            <span>C: <span className="text-white font-bold">${activeData.close.toFixed(4)}</span></span>
          </div>
          <div>
            <span>Vol: <span className="text-[#00D2FF] font-bold">${activeData.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</span></span>
          </div>
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0098EA" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0098EA" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {gridLines.map((line, i) => (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={line.y}
                  x2={margin.left + chartWidth}
                  y2={line.y}
                  stroke="#1e293b"
                  strokeWidth="0.5"
                  strokeDasharray="2 3"
                />
                <text
                  x={margin.left + chartWidth + 5}
                  y={line.y + 4}
                  fill="#64748b"
                  className="text-[9px] font-mono font-semibold"
                >
                  ${line.price.toFixed(4)}
                </text>
              </g>
            ))}

            {/* Volume Bars */}
            {history.map((h, i) => {
              const x = getX(i);
              const barWidth = Math.max(1.5, stepX * 0.6);
              const volHeight = (h.volume / maxVolume) * 40;
              const y = margin.top + chartHeight - volHeight;
              const isBullish = h.close >= h.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={volHeight}
                  fill={isBullish ? '#10b981' : '#ef4444'}
                  fillOpacity="0.15"
                />
              );
            })}

            {/* Price Chart */}
            {chartType === 'candle' ? (
              history.map((h, i) => {
                const x = getX(i);
                const yOpen = getY(h.open);
                const yClose = getY(h.close);
                const yHigh = getY(h.high);
                const yLow = getY(h.low);

                const isBullish = h.close >= h.open;
                const strokeColor = isBullish ? '#10b981' : '#ef4444';
                const bodyWidth = Math.max(2, stepX * 0.6);

                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={strokeColor}
                      strokeWidth="1.2"
                    />
                    <rect
                      x={x - bodyWidth / 2}
                      y={Math.min(yOpen, yClose)}
                      width={bodyWidth}
                      height={Math.max(1.5, Math.abs(yOpen - yClose))}
                      fill={strokeColor}
                      rx="0.5"
                    />
                  </g>
                );
              })
            ) : (
              <>
                <path d={areaPath} fill="url(#areaGradient)" />
                <path d={linePath} fill="none" stroke="#0098EA" strokeWidth="2" />
              </>
            )}

            {/* X-Axis labels */}
            {history.filter((_, i) => i % Math.max(1, Math.floor(history.length / 5)) === 0).map((h, i) => {
              const idx = history.findIndex(x => x.time === h.time);
              const x = getX(idx);
              const dateStr = new Date(h.time).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              return (
                <text
                  key={`time-${i}`}
                  x={x}
                  y={height - 5}
                  fill="#64748b"
                  textAnchor="middle"
                  className="text-[9px] font-mono font-semibold"
                >
                  {dateStr}
                </text>
              );
            })}

            {/* Hover crosshair tracker */}
            {hoveredIndex !== null && (
              <line
                x1={getX(hoveredIndex)}
                y1={margin.top}
                x2={getX(hoveredIndex)}
                y2={margin.top + chartHeight}
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
            )}
          </svg>

          {/* Mouse tracking overlay */}
          <div
            className="absolute inset-0 cursor-crosshair"
            style={{
              left: `${margin.left}px`,
              right: `${margin.right}px`,
              top: `${margin.top}px`,
              bottom: `${margin.bottom}px`,
            }}
            onMouseMove={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const clientX = e.clientX - bounds.left;
              const ratio = clientX / bounds.width;
              const index = Math.min(
                history.length - 1,
                Math.max(0, Math.round(ratio * (history.length - 1)))
              );
              setHoveredIndex(index);
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="gp-chip inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
            GramPad Swap
          </div>

          <h1 className="gp-display-font mt-3 text-2xl font-semibold leading-tight text-[var(--gp-text)] sm:text-3xl">
            Swap your GRAMX
          </h1>

          <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--gp-muted)] sm:text-sm">
            A clean reserve-backed swap for community access. No order book, no noise,
            just direct fixed-rate routes between GRAMX, USDT, and GRAM. May be required when you want to vote a project.<br></br>
            *Please note the TON is now GRAM
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
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Interactive Chart & Trade Ledger */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
            {/* Price Chart Card */}
            <div className="gp-panel rounded-2xl p-4 sm:rounded-[28px] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-sky-400" />
                  <h2 className="text-xs font-black uppercase tracking-[0.16em] text-white sm:text-sm">
                    GRAMX / USDT Exchange Chart
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Timeframe selector */}
                  <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs font-bold font-mono">
                    {(['1m', '5m', '1h'] as const).map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`rounded-md px-2.5 py-1 transition ${
                          timeframe === tf ? 'bg-[#0098EA] btn-white-text shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  {/* Chart type toggle */}
                  <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs font-bold">
                   
                    <button
                      onClick={() => setChartType('line')}
                      title="Line Chart"
                      className={`rounded-md p-1.5 transition ${
                        chartType === 'line' ? 'bg-[#0098EA] btn-white-text shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <AreaChart className="h-4 w-4" />
                    </button>
                     <button
                      onClick={() => setChartType('candle')}
                      title="Candlestick Chart"
                      className={`rounded-md p-1.5 transition ${
                        chartType === 'candle' ? 'bg-[#0098EA] btn-white-text shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CandlestickChart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {renderChart()}
            </div>

            {/* Live Exchange Recent Trades Ledger */}
            <div className="gp-panel rounded-2xl p-4 sm:rounded-[28px] sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white sm:text-sm">
                    Recent Exchange Swaps
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {simulating && (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Feed
                    </span>
                  )}
                  <span className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-400">
                    {recentSwaps.length} trades
                  </span>
                </div>
              </div>

              {recentSwaps.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No swap transactions recorded yet. Use the developer volume panel to generate trades.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Account</th>
                        <th className="py-2.5 px-3 text-right">Amount Paid</th>
                        <th className="py-2.5 px-3 text-right">Amount Received</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-[11px]">
                      {recentSwaps.slice(0, 12).map(tx => {
                        const isBuy = tx.fromAsset === 'USDT' || tx.toAsset === 'GRAMX';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-900/30 transition">
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  isBuy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {isBuy ? 'BUY' : 'SELL'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 select-all font-semibold">
                              {tx.address ? `${tx.address.slice(0, 6)}...${tx.address.slice(-4)}` : 'Anonymous'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-white">
                              {tx.fromAmount} <span className="text-[10px] text-slate-400">{tx.fromAsset}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                              {tx.toAmount} <span className="text-[10px] text-emerald-500/70">{tx.toAsset}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300">
                              ${tx.price.toFixed(4)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-500">
                              {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Swap Card & Status */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-1 lg:order-2">
            {/* Swap Form Card */}
            <div className="gp-panel rounded-3xl p-4 sm:p-7 border border-sky-500/25 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 shadow-2xl relative overflow-hidden">
              {/* Glowing Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.5)]" />

              <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                    Instant Swap
                  </h2>
                </div>

                <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 font-mono text-xs font-bold text-sky-300 shadow-inner">
                  {fromSymbol} → {toSymbol}
                </span>
              </div>

              <div className="space-y-3 relative">
                {/* YOU PAY INPUT BOX */}
                <div className="group rounded-2xl border border-slate-800 bg-slate-950/90 p-4 transition-all duration-200 focus-within:border-sky-400/60 focus-within:shadow-[0_0_20px_rgba(0,152,234,0.15)] hover:border-slate-700">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      You Pay
                    </span>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">
                        Balance: <strong className="text-white">{fromBalance}</strong>
                      </span>
                      {Number(fromBalance) > 0 && (
                        <button
                          type="button"
                          onClick={() => setAmount(fromBalance)}
                          className="rounded-md border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-black text-sky-400 transition hover:bg-sky-400/20 active:scale-95"
                        >
                          MAX
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <input
                      value={amount}
                      onChange={event => setAmount(event.target.value)}
                      inputMode="decimal"
                      placeholder="0.0"
                      className="min-w-0 flex-1 bg-transparent font-mono !text-3xl sm:!text-4xl !font-black tracking-tight text-white outline-none placeholder:text-slate-700"
                    />

                    <div className="relative">
                      <select
                        value={fromAsset}
                        onChange={event => handleFromAssetChange(event.target.value as SwapAsset)}
                        className="appearance-none rounded-2xl border border-sky-400/30 bg-sky-400/15 px-4 py-2.5 pr-8 text-xs font-black text-sky-300 shadow-sm outline-none transition hover:bg-sky-400/25 hover:border-sky-400/60 cursor-pointer"
                      >
                        {fromOptions.map(option => (
                          <option key={option} value={option} className="bg-slate-900 text-white font-bold">
                            {option}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sky-400">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FLIP BUTTON */}
                <div className="flex justify-center -my-2.5 relative z-10">
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/40 bg-slate-900 text-sky-400 shadow-lg shadow-sky-500/10 transition-all duration-300 hover:rotate-180 hover:scale-110 hover:border-sky-400 hover:bg-sky-400/20 active:scale-95"
                    title="Flip swap direction"
                  >
                    <ArrowDownUp className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>

                {/* YOU RECEIVE INPUT BOX */}
                <div className="group rounded-2xl border border-slate-800 bg-slate-950/90 p-4 transition-all duration-200 hover:border-slate-700">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      You Receive (Estimated)
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 font-mono text-3xl sm:text-4xl font-black tracking-tight text-emerald-400 truncate">
                      {quote || '0.0'}
                    </div>

                    <div className="relative">
                      <select
                        value={toAsset}
                        onChange={event => handleToAssetChange(event.target.value as SwapAsset)}
                        className="appearance-none rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 pr-8 text-xs font-black text-emerald-300 shadow-sm outline-none transition hover:bg-emerald-500/25 hover:border-emerald-400/60 cursor-pointer"
                      >
                        {toOptions.map(option => (
                          <option key={option} value={option} className="bg-slate-900 text-white font-bold">
                            {option}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RATE & LIMIT INFO */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Exchange Rate
                  </span>
                  <p className="mt-1.5 font-mono text-xs font-bold text-white truncate">
                    {fixedRateLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Route Limit
                  </span>
                  <p className="mt-1.5 font-mono text-xs font-bold text-white truncate">
                    {direction === 'ton-to-gram' || direction === 'gram-to-ton'
                      ? 'No USDT cap'
                      : config.maxBuyRaw === '0'
                        ? 'Unlimited'
                        : `${config.maxBuyLabel || '0'} USDT`}
                  </p>
                </div>
              </div>

              {/* CONTRACT ADDRESS CARD */}
              <div className="mt-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <span>Swap Contract</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Verified On-Chain</span>
                </div>

                <p
                  className="mt-1.5 break-all font-mono text-[11px] text-sky-400 hover:text-sky-300 transition cursor-pointer select-all"
                  title={config.contractAddress}
                >
                  {config.contractAddress}
                </p>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs leading-5 text-rose-300 font-medium">
                  {error}
                </div>
              )}

              {maxBuyExceeded && !error && (
                <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-5 text-amber-300 font-medium">
                  This swap amount is above the current maximum buy limit of{' '}
                  {config.maxBuyLabel || '0'} USDT.
                </div>
              )}

              {success && (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs leading-5 text-emerald-300 font-medium">
                  {success}
                </div>
              )}

              <button
                onClick={handleSwap}
                disabled={busy || !amount || details?.details?.paused || maxBuyExceeded}
                className="btn-white-text mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0098EA] py-4 text-sm font-black transition-all duration-200 hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Swap...
                  </>
                ) : (
                  `Confirm Swap (${fromSymbol} → ${toSymbol})`
                )}
              </button>
            </div>

            {/* Swap Status Card */}
            <div className="gp-panel rounded-2xl p-4 sm:rounded-[28px] sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sky-400" />
                <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--gp-text)] sm:text-sm">
                  Swap Status
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
                    } GRAMX`,
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
                    'GRAM reserve',
                    `${
                      details
                        ? formatUnits(
                            details.details.tonReserve,
                            9,
                            4
                          )
                        : '0'
                    } GRAM`,
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
          </div>
        </div>
      )}
    </div>
  );
}
