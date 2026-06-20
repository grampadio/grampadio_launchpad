import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, FileCheck2, Loader2, ShieldCheck } from 'lucide-react';

const initialForm = {
  projectName: '',
  tokenSymbol: '',
  decimals: '9',
  logo: '',
  category: '',
  projectSummary: '',
  productStatus: '',
  website: '',
  whitepaper: '',
  pitchDeck: '',
  github: '',
  telegram: '',
  twitter: '',
  discord: '',
  facebook: '',
  instagram: '',
  reddit: '',
  medium: '',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactTelegram: '',
  teamSize: '1',
  teamBackground: '',
  companyCountry: '',
  legalEntity: '',
  kycReady: false,
  auditStatus: '',
  auditLink: '',
  jettonAddress: '',
  totalSupply: '',
  targetRaiseUsdt: '',
  softCapUsdt: '',
  tokenPriceUsdt: '',
  liquidityPercent: '50',
  vestingDurationMonths: '0',
  vestingCliffMonths: '0',
  vestingTgePercent: '0',
  launchTimeline: '',
  communitySize: '',
  referralSource: '',
  additionalNotes: '',
  consent: false,
};

type ApplicationForm = typeof initialForm;

const inputClass = 'w-full rounded-xl border border-white/[0.08] bg-[#080E1A]/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 transition focus:border-sky-400/45 focus:outline-none';
const labelClass = 'mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400';

const categoryOptions = [
  { value: 'DeFi', label: 'DeFi (Decentralized Finance)' },
  { value: 'GameFi', label: 'GameFi (Web3 Gaming)' },
  { value: 'Infrastructure', label: 'Infrastructure & L1/L2' },
  { value: 'NFTs', label: 'NFTs & Digital Art' },
  { value: 'Meme', label: 'Meme Token' },
  { value: 'SocialFi', label: 'SocialFi' },
  { value: 'AI', label: 'Artificial Intelligence' },
  { value: 'DePIN', label: 'DePIN (Decentralized Physical Infrastructure Networks)' },
  { value: 'Launchpad', label: 'Launchpad / Incubator' },
  { value: 'Other', label: 'Other' },
];

const productStatusOptions = [
  { value: 'concept', label: 'Concept / Idea stage' },
  { value: 'MVP live', label: 'MVP live / Alpha / Beta' },
  { value: 'testnet', label: 'Testnet live' },
  { value: 'pre-launch', label: 'Pre-launch (Fully built)' },
  { value: 'live', label: 'Live on Mainnet' },
];

const auditStatusOptions = [
  { value: 'not_submitted', label: 'Not started / Not submitted' },
  { value: 'pending', label: 'In progress / Pending' },
  { value: 'verified', label: 'Completed & Verified' },
  { value: 'issues_found', label: 'Completed with issues' },
];

export default function ProjectApplicationForm() {
  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const update = (field: keyof ApplicationForm, value: string | boolean) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Front-end validations
    if (!form.logo) {
      setMessage({ type: 'error', text: 'Project logo is required.' });
      setSubmitting(false);
      return;
    }

    const liquidityPercent = Number(form.liquidityPercent);
    if (isNaN(liquidityPercent) || liquidityPercent < 50 || liquidityPercent > 100) {
      setMessage({ type: 'error', text: 'Liquidity allocation must be at least 50%.' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/project-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          decimals: Number(form.decimals),
          teamSize: Number(form.teamSize),
          targetRaiseUsdt: Number(form.targetRaiseUsdt) || 0,
          softCapUsdt: Number(form.softCapUsdt) || 0,
          tokenPriceUsdt: Number(form.tokenPriceUsdt) || 0,
          liquidityPercent: liquidityPercent,
          vestingDurationMonths: Number(form.vestingDurationMonths) || 0,
          vestingCliffMonths: Number(form.vestingCliffMonths) || 0,
          vestingTgePercent: Number(form.vestingTgePercent) || 0,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Application could not be submitted.');
      setForm(initialForm);
      setMessage({ type: 'success', text: `Application received. Reference: ${data.applicationId}. A confirmation email will be sent with review timing and fast track listing instructions.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name: keyof ApplicationForm, label: string, placeholder = '', type = 'text', required = false) => (
    <label>
      <span className={labelClass}>{label}{required ? ' *' : ''}</span>
      <input
        className={inputClass}
        type={type}
        required={required}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' ? 'any' : undefined}
        value={String(form[name])}
        placeholder={placeholder}
        onChange={event => update(name, event.target.value)}
      />
    </label>
  );

  const dropdown = (name: keyof ApplicationForm, label: string, options: { value: string; label: string }[], required = false) => (
    <label>
      <span className={labelClass}>{label}{required ? ' *' : ''}</span>
      <select
        className={inputClass}
        required={required}
        value={String(form[name])}
        onChange={event => update(name, event.target.value)}
      >
        <option value="" disabled>Select {label.toLowerCase()}...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#080E1A] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto mb-9 max-w-3xl text-center">
        <div className="gp-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
          <FileCheck2 className="h-3.5 w-3.5" /> Project application
        </div>
        <h1 className="gp-display-font mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Apply to launch on Grampad</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          Share the project, team, token, compliance, and fundraising details our review team needs. Submission does not guarantee listing; the Grampad team will contact qualified applicants directly.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* SECTION 1: Project overview */}
        <section className="gp-panel rounded-3xl p-5 sm:p-7">
          <h2 className="text-lg font-bold text-white">Project overview</h2>
          <p className="mt-1 text-xs text-slate-500">Tell us what you are building and where the product stands today.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {field('projectName', 'Project name', 'Gram Protocol', 'text', true)}
            {field('tokenSymbol', 'Token symbol', 'GRAM', 'text', true)}
            {field('decimals', 'Token decimals', '9', 'number', true)}
            {field('totalSupply', 'Total token supply', '1,000,000,000', 'text', true)}
            {dropdown('category', 'Category', categoryOptions, true)}
            {dropdown('productStatus', 'Product status', productStatusOptions, true)}
            
            <div className="sm:col-span-2">
              <span className={labelClass}>Project logo link *</span>
              <div className="mt-2 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Logo Preview"
                    className="h-16 w-16 rounded-xl border border-white/[0.08] bg-slate-900 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-white/[0.15] bg-[#080E1A]/70 text-slate-500 text-[10px] text-center font-medium">
                    No logo
                  </div>
                )}
                <label>
                  <input
                    className={inputClass}
                    type="url"
                    required
                    value={form.logo}
                    placeholder="https://example.com/logo.png"
                    onChange={event => update('logo', event.target.value)}
                  />
                  <span className="mt-2 block text-[11px] leading-5 text-slate-500">Paste a public HTTPS logo URL. Recommended size: 256x256.</span>
                </label>
              </div>
            </div>

            <label className="sm:col-span-2">
              <span className={labelClass}>Project summary *</span>
              <textarea className={`${inputClass} min-h-32 resize-y`} required maxLength={3000} value={form.projectSummary} onChange={event => update('projectSummary', event.target.value)} placeholder="Problem, product, TON integration, users, and competitive advantage." />
            </label>
          </div>
        </section>

        {/* SECTION 2: Social Links */}
        <section className="gp-panel rounded-3xl p-5 sm:p-7">
          <h2 className="text-lg font-bold text-white">Social links and resources</h2>
          <p className="mt-1 text-xs text-slate-500">Provide official project channels and documentation.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {field('website', 'Website', 'https://...', 'url', true)}
            {field('telegram', 'Telegram link', 'https://t.me/...', 'url', true)}
            {field('twitter', 'X / Twitter link', 'https://x.com/...', 'url', true)}
            {field('discord', 'Discord link', 'https://discord.gg/...', 'url')}
            {field('facebook', 'Facebook link', 'https://facebook.com/...', 'url')}
            {field('instagram', 'Instagram link', 'https://instagram.com/...', 'url')}
            {field('github', 'GitHub link', 'https://github.com/...', 'url')}
            {field('reddit', 'Reddit link', 'https://reddit.com/r/...', 'url')}
            {field('medium', 'Medium link', 'https://medium.com/...', 'url')}
            {field('whitepaper', 'Whitepaper', 'https://...', 'url')}
            {field('pitchDeck', 'Pitch deck', 'https://...', 'url')}
          </div>
        </section>

        {/* SECTION 3: Team and contact */}
        <section className="gp-panel rounded-3xl p-5 sm:p-7">
          <h2 className="text-lg font-bold text-white">Team and contact</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {field('contactName', 'Primary contact', 'Full name', 'text', true)}
            {field('contactRole', 'Role', 'Founder / CEO', 'text', true)}
            {field('contactEmail', 'Business email', 'founder@project.com', 'email', true)}
            {field('contactTelegram', 'Contact Telegram', '@username', 'text', true)}
            {field('teamSize', 'Team size', '5', 'number', true)}
            {field('companyCountry', 'Country / jurisdiction', 'United Arab Emirates', 'text', true)}
            {field('legalEntity', 'Legal entity', 'Company name, or not incorporated')}
            <label className="flex items-center gap-3 self-end rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
              <input type="checkbox" checked={form.kycReady} onChange={event => update('kycReady', event.target.checked)} />
              <span className="text-xs font-semibold text-slate-300">Founders are ready to complete KYC</span>
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>Team background *</span>
              <textarea className={`${inputClass} min-h-28 resize-y`} required value={form.teamBackground} onChange={event => update('teamBackground', event.target.value)} placeholder="Founder identities, relevant experience, previous products, and LinkedIn profiles." />
            </label>
          </div>
        </section>

        {/* SECTION 4: Token, raise, and compliance */}
        <section className="gp-panel rounded-3xl p-5 sm:p-7">
          <h2 className="text-lg font-bold text-white">Token, raise, and compliance</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {field('jettonAddress', 'Jetton address', 'Leave blank if not deployed')}
            {field('tokenPriceUsdt', 'IDO token price (USDT)', '0.05', 'number')}
            {field('targetRaiseUsdt', 'Target raise (USDT)', '250000', 'number')}
            {field('softCapUsdt', 'Soft cap (USDT)', '100000', 'number')}
            
            {/* Liquidity allocation minimum 50% */}
            <label>
              <span className={labelClass}>Liquidity allocation (%) *</span>
              <input
                className={inputClass}
                type="number"
                required
                min="50"
                max="100"
                value={form.liquidityPercent}
                placeholder="50"
                onChange={event => update('liquidityPercent', event.target.value)}
              />
            </label>

            {dropdown('auditStatus', 'Audit status', auditStatusOptions, true)}
            {field('auditLink', 'Audit report link', 'https://...', 'url')}
            {field('launchTimeline', 'Expected Launchdate', 'eg. 08/01/2026', 'text', true)}

            {/* Vesting parameters instead of vestingSummary */}
            {field('vestingDurationMonths', 'Vesting duration (months) *', '12', 'number', true)}
            {field('vestingCliffMonths', 'Cliff duration (months) *', '3', 'number', true)}
            {field('vestingTgePercent', 'TGE unlock percentage (%) *', '20', 'number', true)}
          </div>
        </section>

        {/* SECTION 5: Community and final notes */}
        <section className="gp-panel rounded-3xl p-5 sm:p-7">
          <h2 className="text-lg font-bold text-white">Community and final notes</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {field('communitySize', 'Community size', 'Telegram, X, Discord totals')}
            {field('referralSource', 'How did you hear about Grampad?')}
            <label className="sm:col-span-2">
              <span className={labelClass}>Additional notes</span>
              <textarea className={`${inputClass} min-h-24 resize-y`} value={form.additionalNotes} onChange={event => update('additionalNotes', event.target.value)} placeholder="Partnerships, market makers, launch requirements, or anything else we should review." />
            </label>
          </div>
          <label className="mt-6 flex items-start gap-3 rounded-2xl border border-sky-400/15 bg-sky-400/[0.055] p-4">
            <input className="mt-0.5" type="checkbox" required checked={form.consent} onChange={event => update('consent', event.target.checked)} />
            <span className="text-xs leading-5 text-slate-300">I confirm that the information is accurate and authorize Grampad to contact the project team for due diligence and listing discussions.</span>
          </label>

          {message && (
            <div className={`mt-5 flex items-start gap-2 rounded-xl border p-3 text-xs ${message.type === 'success' ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300' : 'border-rose-400/20 bg-rose-400/[0.07] text-rose-300'}`}>
              {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}
              {message.text}
            </div>
          )}

          <button disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0098EA] px-5 py-3.5 text-sm font-bold btn-white-text transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Submit application
          </button>
        </section>
      </form>
    </div>
  );
}
