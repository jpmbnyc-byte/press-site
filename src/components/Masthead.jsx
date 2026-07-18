import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/hwTheme';

export default function Masthead() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { mode, toggle } = useTheme();

  const navItems = [
    { label: 'Journal', path: '/journal' },
    { label: 'Series', path: '/series' },
    { label: 'About', path: '/about' },
    { label: 'Subscribe', path: '/subscribe' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0e0d0a] border-b border-[rgba(196,168,74,0.15)] flex items-center justify-between px-5 md:px-8"
        style={{ backdropFilter: 'blur(12px)' }}>
        <Link to="/" className="flex items-baseline gap-[2px]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-[#f0e9d8]">HUMAN</span>
          <span className="font-serif italic text-[16px] text-[#c4a84a] leading-none">Weather</span>
          <span className="font-mono text-[11px] text-[#f0e9d8]">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {navItems.slice(0, 3).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                location.pathname === item.path ? 'text-[#c4a84a]' : 'text-[#c8b99a] hover:text-[#c4a84a]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/subscribe"
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a84a] border border-[#c4a84a] px-4 py-[7px] hover:bg-[#c4a84a] hover:text-[#0e0d0a] transition-all duration-300"
          >
            Subscribe
          </Link>
          <button
            onClick={toggle}
            className="text-[#c8b99a] hover:text-[#c4a84a] transition-colors duration-300 ml-1"
            aria-label="Toggle day or night mode"
          >
            {mode === 'day' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={toggle} className="text-[#c8b99a]" aria-label="Toggle theme">
            {mode === 'day' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={() => setOpen(!open)} className="text-[#f0e9d8]" aria-label="Open menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-[#0e0d0a] flex flex-col items-center justify-center md:hidden">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="font-serif text-3xl font-light text-[#f0e9d8] py-4 hover:text-[#c4a84a] transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-10 text-[#c4a84a] text-xl tracking-[0.3em]">✦</div>
        </div>
      )}
    </>
  );
}