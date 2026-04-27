import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Delete } from 'lucide-react';
import { Button } from './ui/button';

interface AppLockProps {
  children: React.ReactNode;
}

export default function AppLock({ children }: AppLockProps) {
  const [pin, setPin] = useState<string>('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('mindnote-pin');
    if (savedPin) {
      setStoredPin(savedPin);
    } else {
      setIsUnlocked(true); // No PIN set, allow access
    }
  }, []);

  const handleKeyPress = (num: string) => {
    if (error) setError(false);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const verifyPin = (currentPin: string) => {
    if (isSettingUp) {
      if (setupStep === 1) {
        setFirstPin(currentPin);
        setPin('');
        setSetupStep(2);
      } else {
        if (currentPin === firstPin) {
          localStorage.setItem('mindnote-pin', currentPin);
          setStoredPin(currentPin);
          setIsSettingUp(false);
          setIsUnlocked(true);
        } else {
          setError(true);
          setPin('');
          setSetupStep(1);
          setFirstPin('');
        }
      }
    } else {
      if (currentPin === storedPin) {
        setIsUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  const initiateSetup = () => {
    setIsSettingUp(true);
    setIsUnlocked(false);
    setSetupStep(1);
    setPin('');
  };

  if (isUnlocked && !isSettingUp) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-premium opacity-20 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] rounded-full bg-gradient-premium opacity-20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-[3rem] p-8 max-w-sm w-full flex flex-col items-center relative z-10 border-white/10 shadow-2xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 text-primary">
          {isUnlocked ? <Unlock size={32} /> : <Lock size={32} />}
        </div>
        
        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">
          {isSettingUp ? (setupStep === 1 ? 'Set PIN' : 'Confirm PIN') : 'Enter PIN'}
        </h2>
        <p className="text-sm text-slate-400 font-medium mb-8 text-center h-5">
          {error ? (
            <span className="text-destructive">Incorrect PIN, try again</span>
          ) : isSettingUp ? (
            setupStep === 1 ? 'Choose a 4-digit PIN' : 'Verify your 4-digit PIN'
          ) : (
            'Welcome back, unlock MindNote'
          )}
        </p>

        <div className="flex gap-4 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > i ? 'bg-primary scale-110 shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="ghost"
              className="h-16 rounded-2xl text-2xl font-black text-foreground hover:bg-primary/10 transition-all active:scale-95"
              onClick={() => handleKeyPress(num.toString())}
            >
              {num}
            </Button>
          ))}
          <div /> {/* Empty space */}
          <Button
            variant="ghost"
            className="h-16 rounded-2xl text-2xl font-black text-foreground hover:bg-primary/10 transition-all active:scale-95"
            onClick={() => handleKeyPress('0')}
          >
            0
          </Button>
          <Button
            variant="ghost"
            className="h-16 rounded-2xl text-foreground hover:bg-primary/10 transition-all active:scale-95 flex items-center justify-center text-slate-400 hover:text-destructive"
            onClick={handleDelete}
          >
            <Delete size={24} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
