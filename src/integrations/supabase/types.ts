export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_kuakata: {
        Row: {
          content_bn: string | null
          content_en: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          section_key: string
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_key: string
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_key?: string
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      answer_upvotes: {
        Row: {
          answer_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          answer_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          answer_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_upvotes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "community_answers"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          category: string | null
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_type: string
          created_at: string | null
          description_bn: string | null
          description_en: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name_bn: string
          name_en: string
          points: number | null
          requirement_type: string
          requirement_value: number | null
          updated_at: string | null
        }
        Insert: {
          badge_type?: string
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name_bn: string
          name_en: string
          points?: number | null
          requirement_type: string
          requirement_value?: number | null
          updated_at?: string | null
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name_bn?: string
          name_en?: string
          points?: number | null
          requirement_type?: string
          requirement_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      banks: {
        Row: {
          address_bn: string | null
          address_en: string | null
          branch_bn: string | null
          branch_en: string | null
          created_at: string
          has_atm: boolean | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name_bn: string
          name_en: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address_bn?: string | null
          address_en?: string | null
          branch_bn?: string | null
          branch_en?: string | null
          created_at?: string
          has_atm?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn: string
          name_en: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address_bn?: string | null
          address_en?: string | null
          branch_bn?: string | null
          branch_en?: string | null
          created_at?: string
          has_atm?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn?: string
          name_en?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          subtitle_bn: string | null
          subtitle_en: string | null
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle_bn?: string | null
          subtitle_en?: string | null
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle_bn?: string | null
          subtitle_en?: string | null
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      beach_chairs: {
        Row: {
          created_at: string
          features_bn: string[] | null
          features_en: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_bn: string | null
          location_en: string | null
          name_bn: string
          name_en: string
          phone: string | null
          price_bn: string | null
          price_en: string | null
          timing_bn: string | null
          timing_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features_bn?: string[] | null
          features_en?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn: string
          name_en: string
          phone?: string | null
          price_bn?: string | null
          price_en?: string | null
          timing_bn?: string | null
          timing_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features_bn?: string[] | null
          features_en?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn?: string
          name_en?: string
          phone?: string | null
          price_bn?: string | null
          price_en?: string | null
          timing_bn?: string | null
          timing_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      beach_safety: {
        Row: {
          created_at: string
          date: string
          flag_color: string | null
          id: string
          notes_bn: string | null
          notes_en: string | null
          status: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          date: string
          flag_color?: string | null
          id?: string
          notes_bn?: string | null
          notes_en?: string | null
          status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          flag_color?: string | null
          id?: string
          notes_bn?: string | null
          notes_en?: string | null
          status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      bus_counters: {
        Row: {
          counter_number: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          location_bn: string | null
          location_en: string | null
          name_bn: string
          name_en: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          counter_number?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn: string
          name_en: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          counter_number?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn?: string
          name_en?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          room_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          room_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          guide_id: string
          guide_profile_id: string | null
          id: string
          is_active: boolean | null
          last_message: string | null
          last_message_at: string | null
          tourist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guide_id: string
          guide_profile_id?: string | null
          id?: string
          is_active?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          tourist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guide_id?: string
          guide_profile_id?: string | null
          id?: string
          is_active?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          tourist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_guide_profile_id_fkey"
            columns: ["guide_profile_id"]
            isOneToOne: false
            referencedRelation: "local_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      children_rides: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_bn: string | null
          location_en: string | null
          name_bn: string
          name_en: string
          price_bn: string | null
          price_en: string | null
          timing_bn: string | null
          timing_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn: string
          name_en: string
          price_bn?: string | null
          price_en?: string | null
          timing_bn?: string | null
          timing_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn?: string
          name_en?: string
          price_bn?: string | null
          price_en?: string | null
          timing_bn?: string | null
          timing_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_answers: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_accepted: boolean | null
          is_approved: boolean | null
          is_from_local: boolean | null
          question_id: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          is_approved?: boolean | null
          is_from_local?: boolean | null
          question_id: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          is_approved?: boolean | null
          is_from_local?: boolean | null
          question_id?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "community_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_questions: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          is_answered: boolean | null
          is_approved: boolean | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          is_approved?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          is_approved?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          admin_response: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          status: string | null
          subject_bn: string | null
          subject_en: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          status?: string | null
          subject_bn?: string | null
          subject_en?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          status?: string | null
          subject_bn?: string | null
          subject_en?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contest_photos: {
        Row: {
          caption_bn: string | null
          caption_en: string | null
          contest_id: string
          created_at: string | null
          id: string
          image_url: string
          is_approved: boolean | null
          is_winner: boolean | null
          location_name: string | null
          user_id: string
          vote_count: number | null
        }
        Insert: {
          caption_bn?: string | null
          caption_en?: string | null
          contest_id: string
          created_at?: string | null
          id?: string
          image_url: string
          is_approved?: boolean | null
          is_winner?: boolean | null
          location_name?: string | null
          user_id: string
          vote_count?: number | null
        }
        Update: {
          caption_bn?: string | null
          caption_en?: string | null
          contest_id?: string
          created_at?: string | null
          id?: string
          image_url?: string
          is_approved?: boolean | null
          is_winner?: boolean | null
          location_name?: string | null
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_photos_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "photo_contests"
            referencedColumns: ["id"]
          },
        ]
      }
      dc_initiatives: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          status: string | null
          target_date: string | null
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          status?: string | null
          target_date?: string | null
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          status?: string | null
          target_date?: string | null
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          mood: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          visit_date: string | null
          weather: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          mood?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          visit_date?: string | null
          weather?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          mood?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          visit_date?: string | null
          weather?: string | null
        }
        Relationships: []
      }
      diary_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          diary_entry_id: string
          display_order: number | null
          id: string
          image_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          diary_entry_id: string
          display_order?: number | null
          id?: string
          image_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          diary_entry_id?: string
          display_order?: number | null
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_photos_diary_entry_id_fkey"
            columns: ["diary_entry_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_services: {
        Row: {
          address_bn: string | null
          address_en: string | null
          created_at: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name_bn: string
          name_en: string
          phone: string
          type: string
          updated_at: string
        }
        Insert: {
          address_bn?: string | null
          address_en?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn: string
          name_en: string
          phone: string
          type: string
          updated_at?: string
        }
        Update: {
          address_bn?: string | null
          address_en?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn?: string
          name_en?: string
          phone?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          end_time: string | null
          event_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_bn: string | null
          location_en: string | null
          name_bn: string
          name_en: string
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn: string
          name_en: string
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn?: string
          name_en?: string
          start_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          category: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_available: boolean | null
          is_popular: boolean | null
          is_vegetarian: boolean | null
          name_bn: string
          name_en: string
          owner_id: string
          price: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_popular?: boolean | null
          is_vegetarian?: boolean | null
          name_bn: string
          name_en: string
          owner_id: string
          price?: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_popular?: boolean | null
          is_vegetarian?: boolean | null
          name_bn?: string
          name_en?: string
          owner_id?: string
          price?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_rooms: {
        Row: {
          amenities: string[] | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          hotel_id: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_available: boolean | null
          max_guests: number | null
          name_bn: string
          name_en: string
          owner_id: string
          price_per_night: number
          room_type: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          hotel_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          max_guests?: number | null
          name_bn: string
          name_en: string
          owner_id: string
          price_per_night?: number
          room_type?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          hotel_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          max_guests?: number | null
          name_bn?: string
          name_en?: string
          owner_id?: string
          price_per_night?: number
          room_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address_bn: string | null
          address_en: string | null
          amenities: string[] | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name_bn: string
          name_en: string
          owner_id: string | null
          phone: string | null
          price_range: string | null
          rating: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_bn?: string | null
          address_en?: string | null
          amenities?: string[] | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn: string
          name_en: string
          owner_id?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_bn?: string | null
          address_en?: string | null
          amenities?: string[] | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn?: string
          name_en?: string
          owner_id?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      local_guides: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_online: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          last_seen: string | null
          name_bn: string
          name_en: string
          phone: string
          price_per_day: string | null
          rating: number | null
          specialization_bn: string | null
          specialization_en: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_seen?: string | null
          name_bn: string
          name_en: string
          phone: string
          price_per_day?: string | null
          rating?: number | null
          specialization_bn?: string | null
          specialization_en?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_seen?: string | null
          name_bn?: string
          name_en?: string
          phone?: string
          price_per_day?: string | null
          rating?: number | null
          specialization_bn?: string | null
          specialization_en?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lost_found: {
        Row: {
          contact_phone: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_bn: string | null
          location_en: string | null
          status: string | null
          title_bn: string
          title_en: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          status?: string | null
          title_bn: string
          title_en: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          status?: string | null
          title_bn?: string
          title_en?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          badge: string | null
          color: string
          created_at: string
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          route: string | null
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          color: string
          created_at?: string
          display_order?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          route?: string | null
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          color?: string
          created_at?: string
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          route?: string | null
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          content_bn: string | null
          content_en: string | null
          created_at: string
          id: string
          is_active: boolean | null
          title_bn: string
          title_en: string
          type: string | null
          updated_at: string
        }
        Insert: {
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          title_bn: string
          title_en: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          title_bn?: string
          title_en?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      photo_contests: {
        Row: {
          created_at: string | null
          description_bn: string | null
          description_en: string | null
          end_date: string
          id: string
          is_active: boolean | null
          prize_bn: string | null
          prize_en: string | null
          start_date: string
          status: string | null
          title_bn: string
          title_en: string
          updated_at: string | null
          voting_end_date: string | null
          winner_photo_id: string | null
        }
        Insert: {
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          prize_bn?: string | null
          prize_en?: string | null
          start_date: string
          status?: string | null
          title_bn: string
          title_en: string
          updated_at?: string | null
          voting_end_date?: string | null
          winner_photo_id?: string | null
        }
        Update: {
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          prize_bn?: string | null
          prize_en?: string | null
          start_date?: string
          status?: string | null
          title_bn?: string
          title_en?: string
          updated_at?: string | null
          voting_end_date?: string | null
          winner_photo_id?: string | null
        }
        Relationships: []
      }
      photo_spots: {
        Row: {
          best_time_bn: string | null
          best_time_en: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name_bn: string
          name_en: string
          updated_at: string
        }
        Insert: {
          best_time_bn?: string | null
          best_time_en?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn: string
          name_en: string
          updated_at?: string
        }
        Update: {
          best_time_bn?: string | null
          best_time_en?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      photo_votes: {
        Row: {
          created_at: string | null
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_votes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "contest_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      place_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          place_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          place_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_images_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          category: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          distance_from_beach: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name_bn: string
          name_en: string
          rating: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          distance_from_beach?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn: string
          name_en: string
          rating?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          distance_from_beach?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn?: string
          name_en?: string
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      popular_food_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          popular_food_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          popular_food_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          popular_food_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "popular_food_images_popular_food_id_fkey"
            columns: ["popular_food_id"]
            isOneToOne: false
            referencedRelation: "popular_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_foods: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_bn: string | null
          location_en: string | null
          name_bn: string
          name_en: string
          price_range: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn: string
          name_en: string
          price_range?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn?: string
          name_en?: string
          price_range?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prayer_times: {
        Row: {
          asr: string
          created_at: string
          date: string
          dhuhr: string
          fajr: string
          id: string
          isha: string
          maghrib: string
          sunrise: string
          updated_at: string
        }
        Insert: {
          asr: string
          created_at?: string
          date: string
          dhuhr: string
          fajr: string
          id?: string
          isha: string
          maghrib: string
          sunrise: string
          updated_at?: string
        }
        Update: {
          asr?: string
          created_at?: string
          date?: string
          dhuhr?: string
          fajr?: string
          id?: string
          isha?: string
          maghrib?: string
          sunrise?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          notification_enabled: boolean | null
          phone: string | null
          push_subscription: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          notification_enabled?: boolean | null
          phone?: string | null
          push_subscription?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          notification_enabled?: boolean | null
          phone?: string | null
          push_subscription?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address_bn: string | null
          address_en: string | null
          created_at: string
          cuisine_type: string | null
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_bn: string
          name_en: string
          owner_id: string | null
          phone: string | null
          price_range: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          address_bn?: string | null
          address_en?: string | null
          created_at?: string
          cuisine_type?: string | null
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_bn: string
          name_en: string
          owner_id?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          address_bn?: string | null
          address_en?: string | null
          created_at?: string
          cuisine_type?: string | null
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_bn?: string
          name_en?: string
          owner_id?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_approved: boolean | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_approved?: boolean | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_approved?: boolean | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      room_bookings: {
        Row: {
          check_in_date: string
          check_out_date: string
          created_at: string
          guest_name: string | null
          guests: number | null
          id: string
          notes: string | null
          phone: string | null
          room_id: string
          status: string | null
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          created_at?: string
          guest_name?: string | null
          guests?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          room_id: string
          status?: string | null
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          guest_name?: string | null
          guests?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          room_id?: string
          status?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hotel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          room_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          room_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_images_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hotel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          created_at: string
          id: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_markets: {
        Row: {
          category: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_bn: string | null
          location_en: string | null
          name_bn: string
          name_en: string
          phone: string | null
          timing_bn: string | null
          timing_en: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn: string
          name_en: string
          phone?: string | null
          timing_bn?: string | null
          timing_en?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_bn?: string | null
          location_en?: string | null
          name_bn?: string
          name_en?: string
          phone?: string | null
          timing_bn?: string | null
          timing_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sun_times: {
        Row: {
          created_at: string
          date: string
          id: string
          sunrise: string
          sunset: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          sunrise: string
          sunset: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          sunrise?: string
          sunset?: string
          updated_at?: string
        }
        Relationships: []
      }
      tide_alerts: {
        Row: {
          created_at: string
          date: string
          high_tide_level: string | null
          high_tide_time: string | null
          id: string
          is_active: boolean | null
          low_tide_level: string | null
          low_tide_time: string | null
          notes_bn: string | null
          notes_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          high_tide_level?: string | null
          high_tide_time?: string | null
          id?: string
          is_active?: boolean | null
          low_tide_level?: string | null
          low_tide_time?: string | null
          notes_bn?: string | null
          notes_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          high_tide_level?: string | null
          high_tide_time?: string | null
          id?: string
          is_active?: boolean | null
          low_tide_level?: string | null
          low_tide_time?: string | null
          notes_bn?: string | null
          notes_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tour_service_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          tour_service_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          tour_service_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          tour_service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_service_images_tour_service_id_fkey"
            columns: ["tour_service_id"]
            isOneToOne: false
            referencedRelation: "tour_services"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_services: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_bn: string
          name_en: string
          phone: string | null
          price_bn: string | null
          price_en: string | null
          service_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_bn: string
          name_en: string
          phone?: string | null
          price_bn?: string | null
          price_en?: string | null
          service_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_bn?: string
          name_en?: string
          phone?: string | null
          price_bn?: string | null
          price_en?: string | null
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          category: string | null
          created_at: string
          id: string
          key: string
          updated_at: string
          value_bn: string
          value_en: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value_bn: string
          value_en: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value_bn?: string
          value_en?: string
        }
        Relationships: []
      }
      transport: {
        Row: {
          created_at: string
          fare: string | null
          id: string
          is_active: boolean | null
          name_bn: string
          name_en: string
          phone: string | null
          route_bn: string | null
          route_en: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fare?: string | null
          id?: string
          is_active?: boolean | null
          name_bn: string
          name_en: string
          phone?: string | null
          route_bn?: string | null
          route_en?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fare?: string | null
          id?: string
          is_active?: boolean | null
          name_bn?: string
          name_en?: string
          phone?: string | null
          route_bn?: string | null
          route_en?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      travel_stories: {
        Row: {
          content_bn: string | null
          content_en: string | null
          cover_image_url: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_public: boolean | null
          start_date: string | null
          title_bn: string | null
          title_en: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          content_bn?: string | null
          content_en?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          start_date?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          content_bn?: string | null
          content_en?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          start_date?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          shared_on_facebook: boolean | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          shared_on_facebook?: boolean | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          shared_on_facebook?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warning_zones: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name_bn: string
          name_en: string
          radius_meters: number | null
          severity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn: string
          name_en: string
          radius_meters?: number | null
          severity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_bn?: string
          name_en?: string
          radius_meters?: number | null
          severity?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "hotel_owner"
        | "restaurant_owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "moderator",
        "user",
        "hotel_owner",
        "restaurant_owner",
      ],
    },
  },
} as const
