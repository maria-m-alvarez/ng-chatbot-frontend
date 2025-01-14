import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatRequestOptions, ChatCompletion, ChatRequest } from '../../chatbot-models/chatbot-api-models';
import { AuthService } from '../../../authentication/auth-service/auth.service';
import { HostService } from '../../../../core/services/host-service/host.service';
import { ChatSession } from '../../chatbot-models/chatbot-session';

@Injectable({
  providedIn: 'root',
})
export class ChatbotApiService {
  private readonly baseUrl: string;
  private readonly baseChatbotUrl: string;

  constructor(
    private readonly http: HttpClient,
    private readonly hostService: HostService,
    private readonly chatbotEventService: ChatbotEventService,
    private readonly authService: AuthService
  ) {
    this.baseUrl = this.hostService.getHostBaseURL();
    this.baseChatbotUrl = `${this.hostService.getHostBaseURL()}/chatbot`;
  }

  // ------------------------------
  // Helper Method for HTTP Headers
  // ------------------------------
  private getAuthHeaders() {
    return { headers: this.authService.headers };
  }

  // ------------------------------
  // API Methods
  // ------------------------------

  // Providers & LLMs
  // ------------------------------
  getAllProviders(): Observable<string[]> {
    const url = `${this.baseChatbotUrl}/providers`;
    return this.http.get<string[]>(url, this.getAuthHeaders());
  }

  getAllModelsByProvider(providerName: string): Observable<any[]> {
    const url = `${this.baseChatbotUrl}/provider/models?provider_name=${providerName}`;
    return this.http.get<any[]>(url, this.getAuthHeaders()).pipe(
        map((models) => {
            console.log('Models by Provider:', models);
            return models.map((model) => ({
                name: model.name,
                id: model.id,
                providerId: model.provider_id,
            }));
        })
    );
  }


  // Sessions
  // ------------------------------
  getAllSessions(): Observable<ChatSession[]> {
    const url = `${this.baseChatbotUrl}/sessions`;
    return this.http.get<ChatSession[]>(url, this.getAuthHeaders());
  }
  
  createSession(sessionName: string): Observable<ChatSession> {
    const url = `${this.baseChatbotUrl}/session`;
    const requestBody = { name: sessionName };
  
    console.log('Creating session with name:', sessionName);
  
    return this.http.post<ChatSession>(url, requestBody, this.getAuthHeaders()).pipe(
      map((response: any) => {
        console.log('Session creation response:', response);
  
        // Ensure compatibility with the ChatSession model
        return new ChatSession(
          response.id.toString(),
          response.name,
          response.user
        );
      })
    );
  }  
  
  
  getSessionById(sessionId: number): Observable<ChatSession> {
    const url = `${this.baseChatbotUrl}/sessions/${sessionId}`;
    return this.http.get<ChatSession>(url, this.getAuthHeaders());
  }
  
  getSessionWithMessages(sessionId: number): Observable<any> {
    const url = `${this.baseChatbotUrl}/sessions/${sessionId}/messages`;
    return this.http.get<any>(url, this.getAuthHeaders()).pipe(
      map((response) => {
        console.log('Session with Messages Response:', response);
        return response;
      })
    );
  }

  
  // Chatbot Requests
  // ------------------------------
  requestUserChatCompletion(
    prompt: string,
    provider: string = 'azure_openai',
    provider_model: string = 'Azure GPT-3.5',
    options: ChatRequestOptions | null = null,
    sessionId: number = -1 // Default session ID to align with Python API
  ): Observable<ChatCompletion> {
    const url = `${this.baseChatbotUrl}/chat`;
  
    // Create the ChatRequest object with the expected structure
    const chatRequest: ChatRequest = {
      session_id: sessionId, // Align with Python API field
      provider,
      provider_model,
      options,
      messages: [{ role: 'user', content: prompt }],
    };
  
    console.log('Chat Request:', chatRequest);
  
    return this.http.post<ChatCompletion>(url, chatRequest, this.getAuthHeaders()).pipe(
      map((response) => {
        console.log('Chat Completion Response:', response);
        return response;
      })
    );
  }
  

  sendPromptFeedback(promptAnswerId: number, voteType: string): Observable<any> {
    const url = `${this.baseChatbotUrl}/feedback`;
    const requestBody = { prompt_answer_id: promptAnswerId, vote_type: voteType };
    return this.http.post<any>(url, requestBody, this.getAuthHeaders());
  }

  
  // ------------------------------
  // VectorDB Methods
  // ------------------------------

  vectorDbIngestion(): Observable<any> {
    const url = `${this.baseUrl}/vectordb/deprecated_ingest`;
    const requestBody = {
      access_group_names: ["string"],
      project_name: "default_project",
    };
  
    return this.http.post<any>(url, requestBody, this.getAuthHeaders()).pipe(
      map((response) => {
        console.log('Chroma DB Ingestion Response:', response);
        this.vectorDbCount();
        return response;
      })
    );
  }
  

  vectorDbDeletion(): Observable<any> {
    const url = `${this.baseUrl}/vectordb/delete`;
    return this.http.get(url, this.getAuthHeaders()).pipe(
      map((response) => {
        console.log('Chroma DB Deletion:', response);
        return response;
      })
    );
  }

  vectorDbCount(): void {
    const url = `${this.baseUrl}/vectordb/count`;

    const request = this.http.get<{ message: string; count: number }>(url, this.getAuthHeaders());
    request.subscribe({
      next: (response) => {
        console.log('Chroma BB Count Response:', response);
        this.chatbotEventService.tempEvent_OnChromaDBCount.emit(response?.message);
      },
      error: (error) => {
        console.error('Error from Chroma BB Count:', error);
      },
      complete: () => {
        console.log('Chroma BB Count Complete');
      },
    });
  }
}
