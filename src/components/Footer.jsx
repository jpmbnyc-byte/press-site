import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(154,125,46,0.22)] pt-14 pb-8 px-6 bg-[var(--hw-bg)] transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-baseline gap-[2px] mb-3">
              <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--hw-ink)]">HUMAN</span>
              <span className="font-serif italic text-base text-[var(--hw-gold)]">Weather</span>
              <span className="font-mono text-[11px] text-[var(--hw-ink)]">.</span>
            </div>
            <p className="font-serif italic text-sm text-[var(--hw-ink2)] max-w-[220px]">
              The emotional climate of modern life.
            </p>
            <p className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)] mt-5">
              © JP Bobo 2026 · PBWY™
            </p>
          </div>
          <div>
            <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-[var(--hw-gold)] mb-4">Navigate</div>
            <ul className="space-y-2.5">
              {[
                { label: 'Journal', path: '/journal' },
                { label: 'Series', path: '/series' },
                { label: 'About', path: '/about' },
                { label: 'Subscribe', path: '/subscribe' },
              ].map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--hw-ink2)] hover:text-[var(--hw-gold)] transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-[var(--hw-gold)] mb-4">Connect</div>
            <a
              href="https://humanweather.social"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--hw-ink2)] hover:text-[var(--hw-gold)] transition-colors duration-300 inline-block"
            >
              humanweather.social
            </a>
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--hw-ink2)] mt-2.5">@pbwyworldwide</p>
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--hw-ink2)] mt-2.5">PBWY™</p>
          </div>
        </div>
        <div className="text-center font-mono text-[8px] tracking-[0.3em] uppercase text-[var(--hw-gold)] opacity-25">
          Peace be with you.
        </div>
      </div>
    </footer>
  );
}
