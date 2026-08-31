import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
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
import Account from '@/pages/Account';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Gospels from '@/pages/Gospels';
import AuthBridge from '@/pages/AuthBridge';

const AuthenticatedApp = () => {
  const location = useLocation();

  // Keep the legacy bridge isolated only so any already-issued OAuth callback
  // can return safely to the press. New member auth begins on /login.
  if (location.pathname === '/auth/bridge') {
    return <AuthBridge />;
  }

  // Public press routes render immediately. Auth continues to initialize in
  // AuthProvider without replacing the publication with a blocking boot screen.
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
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
      </Route>
      <Route path="/auth/bridge" element={<AuthBridge />} />
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
