import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  NotebookPen, 
  Plus, 
  FolderPlus, 
  MoreVertical, 
  Search,
  Pin,
  Trash2,
  FileText,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../components/ui/dialog';

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [notesData, foldersData] = await Promise.all([
        api.notes.getAll(),
        api.notes.getFolders()
      ]);
      setNotes(notesData);
      setFolders(foldersData);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveNote = async () => {
    if (!activeNote) return;
    try {
      if (activeNote.id) {
        await api.notes.update(activeNote.id, activeNote);
        toast.success('Note saved');
      } else {
        const res = await api.notes.create({ ...activeNote, folder_id: selectedFolder });
        setActiveNote(res);
        toast.success('Note created');
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await api.notes.delete(id);
      if (activeNote?.id === id) setActiveNote(null);
      fetchData();
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await api.notes.createFolder({ name: newFolderName });
      setNewFolderName('');
      fetchData();
      toast.success('Folder created');
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                         n.content.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === null || n.folder_id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6 pb-6">
      {/* Folders Sidebar */}
      <aside className="w-64 flex flex-col gap-6 shrink-0">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-primary uppercase text-[10px] tracking-widest">Library</h3>
          <Dialog>
            <DialogTrigger render={
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-primary transition-colors">
                <FolderPlus className="w-4 h-4" />
              </Button>
            } />
            <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0">
              <div className="bg-primary p-6 text-white">
                <DialogTitle className="text-xl font-black uppercase tracking-tighter">New Collection</DialogTitle>
              </div>
              <div className="p-8 space-y-4">
                <Input 
                  placeholder="Folder name" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl h-12"
                />
                <Button className="w-full bg-primary h-12 rounded-xl" onClick={handleCreateFolder}>Create Folder</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1.5">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-3 h-12 px-4 transition-all duration-300 group rounded-2xl",
                selectedFolder === null 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] border-none" 
                  : "text-slate-500 hover:bg-slate-100/50"
              )}
              onClick={() => setSelectedFolder(null)}
            >
              <FileText className={cn("w-4 h-4 transition-colors", selectedFolder === null ? "text-accent" : "text-slate-400 group-hover:text-primary")} />
              <span className="font-black uppercase tracking-tighter text-[11px]">All Notes</span>
            </Button>
            {folders.map(folder => (
              <Button 
                key={folder.id}
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-3 h-12 px-4 transition-all duration-300 group rounded-2xl",
                  selectedFolder === folder.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] border-none" 
                    : "text-slate-500 hover:bg-slate-100/50"
                )}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <FolderOpen className={cn("w-4 h-4 transition-colors", selectedFolder === folder.id ? "text-accent" : "text-slate-400 group-hover:text-primary")} />
                <span className="truncate font-black uppercase tracking-tighter text-[11px]">{folder.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Notes List */}
      <div className="w-80 flex flex-col gap-6 shrink-0 h-full">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-11 bg-white border-slate-100 shadow-sm h-12 rounded-2xl placeholder:text-slate-300 text-primary font-bold text-sm tracking-tight focus:ring-primary/10 transition-all border-none" 
            placeholder="Search notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200">
            <div className="p-3 space-y-2">
              {filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  className={cn(
                    "p-5 rounded-2xl cursor-pointer group transition-all relative overflow-hidden",
                    activeNote?.id === note.id 
                      ? "bg-slate-50 ring-2 ring-primary/5" 
                      : "hover:bg-slate-50/50"
                  )}
                  onClick={() => setActiveNote(note)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-black text-primary uppercase tracking-tighter text-[11px] line-clamp-1 truncate">{note.title}</h4>
                    {note.is_pinned === 1 && <Pin className="w-3 h-3 text-accent fill-accent" />}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {note.content || "No content..."}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                      {format(new Date(note.updated_at), 'MMM d, h:mm a')}
                    </p>
                    {activeNote?.id === note.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
              {filteredNotes.length === 0 && (
                <div className="p-12 text-center text-slate-300 italic flex flex-col items-center">
                  <FileText className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Library is empty</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <Button 
            className="w-full bg-primary hover:bg-primary/95 h-14 rounded-2xl gap-3 font-black uppercase tracking-widest shadow-xl shadow-primary/10 transition-all active:scale-95"
            onClick={() => setActiveNote({ title: 'New Note', content: '', folder_id: selectedFolder })}
          >
            <Plus className="w-5 h-5" /> New Note
          </Button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 h-full">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between bg-white/50 p-2 rounded-2xl shrink-0">
              <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest pl-2">
                <span>Notes</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">{folders.find(f => f.id === activeNote.folder_id)?.name || 'Library'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-400 hover:text-accent" onClick={() => setActiveNote({ ...activeNote, is_pinned: activeNote.is_pinned ? 0 : 1 })}>
                  <Pin className={cn("w-4 h-4 transition-transform", activeNote.is_pinned ? "fill-accent text-accent scale-110" : "hover:scale-110")} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-400">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem className="text-destructive font-black uppercase tracking-tighter text-xs" onClick={() => handleDeleteNote(activeNote.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete permanently
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className="bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest px-8 rounded-xl h-10 transition-all shadow-md shadow-primary/10" onClick={handleSaveNote}>
                  Commit save
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[32px] p-10 shadow-sm border border-slate-200 flex flex-col gap-8 relative group overflow-hidden">
              <Input 
                className="text-4xl font-black border-none px-0 focus-visible:ring-0 placeholder:text-primary/5 text-primary h-auto uppercase tracking-tighter transition-all"
                placeholder="Note Title"
                value={activeNote.title}
                onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
              />
              <ScrollArea className="flex-1">
                <Textarea 
                  className="w-full border-none px-0 focus-visible:ring-0 text-lg leading-relaxed placeholder:text-slate-200 text-slate-600 resize-none min-h-[400px] font-medium"
                  placeholder="The architecture begins here..."
                  value={activeNote.content}
                  onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
                />
              </ScrollArea>
              {/* Animated accent gradient in corner */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none transition-all group-focus-within:bg-accent/10" />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[40px] border-2 border-dashed border-slate-200 shadow-inner group">
            <div className="p-8 bg-slate-50 rounded-full mb-6 transition-transform group-hover:scale-105 duration-500">
              <NotebookPen className="w-20 h-20 opacity-20 text-primary" />
            </div>
            <p className="text-2xl font-black uppercase tracking-tighter text-primary opacity-20">Awaiting your creativity</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50">Select a document from the library</p>
          </div>
        )}
      </div>
    </div>
  );
}
