import { Outlet } from 'react-router-dom';
import Masthead from './Masthead';
import Footer from './Footer';
import { RegisterProvider } from './Register';
import ReaderMemoryLayer from './ReaderMemoryLayer';
import ArticleContinuityLayer from './ArticleContinuityLayer';
import EssayShareFreshnessLayer from './EssayShareFreshnessLayer';
import GospelsDailyLayer from './GospelsDailyLayer';
import SeriesAtmosphereLayer from './SeriesAtmosphereLayer';
import { ThemeProvider } from '@/lib/hwTheme';

export default function Layout() {
  return (
    <ThemeProvider>
      <RegisterProvider>
        <div className="min-h-screen flex flex-col bg-[var(--hw-paper)] text-[var(--hw-ink)]">
          <Masthead />
          <ReaderMemoryLayer />
          <ArticleContinuityLayer />
          <EssayShareFreshnessLayer />
          <GospelsDailyLayer />
          <SeriesAtmosphereLayer />
          <div className="flex-1">
            <main className="pt-[5.5rem]">
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </RegisterProvider>
    </ThemeProvider>
  );
}
