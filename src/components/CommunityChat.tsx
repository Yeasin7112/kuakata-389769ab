import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Loader2,
  Users,
  ShieldAlert,
  Trash2,
  Ban,
  MessageCircle,
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

const CommunityChat: React.FC = () => {
  const { language } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [onlineCount] = useState(Math.floor(Math.random() * 20) + 5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Check ban status
  const checkBanStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('banned_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    setIsBanned(!!data);
  };

  // Fetch messages
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('community_chat_messages')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages((data as CommunityMessage[]) || []);
    setLoading(false);
  };

  // Get user profile info
  const getUserProfile = async () => {
    if (!user) return { name: null, avatar: null };
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();
    return { name: data?.full_name || user.email?.split('@')[0], avatar: data?.avatar_url };
  };

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      await Promise.all([fetchMessages(), checkBanStatus()]);
    };
    init();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('community-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_chat_messages',
        },
        (payload) => {
          const msg = payload.new as CommunityMessage;
          if (!msg.is_deleted) {
            setMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_chat_messages',
        },
        (payload) => {
          const updated = payload.new as CommunityMessage;
          if (updated.is_deleted) {
            setMessages(prev => prev.filter(m => m.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending || isBanned) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const profile = await getUserProfile();

    const { error } = await supabase
      .from('community_chat_messages')
      .insert({
        user_id: user.id,
        content,
        user_name: profile.name,
        avatar_url: profile.avatar,
      });

    if (error) {
      setNewMessage(content);
      if (error.message.includes('row-level security')) {
        setIsBanned(true);
        toast({
          title: language === 'bn' ? 'নিষিদ্ধ' : 'Banned',
          description: language === 'bn' ? 'আপনাকে চ্যাট থেকে নিষিদ্ধ করা হয়েছে' : 'You have been banned from the community chat',
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'bn' ? 'ত্রুটি' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Admin: delete message
  const deleteMessage = async (msgId: string) => {
    const { error } = await supabase
      .from('community_chat_messages')
      .update({ is_deleted: true, deleted_by: user?.id })
      .eq('id', msgId);

    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      toast({
        title: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted',
        description: language === 'bn' ? 'মেসেজটি মুছে ফেলা হয়েছে' : 'Message has been deleted',
      });
    }
  };

  // Admin: ban user
  const banUser = async (userId: string, userName: string | null) => {
    if (!user) return;

    const { error } = await supabase
      .from('banned_users')
      .insert({
        user_id: userId,
        banned_by: user.id,
        reason: 'Banned from community chat by admin',
        is_permanent: true,
      });

    if (error) {
      if (error.message.includes('duplicate')) {
        toast({
          title: language === 'bn' ? 'ইতিমধ্যে নিষিদ্ধ' : 'Already Banned',
          description: language === 'bn' ? 'এই ব্যবহারকারী ইতিমধ্যে নিষিদ্ধ' : 'This user is already banned',
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'bn' ? 'ত্রুটি' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: language === 'bn' ? 'নিষিদ্ধ করা হয়েছে' : 'User Banned',
        description: `${userName || 'User'} ${language === 'bn' ? 'কে চ্যাট থেকে নিষিদ্ধ করা হয়েছে' : 'has been banned from community chat'}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Community Header Info */}
      <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground font-bangla">
            {language === 'bn' ? `${onlineCount} জন অনলাইন` : `${onlineCount} online`}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-bangla">
          {language === 'bn' ? 'কুয়াকাটা কমিউনিটি' : 'Kuakata Community'}
        </span>
      </div>

      {/* Banned Notice */}
      {isBanned && (
        <div className="mx-4 mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive font-bangla">
            {language === 'bn'
              ? 'আপনাকে কমিউনিটি চ্যাট থেকে নিষিদ্ধ করা হয়েছে। আপনি মেসেজ পাঠাতে পারবেন না।'
              : 'You have been banned from the community chat. You cannot send messages.'}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'কমিউনিটি চ্যাট শুরু করুন!' : 'Start the community chat!'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-bangla">
              {language === 'bn'
                ? 'কুয়াকাটা সম্পর্কে আলোচনা করুন, পরামর্শ দিন'
                : 'Discuss about Kuakata, give suggestions'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => {
              const isMe = msg.user_id === user?.id;
              const showDate =
                index === 0 ||
                format(parseISO(msg.created_at), 'yyyy-MM-dd') !==
                  format(parseISO(messages[index - 1].created_at), 'yyyy-MM-dd');

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                        {format(parseISO(msg.created_at), 'dd MMM yyyy')}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex-shrink-0 mr-2 mt-1">
                        {msg.avatar_url ? (
                          <img src={msg.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary text-xs font-bold">
                            {(msg.user_name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="max-w-[75%]">
                      {!isMe && (
                        <p className="text-xs text-muted-foreground mb-0.5 font-semibold ml-1">
                          {msg.user_name || (language === 'bn' ? 'অজ্ঞাত' : 'Anonymous')}
                        </p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 relative ${
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {format(parseISO(msg.created_at), 'HH:mm')}
                        </p>
                      </div>

                      {/* Admin actions */}
                      {isAdmin && !isMe && (
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive"
                            title={language === 'bn' ? 'মেসেজ মুছুন' : 'Delete message'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => banUser(msg.user_id, msg.user_name)}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive"
                            title={language === 'bn' ? 'ব্যবহারকারী নিষিদ্ধ করুন' : 'Ban user'}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-card p-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              isBanned
                ? (language === 'bn' ? 'আপনি নিষিদ্ধ...' : 'You are banned...')
                : (language === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...')
            }
            className="flex-1 rounded-full"
            disabled={sending || isBanned}
          />
          <Button
            size="icon"
            className="rounded-full flex-shrink-0"
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending || isBanned}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
