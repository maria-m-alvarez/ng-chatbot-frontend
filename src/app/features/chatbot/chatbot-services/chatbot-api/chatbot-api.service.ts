import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChatCompletion,
  ChatSession,
  ChatMessage,
  PromptResultFeedback,
  ProviderModelsResponse,
  LLMProvider,
  ChatSessionWithMessages
} from '../../chatbot-models/chatbot-api-response-models';
import { AuthService } from '../../../authentication/auth-service/auth.service';
import { HostService } from '../../../../core/services/host-service/host.service';
import { ChatOptionsRequest, ChatRequest, PromptResultFeedbackRequest } from '../../chatbot-models/chatbot-api-request-models';

@Injectable({
  providedIn: 'root',
})
export class ChatbotApiService {
  private readonly baseUrl: string;
  private readonly baseChatbotUrl: string;

  constructor(
    private readonly http: HttpClient,
    private readonly hostService: HostService,
    private readonly authService: AuthService
  ) {
    this.baseUrl = this.hostService.getHostBaseURL();
    this.baseChatbotUrl = `${this.baseUrl}/chatbot`;
  }

  private getAuthHeaders() {
    return { headers: this.authService.headers };
  }

  // ------------------------------
  // LLM & Provider Endpoints
  // ------------------------------
  getAllProviders(): Observable<LLMProvider[]> {
    return this.http.get<LLMProvider[]>(`${this.baseChatbotUrl}/providers`, this.getAuthHeaders());
  }

  getAllModelsByProvider(providerName: string): Observable<ProviderModelsResponse> {
    return this.http.get<ProviderModelsResponse>(
      `${this.baseChatbotUrl}/provider/models?provider_name=${providerName}`,
      this.getAuthHeaders()
    );
  }

  // ------------------------------
  // Chat Session Endpoints
  // ------------------------------
  getAllSessions(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.baseChatbotUrl}/sessions`, this.getAuthHeaders());
  }

  createSession(sessionName: string): Observable<ChatSession> {
    return this.http.post<ChatSession>(
      `${this.baseChatbotUrl}/sessions/new`,
      { name: sessionName },
      this.getAuthHeaders()
    );
  }

  getRecentlyAccessedSession(): Observable<ChatSession> {
    return this.http.get<ChatSession>(`${this.baseChatbotUrl}/sessions/recent`, this.getAuthHeaders());
  }

  getSessionById(sessionId: string): Observable<ChatSession> {
    return this.http.get<ChatSession>(`${this.baseChatbotUrl}/sessions/${sessionId}`, this.getAuthHeaders());
  }

  getSessionWithMessages(sessionId: string | number): Observable<ChatSessionWithMessages> {
    return this.http.get<ChatSessionWithMessages>(
      `${this.baseChatbotUrl}/sessions/${sessionId}/messages`,
      this.getAuthHeaders()
    );
  }
  

  // ------------------------------
  // Chatbot Requests
  // ------------------------------
  requestUserChatCompletion(
    prompt: string,
    provider: string = 'azure_openai',
    provider_model: string = 'Azure gpt-4o-mini',
    options: ChatOptionsRequest | null = null,
    sessionId: number = -1
  ): Observable<ChatCompletion> {
    const chatRequest: ChatRequest = {
      session_id: sessionId,
      provider,
      provider_model,
      options,
      messages: [{ message_id: -1, role: 'user', content: prompt }],
    };

    return this.http.post<ChatCompletion>(`${this.baseChatbotUrl}/chat`, chatRequest, this.getAuthHeaders());
  }

  sendPromptResultFeedback(promptResultId: string, rating: number, comments?: string): Observable<PromptResultFeedback> {
    const requestBody: PromptResultFeedbackRequest = {
      prompt_result_id: Number(promptResultId),
      rating,
      comments: comments ?? null,
    };
  
    return this.http.post<PromptResultFeedback>(
      `${this.baseChatbotUrl}/chat/feedback`,
      requestBody,
      this.getAuthHeaders()
    );
  }
  

  // ------------------------------
  // VectorDB Methods
  // ------------------------------
  vectorDbIngestion(): Observable<any> {
    const requestBody = { access_group_names: ['string'], project_name: 'default_project' };
    return this.http.post<any>(`${this.baseUrl}/vectordb/deprecated_ingest`, requestBody, this.getAuthHeaders());
  }

  vectorDbDeletion(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/vectordb/delete`, this.getAuthHeaders());
  }

  vectorDbCount(): Observable<{ message: string; count: number }> {
    return this.http.get<{ message: string; count: number }>(`${this.baseUrl}/vectordb/count`, this.getAuthHeaders());
  }
}
