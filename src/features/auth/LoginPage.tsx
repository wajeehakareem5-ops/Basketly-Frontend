import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginDemo, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch {
      // Error is toasted in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    setSubmitting(true);
    try {
      const loggedUser = await loginDemo(role);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest text-lime shadow-elevated mb-4">
          <Leaf className="w-8 h-8 fill-lime" />
        </div>
        <h2 className="text-3xl font-extrabold text-forest tracking-tight">Basketly</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Smart Grocery Planning & Automated Kitchen Deliveries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 shadow-elevated rounded-3xl border border-border sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-sage-light border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-forest hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-sage-light border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-card text-sm font-bold text-white bg-forest hover:bg-forest-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest transition active:scale-98 disabled:opacity-50"
            >
              <span>Sign in to Basketly</span>
              <ArrowRight className="w-4 h-4 text-lime" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-border">
            <span className="block text-center text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={submitting || isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-sage-light hover:bg-sage text-xs font-bold text-text-primary transition"
              >
                <User className="w-4 h-4 text-forest" />
                <span>Demo User</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={submitting || isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-sage-light hover:bg-sage text-xs font-bold text-text-primary transition"
              >
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Admin User</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-forest hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
