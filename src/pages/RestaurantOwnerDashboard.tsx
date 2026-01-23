import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ImageUpload from '@/components/ImageUpload';
import CreateRestaurantForm from '@/components/CreateRestaurantForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Utensils,
  Eye,
  EyeOff,
  Star,
  Leaf
} from 'lucide-react';

interface FoodItem {
  id: string;
  restaurant_id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  price: number;
  category: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_popular: boolean;
  is_active: boolean;
}

const RestaurantOwnerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    description_bn: '',
    description_en: '',
    image_url: '',
    price: 0,
    category: 'main_course',
    is_available: true,
    is_vegetarian: false,
    is_popular: false,
    is_active: true,
  });

  const categories = [
    { value: 'appetizer', labelBn: 'এপিটাইজার', labelEn: 'Appetizer' },
    { value: 'main_course', labelBn: 'মেইন কোর্স', labelEn: 'Main Course' },
    { value: 'seafood', labelBn: 'সামুদ্রিক খাবার', labelEn: 'Seafood' },
    { value: 'rice', labelBn: 'ভাত', labelEn: 'Rice' },
    { value: 'biryani', labelBn: 'বিরিয়ানি', labelEn: 'Biryani' },
    { value: 'drinks', labelBn: 'পানীয়', labelEn: 'Drinks' },
    { value: 'dessert', labelBn: 'ডেজার্ট', labelEn: 'Dessert' },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRestaurantAndFood();
  }, [user]);

  const fetchRestaurantAndFood = async () => {
    if (!user) return;

    try {
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (restaurantData) {
        setRestaurant(restaurantData);

        const { data: foodData } = await supabase
          .from('food_items')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .order('created_at', { ascending: false });

        setFoodItems(foodData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !user) return;

    try {
      const itemData = {
        ...formData,
        restaurant_id: restaurant.id,
        owner_id: user.id,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('food_items')
          .update(itemData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('food_items')
          .insert([itemData]);
        if (error) throw error;
      }

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn'
          ? (editingItem ? 'আইটেম আপডেট হয়েছে' : 'নতুন আইটেম যোগ হয়েছে')
          : (editingItem ? 'Item updated' : 'New item added'),
      });

      setIsDialogOpen(false);
      resetForm();
      fetchRestaurantAndFood();
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
      const { error } = await supabase.from('food_items').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'আইটেম মুছে ফেলা হয়েছে' : 'Item deleted',
      });
      fetchRestaurantAndFood();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleAvailability = async (item: FoodItem) => {
    try {
      const { error } = await supabase
        .from('food_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);
      if (error) throw error;
      fetchRestaurantAndFood();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name_bn: item.name_bn,
      name_en: item.name_en,
      description_bn: item.description_bn || '',
      description_en: item.description_en || '',
      image_url: item.image_url || '',
      price: item.price,
      category: item.category,
      is_available: item.is_available,
      is_vegetarian: item.is_vegetarian,
      is_popular: item.is_popular,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name_bn: '',
      name_en: '',
      description_bn: '',
      description_en: '',
      image_url: '',
      price: 0,
      category: 'main_course',
      is_available: true,
      is_vegetarian: false,
      is_popular: false,
      is_active: true,
    });
  };

  const filteredItems = foodItems.filter(item => {
    if (filter === 'available') return item.is_available;
    if (filter === 'unavailable') return !item.is_available;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show create restaurant form if no restaurant exists
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <CreateRestaurantForm onRestaurantCreated={fetchRestaurantAndFood} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Restaurant Info */}
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-category-restaurant/20 flex items-center justify-center overflow-hidden">
              {restaurant.image_url ? (
                <img src={restaurant.image_url} alt={restaurant.name_en} className="w-full h-full object-cover" />
              ) : (
                <Utensils className="w-8 h-8 text-category-restaurant" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold font-bangla">
                {language === 'bn' ? restaurant.name_bn : restaurant.name_en}
              </h1>
              <p className="text-sm text-muted-foreground font-bangla">
                {language === 'bn' ? 'রেস্টুরেন্ট মালিক ড্যাশবোর্ড' : 'Restaurant Owner Dashboard'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter + Add */}
        <div className="flex gap-2 mb-4">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
              <SelectItem value="available">{language === 'bn' ? 'উপলব্ধ' : 'Available'}</SelectItem>
              <SelectItem value="unavailable">{language === 'bn' ? 'অনুপলব্ধ' : 'Unavailable'}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            {language === 'bn' ? 'নতুন আইটেম' : 'Add Item'}
          </Button>
        </div>

        {/* Food Items Grid */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="card-elevated p-8 text-center">
              <Utensils className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground font-bangla">
                {language === 'bn' ? 'কোনো খাবার নেই' : 'No food items'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="card-elevated p-3">
                <div className="flex gap-3">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name_en}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold font-bangla truncate">
                            {language === 'bn' ? item.name_bn : item.name_en}
                          </h3>
                          {item.is_vegetarian && <Leaf className="w-3.5 h-3.5 text-success" />}
                          {item.is_popular && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-sm text-primary font-semibold">৳{item.price}</p>
                      </div>
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`p-2 rounded-lg ${
                          item.is_available
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {item.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{item.category.replace('_', ' ')}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openEditDialog(item)}
                        className="p-1.5 rounded bg-muted hover:bg-muted/80"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Food Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {editingItem
                ? (language === 'bn' ? 'আইটেম সম্পাদনা' : 'Edit Item')
                : (language === 'bn' ? 'নতুন আইটেম যোগ করুন' : 'Add New Item')
              }
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              currentImage={formData.image_url}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
              folder="food"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}</Label>
                <Input
                  value={formData.name_bn}
                  onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'}</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}</Label>
              <Textarea
                value={formData.description_bn}
                onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'মূল্য (৳)' : 'Price (৳)'}</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {language === 'bn' ? cat.labelBn : cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(c) => setFormData({ ...formData, is_available: c })}
                />
                <Label className="text-sm font-bangla">{language === 'bn' ? 'উপলব্ধ' : 'Available'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_vegetarian}
                  onCheckedChange={(c) => setFormData({ ...formData, is_vegetarian: c })}
                />
                <Label className="text-sm font-bangla">{language === 'bn' ? 'নিরামিষ' : 'Veg'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_popular}
                  onCheckedChange={(c) => setFormData({ ...formData, is_popular: c })}
                />
                <Label className="text-sm font-bangla">{language === 'bn' ? 'জনপ্রিয়' : 'Popular'}</Label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              {editingItem
                ? (language === 'bn' ? 'আপডেট করুন' : 'Update')
                : (language === 'bn' ? 'যোগ করুন' : 'Add Item')
              }
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default RestaurantOwnerDashboard;
