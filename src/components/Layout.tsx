import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, List, Map, Shield, LogOut, User as UserIcon, LayoutDashboard, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', icon: Home, label: 'Overview' },
  { path: '/issues', icon: List, label: 'Issue Registry' },
  { path: '/report', icon: PlusCircle, label: 'New Report' },
  { path: '/map', icon: Map, label: 'City Map' },
  { path: '/admin', icon: LayoutDashboard, label: 'Command Center' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const filteredNavItems = navItems.filter(item => {
    if (user?.role === 'admin') {
      // Admins only see Overview, Map, and Command Center
      return item.path === '/' || item.path === '/map' || item.path === '/admin';
    }
    // Citizens see everything except Command Center and City Map
    return item.path !== '/admin' && item.path !== '/map';
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className={`flex min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-primary/20`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-72 flex-col fixed inset-y-0 left-0 z-50 transition-all duration-500 border-r ${isAdmin
        ? 'bg-[#0F172A] border-white/5 text-white shadow-2xl'
        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
        {/* Brand Section */}
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="FixMyCity"
                className="h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 px-1 ${isAdmin ? 'text-teal-400 opacity-90' : 'text-primary'
                }`}>
                {isAdmin ? 'Authority Console' : 'Citizen Platform'}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          <p className={`px-4 mb-4 text-[10px] font-black uppercase tracking-[0.15em] ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>
            Main Menu
          </p>
          {filteredNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group relative ${isActive
                  ? (isAdmin ? 'bg-white/10 text-white shadow-lg' : 'bg-primary/5 text-primary')
                  : (isAdmin ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className={`absolute left-0 w-1 h-6 rounded-r-full ${isAdmin ? 'bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.6)]' : 'bg-primary'}`}
                  />
                )}
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 mt-auto border-t border-white/5">
          <div className={`p-4 rounded-2xl transition-all duration-300 ${isAdmin ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'
            }`}>
            <div className="flex items-center gap-3.5 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isAdmin ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <UserIcon className={`w-5 h-5 ${isAdmin ? 'text-teal-400' : 'text-primary'}`} />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-extrabold truncate ${isAdmin ? 'text-white' : 'text-slate-900'}`}>
                  {user?.name || "Official"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAdmin ? 'bg-teal-400' : 'bg-green-500'}`} />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    {user?.role || "User"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`w-full justify-start gap-3 h-11 rounded-xl font-bold text-xs transition-all ${isAdmin
                ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                }`}
            >
              <LogOut className="w-4 h-4" />
              Secure Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-72 transition-all duration-500">
        {/* Top Header Bar - Premium feel */}
        <header className="sticky top-0 z-40 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sm:px-12">
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
              Current Session
            </h2>
            <p className="text-lg font-extrabold text-slate-900 leading-none capitalize">
              {location.pathname === '/' ? 'Project Overview' : location.pathname.split('/')[1].replace('-', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50" />
            </button>
          </div>
        </header>

        <div className="p-8 sm:p-12 pb-32 md:pb-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className={`md:hidden fixed bottom-6 left-6 right-6 z-50 h-20 backdrop-blur-2xl border flex items-center justify-around px-4 shadow-2xl rounded-[2rem] transition-all duration-500 ${isAdmin ? 'bg-[#0F172A]/90 border-white/10 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
        }`}>
        {filteredNavItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative p-3 flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? (isAdmin ? 'text-teal-400' : 'text-primary') : 'text-slate-500 opacity-60'
                }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className={`absolute -bottom-1 w-1 h-1 rounded-full ${isAdmin ? 'bg-teal-400' : 'bg-primary'}`}
                />
              )}
            </Link>
          );
        })}
        <button onClick={handleLogout} className="p-3 text-slate-500 opacity-60">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
