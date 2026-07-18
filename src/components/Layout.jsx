import { Outlet } from 'react-router-dom';
import Masthead from './Masthead';
import Footer from './Footer';
import { ThemeProvider } from '@/lib/hwTheme';

export default function Layout() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-[var(--hw-bg)] text-[var(--hw-ink)] transition-colors duration-500">
        <Masthead />
        <main className="flex-1 pt-14">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}