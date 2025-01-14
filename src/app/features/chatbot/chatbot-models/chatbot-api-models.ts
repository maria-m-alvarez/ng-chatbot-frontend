// chatbot-models.ts
export interface DocumentReference {
  doc_id: number;
  doc_name: string;
  doc_page: number;
  doc_content: string;
}

export interface ChatMessageMetadata {
  documents?: DocumentReference[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  metadata?: ChatMessageMetadata;
}

export interface ChatRequestOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatRequest {
  session_id?: number; // Updated to session_id
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
