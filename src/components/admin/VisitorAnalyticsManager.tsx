import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Loader2, Eye, Monitor, Smartphone, Tablet, RefreshCw, ChevronDown, ChevronUp, Activity, Users, MousePointerClick, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface VisitorSession {
  id: string;
  visitor_id: string;
  started_at: string;
  last_active_at: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_width: number | null;
  screen_height: number | null;
  language: string | null;
  referrer: string | null;
  user_agent: string | null;
  is_logged_in: boolean;
  user_id: string | null;
}

interface VisitorEvent {
  id: string;
  session_id: string;
  event_type: string;
  page_path: string | null;
  page_title: string | null;
  element_text: string | null;
  element_type: string | null;
  created_at: string;
}

const VisitorAnalyticsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, VisitorEvent[]>>({});
  const [eventsLoading, setEventsLoading] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('visitor_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const fetchEvents = async (sessionId: string) => {
    if (events[sessionId]) {
      setExpandedSession(expandedSession === sessionId ? null : sessionId);
      return;
    }
    setEventsLoading(sessionId);
    setExpandedSession(sessionId);

    const { data, error } = await supabase
      .from('visitor_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!error) {
      setEvents((prev) => ({ ...prev, [sessionId]: data || [] }));
    }
    setEventsLoading(null);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const DeviceIcon = ({ type }: { type: string | null }) => {
    if (type === 'mobile') return <Smartphone className="w-4 h-4" />;
    if (type === 'tablet') return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  // Stats
  const today = new Date().toDateString();
  const todaySessions = sessions.filter((s) => new Date(s.started_at).toDateString() === today).length;
  const uniqueVisitors = new Set(sessions.map((s) => s.visitor_id)).size;
  const mobileCount = sessions.filter((s) => s.device_type === 'mobile').length;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'bn' ? 'ভিজিটর অ্যানালিটিক্স' : 'Visitor Analytics'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'bn' ? 'সাইটে কে কী করছে দেখুন' : 'See who visits and what they do'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSessions}>
          <RefreshCw className="w-4 h-4 mr-1" /> {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{todaySessions}</p>
            <p className="text-xs text-muted-foreground">{language === 'bn' ? 'আজকের সেশন' : "Today's Sessions"}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{uniqueVisitors}</p>
            <p className="text-xs text-muted-foreground">{language === 'bn' ? 'ইউনিক ভিজিটর' : 'Unique Visitors'}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোট সেশন' : 'Total Sessions'}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{mobileCount}</p>
            <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোবাইল ভিজিটর' : 'Mobile Visitors'}</p>
          </div>
        </Card>
      </div>

      {/* Sessions Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>{language === 'bn' ? 'ডিভাইস' : 'Device'}</TableHead>
              <TableHead>{language === 'bn' ? 'ব্রাউজার / ওএস' : 'Browser / OS'}</TableHead>
              <TableHead className="hidden md:table-cell">{language === 'bn' ? 'স্ক্রিন' : 'Screen'}</TableHead>
              <TableHead className="hidden md:table-cell">{language === 'bn' ? 'ভাষা' : 'Language'}</TableHead>
              <TableHead>{language === 'bn' ? 'সময়' : 'Time'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {language === 'bn' ? 'কোনো ভিজিটর ডেটা নেই' : 'No visitor data yet'}
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <React.Fragment key={session.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => fetchEvents(session.id)}
                  >
                    <TableCell>
                      {expandedSession === session.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DeviceIcon type={session.device_type} />
                        <span className="capitalize text-sm">{session.device_type || 'unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="font-medium">{session.browser}</span>
                      <span className="text-muted-foreground"> / {session.os}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {session.screen_width}×{session.screen_height}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {session.language}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(session.started_at), 'dd MMM HH:mm')}
                    </TableCell>
                  </TableRow>

                  {/* Expanded events */}
                  {expandedSession === session.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30 p-0">
                        <div className="p-4 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                            <MousePointerClick className="w-3 h-3" />
                            {language === 'bn' ? 'কার্যকলাপ' : 'Activity Timeline'}
                          </p>
                          {eventsLoading === session.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto" />
                          ) : (events[session.id] || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {language === 'bn' ? 'কোনো ইভেন্ট নেই' : 'No events recorded'}
                            </p>
                          ) : (
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                              {(events[session.id] || []).map((evt) => (
                                <div key={evt.id} className="flex items-start gap-3 text-sm py-1 border-b border-border/50 last:border-0">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                                    {format(new Date(evt.created_at), 'HH:mm:ss')}
                                  </span>
                                  <Badge variant={evt.event_type === 'page_view' ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                                    {evt.event_type === 'page_view' ? '👁 View' : '👆 Click'}
                                  </Badge>
                                  <div className="min-w-0">
                                    <span className="font-medium text-primary">{evt.page_path}</span>
                                    {evt.element_text && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        "{evt.element_text}" <span className="opacity-60">({evt.element_type})</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {session.referrer && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">Referrer:</span> {session.referrer}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VisitorAnalyticsManager;
