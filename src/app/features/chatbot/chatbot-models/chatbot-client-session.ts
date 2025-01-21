// chatbot-client-session.ts
// Client-side representations of chatbot messages and sessions

import { ChatMessageMetadata, DocumentReference } from './chatbot-api-response-models';

// Feedback Model
export interface ClientChatMessageFeedback {
  id: number | null;
  rating: number | null;
  user_id: number | null;
  comments?: string | null;
}

// Chat Message Model
export class ClientChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: ChatMessageMetadata;
  timestamp: Date;
  requestTokens?: number | null;
  responseTokens?: number | null;
  totalTokens?: number | null;
  retrievalTime?: number | null;
  generationTime?: number | null;
  feedback?: ClientChatMessageFeedback | null;

  constructor(
    id: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata: ChatMessageMetadata = {},
    timestamp?: Date,
    requestTokens?: number | null,
    responseTokens?: number | null,
    totalTokens?: number | null,
    retrievalTime?: number | null,
    generationTime?: number | null,
    feedback?: ClientChatMessageFeedback | null
  ) {
    this.id = id;
    this.role = role;
    this.content = content;
    this.metadata = metadata;
    this.timestamp = timestamp ?? new Date();
    this.requestTokens = requestTokens ?? null;
    this.responseTokens = responseTokens ?? null;
    this.totalTokens = totalTokens ?? null;
    this.retrievalTime = retrievalTime ?? null;
    this.generationTime = generationTime ?? null;
    this.feedback = feedback ?? null;
  }

  getDocuments(): DocumentReference[] {
    return this.metadata?.documents || [];
  }
}

// Chat Session Model
export class ClientChatSession {
  sessionId: string;
  name: string;
  messages: ClientChatMessage[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  projectConfiguration?: number;

  constructor(sessionId: string, title: string, userId: string, projectConfiguration?: number) {
    this.sessionId = sessionId;
    this.name = title;
    this.messages = [];
    this.userId = userId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.projectConfiguration = projectConfiguration;
  }

  addUserMessage(content: string, metadata: ChatMessageMetadata = {}): ClientChatMessage {
    const message = new ClientChatMessage('-1', 'user', content, metadata);
    this.messages.push(message);
    this.updatedAt = new Date();
    return message;
  }

  addAssistantMessage(
    promptId: string,
    content: string,
    metadata: ChatMessageMetadata = {},
    feedback?: ClientChatMessageFeedback
  ): ClientChatMessage {
    const message = new ClientChatMessage('-1', 'assistant', content, metadata, new Date(), null, null, null, null, null, feedback);
    this.messages.push(message);
    this.updatedAt = new Date();
    return message;
  }
}
