// chatbot-models.ts
export interface ChatMessage {
  role: string;  // 'user' or 'assistant'
  content: string;
}

export interface ChatRequestOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatRequest {
  provider: string;
  provider_model: string;
  options?: ChatRequestOptions;
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
  metadata?: any;
}

export interface ProviderModelsResponse {
  provider: string;
  models: { name: string }[];
  status: string;
}
