import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  HelpCircle,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';

export type InfoPageKey =
  | 'listing-rules'
  | 'refund-policy'
  | 'risk-disclaimer'
  | 'faq'
  | 'terms'
  | 'privacy'
  | 'trust-mechanics';

interface InfoPageProps {
  page: InfoPageKey;
  onApply: () => void;
  onBackHome: () => void;
}

const pages: Record<InfoPageKey, {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
  sections: Array<{ title: string; body: string[] }>;
  cta?: string;
}> = {
  'listing-rules': {
    eyebrow: 'Launch requirements',
    title: 'Project Listing Rules',
    description: 'Minimum expectations for projects applying to launch through GramPad.',
    icon: FileCheck2,
    cta: 'Apply Now',
    sections: [
      {
        title: 'Project readiness',
        body: [
          'Projects should provide a clear product summary, token utility, launch timeline, website, social links, team contact, and tokenomics.',
          'GramPad may request KYC, audit documents, founder verification, community proof, and additional due diligence before approval.',
        ],
      },
      {
        title: 'Token and sale rules',
        body: [
          'Sale terms must be consistent with the deployed TON IDO contract, including caps, contribution limits, vesting, and sale token deposit.',
          'Misleading supply, fake partnerships, unverifiable claims, or unsafe token contracts can lead to rejection or delisting.',
        ],
      },
      {
        title: 'Transparency requirements',
        body: [
          'Approved projects should keep users informed about listing progress, liquidity proof, lock evidence, milestone status, and claim/refund dates.',
          'Admin configuration can mark a project as under review, upcoming, live, past, or hidden from the user portal.',
        ],
      },
    ],
  },
  'refund-policy': {
    eyebrow: 'Investor protection',
    title: 'Refund Policy',
    description: 'How refund eligibility is determined for failed or protected IDO outcomes.',
    icon: ShieldCheck,
    sections: [
      {
        title: 'Failed IDO refunds',
        body: [
          'Refunds are available when the IDO smart contract is in failed state, or when distribution starts while the raised amount is below the soft cap.',
          'Eligible investors can claim their refundable USDT directly through the project contract. The database is synchronized after on-chain confirmation.',
        ],
      },
      {
        title: 'Liquidity/listing protection',
        body: [
          'Where enabled for a launch, investor protection may require liquidity or listing proof within the stated deadline.',
          'If the required protection condition is not met, the pool can move to a refund path according to the project terms and smart contract rules.',
        ],
      },
      {
        title: 'Important limits',
        body: [
          'Network fees are paid by the wallet user and are not part of the USDT refund amount.',
          'Refunds depend on the contract state and available Jetton balances. Always verify the project contract and wallet prompts before signing.',
        ],
      },
    ],
  },
'risk-disclaimer': {
eyebrow: 'Read before participating',
title: 'Risk Disclaimer',
description: 'Participation in IDOs, token sales, staking, voting systems, launch pools, liquidity programs, and blockchain-based products involves substantial financial, technical, and operational risk.',
icon: AlertTriangle,
sections: [
{
title: 'No Financial or Investment Advice',
body: [
'GramPad does not provide financial, investment, legal, tax, or accounting advice.',
'All content, trust scores, audits, community votes, project reviews, and platform information are provided for informational purposes only.',
'Users should seek independent professional advice before making investment decisions.',
],
},
{
title: 'DYOR (Do Your Own Research)',
body: [
'Every participant is solely responsible for conducting independent research before contributing to any project.',
'Users should review tokenomics, vesting schedules, audits, smart contracts, team credentials, community activity, market conditions, and project roadmaps before participating.',
'Never invest based solely on community votes, launchpad listings, social media activity, trust scores, or marketing materials.',
],
},
{
title: 'Risk of Total Loss',
body: [
'Cryptocurrency investments are highly speculative and may result in the partial or complete loss of invested funds.',
'Token prices may decline significantly after listing or become permanently worthless.',
'Users should only participate with funds they can afford to lose entirely.',
],
},
{
title: 'Market & Liquidity Risk',
body: [
'Token prices can experience extreme volatility before and after listing.',
'Liquidity may be limited or unavailable, making it difficult to buy, sell, or exit positions.',
'Market manipulation, whale activity, low trading volume, or broader market conditions may significantly impact token prices.',
],
},
{
title: 'Project Failure Risk',
body: [
'Projects may fail to execute their roadmap, deliver promised products, achieve adoption, secure exchange listings, maintain liquidity, or attract users.',
'Even projects that successfully complete fundraising may later fail due to operational, technical, financial, regulatory, or market-related reasons.',
'GramPad cannot guarantee the future success or viability of any listed project.',
],
},
{
title: 'Smart Contract Risk',
body: [
'Smart contracts may contain vulnerabilities, coding errors, design flaws, economic exploits, governance risks, or undiscovered bugs.',
'Even audited contracts may experience failures or security incidents.',
'Users acknowledge the inherent risks of interacting with decentralized smart contracts and blockchain applications.',
],
},
{
title: 'Blockchain & Network Risk',
body: [
'Blockchain networks may experience outages, congestion, forks, validator issues, software bugs, network attacks, or unexpected behavior.',
'Transaction delays, failed transactions, incorrect wallet interactions, and network instability may affect participation outcomes.',
'GramPad is not responsible for losses resulting from blockchain network failures.',
],
},
{
title: 'Wallet Security Risk',
body: [
'Users are solely responsible for protecting their wallets, private keys, recovery phrases, passwords, and authentication methods.',
'Compromised wallets may result in permanent loss of digital assets.',
'GramPad will never request private keys or recovery phrases.',
],
},
{
title: 'Community Voting Disclaimer',
body: [
'Community voting is intended as a discovery and engagement mechanism and should not be interpreted as investment advice or endorsement.',
'A successful vote does not guarantee legitimacy, profitability, safety, future exchange listings, or project success.',
],
},
{
title: 'Escrow, Milestone & Fund Release Risk',
body: [
'Milestone-based fund releases, liquidity commitments, escrow protections, and listing safeguards are designed to reduce risk but cannot eliminate it entirely.',
'Project owners may still face operational challenges, delays, market downturns, or external events that impact project performance.',
'Investors should carefully review each project\'s specific protection and release terms before participating.',
],
},
{
title: 'Refund Protection Limitations',
body: [
'Refund mechanisms may only apply under specific conditions disclosed by the project and platform.',
'Not all project failures qualify for refunds.',
'Users should review refund eligibility rules before contributing.',
],
},
{
title: 'Regulatory & Legal Risk',
body: [
'Digital asset regulations vary significantly across jurisdictions and may change at any time.',
'Certain tokens, services, or launch activities may become restricted, regulated, or prohibited in specific countries.',
'Users are responsible for ensuring compliance with laws applicable to their jurisdiction.',
],
},
{
title: 'Technology Risk',
body: [
'Failures involving APIs, hosting providers, cloud infrastructure, data synchronization systems, wallet providers, or third-party integrations may affect platform functionality.',
'Temporary outages or disruptions may impact user experience and access to platform services.',
],
},
{
title: 'No Guarantee of Listings',
body: [
'Projects may intend to list on centralized exchanges (CEXs) or decentralized exchanges (DEXs), but such listings are not guaranteed.',
'Exchange decisions remain entirely under the control of the respective exchange operators.',
],
},
{
title: 'Limitation of Liability',
body: [
'GramPad, its operators, affiliates, contributors, employees, contractors, and partners shall not be liable for losses arising from token purchases, market volatility, project failures, smart contract vulnerabilities, exchange listings, liquidity events, or blockchain network issues.',
'Users participate entirely at their own risk.',
],
},
{
title: 'Acknowledgement of Risk',
body: [
'By using GramPad and participating in any launch, staking program, vote, lottery, raffle, or token sale, you acknowledge that you fully understand and accept all associated risks.',
'You confirm that you are participating voluntarily and assume full responsibility for your decisions and outcomes.',
],
},
],
}
,
  faq: {
    eyebrow: 'Common questions',
    title: 'FAQ',
    description: 'Quick answers about GramPad launches, wallets, refunds, and claims.',
    icon: HelpCircle,
    sections: [
      {
        title: 'What is GramPad?',
        body: ['GramPad is a TON-first IDO launchpad for escrow-based fundraising, transparent sale terms, vesting, and investor protection workflows.'],
      },
      {
        title: 'Where do investor funds go?',
        body: ['During on-chain sale flows, contributions are handled by a project-specific IDO smart contract rather than going directly to the project owner.'],
      },
      {
        title: 'When can I claim tokens?',
        body: ['Claims open in the distribution phase according to the project vesting schedule, including TGE unlock and monthly linear vesting where configured.'],
      },
      {
        title: 'When can I refund?',
        body: ['Refunds are available only when the contract is in a failed/refundable state, such as failed soft cap or a configured protection failure.'],
      },
      
    ],
  },
 terms: {
eyebrow: 'Platform terms',
title: 'Terms and Conditions',
description: 'Rules, responsibilities, risk disclosures, and conditions governing the use of GramPad.io and its associated smart contracts, launch pools, staking products, voting systems, and ecosystem services.',
icon: ScrollText,
sections: [
{
title: 'Acceptance of Terms',
body: [
'By accessing or using GramPad.io, you agree to be bound by these Terms and Conditions and any future amendments published on the platform.',
'If you do not agree with these terms, you must discontinue use of the platform immediately.',
],
},
{
title: 'Platform Purpose',
body: [
'GramPad provides infrastructure for project discovery, community voting, launch pools, staking, liquidity locking, escrow-based fundraising, and token distribution on supported blockchain networks.',
'GramPad does not provide financial, investment, legal, tax, or accounting advice.',
],
},
{
title: 'DYOR (Do Your Own Research)',
body: [
'All users are solely responsible for conducting their own independent research before participating in any launch, staking program, token sale, or community vote.',
'Information displayed on GramPad is provided by project teams or third-party sources and may contain inaccuracies, omissions, or future changes.',
'Past performance, audit status, trust scores, or community votes do not guarantee future success or profitability.',
],
},
{
title: 'Investment & Financial Risk',
body: [
'Digital assets are highly volatile and speculative. Token values may increase, decrease, or become worthless.',
'Participation in any IDO, launch pool, staking program, or token purchase may result in partial or total loss of funds.',
'Users acknowledge that GramPad cannot guarantee project success, exchange listings, liquidity levels, trading volume, token price stability, or future returns.',
],
},
{
title: 'Community Voting',
body: [
'Community voting serves as a transparency and discovery mechanism and should not be interpreted as endorsement, certification, or investment advice.',
'A project receiving positive community votes does not guarantee legitimacy, safety, profitability, or future performance.',
],
},
{
title: 'Escrow-Based Fundraising',
body: [
'Certain projects may utilize escrow-based fundraising structures where raised funds are released according to predefined milestones.',
'Fund release schedules, liquidity commitments, listing conditions, and protection rules are defined per project and displayed publicly before participation.',
'Users are responsible for reviewing and understanding project-specific escrow terms before contributing.',
],
},
{
title: 'Liquidity Locking & Fund Release',
body: [
'Projects may commit portions of raised capital toward liquidity provision and liquidity locking.',
'Milestone-based fund releases may depend on conditions such as successful token listing, liquidity deployment, trading activity, or other disclosed milestones.',
'GramPad may facilitate contract enforcement but does not guarantee project execution or market performance.',
],
},
{
title: 'Refund Protection',
body: [
'Refund functionality may be available only where explicitly supported by the project contract or platform rules.',
'Refund eligibility may depend on soft-cap conditions, listing protection settings, milestone failures, or other predefined requirements.',
'Users must review project-specific refund conditions before contributing.',
],
},
{
title: 'Smart Contract Risks',
body: [
'All blockchain transactions involve technical risks including software bugs, vulnerabilities, oracle failures, governance attacks, wallet compromises, network congestion, and unexpected contract behavior.',
'Even audited smart contracts may contain undiscovered vulnerabilities.',
'Users assume all risks associated with interacting with blockchain networks and smart contracts.',
],
},
{
title: 'On-Chain Transaction Finality',
body: [
'Blockchain transactions are generally irreversible once confirmed by the network.',
'GramPad cannot reverse, cancel, modify, or recover completed blockchain transactions.',
'Users must verify all transaction details before approving wallet signatures.',
],
},
{
title: 'Project Listings',
body: [
'GramPad reserves the right to review, reject, suspend, delist, or hide any project that violates platform standards, provides misleading information, engages in malicious behavior, or creates unacceptable risk.',
'Project approval on GramPad does not constitute endorsement, investment recommendation, or guarantee of legitimacy.',
],
},
{
title: 'No Custody of User Assets',
body: [
'GramPad does not take custody of user assets except where assets are temporarily governed by deployed smart contracts under disclosed platform rules.',
'Users retain responsibility for wallet security, private keys, seed phrases, backups, and access credentials.',
],
},
{
title: 'User Responsibilities',
body: [
'Users must comply with applicable laws and regulations in their jurisdiction.',
'Users may not engage in fraud, market manipulation, abuse of platform systems, automated exploitation, vote manipulation, or other malicious activity.',
'GramPad reserves the right to restrict access to users who violate platform policies.',
],
},
{
title: 'Limitation of Liability',
body: [
'To the maximum extent permitted by law, GramPad, its operators, contributors, partners, contractors, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or financial losses arising from platform usage.',
'This includes losses related to token value declines, smart contract failures, project failures, security incidents, liquidity events, exchange listings, delistings, or market conditions.',
],
},
{
title: 'Changes to Terms',
body: [
'GramPad reserves the right to modify these Terms and Conditions at any time.',
'Continued use of the platform after updates constitutes acceptance of the revised terms.',
],
},
],
},
privacy: {
eyebrow: 'Data protection',
title: 'Privacy Policy',
description: 'How GramPad collects, stores, processes, and protects user, project, wallet, and launchpad data.',
icon: LockKeyhole,
sections: [
{
title: 'Information We Collect',
body: [
'GramPad may collect wallet addresses, transaction hashes, contribution records, staking activity, voting activity, referral data, whitelist registrations, and launch participation records.',
'Project applications may include company details, team member information, social links, token information, whitepapers, audit reports, KYC documents, marketing materials, and launch requirements.',
'Technical information such as IP address, browser type, device information, operating system, and usage analytics may be collected to improve platform performance and security.',
],
},
{
title: 'How We Use Your Information',
body: [
'Information is used to process project applications, manage launch pools, validate participation eligibility, display project information, maintain platform security, and provide customer support.',
'Data may be used to synchronize user interfaces with blockchain activity, monitor platform performance, prevent abuse, detect fraud, and improve user experience.',
'Email addresses or contact details may be used to provide application updates, launch notifications, support responses, security alerts, and important platform announcements.',
],
},
{
title: 'Blockchain Transparency',
body: [
'Transactions executed on public blockchain networks are inherently public and may remain permanently visible on-chain.',
'Wallet addresses, transaction records, token transfers, staking positions, voting activity, and smart contract interactions may be publicly accessible through blockchain explorers.',
'GramPad cannot remove, modify, or erase information that has already been permanently recorded on a public blockchain.',
],
},
{
title: 'Project Listing Information',
body: [
'Information submitted by project teams for launch consideration may be reviewed by GramPad administrators and compliance reviewers.',
'Approved project information may become publicly visible on the platform including project descriptions, token details, social links, fundraising information, vesting schedules, and launch metrics.',
'Project owners are responsible for ensuring the accuracy and legality of all submitted information.',
],
},
{
title: 'Cookies & Analytics',
body: [
'GramPad may use cookies, local storage, analytics tools, and similar technologies to remember preferences, maintain sessions, improve navigation, and understand platform usage patterns.',
'Users may disable certain cookies through browser settings, although some platform functionality may become unavailable.',
],
},
{
title: 'Data Sharing',
body: [
'GramPad does not sell personal information to third parties.',
'Information may be shared with service providers, infrastructure providers, legal authorities, auditors, compliance partners, or security partners where necessary to operate the platform or comply with legal obligations.',
'Public project information and blockchain activity may be visible to other users through the platform.',
],
},
{
title: 'Security Measures',
body: [
'GramPad implements reasonable administrative, technical, and organizational safeguards to protect information from unauthorized access, misuse, alteration, or disclosure.',
'Despite these measures, no internet service, blockchain network, database, or digital platform can guarantee absolute security.',
],
},
{
title: 'Wallet Security',
body: [
'Users remain solely responsible for the security of their wallets, private keys, seed phrases, recovery phrases, passwords, and authentication credentials.',
'GramPad will never request private keys or recovery phrases.',
'Loss of wallet access may result in permanent inability to access blockchain-based assets.',
],
},
{
title: 'Data Retention',
body: [
'GramPad may retain application records, project information, transaction references, compliance materials, support communications, and operational logs for as long as necessary to provide services and comply with legal obligations.',
'Certain blockchain-related information cannot be deleted due to the permanent nature of distributed ledger technology.',
],
},
{
title: 'Your Rights',
body: [
'Users may request updates or corrections to submitted information where technically and legally possible.',
'Users may disconnect wallets, stop using the platform, or request account-related assistance by contacting GramPad support.',
'Certain information may be retained where required by law, security obligations, dispute resolution requirements, or blockchain record permanence.',
],
},
{
title: 'Third-Party Services',
body: [
'GramPad may link to external websites, exchanges, social networks, analytics services, wallets, blockchain explorers, KYC providers, and infrastructure providers.',
'GramPad is not responsible for the privacy practices, security controls, or content of third-party services.',
],
},
{
title: 'Children\'s Privacy',
body: [
'GramPad is not intended for individuals under the age permitted by applicable laws in their jurisdiction.',
'Users are responsible for ensuring they are legally permitted to access and use blockchain-related services.',
],
},
{
title: 'Policy Updates',
body: [
'GramPad reserves the right to modify this Privacy Policy at any time.',
'Continued use of the platform after updates become effective constitutes acceptance of the revised Privacy Policy.',
],
},
],
}
,
  'trust-mechanics': {
    eyebrow: 'How protection works',
    title: 'How GramPad Trust Mechanics Work',
    description: 'A practical explanation of escrow raises, liquidity locks, milestone releases, and automatic refund protection.',
    icon: BadgeCheck,
    sections: [
      {
        title: 'Escrow-based raises',
        body: [
          'Each deployed IDO uses a project-specific smart contract. Investor contributions are tracked by the contract instead of being sent directly to the project owner.',
          'The contract records contribution totals, allocations, claim state, and refund state so investors can verify the funding path.',
        ],
      },
      {
        title: 'Liquidity locking',
        body: [
          'Launch terms can require a portion of raised funds or token liquidity to be added and locked before project owner fund release.',
          'Lock status, wallet addresses, and proof links should be visible so users can review whether liquidity commitments were met.',
        ],
      },
      {
        title: 'Milestone fund releases',
        body: [
          'Instead of full immediate release, projects can be evaluated against listing, roadmap, audit, KYC, or liquidity milestones.',
          'This reduces the risk of projects receiving all funds before delivering core launch commitments.',
        ],
      },
      {
        title: 'Automatic investor refund protection',
        body: [
          'If soft cap or protection rules fail, eligible investors can claim refunds from the smart contract path rather than waiting for manual project action.',
          'The UI then synchronizes the database after the chain confirms the refund state.',
        ],
      },

      {
        title: 'Investor Fund Security',
        body: [
          'Investors get 2 hours decision window to decide whether they should get refund or claim the tokens after the listing ',
           'This 2 hour refund window opens for investor only after listing of the project',
        ],
      },
    ],
  },
};

export default function InfoPage({ page, onApply, onBackHome }: InfoPageProps) {
  const content = pages[page];
  const Icon = content.icon;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={onBackHome}
        className="mb-6 rounded-xl border border-[var(--gp-border)] px-4 py-2 text-xs font-bold text-[var(--gp-muted)] transition hover:text-[var(--gp-text)]"
      >
        Back to home
      </button>

      <section className="gp-panel overflow-hidden rounded-[32px] p-6 sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/[0.08] text-sky-400">
            <Icon className="h-6 w-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-400">
              {content.eyebrow}
            </span>
            <h1 className="gp-display-font mt-3 text-4xl font-black tracking-[-0.04em] text-[var(--gp-text)] sm:text-6xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--gp-muted)]">
              {content.description}
            </p>
          </div>
        </div>

        <div className="mt-9 grid gap-4">
          {content.sections.map(section => (
            <article
              key={section.title}
              className="rounded-2xl border border-[var(--gp-border)] bg-white/[0.025] p-5"
            >
              <h2 className="text-lg font-black text-[var(--gp-text)]">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map(item => (
                  <p key={item} className="text-sm leading-7 text-[var(--gp-muted)]">
                    {item}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {content.cta && (
          <button
            onClick={onApply}
            className="btn-white-text mt-8 inline-flex items-center gap-2 rounded-full bg-[#0098EA] px-7 py-3.5 text-sm font-black text-white"
          >
            {content.cta} <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </section>
    </main>
  );
}
