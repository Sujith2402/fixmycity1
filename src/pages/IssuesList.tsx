import { useEffect, useState } from 'react';
import { CATEGORIES, Issue, IssueCategory, IssueStatus } from '@/types';
import { ChevronLeft, Search, Filter, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import IssueCard from '@/components/IssueCard';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { issueService } from '@/services/issueService';

const STATUS_FILTERS: (IssueStatus | 'all')[] = ['all', 'reported', 'verified', 'in-progress', 'resolved', 'rejected'];

export default function IssuesList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as IssueCategory | null;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>(initialCategory || 'all');

  useEffect(() => {
    if (!user) return;

    let unsubscribe: () => void;

    if (user.role === 'admin') {
      unsubscribe = issueService.subscribeToAllIssues((data) => {
        const sorted = [...data].sort((a, b) => {
          const dateA = new Date((a.createdAt as any)?.toDate?.() || a.createdAt).getTime();
          const dateB = new Date((b.createdAt as any)?.toDate?.() || b.createdAt).getTime();
          return dateB - dateA;
        });
        setIssues(sorted);
        setLoading(false);
      }, (error) => {
        console.error("IssuesList Subscription Error:", error);
        setLoading(false);
        toast.error("Failed to sync urban registry. Possible security or index issue.");
      });
    } else {
      unsubscribe = issueService.subscribeToUserIssues(user.id, (data) => {
        const sorted = [...data].sort((a, b) => {
          const dateA = new Date((a.createdAt as any)?.toDate?.() || a.createdAt).getTime();
          const dateB = new Date((b.createdAt as any)?.toDate?.() || b.createdAt).getTime();
          return dateB - dateA;
        });
        setIssues(sorted);
        setLoading(false);
      }, (error) => {
        console.error("IssuesList Subscription Error:", error);
        setLoading(false);
        toast.error("Failed to sync your signals. Please refresh or contact authority.");
      });
    }

    return () => unsubscribe();
  }, [user]);

  const filtered = issues.filter(issue => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    if (search && !issue.title.toLowerCase().includes(search.toLowerCase()) && !issue.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border py-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 hover:bg-secondary rounded-xl transition-colors"><ChevronLeft className="w-6 h-6 text-foreground" /></Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">All Issues</h1>
          <span className="ml-auto text-sm text-muted-foreground font-bold bg-secondary/50 px-3 py-1 rounded-full">{filtered.length} results</span>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search issues by title or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 bg-card h-12 rounded-2xl shadow-sm border-border focus:ring-primary"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:max-w-md">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border ${statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground shadow-sm'
                  }`}
              >
                {s === 'all' ? 'All' : s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-6 scroll-mt-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Scanning urban registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[2.5rem] border border-border shadow-sm border-dashed">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">No issues found</p>
            <p className="text-sm text-muted-foreground">
              {issues.length === 0 ? "You haven't reported any issues yet." : "Try adjusting your filters or search query"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((issue, i) => <IssueCard key={issue.id} issue={issue} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
