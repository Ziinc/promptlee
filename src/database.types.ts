export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      flow_runs: {
        Row: {
          flow_id: string
          flow_version_id: string
          id: string
          inputs: Json
          outputs: Json
          started_at: string
          status: string
          stopped_at: string | null
        }
        Insert: {
          flow_id: string
          flow_version_id: string
          id?: string
          inputs?: Json
          outputs: Json
          started_at?: string
          status?: string
          stopped_at?: string | null
        }
        Update: {
          flow_id?: string
          flow_version_id?: string
          id?: string
          inputs?: Json
          outputs?: Json
          started_at?: string
          status?: string
          stopped_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_runs_flow_id_fkey"
            columns: ["flow_id"]
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_runs_flow_version_id_fkey"
            columns: ["flow_version_id"]
            referencedRelation: "flow_versions"
            referencedColumns: ["id"]
          }
        ]
      }
      flow_versions: {
        Row: {
          created_at: string | null
          edges: Json[]
          flow_id: string
          id: string
          nodes: Json[]
        }
        Insert: {
          created_at?: string | null
          edges?: Json[]
          flow_id: string
          id?: string
          nodes?: Json[]
        }
        Update: {
          created_at?: string | null
          edges?: Json[]
          flow_id?: string
          id?: string
          nodes?: Json[]
        }
        Relationships: [
          {
            foreignKeyName: "flow_versions_flow_id_fkey"
            columns: ["flow_id"]
            referencedRelation: "flows"
            referencedColumns: ["id"]
          }
        ]
      }
      flows: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flows_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prompt_run_credits: {
        Row: {
          created_at: string | null
          flow_id: string | null
          free: boolean
          id: number
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          flow_id?: string | null
          free?: boolean
          id?: number
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          flow_id?: string | null
          free?: boolean
          id?: number
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_run_credits_flow_id_fkey"
            columns: ["flow_id"]
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_run_credits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      credit_history: {
        Row: {
          balance: number | null
          created_at: string | null
          free: boolean | null
          total_credit: number | null
          total_debit: number | null
          user_id: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_run_credits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prompt_run_counts: {
        Row: {
          count: number | null
          date: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_run_credits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      insert_free_credits: {
        Args: {
          uid: string
          num: number
        }
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

