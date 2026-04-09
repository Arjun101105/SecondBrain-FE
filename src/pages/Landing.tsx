import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Link2, Search, Share2, Sparkles, Zap, Globe } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

export function Landing() {
  const navigate = useNavigate();
  const isAuth = !!localStorage.getItem('secondbrain_jwt');

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* ─── Floating Navbar ─────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/20 backdrop-blur-xl">
              <img src="/brain-removebg-preview.png" alt="SecondBrain" className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,112,243,0.6)]" />
            </div>
            <span className="text-lg font-bold tracking-tight">SecondBrain</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuth ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-[#0070F3] text-white rounded-xl text-sm font-semibold hover:bg-[#0070F3]/90 hover:shadow-[0_0_24px_rgba(0,112,243,0.4)] transition-all"
              >
                Dashboard
              </motion.button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 bg-[#0070F3] text-white rounded-xl text-sm font-semibold hover:bg-[#0070F3]/90 hover:shadow-[0_0_24px_rgba(0,112,243,0.4)] transition-all"
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ─── Ambient Orbs ────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#0070F3]/8 blur-[180px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0070F3]/5 blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* ─── Hero Section ────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="initial"
        animate="animate"
        className="relative pt-40 pb-24 px-6 flex flex-col items-center text-center"
      >
        {/* Pill badge */}
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-8 backdrop-blur-sm"
        >
          <Sparkles size={14} className="text-[#0070F3]" />
          Save now, think later
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] max-w-5xl mb-6"
        >
          Your{' '}
          <span className="bg-gradient-to-r from-[#0070F3] via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Second Brain
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10"
        >
          Capture links, notes, and ideas from anywhere. Find them instantly.
          Share your knowledge graph with the world.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 mb-20">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(isAuth ? '/dashboard' : '/login')}
            className="px-8 py-4 bg-[#0070F3] text-white rounded-2xl text-base font-bold hover:shadow-[0_0_40px_rgba(0,112,243,0.4)] transition-all flex items-center gap-2"
          >
            {isAuth ? 'Open Dashboard' : 'Get Started Free'}
            <ArrowRight size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-base font-semibold hover:bg-white/10 transition-all"
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Brain Image — floating with layered glow */}
        <motion.div
          variants={fadeUp}
          className="relative"
        >
          {/* Glow layer 1 — large soft ambient */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-80 sm:w-[420px] h-80 sm:h-[420px] rounded-full bg-[#0070F3]/15 blur-[80px]"
            />
          </div>
          {/* Glow layer 2 — tight core glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-[#0070F3]/20 blur-[50px]"
            />
          </div>
          {/* Glow layer 3 — white hot center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/5 blur-[30px]" />
          </div>
          {/* The brain image itself */}
          <motion.img
            src="/brain-removebg-preview.png"
            alt="Second Brain — Neural Knowledge Graph"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="relative z-10 w-72 sm:w-96 h-auto drop-shadow-[0_0_40px_rgba(0,112,243,0.5)] filter brightness-110"
          />
        </motion.div>
      </motion.section>

      {/* ─── Features Grid ───────────────────────────── */}
      <motion.section
        id="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Everything you need</h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">A single place for every link, note, and idea. Built for speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Link2 size={24} className="text-[#0070F3]" />,
                title: 'Capture Anything',
                desc: 'Paste a YouTube link, tweet, article, or write a note. Everything is saved instantly with smart type detection.',
              },
              {
                icon: <Search size={24} className="text-[#0070F3]" />,
                title: 'Find Instantly',
                desc: 'Full-text search across all your saved content. Filter by type, tags, or collections. Your brain, indexed.',
              },
              {
                icon: <Share2 size={24} className="text-[#0070F3]" />,
                title: 'Share Your Brain',
                desc: 'Generate a shareable link to your entire knowledge graph. Let others explore your curated collection.',
              },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-black/[0.16] backdrop-blur-[160px] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all group"
              >
                <div className="p-3 w-fit rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/20 mb-6 group-hover:shadow-[0_0_20px_rgba(0,112,243,0.2)] transition-all">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── Stats Row ───────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { icon: <Zap size={20} />, value: '< 1s', label: 'Capture Speed' },
            { icon: <Globe size={20} />, value: '8+', label: 'Content Types' },
            { icon: <Sparkles size={20} />, value: '∞', label: 'Storage' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className="text-[#0070F3] mb-2">{s.icon}</div>
              <div className="text-3xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-sm text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer CTA ──────────────────────────────── */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-b from-[#0070F3]/10 to-transparent border border-[#0070F3]/20 rounded-3xl p-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready to build your brain?</h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">Join thousands of knowledge workers who never lose a thought again.</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(isAuth ? '/dashboard' : '/login')}
            className="px-8 py-4 bg-[#0070F3] text-white rounded-2xl text-base font-bold hover:shadow-[0_0_40px_rgba(0,112,243,0.4)] transition-all flex items-center gap-2 mx-auto"
          >
            Get Started Free <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────── */}
      <footer className="px-6 py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-zinc-600">
          <span>© 2026 SecondBrain</span>
          <div className="flex items-center gap-2">
            <img src="/brain-removebg-preview.png" alt="" className="w-4 h-4 drop-shadow-[0_0_4px_rgba(0,112,243,0.5)]" />
            <span>Built with ❤️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
