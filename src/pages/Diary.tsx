import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon,
  Smile,
  Tags,
  Search,
  BookText,
  Clock,
  ArrowLeft,
  Save,
  Loader2,
  Meh,
  Frown,
  SmilePlus,
  Angry
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { ScrollArea } from '../components/ui/scroll-area';

const MOODS = [
  { id: 'happy', icon: SmilePlus, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'neutral', icon: Meh, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { id: 'sad', icon: Frown, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  { id: 'angry', icon: Angry, color: 'text-destructive', bg: 'bg-destructive/10' },
];

export default function Diary() {
  const [entries, setEntries] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const data = await api.diary.getAll();
      setEntries(data);
    } catch (error) {
      toast.error('Failed to fetch diary entries');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    if (!activeEntry.title) return;
    setIsSaving(true);
    try {
      if (activeEntry.id) {
        await api.diary.update(activeEntry.id, activeEntry);
        toast.success('Entry updated');
      } else {
        await api.diary.create(activeEntry);
        toast.success('Entry created');
      }
      fetchEntries();
      setActiveEntry(null);
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.diary.delete(id);
      if (activeEntry?.id === id) setActiveEntry(null);
      fetchEntries();
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.tags?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-180px)] pb-12">
      {activeEntry ? (
        <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setActiveEntry(null)} className="gap-3 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Exit Editor
            </Button>
            <div className="flex gap-4">
              <Button variant="ghost" className="h-12 w-12 rounded-2xl text-destructive hover:bg-destructive/10 bg-white shadow-sm transition-all" onClick={() => handleDelete(activeEntry.id)}>
                <Trash2 className="w-5 h-5" />
              </Button>
              <Button className="bg-primary hover:bg-primary/95 text-white gap-3 px-10 h-12 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Commit Reflection
              </Button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
            <Card className="lg:col-span-2 border-none shadow-sm bg-white p-12 rounded-[48px] overflow-hidden flex flex-col gap-10 relative">
              <Input 
                className="text-5xl font-black border-none px-0 focus-visible:ring-0 text-primary placeholder:text-primary/5 h-auto uppercase tracking-tighter"
                placeholder="Day Insight Title..."
                value={activeEntry.title}
                onChange={(e) => setActiveEntry({ ...activeEntry, title: e.target.value })}
              />
              <ScrollArea className="flex-1 pr-4">
                <Textarea 
                  className="w-full border-none px-0 focus-visible:ring-0 text-xl leading-relaxed text-slate-500 placeholder:text-slate-200 resize-none min-h-[400px] font-medium"
                  placeholder="Capture the day's essence..."
                  value={activeEntry.content}
                  onChange={(e) => setActiveEntry({ ...activeEntry, content: e.target.value })}
                />
              </ScrollArea>
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <BookText className="w-48 h-48 text-primary" />
              </div>
            </Card>

            <div className="space-y-8 h-full overflow-y-auto pr-2 pb-10">
              <Card className="border-none shadow-sm bg-white p-8 rounded-3xl">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Smile className="w-4 h-4" /> Emotional State
                </CardTitle>
                <div className="grid grid-cols-2 gap-3">
                  {MOODS.map(mood => {
                    const Icon = mood.icon;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => setActiveEntry({ ...activeEntry, mood: mood.id })}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl transition-all border shrink-0",
                          activeEntry.mood === mood.id 
                            ? `border-primary bg-primary text-white shadow-lg shadow-primary/10` 
                            : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100/50"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", activeEntry.mood === mood.id ? "text-accent" : "")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{mood.id}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card className="border-none shadow-sm bg-white p-8 rounded-3xl">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Tags className="w-4 h-4" /> Taxonomy
                </CardTitle>
                <Input 
                  placeholder="Comma separated tags" 
                  className="bg-slate-50 border-none rounded-xl h-12 text-primary font-bold placeholder:text-slate-200 text-sm"
                  value={activeEntry.tags || ''}
                  onChange={(e) => setActiveEntry({ ...activeEntry, tags: e.target.value })}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeEntry.tags?.split(',').filter(Boolean).map((t: string) => (
                    <div key={t} className="bg-primary/5 text-primary text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-tighter">
                      {t.trim()}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-xl shadow-primary/5 bg-primary p-8 rounded-3xl text-white">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6 flex items-center justify-between">
                  Metadata <Clock className="w-3 h-3" />
                </CardTitle>
                <div className="space-y-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Registry Date</span>
                    <span className="text-sm font-black uppercase tracking-tighter text-accent">
                      {activeEntry.created_at ? format(new Date(activeEntry.created_at), 'PPP') : 'Staging Entry'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Linguistic Density</span>
                    <span className="text-sm font-black uppercase tracking-tighter">
                      {activeEntry.content?.length || 0} Characters / {activeEntry.content?.split(' ').filter(Boolean).length || 0} Terms
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10 h-full">
          <div className="flex items-center justify-between bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">Journal</h1>
              <p className="text-slate-400 font-bold text-sm tracking-tight mt-1 uppercase tracking-widest opacity-60">Memory Subsystem • {entries.length} Reflections</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/95 text-white h-16 px-10 rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase tracking-widest gap-4 transition-all active:scale-95 group relative z-10"
              onClick={() => setActiveEntry({ title: '', content: '', mood: 'neutral', tags: '' })}
            >
              <div className="bg-accent text-primary rounded-lg p-1.5 transition-transform group-hover:rotate-90">
                <Plus className="w-5 h-5" />
              </div>
              New Reflection
            </Button>
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <BookText className="w-40 h-40 text-primary" />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-8 overflow-hidden">
            <div className="relative group max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
              <Input 
                className="pl-14 bg-white border-slate-100 shadow-sm h-16 rounded-[24px] text-lg font-bold placeholder:text-slate-200 text-primary focus:ring-primary/5 transition-all outline-none" 
                placeholder="Query reflections..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {filteredEntries.map(entry => {
                  const moodInfo = MOODS.find(m => m.id === entry.mood) || MOODS[1];
                  const MoodIcon = moodInfo.icon;
                  return (
                    <Card 
                      key={entry.id} 
                      className="border-none shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all bg-white cursor-pointer group rounded-[32px] overflow-hidden flex flex-col h-[320px] relative"
                      onClick={() => setActiveEntry(entry)}
                    >
                      <div className={cn("p-6 flex items-center justify-between shrink-0", moodInfo.bg)}>
                        <div className={cn("p-3 rounded-2xl bg-white shadow-sm shrink-0", moodInfo.color)}>
                          <MoodIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-full">
                          {format(new Date(entry.created_at), 'MMM dd')}
                        </span>
                      </div>
                      <div className="p-8 flex flex-col flex-1">
                        <h3 className="text-2xl font-black text-primary group-hover:text-primary transition-colors line-clamp-1 mb-4 uppercase tracking-tighter">
                          {entry.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-6 font-medium max-h-[4.5em] overflow-hidden">
                          {entry.content || "Empty reflection..."}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-2">
                          {entry.tags?.split(',').filter(Boolean).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-[8px] font-black text-primary bg-primary/5 px-2 py-1 rounded-lg uppercase tracking-tighter">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Interactive hover indicator */}
                      <div className="absolute right-6 bottom-6 w-8 h-8 bg-primary rounded-xl flex items-center justify-center translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
                        <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                      </div>
                    </Card>
                  );
                })}
                {filteredEntries.length === 0 && (
                  <div className="col-span-full h-80 flex flex-col items-center justify-center text-slate-200 border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/50">
                    <BookText className="w-20 h-20 opacity-10 mb-6" />
                    <p className="text-2xl font-black uppercase tracking-tighter opacity-30">No matches found</p>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50">Try broadening your search parameters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
