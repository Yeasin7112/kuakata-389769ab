import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ReviewSection from '@/components/ReviewSection';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Star, 
  Phone,
  MapPin,
  Utensils,
  Share2,
  Heart,
  Clock,
  Leaf,
  Flame,
  ImageIcon
} from 'lucide-react';

interface Restaurant {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  rating: number | null;
  price_range: string | null;
  phone: string | null;
  address_bn: string | null;
  address_en: string | null;
  cuisine_type: string | null;
}

interface FoodItem {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_available: boolean | null;
  is_popular: boolean | null;
  is_vegetarian: boolean | null;
}

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;
      
      const [restaurantRes, foodRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', id).single(),
        supabase.from('food_items').select('*').eq('restaurant_id', id).eq('is_active', true).order('category'),
      ]);
      
      if (restaurantRes.data && !restaurantRes.error) {
        setRestaurant(restaurantRes.data);
      }
      if (foodRes.data && !foodRes.error) {
        setFoodItems(foodRes.data);
      }
      setLoading(false);
    };

    fetchRestaurant();
  }, [id]);

  const categories = ['all', ...Array.from(new Set(foodItems.map(f => f.category).filter(Boolean)))];
  const filteredFood = selectedCategory === 'all' 
    ? foodItems 
    : foodItems.filter(f => f.category === selectedCategory);

  const handleCall = () => {
    if (restaurant?.phone) {
      window.open(`tel:${restaurant.phone}`, '_self');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="animate-pulse p-4 max-w-lg mx-auto">
          <div className="h-64 bg-muted rounded-2xl mb-4" />
          <div className="h-8 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="p-8 text-center">
          <p className="text-muted-foreground font-bangla">
            {language === 'bn' ? 'রেস্টুরেন্ট পাওয়া যায়নি' : 'Restaurant not found'}
          </p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            {language === 'bn' ? 'ফিরে যান' : 'Go Back'}
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image */}
      <div className="relative">
        {restaurant.image_url ? (
          <img 
            src={restaurant.image_url} 
            alt={language === 'bn' ? restaurant.name_bn : restaurant.name_en}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-gradient-header flex items-center justify-center">
            <Utensils className="w-16 h-16 text-white/50" />
          </div>
        )}
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-full backdrop-blur-sm ${isSaved ? 'bg-red-500 text-white' : 'bg-black/30 text-white'}`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {restaurant.price_range && (
          <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {restaurant.price_range}
          </div>
        )}
      </div>

      {/* Content */}
      <main className="px-4 -mt-6 relative z-10 max-w-lg mx-auto">
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold font-bangla">
                {language === 'bn' ? restaurant.name_bn : restaurant.name_en}
              </h1>
              {restaurant.cuisine_type && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Utensils className="w-3 h-3" />
                  {restaurant.cuisine_type}
                </span>
              )}
            </div>
            {restaurant.rating && (
              <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-amber-700">{restaurant.rating}</span>
              </div>
            )}
          </div>

          {(restaurant.address_bn || restaurant.address_en) && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-bangla">
                {language === 'bn' ? restaurant.address_bn : restaurant.address_en}
              </span>
            </div>
          )}

          <p className="text-sm text-foreground font-bangla leading-relaxed mb-4">
            {language === 'bn' ? restaurant.description_bn : restaurant.description_en}
          </p>

          {/* Contact Info */}
          {restaurant.phone && (
            <div className="pt-3 border-t border-border">
              <button 
                onClick={handleCall}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="w-4 h-4" />
                {restaurant.phone}
              </button>
            </div>
          )}
        </div>

        {/* Food Menu Section */}
        {foodItems.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold font-bangla mb-3">
              {language === 'bn' ? '🍽️ খাবার মেনু' : '🍽️ Food Menu'}
            </h2>

            {/* Category Filter */}
            {categories.length > 2 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {cat === 'all' ? (language === 'bn' ? 'সব' : 'All') : cat}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {filteredFood.map((item) => (
                <div key={item.id} className={`card-elevated p-3 flex gap-3 ${item.is_available === false ? 'opacity-50' : ''}`}>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={language === 'bn' ? item.name_bn : item.name_en}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold font-bangla text-sm leading-tight">
                        {language === 'bn' ? item.name_bn : item.name_en}
                      </h3>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">
                        ৳{item.price}
                      </span>
                    </div>
                    {(item.description_bn || item.description_en) && (
                      <p className="text-xs text-muted-foreground font-bangla mt-1 line-clamp-2">
                        {language === 'bn' ? item.description_bn : item.description_en}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      {item.is_popular && (
                        <span className="flex items-center gap-0.5 text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded-full">
                          <Flame className="w-3 h-3" /> {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                        </span>
                      )}
                      {item.is_vegetarian && (
                        <span className="flex items-center gap-0.5 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                          <Leaf className="w-3 h-3" /> {language === 'bn' ? 'নিরামিষ' : 'Veg'}
                        </span>
                      )}
                      {item.is_available === false && (
                        <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
                          {language === 'bn' ? 'অনুপলব্ধ' : 'Unavailable'}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-[10px] text-muted-foreground">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button onClick={handleCall} className="gap-2" disabled={!restaurant.phone}>
            <Phone className="w-4 h-4" />
            {language === 'bn' ? 'কল করুন' : 'Call Now'}
          </Button>
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            {language === 'bn' ? 'সময়সূচী' : 'Hours'}
          </Button>
        </div>

        {/* Reviews Section */}
        <ReviewSection entityType="restaurant" entityId={id!} />
      </main>

      <BottomNav />
    </div>
  );
};

export default RestaurantDetail;
