import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download, Search, Users, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

const UsersManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-users');
      if (error) throw error;
      setUsers(data.users || []);
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Roles', 'Registered', 'Last Sign In', 'Email Confirmed'];
    const rows = filteredUsers.map((u) => [
      u.full_name,
      u.email,
      u.phone,
      u.roles.join('; '),
      u.created_at ? format(new Date(u.created_at), 'yyyy-MM-dd HH:mm') : '',
      u.last_sign_in_at ? format(new Date(u.last_sign_in_at), 'yyyy-MM-dd HH:mm') : 'Never',
      u.email_confirmed_at ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: language === 'bn' ? 'এক্সপোর্ট সম্পন্ন' : 'Export Complete',
      description: language === 'bn' ? `${filteredUsers.length} জন ব্যবহারকারীর ডেটা এক্সপোর্ট হয়েছে` : `Exported ${filteredUsers.length} users`,
    });
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredUsers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: language === 'bn' ? 'এক্সপোর্ট সম্পন্ন' : 'Export Complete',
      description: language === 'bn' ? `${filteredUsers.length} জন ব্যবহারকারীর ডেটা এক্সপোর্ট হয়েছে` : `Exported ${filteredUsers.length} users`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'bn' ? 'নিবন্ধিত ব্যবহারকারী' : 'Registered Users'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'bn' ? `মোট ${users.length} জন ব্যবহারকারী` : `Total ${users.length} users`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4 mr-1" />
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportJSON}>
            <Download className="w-4 h-4 mr-1" />
            JSON
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={language === 'bn' ? 'নাম, ইমেইল বা ফোন দিয়ে খুঁজুন...' : 'Search by name, email or phone...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'bn' ? 'নাম' : 'Name'}</TableHead>
              <TableHead>{language === 'bn' ? 'ইমেইল' : 'Email'}</TableHead>
              <TableHead className="hidden md:table-cell">{language === 'bn' ? 'ফোন' : 'Phone'}</TableHead>
              <TableHead className="hidden md:table-cell">{language === 'bn' ? 'ভূমিকা' : 'Roles'}</TableHead>
              <TableHead className="hidden lg:table-cell">{language === 'bn' ? 'নিবন্ধন' : 'Registered'}</TableHead>
              <TableHead className="hidden lg:table-cell">{language === 'bn' ? 'শেষ লগইন' : 'Last Login'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {language === 'bn' ? 'কোনো ব্যবহারকারী পাওয়া যায়নি' : 'No users found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {(user.full_name || user.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <span className="truncate max-w-[120px]">{user.full_name || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{user.phone || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.length > 0 ? user.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                      )) : (
                        <Badge variant="outline" className="text-xs">user</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy') : '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'dd MMM yyyy') : 'Never'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersManager;
