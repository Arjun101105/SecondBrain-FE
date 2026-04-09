import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/client';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const signinMutation = useMutation({
    mutationFn: authApi.signin,
    onSuccess: (res) => {
      localStorage.setItem('secondbrain_jwt', res.data.token);
      navigate('/dashboard');
    },
    onError: (err: Error) => { setError(err.message); },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (res) => {
      localStorage.setItem('secondbrain_jwt', res.data.token);
      navigate('/dashboard');
    },
    onError: (err: Error) => { setError(err.message); },
  });

  const isPending = signinMutation.isPending || signupMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      signinMutation.mutate({ username, password });
    } else {
      signupMutation.mutate({ username, password, email: email || undefined });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-zinc-950">
      {/* ─── Left Pane: Crystalline Brain Showcase ──── */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center overflow-hidden bg-zinc-950">
        {/* Deep radial gradient glow — emanates from brain center */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,112,243,0.15) 0%, rgba(0,112,243,0.05) 40%, transparent 70%)' }}
          />
          {/* Secondary softer purple halo for depth */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(120,80,255,0.06) 0%, transparent 60%)' }}
          />
        </div>

        {/* Floating brain with crystalline depth */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          {/* Crystalline container — backdrop-blur creates depth illusion */}
          <div className="relative mb-10">
            {/* Pulsing glow ring behind brain */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-72 h-72 rounded-full bg-[#0070F3]/10 blur-[60px]" />
            </motion.div>

            {/* The brain itself — slow luxurious float */}
            <motion.div
              className="relative backdrop-blur-xl rounded-full"
            >
              <motion.img
                src="/brain-removebg-preview.png"
                alt="Second Brain — Neural Knowledge Graph"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -20, 0],
                }}
                transition={{
                  opacity: { duration: 0.8, ease: 'easeOut' },
                  scale: { duration: 0.8, ease: 'easeOut' },
                  y: { duration: 8, ease: 'easeInOut', repeat: Infinity },
                }}
                className="w-64 h-auto drop-shadow-[0_0_50px_rgba(0,112,243,0.4)] filter brightness-110"
              />
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-semibold text-white mb-4 tracking-tight"
          >
            Your thoughts, structured.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-zinc-500 leading-relaxed max-w-md"
          >
            Second Brain aggregates your links, notes, and media — transforming digital chaos into your private knowledge graph.
          </motion.p>
        </div>

        {/* Subtle dot-grid overlay for texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* ─── Right Pane: Auth Form ────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center relative p-6 sm:p-8">
        {/* Subtle radial glow bleed-through */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,112,243,0.06) 0%, transparent 70%)' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-md bg-zinc-900/80 backdrop-blur-[160px] border border-white/10 shadow-2xl rounded-3xl p-8 relative overflow-hidden isolate z-10"
        >
          {/* Mobile-only brain logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="p-1.5 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/20">
              <img src="/brain-removebg-preview.png" alt="SecondBrain" className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,112,243,0.6)]" />
            </div>
            <span className="text-lg font-bold tracking-tight">SecondBrain</span>
          </div>

          <div className="mb-8 pt-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-sm font-medium text-zinc-400">
              {isLogin ? 'Sign in to access your brain.' : 'Start capturing your thoughts today.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#0070F3] focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(0,112,243,0.1)] transition-all font-medium"
              />
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2 overflow-hidden"
                >
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#0070F3] focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(0,112,243,0.1)] transition-all font-medium"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#0070F3] focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(0,112,243,0.1)] transition-all font-medium"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isPending}
              whileTap={{ scale: 0.95 }}
              className="w-full h-12 mt-4 bg-[#0070F3] hover:bg-[#0070F3]/90 hover:shadow-[0_0_24px_rgba(0,112,243,0.4)] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center pb-2">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
