import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StatusBadge, PriorityDot } from '@/components/StatusBadge';
import { STATUS_LABELS, GOVERNMENT_PORTALS, Issue, IssueStatus } from '@/types';
import { ChevronLeft, MapPin, Clock, ThumbsUp, User, MessageSquare, PlusCircle, Loader2, Send, CheckCircle2, ShieldCheck, Calendar } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { mockOfficers } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { issueService } from '@/services/issueService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const statusSteps = ['reported', 'verified', 'in-progress', 'resolved'] as const;

export default function IssueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (!id) return;

    const unsubscribe = issueService.subscribeToIssueDetails(id, (data) => {
      setIssue(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-bold">Scanning urban archives...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground font-bold">Issue not found</p>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: IssueStatus) => {
    if (!user || !id) return;
    setUpdating(true);
    try {
      await issueService.updateIssueStatus(id, newStatus, user.name || 'Admin', `Status updated to ${STATUS_LABELS[newStatus]}`);
      toast.success(`Issue status updated to ${STATUS_LABELS[newStatus]}`);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!user || !id || !noteContent.trim()) return;
    setUpdating(true);
    try {
      await issueService.addIssueNote(id, {
        author: user.name || 'Admin',
        content: noteContent
      });
      setNoteContent('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Note error:', error);
      toast.error('Failed to add note');
    } finally {
      setUpdating(false);
    }
  };

  const currentStepIndex = ['reported', 'acknowledged', 'verified', 'in-progress', 'resolved'].indexOf(issue.status as any);

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border py-4 flex items-center gap-4">
        <Link to="/issues" className="p-2 hover:bg-secondary rounded-xl transition-colors"><ChevronLeft className="w-6 h-6 text-foreground" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-foreground truncate tracking-tight">{issue.title}</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{issue.id}</p>
        </div>
        <div className="flex-shrink-0"><StatusBadge status={issue.status} /></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-8">
          {/* Image */}
          {issue.imageUrl && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border"
            >
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
              />
              <div className="absolute top-4 left-4">
                <PriorityDot priority={issue.priority} showLabel />
              </div>
            </motion.div>
          )}

          {/* Description & Meta */}
          <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm">
            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
              <span className="inline-flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full"><Clock className="w-3.5 h-3.5" />{formatDistanceToNow(new Date((issue.createdAt as any)?.toDate?.() || issue.createdAt), { addSuffix: true })}</span>
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full"><ThumbsUp className="w-3.5 h-3.5" />{issue.upvotes} upvotes</span>
            </div>

            <p className="text-lg text-card-foreground leading-relaxed font-medium mb-8">{issue.description}</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-secondary/30 rounded-2xl border border-transparent p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Location</p>
                  <p className="text-sm font-bold text-foreground">{issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-secondary/30 rounded-2xl border border-transparent p-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Reporter</p>
                  <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{(issue as any).reporterName || issue.reportedBy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Progress Tracker */}
          {issue.status !== 'rejected' && (
            <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-8">Resolution Progress</h3>
              <div className="relative pt-2">
                {statusSteps.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={step} className="flex items-start gap-6 mb-8 last:mb-0 relative">
                      {i < statusSteps.length - 1 && (
                        <div className={`absolute left-[1.125rem] top-9 w-0.5 h-full ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                      )}

                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${isCompleted ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                        {i + 1}
                      </div>

                      <div className="pt-1.5 flex-1">
                        <p className={`text-base font-bold capitalize mb-1 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {STATUS_LABELS[step]}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-primary font-semibold">Active status — Tracking issue resolution</p>
                        )}
                        {!isCompleted && !isCurrent && (
                          <p className="text-sm text-muted-foreground">Pending — Awaiting previous steps</p>
                        )}
                        {isCompleted && !isCurrent && (
                          <p className="text-sm text-status-resolved font-medium">Successfully verified and completed</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assigned & Resolution */}
          {(issue.assignedDepartment || issue.assignedOfficerId || issue.slaDeadline || issue.resolutionNotes) && (
            <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-6">
              {(issue.assignedDepartment || issue.assignedOfficerId) && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">
                      Officer Assigned: {issue.assignedOfficerId ? mockOfficers.find(o => o.id === issue.assignedOfficerId)?.name : 'Pending Assignment'}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{issue.assignedDepartment || 'Regional Command Office'}</p>
                  </div>
                </div>
              )}

              {issue.slaDeadline && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Deadline for resolving the issue:</h4>
                    <p className="text-sm text-status-resolved font-black tracking-tight">
                      {format(new Date((issue.slaDeadline as any)?.toDate?.() || issue.slaDeadline), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {issue.resolutionNotes && (
                <div className="flex items-start gap-4 border-t border-border pt-6">
                  <div className="w-10 h-10 rounded-xl bg-status-resolved/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-status-resolved" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Official Resolution Notes</h4>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{issue.resolutionNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Government Resources */}
          <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h3 className="text-lg font-bold text-foreground tracking-tight">Official Resources</h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-6">
              Direct access to government portals for formal registration and detailed assistance related to {issue.category.toLowerCase()}.
            </p>
            <div className="grid gap-3">
              {(GOVERNMENT_PORTALS[issue.category as any] || GOVERNMENT_PORTALS['Others']).map((portal, idx) => (
                <a
                  key={idx}
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-transparent hover:border-primary/30 transition-all hover:bg-secondary/50 group"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{portal.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{portal.description}</p>
                  </div>
                  <PlusCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all rotate-45" />
                </a>
              ))}
            </div>
          </div>

          {/* Admin Controls */}
          {user?.role === 'admin' && (
            <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Admin Controls</h3>
                <div className="flex flex-wrap gap-2">
                  {(['acknowledged', 'verified', 'in-progress', 'resolved', 'rejected', 'escalated'] as IssueStatus[]).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={issue.status === s ? 'default' : 'outline'}
                      disabled={updating}
                      onClick={() => handleStatusUpdate(s)}
                      className="rounded-full text-xs font-bold"
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mb-3">Add Official Note</h4>
                <div className="relative">
                  <Textarea
                    placeholder="Type official remark..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="bg-secondary/20 border-border rounded-2xl min-h-[100px] pr-12 focus:ring-primary"
                  />
                  <Button
                    size="icon"
                    disabled={updating || !noteContent.trim()}
                    onClick={handleAddNote}
                    className="absolute bottom-3 right-3 rounded-xl w-10 h-10 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {issue.notes && issue.notes.length > 0 && (
                <div className="pt-4 border-t border-border space-y-4">
                  <h4 className="text-sm font-bold text-foreground mb-2">Internal Notes</h4>
                  {issue.notes.map((note) => (
                    <div key={note.id} className="bg-secondary/30 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-primary uppercase">{note.author}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">{formatDistanceToNow(new Date((note.timestamp as any)?.toDate?.() || note.timestamp), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest gap-4">
            <span className="bg-secondary/50 px-3 py-1 rounded-full">Reported: {format(new Date((issue.createdAt as any)?.toDate?.() || issue.createdAt), 'PPp')}</span>
            <span className="bg-secondary/50 px-3 py-1 rounded-full">Updated: {format(new Date((issue.updatedAt as any)?.toDate?.() || issue.updatedAt), 'PPp')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
