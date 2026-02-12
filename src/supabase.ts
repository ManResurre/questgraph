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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      choice: {
        Row: {
          id: number
          label: string | null
          nextSceneId: number | null
          quest_id: number | null
          text: string | null
          transition_text: string | null
        }
        Insert: {
          id?: number
          label?: string | null
          nextSceneId?: number | null
          quest_id?: number | null
          text?: string | null
          transition_text?: string | null
        }
        Update: {
          id?: number
          label?: string | null
          nextSceneId?: number | null
          quest_id?: number | null
          text?: string | null
          transition_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "choice_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      parameter_choice: {
        Row: {
          choice_id: number | null
          id: number
          param_id: number | null
          value: string | null
        }
        Insert: {
          choice_id?: number | null
          id?: number
          param_id?: number | null
          value?: string | null
        }
        Update: {
          choice_id?: number | null
          id?: number
          param_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parameter_choice_choice_id_fkey"
            columns: ["choice_id"]
            isOneToOne: false
            referencedRelation: "choice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parameter_choice_param_id_fkey"
            columns: ["param_id"]
            isOneToOne: false
            referencedRelation: "parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      parameter_scene: {
        Row: {
          id: number
          param_id: number | null
          scene_id: number | null
          value: string | null
        }
        Insert: {
          id?: number
          param_id?: number | null
          scene_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          param_id?: number | null
          scene_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parameter_scene_param_id_fkey"
            columns: ["param_id"]
            isOneToOne: false
            referencedRelation: "parameters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parameter_scene_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scene"
            referencedColumns: ["id"]
          },
        ]
      }
      parameters: {
        Row: {
          desc: string | null
          hide: boolean | null
          id: number
          key: string | null
          label: string | null
          quest_id: number | null
          text: string | null
          type: Database["public"]["Enums"]["ParameterType"] | null
          value: string | null
        }
        Insert: {
          desc?: string | null
          hide?: boolean | null
          id?: number
          key?: string | null
          label?: string | null
          quest_id?: number | null
          text?: string | null
          type?: Database["public"]["Enums"]["ParameterType"] | null
          value?: string | null
        }
        Update: {
          desc?: string | null
          hide?: boolean | null
          id?: number
          key?: string | null
          label?: string | null
          quest_id?: number | null
          text?: string | null
          type?: Database["public"]["Enums"]["ParameterType"] | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parameters_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          id: string
          last_seen: string
          metadata: Json | null
          room_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          last_seen?: string
          metadata?: Json | null
          room_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          last_seen?: string
          metadata?: Json | null
          room_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          id: number
          name: string
          user_id: string | null
        }
        Insert: {
          id?: number
          name: string
          user_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      scene: {
        Row: {
          id: number
          locPosition: boolean | null
          name: string | null
          position: string | null
          quest_id: number
          samplyLink: string | null
          type: string | null
        }
        Insert: {
          id?: number
          locPosition?: boolean | null
          name?: string | null
          position?: string | null
          quest_id: number
          samplyLink?: string | null
          type?: string | null
        }
        Update: {
          id?: number
          locPosition?: boolean | null
          name?: string | null
          position?: string | null
          quest_id?: number
          samplyLink?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scene_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      scene_choice: {
        Row: {
          choice_id: number | null
          id: number
          scene_id: number | null
        }
        Insert: {
          choice_id?: number | null
          id?: number
          scene_id?: number | null
        }
        Update: {
          choice_id?: number | null
          id?: number
          scene_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scene_choice_choice_id_fkey"
            columns: ["choice_id"]
            isOneToOne: false
            referencedRelation: "choice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scene_choice_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scene"
            referencedColumns: ["id"]
          },
        ]
      }
      scene_texts: {
        Row: {
          id: number
          scene_id: number | null
          text: string | null
        }
        Insert: {
          id?: number
          scene_id?: number | null
          text?: string | null
        }
        Update: {
          id?: number
          scene_id?: number | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scene_texts_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scene"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          consumed: boolean
          created_at: string
          error_count: number
          from_user: string
          id: string
          room_id: string
          signal: Json
          to_user: string
          type: string
        }
        Insert: {
          consumed?: boolean
          created_at?: string
          error_count?: number
          from_user: string
          id?: string
          room_id: string
          signal: Json
          to_user: string
          type: string
        }
        Update: {
          consumed?: boolean
          created_at?: string
          error_count?: number
          from_user?: string
          id?: string
          room_id?: string
          signal?: Json
          to_user?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_keys: {
        Row: {
          challenge: string | null
          created_at: string | null
          id: string
          owner_id: string | null
          public_key: string
        }
        Insert: {
          challenge?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          public_key: string
        }
        Update: {
          challenge?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          public_key?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_offline_users: { Args: never; Returns: undefined }
      delete_orphaned_signals_batch: { Args: never; Returns: undefined }
    }
    Enums: {
      ParameterType: "calculation" | "value" | "percent"
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
      ParameterType: ["calculation", "value", "percent"],
    },
  },
} as const
