import { ChatMessageMetadata, DocumentReference } from "./chatbot-api-models";

export class ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: ChatMessageMetadata;
  timestamp: Date;
  requestTokens?: number;
  responseTokens?: number;
  totalTokens?: number;
  retrievalTime?: number;
  generationTime?: number;
  classification?: string | null;

  constructor(
    id: string,
    role: 'user' | 'assistant',
    content: string,
    metadata: ChatMessageMetadata = {}
  ) {
    this.id = id;
    this.role = role;
    this.content = content;
    this.metadata = metadata;
    this.timestamp = new Date();
  }

  getDocuments(): DocumentReference[] {
    return this.metadata?.documents || [];
  }
}
  

export class ChatSession {
  sessionId: string;
  title: string;
  messages: ChatMessage[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  projectConfiguration?: number;

  constructor(sessionId: string, title: string, userId: string) {
    this.sessionId = sessionId;
    this.title = title;
    this.messages = [];
    this.userId = userId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Adds a user message to the session.
   * @param content The message content.
   * @param metadata Additional metadata, including document references.
   */
  addUserMessage(content: string, metadata: ChatMessageMetadata = {}): ChatMessage {
    const message = new ChatMessage('-1', 'user', content, metadata);
    this.messages.push(message);
    this.updatedAt = new Date();
    return message;
  }

  /**
   * Adds an assistant message to the session.
   * @param promptId The ID of the prompt this message responds to.
   * @param content The message content.
   * @param metadata Additional metadata, including document references.
   */
  addAssistantMessage(
    promptId: string,
    content: string,
    metadata: ChatMessageMetadata = {}
  ): ChatMessage {
    const message = new ChatMessage('-1', 'assistant', content, metadata);
    this.messages.push(message);
    this.updatedAt = new Date();
    return message;
  }
}
