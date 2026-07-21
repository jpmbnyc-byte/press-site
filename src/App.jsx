import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Journal from '@/pages/Journal';
import Article from '@/pages/Article';
import Series from '@/pages/Series';
import SeriesDetail from '@/pages/SeriesDetail';
import About from '@/pages/About';
import Subscribe from '@/pages/Subscribe';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import Gospels from '@/pages/Gospels';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Brief boot state only — never redirect away from the public press site.
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0e0d0a] gap-4">
        <div className="w-8 h-8 border-2 border-[#c4a84a] border-t-transparent animate-spin" />
        <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a]/70">
          Opening the field journal…
        </div>
      </div>
    );
  }

  // Soft handling only — public site must always render routes.
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/:slug" element={<Article />} />
        <Route path="/series" element={<Series />} />
        <Route path="/series/:slug" element={<SeriesDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/gospels" element={<Gospels />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/subscribe/success" element={<CheckoutSuccess />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App