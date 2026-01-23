import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Star, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  rating: number | null;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

const ReviewsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'রিভিউ অনুমোদিত' : 'Review approved',
      });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'রিভিউ প্রত্যাখ্যাত' : 'Review rejected',
      });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'রিভিউ মুছে ফেলা হয়েছে' : 'Review deleted',
      });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'hotel': return language === 'bn' ? 'হোটেল' : 'Hotel';
      case 'restaurant': return language === 'bn' ? 'রেস্তোরাঁ' : 'Restaurant';
      case 'place': return language === 'bn' ? 'স্থান' : 'Place';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-bangla">
          {language === 'bn' ? 'রিভিউ ম্যানেজমেন্ট' : 'Reviews Management'}
        </h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Filter className="w-4 h-4 inline-block mr-1" />
            {f === 'pending' 
              ? (language === 'bn' ? 'অপেক্ষমান' : 'Pending')
              : f === 'approved'
              ? (language === 'bn' ? 'অনুমোদিত' : 'Approved')
              : (language === 'bn' ? 'সব' : 'All')
            }
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground font-bangla">
            {language === 'bn' ? 'কোনো রিভিউ নেই' : 'No reviews found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="card-elevated p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      review.entity_type === 'hotel' 
                        ? 'bg-blue-100 text-blue-700'
                        : review.entity_type === 'restaurant'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {getEntityLabel(review.entity_type)}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`w-3 h-3 ${
                            star <= (review.rating || 0) 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      review.is_approved 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {review.is_approved 
                        ? (language === 'bn' ? 'অনুমোদিত' : 'Approved')
                        : (language === 'bn' ? 'অপেক্ষমান' : 'Pending')
                      }
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!review.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(review.id)}
                      className="text-success hover:text-success"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {review.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(review.id)}
                      className="text-warning hover:text-warning"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(review.id)}
                    className="text-destructive hover:text-destructive"
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

export default ReviewsManager;
