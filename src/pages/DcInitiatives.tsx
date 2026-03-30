import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Landmark, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface DcInitiative {
  id: string;
  title_bn: string;
  title_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  status: string | null;
  target_date: string | null;
}

const DcInitiatives: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [initiatives, setInitiatives] = useState<DcInitiative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitiatives = async () => {
      const { data, error } = await supabase
        .from('dc_initiatives')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInitiatives(data);
      }
      setLoading(false);
    };

    fetchInitiatives();
  }, []);

  const getStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { label: { bn: string; en: string }; variant: 'default' | 'secondary' | 'outline' }> = {
      planned: { label: { bn: 'পরিকল্পিত', en: 'Planned' }, variant: 'secondary' },
      ongoing: { label: { bn: 'চলমান', en: 'Ongoing' }, variant: 'default' },
      completed: { label: { bn: 'সম্পন্ন', en: 'Completed' }, variant: 'outline' },
    };

    const config = statusConfig[status || 'planned'] || statusConfig.planned;
    return (
      <Badge variant={config.variant}>
        {language === 'bn' ? config.label.bn : config.label.en}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold font-bangla">
            {language === 'bn' ? 'পৌরসভার উদ্যোগ' : 'Municipality Initiatives'}
          </h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : initiatives.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Landmark className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'কোনো উদ্যোগ পাওয়া যায়নি' : 'No initiatives found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {initiatives.map((initiative) => (
              <div key={initiative.id} className="card-elevated overflow-hidden">
                {initiative.image_url && (
                  <img
                    src={initiative.image_url}
                    alt={language === 'bn' ? initiative.title_bn : initiative.title_en}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold font-bangla flex-1">
                      {language === 'bn' ? initiative.title_bn : initiative.title_en}
                    </h3>
                    {getStatusBadge(initiative.status)}
                  </div>

                  {(initiative.description_bn || initiative.description_en) && (
                    <p className="text-sm text-muted-foreground font-bangla mb-3">
                      {language === 'bn' ? initiative.description_bn : initiative.description_en}
                    </p>
                  )}

                  {initiative.target_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {language === 'bn' ? 'লক্ষ্য তারিখ: ' : 'Target: '}
                        {format(new Date(initiative.target_date), 'dd MMM yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default DcInitiatives;
