import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Circle,
  Clock,
  NotebookPen,
  BookText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { ScrollArea } from '../components/ui/scroll-area';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [items, setItems] = useState<any>({ tasks: [], notes: [], diary: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasks, notes, diary] = await Promise.all([
          api.tasks.getAll(),
          api.notes.getAll(),
          api.diary.getAll()
        ]);
        setItems({ tasks, notes, diary });
      } catch (error) {
        console.error('Failed to fetch data for calendar');
      }
    }
    fetchData();
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-primary flex items-center gap-3 uppercase tracking-tighter">
            Planner
          </h1>
          <p className="text-slate-400 font-bold text-sm tracking-tight uppercase tracking-widest opacity-60">Temporal Intelligence Subsystem</p>
        </div>
        <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-2xl relative z-10 mt-4 md:mt-0">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white transition-colors" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-5 h-5 text-primary" />
          </Button>
          <span className="text-sm font-black text-primary min-w-[140px] text-center uppercase tracking-widest">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white transition-colors" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-5 h-5 text-primary" />
          </Button>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <CalendarIcon className="w-40 h-40 text-primary" />
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4 px-4">
        {days.map((day, index) => (
          <div key={index} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        // Find items for this day
        const dayTasks = items.tasks.filter((t: any) => t.due_date && isSameDay(new Date(t.due_date), cloneDay));
        const dayDiary = items.diary.filter((d: any) => isSameDay(new Date(d.created_at), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative h-32 border border-slate-50 p-3 transition-all cursor-pointer group overflow-hidden",
              !isSameMonth(day, monthStart) ? "bg-slate-50/20 opacity-20" : "bg-white hover:bg-slate-50/50",
              isSameDay(day, selectedDate) ? "bg-primary/5 ring-1 ring-inset ring-primary z-10" : ""
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isSameDay(day, new Date()) 
                ? "bg-primary text-white w-6 h-6 rounded-lg flex items-center justify-center -ml-1 -mt-1 shadow-lg shadow-primary/20" 
                : isSameDay(day, selectedDate) ? "text-primary" : "text-slate-400"
            )}>
              {formattedDate}
            </span>
            
            <div className="mt-3 space-y-1.5 overflow-hidden">
              {dayTasks.slice(0, 3).map((task: any) => (
                <div key={task.id} className="text-[8px] bg-primary/5 text-primary px-2 py-1 rounded-md truncate font-black uppercase tracking-tighter border-l-2 border-primary">
                  {task.title}
                </div>
              ))}
              {dayDiary.length > 0 && (
                <div className="text-[8px] bg-accent/20 text-primary px-2 py-1 rounded-md truncate font-black uppercase tracking-tighter border-l-2 border-accent">
                  Ref: {dayDiary[0].title}
                </div>
              )}
              {(dayTasks.length > 3) && (
                <div className="text-[7px] text-slate-300 font-black pl-1 uppercase">+{dayTasks.length - 3} more items</div>
              )}
            </div>
            {/* Hover indicator gradient */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="rounded-[40px] overflow-hidden border border-slate-100 shadow-sm bg-white">{rows}</div>;
  };

  const selectedDayItems = {
    tasks: items.tasks.filter((t: any) => t.due_date && isSameDay(new Date(t.due_date), selectedDate)),
    diary: items.diary.filter((d: any) => isSameDay(new Date(d.created_at), selectedDate)),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-12">
      <div className="lg:col-span-3">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      
      <aside className="space-y-8">
        <Card className="border-none shadow-xl shadow-primary/5 bg-primary text-white rounded-[32px] p-8 min-h-[500px] flex flex-col">
          <div className="flex flex-col gap-1 mb-8">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Agenda Focus</span>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center justify-between">
              {format(selectedDate, 'MMM d')}
              <button className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Clock className="w-4 h-4 text-accent" />
              </button>
            </CardTitle>
          </div>
          
          <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/10 pb-2">Primary Tasks</h4>
                <div className="space-y-2">
                  {selectedDayItems.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                      <div className={cn("w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]", task.priority === 'high' ? 'bg-destructive' : 'bg-accent')} />
                      <span className="text-xs font-black uppercase tracking-tighter group-hover:translate-x-1 transition-transform">{task.title}</span>
                    </div>
                  ))}
                  {selectedDayItems.tasks.length === 0 && (
                    <div className="py-4 px-2 italic text-white/30 text-[10px] font-bold uppercase tracking-widest text-center border border-dashed border-white/10 rounded-2xl">
                      No active tasks
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/10 pb-2">Diary Insights</h4>
                <div className="space-y-3">
                  {selectedDayItems.diary.map((entry: any) => (
                    <div key={entry.id} className="bg-white p-5 rounded-2xl shadow-lg shadow-black/10 text-primary">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/5 rounded-lg">
                          <BookText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tighter">{entry.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-3 font-medium leading-relaxed">{entry.content}</p>
                    </div>
                  ))}
                  {selectedDayItems.diary.length === 0 && (
                    <div className="py-4 px-2 italic text-white/30 text-[10px] font-bold uppercase tracking-widest text-center border border-dashed border-white/10 rounded-2xl">
                      No reflections recorded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-[32px] p-8 group relative overflow-hidden border border-slate-100">
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500">
              <NotebookPen className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-black text-primary uppercase tracking-tighter text-sm">Productivity Architecture</h4>
            <p className="text-[10px] text-slate-400 mt-4 italic font-bold leading-relaxed px-2">
              "Systematic quality is achieved through deliberate organization of thoughts and time."
            </p>
          </div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        </Card>
      </aside>
    </div>
  );
}
