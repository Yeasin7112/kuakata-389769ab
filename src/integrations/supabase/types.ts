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
      complaints: {
        Row: {
          admin_response: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
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
          status?: string | null
          subject_bn?: string | null
          subject_en?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          is_verified: boolean | null
          languages: string[] | null
          name_bn: string
          name_en: string
          phone: string
          price_per_day: string | null
          rating: number | null
          specialization_bn: string | null
          specialization_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          name_bn: string
          name_en: string
          phone: string
          price_per_day?: string | null
          rating?: number | null
          specialization_bn?: string | null
          specialization_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          name_bn?: string
          name_en?: string
          phone?: string
          price_per_day?: string | null
          rating?: number | null
          specialization_bn?: string | null
          specialization_en?: string | null
          updated_at?: string
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
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
