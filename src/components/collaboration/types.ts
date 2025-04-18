
export interface CollaboratorInfo {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastEdit?: string;
  isAI?: boolean;
}

export interface Message {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAI?: boolean;
  isEdit?: boolean;
  editDetails?: {
    sectionIndex?: number;
    sectionTitle?: string;
    changeType: 'title' | 'content' | 'add' | 'delete';
    oldValue?: string;
    newValue?: string;
  };
}

export interface EditRequest {
  type: 'title' | 'content' | 'add' | 'delete';
  sectionIndex?: number;
  sectionTitle?: string;
  newValue?: string;
  collaborator: CollaboratorInfo;
}

export interface EditHistoryItem {
  id: string;
  timestamp: Date;
  collaborator: CollaboratorInfo;
  type: 'title' | 'content' | 'add' | 'delete';
  sectionIndex?: number;
  sectionTitle?: string;
  oldValue?: string;
  newValue?: string;
}
