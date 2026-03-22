"use client";

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// --- STRICT TYPESCRIPT DEFINITIONS ---
type Score = { id: string; score: number; played_date: string; };
type Charity = { id: string; name: string; };
type Profile = { charity_id: string | null; charity_contribution_pct: number | null; subscription_status: string | null; };
type Winning = { id: string; match_type: string | number; prize_amount: number; status: string; proof_url: string | null; draws: { month_year: string | null } | null; };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [newScore, setNewScore] = useState('');
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState('');
  const [contribution, setContribution] = useState(10);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // --- DATA FETCHING ---
  async function fetchScores(userId: string) {
    const { data } = await supabase.from('scores').select('id, score, played_date').eq('user_id', userId).order('played_date', { ascending: false }).limit(5);
    setScores((data ?? []) as Score[]);
  }
  async function fetchCharities() {
    const { data } = await supabase.from('charities').select('id, name');
    setCharities((data ?? []) as Charity[]);
  }
  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('charity_id, charity_contribution_pct, subscription_status').eq('id', userId).single();
    if (data) {
      const p = data as Profile;
      setProfile(p);
      if (p.charity_id) setSelectedCharity(p.charity_id);
      if (p.charity_contribution_pct != null) setContribution(p.charity_contribution_pct);
    }
  }
  async function fetchWinnings(userId: string) {
    const { data } = await supabase.from('winnings').select('id, match_type, prize_amount, status, proof_url, draws(month_year)').eq('user_id', userId).order('created_at', { ascending: false });
    setWinnings((data ?? []) as unknown as Winning[]);
  }

  useEffect(() => {
    let isMounted = true;
    const getUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (isMounted) { router.push('/login'); setLoading(false); } return; }
      if (isMounted) setUser(session.user);
      await Promise.all([ fetchScores(session.user.id), fetchCharities(), fetchProfile(session.user.id), fetchWinnings(session.user.id) ]);
      if (isMounted) setLoading(false);
    };
    getUserAndData();
    return () => { isMounted = false; };
  }, [router]);

  // --- ACTIONS ---
  const handleScoreSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const scoreNum = Number.parseInt(newScore, 10);
    if (scoreNum < 1 || scoreNum > 45) return alert("Score must be between 1 and 45");

    await supabase.from('scores').insert([{ user_id: user.id, score: scoreNum, played_date: new Date().toISOString().split('T')[0] }]);
    const { data: allScores } = await supabase.from('scores').select('id').eq('user_id', user.id).order('played_date', { ascending: false });

    if (allScores && allScores.length > 5) {
      const scoresToDelete = allScores.slice(5).map(s => s.id);
      await supabase.from('scores').delete().in('id', scoresToDelete);
    }
    setNewScore('');
    fetchScores(user.id); 
  };

  const handleCharityUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCharity) return;
    if (contribution < 10) return alert("Minimum contribution is 10%");
    const { error } = await supabase.from('profiles').update({ charity_id: selectedCharity, charity_contribution_pct: contribution }).eq('id', user.id);
    if (!error) alert("Charity preferences updated successfully!");
  };

  const handleProofUpload = async (winningId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${winningId}.${fileExt ?? 'jpg'}`;
    const { error: uploadError } = await supabase.storage.from('proofs').upload(fileName, file);
    if (uploadError) { alert("Upload failed."); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName);
    await supabase.from('winnings').update({ proof_url: publicUrl, status: 'pending' }).eq('id', winningId);
    alert("Proof submitted successfully! Awaiting Admin review.");
    fetchWinnings(user.id);
    setUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-emerald-500 font-bold tracking-widest uppercase">Initializing Workspace...</div>;

  // Animation Variants
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-300 selection:bg-emerald-500/30">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* PREMIUM HEADER */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Player Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome back, <span className="text-emerald-400">{user?.email}</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <Link href="/charities" className="text-slate-400 hover:text-white transition-colors">Causes</Link>
            {user?.email === 'admin@digitalheroes.com' && (
              <Link href="/admin" className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 shadow-sm flex items-center gap-2">
                ⚙️ Command Center
              </Link>
            )}
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors ml-2">Log Out</button>
          </div>
        </motion.header>

        {/* WINNINGS OVERVIEW CARD (Modernized) */}
        {winnings.length > 0 && (
          <motion.div variants={itemVariants} className="relative overflow-hidden bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-1">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-[22px] p-8 z-10 relative">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">✨</span>
                Your Impact Rewards
              </h2>
              <div className="space-y-4">
                {winnings.map((win) => (
                  <div key={win.id} className="group bg-slate-800/50 hover:bg-slate-800 transition-colors p-5 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">{win.draws?.month_year || 'Monthly Draw'} • {win.match_type} Number Match</p>
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-black text-3xl">${win.prize_amount}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border ${ win.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : win.status === 'verified' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20' }`}>
                        {win.status}
                      </span>
                      {win.status === 'pending' && !win.proof_url && (
                        <label className="bg-white hover:bg-slate-200 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-transform transform active:scale-95 shadow-lg">
                          {uploading ? 'Uploading...' : 'Submit Proof'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProofUpload(win.id, e)} disabled={uploading} />
                        </label>
                      )}
                      {win.proof_url && win.status === 'pending' && (
                        <span className="text-sm text-slate-400 italic flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>Under Review</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* MAIN DASHBOARD CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* PAYWALL */}
          {profile?.subscription_status !== 'active' ? (
            <motion.div variants={itemVariants} className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-3xl shadow-2xl text-center border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="text-5xl mb-6 relative z-10">🔒</div>
              <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Premium Access Required</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg relative z-10">
                You must have an active subscription to log scores, enter the monthly draw, and select your charity impact.
              </p>
              <button onClick={() => router.push('/subscribe')} className="relative z-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-10 rounded-full transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5">
                Upgrade to Premium
              </button>
            </motion.div>
          ) : (
            <>
              {/* SCORE ENTRY */}
              <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6">Log New Score</h2>
                <form onSubmit={handleScoreSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Stableford Score (1-45)</label>
                    <input type="number" min="1" max="45" required value={newScore} onChange={(e) => setNewScore(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. 36" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] transform hover:-translate-y-0.5">Submit Score</button>
                </form>
              </motion.div>

              {/* RECENT SCORES */}
              <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6">Recent Form</h2>
                {scores.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl">
                    <p className="text-slate-500 italic text-sm">No scores logged yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {scores.map((score) => (
                      <li key={score.id} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                        <span className="text-slate-400 text-sm font-medium">{score.played_date}</span>
                        <span className="font-bold text-white bg-slate-800 px-4 py-1.5 rounded-lg shadow-sm border border-slate-700">{score.score} pts</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* CHARITY IMPACT */}
              <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-xl md:col-span-2">
                <h2 className="text-xl font-bold text-white mb-6">Your Charity Impact</h2>
                <form onSubmit={handleCharityUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Select Cause</label>
                    <select required value={selectedCharity} onChange={(e) => setSelectedCharity(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                      <option value="" disabled className="text-slate-500">Choose a charity...</option>
                      {charities.map((charity) => <option key={charity.id} value={charity.id}>{charity.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Contribution % (Min 10%)</label>
                    <input type="number" min="10" max="100" required value={contribution} onChange={(e) => setContribution(Number.parseInt(e.target.value, 10))} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm border border-slate-600">Update Impact</button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}