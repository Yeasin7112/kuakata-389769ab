import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Loader2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Complaint {
  id: string;
  user_id: string | null;
  subject_bn: string | null;
  subject_en: string | null;
  description_bn: string | null;
  description_en: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
}

const ComplaintsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'rejected'>('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setComplaints(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status, admin_response: response || null })
        .eq('id', id);
      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'আপডেট হয়েছে' : 'Updated successfully',
      });
      setIsDialogOpen(false);
      setResponse('');
      fetchComplaints();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaint.admin_response || '');
    setIsDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      resolved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    return styles[status] || styles.pending;
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-bangla flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {language === 'bn' ? 'অভিযোগ ও পরামর্শ' : 'Complaints & Suggestions'}
        </h2>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
            <SelectItem value="pending">{language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</SelectItem>
            <SelectItem value="resolved">{language === 'bn' ? 'সমাধান' : 'Resolved'}</SelectItem>
            <SelectItem value="rejected">{language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground font-bangla">
            {language === 'bn' ? 'কোনো অভিযোগ নেই' : 'No complaints'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="card-elevated p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(complaint.status)}
                    <h3 className="font-semibold font-bangla">
                      {language === 'bn' ? complaint.subject_bn : complaint.subject_en}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 font-bangla">
                    {language === 'bn' ? complaint.description_bn : complaint.description_en}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <button
                    onClick={() => openDetail(complaint)}
                    className="p-2 rounded bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {language === 'bn' ? 'অভিযোগ বিস্তারিত' : 'Complaint Details'}
            </DialogTitle>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  {language === 'bn' ? 'বিষয়' : 'Subject'}
                </h4>
                <p className="font-bangla">
                  {language === 'bn' ? selectedComplaint.subject_bn : selectedComplaint.subject_en}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">
                  {language === 'bn' ? 'বিস্তারিত' : 'Description'}
                </h4>
                <p className="text-muted-foreground font-bangla text-sm whitespace-pre-line">
                  {language === 'bn' ? selectedComplaint.description_bn : selectedComplaint.description_en}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">
                  {language === 'bn' ? 'প্রশাসনের উত্তর' : 'Admin Response'}
                </h4>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={language === 'bn' ? 'উত্তর লিখুন...' : 'Write response...'}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleStatusUpdate(selectedComplaint.id, 'resolved')}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'সমাধান' : 'Resolve'}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleStatusUpdate(selectedComplaint.id, 'rejected')}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'প্রত্যাখ্যান' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsManager;