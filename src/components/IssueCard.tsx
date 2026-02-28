import { Issue, CATEGORIES } from '@/types';
import { StatusBadge, PriorityDot } from './StatusBadge';
import { MapPin, ThumbsUp, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface IssueCardProps {
  issue: Issue;
  index?: number;
}

export default function IssueCard({ issue, index = 0 }: IssueCardProps) {
  const cat = CATEGORIES.find(c => c.label === issue.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link to={`/issues/${issue.id}`} className="block group h-full">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] group-hover:border-primary/20 flex flex-col h-full bg-gradient-to-br from-white to-slate-50/30">
          <div className="flex items-start gap-5 mb-5">
            {issue.imageUrl ? (
              <div className="relative overflow-hidden rounded-2xl w-20 h-20 flex-shrink-0 shadow-sm">
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-100 shadow-inner group-hover:bg-primary/5 transition-colors">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {issue.category === 'Roads & Infrastructure' ? '🚧' :
                    issue.category === 'Garbage & Sanitation' ? '🗑️' :
                      issue.category === 'Water Supply' ? '💧' :
                        issue.category === 'Electricity' ? '⚡' :
                          issue.category === 'Street Lights' ? '💡' :
                            issue.category === 'Public Safety' ? '🛡️' :
                              issue.category === 'Traffic Issues' ? '🚦' : '📌'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <StatusBadge status={issue.status} />
                <PriorityDot priority={issue.priority} />
              </div>
              <h3 className="font-black text-slate-900 text-base leading-tight group-hover:text-primary transition-colors">
                {issue.title}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {issue.category.split(' & ')[0]}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4 leading-relaxed">
            {issue.description}
          </p>

          {issue.assignedOfficerId && (
            <div className="mb-4 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl w-fit">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Officer Assigned</span>
            </div>
          )}

          <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5 group-hover:text-slate-600 transition-colors">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {formatDistanceToNow(new Date((issue.createdAt as any)?.toDate?.() || issue.createdAt), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1.5 group-hover:text-slate-600 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                {issue.upvotes}
              </span>
            </div>
            <div className="bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all text-primary">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
