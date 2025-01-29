// chatbot-api-response-models.ts
// Data structure models coming from FastAPI used in the chatbot API

// ------------------------------
// Base Models
// ------------------------------
export interface DBModel {
  id: number;
  created_at: string;
  updated_at: string;
  state: 'a' | 'i' | 'd'; // 'active', 'inactive', 'deleted'
  created_by?: number | null;
  updated_by?: number | null;
}

// ------------------------------
// Project Configurations Model
// ------------------------------
export interface ProjectConfigs extends DBModel {
  description: string;
  llm_provider: number;
  llm_model: number;
  llm_temperature: number;
  llm_max_tokens: number;
  llm_top_p: number;
  llm_frequency_penalty: number;
  llm_presence_penalty: number;
  embedding_model: string;
  chunking_method: string;
  chunk_size: number;
  chunk_overlap: number;
  similarity_threshold: number;
  top_k_chunks: number;
  vector_db: string;
  system_prompt: string;
}

// ------------------------------
// User Models
// ------------------------------
export interface Role extends DBModel {
  name: string;
}

export interface User extends DBModel {
  name: string;
  email: string;
  password: string;
  role?: number | null; // ForeignKey
}

export interface Group extends DBModel {
  name: string;
  users: number[]; // Many-to-Many User IDs
}

// ------------------------------
// Knowledge Models
// ------------------------------
export interface Content extends DBModel {
  name: string;
  summary?: string | null;
  groups?: number[]; // Many-to-Many Group IDs
  owner?: number | null;
  type?: string | null;
  language?: string | null;
  start_validity?: string | null; // ISO date
  end_validity?: string | null; // ISO date
}

// ------------------------------
// LLM & Prompt Models
// ------------------------------
export interface LLMProvider extends DBModel {
  name: string;
}

export interface LLM extends DBModel {
  name: string;
  provider: number;
}

export interface SystemPrompt extends DBModel {
  name: string;
  content: string;
}

export interface BasePrompt extends DBModel {
  system_prompt?: number | null;
  content: string;
}

export interface UserPrompt extends BasePrompt {
  user?: number | null;
}

export interface AgentPrompt extends BasePrompt {
  agent_name?: string | null;
}

// ------------------------------
// Prompt Results & Feedback
// ------------------------------
export interface PromptResult extends DBModel {
  prompt: number;
  content: string;
  token_count?: number | null;
  generation_time?: number | null;
  feedback_id?: number | null;
  feedback_rating?: number | null;
}

export interface PromptResultFeedback extends DBModel {
  prompt_result_id: number;
  user: number;
  rating?: number | null;
  comments?: string | null;
}

// ------------------------------
// Chatbot Models
// ------------------------------
export interface ChatSession extends DBModel {
  name?: string | null;
  user: number;
  project_configuration: number;
  last_accessed_at?: string | null; // ISO date string
}

export interface DocumentReference {
  doc_id: number;
  doc_name: string;
  doc_page: number;
  doc_content: string;
}

export interface ChatMessageMetadata {
  documents?: DocumentReference[];
}

export interface ChatMessageFeedback {
  id: number | null;
  rating: number | null;
  user_id: number | null;
  comments?: string | null;
}

export interface ChatMessage extends DBModel {
  message_id: number;
  session: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  updated_at: string;
  prompt_id?: number | null;
  prompt_result_id?: number | null;
  references?: Record<string, any>[];
  request_tokens?: number | null;
  response_tokens?: number | null;
  total_tokens?: number | null;
  retrieval_time?: number | null;
  generation_time?: number | null;
  feedback?: ChatMessageFeedback | null;
}

export interface ChatSessionWithMessages {
  id: number;
  name?: string | null;
  user: number;
  project_configuration: number;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

// ------------------------------
// Chatbot API Request & Response Models
// ------------------------------

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
