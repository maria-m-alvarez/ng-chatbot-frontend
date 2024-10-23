
// Base class for prompts and answers
export abstract class PromptBase {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  processResult: string = '';

  constructor(id: string, role: 'user' | 'assistant', content: string) {
    this.id = id;
    this.role = role;
    this.content = content;
    this.timestamp = new Date();
  }
}

// User prompt class
export class Prompt extends PromptBase {
  constructor(id: string, content: string) {
    super(id, 'user', content);
  }
}

// Assistant answer class
export class PromptAnswer extends PromptBase {
  promptId: string;

  constructor(id: string, promptId: string, content: string) {
    super(id, 'assistant', content);
    this.promptId = promptId;
  }
}

// Chat session class with prompts, answers, and messages
export class ChatSession {
  sessionId: string;
  title: string;
  prompts: Prompt[]; // Stores prompts
  promptAnswers: PromptAnswer[]; // Stores answers
  messages: ChatSessionMessage[]; // Stores both prompts and answers
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isCurrent: boolean = false;

  constructor(sessionId: string, title: string, userId: string) {
    this.sessionId = sessionId;
    this.title = title;
    this.prompts = [];
    this.promptAnswers = [];
    this.messages = []; // Initialize empty message array
    this.userId = userId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Add a user prompt and update messages array
  addPrompt(content: string): Prompt {
    const prompt = new Prompt(this.generateId(), content);
    this.prompts.push(prompt);
    this.messages.push(new ChatSessionMessage(prompt.id, 'user', content)); // Add prompt as a message
    this.updatedAt = new Date();
    return prompt;
  }

  updatePrompt(promptId: string, updatedPrompt: Prompt): void {
    const targetPrompt = this.prompts.find(p => p.id === promptId);
    if (targetPrompt) {
      targetPrompt.content = updatedPrompt.content;
      targetPrompt.timestamp = new Date();
      targetPrompt.processResult = updatedPrompt.processResult || targetPrompt.processResult;
      this.updatedAt = new Date();
    }
  }
  
  updatePromptMessage(promptId: string, content: string): void {
    const answer = this.promptAnswers.find(a => a.promptId === promptId);
    if (answer) {
      answer.content = content;
      this.updatedAt = new Date();
    }
  }

  updatePromptResult(promptId: string, result: string): void {
    const prompt = this.prompts.find(p => p.id === promptId);
    if (prompt) {
      prompt.processResult = result;
      this.updatedAt = new Date();
    }
  }

  // Add an assistant answer and update messages array
  addPromptAnswer(promptId: string, content: string): void {
    const answer = new PromptAnswer(this.generateId(), promptId, content);
    this.promptAnswers.push(answer);
    this.messages.push(new ChatSessionMessage(answer.id, 'assistant', content)); // Add answer as a message
    this.updatedAt = new Date();
  }

  updatePromptAnswer(promptAnswerId: string, updatedPromptAnswer: PromptAnswer): void {
    const targetAnswer = this.promptAnswers.find(a => a.id === promptAnswerId);
    if (targetAnswer) {
      targetAnswer.content = updatedPromptAnswer.content;
      targetAnswer.timestamp = new Date();
      targetAnswer.processResult = updatedPromptAnswer.processResult || targetAnswer.processResult;
      this.updatedAt = new Date();
    }
  }
  
  updatePromptAnswerMessage(promptAnswerId: string, content: string): void {
    const answer = this.promptAnswers.find(a => a.id === promptAnswerId);
    if (answer) {
      answer.content = content;
      this.updatedAt = new Date();
    }
  }
  
  updatePromptAnswerResult(promptAnswerId: string, result: string): void {
    const answer = this.promptAnswers.find(a => a.id === promptAnswerId);
    if (answer) {
      answer.processResult = result;
      this.updatedAt = new Date();
    }
  }

  // Generate a unique ID for prompts and answers
  private generateId(): string {
    return Math.random().toString(36).slice(2, 11);
  }
}

// Message class representing both prompts and answers in a unified structure
export class ChatSessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;

  constructor(id: string, role: 'user' | 'assistant', content: string) {
    this.id = id;
    this.role = role;
    this.content = content;
  }
}

