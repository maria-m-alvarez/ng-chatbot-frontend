// chatbot-models.ts
export interface ChatMessage {
  role: string;  // 'user' or 'assistant'
  content: string;
  message_uuid?: string | null;
}

export interface ChatRequestOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatRequest {
  session_uuid?: string | null;
  provider: string;
  provider_model: string;
  options?: ChatRequestOptions | null;
  messages: ChatMessage[];
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletion {
  provider: string;
  provider_model: string;
  usage: ChatCompletionUsage;
  messages: ChatMessage[];
  references?: Record<string, any>[];
  metadata?: Record<string, any>;
}

export interface ProviderModelsResponse {
  provider: string;
  models: { name: string }[];
  status: string;
}
