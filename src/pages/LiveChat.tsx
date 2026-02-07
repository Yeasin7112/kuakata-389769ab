import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Loader2,
  Circle,
  Search,
  Phone,
  Star,
  ChevronLeft,
  Clock,
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

interface Guide {
  id: string;
  name_bn: string;
  name_en: string;
  image_url: string | null;
  phone: string;
  specialization_bn: string | null;
  specialization_en: string | null;
  rating: number | null;
  is_online: boolean | null;
  last_seen: string | null;
  is_active: boolean | null;
  user_id: string | null;
}

interface ChatRoom {
  id: string;
  tourist_id: string;
  guide_id: string;
  guide_profile_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string;
}

type View = 'list' | 'guides' | 'chat';

const LiveChat: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [view, setView] = useState<View>('list');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [roomGuides, setRoomGuides] = useState<Record<string, Guide>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch guides
  const fetchGuides = async () => {
    const { data } = await supabase
      .from('local_guides')
      .select('*')
      .eq('is_active', true)
      .order('is_online', { ascending: false });
    setGuides((data as Guide[]) || []);
  };

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('chat_rooms')
      .select('*')
      .or(`tourist_id.eq.${user.id},guide_id.eq.${user.id}`)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false });

    const rooms = (data as ChatRoom[]) || [];
    setChatRooms(rooms);

    // Fetch guide info for each room
    if (rooms.length > 0) {
      const guideProfileIds = rooms
        .filter(r => r.guide_profile_id)
        .map(r => r.guide_profile_id!);

      if (guideProfileIds.length > 0) {
        const { data: guideData } = await supabase
          .from('local_guides')
          .select('*')
          .in('id', guideProfileIds);

        if (guideData) {
          const map: Record<string, Guide> = {};
          guideData.forEach((g: any) => {
            map[g.id] = g as Guide;
          });
          setRoomGuides(map);
        }
      }
    }
  };

  // Fetch messages for a room
  const fetchMessages = async (roomId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    setMessages((data as ChatMessage[]) || []);

    // Mark messages as read
    if (user) {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const init = async () => {
      await Promise.all([fetchGuides(), fetchChatRooms()]);
      setLoading(false);
    };
    init();
  }, [user]);

  // Real-time message subscription
  useEffect(() => {
    if (!activeRoom) return;

    const channel = supabase
      .channel(`chat-${activeRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${activeRoom.id}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Mark as read if it's not from us
          if (user && newMsg.sender_id !== user.id) {
            supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom, user]);

  // Real-time room updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-rooms-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        () => {
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const startChat = async (guide: Guide) => {
    if (!user || !guide.user_id) {
      toast({
        title: language === 'bn' ? 'গাইড উপলব্ধ নয়' : 'Guide not available',
        description: language === 'bn' ? 'এই গাইড এখনও চ্যাট সিস্টেমে যোগ হয়নি' : 'This guide has not joined the chat system yet',
        variant: 'destructive',
      });
      return;
    }

    // Check if room already exists
    const existingRoom = chatRooms.find(
      r => r.guide_id === guide.user_id && r.tourist_id === user.id
    );

    if (existingRoom) {
      openChat(existingRoom, guide);
      return;
    }

    // Create new room
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        tourist_id: user.id,
        guide_id: guide.user_id,
        guide_profile_id: guide.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    const room = data as ChatRoom;
    setChatRooms(prev => [room, ...prev]);
    openChat(room, guide);
  };

  const openChat = async (room: ChatRoom, guide?: Guide) => {
    setActiveRoom(room);
    setActiveGuide(guide || (room.guide_profile_id ? roomGuides[room.guide_profile_id] : null));
    setView('chat');
    await fetchMessages(room.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user || sendingMessage) return;

    setSendingMessage(true);
    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: activeRoom.id,
        sender_id: user.id,
        content,
      });

    if (error) {
      setNewMessage(content);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }

    setSendingMessage(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredGuides = guides.filter(g => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      g.name_en.toLowerCase().includes(query) ||
      g.name_bn.includes(query) ||
      g.specialization_en?.toLowerCase().includes(query) ||
      g.specialization_bn?.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Chat view
  if (view === 'chat' && activeRoom) {
    return (
      <div className="min-h-screen bg-background flex flex-col h-screen">
        {/* Chat Header */}
        <header className="bg-card border-b border-border p-3 sticky top-0 z-10">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button
              onClick={() => { setView('list'); setActiveRoom(null); fetchChatRooms(); }}
              className="p-2 rounded-full hover:bg-muted"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {activeGuide && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden">
                    {activeGuide.image_url ? (
                      <img src={activeGuide.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                        {activeGuide.name_en.charAt(0)}
                      </div>
                    )}
                  </div>
                  <Circle
                    className={`w-3 h-3 absolute -bottom-0.5 -right-0.5 ${
                      activeGuide.is_online ? 'fill-emerald-500 text-emerald-500' : 'fill-muted-foreground text-muted-foreground'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate font-bangla">
                    {language === 'bn' ? activeGuide.name_bn : activeGuide.name_en}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeGuide.is_online
                      ? (language === 'bn' ? 'অনলাইন' : 'Online')
                      : activeGuide.last_seen
                        ? `${language === 'bn' ? 'সর্বশেষ দেখা' : 'Last seen'} ${formatDistanceToNow(parseISO(activeGuide.last_seen), { addSuffix: true })}`
                        : (language === 'bn' ? 'অফলাইন' : 'Offline')
                    }
                  </p>
                </div>
              </div>
            )}
            {activeGuide?.phone && (
              <a href={`tel:${activeGuide.phone}`} className="p-2 rounded-full hover:bg-muted text-primary">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-3 max-w-lg mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-bangla">
                {language === 'bn' ? 'কথোপকথন শুরু করুন!' : 'Start the conversation!'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-bangla">
                {language === 'bn' ? 'আপনার ভ্রমণ সম্পর্কে জিজ্ঞাসা করুন' : 'Ask about your travel plans'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => {
                const isMe = msg.sender_id === user?.id;
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
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
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
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Message Input */}
        <div className="border-t border-border bg-card p-3 sticky bottom-0">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={language === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
              className="flex-1 rounded-full"
              disabled={sendingMessage}
            />
            <Button
              size="icon"
              className="rounded-full flex-shrink-0"
              onClick={sendMessage}
              disabled={!newMessage.trim() || sendingMessage}
            >
              {sendingMessage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Guides list view
  if (view === 'guides') {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button onClick={() => setView('list')} className="p-2 rounded-full hover:bg-muted">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold font-bangla">
              {language === 'bn' ? 'গাইড নির্বাচন করুন' : 'Select a Guide'}
            </h1>
          </div>
        </header>

        <main className="flex-1 max-w-lg mx-auto px-4 py-4 w-full">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'গাইড খুঁজুন...' : 'Search guides...'}
              className="pl-10 rounded-full"
            />
          </div>

          <div className="space-y-3">
            {filteredGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => startChat(guide)}
                className="w-full card-elevated p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                    {guide.image_url ? (
                      <img src={guide.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                        {guide.name_en.charAt(0)}
                      </div>
                    )}
                  </div>
                  <Circle
                    className={`w-3.5 h-3.5 absolute -bottom-0.5 -right-0.5 ${
                      guide.is_online ? 'fill-emerald-500 text-emerald-500' : 'fill-muted-foreground text-muted-foreground'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-bangla truncate">
                    {language === 'bn' ? guide.name_bn : guide.name_en}
                  </p>
                  <p className="text-xs text-muted-foreground font-bangla truncate">
                    {language === 'bn' ? guide.specialization_bn : guide.specialization_en}
                  </p>
                  {guide.rating && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-muted-foreground">{guide.rating}</span>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    guide.is_online ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    {guide.is_online
                      ? (language === 'bn' ? 'অনলাইন' : 'Online')
                      : (language === 'bn' ? 'অফলাইন' : 'Offline')
                    }
                  </span>
                </div>
              </button>
            ))}
            {filteredGuides.length === 0 && (
              <div className="text-center py-8 text-muted-foreground font-bangla">
                {language === 'bn' ? 'কোনো গাইড পাওয়া যায়নি' : 'No guides found'}
              </div>
            )}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Chat rooms list (default view)
  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <header className="bg-gradient-header text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold font-bangla">
              {language === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}
            </h1>
            <p className="text-xs opacity-80 font-bangla">
              {language === 'bn' ? 'স্থানীয় গাইডদের সাথে কথা বলুন' : 'Chat with local guides'}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setView('guides')}
            className="rounded-full"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            {language === 'bn' ? 'নতুন চ্যাট' : 'New Chat'}
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 py-4 w-full">
        {chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg font-bangla mb-2">
              {language === 'bn' ? 'কোনো চ্যাট নেই' : 'No Chats Yet'}
            </h3>
            <p className="text-sm text-muted-foreground font-bangla mb-6 max-w-xs">
              {language === 'bn'
                ? 'একজন স্থানীয় গাইডের সাথে কথা বলুন এবং আপনার ভ্রমণ পরিকল্পনা করুন!'
                : 'Start chatting with a local guide to plan your trip!'}
            </p>
            <Button onClick={() => setView('guides')} className="rounded-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'চ্যাট শুরু করুন' : 'Start a Chat'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {chatRooms.map((room) => {
              const guide = room.guide_profile_id ? roomGuides[room.guide_profile_id] : null;

              return (
                <button
                  key={room.id}
                  onClick={() => openChat(room)}
                  className="w-full card-elevated p-3 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                      {guide?.image_url ? (
                        <img src={guide.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                          {guide?.name_en?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    {guide && (
                      <Circle
                        className={`w-3.5 h-3.5 absolute -bottom-0.5 -right-0.5 ${
                          guide.is_online ? 'fill-emerald-500 text-emerald-500' : 'fill-muted-foreground text-muted-foreground'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate font-bangla">
                        {guide
                          ? (language === 'bn' ? guide.name_bn : guide.name_en)
                          : (language === 'bn' ? 'গাইড' : 'Guide')
                        }
                      </p>
                      {room.last_message_at && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(parseISO(room.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {room.last_message && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {room.last_message}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default LiveChat;
