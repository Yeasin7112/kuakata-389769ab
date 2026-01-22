import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Star, ChevronRight } from 'lucide-react';

interface Place {
  id: string;
  nameBn: string;
  nameEn: string;
  rating: number;
  distance: string;
  image: string;
}

const places: Place[] = [
  {
    id: '1',
    nameBn: 'কুয়াকাটা সমুদ্র সৈকত',
    nameEn: 'Kuakata Sea Beach',
    rating: 4.8,
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    nameBn: 'ঝাউবন',
    nameEn: 'Jhaubon Forest',
    rating: 4.5,
    distance: '2.3 km',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    nameBn: 'লেবুর বন',
    nameEn: 'Lebur Bon',
    rating: 4.3,
    distance: '3.1 km',
    image: 'https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=400&h=300&fit=crop',
  },
];

const PopularPlaces: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="py-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground font-bangla">
          {t('popular')}
        </h3>
        <button className="text-sm text-primary font-medium flex items-center gap-1">
          {t('seeAll')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
        {places.map((place) => (
          <div
            key={place.id}
            className="card-elevated flex-shrink-0 w-48 overflow-hidden"
          >
            <div className="relative h-28">
              <img
                src={place.image}
                alt={language === 'bn' ? place.nameBn : place.nameEn}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] text-white font-medium">{place.rating}</span>
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm text-foreground font-bangla line-clamp-1">
                {language === 'bn' ? place.nameBn : place.nameEn}
              </h4>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{place.distance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularPlaces;
