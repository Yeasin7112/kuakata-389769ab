import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { MessageCircle, Plus, ThumbsUp, CheckCircle, User, Clock, Filter, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category: string | null;
  is_answered: boolean;
  view_count: number;
  created_at: string;
}

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  is_accepted: boolean;
  is_from_local: boolean;
  upvotes: number;
  created_at: string;
}

const CATEGORIES = [
  { value: 'hotels', label_en: 'Hotels', label_bn: 'হোটেল' },
  { value: 'transport', label_en: 'Transport', label_bn: 'পরিবহন' },
  { value: 'places', label_en: 'Places', label_bn: 'স্থান' },
  { value: 'food', label_en: 'Food', label_bn: 'খাবার' },
  { value: 'general', label_en: 'General', label_bn: 'সাধারণ' },
];

const CommunityQA: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionCategory, setQuestionCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  
  // Answer form
  const [answerContent, setAnswerContent] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [filterCategory]);

  useEffect(() => {
    if (selectedQuestion) {
      fetchAnswers(selectedQuestion.id);
      incrementViewCount(selectedQuestion.id);
    }
  }, [selectedQuestion]);

  const fetchQuestions = async () => {
    let query = supabase
      .from('community_questions')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    
    if (filterCategory !== 'all') {
      query = query.eq('category', filterCategory);
    }
    
    const { data } = await query;
    setQuestions(data || []);
    setLoading(false);
  };

  const fetchAnswers = async (questionId: string) => {
    const { data } = await supabase
      .from('community_answers')
      .select('*')
      .eq('question_id', questionId)
      .eq('is_approved', true)
      .order('is_accepted', { ascending: false })
      .order('upvotes', { ascending: false });
    
    setAnswers(data || []);
    
    if (user) {
      const { data: upvotes } = await supabase
        .from('answer_upvotes')
        .select('answer_id')
        .eq('user_id', user.id);
      
      setUserUpvotes(upvotes?.map(u => u.answer_id) || []);
    }
  };

  const incrementViewCount = async (questionId: string) => {
    // Update view count directly
    const question = questions.find(q => q.id === questionId);
    if (question) {
      await supabase
        .from('community_questions')
        .update({ view_count: question.view_count + 1 })
        .eq('id', questionId);
    }
  };

  const handleAskQuestion = async () => {
    if (!user) {
      toast({
        title: language === 'bn' ? 'লগইন করুন' : 'Please login',
        variant: 'destructive',
      });
      return;
    }

    if (!questionTitle.trim()) {
      toast({
        title: language === 'bn' ? 'প্রশ্ন লিখুন' : 'Enter question',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from('community_questions')
      .insert({
        user_id: user.id,
        title: questionTitle,
        content: questionContent || null,
        category: questionCategory,
      });

    if (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'bn' ? 'জমা হয়েছে!' : 'Submitted!',
        description: language === 'bn' 
          ? 'আপনার প্রশ্ন অ্যাডমিন অনুমোদনের পর দেখা যাবে' 
          : 'Your question will appear after admin approval',
      });
      setShowAskDialog(false);
      setQuestionTitle('');
      setQuestionContent('');
      setQuestionCategory('general');
    }
    
    setSubmitting(false);
  };

  const handleAnswer = async () => {
    if (!user || !selectedQuestion) return;

    if (!answerContent.trim()) {
      toast({
        title: language === 'bn' ? 'উত্তর লিখুন' : 'Enter answer',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from('community_answers')
      .insert({
        question_id: selectedQuestion.id,
        user_id: user.id,
        content: answerContent,
      });

    if (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'bn' ? 'ধন্যবাদ!' : 'Thank you!',
        description: language === 'bn' 
          ? 'আপনার উত্তর অ্যাডমিন অনুমোদনের পর দেখা যাবে' 
          : 'Your answer will appear after admin approval',
      });
      setAnswerContent('');
    }
    
    setSubmitting(false);
  };

  const handleUpvote = async (answerId: string) => {
    if (!user) {
      toast({
        title: language === 'bn' ? 'লগইন করুন' : 'Please login',
        variant: 'destructive',
      });
      return;
    }

    const hasUpvoted = userUpvotes.includes(answerId);

    if (hasUpvoted) {
      await supabase
        .from('answer_upvotes')
        .delete()
        .eq('answer_id', answerId)
        .eq('user_id', user.id);
      
      setUserUpvotes(prev => prev.filter(id => id !== answerId));
      setAnswers(prev => prev.map(a => 
        a.id === answerId ? { ...a, upvotes: a.upvotes - 1 } : a
      ));
    } else {
      await supabase
        .from('answer_upvotes')
        .insert({ answer_id: answerId, user_id: user.id });
      
      setUserUpvotes(prev => [...prev, answerId]);
      setAnswers(prev => prev.map(a => 
        a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
      ));
    }
  };

  const getCategoryLabel = (category: string | null) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? (language === 'bn' ? cat.label_bn : cat.label_en) : (language === 'bn' ? 'সাধারণ' : 'General');
  };

  // Question Detail View
  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader 
          title={language === 'bn' ? 'প্রশ্ন' : 'Question'} 
          showBack
          onBack={() => setSelectedQuestion(null)}
        />
        
        <main className="container mx-auto px-4 py-4">
          {/* Question */}
          <div className="card-elevated p-4 mb-4">
            <Badge variant="outline" className="mb-2">
              {getCategoryLabel(selectedQuestion.category)}
            </Badge>
            <h2 className="font-bold text-lg font-bangla mb-2">{selectedQuestion.title}</h2>
            {selectedQuestion.content && (
              <p className="text-sm text-muted-foreground font-bangla mb-3">
                {selectedQuestion.content}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(selectedQuestion.created_at), { addSuffix: true })}
              </span>
              <span>{selectedQuestion.view_count} {language === 'bn' ? 'বার দেখা হয়েছে' : 'views'}</span>
            </div>
          </div>

          {/* Answer Form */}
          {user && (
            <div className="card-elevated p-4 mb-4">
              <h3 className="font-bold font-bangla mb-2">
                {language === 'bn' ? 'আপনার উত্তর' : 'Your Answer'}
              </h3>
              <Textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder={language === 'bn' ? 'এখানে উত্তর লিখুন...' : 'Write your answer here...'}
                rows={3}
                className="mb-3"
              />
              <Button onClick={handleAnswer} disabled={submitting} className="gap-2">
                <Send className="w-4 h-4" />
                {submitting ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'উত্তর দিন' : 'Submit Answer')}
              </Button>
            </div>
          )}

          {/* Answers */}
          <h3 className="font-bold font-bangla mb-3">
            {language === 'bn' ? 'উত্তরসমূহ' : 'Answers'} ({answers.length})
          </h3>
          
          {answers.length > 0 ? (
            <div className="space-y-3">
              {answers.map((answer) => (
                <div 
                  key={answer.id} 
                  className={`card-elevated p-4 ${answer.is_accepted ? 'ring-2 ring-green-500' : ''}`}
                >
                  {answer.is_accepted && (
                    <div className="flex items-center gap-1 text-green-600 text-sm mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-bangla">{language === 'bn' ? 'গৃহীত উত্তর' : 'Accepted Answer'}</span>
                    </div>
                  )}
                  
                  <p className="text-sm font-bangla mb-3">{answer.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      {answer.is_from_local && (
                        <Badge variant="secondary" className="text-xs">
                          {language === 'bn' ? 'স্থানীয়' : 'Local'}
                        </Badge>
                      )}
                      <span>{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleUpvote(answer.id)}
                      className={`flex items-center gap-1 text-sm ${userUpvotes.includes(answer.id) ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${userUpvotes.includes(answer.id) ? 'fill-current' : ''}`} />
                      <span>{answer.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elevated p-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-bangla">
                {language === 'bn' ? 'এখনো কোনো উত্তর নেই' : 'No answers yet'}
              </p>
            </div>
          )}
        </main>
        
        <BottomNav />
      </div>
    );
  }

  // Questions List View
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={language === 'bn' ? 'সম্প্রদায় প্রশ্নোত্তর' : 'Community Q&A'} />
      
      <main className="container mx-auto px-4 py-4">
        {/* Ask Question */}
        <Dialog open={showAskDialog} onOpenChange={setShowAskDialog}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 gap-2">
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'প্রশ্ন করুন' : 'Ask Question'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bangla">
                {language === 'bn' ? 'নতুন প্রশ্ন' : 'New Question'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium font-bangla">
                  {language === 'bn' ? 'প্রশ্ন *' : 'Question *'}
                </label>
                <Input 
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Write your question...'}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium font-bangla">
                  {language === 'bn' ? 'বিস্তারিত (ঐচ্ছিক)' : 'Details (optional)'}
                </label>
                <Textarea 
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder={language === 'bn' ? 'আরও তথ্য দিন...' : 'Add more details...'}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium font-bangla">
                  {language === 'bn' ? 'বিভাগ' : 'Category'}
                </label>
                <Select value={questionCategory} onValueChange={setQuestionCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {language === 'bn' ? cat.label_bn : cat.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleAskQuestion} disabled={submitting} className="w-full">
                {submitting ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'প্রশ্ন করুন' : 'Ask Question')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            {language === 'bn' ? 'সব' : 'All'}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterCategory === cat.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              {language === 'bn' ? cat.label_bn : cat.label_en}
            </button>
          ))}
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card-elevated p-4 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((question) => (
              <div 
                key={question.id} 
                className="card-elevated p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedQuestion(question)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(question.category)}
                      </Badge>
                      {question.is_answered && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <h3 className="font-bold font-bangla line-clamp-2">{question.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span>{question.view_count} {language === 'bn' ? 'দেখা' : 'views'}</span>
                      <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-bold font-bangla mb-2">
              {language === 'bn' ? 'কোনো প্রশ্ন নেই' : 'No Questions'}
            </h3>
            <p className="text-sm text-muted-foreground font-bangla">
              {language === 'bn' ? 'প্রথম প্রশ্ন করুন!' : 'Be the first to ask!'}
            </p>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default CommunityQA;
