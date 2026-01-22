import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface WarningZone {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  severity: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
  is_active: boolean | null;
}

const WarningZonesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [zones, setZones] = useState<WarningZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WarningZone | null>(null);
  const [formData, setFormData] = useState({
    name_bn: '', name_en: '', description_bn: '', description_en: '',
    severity: 'medium', latitude: '', longitude: '', radius_meters: '', is_active: true
  });

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    const { data } = await supabase.from('warning_zones').select('*').order('severity');
    if (data) setZones(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name_bn: '', name_en: '', description_bn: '', description_en: '', severity: 'medium', latitude: '', longitude: '', radius_meters: '', is_active: true });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        radius_meters: formData.radius_meters ? parseInt(formData.radius_meters) : null,
      };
      if (editing) {
        await supabase.from('warning_zones').update(payload).eq('id', editing.id);
      } else {
        await supabase.from('warning_zones').insert([payload]);
      }
      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      setIsDialogOpen(false);
      resetForm();
      fetchZones();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (zone: WarningZone) => {
    setEditing(zone);
    setFormData({
      name_bn: zone.name_bn, name_en: zone.name_en,
      description_bn: zone.description_bn || '', description_en: zone.description_en || '',
      severity: zone.severity || 'medium',
      latitude: zone.latitude?.toString() || '', longitude: zone.longitude?.toString() || '',
      radius_meters: zone.radius_meters?.toString() || '', is_active: zone.is_active ?? true
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    await supabase.from('warning_zones').delete().eq('id', id);
    fetchZones();
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'সতর্কতা এলাকা' : 'Warning Zones'}</h1>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'নতুন যোগ' : 'Add'}</Button>
      </div>
      <div className="grid gap-4">
        {zones.map((zone) => (
          <div key={zone.id} className="card-elevated p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 ${zone.severity === 'high' ? 'text-red-500' : zone.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'}`} />
              <div>
                <h3 className="font-semibold font-bangla">{language === 'bn' ? zone.name_bn : zone.name_en}</h3>
                <p className="text-sm text-muted-foreground capitalize">{zone.severity}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(zone)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(zone.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Warning Zone</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name (BN)</Label><Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} required /></div>
              <div><Label>Name (EN)</Label><Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required /></div>
            </div>
            <div><Label>Description (BN)</Label><Textarea value={formData.description_bn} onChange={(e) => setFormData({...formData, description_bn: e.target.value})} /></div>
            <div><Label>Description (EN)</Label><Textarea value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} /></div>
            <div><Label>Severity</Label>
              <Select value={formData.severity} onValueChange={(v) => setFormData({...formData, severity: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Latitude</Label><Input value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} /></div>
              <div><Label>Longitude</Label><Input value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} /></div>
              <div><Label>Radius (m)</Label><Input value={formData.radius_meters} onChange={(e) => setFormData({...formData, radius_meters: e.target.value})} /></div>
            </div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} /></div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarningZonesManager;
