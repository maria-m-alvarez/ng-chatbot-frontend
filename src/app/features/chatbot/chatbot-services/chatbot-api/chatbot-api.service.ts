import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChatCompletion,
  ChatSession,
  PromptResultFeedback,
  ProviderModelsResponse,
  LLMProvider,
  ChatSessionWithMessages
} from '../../chatbot-models/chatbot-api-response-models';
import { AuthService } from '../../../authentication/auth-service/auth.service';
import { HostService } from '../../../../core/services/host-service/host.service';
import { ChatOptionsRequest, ChatRequest, ChatSessionRequest, PromptResultFeedbackRequest } from '../../chatbot-models/chatbot-api-request-models';

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

  getSessionById(
    sessionId: number,
    markAsLatest = false,
    state?: string[]
  ): Observable<ChatSession> {
    const requestBody: ChatSessionRequest = {
      session_id: sessionId,
      get_messages: false,
      mark_as_latest: markAsLatest,
      state: state && state.length > 0 ? state : ["a"]
    };
  
    return this.http.post<ChatSession>(
      `${this.baseChatbotUrl}/sessions/get`,
      requestBody,
      this.getAuthHeaders()
    );
  }

  getSessionWithMessages(
    sessionId: number | string,
    markAsLatest = false,
    state?: string[]
  ): Observable<ChatSessionWithMessages> {
    const requestBody: ChatSessionRequest = {
      session_id: sessionId,
      get_messages: true,
      mark_as_latest: markAsLatest,
      state: state && state.length > 0 ? state : ["a"]
    };
  
    return this.http.post<ChatSessionWithMessages>(
      `${this.baseChatbotUrl}/sessions/get`,
      requestBody,
      this.getAuthHeaders()
    );
  }

  renameSession(sessionId: string | number, newName: string): Observable<{ message: string; session: ChatSession }> {
    return this.http.put<{ message: string; session: ChatSession }>(
      `${this.baseChatbotUrl}/sessions/${sessionId}/rename?new_name=${encodeURIComponent(newName)}`,
      {},
      this.getAuthHeaders()
    );
  }
  
  softDeleteSession(sessionId: string | number): Observable<{ message: string; session: ChatSession }> {
    return this.http.put<{ message: string; session: ChatSession }>(
      `${this.baseChatbotUrl}/sessions/${sessionId}/delete`,
      {},
      this.getAuthHeaders()
    );
  }
  
  createDocSessionWithFiles(name: string, files: File[]): Observable<ChatSession> {
    const formData = new FormData();
    formData.append('name', name);

    // Append each file
    for (const file of files) {
      formData.append('files', file);
    }

    // Use getMultipartHeaders()
    return this.http.post<ChatSession>(
      `${this.baseChatbotUrl}/sessions/doc_session`,
      formData,
      { headers: this.authService.getMultipartHeaders() }
    );
  }

  addFilesToSession(sessionId: number, files: File[]): Observable<ChatSession> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file, file.name));

    return this.http.post<ChatSession>(
      `${this.baseChatbotUrl}/sessions/${sessionId}/files`,
      formData,
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
