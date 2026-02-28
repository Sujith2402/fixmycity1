import { mockUsers, mockOfficers } from '@/data/mockData';
import { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, IssueStatus, STATUS_LABELS, Issue } from '@/types';
import { issueService } from '@/services/issueService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronRight,
  Activity,
  FileText,
  AlertTriangle,
  Activity as Pulse,
  Search,
  Filter,
  Map as MapIcon,
  List as ListIcon,
  MoreVertical,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Users,
  X,
  MapPin,
  Calendar,
  User,
  History,
  MessageSquare,
  ArrowUpRight,
  ShieldAlert,
  Save,
  Trash2,
  ArrowRight,
  Shield,
  Layers,
  Copy,
  Flag,
  Share2,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

// Constants for UI
const statusChartColors: Record<string, string> = {
  reported: '#F59E0B',
  acknowledged: '#6366F1',
  verified: '#3B82F6',
  'in-progress': '#F97316',
  resolved: '#22C55E',
  rejected: '#EF4444',
  escalated: '#8B5CF6',
};

export default function AdminDashboard() {
  const { user: authUser } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'analytics' | 'inbound-signals'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = issueService.subscribeToAllIssues((data) => {
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date((a.createdAt as any)?.toDate?.() || a.createdAt).getTime();
        const dateB = new Date((b.createdAt as any)?.toDate?.() || b.createdAt).getTime();
        return dateB - dateA;
      });
      setIssues(sorted);
      setLoading(false);
    }, (error) => {
      console.error("AdminDashboard Subscription Error:", error);
      setLoading(false);
      toast.error("Critical: Real-time Command Link severed. Please refresh.");
    });
    return () => unsubscribe();
  }, []);

  // Filtering Logic
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [issues, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const handleBulkAction = (action: string) => {
    toast.success(`Bulk Op: ${action} initiated for ${selectedBulkIds.length} nodes`);
    setSelectedBulkIds([]);
  };

  const selectedIssue = useMemo(() =>
    issues.find(i => i.id === selectedIssueId),
    [issues, selectedIssueId]
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20 relative">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Command Center</h1>
          <div className="flex items-center gap-4">
            <p className="text-slate-500 font-bold uppercase tracking-[0.15em] text-[10px] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              Node: FMC-AUTH-01 • Secure Connection Active
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            {[
              { id: 'analytics', label: 'Command Overview', icon: BarChart3 },
              { id: 'inbound-signals', label: 'Signal Registry', icon: Activity },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${view === tab.id
                  ? 'bg-white text-slate-900 shadow-md transform scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            to="/map"
            className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:scale-[1.02]"
          >
            <MapIcon className="w-4 h-4 text-teal-400" />
            Control Map
          </Link>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-10"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Overdue Complaints',
                  value: issues.filter(i => i.slaDeadline && new Date(i.slaDeadline) < new Date() && i.status !== 'resolved').length,
                  sub: 'Requires immediate action',
                  icon: AlertTriangle,
                  color: 'text-red-600',
                  bg: 'bg-red-50'
                },
                {
                  label: 'Nearing Deadline',
                  value: issues.filter(i => {
                    if (!i.slaDeadline || i.status === 'resolved') return false;
                    const diff = new Date((i.slaDeadline as any)?.toDate?.() || i.slaDeadline).getTime() - Date.now();
                    return diff > 0 && diff < 86400000; // within 24 hours
                  }).length,
                  sub: 'Within 24 hours',
                  icon: Clock,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50'
                },
                {
                  label: 'Avg. Resolution Time',
                  value: '4.2d',
                  sub: '-18% from last week',
                  icon: TrendingUp,
                  color: 'text-teal-600',
                  bg: 'bg-teal-50'
                },
                {
                  label: 'Operational Capacity',
                  value: '92%',
                  sub: 'Officer availability',
                  icon: Users,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50'
                },
              ].map((kpi, i) => (
                <div key={kpi.label} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full translate-x-8 -translate-y-8 group-hover:bg-slate-100 transition-colors" />
                  <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} w-fit mb-4 relative z-10`}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mb-1 relative z-10">{kpi.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{kpi.label}</p>
                  <div className="mt-4 flex items-center gap-1.5 relative z-10">
                    <TrendingUp className={`w-3 h-3 ${kpi.color}`} />
                    <span className="text-[10px] font-black text-slate-500 uppercase">{kpi.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Domain Performance */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">Domain Efficiency</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resolution progress by sector</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {CATEGORIES.slice(0, 6).map((cat, i) => {
                    const total = issues.filter(iss => iss.category === cat.label).length;
                    const resolved = issues.filter(iss => iss.category === cat.label && iss.status === 'resolved').length;
                    const percentage = total > 0 ? (resolved / total) * 100 : 0;
                    return (
                      <div key={cat.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{cat.label.split(' & ')[0]}</span>
                          <span className="text-xs font-black text-slate-900">{resolved}/{total}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full bg-primary rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Mix Chart */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">State Distribution</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Incident processing pipeline</p>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(STATUS_LABELS).map(([key, label]) => ({
                          name: label,
                          value: issues.filter(i => i.status === key).length,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.keys(statusChartColors).map((key, index) => (
                          <Cell key={`cell-${index}`} fill={statusChartColors[key]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="w-2 h-2 rounded-full" style={{ background: statusChartColors[key] }} />
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        {label} ({issues.filter(i => i.status === key).length})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'inbound-signals' && (
          <motion.div
            key="monitoring"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Advanced Filters */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search by ID, Description or Official Title..."
                    className="h-14 pl-12 bg-slate-50 border-slate-100 rounded-2xl font-bold placeholder:text-slate-300 focus:ring-primary/10 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] h-14 bg-white border-slate-200 rounded-2xl font-bold text-xs uppercase tracking-widest">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px] h-14 bg-white border-slate-200 rounded-2xl font-bold text-xs uppercase tracking-widest text-left">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl max-h-[300px]">
                      <SelectItem value="all">All Domains</SelectItem>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.label} value={cat.label}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px] h-14 bg-white border-slate-200 rounded-2xl font-bold text-xs uppercase tracking-widest">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setPriorityFilter('all'); }} className="h-14 w-14 rounded-2xl border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Pulse className="w-5 h-5 rotate-45" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Actions Toolbar */}
            <AnimatePresence>
              {selectedBulkIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="bg-slate-900 rounded-3xl p-6 text-white flex items-center justify-between shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      {selectedBulkIds.length} Signals Captured
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleBulkAction('Verify')} variant="default" className="bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase tracking-widest h-11 px-6 rounded-xl">Bulk Verify</Button>
                      <Button onClick={() => handleBulkAction('Resolve')} variant="default" className="bg-green-600 hover:bg-green-700 text-[10px] font-black uppercase tracking-widest h-11 px-6 rounded-xl">Mark Resolved</Button>
                      <Button onClick={() => handleBulkAction('Escalate')} variant="default" className="bg-amber-600 hover:bg-amber-700 text-[10px] font-black uppercase tracking-widest h-11 px-6 rounded-xl">Escalate</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedBulkIds([])} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Clear Selection</button>
                    <Button onClick={() => handleBulkAction('Delete')} variant="destructive" className="h-11 w-11 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Issue List Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedBulkIds.length === filteredIssues.length && filteredIssues.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedBulkIds(filteredIssues.map(i => i.id));
                      else setSelectedBulkIds([]);
                    }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400"> Incident Registry ({filteredIssues.length}) </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-10 py-5 w-10"></th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Node ID</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Incident Details</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">SLA / Assignment</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredIssues.map((issue) => (
                      <tr
                        key={issue.id}
                        className={`transition-colors group cursor-pointer ${selectedBulkIds.includes(issue.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
                      >
                        <td className="px-10 py-6" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedBulkIds.includes(issue.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedBulkIds([...selectedBulkIds, issue.id]);
                              else setSelectedBulkIds(selectedBulkIds.filter(id => id !== issue.id));
                            }}
                          />
                        </td>
                        <td className="px-6 py-6" onClick={() => setSelectedIssueId(issue.id)}>
                          <code className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
                            {issue.id}
                          </code>
                        </td>
                        <td className="px-6 py-6 max-w-md" onClick={() => setSelectedIssueId(issue.id)}>
                          <p className="text-sm font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{issue.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{issue.category.split(' & ')[0]}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-400">{new Date((issue.createdAt as any)?.toDate?.() || issue.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center" onClick={() => setSelectedIssueId(issue.id)}>
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-sm"
                            style={{ backgroundColor: `${statusChartColors[issue.status]}15`, color: statusChartColors[issue.status], borderColor: `${statusChartColors[issue.status]}30` }}
                          >
                            {STATUS_LABELS[issue.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-6 text-center" onClick={() => setSelectedIssueId(issue.id)}>
                          <div className="flex flex-col items-center gap-2">
                            {issue.slaDeadline && issue.status !== 'resolved' ? (
                              <div className="flex items-center gap-1.5">
                                {new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline) < new Date() ? (
                                  <Badge variant="destructive" className="bg-red-500 text-white rounded-lg px-2 py-0.5 text-[8px] font-black animate-pulse">OVERDUE</Badge>
                                ) : (
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[9px] font-black italic">
                                      {Math.round((new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline).getTime() - Date.now()) / 3600000)}h left
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : null}
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${issue.priority === 'high' ? 'bg-red-500' :
                                issue.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                }`} />
                              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                                {issue.assignedOfficerId ? mockOfficers.find(o => o.id === issue.assignedOfficerId)?.name.split(' ')[1] : 'Unassigned'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 overflow-hidden">
                            <Button onClick={(e) => { e.stopPropagation(); toast.info('Flagging incident for sensitive review'); }} variant="ghost" className="h-9 w-9 p-0 rounded-lg text-slate-300 hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Flag className="w-4 h-4" />
                            </Button>
                            <Button onClick={(e) => { e.stopPropagation(); toast.info('Node reference copied to clipboard'); }} variant="ghost" className="h-9 w-9 p-0 rounded-lg text-slate-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => setSelectedIssueId(issue.id)} variant="ghost" className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100">
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredIssues.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-10 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-40">
                            <Search className="w-12 h-12 text-slate-300" />
                            <p className="text-sm font-black uppercase tracking-widest text-slate-400">No signals matching filter parameters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Management Panel */}
      <AnimatePresence>
        {selectedIssue && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIssueId(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
            />

            {/* Slide Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[680px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-50 overflow-y-auto"
            >
              <IssueDetailsPanel
                issue={selectedIssue}
                onClose={() => setSelectedIssueId(null)}
                authUser={authUser}
                mockUsers={mockUsers}
                mockOfficers={mockOfficers}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function IssueDetailsPanel({ issue, onClose, authUser, mockUsers, mockOfficers }: { issue: Issue; onClose: () => void; authUser: any; mockUsers: any[]; mockOfficers: any[] }) {
  const reporter = mockUsers.find(u => u.id === issue.reportedBy);
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [assignedDept, setAssignedDept] = useState(issue.assignedDepartment || '');
  const [assignedOfficer, setAssignedOfficer] = useState(issue.assignedOfficerId || '');
  const [deadline, setDeadline] = useState(issue.slaDeadline ? new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline).toISOString().split('T')[0] : '');

  const filteredOfficers = mockOfficers.filter(o => !assignedDept || o.department === assignedDept || assignedDept === 'Others');

  const handleUpdateStatus = async (newStatus: IssueStatus, deadlineStr?: string) => {
    setIsUpdating(true);
    try {
      const additionalData: Partial<Issue> = {
        assignedOfficerId: assignedOfficer || undefined,
        assignedDepartment: assignedDept || undefined
      };
      if (deadlineStr) {
        // If deadlineStr is a date string (YYYY-MM-DD), use it directly
        // If it's a number of days, calculate the date
        let deadlineDate: Date;
        if (!isNaN(Number(deadlineStr.split(' ')[0]))) { // Check if it starts with a number (e.g., '3 Days')
          const days = parseInt(deadlineStr.split(' ')[0]);
          deadlineDate = new Date();
          deadlineDate.setDate(deadlineDate.getDate() + days);
        } else { // Assume it's a YYYY-MM-DD date string
          deadlineDate = new Date(deadlineStr);
        }
        additionalData.slaDeadline = deadlineDate.toISOString();
      }

      await issueService.updateIssueStatus(
        issue.id,
        newStatus,
        authUser?.name || 'Admin',
        `Incident transitioned to ${STATUS_LABELS[newStatus]}${deadlineStr ? ` with ${deadlineStr} SLA` : ''}`,
        additionalData
      );
      toast.success(`Priority Node ${issue.id} transitioned to ${STATUS_LABELS[newStatus]}`);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEscalate = () => {
    toast.info('Initiating official escalation protocol...');
    setTimeout(() => {
      window.open('https://www.pgportal.gov.in/', '_blank');
      handleUpdateStatus('escalated');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-7 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-5">
          <Badge variant="secondary" className="text-[10px] font-black bg-slate-900 text-white px-4 py-2 rounded-xl">
            {issue.id}
          </Badge>
          <div className="h-6 w-px bg-slate-100" />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Incident Operation Panel</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-11 w-11 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50">
            <Share2 className="w-5 h-5" />
          </Button>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="p-10 space-y-12 pb-32">
        {/* Core Detail Section */}
        <section className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[3rem] -translate-y-8 translate-x-8" />

          <div className="flex flex-col gap-8 relative z-10">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-slate-900 border-none px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">{issue.category}</Badge>
              <Badge
                className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl"
                style={{ backgroundColor: `${statusChartColors[issue.status]}15`, color: statusChartColors[issue.status] }}
              >
                {STATUS_LABELS[issue.status]}
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">
                <MapPin className="w-3 h-3 mr-2" />
                {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
              </Badge>
            </div>

            <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{issue.title}</h3>
            <p className="text-base text-slate-500 font-bold leading-relaxed">{issue.description}</p>

            {issue.imageUrl && (
              <div className="group relative rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl mt-4">
                <img src={issue.imageUrl} className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <p className="text-white text-xs font-black uppercase tracking-widest">Incident Proof Attachment</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 py-10 border-t border-slate-100">
            {issue.slaDeadline && (
              <div className={`col-span-full mb-4 p-5 rounded-2xl border flex items-center justify-between ${new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline) < new Date() ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline) < new Date() ? 'bg-red-500' : 'bg-amber-500'} text-white shadow-lg`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline) < new Date() ? 'text-red-700' : 'text-amber-700'}`}>SLA Operational Window</p>
                    <p className="text-sm font-black text-slate-900">
                      {new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline) < new Date() ? 'CRITICAL: RESOLUTION OVERDUE' : `Resolution due by ${new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                {new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline) > new Date() && (
                  <Badge className="bg-white/50 text-amber-900 border-amber-200">
                    {Math.round((new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline).getTime() - Date.now()) / 3600000)}h Remaining
                  </Badge>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reporter Details</p>
                <p className="text-sm font-black text-slate-900">{(issue as any).reporterName || reporter?.name || 'Authorized Citizen'}</p>
                <p className="text-[10px] font-bold text-primary">ID: {issue.reportedBy}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signal Received</p>
                <p className="text-sm font-black text-slate-900">{new Date((issue.createdAt as any)?.toDate?.() || issue.createdAt).toLocaleDateString()}</p>
                <p className="text-[10px] font-bold text-slate-500">{new Date((issue.createdAt as any)?.toDate?.() || issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          {/* Field Operation Assignment */}
          <section className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Field Operation Assignment</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign task to specialized unit</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsible Sector</label>
                  <Select value={assignedDept} onValueChange={setAssignedDept}>
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-xs">
                      <SelectValue placeholder="Select Dept" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                      {['Public Works Dept.', 'Garbage & Sanitation', 'Water Board', 'Electrical Dept.', 'Public Safety', 'Traffic Control', 'Others'].map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsible Officer</label>
                  <Select value={assignedOfficer} onValueChange={setAssignedOfficer} disabled={!assignedDept}>
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-xs">
                      <SelectValue placeholder="Select Officer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                      {filteredOfficers.map(officer => (
                        <SelectItem key={officer.id} value={officer.id}>{officer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SLA Resolution Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-14 pl-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-sm focus:ring-primary/10"
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  toast.success(`Assigned to ${mockOfficers.find(o => o.id === assignedOfficer)?.name} with deadline ${deadline}`);
                  handleUpdateStatus('in-progress', deadline);
                }}
                disabled={!assignedOfficer || !deadline}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01]"
              >
                Commit Assignment & Start SLA
              </Button>
            </div>
          </section>

          {/* Workflow Controls Refined */}
          <div className="space-y-6 pt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Shield className="w-4 h-4" /> Operational Authorization Flow
            </p>
            {issue.status === 'reported' ? (
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Standard Operating Procedure</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Initial Incident Acknowledgment</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                  Select a resolution timeframe to formally acknowledge this signal and notify the reporting citizen.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleUpdateStatus('acknowledged', '3 Days')}
                    className="group bg-white border-2 border-slate-200 hover:border-primary p-5 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1 text-left"
                  >
                    <Clock className="w-6 h-6 text-teal-500 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard SLA</p>
                    <p className="text-sm font-black text-slate-900">Resolve within 3 Days</p>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('acknowledged', '6 Days')}
                    className="group bg-white border-2 border-slate-200 hover:border-primary p-5 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1 text-left"
                  >
                    <Clock className="w-6 h-6 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Extended SLA</p>
                    <p className="text-sm font-black text-slate-900">Resolve within 6 Days</p>
                  </button>
                </div>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-dashed border-slate-200 rounded-2xl hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all mt-2"
                >
                  Dismiss as Invalid Payload
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(['acknowledged', 'verified', 'in-progress', 'resolved', 'rejected'] as IssueStatus[]).map(status => (
                    <button
                      key={status}
                      disabled={isUpdating || issue.status === status}
                      onClick={() => handleUpdateStatus(status)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${issue.status === status
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105 z-10'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-primary/50 hover:text-primary'
                        }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleEscalate}
                    className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-200 text-amber-700 bg-amber-50 shadow-sm hover:bg-amber-100 hover:shadow-md transition-all flex items-center justify-center gap-3"
                  >
                    <ShieldAlert className="w-4 h-4" /> Initiate Higher Authority Escalation
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Audit Log Refined */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Core Audit Log
            </p>
            <div className="space-y-8 relative ml-4 border-l border-slate-100">
              {issue.history.slice().reverse().map((entry, idx) => (
                <div key={idx} className="relative pl-8 pb-2">
                  <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm" />
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge className="text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-900 border-slate-100">
                      {STATUS_LABELS[entry.status]}
                    </Badge>
                    <span className="text-[9px] font-bold text-slate-400">
                      {new Date((entry.timestamp as any)?.toDate?.() || entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-600 mb-2">Auth: {entry.updatedBy}</p>
                  {entry.comment && <p className="text-[11px] font-medium text-slate-400 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-50 italic">"{entry.comment}"</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Directives Section Refined */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col h-fit">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Tactical Directives
            </p>
            <div className="space-y-4 mb-8">
              {issue.notes.map(note => (
                <div key={note.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-wide">{note.author}</span>
                    <span className="text-[9px] font-bold text-slate-400">{new Date((note.timestamp as any)?.toDate?.() || note.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{note.content}</p>
                </div>
              ))}
              {issue.notes.length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Zero Directives Logged</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
              <Textarea
                placeholder="Enter tactical operational note..."
                className="bg-slate-50 border-slate-100 rounded-2xl min-h-[120px] font-bold text-sm placeholder:text-slate-300 focus:ring-primary/10 transition-all"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button
                disabled={!newNote}
                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
              >
                <Save className="w-5 h-5" /> Commit Note
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Actions Final */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-10 py-8 flex flex-col sm:flex-row gap-5 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="flex-1 flex gap-3">
          <Button onClick={() => toast.warning('Incident flagged for sensitivity review')} variant="outline" className="h-16 w-16 rounded-[1.5rem] border-slate-200 text-slate-400 hover:text-amber-500 transition-colors">
            <Flag className="w-6 h-6" />
          </Button>
          <Button onClick={() => toast.info('Opening Sector Reassignment Dialog...')} variant="outline" className="flex-1 h-16 rounded-[1.5rem] border-slate-200 text-slate-500 font-black uppercase tracking-widest gap-3 hover:bg-slate-50">
            <ShieldAlert className="w-5 h-5 text-amber-500" /> Reassign Unit
          </Button>
        </div>
        <Button onClick={() => handleUpdateStatus('resolved')} className="flex-[2] h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 transition-all hover:scale-[1.02]">
          <CheckCircle2 className="w-6 h-6" /> Finalize & Notify Citizen
        </Button>
      </div>
    </div>
  );
}
