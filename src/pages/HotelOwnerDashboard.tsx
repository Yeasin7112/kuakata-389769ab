import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ImageUpload from '@/components/ImageUpload';
import RoomImageUpload from '@/components/RoomImageUpload';
import CreateHotelForm from '@/components/CreateHotelForm';
import EditHotelForm from '@/components/EditHotelForm';
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
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Hotel,
  Bed,
  Calendar,
  Eye,
  EyeOff,
  Images
} from 'lucide-react';

interface Room {
  id: string;
  hotel_id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  price_per_night: number;
  max_guests: number;
  room_type: string;
  is_available: boolean;
  is_active: boolean;
}

interface Booking {
  id: string;
  room_id: string;
  guest_name: string | null;
  phone: string | null;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
}

const HotelOwnerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false);
  const [selectedRoomForImages, setSelectedRoomForImages] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isEditHotelOpen, setIsEditHotelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');

  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    description_bn: '',
    description_en: '',
    image_url: '',
    price_per_night: 0,
    max_guests: 2,
    room_type: 'standard',
    is_available: true,
    is_active: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHotelAndRooms();
  }, [user]);

  const fetchHotelAndRooms = async () => {
    if (!user) return;

    try {
      const { data: hotelData } = await supabase
        .from('hotels')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (hotelData) {
        setHotel(hotelData);

        const { data: roomsData } = await supabase
          .from('hotel_rooms')
          .select('*')
          .eq('hotel_id', hotelData.id)
          .order('created_at', { ascending: false });

        setRooms(roomsData || []);

        if (roomsData && roomsData.length > 0) {
          const { data: bookingsData } = await supabase
            .from('room_bookings')
            .select('*')
            .in('room_id', roomsData.map(r => r.id))
            .order('created_at', { ascending: false });

          setBookings(bookingsData || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel || !user) return;

    try {
      const roomData = {
        ...formData,
        hotel_id: hotel.id,
        owner_id: user.id,
      };

      if (editingRoom) {
        const { error } = await supabase
          .from('hotel_rooms')
          .update(roomData)
          .eq('id', editingRoom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hotel_rooms')
          .insert([roomData]);
        if (error) throw error;
      }

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' 
          ? (editingRoom ? 'রুম আপডেট হয়েছে' : 'নতুন রুম যোগ হয়েছে')
          : (editingRoom ? 'Room updated' : 'New room added'),
      });

      setIsDialogOpen(false);
      resetForm();
      fetchHotelAndRooms();
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
      const { error } = await supabase.from('hotel_rooms').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'রুম মুছে ফেলা হয়েছে' : 'Room deleted',
      });
      fetchHotelAndRooms();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleAvailability = async (room: Room) => {
    try {
      const { error } = await supabase
        .from('hotel_rooms')
        .update({ is_available: !room.is_available })
        .eq('id', room.id);
      if (error) throw error;
      fetchHotelAndRooms();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('room_bookings')
        .update({ status })
        .eq('id', bookingId);
      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'বুকিং আপডেট হয়েছে' : 'Booking updated',
      });
      fetchHotelAndRooms();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name_bn: room.name_bn,
      name_en: room.name_en,
      description_bn: room.description_bn || '',
      description_en: room.description_en || '',
      image_url: room.image_url || '',
      price_per_night: room.price_per_night,
      max_guests: room.max_guests,
      room_type: room.room_type,
      is_available: room.is_available,
      is_active: room.is_active,
    });
    setIsDialogOpen(true);
  };

  const openImagesDialog = (room: Room) => {
    setSelectedRoomForImages(room);
    setIsImagesDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRoom(null);
    setFormData({
      name_bn: '',
      name_en: '',
      description_bn: '',
      description_en: '',
      image_url: '',
      price_per_night: 0,
      max_guests: 2,
      room_type: 'standard',
      is_available: true,
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show create hotel form if no hotel exists
  if (!hotel) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <CreateHotelForm onHotelCreated={fetchHotelAndRooms} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Hotel Info */}
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                {hotel.image_url ? (
                  <img src={hotel.image_url} alt={hotel.name_en} className="w-full h-full object-cover" />
                ) : (
                  <Hotel className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold font-bangla">
                  {language === 'bn' ? hotel.name_bn : hotel.name_en}
                </h1>
                <p className="text-sm text-muted-foreground font-bangla">
                  {language === 'bn' ? 'হোটেল মালিক ড্যাশবোর্ড' : 'Hotel Owner Dashboard'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditHotelOpen(true)}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Hotel Dialog */}
        {hotel && (
          <EditHotelForm
            hotel={hotel}
            isOpen={isEditHotelOpen}
            onClose={() => setIsEditHotelOpen(false)}
            onUpdated={fetchHotelAndRooms}
          />
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm font-bangla transition-colors ${
              activeTab === 'rooms'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Bed className="w-4 h-4 inline-block mr-2" />
            {language === 'bn' ? 'রুম' : 'Rooms'} ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm font-bangla transition-colors ${
              activeTab === 'bookings'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Calendar className="w-4 h-4 inline-block mr-2" />
            {language === 'bn' ? 'বুকিং' : 'Bookings'} ({bookings.length})
          </button>
        </div>

        {activeTab === 'rooms' && (
          <>
            <Button 
              onClick={() => { resetForm(); setIsDialogOpen(true); }}
              className="w-full mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'নতুন রুম যোগ করুন' : 'Add New Room'}
            </Button>

            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="card-elevated p-3">
                  <div className="flex gap-3">
                    {room.image_url && (
                      <img 
                        src={room.image_url} 
                        alt={room.name_en}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold font-bangla truncate">
                            {language === 'bn' ? room.name_bn : room.name_en}
                          </h3>
                          <p className="text-sm text-primary font-semibold">
                            ৳{room.price_per_night}/night
                          </p>
                        </div>
                        <button
                          onClick={() => toggleAvailability(room)}
                          className={`p-2 rounded-lg ${
                            room.is_available 
                              ? 'bg-success/10 text-success' 
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {room.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          room.is_available 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {room.is_available 
                            ? (language === 'bn' ? 'উপলব্ধ' : 'Available')
                            : (language === 'bn' ? 'অনুপলব্ধ' : 'Unavailable')
                          }
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {room.max_guests} {language === 'bn' ? 'অতিথি' : 'guests'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => openImagesDialog(room)}
                          className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20"
                          title={language === 'bn' ? 'ছবি যোগ করুন' : 'Manage Images'}
                        >
                          <Images className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditDialog(room)}
                          className="p-1.5 rounded bg-muted hover:bg-muted/80"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="card-elevated p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground font-bangla">
                  {language === 'bn' ? 'কোনো বুকিং নেই' : 'No bookings yet'}
                </p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="card-elevated p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{booking.guest_name || 'Guest'}</p>
                      <p className="text-sm text-muted-foreground">{booking.phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                      booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    <p>{booking.check_in_date} → {booking.check_out_date}</p>
                    <p className="font-semibold text-foreground">৳{booking.total_price}</p>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="flex-1"
                      >
                        {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="flex-1"
                      >
                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Room Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {editingRoom 
                ? (language === 'bn' ? 'রুম সম্পাদনা' : 'Edit Room')
                : (language === 'bn' ? 'নতুন রুম যোগ করুন' : 'Add New Room')
              }
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              currentImage={formData.image_url}
              onImageUploaded={(url) => setFormData({...formData, image_url: url})}
              folder="rooms"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}</Label>
                <Input
                  value={formData.name_bn}
                  onChange={(e) => setFormData({...formData, name_bn: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'}</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}</Label>
              <Textarea
                value={formData.description_bn}
                onChange={(e) => setFormData({...formData, description_bn: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'মূল্য (প্রতি রাত)' : 'Price (per night)'}</Label>
                <Input
                  type="number"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({...formData, price_per_night: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'সর্বোচ্চ অতিথি' : 'Max Guests'}</Label>
                <Input
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({...formData, max_guests: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'রুম টাইপ' : 'Room Type'}</Label>
              <Input
                value={formData.room_type}
                onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                placeholder="standard, deluxe, suite..."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-bangla">{language === 'bn' ? 'উপলব্ধ' : 'Available'}</Label>
              <Switch
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
              />
            </div>

            <Button type="submit" className="w-full">
              {editingRoom 
                ? (language === 'bn' ? 'আপডেট করুন' : 'Update')
                : (language === 'bn' ? 'যোগ করুন' : 'Add Room')
              }
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Room Images Dialog */}
      <Dialog open={isImagesDialogOpen} onOpenChange={setIsImagesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {language === 'bn' ? 'রুমের ছবি পরিচালনা' : 'Manage Room Images'}
              {selectedRoomForImages && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({language === 'bn' ? selectedRoomForImages.name_bn : selectedRoomForImages.name_en})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoomForImages && (
            <RoomImageUpload 
              roomId={selectedRoomForImages.id}
              onImagesUpdated={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default HotelOwnerDashboard;
