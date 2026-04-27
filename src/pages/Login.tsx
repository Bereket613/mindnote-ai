import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      login(data.token, data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-premium opacity-30 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] rounded-full bg-gradient-premium opacity-30 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[12000ms]" />
      </div>
      <Card className="w-full max-w-md glass-panel shadow-2xl rounded-3xl overflow-hidden relative z-10 border-white/20">
        <CardHeader className="space-y-1 flex flex-col items-center pt-10">
          <div className="bg-primary p-4 rounded-3xl mb-6 shadow-xl shadow-primary/20">
            <BrainCircuit className="w-10 h-10 text-accent" />
          </div>
          <CardTitle className="text-3xl font-black text-primary uppercase tracking-tighter">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400 font-medium">Sign in to your MindNote AI account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-8 pt-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-primary uppercase tracking-wider ml-1">Email</label>
              <Input 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/50 dark:bg-black/50 border-white/20 text-foreground placeholder:text-slate-400 rounded-2xl h-12 focus:ring-primary/40 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black text-primary uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest">
                  Forgot?
                </Link>
              </div>
              <Input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 dark:bg-black/50 border-white/20 text-foreground rounded-2xl h-12 focus:ring-primary/40 backdrop-blur-sm"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 px-8 pb-10 pt-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white transition-all font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign in'}
            </Button>
            <p className="text-xs text-slate-400 text-center font-bold">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-black hover:underline uppercase tracking-tighter">
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
