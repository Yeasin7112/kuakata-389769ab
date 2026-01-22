import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle, ChevronRight } from 'lucide-react';

const NoticeBar: React.FC = () => {
  const { language } = useLanguage();

  const notice = language === 'bn' 
    ? 'আগামীকাল বিকেল ৫টায় উচ্চ জোয়ার প্রত্যাশিত। সমুদ্র সৈকতে সতর্ক থাকুন।'
    : 'High tide expected tomorrow at 5 PM. Stay cautious at the beach.';

  return (
    <div className="px-4 py-2">
      <div className="card-elevated overflow-hidden">
        <div className="flex items-center gap-3 p-3 bg-warning/10 border-l-4 border-warning">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <p className="flex-1 text-sm text-foreground font-bangla line-clamp-2">
            {notice}
          </p>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default NoticeBar;
