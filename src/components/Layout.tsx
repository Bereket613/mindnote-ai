import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookText, 
  NotebookPen, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  LogOut,
  BrainCircuit,
  Search,
  Settings,
  Bell,
  Plus,
  PenTool
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/diary', label: 'Diary', icon: BookText },
  { path: '/notes', label: 'Notes', icon: NotebookPen },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen font-sans flex flex-col overflow-hidden bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-premium opacity-30 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute -bottom-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-premium opacity-30 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[12000ms]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 p-6 h-screen max-w-(--breakpoint-2xl) mx-auto w-full">
        {/* Top Header Navigation */}
        <header className="glass-panel flex items-center justify-between p-4 rounded-3xl shrink-0 transition-all duration-500 hover:shadow-[0_8px_32px_0_rgba(var(--primary),0.2)] hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-gradient">MindNote AI</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search notes, tasks, or diary..." 
                className="w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 rounded-full py-2.5 px-12 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-slate-400 focus:bg-white/60 dark:focus:bg-black/60 shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {format(new Date(), 'EEEE, MMM d')}
              </p>
              <p className="text-sm font-bold text-foreground">{user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0 overflow-hidden shadow-sm backdrop-blur-md">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Floating Action Button (FAB) */}
        <motion.div 
          className="absolute bottom-28 right-8 z-50 md:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button 
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 flex items-center justify-center group"
            onClick={() => navigate('/notes')}
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </Button>
        </motion.div>

        {/* Bottom Floating Navigation */}
        <footer className="glass-panel shrink-0 flex justify-between items-center p-3 px-6 rounded-[2rem] shadow-2xl overflow-hidden mt-auto">
          <div className="flex gap-2 md:gap-8 overflow-x-auto no-scrollbar items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "text-primary font-bold bg-primary/10 glow" 
                      : "text-slate-500 hover:text-primary hover:bg-white/40 dark:hover:bg-white/10"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                  <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary to-accent rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary),0.5)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
          <div className="flex gap-3 items-center text-slate-500 ml-4 pl-4 border-l border-white/20">
             <div className="relative flex items-center justify-center">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] z-10"></div>
               <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80 hidden md:block">System Optimal</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
