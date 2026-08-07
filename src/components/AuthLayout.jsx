import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Press-branded auth shell — brand first, editorial type, no generic SaaS card.
 */
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-16 bg-[var(--hw-bg)]">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-baseline gap-[2px] mb-8">
            <span className="font-mono text-[14px] tracking-[0.2em] text-[var(--hw-ink)]">
              HUMAN
            </span>
            <span className="font-serif italic text-xl text-[var(--hw-gold)] leading-none">
              Weather
            </span>
            <span className="font-mono text-[14px] text-[var(--hw-ink)]">.</span>
          </Link>
          <div className="w-10 h-[2px] bg-[var(--hw-gold)] mx-auto mb-6" />
          <h1 className="font-serif text-[clamp(28px,5vw,36px)] font-light tracking-[-0.01em] text-[var(--hw-ink)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="font-serif italic text-base text-[var(--hw-ink2)] mt-3">{subtitle}</p>
          )}
        </div>

        <div className="border-t border-b border-[rgba(154,125,46,0.22)] py-8">
          {children}
        </div>

        {footer && (
          <p className="text-center font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-ink3)] mt-8">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
