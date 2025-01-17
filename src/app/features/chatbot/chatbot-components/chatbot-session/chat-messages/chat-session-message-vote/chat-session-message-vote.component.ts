import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatbotSessionService } from '../../../../chatbot-services/chatbot-session/chatbot-session.service';

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
  @Input() messageId: string = '';
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

  voteStar(vote: number) {
    if (this.hasVoted) {
      return;
    }

    this.selectedRating = vote;
    this.hasVoted = true;
    
    this.chatbotSessionService.sendPromptResultFeedback(this.messageId, this.selectedRating, "");
    this.voteUpdated.emit(this.selectedRating);
  }

  setVote(messageId: string, rating: number) {
    if (this.messageId !== messageId) {
      console.warn('Vote message ID does not match:', this.messageId, messageId);
      return;
    }

    this.selectedRating = rating;
    this.hasVoted = true;
  }

  hoverStar(star: number) {
    if (!this.hasVoted) {
      this.hoverRating = star
    }
  }
}
