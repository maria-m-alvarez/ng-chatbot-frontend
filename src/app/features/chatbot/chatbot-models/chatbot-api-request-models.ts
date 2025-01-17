// chatbot-api-request-models.ts
// Data structure models sent to FastAPI endpoints

export interface ChatOptionsRequest {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatMessageRequest {
  role: string; // 'user' | 'assistant' | 'system'
  content: string;
  message_id: number;
}

export interface ChatRequest {
  session_id?: number;
  provider: string;
  provider_model: string;
  messages: ChatMessageRequest[];
  options?: ChatOptionsRequest | null;
}

export interface PromptResultFeedbackRequest {
  prompt_result_id: number;
  rating: number; // 1-5 stars
  comments?: string | null;
}
