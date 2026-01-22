import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface Notice {
  id: string;
  title_bn: string;
  title_en: string;
  content_bn: string | null;
  content_en: string | null;
  type: string | null;
}

const NoticeBar: React.FC = () => {
  const { language } = useLanguage();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      const { data } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setNotice(data);
      }
    };
    
    fetchNotice();
  }, []);

  if (!notice) return null;

  const isWarning = notice.type === 'warning' || notice.type === 'alert';

  return (
    <div className="px-4 py-2">
      <div className="card-elevated overflow-hidden">
        <div className={`flex items-center gap-3 p-3 border-l-4 ${
          isWarning ? 'bg-warning/10 border-warning' : 'bg-primary/10 border-primary'
        }`}>
          <div className="flex-shrink-0">
            <AlertCircle className={`w-5 h-5 ${isWarning ? 'text-warning' : 'text-primary'}`} />
          </div>
          <p className="flex-1 text-sm text-foreground font-bangla line-clamp-2">
            {language === 'bn' ? notice.content_bn : notice.content_en}
          </p>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default NoticeBar;
