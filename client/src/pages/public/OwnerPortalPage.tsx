import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { authService } from '../../services/auth.service';

export default function OwnerPortalPage() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect straight to dashboard
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const email = username.trim();
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.accessToken);
        success('Signed in successfully!');
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        error('Invalid login credentials');
      }
    } catch (err: any) {
      error(err.message || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-lime/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-lime mb-4">
            <Shield size={14} />
            <span>Owner Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white uppercase">
            Sign In
          </h1>
          <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">
            Authorized sign in to manage projects, review bids, and access dashboard metrics.
          </p>
        </div>

        {/* Card */}
        <Card className="p-6 sm:p-8 border border-white/10 bg-surface/80 backdrop-blur-xl shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email address"
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="lime"
              className="w-full py-3.5 mt-2 rounded-xl font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(212,255,50,0.25)] cursor-pointer"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
