export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          streak_count: number;
          streak_last_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          streak_count?: number;
          streak_last_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          streak_count?: number;
          streak_last_date?: string | null;
          updated_at?: string;
        };
        Relationships: never[];
      };
      exams: {
        Row: {
          id: string;
          slug: string;
          name: string;
          field: string;
          icon: string;
          status: "live" | "coming_soon";
          description: string | null;
          price_monthly: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          field: string;
          icon: string;
          status: "live" | "coming_soon";
          description?: string | null;
          price_monthly?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          field?: string;
          icon?: string;
          status?: "live" | "coming_soon";
          description?: string | null;
          price_monthly?: number;
        };
        Relationships: never[];
      };
      topics: {
        Row: {
          id: string;
          exam_id: string;
          name: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          name: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          name?: string;
          order_index?: number;
        };
        Relationships: never[];
      };
      questions: {
        Row: {
          id: string;
          exam_id: string;
          topic_id: string | null;
          question_text: string;
          question_type: "mcq" | "theory";
          options: { id: string; text: string }[] | null;
          correct_option_id: string | null;
          correct_answer_text: string | null;
          explanation: string;
          difficulty: "easy" | "medium" | "hard";
          year: number | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          topic_id?: string | null;
          question_text: string;
          question_type: "mcq" | "theory";
          options?: { id: string; text: string }[] | null;
          correct_option_id?: string | null;
          correct_answer_text?: string | null;
          explanation: string;
          difficulty: "easy" | "medium" | "hard";
          year?: number | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          topic_id?: string | null;
          question_text?: string;
          question_type?: "mcq" | "theory";
          options?: { id: string; text: string }[] | null;
          correct_option_id?: string | null;
          correct_answer_text?: string | null;
          explanation?: string;
          difficulty?: "easy" | "medium" | "hard";
          year?: number | null;
          source?: string | null;
        };
        Relationships: never[];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          status: "active" | "cancelled" | "expired";
          paystack_subscription_code: string | null;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          status: "active" | "cancelled" | "expired";
          paystack_subscription_code?: string | null;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_id?: string;
          status?: "active" | "cancelled" | "expired";
          paystack_subscription_code?: string | null;
          start_date?: string;
          end_date?: string;
        };
        Relationships: never[];
      };
      mock_test_sessions: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          questions: string[];
          answers: Record<string, string>;
          score: number;
          duration_seconds: number;
          completed: boolean;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          questions?: string[];
          answers?: Record<string, string>;
          score?: number;
          duration_seconds?: number;
          completed?: boolean;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_id?: string;
          questions?: string[];
          answers?: Record<string, string>;
          score?: number;
          duration_seconds?: number;
          completed?: boolean;
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: never[];
      };
      flashcard_sessions: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          topic_id: string | null;
          cards_reviewed: number;
          got_it_count: number;
          review_again_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          topic_id?: string | null;
          cards_reviewed?: number;
          got_it_count?: number;
          review_again_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_id?: string;
          topic_id?: string | null;
          cards_reviewed?: number;
          got_it_count?: number;
          review_again_count?: number;
        };
        Relationships: never[];
      };
      topic_performance: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          topic_id: string;
          total_attempted: number;
          total_correct: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          topic_id: string;
          total_attempted?: number;
          total_correct?: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_id?: string;
          topic_id?: string;
          total_attempted?: number;
          total_correct?: number;
          last_updated?: string;
        };
        Relationships: never[];
      };
      bookmarked_questions: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
        };
        Relationships: never[];
      };
      ai_tutor_sessions: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          messages: { role: "user" | "assistant"; content: string; timestamp: string }[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          messages?: { role: "user" | "assistant"; content: string; timestamp: string }[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_id?: string;
          messages?: { role: "user" | "assistant"; content: string; timestamp: string }[];
          updated_at?: string;
        };
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
