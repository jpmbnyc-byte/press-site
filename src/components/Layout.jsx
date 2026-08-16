import { Outlet } from 'react-router-dom';
import Masthead from './Masthead';
import Footer from './Footer';
import { RegisterProvider } from './Register';
import { ThemeProvider } from '@/lib/hwTheme';

export default function Layout() {
  return (
    <ThemeProvider>
      <RegisterProvider>
        <div className="min-h-screen flex flex-col bg-[var(--hw-paper)] text-[var(--hw-ink)]">
          <Masthead />
          <div className="flex-1 lg:pl-14">
            <main className="pt-[5.5rem] lg:pt-14">
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </RegisterProvider>
    </ThemeProvider>
  );
}