/**
 * Hand-written to match the schema in Obsidian doc "11. Architecture and Tech Stack" (11.4).
 * Once a Supabase project exists, regenerate with:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type Discipline = 'pistol' | 'rifle';
export type SessionTemplateType = 'technical' | 'match_simulation' | 'dry_fire';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';
export type ShotSource = 'manual' | 'image';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          discipline: Discipline;
          experience_level: string | null;
          goal: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          discipline: Discipline;
          experience_level?: string | null;
          goal?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      session_templates: {
        Row: {
          id: string;
          name: string;
          type: SessionTemplateType;
          discipline: Discipline | 'both';
          description: string | null;
          structure: unknown;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['session_templates']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['session_templates']['Insert']>;
      };
      training_sessions: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          discipline: Discipline;
          started_at: string;
          ended_at: string | null;
          notes: string | null;
          status: SessionStatus;
        };
        Insert: Omit<Database['public']['Tables']['training_sessions']['Row'], 'id' | 'started_at'> & {
          id?: string;
          started_at?: string;
        };
        Update: Partial<Database['public']['Tables']['training_sessions']['Insert']>;
      };
      series: {
        Row: {
          id: string;
          session_id: string;
          series_number: number;
          shot_count: number;
          total_score: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['series']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['series']['Insert']>;
      };
      shots: {
        Row: {
          id: string;
          series_id: string;
          shot_number: number;
          score: number;
          source: ShotSource;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shots']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['shots']['Insert']>;
      };
      match_simulator_formats: {
        Row: {
          id: string;
          name: string;
          discipline: Discipline | 'both';
          sequence: unknown;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['match_simulator_formats']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['match_simulator_formats']['Insert']>;
      };
      match_simulator_runs: {
        Row: {
          id: string;
          user_id: string;
          format_id: string;
          started_at: string;
          completed_at: string | null;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['match_simulator_runs']['Row'], 'id' | 'started_at'> & {
          id?: string;
          started_at?: string;
        };
        Update: Partial<Database['public']['Tables']['match_simulator_runs']['Insert']>;
      };
    };
  };
}
