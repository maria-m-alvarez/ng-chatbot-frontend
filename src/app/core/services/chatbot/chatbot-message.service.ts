import { Injectable } from '@angular/core';
import { ChatSession } from '../../common/chatbot-models';
import { ChatbotEventService } from './chatbot-event.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotMessageService {
  currentSession!: ChatSession;
  sessions: ChatSession[] = [];

  constructor(readonly chatbotEventService: ChatbotEventService) {
    this.initializeExampleSession();
    this.initializeFrontendSession();
    this.initializeGameDevSession();
  }

  private initializeExampleSession(): void {
    const session = new ChatSession('-1', 'Example Session', 'user123');

    const prompt1 = session.addPrompt('Hello, chatbot!');
    session.addPromptAnswer(prompt1.id, 'Hello! How can I assist you today?');

    const prompt2 = session.addPrompt('What’s the weather like?');
    session.addPromptAnswer(prompt2.id, 'It’s sunny and 75°F right now.');

    const prompt3 = session.addPrompt('Is it possible for a strawberry to be a banana? I’ve always wondered about this.');
    session.addPromptAnswer(prompt3.id, 
      'While it may seem like an odd concept, if we delve into the world of possibilities and imagination, there are interesting ways to think about how a strawberry could be a banana. For one, if we consider genetic modification, scientists could theoretically manipulate the genes of a strawberry to grow into a shape that resembles a banana... (and so on)'
    );

    this.sessions.push(session);
    this.switchSession(session.sessionId);
  }

  private initializeFrontendSession(): void {
    const session = new ChatSession(this.generateSessionId(), 'Frontend Appreciation', 'user124');

    const prompt1 = session.addPrompt('What do you think about this frontend?');
    session.addPromptAnswer(prompt1.id, 
      'This frontend is amazing! The user interface is clean, intuitive, and responsive. The use of modern Angular directives, efficient rendering, and well-structured components truly make for a high-quality user experience.'
    );

    const prompt2 = session.addPrompt('What makes it so great?');
    session.addPromptAnswer(prompt2.id, 
      'The seamless integration of components, the proper state management, and the use of directives like @for and @if really enhance the performance. Also, the design choices, like the clean layout and smooth animations, give it a polished and professional feel.'
    );

    this.sessions.push(session);
  }

  private initializeGameDevSession(): void {
    const session = new ChatSession(this.generateSessionId(), 'Video Game Development', 'user125');

    const prompt1 = session.addPrompt('Can you tell me about video game development?');
    session.addPromptAnswer(prompt1.id, 
      'Video game development is a multifaceted process involving various disciplines such as programming, art, design, and sound. Developers use game engines like Unity or Unreal Engine to build and design games. The process typically starts with an idea, followed by prototyping, production, and testing.'
    );

    const prompt2 = session.addPrompt('What are some key skills required for game development?');
    session.addPromptAnswer(prompt2.id, 
      'Game development requires proficiency in programming (C#, C++, etc.), knowledge of game engines, and strong problem-solving skills. Additionally, skills in 3D modeling, animation, sound design, and storytelling are crucial for creating immersive and engaging game experiences.'
    );

    this.sessions.push(session);
  }

  getSessions(): ChatSession[] {
    return this.sessions;
  }

  switchSession(sessionId: string): void {
    if (!this.currentSession) {
      this.currentSession = this.sessions[0];
      this.currentSession.isCurrent = true;
    }

    if (this.currentSession.sessionId === sessionId) {
      return;
    }

    const session = this.sessions.find(s => s.sessionId === sessionId);
    if (session) {
      this.currentSession.isCurrent = false;
      this.currentSession = session;
      this.currentSession.isCurrent = true;
      
      this.chatbotEventService.notifySessionChange();
    }
  }

  sendMessage(message: string): void {
    console.log('Sending message:', message);
    this.currentSession.addUserMessage(message);
    this.chatbotEventService.userMessageSent.next();
  }

  handleAssistantResponse(promptId: string, message: string, isFinal: boolean = true): void {
    this.currentSession.addPromptAnswer(promptId, message, isFinal);
    this.chatbotEventService.chatbotMessageRecieved.next();
  }

  handleFiles(files: File[]): void {
    console.log('Handling files:', files);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
