import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Camera, Plus, Pencil, Trash2, Loader2, Calendar, CheckCircle, XCircle, Clock,
  Image as ImageIcon
} from 'lucide-react';

const SERVICE_TYPES = [
  { value: 'couple_shoot', labelBn: 'কাপল শুট', labelEn: 'Couple Shoot' },
  { value: 'drone_shot', labelBn: 'ড্রোন শট', labelEn: 'Drone Shot' },
  { value: 'reels', labelBn: 'রিলস/ভিডিও', labelEn: 'Reels/Video' },
  { value: 'photo_shoot', labelBn: 'ফটো শুট', labelEn: 'Photo Shoot' },
  { value: 'event', labelBn: 'ইভেন্ট কভারেজ', labelEn: 'Event Coverage' },
  { value: 'portrait', labelBn: 'পোর্ট্রেট', labelEn: 'Portrait' },
];

const PhotographerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [photographer, setPhotographer] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'bookings' | 'portfolio'>('services');
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [serviceForm, setServiceForm] = useState({
    name_bn: '', name_en: '', description_bn: '', description_en: '',
    price: 0, duration_minutes: 60, service_type: 'photo_shoot',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const { data: pData } = await supabase.from('photographers').select('*').eq('user_id', user.id).single();
      if (pData) {
        setPhotographer(pData);
        const [servicesRes, bookingsRes] = await Promise.all([
          supabase.from('photographer_services').select('*').eq('photographer_id', pData.id).order('created_at', { ascending: false }),
          supabase.from('photographer_bookings').select('*').eq('photographer_id', pData.id).order('created_at', { ascending: false }),
        ]);
        setServices(servicesRes.data || []);
        setBookings(bookingsRes.data || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photographer) return;
    try {
      const payload = { ...serviceForm, photographer_id: photographer.id };
      if (editingService) {
        const { error } = await supabase.from('photographer_services').update(payload).eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('photographer_services').insert([payload]);
        if (error) throw error;
      }
      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      setServiceDialogOpen(false);
      setEditingService(null);
      setServiceForm({ name_bn: '', name_en: '', description_bn: '', description_en: '', price: 0, duration_minutes: 60, service_type: 'photo_shoot' });
      fetchData();
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
  };

  const deleteService = async (id: string) => {
    if (!confirm(language === 'bn' ? 'নিশ্চিত?' : 'Are you sure?')) return;
    const { error } = await supabase.from('photographer_services').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else fetchData();
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from('photographer_bookings').update({ status }).eq('id', bookingId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: language === 'bn' ? 'আপডেট হয়েছে' : 'Updated' }); fetchData(); }
  };

  const addPortfolioImage = async () => {
    if (!portfolioUrl || !photographer) return;
    const updated = [...(photographer.portfolio_images || []), portfolioUrl];
    const { error } = await supabase.from('photographers').update({ portfolio_images: updated }).eq('id', photographer.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { setPortfolioUrl(''); fetchData(); }
  };

  const removePortfolioImage = async (index: number) => {
    if (!photographer) return;
    const updated = [...(photographer.portfolio_images || [])];
    updated.splice(index, 1);
    const { error } = await supabase.from('photographers').update({ portfolio_images: updated }).eq('id', photographer.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else fetchData();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!photographer) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="p-4 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="font-bold text-lg mb-2 font-bangla">{language === 'bn' ? 'প্রোফাইল পাওয়া যায়নি' : 'No profile found'}</h2>
          <Button onClick={() => navigate('/photographer-register')}>{language === 'bn' ? 'রেজিস্টার করুন' : 'Register Now'}</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Profile Summary */}
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-center gap-3">
            {photographer.profile_image_url ? (
              <img src={photographer.profile_image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"><Camera className="w-8 h-8 text-primary" /></div>
            )}
            <div>
              <h1 className="text-lg font-bold font-bangla">{language === 'bn' ? photographer.name_bn : photographer.name_en}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={photographer.is_approved ? 'default' : 'secondary'}>
                  {photographer.is_approved ? (language === 'bn' ? '✓ অনুমোদিত' : '✓ Approved') : (language === 'bn' ? '⏳ অপেক্ষমাণ' : '⏳ Pending')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['services', 'bookings', 'portfolio'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-medium text-xs font-bangla transition-colors ${
                activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              {tab === 'services' ? (language === 'bn' ? '📦 সার্ভিস' : '📦 Services')
                : tab === 'bookings' ? (language === 'bn' ? '📅 বুকিং' : '📅 Bookings')
                : (language === 'bn' ? '📷 পোর্টফোলিও' : '📷 Portfolio')}
            </button>
          ))}
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <>
            <Button onClick={() => { setEditingService(null); setServiceForm({ name_bn: '', name_en: '', description_bn: '', description_en: '', price: 0, duration_minutes: 60, service_type: 'photo_shoot' }); setServiceDialogOpen(true); }} className="w-full mb-4">
              <Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'নতুন সার্ভিস যোগ করুন' : 'Add New Service'}
            </Button>
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="card-elevated p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="text-[10px] mb-1">{SERVICE_TYPES.find(t => t.value === s.service_type)?.[language === 'bn' ? 'labelBn' : 'labelEn'] || s.service_type}</Badge>
                      <h4 className="font-semibold font-bangla">{language === 'bn' ? s.name_bn : s.name_en}</h4>
                      <p className="text-sm text-primary font-bold">৳{Number(s.price).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingService(s); setServiceForm({ name_bn: s.name_bn, name_en: s.name_en, description_bn: s.description_bn || '', description_en: s.description_en || '', price: s.price, duration_minutes: s.duration_minutes, service_type: s.service_type }); setServiceDialogOpen(true); }} className="p-1.5 rounded bg-muted hover:bg-muted/80"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteService(s.id)} className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-center text-muted-foreground py-4 font-bangla">{language === 'bn' ? 'কোনো সার্ভিস নেই' : 'No services yet'}</p>}
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="card-elevated p-8 text-center"><Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground font-bangla">{language === 'bn' ? 'কোনো বুকিং নেই' : 'No bookings yet'}</p></div>
            ) : bookings.map(b => (
              <div key={b.id} className="card-elevated p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{b.guest_name || 'Guest'}</p>
                    <p className="text-sm text-muted-foreground">{b.guest_phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">📅 {b.booking_date} {b.booking_time && `⏰ ${b.booking_time}`}</p>
                    {b.location && <p className="text-xs text-muted-foreground">📍 {b.location}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">৳{Number(b.total_price).toLocaleString()}</p>
                    <Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'secondary'}>{b.status}</Badge>
                  </div>
                </div>
                {b.notes && <p className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">{b.notes}</p>}
                {b.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => updateBookingStatus(b.id, 'confirmed')}>
                      <CheckCircle className="w-4 h-4 mr-1" />{language === 'bn' ? 'নিশ্চিত' : 'Confirm'}
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => updateBookingStatus(b.id, 'cancelled')}>
                      <XCircle className="w-4 h-4 mr-1" />{language === 'bn' ? 'বাতিল' : 'Cancel'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <div className="card-elevated p-4">
              <Label className="mb-2 block">{language === 'bn' ? 'নতুন ছবি যোগ করুন' : 'Add Portfolio Image'}</Label>
              <ImageUpload currentImage={portfolioUrl} onImageUploaded={(url) => setPortfolioUrl(url)} />
              {portfolioUrl && <Button className="w-full mt-2" onClick={addPortfolioImage}><Plus className="w-4 h-4 mr-1" />{language === 'bn' ? 'যোগ করুন' : 'Add'}</Button>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(photographer.portfolio_images || []).map((img: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-full aspect-square rounded-lg object-cover" />
                  <button onClick={() => removePortfolioImage(i)} className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-bangla">{editingService ? (language === 'bn' ? 'সার্ভিস সম্পাদনা' : 'Edit Service') : (language === 'bn' ? 'নতুন সার্ভিস' : 'New Service')}</DialogTitle></DialogHeader>
          <form onSubmit={handleServiceSubmit} className="space-y-3">
            <div>
              <Label>{language === 'bn' ? 'সার্ভিস টাইপ' : 'Service Type'}</Label>
              <Select value={serviceForm.service_type} onValueChange={v => setServiceForm({ ...serviceForm, service_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{language === 'bn' ? t.labelBn : t.labelEn}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>নাম (বাংলা)</Label><Input required value={serviceForm.name_bn} onChange={e => setServiceForm({ ...serviceForm, name_bn: e.target.value })} /></div>
              <div><Label>Name (EN)</Label><Input required value={serviceForm.name_en} onChange={e => setServiceForm({ ...serviceForm, name_en: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{language === 'bn' ? 'মূল্য (৳)' : 'Price (৳)'}</Label><Input type="number" required min="0" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>{language === 'bn' ? 'সময় (মিনিট)' : 'Duration (min)'}</Label><Input type="number" min="0" value={serviceForm.duration_minutes} onChange={e => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (BN)'}</Label><Textarea value={serviceForm.description_bn} onChange={e => setServiceForm({ ...serviceForm, description_bn: e.target.value })} /></div>
            <div><Label>Description (EN)</Label><Textarea value={serviceForm.description_en} onChange={e => setServiceForm({ ...serviceForm, description_en: e.target.value })} /></div>
            <Button type="submit" className="w-full">{editingService ? (language === 'bn' ? 'আপডেট' : 'Update') : (language === 'bn' ? 'যোগ করুন' : 'Add')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default PhotographerDashboard;
