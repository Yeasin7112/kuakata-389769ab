import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const redirectUrl = window.location.hostname.includes('lovableproject.com') || window.location.hostname.includes('lovable.app')
      ? 'https://kuakata.lovable.app/reset-password'
      : `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSent(true);
      toast({
        title: language === 'bn' ? 'ইমেইল পাঠানো হয়েছে' : 'Email Sent',
        description: language === 'bn' 
          ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে' 
          : 'A password reset link has been sent to your email',
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-header text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন' : 'Forgot Password'}
          </h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-elevated p-6">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-bangla">
                  {language === 'bn' ? 'ইমেইল চেক করুন' : 'Check Your Email'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'bn'
                    ? `আমরা ${email} তে একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি। লিংকে ক্লিক করে আপনার পাসওয়ার্ড রিসেট করুন।`
                    : `We've sent a password reset link to ${email}. Click the link to reset your password.`}
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                  {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground font-bangla">
                    {language === 'bn' ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password'}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    {language === 'bn'
                      ? 'আপনার ইমেইল দিন, আমরা রিসেট লিংক পাঠাবো'
                      : 'Enter your email and we\'ll send you a reset link'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                      : (language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link')}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
