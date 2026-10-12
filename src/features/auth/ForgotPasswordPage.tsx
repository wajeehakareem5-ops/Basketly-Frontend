import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Leaf, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email);
      toast.success('Password reset link generated!');
      if (res.token) {
        setResetToken(res.token);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request password reset');
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
        <h2 className="text-3xl font-extrabold text-forest tracking-tight">Forgot Password</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Enter your registered email address to receive a secure reset token
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 shadow-elevated rounded-3xl border border-border sm:px-10">
          {resetToken ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-state-success font-medium">
                Reset link generated for testing environment. Click below to set a new password:
              </div>
              <Link
                to={`/reset-password?token=${resetToken}`}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl shadow-card text-sm font-bold text-white bg-forest hover:bg-forest-deep"
              >
                <span>Reset Password Now</span>
                <ArrowRight className="w-4 h-4 text-lime" />
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-card text-sm font-bold text-white bg-forest hover:bg-forest-deep transition active:scale-98 disabled:opacity-50"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4 text-lime" />
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
