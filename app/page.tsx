"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export default function Home() {
  // Animation variants for staggered text reveals
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* Premium Navigation */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto relative z-50">
        <div className="text-2xl font-black tracking-tighter text-white">
          Digital<span className="text-emerald-500">Heroes</span> Platform
        </div>
        <div className="space-x-6 flex items-center">
          <Link href="/charities" className="text-slate-400 hover:text-white font-medium transition-colors hidden md:block text-sm tracking-wide">
            Explore Causes
          </Link>
          <Link href="/login" className="text-slate-400 hover:text-white font-medium transition-colors text-sm tracking-wide">
            Sign In
          </Link>
          <Link href="/signup" className="bg-white hover:bg-slate-200 text-slate-900 px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section with Modern Web3/FinTech Aesthetics */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center relative mt-12 mb-24 z-10">
        
        {/* Abstract Glowing Background Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
          className="max-w-4xl relative z-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-semibold text-xs tracking-widest uppercase">The New Standard of Play</span>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
              Your Performance. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Real World Impact.</span>
            </h1>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              Join the exclusive platform that turns your weekend scores into charitable contributions, while giving you the chance to win massive monthly prize pools.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/signup" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transform hover:-translate-y-1">
              Join the Movement
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 px-8 py-4 rounded-full font-bold text-lg transition-all">
              Discover How
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Value Proposition Cards - Scroll Triggered */}
      <section id="how-it-works" className="bg-slate-950 py-32 relative z-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {[
            {
              icon: "🎯",
              title: "Track Your Form",
              desc: "Log your latest 5 Stableford scores. We keep your dashboard clean, minimalist, and focused purely on your current performance.",
              delay: 0
            },
            {
              icon: "🤝",
              title: "Drive Real Change",
              desc: "A dedicated minimum of 10% from your subscription goes directly to a verified charity of your choice every single month.",
              delay: 0.2
            },
            {
              icon: "🏆",
              title: "Win the Jackpot",
              desc: "Match your logged scores with our monthly algorithmic draw. Match 3, 4, or 5 numbers to win your share of the massive prize pool.",
              delay: 0.4
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: feature.delay }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-10 rounded-[2rem] hover:bg-slate-900 transition-colors group"
            >
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 text-3xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                {feature.desc}
              </p>
            </motion.div>
          ))}

        </div>
      </section>

    </div>
  );
}
