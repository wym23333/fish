
export type Page = 'chat' | 'profile';

export interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'friend';
  timestamp: string;
  mediaUrl?: string;
  reaction?: string;
}

export interface UserStats {
  following: string;
  followers: string;
  likes: string;
}
