"use client";

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SubscribePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else setUser(session.user);
    };
    checkUser();
  }, [router]);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ subscription_status: 'active' }).eq('id', user.id);
    if (!error) {
      alert(`Successfully subscribed to the ${plan} plan! Welcome to Digital Heroes.`);
      router.push('/dashboard');
    } else {
      alert("Error processing subscription.");
      setLoading(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-950 py-24 px-6 font-sans text-slate-300 relative overflow-hidden selection:bg-cyan-500/30">
      
      {/* Deep Space Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <Link href="/dashboard" className="text-slate-400 font-medium mb-8 inline-flex items-center gap-2 hover:text-white transition-colors">
            <span>←</span> Back to Dashboard
          </Link>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Premium</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
            Unlock the ability to log scores, enter the massive monthly draw, and support your favorite charities.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Monthly Plan */}
          <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2rem] shadow-xl border border-slate-800 relative flex flex-col hover:bg-slate-900/80 transition-colors">
            <h3 className="text-2xl font-bold text-white mb-2">Monthly Amateur</h3>
            <div className="flex items-baseline gap-2 mb-8 border-b border-slate-800 pb-8">
              <span className="text-6xl font-black text-white">$10</span>
              <span className="text-slate-500 font-medium tracking-wide">/month</span>
            </div>
            <ul className="space-y-5 mb-10 text-slate-300 flex-grow font-light">
              <li className="flex gap-4 items-center"><span className="text-emerald-500 text-xl">✓</span> Log up to 5 rolling scores</li>
              <li className="flex gap-4 items-center"><span className="text-emerald-500 text-xl">✓</span> Entry into the Monthly Jackpot</li>
              <li className="flex gap-4 items-center"><span className="text-emerald-500 text-xl">✓</span> 10% minimum charity donation</li>
            </ul>
            <button onClick={() => handleSubscribe('monthly')} disabled={loading} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700 shadow-sm">
              {loading ? 'Processing...' : 'Choose Monthly'}
            </button>
          </motion.div>

          {/* Yearly Plan (Highlighted) */}
          <motion.div variants={itemVariants} className="bg-gradient-to-b from-slate-800 to-slate-900 p-10 rounded-[2rem] shadow-2xl relative transform md:-translate-y-4 border border-emerald-500/30 flex flex-col">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Yearly Pro</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-black text-white">$100</span>
              <span className="text-emerald-400/80 font-medium tracking-wide">/year</span>
            </div>
            <p className="text-emerald-400 text-sm font-bold mb-8 border-b border-slate-700/50 pb-8">Save $20 annually!</p>
            <ul className="space-y-5 mb-10 text-slate-200 flex-grow font-light">
              <li className="flex gap-4 items-center"><span className="text-emerald-400 text-xl">✓</span> Log up to 5 rolling scores</li>
              <li className="flex gap-4 items-center"><span className="text-emerald-400 text-xl">✓</span> Entry into the Monthly Jackpot</li>
              <li className="flex gap-4 items-center"><span className="text-emerald-400 text-xl">✓</span> 10% minimum charity donation</li>
              <li className="flex gap-4 items-center"><span className="text-cyan-400 text-xl">✦</span> VIP Premium Badge</li>
            </ul>
            <button onClick={() => handleSubscribe('yearly')} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5">
              {loading ? 'Processing...' : 'Choose Yearly'}
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
