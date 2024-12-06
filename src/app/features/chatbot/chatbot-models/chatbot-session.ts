// chatbot-session.ts

export class ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    metadata?: { documents?: { Document: string; Page: number }[] };
    timestamp: Date;
    processResult?: string;
    relatedPromptId?: string;

    constructor(
        id: string,
        role: 'user' | 'assistant',
        content: string,
        metadata: any = {}
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

    addAssistantMessage(promptId: string, content: string, metadata: any = {}): ChatMessage {
        const response = new ChatMessage(this.generateId(), 'assistant', content, metadata);
        response.relatedPromptId = promptId;
        this.messages.push(response);
        this.updatedAt = new Date();
        return response;
    }

    updateMessage(messageId: string, content: string, processResult?: string): void {
        const message = this.messages.find((msg) => msg.id === messageId);
        if (message) {
            message.content = content;
            message.processResult = processResult || message.processResult;
            message.timestamp = new Date();
            this.updatedAt = new Date();
        }
    }

    private generateId(): string {
        return Math.random().toString(36).slice(2, 11);
    }
}