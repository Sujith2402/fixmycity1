import { useState, useEffect } from 'react';
import { mockNotifications } from '@/data/mockData';
import { CATEGORIES, Issue } from '@/types';
import { issueService } from '@/services/issueService';
import {
  Bell,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Activity,
  ArrowUpRight,
  Shield,
  Layers,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import IssueCard from '@/components/IssueCard';

export default function HomePage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = issueService.subscribeToAllIssues((data) => {
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date((a.createdAt as any)?.toDate?.() || a.createdAt).getTime();
        const dateB = new Date((b.createdAt as any)?.toDate?.() || b.createdAt).getTime();
        return dateB - dateA;
      });
      setIssues(sorted);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    { label: 'Total Influx', value: issues.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Progress', value: issues.filter(i => i.status === 'in-progress').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'City Resolved', value: issues.filter(i => i.status === 'resolved').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Urgent Alerts', value: issues.filter(i => i.priority === 'high').length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const unreadCount = mockNotifications.filter(n => !n.read).length;
  const recentIssues = issues.slice(0, 4);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Connecting to Urban Pulse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Premium Hero Section */}
      <div className="relative group overflow-hidden rounded-[3rem] bg-[#0F172A] p-10 md:p-14 text-white shadow-2xl shadow-blue-900/10">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-20 -mt-20 blur-[100px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 border border-white/10 mb-6 backdrop-blur-md">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 leading-none">
                {user?.role === 'admin' ? 'Official Authority Node' : 'Official Citizen Node'} • Active Session
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
              Shape Your City's <span className="text-primary italic">Future</span>
            </h1>
            <p className="text-slate-400 text-lg font-bold leading-relaxed mb-8 max-w-md">
              {user?.role === 'admin'
                ? 'Your central hub for city-wide governance. Track resolutions, manage officer assignments, and build a smarter community.'
                : 'Your direct line to local governance. Report issues, track resolutions, and help build a smarter community.'}
            </p>
            <div className="flex flex-wrap gap-4">
              {user?.role !== 'admin' && (
                <Link to="/report" className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 shadow-lg shadow-primary/20">
                  <PlusCircle className="w-5 h-5" />
                  Submit New Report
                </Link>
              )}
              <Link to={user?.role === 'admin' ? '/admin' : '/issues'} className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black transition-all border border-white/10">
                {user?.role === 'admin' ? 'Command Center' : 'Live Registry'}
              </Link>
            </div>
          </div>

          {/* Quick Stats Mini-Visual */}
          <div className="hidden lg:block relative w-64 h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-black text-white">{issues.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Pulse</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* KPI Section Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
            <Activity className="w-5 h-5 text-primary" />
            Live Network Stats
          </h2>
          <div className="h-0.5 flex-1 bg-slate-100 mx-6 rounded-full" />
        </div>

        {/* Stats Grid Refined */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
              <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-[0.15em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Categories Refined */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black text-slate-900">Domains</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {CATEGORIES.map(cat => {
                const count = issues.filter(i => i.category === cat.label).length;
                return (
                  <Link
                    key={cat.label}
                    to={`/issues?category=${encodeURIComponent(cat.label)}`}
                    className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/50 group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl block group-hover:scale-110 transition-transform bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl border border-slate-100">
                        {cat.label === 'Roads & Infrastructure' ? '🚧' :
                          cat.label === 'Garbage & Sanitation' ? '🗑️' :
                            cat.label === 'Water Supply' ? '💧' :
                              cat.label === 'Electricity' ? '⚡' :
                                cat.label === 'Street Lights' ? '💡' :
                                  cat.label === 'Public Safety' ? '🛡️' :
                                    cat.label === 'Traffic Issues' ? '🚦' : '📌'}
                      </span>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none mb-1">{cat.label.split(' & ')[0]}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{count} Submissions</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Issues Refined */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Recent Activity Log</h2>
              <Link to="/issues" className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-2">
                Full Registry <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {recentIssues.map((issue, i) => (
                <IssueCard key={issue.id} issue={issue} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
