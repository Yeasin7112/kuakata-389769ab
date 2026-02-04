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
import { Plus, Edit2, Trash2, Camera, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface Contest {
  id: string;
  title_en: string;
  title_bn: string;
  description_en: string | null;
  description_bn: string | null;
  start_date: string;
  end_date: string;
  voting_end_date: string | null;
  prize_en: string | null;
  prize_bn: string | null;
  status: string;
  is_active: boolean;
}

const PhotoContestsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contest | null>(null);
  
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    start_date: '',
    end_date: '',
    voting_end_date: '',
    prize_en: '',
    prize_bn: '',
    status: 'upcoming',
    is_active: true,
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    const { data } = await supabase
      .from('photo_contests')
      .select('*')
      .order('created_at', { ascending: false });
    
    setContests(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      voting_end_date: formData.voting_end_date || null,
    };

    if (editing) {
      const { error } = await supabase
        .from('photo_contests')
        .update(payload)
        .eq('id', editing.id);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Updated successfully' });
        fetchContests();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('photo_contests')
        .insert(payload);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Created successfully' });
        fetchContests();
        setDialogOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    
    const { error } = await supabase
      .from('photo_contests')
      .delete()
      .eq('id', id);
    
    if (!error) {
      toast({ title: 'Deleted' });
      fetchContests();
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      start_date: '',
      end_date: '',
      voting_end_date: '',
      prize_en: '',
      prize_bn: '',
      status: 'upcoming',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (contest: Contest) => {
    setEditing(contest);
    setFormData({
      title_en: contest.title_en,
      title_bn: contest.title_bn,
      description_en: contest.description_en || '',
      description_bn: contest.description_bn || '',
      start_date: contest.start_date,
      end_date: contest.end_date,
      voting_end_date: contest.voting_end_date || '',
      prize_en: contest.prize_en || '',
      prize_bn: contest.prize_bn || '',
      status: contest.status,
      is_active: contest.is_active,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Photo Contests
        </h2>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contest
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contests.map((contest) => (
            <TableRow key={contest.id}>
              <TableCell className="font-medium">
                {language === 'bn' ? contest.title_bn : contest.title_en}
              </TableCell>
              <TableCell>
                {format(new Date(contest.start_date), 'dd/MM/yyyy')} - {format(new Date(contest.end_date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  contest.status === 'active' ? 'bg-green-100 text-green-800' :
                  contest.status === 'voting' ? 'bg-blue-100 text-blue-800' :
                  contest.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {contest.status}
                </span>
              </TableCell>
              <TableCell>{contest.is_active ? '✓' : '✗'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(contest)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(contest.id)}>
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
            <DialogTitle>{editing ? 'Edit Contest' : 'Add Contest'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title (English)</label>
                <Input value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Title (Bangla)</label>
                <Input value={formData.title_bn} onChange={(e) => setFormData({...formData, title_bn: e.target.value})} />
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Voting End Date</label>
                <Input type="date" value={formData.voting_end_date} onChange={(e) => setFormData({...formData, voting_end_date: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prize (English)</label>
                <Input value={formData.prize_en} onChange={(e) => setFormData({...formData, prize_en: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Prize (Bangla)</label>
                <Input value={formData.prize_bn} onChange={(e) => setFormData({...formData, prize_bn: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select 
                className="w-full border rounded-md p-2"
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="voting">Voting</option>
                <option value="completed">Completed</option>
              </select>
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

export default PhotoContestsManager;
