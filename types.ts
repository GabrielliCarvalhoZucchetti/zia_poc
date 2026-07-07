
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
  MARKET_MODEL = 'MARKET_MODEL',
  SKILL = 'SKILL'
}

export enum ResourceEnvironment {
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION'
}

export enum ToolType {
  HTTP = 'HTTP',
  MCP = 'MCP'
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
}

export interface Tool {
  id: string;
  name: string;
  type: ToolType;
  description: string;
  status: 'active' | 'inactive';
  parameters: ToolParameter[];
  
  // HTTP specific
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: { key: string; value: string }[];
  parameterMapping?: { paramName: string; location: 'query' | 'path' | 'body' | 'header' }[];
  bodyFormat?: 'JSON' | 'form-data';
  responseMapping?: string;

  // MCP specific
  serverUrl?: string;
  transportProtocol?: 'SSE' | 'stdio' | 'HTTP';
  authCredentials?: string;
  discoveredTools?: string[];
  selectedDiscoveredTool?: string;
}

export interface ResourceVersion {
  version: number;
  name: string;
  description: string;
  prompt?: string;
  webhookUrl?: string;
  webhookHeaders?: string;
  webhookBody?: string;
  model?: string;
  updatedAt: string;
  updatedBy: string;
  tools?: string[];
  schedulerEnabled?: boolean;
  schedulerPeriodicity?: string;
  schedulerTriggerType?: 'tool' | 'prompt';
  schedulerTriggerToolId?: string;
  schedulerTriggerPrompt?: string;
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
  model?: string;
  linkedDocs?: string[]; // IDs of documentation resources
  tools?: string[]; // IDs of linked tools
  environment: ResourceEnvironment;
  creatorId: string;
  creatorName?: string;
  creatorEmail?: string;
  creatorArea?: string;
  webhookUrl?: string;
  webhookHeaders?: string;
  webhookBody?: string;
  projectId?: string;
  version: number;
  updatedAt: string;
  history?: ResourceVersion[];
  schedulerEnabled?: boolean;
  schedulerPeriodicity?: string;
  schedulerTriggerType?: 'tool' | 'prompt';
  schedulerTriggerToolId?: string;
  schedulerTriggerPrompt?: string;
  subagents?: string[];
  isPublic?: boolean;
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
  reasoning?: string;
  reasoningSteps?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  resourceId: string;
  messages: Message[];
  updatedAt: string;
  unread?: boolean;
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
  bu?: string;
}

export interface ApiInteractionLog {
  id: string;
  author: string; // Caller author (e.g., User or System)
  resource: string; // Assistant/Agent name
  apiKeyName: string;
  input: string;
  model: string;
  output: string;
  timestamp: string;
  tokens?: number;
  cost?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  resourceId: string;
  resourceName: string;
  key: string; // Masked key
  status: 'Ativa' | 'Revogada';
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

export interface PreferredUseCase {
  id: string;
  name: string;
  description: string;
}

export interface LLMModel {
  id: string;
  name: string;
  provider?: string;
  isPublic: boolean;
  preferredUseCaseId: string; // References PreferredUseCase
  tokenLimitPerMonth: number;
  idealUse?: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  benchmarks: {
    reasoning: number;
    coding: number;
    speed: number;
    costEfficiency: number;
  };
  lunaConsumption: {
    totalCalls: number;
    tokensConsumed: number;
    estimatedCost: number;
  };
}

export interface UserUsage {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bu?: string;
  lastActivity: string;
  interactionsCount: number;
  accessedResources: string[]; // Names of resources/agents
  status: 'Ativo' | 'Inativo';
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
  requiresDoubleApproval?: boolean;
  ownerApproved?: boolean;
  iaTeamApproved?: boolean;
  resourceOwnerEmail?: string;
  metadata?: any;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  agentName: string;
  agentId: string;
  read: boolean;
  type: 'alert' | 'success' | 'info';
}
