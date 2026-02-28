import { mockNotifications, mockIssues } from '@/data/mockData';
import { ChevronLeft, Bell, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export default function Notifications() {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border py-4 flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-secondary rounded-xl transition-colors"><ChevronLeft className="w-6 h-6 text-foreground" /></Link>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Notifications</h1>
      </div>

      <div className="py-4 space-y-3">
        {mockNotifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/issues/${notif.issueId}`}>
              <div className={`flex items-start gap-4 p-5 rounded-3xl border transition-all ${notif.read
                  ? 'bg-card border-border hover:shadow-sm'
                  : 'bg-primary/5 border-primary/20 shadow-sm border-l-4 border-l-primary'
                }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notif.read ? 'bg-muted' : 'bg-primary/10'
                  }`}>
                  {notif.read ? (
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Bell className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-base leading-snug ${notif.read ? 'text-muted-foreground' : 'text-foreground font-bold'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notif.read && <span className="w-3 h-3 rounded-full bg-primary flex-shrink-0 mt-2 animate-pulse" />}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
