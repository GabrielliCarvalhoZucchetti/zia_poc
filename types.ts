
export enum UserRole {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ADMINISTRATOR = 'ADMINISTRATOR'
}

export enum AgentType {
  READING = 'READING',
  WRITING = 'WRITING',
  INTERPRETATION = 'INTERPRETATION',
  ACTION = 'ACTION'
}

export enum ResourceType {
  AGENT = 'AGENT',
  DOCUMENTATION = 'DOCUMENTATION'
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  agentType?: AgentType;
  requiredRole: UserRole;
  icon: string;
  createdAt: string;
  prompt?: string;
  linkedDocs?: string[]; // IDs of documentation resources
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  resourceId: string;
  messages: Message[];
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  scope: string;
  metrics: string;
  deadline: string;
  user: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}
