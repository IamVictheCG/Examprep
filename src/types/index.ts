export interface Exam {
  id: string;
  name: string;
  field: string;
  icon: string;
  status: "live" | "coming_soon";
  description?: string;
  priceMonthly?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  streakCount: number;
  streakLastDate?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  examId: string;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  paystackSubscriptionCode?: string;
}

export interface MockTestSession {
  id: string;
  userId: string;
  examId: string;
  questions: string[];
  answers: Record<string, string>;
  score: number;
  durationSeconds: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface FlashcardSession {
  id: string;
  userId: string;
  examId: string;
  topicId?: string;
  cardsReviewed: number;
  gotItCount: number;
  reviewAgainCount: number;
  createdAt: string;
}

export interface TopicPerformance {
  id: string;
  userId: string;
  examId: string;
  topicId: string;
  topicName: string;
  totalAttempted: number;
  totalCorrect: number;
  lastUpdated: string;
}

export interface BookmarkedQuestion {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  examId: string;
  topicId?: string;
  questionText: string;
  questionType: "mcq" | "theory";
  options?: { id: string; text: string }[];
  correctOptionId?: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  year?: number;
  source?: string;
}

export interface Topic {
  id: string;
  examId: string;
  name: string;
  orderIndex: number;
}

export interface AiTutorMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
