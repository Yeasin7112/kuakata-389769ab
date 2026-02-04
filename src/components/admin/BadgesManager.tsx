import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Award } from 'lucide-react';

interface Badge {
  id: string;
  name_en: string;
  name_bn: string;
  description_en: string | null;
  description_bn: string | null;
  badge_type: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  icon_url: string | null;
  is_active: boolean;
}

const BadgesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Badge | null>(null);
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_bn: '',
    description_en: '',
    description_bn: '',
    badge_type: 'achievement',
    requirement_type: 'review_count',
    requirement_value: 1,
    points: 10,
    icon_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    const { data } = await supabase
      .from('badges')
      .select('*')
      .order('points', { ascending: true });
    
    setBadges(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      icon_url: formData.icon_url || null,
    };

    if (editing) {
      const { error } = await supabase
        .from('badges')
        .update(payload)
        .eq('id', editing.id);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Updated successfully' });
        fetchBadges();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('badges')
        .insert(payload);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Created successfully' });
        fetchBadges();
        setDialogOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    
    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', id);
    
    if (!error) {
      toast({ title: 'Deleted' });
      fetchBadges();
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({
      name_en: '',
      name_bn: '',
      description_en: '',
      description_bn: '',
      badge_type: 'achievement',
      requirement_type: 'review_count',
      requirement_value: 1,
      points: 10,
      icon_url: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (badge: Badge) => {
    setEditing(badge);
    setFormData({
      name_en: badge.name_en,
      name_bn: badge.name_bn,
      description_en: badge.description_en || '',
      description_bn: badge.description_bn || '',
      badge_type: badge.badge_type,
      requirement_type: badge.requirement_type,
      requirement_value: badge.requirement_value,
      points: badge.points,
      icon_url: badge.icon_url || '',
      is_active: badge.is_active,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badges
        </h2>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Badge
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Requirement</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {badges.map((badge) => (
            <TableRow key={badge.id}>
              <TableCell className="font-medium">
                {language === 'bn' ? badge.name_bn : badge.name_en}
              </TableCell>
              <TableCell>{badge.badge_type}</TableCell>
              <TableCell>{badge.requirement_type} ({badge.requirement_value})</TableCell>
              <TableCell>{badge.points}</TableCell>
              <TableCell>{badge.is_active ? '✓' : '✗'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(badge)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(badge.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Badge' : 'Add Badge'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name (English)</label>
                <Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Name (Bangla)</label>
                <Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Description (English)</label>
                <Textarea value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Bangla)</label>
                <Textarea value={formData.description_bn} onChange={(e) => setFormData({...formData, description_bn: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Badge Type</label>
                <select 
                  className="w-full border rounded-md p-2"
                  value={formData.badge_type} 
                  onChange={(e) => setFormData({...formData, badge_type: e.target.value})}
                >
                  <option value="achievement">Achievement</option>
                  <option value="milestone">Milestone</option>
                  <option value="special">Special</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Requirement Type</label>
                <select 
                  className="w-full border rounded-md p-2"
                  value={formData.requirement_type} 
                  onChange={(e) => setFormData({...formData, requirement_type: e.target.value})}
                >
                  <option value="first_review">First Review</option>
                  <option value="review_count">Review Count</option>
                  <option value="hotel_review">Hotel Reviews</option>
                  <option value="restaurant_review">Restaurant Reviews</option>
                  <option value="first_diary">First Diary</option>
                  <option value="diary_count">Diary Count</option>
                  <option value="first_photo">First Photo</option>
                  <option value="contest_winner">Contest Winner</option>
                  <option value="answer_count">Answer Count</option>
                  <option value="accepted_answer">Accepted Answer</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Requirement Value</label>
                <Input type="number" value={formData.requirement_value} onChange={(e) => setFormData({...formData, requirement_value: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="text-sm font-medium">Points</label>
                <Input type="number" value={formData.points} onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Icon URL (optional)</label>
              <Input value={formData.icon_url} onChange={(e) => setFormData({...formData, icon_url: e.target.value})} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Active</label>
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({...formData, is_active: v})} />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BadgesManager;
