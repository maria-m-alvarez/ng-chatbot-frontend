
export enum Role {
    Assistant = 'assistant',
    User = 'user'
}

export enum ChatSessionType {
    Text,
    Document
}

export enum ChatSessionState {
    NoSession = "no_session",
    Creating = "creating",
    Active = "active",
    Transitioning = "transitioning",
}

export enum ChatSessionCreationState {
    Idle = "idle",
    WaitingFirstMessage = "waiting_first_message",
    Creating = "creating",
    WaitingFirstMessageResponse = "waiting_first_message_response",
    Renaming = "renaming",
    Created = "created",
    Error = "error"
}

export const creationOrder = [
    ChatSessionCreationState.Idle,
    ChatSessionCreationState.WaitingFirstMessage,
    ChatSessionCreationState.Creating,
    ChatSessionCreationState.WaitingFirstMessageResponse,
    ChatSessionCreationState.Renaming,
    ChatSessionCreationState.Created,
    ChatSessionCreationState.Error
];

export enum ChatSessionInteractionState {
    Idle,
    Typing,
    Loading,
    Dragging,
    Error
}

export enum ChatbotInputState {
    Idle,
    Waiting,
    Dragging,
    Error, 
}
