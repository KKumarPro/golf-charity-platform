"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Charity = {
  id: string;
  name: string;
  description: string;
};

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('*');
      if (data) setCharities(data);
      setLoading(false);
    };
    fetchCharities();
  }, []);

  const filteredCharities = charities.filter(charity => 
    charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    charity.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-emerald-500 tracking-widest uppercase font-bold">Loading Impact Partners...</div>;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Abstract Backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto relative z-50">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          Digital<span className="text-emerald-500">Heroes</span>
        </Link>
        <div className="space-x-6 flex items-center">
          <Link href="/dashboard" className="text-slate-400 hover:text-white font-medium transition-colors text-sm">
            Dashboard
          </Link>
          <Link href="/signup" className="bg-white hover:bg-slate-200 text-slate-900 px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
            Join Now
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Verified Organizations</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Impact Partners</span>
          </h1>
          <p className="text-lg text-slate-400 font-light">
            A minimum of 10% of every subscription goes directly to these verified causes. Find a cause you want to play for.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="max-w-xl mx-auto mb-16 relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <span className="text-emerald-500 text-xl">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search charities or causes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white transition-all placeholder-slate-500"
          />
        </motion.div>

        {/* Charity Grid */}
        {filteredCharities.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-3xl max-w-2xl mx-auto">
            No charities found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharities.map((charity) => (
              <motion.div variants={itemVariants} key={charity.id} className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-xl hover:bg-slate-800/60 transition-colors flex flex-col h-full group">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform border border-emerald-500/20">
                  ❤️
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{charity.name}</h3>
                <p className="text-slate-400 flex-grow leading-relaxed font-light mb-8">
                  {charity.description}
                </p>
                <div className="pt-6 border-t border-slate-800/50">
                  <Link href="/signup" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center gap-2">
                    Support this cause <span>→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
