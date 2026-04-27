import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  MoreVertical,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const data = await api.tasks.getAll();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title) return;
    try {
      await api.tasks.create(newTask);
      setNewTask({ title: '', priority: 'medium', due_date: '' });
      fetchTasks();
      toast.success('Task added');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const toggleStatus = async (task: any) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.tasks.update(task.id, { ...task, status: newStatus });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.tasks.delete(id);
      fetchTasks();
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-white';
      case 'medium': return 'bg-accent text-primary';
      case 'low': return 'bg-sky-100 text-sky-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Tasks</h1>
          <p className="text-slate-400 font-bold text-sm tracking-tight">Active Productivity • {pendingTasks.length} Pending</p>
        </div>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-xl shadow-primary/20 h-14 px-8 rounded-2xl font-black uppercase tracking-widest relative z-10 transition-transform active:scale-95">
              <Plus className="w-5 h-5" /> Add Task
            </Button>
          } />
          <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary p-6 text-white">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Add New Task</DialogTitle>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Direct from AI Insights</p>
            </div>
            <div className="space-y-6 p-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Task Title</label>
                <Input 
                  placeholder="What needs to be done?" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="bg-slate-50 border-slate-200 rounded-xl h-12 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Priority</label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(val) => setNewTask({ ...newTask, priority: val })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-12">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Due Date</label>
                  <Input 
                    type="date" 
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="bg-slate-50 border-slate-200 rounded-xl h-12"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
              <Button className="bg-primary w-full h-12 rounded-xl font-bold" onClick={handleCreateTask}>Save Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <CheckCircle2 className="w-32 h-32 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> To-Do ({pendingTasks.length})
            </h3>
          </div>
          <div className="space-y-4">
            {pendingTasks.map(task => (
              <Card key={task.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white rounded-3xl p-1">
                <div className="flex items-center gap-4 p-4 min-h-[80px]">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-10 w-10 text-slate-200 hover:text-primary transition-colors group-hover:scale-110"
                    onClick={() => toggleStatus(task)}
                  >
                    <Circle className="w-8 h-8" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-primary group-hover:text-primary transition-colors truncate uppercase tracking-tighter">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      {task.due_date && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <CalendarIcon className="w-3 h-3 text-accent" />
                          <span>{format(new Date(task.due_date), 'MMM d')}</span>
                        </div>
                      )}
                      <Badge className={cn("text-[8px] uppercase font-black tracking-widest px-2 py-0.5 border-none", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem className="text-destructive font-bold" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
            {pendingTasks.length === 0 && (
              <div className="p-12 text-center text-slate-300 italic bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                <p className="text-sm font-bold">Zero pending tasks.</p>
                <p className="text-[10px] uppercase font-black mt-2">Peak Productivity Achieved</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Section using secondary layout style */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Completed ({completedTasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <Card key={task.id} className="border border-slate-100 shadow-none bg-slate-50/50 rounded-2xl group transition-all">
                <div className="p-3 flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8 text-primary group-hover:scale-110 transition-transform"
                    onClick={() => toggleStatus(task)}
                  >
                    <CheckCircle2 className="w-6 h-6 fill-primary text-white" />
                  </Button>
                  <div className="flex-1 truncate">
                    <h4 className="font-bold text-slate-400 line-through text-sm uppercase tracking-tighter">{task.title}</h4>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
