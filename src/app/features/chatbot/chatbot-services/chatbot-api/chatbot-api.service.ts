import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ProviderModelsResponse, ChatRequestOptions, ChatCompletion, ChatRequest } from '../../chatbot-models/chatbot-api-models';
import { AuthService } from '../../../authentication/auth-service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotApiService {
  private readonly baseUrl: string;
  private webSocket: WebSocket | null = null;
  private webSocketSubject: Subject<string> | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly chatbotEventService: ChatbotEventService,
    private readonly authService: AuthService
  ) {
    // Dynamically set the API URL based on the current host
    const host = window.location.host;
    const protocol = window.location.protocol;
    this.baseUrl = `${protocol}//${host}/api/chatbot`;  // Route API calls through Nginx
  }



  
  // ------------------------------
  // API Methods
  // ------------------------------

  getAllProviders(): Observable<string[]> {
    const url = `${this.baseUrl}/providers`;
    return this.http.get<string[]>(url, { headers: this.authService.headers });
  }

  getAllModelsByProvider(providerName: string): Observable<ProviderModelsResponse> {
    const url = `${this.baseUrl}/provider/models?provider_name=${providerName}`;
    return this.http.get<ProviderModelsResponse>(url, { headers: this.authService.headers });
  }


  requestUserChatCompletion(
    prompt: string,
    provider: string = 'azure_openai',
    provider_model: string = 'Azure GPT-3.5',
    options: ChatRequestOptions | null = null
  ): Observable<ChatCompletion> {
    const url = `${this.baseUrl}/chat`;
    const chatRequest: ChatRequest = {
      session_uuid: null,
      provider,
      provider_model,
      options,
      messages: [{ role: 'user', content: prompt, message_uuid: null }],
    };
  
    console.log('Chat Request:', chatRequest);
  
    return this.http.post<ChatCompletion>(url, chatRequest, { headers: this.authService.headers }).pipe(
      map((response) => {
        // Log and process the response if needed
        console.log('Chat Completion Response:', response);
        return response;
      })
    );
  }
  


  sendPromptFeedback(promptAnswerId: number, voteType: string): Observable<any> {
    const url = `${this.baseUrl}/feedback`;
    const requestBody = { prompt_answer_id: promptAnswerId, vote_type: voteType };
    return this.http.post<any>(url, requestBody);
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
  // Temporary Methods
  // ------------------------------

  tempChromaDbIngestion(): Observable<any> {
    const host = window.location.host;
    const protocol = window.location.protocol;
    const url = `${protocol}//${host}/api/temp/chroma/ingest`;
    
    return this.http.get(url).pipe(map((response) => console.log('Chroma DB Ingestion:', response)));
  }
  
  tempChromaDbDeletion(): Observable<any> {
    const host = window.location.host;
    const protocol = window.location.protocol;
    const url = `${protocol}//${host}/api/temp/chroma/ingest`;

    return this.http.get(url).pipe(map((response) => console.log('Chroma DB Deletion:', response)));
  }
  
  tempChromaDbCount(): void {
    const host = window.location.host;
    const protocol = window.location.protocol;
    const tempChromaBbCountURL = `${protocol}//${host}/api/temp/chroma/count`;

    const request = this.http.get<{ message: string; count: number }>(tempChromaBbCountURL);
    request.subscribe({
      next: (response) => {
        console.log('Chroma BB Injestion Response:', response);
        this.chatbotEventService.tempEvent_OnChromaDBCount.emit(response?.count);
      },
      error: (error) => {
        console.error('Error from Chroma BB Injestion:', error);
      },
      complete: () => {
        console.log('Chroma BB Injestion Complete');
      },
    });
  }
}
