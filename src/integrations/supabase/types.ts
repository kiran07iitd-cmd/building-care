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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      building_contacts: {
        Row: {
          building_id: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          note: string | null
          phone: string
          service_type: string
          updated_at: string
        }
        Insert: {
          building_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          note?: string | null
          phone: string
          service_type: string
          updated_at?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          note?: string | null
          phone?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "building_contacts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          created_at: string
          created_by: string | null
          host_count: number
          id: string
          location: string
          name: string
          photo_url: string | null
          unique_code: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          host_count?: number
          id?: string
          location: string
          name: string
          photo_url?: string | null
          unique_code: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          host_count?: number
          id?: string
          location?: string
          name?: string
          photo_url?: string | null
          unique_code?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          building_id: string
          content: string
          created_at: string
          id: string
          read_by_host: boolean
          read_by_resident: boolean
          resident_id: string
          sender_id: string
        }
        Insert: {
          building_id: string
          content: string
          created_at?: string
          id?: string
          read_by_host?: boolean
          read_by_resident?: boolean
          resident_id: string
          sender_id: string
        }
        Update: {
          building_id?: string
          content?: string
          created_at?: string
          id?: string
          read_by_host?: boolean
          read_by_resident?: boolean
          resident_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      host_request_votes: {
        Row: {
          created_at: string
          host_id: string
          id: string
          request_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          host_id: string
          id?: string
          request_id: string
          vote: string
        }
        Update: {
          created_at?: string
          host_id?: string
          id?: string
          request_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_request_votes_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_request_votes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "host_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      host_requests: {
        Row: {
          building_id: string
          created_at: string
          id: string
          new_user_email: string | null
          new_user_mobile: string | null
          request_type: string
          requested_by: string
          status: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          new_user_email?: string | null
          new_user_mobile?: string | null
          request_type: string
          requested_by: string
          status?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          new_user_email?: string | null
          new_user_mobile?: string | null
          request_type?: string
          requested_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_requests_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      hosts: {
        Row: {
          building_id: string
          created_at: string
          id: string
          is_primary: boolean
          status: string
          user_id: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          status?: string
          user_id: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hosts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_categories: {
        Row: {
          building_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          penalty_amount: number
          per_room_amount: number
          qr_code_image: string | null
          total_amount: number
          upi_id: string | null
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          penalty_amount?: number
          per_room_amount?: number
          qr_code_image?: string | null
          total_amount?: number
          upi_id?: string | null
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          penalty_amount?: number
          per_room_amount?: number
          qr_code_image?: string | null
          total_amount?: number
          upi_id?: string | null
        }
        Relationships: []
      }
      monthly_maintenance: {
        Row: {
          building_id: string
          category_id: string
          created_at: string
          id: string
          is_published: boolean
          month: string
          penalty_amount: number
          per_room_amount: number
          published_at: string | null
          total_amount: number
        }
        Insert: {
          building_id: string
          category_id: string
          created_at?: string
          id?: string
          is_published?: boolean
          month: string
          penalty_amount?: number
          per_room_amount?: number
          published_at?: string | null
          total_amount?: number
        }
        Update: {
          building_id?: string
          category_id?: string
          created_at?: string
          id?: string
          is_published?: boolean
          month?: string
          penalty_amount?: number
          per_room_amount?: number
          published_at?: string | null
          total_amount?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          building_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          receiver_id: string
          related_category_id: string | null
          related_month: string | null
          related_room_id: string | null
          title: string
          type: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          receiver_id: string
          related_category_id?: string | null
          related_month?: string | null
          related_room_id?: string | null
          title: string
          type: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          receiver_id?: string
          related_category_id?: string | null
          related_month?: string | null
          related_room_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          google_account: string | null
          id: string
          mobile: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          google_account?: string | null
          id: string
          mobile?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          google_account?: string | null
          id?: string
          mobile?: string | null
          name?: string | null
        }
        Relationships: []
      }
      room_join_requests: {
        Row: {
          applicant_email: string
          applicant_mobile: string
          applicant_name: string
          building_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          requested_by: string
          room_number: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_email?: string
          applicant_mobile?: string
          applicant_name?: string
          building_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          requested_by: string
          room_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_email?: string
          applicant_mobile?: string
          applicant_name?: string
          building_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          requested_by?: string
          room_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_join_requests_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      room_maintenance_status: {
        Row: {
          amount_due: number
          building_id: string
          category_id: string
          created_at: string
          id: string
          month: string
          monthly_maintenance_id: string
          payment_requested_at: string | null
          payment_status: string
          penalty_amount: number
          penalty_applied: boolean
          room_id: string
          total_due: number
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount_due?: number
          building_id: string
          category_id: string
          created_at?: string
          id?: string
          month: string
          monthly_maintenance_id: string
          payment_requested_at?: string | null
          payment_status?: string
          penalty_amount?: number
          penalty_applied?: boolean
          room_id: string
          total_due?: number
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_due?: number
          building_id?: string
          category_id?: string
          created_at?: string
          id?: string
          month?: string
          monthly_maintenance_id?: string
          payment_requested_at?: string | null
          payment_status?: string
          penalty_amount?: number
          penalty_applied?: boolean
          room_id?: string
          total_due?: number
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      room_users: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          room_id: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          room_id: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          room_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          building_id: string
          created_at: string
          id: string
          is_active: boolean
          room_number: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          room_number: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          room_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      starred_buildings: {
        Row: {
          building_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_host_of: { Args: { _building_id: string }; Returns: boolean }
      is_resident_of: { Args: { _building_id: string }; Returns: boolean }
      recalc_per_room_amounts: {
        Args: { _building_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
