"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// --- STRICT TYPESCRIPT DEFINITIONS ---
type AdminProfile = {
  id: string;
  email: string | null;
  created_at: string;
  charity_contribution_pct: number | null;
  subscription_status: string | null;
  charities: { name: string; } | null;
  scores: { score: number; }[]; 
};

type AdminWinning = {
  id: string;
  match_type: string | number;
  prize_amount: number;
  proof_url: string | null;
  status: 'pending' | 'verified' | 'paid' | string;
  profiles: { email: string | null }[] | null;
  draws: { month_year: string | null }[] | null;
};

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [totalScoresCount, setTotalScoresCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Draw Engine State
  const [drawNumbers, setDrawNumbers] = useState<number[]>([]);
  const [winners, setWinners] = useState({ match5: 0, match4: 0, match3: 0 });
  const [prizePool, setPrizePool] = useState(0);

  // Winners Management State
  const [winningsList, setWinningsList] = useState<AdminWinning[]>([]);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'admin@digitalheroes.com') {
        router.push('/dashboard');
        return;
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select(`id, email, created_at, charity_contribution_pct, subscription_status, charities ( name ), scores ( score )`);

      const { count } = await supabase.from('scores').select('*', { count: 'exact', head: true });

      const { data: winningsData } = await supabase
        .from('winnings')
        .select('*, profiles(email), draws(month_year)')
        .order('created_at', { ascending: false });

      if (!isMounted) return;
      
      const loadedProfiles = (profilesData ?? []) as unknown as AdminProfile[];
      setProfiles(loadedProfiles);
      setTotalScoresCount(count ?? 0);
      if (winningsData) setWinningsList(winningsData as AdminWinning[]);
      
      setPrizePool(loadedProfiles.length * 10); 
      setLoading(false);
    }

    loadAdminData();
    return () => { isMounted = false; };
  }, [router]);

  // --- LOGIC FUNCTIONS (Unchanged) ---
  const runSimulation = (mode: 'random' | 'algorithmic') => {
    let nums: number[] = [];
    if (mode === 'random') {
      while(nums.length < 5) {
        const r = Math.floor(Math.random() * 45) + 1;
        if(nums.indexOf(r) === -1) nums.push(r);
      }
    } else {
      const scoreFrequency: Record<number, number> = {};
      profiles.forEach(p => p.scores.forEach(s => scoreFrequency[s.score] = (scoreFrequency[s.score] || 0) + 1));
      const sortedScores = Object.entries(scoreFrequency).sort((a, b) => b[1] - a[1]).map(entry => parseInt(entry[0]));
      nums = sortedScores.slice(0, 5);
      while(nums.length < 5) {
        const r = Math.floor(Math.random() * 45) + 1;
        if(nums.indexOf(r) === -1) nums.push(r);
      }
    }
    setDrawNumbers(nums);
    calculateWinners(nums);
  };

  const calculateWinners = (nums: number[]) => {
    let m5 = 0, m4 = 0, m3 = 0;
    profiles.forEach(profile => {
      const userScoreValues = profile.scores.map(s => s.score);
      let matches = 0;
      userScoreValues.forEach(val => { if (nums.includes(val)) matches++; });
      if (matches === 5) m5++;
      else if (matches === 4) m4++;
      else if (matches === 3) m3++;
    });
    setWinners({ match5: m5, match4: m4, match3: m3 });
  };

  const publishResults = async () => {
    if (drawNumbers.length !== 5) return;
    const isRollover = winners.match5 === 0;
    const { error: drawError } = await supabase.from('draws').insert([{ 
      month_year: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      winning_numbers: drawNumbers, total_pool: prizePool, jackpot_rolled_over: isRollover
    }]);
    if (drawError) return alert("Error publishing draw!");
    alert(`Draw Published Successfully! ${isRollover ? 'Jackpot rolled over to next month!' : ''}`);
  };

  const verifyProof = async (winningId: string) => {
    await supabase.from('winnings').update({ status: 'verified' }).eq('id', winningId);
    setWinningsList(winningsList.map(w => w.id === winningId ? { ...w, status: 'verified' } : w));
  };

  const markAsPaid = async (winningId: string) => {
    await supabase.from('winnings').update({ status: 'paid' }).eq('id', winningId);
    setWinningsList(winningsList.map(w => w.id === winningId ? { ...w, status: 'paid' } : w));
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-purple-500 font-bold tracking-widest uppercase">Initializing Command Center...</div>;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-300 selection:bg-purple-500/30">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-purple-500">⚡</span> Admin Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage platform operations and verify winners.</p>
          </div>
          <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition-colors text-sm font-medium border border-slate-700 shadow-sm">
            Exit to Player View
          </Link>
        </motion.header>

        {/* HIGH LEVEL ANALYTICS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-800 border-l-4 border-l-blue-500 shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Registered Users</h3>
            <p className="text-4xl font-black text-white mt-2">{profiles.length}</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-800 border-l-4 border-l-emerald-500 shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Scores Logged</h3>
            <p className="text-4xl font-black text-white mt-2">{totalScoresCount}</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-800 border-l-4 border-l-purple-500 shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Platform Status</h3>
            <p className="text-xl font-bold text-emerald-400 mt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span> Active & Live
            </p>
          </div>
        </motion.div>

        {/* DRAW SIMULATION ENGINE */}
        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Draw Simulation Engine</h2>
              <p className="text-slate-400 mt-1">Estimated Monthly Prize Pool: <span className="font-bold text-emerald-400 text-lg">${prizePool}</span></p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button onClick={() => runSimulation('random')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-5 rounded-xl transition-all text-sm border border-slate-700">
                Random Draw
              </button>
              <button onClick={() => runSimulation('algorithmic')} className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold py-2.5 px-5 rounded-xl transition-all text-sm border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                Algorithmic Draw
              </button>
              {drawNumbers.length === 5 && (
                <button onClick={publishResults} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] ml-2">
                  Publish Official Results
                </button>
              )}
            </div>
          </div>

          {drawNumbers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 relative z-10">
              {/* Winning Numbers */}
              <div className="flex flex-wrap justify-center gap-4 py-8 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                {drawNumbers.map((num, i) => (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 text-white flex items-center justify-center text-3xl font-black shadow-xl">
                    {num}
                  </motion.div>
                ))}
              </div>

              {/* Prize Split Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-center">
                  <h4 className="text-yellow-500 font-bold mb-2 uppercase tracking-wide text-sm">5-Number Match (Jackpot)</h4>
                  <p className="text-4xl font-black text-yellow-400 mb-2">{winners.match5} <span className="text-sm font-medium text-yellow-600/50">Winners</span></p>
                  <p className="text-sm text-yellow-600 font-medium">Pool: 40% (${(prizePool * 0.40).toFixed(2)})</p>
                </div>
                <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
                  <h4 className="text-slate-300 font-bold mb-2 uppercase tracking-wide text-sm">4-Number Match</h4>
                  <p className="text-4xl font-black text-white mb-2">{winners.match4} <span className="text-sm font-medium text-slate-500">Winners</span></p>
                  <p className="text-sm text-slate-400 font-medium">Pool: 35% (${(prizePool * 0.35).toFixed(2)})</p>
                </div>
                <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl text-center">
                  <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-wide text-sm">3-Number Match</h4>
                  <p className="text-4xl font-black text-orange-400 mb-2">{winners.match3} <span className="text-sm font-medium text-orange-600/50">Winners</span></p>
                  <p className="text-sm text-orange-600 font-medium">Pool: 25% (${(prizePool * 0.25).toFixed(2)})</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* WINNER VERIFICATION TABLE */}
        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-yellow-500/5 flex items-center gap-3">
            <span className="text-yellow-500 text-xl">🏆</span>
            <h2 className="text-lg font-bold text-yellow-500">Winners Management & Verification</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-5 font-semibold border-b border-slate-800">User Email</th>
                  <th className="p-5 font-semibold border-b border-slate-800">Draw / Match</th>
                  <th className="p-5 font-semibold border-b border-slate-800">Prize</th>
                  <th className="p-5 font-semibold border-b border-slate-800">Proof Link</th>
                  <th className="p-5 font-semibold border-b border-slate-800">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {winningsList.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 italic">No pending payouts or winners found.</td></tr>
                ) : (
                  winningsList.map((win) => (
                    <tr key={win.id} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/50">
                      <td className="p-5 font-medium text-white">{win.profiles?.[0]?.email ?? 'Unknown user'}</td>
                      <td className="p-5 text-slate-400">{win.draws?.[0]?.month_year ?? 'Monthly Draw'} ({win.match_type} Match)</td>
                      <td className="p-5 text-emerald-400 font-bold text-base">${win.prize_amount}</td>
                      <td className="p-5">
                        {win.proof_url ? (
                          <a href={win.proof_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">View Image ↗</a>
                        ) : (
                          <span className="text-slate-600 italic">Awaiting upload</span>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                            win.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            win.status === 'verified' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {win.status}
                          </span>
                          
                          {win.status === 'pending' && win.proof_url && (
                            <button onClick={() => verifyProof(win.id)} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600">Approve</button>
                          )}
                          {win.status === 'verified' && (
                            <button onClick={() => markAsPaid(win.id)} className="text-xs bg-emerald-600/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-600/40 transition-colors border border-emerald-500/30">Mark Paid</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* USER MANAGEMENT TABLE */}
        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Registered Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-5 font-semibold border-b border-slate-800">Email</th>
                  <th className="p-5 font-semibold border-b border-slate-800">Joined Date</th>
                  <th className="p-5 font-semibold border-b border-slate-800">Supported Cause</th>
                  <th className="p-5 font-semibold border-b border-slate-800">Engagement</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/50">
                    <td className="p-5 font-medium text-white">{profile.email}</td>
                    <td className="p-5 text-slate-400">{new Date(profile.created_at).toLocaleDateString()}</td>
                    <td className="p-5 text-slate-300">
                        {profile.charities?.name || <span className="text-slate-600 italic">Pending selection</span>}
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700">
                        {profile.scores.length} / 5 Scores
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
