import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { format } from 'date-fns';

interface Notice {
  id: string;
  title_bn: string;
  title_en: string;
  content_bn: string | null;
  content_en: string | null;
  type: string | null;
  created_at: string;
}

const LiveNotices: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setNotices(data);
    setLoading(false);
  };

  const getTypeConfig = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'warning': return { icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-l-orange-500' };
      case 'success': return { icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-100', text: 'text-green-600', border: 'border-l-green-500' };
      case 'alert': return { icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-red-100', text: 'text-red-600', border: 'border-l-red-500' };
      default: return { icon: <Info className="w-5 h-5" />, bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-l-blue-500' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '🔔 লাইভ নোটিশ' : '🔔 Live Notices'}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {notices.map((notice) => {
          const config = getTypeConfig(notice.type);
          return (
            <div key={notice.id} className={`card-elevated p-4 border-l-4 ${config.border}`}>
              <div className="flex items-start gap-3">
                <div className={`${config.bg} ${config.text} p-2 rounded-lg`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold font-bangla">
                    {language === 'bn' ? notice.title_bn : notice.title_en}
                  </h3>
                  {(notice.content_bn || notice.content_en) && (
                    <p className="text-sm text-muted-foreground mt-1 font-bangla">
                      {language === 'bn' ? notice.content_bn : notice.content_en}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(notice.created_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {notices.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'কোনো নোটিশ নেই' : 'No notices available'}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LiveNotices;
