
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
  ASSISTANT = 'ASSISTANT',
  AUTOMATION = 'AUTOMATION',
  DOCUMENTATION = 'DOCUMENTATION',
  MARKET_MODEL = 'MARKET_MODEL'
}

export enum ResourceEnvironment {
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION'
}

export interface ResourceVersion {
  version: number;
  name: string;
  description: string;
  prompt?: string;
  webhookUrl?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  agentType?: AgentType;
  requiredRole: UserRole;
  createdAt: string;
  prompt?: string;
  linkedDocs?: string[]; // IDs of documentation resources
  environment: ResourceEnvironment;
  creatorId: string;
  webhookUrl?: string;
  projectId?: string;
  version: number;
  updatedAt: string;
  history?: ResourceVersion[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentId?: string;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  resourceId: string;
  messages: Message[];
  updatedAt: string;
}

export interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
}

export interface Subtask {
  id: string;
  title: string;
  description: string;
  type: 'Melhoria' | 'Bug' | 'Tarefa' | 'Novo Recurso';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  createdAt: string;
}

export interface ProjectAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'TRIAGEM' | 'REFINAMENTO' | 'DEV_SOLICITANTE' | 'DESENVOLVIMENTO' | 'MONITORAMENTO' | 'AG_SOLICITANTE' | 'IMPEDIDO' | 'CONCLUIDO' | 'CANCELADO';
  scope: string;
  metrics: string;
  deadline: string;
  user: string;
  email?: string;
  type?: 'Agente' | 'Assistente' | 'Automação';
  comments?: Comment[];
  subtasks?: Subtask[];
  attachments?: ProjectAttachment[];
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userBU: 'Comercial' | 'Administração' | 'Staff' | 'ERP' | 'POS' | 'HR TECH';
  resourceId: string;
  resourceName: string;
  resourceCategory: 'Agente' | 'Assistente' | 'Automação' | 'Promoção';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  reason?: string;
  metadata?: any;
}
