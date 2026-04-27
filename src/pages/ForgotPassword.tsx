import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { BrainCircuit, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Dummy API call
      const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!res.ok) throw new Error('Failed to send email');
      
      setIsSent(true);
      toast.success('Recovery email sent!');
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
            <Mail className="w-10 h-10 text-accent" />
          </div>
          <CardTitle className="text-3xl font-black text-primary uppercase tracking-tighter text-center">Reset Password</CardTitle>
          <CardDescription className="text-slate-400 font-medium text-center px-4">
            {isSent ? 'Check your inbox for a recovery link.' : 'Enter your email and we will send you a recovery link.'}
          </CardDescription>
        </CardHeader>

        {!isSent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-8 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-black text-primary uppercase tracking-wider ml-1">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50 dark:bg-black/50 border-white/20 text-foreground placeholder:text-slate-400 rounded-2xl h-12 focus:ring-primary/40 backdrop-blur-sm"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 px-8 pb-10 pt-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white transition-all font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </Button>
              <p className="text-xs text-slate-400 text-center font-bold">
                Remembered it?{' '}
                <Link to="/login" className="text-primary font-black hover:underline uppercase tracking-tighter">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <CardFooter className="flex flex-col gap-6 px-8 pb-10 pt-4">
            <Button 
              type="button" 
              onClick={() => navigate('/login')}
              className="w-full bg-accent hover:bg-accent/90 text-primary transition-all font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-accent/20"
            >
              Back to Sign In
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
