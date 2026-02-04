import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Loader2, User } from 'lucide-react';
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

interface ReviewSectionProps {
  entityType: 'hotel' | 'restaurant' | 'place' | 'tour_service' | 'local_guide' | 'transport';
  entityId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ entityType, entityId }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [entityId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: language === 'bn' ? 'লগইন করুন' : 'Please login',
        description: language === 'bn' ? 'রিভিউ দিতে লগইন করুন' : 'Login to submit a review',
        variant: 'destructive',
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: language === 'bn' ? 'মন্তব্য লিখুন' : 'Write a comment',
        description: language === 'bn' ? 'আপনার মতামত লিখুন' : 'Please write your feedback',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert([{
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        rating,
        comment: comment.trim(),
        is_approved: false, // Needs admin approval
      }]);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'ধন্যবাদ!' : 'Thank you!',
        description: language === 'bn' 
          ? 'আপনার রিভিউ জমা হয়েছে। অ্যাডমিন অনুমোদনের পর এটি প্রদর্শিত হবে।' 
          : 'Your review has been submitted. It will appear after admin approval.',
      });

      setComment('');
      setRating(5);
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-bangla">
          {language === 'bn' ? 'রিভিউ' : 'Reviews'}
        </h3>
        {averageRating && (
          <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-amber-700">{averageRating}</span>
            <span className="text-xs text-amber-600">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Submit Review Form */}
      <div className="card-elevated p-4 mb-4">
        <p className="text-sm font-medium font-bangla mb-2">
          {language === 'bn' ? 'আপনার রিভিউ দিন' : 'Leave a review'}
        </p>
        
        {/* Rating Stars */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              className="p-1"
            >
              <Star 
                className={`w-6 h-6 transition-colors ${
                  star <= (hoveredRating || rating) 
                    ? 'text-amber-500 fill-amber-500' 
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={language === 'bn' ? 'আপনার মতামত লিখুন...' : 'Write your feedback...'}
            rows={3}
          />
          <Button type="submit" className="w-full gap-2" disabled={submitting}>
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {language === 'bn' ? 'জমা দিন' : 'Submit Review'}
          </Button>
        </form>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="card-elevated p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="card-elevated p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
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
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-elevated p-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-bangla">
            {language === 'bn' ? 'এখনও কোনো রিভিউ নেই' : 'No reviews yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
