import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageCircle, CheckCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  is_answered: boolean;
  is_approved: boolean;
  view_count: number;
  created_at: string;
}

interface Answer {
  id: string;
  question_id: string;
  content: string;
  is_accepted: boolean;
  is_from_local: boolean;
  is_approved: boolean;
  upvotes: number;
  created_at: string;
}

const CommunityQAManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'questions' | 'answers'>('questions');

  useEffect(() => {
    fetchQuestions();
    fetchAnswers();
  }, []);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('community_questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    setQuestions(data || []);
    setLoading(false);
  };

  const fetchAnswers = async () => {
    const { data } = await supabase
      .from('community_answers')
      .select('*')
      .order('created_at', { ascending: false });
    
    setAnswers(data || []);
  };

  const toggleQuestionApproval = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('community_questions')
      .update({ is_approved: !current })
      .eq('id', id);
    
    if (!error) {
      setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, is_approved: !current } : q
      ));
      toast({ title: !current ? 'Approved' : 'Unapproved' });
    }
  };

  const toggleAnswerApproval = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('community_answers')
      .update({ is_approved: !current })
      .eq('id', id);
    
    if (!error) {
      setAnswers(prev => prev.map(a => 
        a.id === id ? { ...a, is_approved: !current } : a
      ));
      toast({ title: !current ? 'Approved' : 'Unapproved' });
    }
  };

  const markAsLocal = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('community_answers')
      .update({ is_from_local: !current })
      .eq('id', id);
    
    if (!error) {
      setAnswers(prev => prev.map(a => 
        a.id === id ? { ...a, is_from_local: !current } : a
      ));
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('This will also delete all answers. Continue?')) return;
    
    const { error } = await supabase
      .from('community_questions')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast({ title: 'Deleted' });
    }
  };

  const deleteAnswer = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    
    const { error } = await supabase
      .from('community_answers')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setAnswers(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Deleted' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Community Q&A
        </h2>
        <div className="flex gap-2">
          <Button 
            variant={tab === 'questions' ? 'default' : 'outline'} 
            onClick={() => setTab('questions')}
          >
            Questions ({questions.filter(q => !q.is_approved).length} pending)
          </Button>
          <Button 
            variant={tab === 'answers' ? 'default' : 'outline'} 
            onClick={() => setTab('answers')}
          >
            Answers ({answers.filter(a => !a.is_approved).length} pending)
          </Button>
        </div>
      </div>

      {tab === 'questions' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id} className={!question.is_approved ? 'bg-yellow-50' : ''}>
                <TableCell>
                  <div className="max-w-md">
                    <p className="font-medium line-clamp-1">{question.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{question.category || 'general'}</TableCell>
                <TableCell>{question.view_count}</TableCell>
                <TableCell>
                  <Switch 
                    checked={question.is_approved} 
                    onCheckedChange={() => toggleQuestionApproval(question.id, question.is_approved)} 
                  />
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => deleteQuestion(question.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Answer</TableHead>
              <TableHead>Upvotes</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {answers.map((answer) => (
              <TableRow key={answer.id} className={!answer.is_approved ? 'bg-yellow-50' : ''}>
                <TableCell>
                  <div className="max-w-md">
                    <p className="line-clamp-2">{answer.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{answer.upvotes}</TableCell>
                <TableCell>
                  <Switch 
                    checked={answer.is_from_local} 
                    onCheckedChange={() => markAsLocal(answer.id, answer.is_from_local)} 
                  />
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={answer.is_approved} 
                    onCheckedChange={() => toggleAnswerApproval(answer.id, answer.is_approved)} 
                  />
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => deleteAnswer(answer.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CommunityQAManager;
