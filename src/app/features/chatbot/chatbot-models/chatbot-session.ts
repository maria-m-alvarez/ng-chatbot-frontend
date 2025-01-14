export class ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    documents?: {
      doc_id: number;
      doc_name: string;
      doc_page: number;
      doc_content: string;
    }[];
  };
  timestamp: Date;
  question?: string;
  answer?: string;
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
    metadata: {
      documents?: {
        doc_id: number;
        doc_name: string;
        doc_page: number;
        doc_content: string;
      }[];
    } = {}
  ) {
    this.id = id;
    this.role = role;
    this.content = content;
    this.metadata = metadata;
    this.timestamp = new Date();
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

  addUserMessage(content: string, metadata: any = {}): ChatMessage {
    const prompt = new ChatMessage(this.generateId(), 'user', content, metadata);
    this.messages.push(prompt);
    this.updatedAt = new Date();
    return prompt;
  }

  addAssistantMessage(
    promptId: string,
    content: string,
    metadata: {
      documents?: {
        doc_id: number;
        doc_name: string;
        doc_page: number;
        doc_content: string;
      }[];
    } = {}
  ): ChatMessage {
    const response = new ChatMessage(this.generateId(), 'assistant', content, metadata);
    this.messages.push(response);
    this.updatedAt = new Date();
    return response;
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2, 11);
  }
}

  