import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const Signup: React.FC = () => {
  const { signUp } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: language === 'bn' ? 'সাইন আপ ব্যর্থ' : 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'অ্যাকাউন্ট তৈরি হয়েছে' : 'Account created successfully',
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-header text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? 'সাইন আপ' : 'Sign Up'}
          </h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-elevated p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground font-bangla">
                {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {language === 'bn' ? 'কুয়াকাটা এক্সপ্লোর করতে যোগ দিন' : 'Join to explore Kuakata'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{language === 'bn' ? 'পুরো নাম' : 'Full Name'}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading 
                  ? (language === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...') 
                  : (language === 'bn' ? 'সাইন আপ' : 'Sign Up')
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  {language === 'bn' ? 'লগইন করুন' : 'Login'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
