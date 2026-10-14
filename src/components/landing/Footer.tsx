import Link from "next/link";
import { BookOpen, Mail, ShieldCheck, Globe } from "lucide-react";

function TwitterIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0 0-3.36 1.68 1.68 0 0 0 0 3.36M5.07 18.5h2.79v-8.37H5.07v8.37z" />
    </svg>
  );
}

const footerNavigation = {
  Product: [
    { label: "CEFR Courses (A1–C2)", href: "/courses" },
    { label: "Diagnostic Placement Test", href: "/tests/placement" },
    { label: "SM-2 Flashcard Decks", href: "/flashcards" },
    { label: "AI Writing Studio", href: "/writing" },
    { label: "Bilingual Stories", href: "/stories" },
    { label: "Pricing & Plans", href: "/pricing" },
  ],
  Pathways: [
    { label: "German Tech & Workplace", href: "/courses" },
    { label: "University & TestDaF Prep", href: "/courses" },
    { label: "Medical Licensure (FSP)", href: "/courses" },
    { label: "Citizenship & DTZ Exam", href: "/tests" },
    { label: "Everyday Travel & Culture", href: "/stories" },
  ],
  Compliance: [
    { label: "Impressum (Legal Notice)", href: "/settings" },
    { label: "Datenschutzerklärung (Privacy)", href: "/settings" },
    { label: "AGB (Terms of Service)", href: "/settings" },
    { label: "Widerrufsbelehrung (Refunds)", href: "/settings/billing" },
    { label: "Cookie-Einstellungen", href: "/settings" },
  ],
  Company: [
    { label: "CEFR Framework Standards", href: "/design-system" },
    { label: "Design System Specification", href: "/design-system" },
    { label: "Curriculum Methodology", href: "#ai-tutor" },
    { label: "System Status", href: "/dashboard" },
    { label: "Contact Support", href: "mailto:support@deutschpfad.app" },
  ],
};

const socials = [
  { icon: TwitterIcon,  href: "#", label: "Twitter" },
  { icon: GithubIcon,   href: "#", label: "GitHub"  },
  { icon: LinkedinIcon, href: "#", label: "LinkedIn"},
  { icon: Mail,         href: "mailto:support@deutschpfad.app", label: "Email Support" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] relative">
      {/* Brand accent gradient bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-brand-600)] via-[var(--color-brand-500)] to-[var(--color-accent-500)] opacity-80" />

      <div className="container-xl py-16">
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-brand-500)] via-[var(--color-brand-600)] to-[var(--color-accent-500)] p-[1.5px] shadow-md">
                <div className="w-full h-full bg-[var(--color-surface)] rounded-[calc(var(--radius-lg)-1.5px)] flex items-center justify-center">
                  <BookOpen size={16} className="text-[var(--color-brand-400)]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold text-[var(--color-text-primary)] leading-none">
                  Deutsch<span className="text-[var(--color-brand-400)]">Pfad</span>
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--color-accent-500)] mt-0.5">
                  CEFR A1–C2 Standard
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 max-w-sm">
              The clinical, science-backed learning platform for English speakers mastering German. Aligned strictly with Goethe-Institut, telc, and CEFR standards.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 mb-4">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand-400)] hover:text-[var(--color-brand-400)] bg-[var(--color-surface-2)]/40 transition-all duration-150"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>EU DSGVO / GDPR Compliant Data Hosting</span>
            </div>
          </div>

          {/* Navigation Columns */}
          {Object.entries(footerNavigation).map(([section, links]) => (
            <div key={section}>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-4">
                {section}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal / German Compliance Bar */}
        <div className="border-t border-[var(--color-border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>© 2026 DeutschPfad EdTech GmbH. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/settings" className="hover:text-[var(--color-text-primary)] transition-colors">
              Impressum (Legal Notice)
            </Link>
            <span>·</span>
            <Link href="/settings" className="hover:text-[var(--color-text-primary)] transition-colors">
              Datenschutz (Privacy)
            </Link>
            <span>·</span>
            <Link href="/settings" className="hover:text-[var(--color-text-primary)] transition-colors">
              AGB (Terms)
            </Link>
            <span>·</span>
            <Link href="/settings/billing" className="hover:text-[var(--color-text-primary)] transition-colors">
              Widerruf (Cancellation)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
