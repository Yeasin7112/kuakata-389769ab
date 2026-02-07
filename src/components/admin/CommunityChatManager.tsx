import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Trash2,
  Ban,
  Search,
  ShieldCheck,
  MessageSquare,
  UserX,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CommunityMessage {
  id: string;
  user_id: string;
  content: string;
  user_name: string | null;
  avatar_url: string | null;
  is_deleted: boolean;
  created_at: string;
}

interface BannedUser {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string | null;
  banned_at: string;
  is_permanent: boolean;
}

const CommunityChatManager: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'messages' | 'banned'>('messages');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('community_chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setMessages((data as CommunityMessage[]) || []);
  };

  const fetchBannedUsers = async () => {
    const { data } = await supabase
      .from('banned_users')
      .select('*')
      .order('banned_at', { ascending: false });
    setBannedUsers((data as BannedUser[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchMessages(), fetchBannedUsers()]);
      setLoading(false);
    };
    init();
  }, []);

  const deleteMessage = async (msgId: string) => {
    const { error } = await supabase
      .from('community_chat_messages')
      .update({ is_deleted: true, deleted_by: user?.id })
      .eq('id', msgId);

    if (!error) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: true } : m));
      toast({
        title: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted',
        description: language === 'bn' ? 'মেসেজটি মুছে ফেলা হয়েছে' : 'Message deleted successfully',
      });
    }
  };

  const banUser = async (userId: string, userName: string | null) => {
    if (!user) return;

    const { error } = await supabase
      .from('banned_users')
      .insert({
        user_id: userId,
        banned_by: user.id,
        reason: 'Banned by admin',
        is_permanent: true,
      });

    if (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message.includes('duplicate')
          ? (language === 'bn' ? 'ইতিমধ্যে নিষিদ্ধ' : 'User already banned')
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'bn' ? 'নিষিদ্ধ' : 'Banned',
        description: `${userName || 'User'} ${language === 'bn' ? 'নিষিদ্ধ করা হয়েছে' : 'has been banned'}`,
      });
      fetchBannedUsers();
    }
  };

  const unbanUser = async (bannedId: string) => {
    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('id', bannedId);

    if (!error) {
      setBannedUsers(prev => prev.filter(b => b.id !== bannedId));
      toast({
        title: language === 'bn' ? 'মুক্ত করা হয়েছে' : 'Unbanned',
        description: language === 'bn' ? 'ব্যবহারকারী মুক্ত করা হয়েছে' : 'User has been unbanned',
      });
    }
  };

  const filteredMessages = messages.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.content.toLowerCase().includes(q) || m.user_name?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-bangla">
          {language === 'bn' ? 'কমিউনিটি চ্যাট ম্যানেজমেন্ট' : 'Community Chat Management'}
        </h2>
        <p className="text-muted-foreground font-bangla">
          {language === 'bn' ? 'মেসেজ মডারেশন ও ব্যবহারকারী ব্যান ব্যবস্থাপনা' : 'Moderate messages and manage banned users'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{messages.filter(m => !m.is_deleted).length}</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'সক্রিয় মেসেজ' : 'Active Messages'}
              </p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <UserX className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bannedUsers.length}</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'নিষিদ্ধ ব্যবহারকারী' : 'Banned Users'}
              </p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{messages.filter(m => m.is_deleted).length}</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'মুছে ফেলা মেসেজ' : 'Deleted Messages'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors font-bangla ${
            activeTab === 'messages'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-1.5" />
          {language === 'bn' ? 'মেসেজ' : 'Messages'}
        </button>
        <button
          onClick={() => setActiveTab('banned')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors font-bangla ${
            activeTab === 'banned'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Ban className="w-4 h-4 inline mr-1.5" />
          {language === 'bn' ? 'নিষিদ্ধ ব্যবহারকারী' : 'Banned Users'} ({bannedUsers.length})
        </button>
      </div>

      {activeTab === 'messages' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'মেসেজ খুঁজুন...' : 'Search messages...'}
              className="pl-10"
            />
          </div>

          {/* Messages list */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`card-elevated p-3 flex items-start gap-3 ${msg.is_deleted ? 'opacity-50' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                  {msg.avatar_url ? (
                    <img src={msg.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary text-xs font-bold">
                      {(msg.user_name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{msg.user_name || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(msg.created_at), 'dd MMM yyyy HH:mm')}
                    </span>
                    {msg.is_deleted && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                        {language === 'bn' ? 'মুছে ফেলা' : 'Deleted'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 break-words">{msg.content}</p>
                </div>
                {!msg.is_deleted && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMessage(msg.id)}
                      title={language === 'bn' ? 'মুছুন' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => banUser(msg.user_id, msg.user_name)}
                      title={language === 'bn' ? 'নিষিদ্ধ করুন' : 'Ban user'}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredMessages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground font-bangla">
                {language === 'bn' ? 'কোনো মেসেজ নেই' : 'No messages found'}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'banned' && (
        <div className="space-y-3">
          {bannedUsers.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground font-bangla">
                {language === 'bn' ? 'কোনো নিষিদ্ধ ব্যবহারকারী নেই' : 'No banned users'}
              </p>
            </div>
          ) : (
            bannedUsers.map((banned) => (
              <div key={banned.id} className="card-elevated p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    User ID: <span className="text-xs font-mono text-muted-foreground">{banned.user_id.slice(0, 8)}...</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {language === 'bn' ? 'নিষিদ্ধ' : 'Banned'}: {format(parseISO(banned.banned_at), 'dd MMM yyyy HH:mm')}
                  </p>
                  {banned.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'bn' ? 'কারণ' : 'Reason'}: {banned.reason}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unbanUser(banned.id)}
                  className="text-emerald-600 hover:text-emerald-700 hover:border-emerald-300"
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  {language === 'bn' ? 'মুক্ত করুন' : 'Unban'}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityChatManager;
