import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import PlaceImagesManager from '@/components/admin/PlaceImagesManager';
import { Plus, Pencil, Trash2, Loader2, X, Images } from 'lucide-react';
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

interface Place {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  distance_from_beach: string | null;
  rating: number | null;
  category: string | null;
  is_active: boolean | null;
}

const PlacesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    description_bn: '',
    description_en: '',
    image_url: '',
    distance_from_beach: '',
    rating: 0,
    category: 'tourist_spot',
    is_active: true,
  });

  const fetchPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaces(data || []);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlace) {
        const { error } = await supabase
          .from('places')
          .update(formData)
          .eq('id', editingPlace.id);
        
        if (error) throw error;
        
        toast({
          title: language === 'bn' ? 'সফল!' : 'Success!',
          description: language === 'bn' ? 'স্থান আপডেট হয়েছে' : 'Place updated',
        });
      } else {
        const { error } = await supabase
          .from('places')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: language === 'bn' ? 'সফল!' : 'Success!',
          description: language === 'bn' ? 'নতুন স্থান যোগ হয়েছে' : 'New place added',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchPlaces();
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
        .from('places')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'স্থান মুছে ফেলা হয়েছে' : 'Place deleted',
      });
      
      fetchPlaces();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (place: Place) => {
    setEditingPlace(place);
    setFormData({
      name_bn: place.name_bn,
      name_en: place.name_en,
      description_bn: place.description_bn || '',
      description_en: place.description_en || '',
      image_url: place.image_url || '',
      distance_from_beach: place.distance_from_beach || '',
      rating: place.rating || 0,
      category: place.category || 'tourist_spot',
      is_active: place.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPlace(null);
    setFormData({
      name_bn: '',
      name_en: '',
      description_bn: '',
      description_en: '',
      image_url: '',
      distance_from_beach: '',
      rating: 0,
      category: 'tourist_spot',
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-bangla">
            {language === 'bn' ? 'দর্শনীয় স্থান' : 'Tourist Spots'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'সকল দর্শনীয় স্থান পরিচালনা করুন' : 'Manage all tourist spots'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}
        </Button>
      </div>

      <div className="grid gap-4">
        {places.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <p className="text-muted-foreground">
              {language === 'bn' ? 'কোনো স্থান পাওয়া যায়নি' : 'No places found'}
            </p>
          </div>
        ) : (
          places.map((place) => (
            <div key={place.id} className="card-elevated p-4">
              <div className="flex items-start gap-4">
                {place.image_url && (
                  <img 
                    src={place.image_url} 
                    alt={place.name_en}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground font-bangla">
                        {language === 'bn' ? place.name_bn : place.name_en}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {language === 'bn' ? place.description_bn : place.description_en}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        place.is_active 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {place.is_active 
                          ? (language === 'bn' ? 'সক্রিয়' : 'Active')
                          : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')
                        }
                      </span>
                      <button
                        onClick={() => openEditDialog(place)}
                        className="p-2 rounded-lg hover:bg-muted"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(place.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {editingPlace 
                ? (language === 'bn' ? 'স্থান সম্পাদনা' : 'Edit Place')
                : (language === 'bn' ? 'নতুন স্থান যোগ করুন' : 'Add New Place')
              }
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}</Label>
                <Input
                  value={formData.name_bn}
                  onChange={(e) => setFormData({...formData, name_bn: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'}</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}</Label>
              <Textarea
                value={formData.description_bn}
                onChange={(e) => setFormData({...formData, description_bn: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                rows={3}
              />
            </div>

            <ImageUpload
              currentImage={formData.image_url}
              onImageUploaded={(url) => setFormData({...formData, image_url: url})}
              folder="places"
            />

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'অথবা ছবির URL' : 'Or Image URL'}</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist_spot">{language === 'bn' ? 'দর্শনীয় স্থান' : 'Tourist Spot'}</SelectItem>
                  <SelectItem value="beach">{language === 'bn' ? 'সমুদ্র সৈকত' : 'Beach'}</SelectItem>
                  <SelectItem value="nature">{language === 'bn' ? 'প্রকৃতি' : 'Nature'}</SelectItem>
                  <SelectItem value="religious">{language === 'bn' ? 'ধর্মীয়' : 'Religious'}</SelectItem>
                  <SelectItem value="historical">{language === 'bn' ? 'ঐতিহাসিক' : 'Historical'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'সৈকত থেকে দূরত্ব' : 'Distance from Beach'}</Label>
                <Input
                  value={formData.distance_from_beach}
                  onChange={(e) => setFormData({...formData, distance_from_beach: e.target.value})}
                  placeholder="e.g., 2.5 km"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'রেটিং' : 'Rating'}</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
            </div>

            {editingPlace && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Images className="w-4 h-4" />
                  <span className="font-medium">
                    {language === 'bn' ? 'অতিরিক্ত ছবি' : 'Additional Images'}
                  </span>
                </div>
                <PlaceImagesManager placeId={editingPlace.id} />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" className="flex-1">
                {editingPlace 
                  ? (language === 'bn' ? 'আপডেট' : 'Update')
                  : (language === 'bn' ? 'যোগ করুন' : 'Add')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlacesManager;
