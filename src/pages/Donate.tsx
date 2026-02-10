import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Heart, Copy, CheckCircle2, Send, Smartphone, Building2, Wallet, Shield, Server, Bell, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface DonationSetting {
  id: string;
  method_type: string;
  account_name: string | null;
  account_number: string | null;
  bank_name: string | null;
  branch_name: string | null;
  routing_number: string | null;
  instructions_bn: string | null;
  instructions_en: string | null;
  is_active: boolean;
}

const methodIcons: Record<string, React.ReactNode> = {
  bkash: <Smartphone className="w-5 h-5" />,
  nagad: <Smartphone className="w-5 h-5" />,
  rocket: <Wallet className="w-5 h-5" />,
  bank: <Building2 className="w-5 h-5" />,
};

const methodColors: Record<string, string> = {
  bkash: 'bg-pink-500',
  nagad: 'bg-orange-500',
  rocket: 'bg-purple-600',
  bank: 'bg-primary',
};

const Donate: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<DonationSetting[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState('');

  const [form, setForm] = useState({
    donor_name: '',
    donor_phone: '',
    donor_email: '',
    amount: '',
    transaction_id: '',
    sender_number: '',
    message: '',
  });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('donation_settings').select('*').eq('is_active', true).order('display_order');
    if (data) {
      setSettings(data as DonationSetting[]);
      if (data.length > 0) setSelectedMethod(data[0].method_type);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(language === 'bn' ? 'কপি করা হয়েছে!' : 'Copied!');
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.donor_name || !form.amount || !form.transaction_id) {
      toast.error(language === 'bn' ? 'প্রয়োজনীয় তথ্য পূরণ করুন' : 'Please fill required fields');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('donations').insert({
      donor_name: form.donor_name,
      donor_phone: form.donor_phone || null,
      donor_email: form.donor_email || null,
      amount: parseFloat(form.amount),
      payment_method: selectedMethod,
      transaction_id: form.transaction_id,
      sender_number: form.sender_number || null,
      message: form.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(language === 'bn' ? 'জমা দিতে সমস্যা হয়েছে' : 'Failed to submit');
    } else {
      setSubmitted(true);
    }
  };

  const activeSetting = settings.find(s => s.method_type === selectedMethod);

  const impactItems = language === 'bn'
    ? [
        { icon: <Server className="w-4 h-4" />, text: 'সার্ভার ও ডাটা খরচ' },
        { icon: <Shield className="w-4 h-4" />, text: 'নিরাপত্তা সতর্কতা সিস্টেম' },
        { icon: <Bell className="w-4 h-4" />, text: 'স্থানীয় তথ্য আপডেট' },
        { icon: <Globe className="w-4 h-4" />, text: 'ফ্রি সার্ভিস চালু রাখা' },
      ]
    : [
        { icon: <Server className="w-4 h-4" />, text: 'Server & data costs' },
        { icon: <Shield className="w-4 h-4" />, text: 'Safety alert system' },
        { icon: <Bell className="w-4 h-4" />, text: 'Local info updates' },
        { icon: <Globe className="w-4 h-4" />, text: 'Keeping services free' },
      ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10 text-green-600 fill-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground font-bangla">
              {language === 'bn' ? 'ধন্যবাদ! 🎉' : 'Thank You! 🎉'}
            </h2>
            <p className="text-muted-foreground font-bangla">
              {language === 'bn'
                ? 'আপনার সাপোর্ট কুয়াকাটাকে আরও স্মার্ট ও নিরাপদ করতে সাহায্য করবে। অ্যাডমিন যাচাই করার পর আপনাকে ধন্যবাদ জানানো হবে।'
                : 'Your support helps keep Kuakata smart & safe. You will receive a thank you after admin verification.'}
            </p>
            <Button onClick={() => navigate('/')} className="mt-4">
              {language === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}
            </Button>
          </CardContent>
        </Card>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-amber-500 text-white p-4 pb-6 safe-area-top">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-bangla">
              {language === 'bn' ? '🤝 কুয়াকাটাকে সাপোর্ট করুন' : '🤝 Support Kuakata'}
            </h1>
            <p className="text-sm opacity-90 font-bangla">
              {language === 'bn' ? 'এই ফ্রি সার্ভিস চালু রাখতে সাহায্য করুন' : 'Help keep this free service running'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 -mt-3">
        {/* Donation Impact Section */}
        <Card className="border-rose-200 dark:border-rose-800 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/20 dark:to-amber-950/20 p-4">
            <h3 className="font-bold font-bangla text-sm mb-3 text-foreground">
              {language === 'bn' ? '💡 আপনার অনুদানে যা করা হচ্ছে:' : '💡 Your donation impact:'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {impactItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-rose-500">{item.icon}</span>
                  <span className="font-bangla">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        {settings.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {settings.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedMethod(s.method_type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedMethod === s.method_type
                    ? `${methodColors[s.method_type]} text-white shadow-md scale-105`
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {methodIcons[s.method_type]}
                <span className="capitalize">{s.method_type}</span>
              </button>
            ))}
          </div>
        )}

        {/* Payment Details */}
        {activeSetting && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bangla flex items-center gap-2">
                {methodIcons[selectedMethod]}
                {selectedMethod === 'bank'
                  ? (language === 'bn' ? 'ব্যাংক অ্যাকাউন্ট তথ্য' : 'Bank Account Details')
                  : `${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} ${language === 'bn' ? 'নম্বর' : 'Number'}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeSetting.account_number && (
                <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-bangla">{language === 'bn' ? 'নম্বর/অ্যাকাউন্ট' : 'Number/Account'}</p>
                    <p className="text-lg font-bold text-foreground tracking-wide">{activeSetting.account_number}</p>
                  </div>
                  <button onClick={() => copyToClipboard(activeSetting.account_number!, 'number')} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                    {copied === 'number' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              )}
              {activeSetting.account_name && <p className="text-sm"><span className="text-muted-foreground">{language === 'bn' ? 'নাম:' : 'Name:'}</span> <strong>{activeSetting.account_name}</strong></p>}
              {activeSetting.bank_name && <p className="text-sm"><span className="text-muted-foreground">{language === 'bn' ? 'ব্যাংক:' : 'Bank:'}</span> <strong>{activeSetting.bank_name}</strong></p>}
              {activeSetting.branch_name && <p className="text-sm"><span className="text-muted-foreground">{language === 'bn' ? 'শাখা:' : 'Branch:'}</span> <strong>{activeSetting.branch_name}</strong></p>}
              {activeSetting.routing_number && <p className="text-sm"><span className="text-muted-foreground">{language === 'bn' ? 'রাউটিং নম্বর:' : 'Routing:'}</span> <strong>{activeSetting.routing_number}</strong></p>}
              {(language === 'bn' ? activeSetting.instructions_bn : activeSetting.instructions_en) && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 font-bangla">💡 {language === 'bn' ? activeSetting.instructions_bn : activeSetting.instructions_en}</p>
              )}
            </CardContent>
          </Card>
        )}

        {settings.length === 0 && !loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground font-bangla">{language === 'bn' ? 'পেমেন্ট মেথড এখনো সেট করা হয়নি।' : 'Payment methods not configured yet.'}</p>
            </CardContent>
          </Card>
        )}

        {/* Donation Form */}
        {settings.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bangla">
                {language === 'bn' ? '📝 সাপোর্ট তথ্য জমা দিন' : '📝 Submit Support Info'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label className="font-bangla text-xs">{language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}</Label>
                  <Input value={form.donor_name} onChange={e => setForm({ ...form, donor_name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bangla text-xs">{language === 'bn' ? 'ফোন নম্বর' : 'Phone'}</Label>
                    <Input value={form.donor_phone} onChange={e => setForm({ ...form, donor_phone: e.target.value })} />
                  </div>
                  <div>
                    <Label className="font-bangla text-xs">{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                    <Input type="email" value={form.donor_email} onChange={e => setForm({ ...form, donor_email: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bangla text-xs">{language === 'bn' ? 'পরিমাণ (৳) *' : 'Amount (৳) *'}</Label>
                    <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                  </div>
                  <div>
                    <Label className="font-bangla text-xs">{language === 'bn' ? 'ট্রানজেকশন আইডি *' : 'Transaction ID *'}</Label>
                    <Input value={form.transaction_id} onChange={e => setForm({ ...form, transaction_id: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label className="font-bangla text-xs">{language === 'bn' ? 'সেন্ডার নম্বর' : 'Sender Number'}</Label>
                  <Input value={form.sender_number} onChange={e => setForm({ ...form, sender_number: e.target.value })} />
                </div>
                <div>
                  <Label className="font-bangla text-xs">{language === 'bn' ? 'বার্তা (ঐচ্ছিক)' : 'Message (optional)'}</Label>
                  <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={2} />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white" disabled={submitting}>
                  <Heart className="w-4 h-4 mr-2" />
                  {submitting
                    ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...')
                    : (language === 'bn' ? 'কুয়াকাটাকে সাপোর্ট করুন' : 'Support Kuakata')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Donate;
