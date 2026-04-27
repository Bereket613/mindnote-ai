import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { geminiService } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  CheckCircle2, 
  Clock, 
  StickyNote, 
  TrendingUp, 
  Brain, 
  Plus, 
  ArrowRight,
  Sparkles,
  Loader2,
  MoreVertical,
  Calendar as CalendarIcon,
  NotebookPen
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({
    tasks: [],
    notes: [],
    entries: [],
  });
  const [aiSummary, setAiSummary] = useState('');
  const [moodData, setMoodData] = useState<number[]>([40, 60, 100, 70, 85, 30, 45]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasks, notes, entries] = await Promise.all([
          api.tasks.getAll(),
          api.notes.getAll(),
          api.diary.getAll()
        ]);
        setData({ tasks, notes, entries });
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCompleteTask = async (id: number) => {
    try {
      await api.tasks.update(id, { status: 'completed' });
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t)
      }));
      toast.success('Task completed!');
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await api.tasks.delete(id);
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id)
      }));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleAiAssistant = async () => {
    setIsAiLoading(true);
    try {
      const summary = await geminiService.summarizeDiary(data.entries.slice(0, 5));
      setAiSummary(summary);
    } catch (error) {
      toast.error('AI Assistant failed to respond');
    } finally {
      setIsAiLoading(false);
    }
  };

  const completedTasks = data.tasks.filter((t: any) => t.status === 'completed').length;
  const pendingTasks = data.tasks.filter((t: any) => t.status !== 'completed').length;
  
  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-4 min-h-full pb-6">
      
      {/* AI Assistant Panel - Focus Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="col-span-full md:col-span-4 md:row-span-4"
      >
      <Card className="h-full glass-panel bg-primary/90 dark:bg-primary/40 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col border-primary/50 glow-border group">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-accent text-primary text-[10px] font-black rounded uppercase tracking-tighter">Pro Active</span>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent" />
              AI Assistant
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar pr-2">
            {isAiLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : aiSummary ? (
              <p className="text-primary-foreground/90 text-sm leading-relaxed italic animate-in fade-in slide-in-from-top-2">
                "{aiSummary.slice(0, 300)}..."
              </p>
            ) : (
              <p className="text-primary-foreground/70 text-sm leading-relaxed italic">
                "I've analyzed your recent diary entries. Would you like a personalized summary and productivity plan for today?"
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-white/10 hover:bg-white/20 text-left justify-between p-4 rounded-2xl border border-white/10 text-xs transition-all group/btn"
              onClick={handleAiAssistant}
              disabled={isAiLoading}
            >
              Generate daily plan from tasks
              <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-primary font-bold p-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/10"
              onClick={async () => {
                setIsMoodLoading(true);
                try {
                  const data = await geminiService.analyzeMood(data.entries);
                  setMoodData(data);
                  toast.success('Mood analyzed!');
                } catch {
                  toast.error('Mood analysis failed');
                } finally {
                  setIsMoodLoading(false);
                }
              }}
              disabled={isMoodLoading}
            >
              <Sparkles className="w-4 h-4" />
              {isMoodLoading ? 'Analyzing...' : 'Analyze Mood Trends'}
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent rounded-full blur-[80px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"></div>
      </Card>
      </motion.div>

      {/* Daily Tasks - Center Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="col-span-full md:col-span-5 md:row-span-4"
      >
      <Card className="h-full glass-card rounded-3xl p-6 flex flex-col overflow-hidden group border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-primary uppercase tracking-tighter">Daily Tasks</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary font-bold text-xs hover:bg-primary/5 rounded-full px-4"
            onClick={() => navigate('/tasks')}
          >
            + New Task
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {data.tasks.filter((t: any) => t.status !== 'completed').slice(0, 4).map((task: any) => (
              <motion.div 
                key={task.id} 
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 80) handleCompleteTask(task.id);
                  if (info.offset.x < -80) handleDeleteTask(task.id);
                }}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 w-8 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity flex items-center justify-start pl-2"><CheckCircle2 className="w-4 h-4 text-emerald-700" /></div>
                <div className={cn("w-5 h-5 rounded-lg border-2 z-10", 
                  task.priority === 'high' ? 'border-destructive bg-destructive/10' : 
                  task.priority === 'medium' ? 'border-accent bg-accent/10' : 'border-emerald-500 bg-emerald-50'
                )}></div>
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{task.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {task.due_date ? format(new Date(task.due_date), 'h:mm a') : 'Anytime'} • <span className={cn("font-black uppercase",
                      task.priority === 'high' ? 'text-destructive' : 'text-slate-500'
                    )}>{task.priority}</span>
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(30,27,75,1)] z-10"></div>
                <div className="absolute inset-y-0 right-0 w-8 bg-destructive opacity-0 group-hover:opacity-10 transition-opacity flex items-center justify-end pr-2"><MoreVertical className="w-4 h-4 text-destructive-foreground" /></div>
              </motion.div>
            ))}
            {pendingTasks === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-400">All tasks completed!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
      </motion.div>

      {/* Mood/Insights Card - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="col-span-full md:col-span-3 md:row-span-2"
      >
      <Card className="h-full glass-card bg-accent/5 dark:bg-accent/10 rounded-3xl p-5 border-accent/20 flex flex-col group hover:bg-accent/10 transition-colors">
        <p className="text-[10px] font-black text-accent-foreground uppercase tracking-widest mb-4 flex items-center justify-between">
          <span>Weekly Focus</span>
          <TrendingUp className="w-3 h-3" />
        </p>
        <div className="flex items-end justify-between flex-1 gap-1.5 px-1 py-2">
          {moodData.map((h, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={cn("w-full rounded-t-xl transition-all duration-500", 
                h >= 80 ? "bg-accent shadow-[0_0_12px_rgba(250,204,21,0.4)]" : "bg-accent/40"
              )}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs font-black text-accent-foreground">Balanced Focus</p>
          <span className="text-[10px] font-bold text-accent-foreground/60">+12% vs LW</span>
        </div>
      </Card>
      </motion.div>

      {/* Stats Card - Middle Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="col-span-full md:col-span-3 md:row-span-2"
      >
      <Card className="h-full glass-card rounded-3xl p-5 border-white/20 flex flex-col justify-between group hover:shadow-lg transition-all">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
          <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black">+4%</Badge>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-primary tracking-tighter">84</span>
            <span className="text-sm font-bold text-slate-400 mb-1.5">%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">Peak performance at 11:00 AM</p>
      </Card>
      </motion.div>

      {/* Recent Diary - Bottom Left Half */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="col-span-full md:col-span-6 md:row-span-2"
      >
      <Card className="h-full glass-card rounded-3xl p-6 border-white/20 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-primary uppercase tracking-tighter">Recent Journal Entries</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate('/diary')}>
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {data.entries.slice(0, 2).map((entry: any) => (
            <div 
              key={entry.id} 
              className="p-4 bg-slate-50 rounded-2xl hover:ring-2 hover:ring-primary/10 cursor-pointer transition-all flex flex-col justify-between"
              onClick={() => navigate('/diary')}
            >
              <div>
                <p className="text-xs font-black text-primary truncate leading-tight uppercase tracking-tight mb-1">{entry.title}</p>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                  {entry.content || "No reflection text..."}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {entry.mood}
                </span>
                <span className="text-[9px] font-bold text-slate-400">
                  {format(new Date(entry.created_at), 'MMM d')}
                </span>
              </div>
            </div>
          ))}
          {data.entries.length === 0 && (
            <div className="col-span-2 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-24">
              <p className="text-xs font-bold text-slate-300 italic">No reflections yesterday.</p>
            </div>
          )}
        </div>
      </Card>
      </motion.div>

      {/* Shortcuts - Bottom Right Half */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="col-span-full md:col-span-6 md:row-span-2 flex gap-4"
      >
        <Button 
          className="flex-1 glass-card bg-primary/10 dark:bg-primary/20 rounded-3xl p-6 flex flex-col items-start justify-center border border-primary/20 group hover:bg-primary hover:text-white transition-all overflow-hidden relative shadow-sm h-full"
          onClick={() => navigate('/calendar')}
        >
          <div className="p-2 bg-primary rounded-xl mb-3 group-hover:bg-accent group-hover:scale-110 transition-all">
            <CalendarIcon className="w-5 h-5 text-white group-hover:text-primary" />
          </div>
          <h3 className="font-black text-primary uppercase tracking-tighter group-hover:text-white">Calendar</h3>
          <p className="text-[10px] text-primary/60 font-bold group-hover:text-white/70">Check upcoming events</p>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CalendarIcon className="w-16 h-16" />
          </div>
        </Button>

        <Button 
          className="flex-1 glass-card bg-white/40 dark:bg-black/40 rounded-3xl p-6 flex flex-col items-start justify-center border border-white/20 group hover:border-primary transition-all shadow-sm h-full"
          onClick={() => navigate('/notes')}
        >
          <div className="p-2 bg-slate-100 rounded-xl mb-3 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all group-hover:scale-110">
            <NotebookPen className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-800 uppercase tracking-tighter transition-colors">Library</h3>
          <p className="text-[10px] text-slate-500 font-bold">{data.notes.length} folders • {data.notes.length} documents</p>
        </Button>
      </motion.div>

    </div>
  );
}
