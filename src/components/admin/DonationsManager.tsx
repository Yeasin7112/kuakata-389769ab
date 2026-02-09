import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, CheckCircle, XCircle, Phone, Mail, Clock,
  Heart, Smartphone, Building2, Wallet, Edit2
} from 'lucide-react';

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
  display_order: number | null;
}

interface Donation {
  id: string;
  donor_name: string;
  donor_phone: string | null;
  donor_email: string | null;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  sender_number: string | null;
  message: string | null;
  status: string;
  admin_note: string | null;
  thanked: boolean | null;
  thank_method: string | null;
  created_at: string;
}

const DonationsManager: React.FC = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<DonationSetting[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<Partial<DonationSetting> | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [settingsRes, donationsRes] = await Promise.all([
      supabase.from('donation_settings').select('*').order('display_order'),
      supabase.from('donations').select('*').order('created_at', { ascending: false }),
    ]);
    if (settingsRes.data) setSettings(settingsRes.data as DonationSetting[]);
    if (donationsRes.data) setDonations(donationsRes.data as Donation[]);
    setLoading(false);
  };

  // --- Settings CRUD ---
  const saveSetting = async () => {
    if (!editingSetting?.method_type || !editingSetting?.account_number) {
      toast.error('Method type and account number required');
      return;
    }
    const payload = {
      method_type: editingSetting.method_type,
      account_name: editingSetting.account_name || null,
      account_number: editingSetting.account_number,
      bank_name: editingSetting.bank_name || null,
      branch_name: editingSetting.branch_name || null,
      routing_number: editingSetting.routing_number || null,
      instructions_bn: editingSetting.instructions_bn || null,
      instructions_en: editingSetting.instructions_en || null,
      is_active: editingSetting.is_active ?? true,
      display_order: editingSetting.display_order ?? 0,
    };

    if (editingSetting.id) {
      await supabase.from('donation_settings').update(payload).eq('id', editingSetting.id);
    } else {
      await supabase.from('donation_settings').insert(payload);
    }
    toast.success('Saved!');
    setEditingSetting(null);
    fetchAll();
  };

  const deleteSetting = async (id: string) => {
    await supabase.from('donation_settings').delete().eq('id', id);
    toast.success('Deleted');
    fetchAll();
  };

  // --- Donation Actions ---
  const updateDonation = async (id: string, updates: Partial<Donation>) => {
    await supabase.from('donations').update(updates).eq('id', id);
    toast.success('Updated');
    fetchAll();
  };

  const filteredDonations = filter === 'all' ? donations : donations.filter(d => d.status === filter);
  const totalVerified = donations.filter(d => d.status === 'verified').reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-bangla">
        {language === 'bn' ? '💰 ডোনেশন ম্যানেজমেন্ট' : '💰 Donations Management'}
      </h2>

      <Tabs defaultValue="donations">
        <TabsList>
          <TabsTrigger value="donations">{language === 'bn' ? 'ডোনেশন' : 'Donations'}</TabsTrigger>
          <TabsTrigger value="settings">{language === 'bn' ? 'পেমেন্ট সেটিংস' : 'Payment Settings'}</TabsTrigger>
        </TabsList>

        {/* ========= DONATIONS TAB ========= */}
        <TabsContent value="donations" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{donations.length}</p>
              <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোট' : 'Total'}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{donations.filter(d => d.status === 'pending').length}</p>
              <p className="text-xs text-muted-foreground">{language === 'bn' ? 'পেন্ডিং' : 'Pending'}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{donations.filter(d => d.status === 'verified').length}</p>
              <p className="text-xs text-muted-foreground">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">৳{totalVerified.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোট (যাচাই)' : 'Total (Verified)'}</p>
            </CardContent></Card>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'pending', 'verified', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Donations List */}
          {filteredDonations.map(d => (
            <Card key={d.id} className={`${d.status === 'verified' ? 'border-green-200' : d.status === 'rejected' ? 'border-red-200' : 'border-yellow-200'}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-foreground">{d.donor_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">৳{Number(d.amount).toLocaleString()}</p>
                    <Badge variant={d.status === 'verified' ? 'default' : d.status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                      {d.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><span className="text-muted-foreground">Method:</span> <strong className="capitalize">{d.payment_method}</strong></p>
                  <p><span className="text-muted-foreground">TxnID:</span> <strong>{d.transaction_id}</strong></p>
                  {d.donor_phone && <p><Phone className="w-3 h-3 inline mr-1" />{d.donor_phone}</p>}
                  {d.donor_email && <p><Mail className="w-3 h-3 inline mr-1" />{d.donor_email}</p>}
                  {d.sender_number && <p><span className="text-muted-foreground">Sender:</span> {d.sender_number}</p>}
                </div>

                {d.message && <p className="text-xs bg-muted p-2 rounded-lg italic">"{d.message}"</p>}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {d.status === 'pending' && (
                    <>
                      <Button size="sm" variant="default" onClick={() => updateDonation(d.id, { status: 'verified' })}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Verify
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateDonation(d.id, { status: 'rejected' })}>
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {d.status === 'verified' && !d.thanked && (
                    <Select onValueChange={(v) => updateDonation(d.id, { thanked: true, thank_method: v })}>
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue placeholder="Send Thanks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">📞 Thanks Call</SelectItem>
                        <SelectItem value="letter">📝 Thanks Letter</SelectItem>
                        <SelectItem value="both">📞📝 Both</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {d.thanked && (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <Heart className="w-3 h-3 mr-1 fill-green-600" />
                      Thanked ({d.thank_method})
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDonations.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{language === 'bn' ? 'কোন ডোনেশন নেই' : 'No donations found'}</p>
          )}
        </TabsContent>

        {/* ========= SETTINGS TAB ========= */}
        <TabsContent value="settings" className="space-y-4">
          <Button onClick={() => setEditingSetting({ method_type: 'bkash', is_active: true, display_order: settings.length })}>
            <Plus className="w-4 h-4 mr-2" /> {language === 'bn' ? 'নতুন মেথড যোগ করুন' : 'Add Payment Method'}
          </Button>

          {/* Edit Form */}
          {editingSetting && (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{editingSetting.id ? 'Edit' : 'Add'} Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Method Type</Label>
                    <Select value={editingSetting.method_type} onValueChange={v => setEditingSetting({ ...editingSetting, method_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bkash">bKash</SelectItem>
                        <SelectItem value="nagad">Nagad</SelectItem>
                        <SelectItem value="rocket">Rocket</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Account Number *</Label>
                    <Input value={editingSetting.account_number || ''} onChange={e => setEditingSetting({ ...editingSetting, account_number: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Account Name</Label>
                  <Input value={editingSetting.account_name || ''} onChange={e => setEditingSetting({ ...editingSetting, account_name: e.target.value })} />
                </div>
                {editingSetting.method_type === 'bank' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-xs">Bank Name</Label>
                      <Input value={editingSetting.bank_name || ''} onChange={e => setEditingSetting({ ...editingSetting, bank_name: e.target.value })} /></div>
                    <div><Label className="text-xs">Branch</Label>
                      <Input value={editingSetting.branch_name || ''} onChange={e => setEditingSetting({ ...editingSetting, branch_name: e.target.value })} /></div>
                    <div><Label className="text-xs">Routing</Label>
                      <Input value={editingSetting.routing_number || ''} onChange={e => setEditingSetting({ ...editingSetting, routing_number: e.target.value })} /></div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Instructions (BN)</Label>
                    <Textarea value={editingSetting.instructions_bn || ''} onChange={e => setEditingSetting({ ...editingSetting, instructions_bn: e.target.value })} rows={2} /></div>
                  <div><Label className="text-xs">Instructions (EN)</Label>
                    <Textarea value={editingSetting.instructions_en || ''} onChange={e => setEditingSetting({ ...editingSetting, instructions_en: e.target.value })} rows={2} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editingSetting.is_active} onCheckedChange={v => setEditingSetting({ ...editingSetting, is_active: v })} />
                  <Label className="text-xs">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveSetting}><Save className="w-4 h-4 mr-1" /> Save</Button>
                  <Button variant="outline" onClick={() => setEditingSetting(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings List */}
          {settings.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    s.method_type === 'bkash' ? 'bg-pink-500' : s.method_type === 'nagad' ? 'bg-orange-500' : s.method_type === 'rocket' ? 'bg-purple-600' : 'bg-primary'
                  }`}>
                    {s.method_type === 'bank' ? <Building2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold capitalize">{s.method_type}</p>
                    <p className="text-sm text-muted-foreground">{s.account_number} • {s.account_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => setEditingSetting(s)}><Edit2 className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSetting(s.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonationsManager;
