import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, Plus, Trash2, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

const AdminsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'অ্যাডমিন লোড করতে সমস্যা হয়েছে' : 'Failed to load admins',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'ইমেইল এবং পাসওয়ার্ড দিন' : 'Email and password required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' : 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {
          email: formData.email,
          password: formData.password,
          makeAdmin: true,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: language === 'bn' ? 'সফল' : 'Success',
        description: language === 'bn' ? 'নতুন অ্যাডমিন তৈরি হয়েছে' : 'New admin created successfully',
      });

      setFormData({ email: '', password: '' });
      setDialogOpen(false);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message || (language === 'bn' ? 'অ্যাডমিন তৈরি করতে সমস্যা হয়েছে' : 'Failed to create admin'),
        variant: 'destructive',
      });
    }
    setCreating(false);
  };

  const handleRemoveAdmin = async (adminId: string, userId: string) => {
    // Prevent removing self
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id === userId) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'নিজেকে সরাতে পারবেন না' : 'Cannot remove yourself',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল' : 'Success',
        description: language === 'bn' ? 'অ্যাডমিন সরানো হয়েছে' : 'Admin removed successfully',
      });

      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'অ্যাডমিন সরাতে সমস্যা হয়েছে' : 'Failed to remove admin',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold font-bangla">
            {language === 'bn' ? 'অ্যাডমিন ম্যানেজমেন্ট' : 'Admin Management'}
          </h2>
          <p className="text-sm text-muted-foreground font-bangla">
            {language === 'bn' ? 'নতুন অ্যাডমিন যোগ করুন বা সরান' : 'Add or remove admin users'}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'নতুন অ্যাডমিন' : 'New Admin'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bangla">
                {language === 'bn' ? 'নতুন অ্যাডমিন যোগ করুন' : 'Add New Admin'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <Label className="font-bangla">
                  {language === 'bn' ? 'ইমেইল' : 'Email'}
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={language === 'bn' ? 'admin@example.com' : 'admin@example.com'}
                  required
                />
              </div>
              <div>
                <Label className="font-bangla">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={language === 'bn' ? 'কমপক্ষে ৬ অক্ষর' : 'At least 6 characters'}
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' 
                  ? 'এই অ্যাডমিন ড্যাশবোর্ডে লগইন করে সব কন্টেন্ট পরিচালনা করতে পারবে'
                  : 'This admin will be able to manage all content via the dashboard'}
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {language === 'bn' ? 'তৈরি করুন' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : admins.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-bangla">
            {language === 'bn' ? 'কোনো অ্যাডমিন নেই' : 'No admins found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => (
            <div key={admin.id} className="card-elevated p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {admin.user_id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(admin.created_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    Admin
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminsManager;
