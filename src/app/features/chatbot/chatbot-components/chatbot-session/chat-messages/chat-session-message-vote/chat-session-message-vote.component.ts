import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatbotSessionService } from '../../../../chatbot-services/chatbot-session/chatbot-session.service';
import { ChatMessage } from '../../../../chatbot-models/chatbot-api-response-models';
import { ClientChatMessage } from '../../../../chatbot-models/chatbot-client-session';

export enum VoteStyle {
  Thumbs = 'thumbs',
  Rating = 'rating',
}

@Component({
  selector: 'app-chat-session-message-vote',
  standalone: true,
  templateUrl: './chat-session-message-vote.component.html',
  styleUrls: ['./chat-session-message-vote.component.scss'],
})
export class ChatSessionMessageVoteComponent {
  @Input() chatMessage: ChatMessage | ClientChatMessage | null = null;
  @Input() voteStyle: string = VoteStyle.Thumbs;
  @Input() maxRating: number = 5;
  @Input() initialRating: number = 0;

  @Output() voteUpdated = new EventEmitter<number>();

  ratingOptions: number[] = [];
  selectedRating = 0;
  hoverRating = 0;
  hasVoted = false;

  constructor(
    private readonly chatbotSessionService: ChatbotSessionService
  ) {}

  ngOnInit() {
    this.initializeRatingOptions();
    this.selectedRating = this.initialRating;
    this.hasVoted = this.selectedRating > 0;
  }

  initializeRatingOptions() {
    this.ratingOptions = Array.from({ length: this.maxRating }, (_, i) => i + 1);
  }

  vote(vote: string) {
    console.log('Voted:', vote);
  }

  applyVoteRating(vote: number) {
    if (this.hasVoted) {
      return;
    }

    this.selectedRating = vote;
    this.hasVoted = true;
    
    if (this.chatMessage?.id) {
      this.chatbotSessionService.sendAssistantMessageFeedback(this.chatMessage.id.toString(), this.selectedRating, "");
    }
    this.voteUpdated.emit(this.selectedRating);
  }

  setVote(rating: number) {
    this.selectedRating = rating;
    this.hasVoted = true;
  }

  hoverStar(star: number) {
    if (!this.hasVoted) {
      this.hoverRating = star
    }
  }
}
