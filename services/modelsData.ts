import { LLMModel, PreferredUseCase } from '../types';

export const INITIAL_USE_CASES: PreferredUseCase[] = [
  {
    id: 'uc1',
    name: 'Análise Avançada & BI',
    description: 'Análise profunda de métricas de negócios, geração de relatórios estratégicos e extração de insights.'
  },
  {
    id: 'uc2',
    name: 'Desenvolvimento & Engenharia',
    description: 'Escrita, refatoração, documentação de código e auditoria em múltiplos sistemas de software.'
  },
  {
    id: 'uc3',
    name: 'Atendimento & Suporte ao Cliente',
    description: 'Respostas amigáveis e rápidas em tempo real integradas a chats ou centrais de atendimento.'
  },
  {
    id: 'uc4',
    name: 'Processamento de Documentos & RAG',
    description: 'Extração e perguntas baseadas em extensas bases de conhecimento e grandes manuais em PDF.'
  },
  {
    id: 'uc5',
    name: 'Automação Operacional & Webhooks',
    description: 'Execução automatizada de tarefas rotineiras e integração ágil com APIs e webhooks de parceiros.'
  }
];

export const INITIAL_MODELS: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    isPublic: true,
    preferredUseCaseId: 'uc1',
    tokenLimitPerMonth: 20000000,
    idealUse: 'Raciocínio lógico extremamente avançado, tomada de decisões estruturadas e análises financeiras ou de BI complexas.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    benchmarks: {
      reasoning: 95,
      coding: 92,
      speed: 85,
      costEfficiency: 70
    },
    lunaConsumption: {
      totalCalls: 124500,
      tokensConsumed: 185000000,
      estimatedCost: 925.00
    }
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    isPublic: true,
    preferredUseCaseId: 'uc3',
    tokenLimitPerMonth: 50000000,
    idealUse: 'Respostas de baixíssima latência para assistentes de conversação de alto volume e pré-processamento rápido de inputs.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    benchmarks: {
      reasoning: 78,
      coding: 70,
      speed: 95,
      costEfficiency: 98
    },
    lunaConsumption: {
      totalCalls: 450120,
      tokensConsumed: 620000000,
      estimatedCost: 93.00
    }
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    isPublic: true,
    preferredUseCaseId: 'uc2',
    tokenLimitPerMonth: 15000000,
    idealUse: 'Excelência absoluta em engenharia de software, refatoração de código legado, geração de testes e raciocínio técnico refinado.',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    benchmarks: {
      reasoning: 96,
      coding: 98,
      speed: 82,
      costEfficiency: 72
    },
    lunaConsumption: {
      totalCalls: 85400,
      tokensConsumed: 112000000,
      estimatedCost: 840.00
    }
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    isPublic: true,
    preferredUseCaseId: 'uc4',
    tokenLimitPerMonth: 30000000,
    idealUse: 'Análise de longas sequências de documentos (janela de contexto de 2M de tokens), cruzamento de múltiplas fontes de RAG e inputs multimodais.',
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    benchmarks: {
      reasoning: 92,
      coding: 88,
      speed: 80,
      costEfficiency: 82
    },
    lunaConsumption: {
      totalCalls: 62300,
      tokensConsumed: 950000000,
      estimatedCost: 665.00
    }
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    isPublic: true,
    preferredUseCaseId: 'uc5',
    tokenLimitPerMonth: 100000000,
    idealUse: 'Execuções de webhooks em tempo real de baixo custo, automações autônomas agendadas e chamadas repetitivas de API em lote.',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    benchmarks: {
      reasoning: 82,
      coding: 75,
      speed: 92,
      costEfficiency: 95
    },
    lunaConsumption: {
      totalCalls: 310500,
      tokensConsumed: 410000000,
      estimatedCost: 112.50
    }
  },
  {
    id: 'zucchetti-llama-3-1-private',
    name: 'Zucchetti Private LLaMA 3.1',
    provider: 'Zucchetti Private',
    isPublic: false,
    preferredUseCaseId: 'uc4',
    tokenLimitPerMonth: 80000000,
    idealUse: 'Garantia total de privacidade para dados sob a LGPD, processamento interno de faturamentos, notas fiscais e dados sensíveis de clientes.',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    benchmarks: {
      reasoning: 84,
      coding: 80,
      speed: 88,
      costEfficiency: 90
    },
    lunaConsumption: {
      totalCalls: 185000,
      tokensConsumed: 320000000,
      estimatedCost: 0.00
    }
  }
];

export const getStoredModels = (): LLMModel[] => {
  const cached = localStorage.getItem('luna_llm_models');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Merge with INITIAL_MODELS to ensure new fields are present
      return parsed.map((model: LLMModel) => {
        const initialModel = INITIAL_MODELS.find(m => m.id === model.id);
        if (initialModel) {
          return {
            ...initialModel,
            ...model,
            contextWindow: model.contextWindow ?? initialModel.contextWindow,
            maxOutputTokens: model.maxOutputTokens ?? initialModel.maxOutputTokens
          };
        }
        return {
          ...model,
          contextWindow: model.contextWindow ?? 128000,
          maxOutputTokens: model.maxOutputTokens ?? 4096
        };
      });
    } catch (e) {
      // return initial
    }
  }
  localStorage.setItem('luna_llm_models', JSON.stringify(INITIAL_MODELS));
  return INITIAL_MODELS;
};

export const getStoredUseCases = (): PreferredUseCase[] => {
  const cached = localStorage.getItem('luna_preferred_use_cases');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // return initial
    }
  }
  localStorage.setItem('luna_preferred_use_cases', JSON.stringify(INITIAL_USE_CASES));
  return INITIAL_USE_CASES;
};

export const saveModels = (models: LLMModel[]) => {
  localStorage.setItem('luna_llm_models', JSON.stringify(models));
};

export const saveUseCases = (useCases: PreferredUseCase[]) => {
  localStorage.setItem('luna_preferred_use_cases', JSON.stringify(useCases));
};
