import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ProviderModelsResponse, ChatRequestOptions, ChatCompletion, ChatRequest } from '../../chatbot-models/chatbot-api-models';
import { AuthService } from '../../../authentication/auth-service/auth.service';
import { HostService } from '../../../../core/services/host-service/host.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotApiService {
  private readonly baseUrl: string;
  private readonly baseChatbotUrl: string;
  private webSocket: WebSocket | null = null;
  private webSocketSubject: Subject<string> | null = null;

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

  getAllProviders(): Observable<string[]> {
    const url = `${this.baseChatbotUrl}/providers`;
    return this.http.get<string[]>(url, this.getAuthHeaders());
  }

  getAllModelsByProvider(providerName: string): Observable<ProviderModelsResponse> {
    const url = `${this.baseChatbotUrl}/provider/models?provider_name=${providerName}`;
    return this.http.get<ProviderModelsResponse>(url, this.getAuthHeaders());
  }

  requestUserChatCompletion(
    prompt: string,
    provider: string = 'azure_openai',
    provider_model: string = 'Azure GPT-3.5',
    options: ChatRequestOptions | null = null
  ): Observable<ChatCompletion> {
    const url = `${this.baseChatbotUrl}/chat`;
    const chatRequest: ChatRequest = {
      session_uuid: null,
      provider,
      provider_model,
      options,
      messages: [{ role: 'user', content: prompt, message_uuid: null }],
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
  // WebSocket Management
  // ------------------------------

  private createWebSocket(webSocketUrl: string): Subject<string> {
    if (this.webSocket) {
      return this.webSocketSubject!;
    }

    this.webSocket = new WebSocket(webSocketUrl);
    this.webSocketSubject = new Subject<string>();

    this.webSocket.onopen = () => console.log('WebSocket connection opened');
    this.webSocket.onmessage = (event) => this.webSocketSubject!.next(event.data);
    this.webSocket.onclose = () => {
      console.log('WebSocket connection closed');
      this.webSocketSubject!.complete();
      this.webSocket = null;
    };
    this.webSocket.onerror = (error) => console.error('WebSocket error:', error);

    return this.webSocketSubject;
  }

  sendChatPromptViaWebSocket(webSocketUrl: string, prompt: string, modelName: string): Observable<string> {
    const webSocketSubject = this.createWebSocket(webSocketUrl);

    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const requestBody = JSON.stringify({ prompt, model_name: modelName });
      this.webSocket.send(requestBody);
    }

    return webSocketSubject.asObservable();
  }

  closeWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
      this.webSocketSubject = null;
    }
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
