import React, { useState, useEffect } from 'react';
import { LLMModel, PreferredUseCase } from '../types';
import { getStoredModels, getStoredUseCases, saveModels, saveUseCases } from '../services/modelsData';
import { Icons } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [useCases, setUseCases] = useState<PreferredUseCase[]>([]);
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  
  // Modals
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isUseCaseModalOpen, setIsUseCaseModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);

  // Form States for Model
  const [modelName, setModelName] = useState('');
  const [modelProvider, setModelProvider] = useState('');
  const [modelIsPublic, setModelIsPublic] = useState(true);
  const [modelPreferredUseCaseId, setModelPreferredUseCaseId] = useState('');
  const [modelTokenLimit, setModelTokenLimit] = useState(10000000);
  const [modelContextWindow, setModelContextWindow] = useState(128000);
  const [modelMaxOutputTokens, setModelMaxOutputTokens] = useState(4096);
  const [modelIdealUse, setModelIdealUse] = useState('');
  const [modelBenchmarkReasoning, setModelBenchmarkReasoning] = useState(85);
  const [modelBenchmarkCoding, setModelBenchmarkCoding] = useState(80);
  const [modelBenchmarkSpeed, setModelBenchmarkSpeed] = useState(85);
  const [modelBenchmarkCost, setModelBenchmarkCost] = useState(85);

  // Form States for Use Case
  const [useCaseName, setUseCaseName] = useState('');
  const [useCaseDescription, setUseCaseDescription] = useState('');

  // Load initial data
  useEffect(() => {
    const loadedModels = getStoredModels();
    const loadedUseCases = getStoredUseCases();
    setModels(loadedModels);
    setUseCases(loadedUseCases);
    if (loadedModels.length > 0) {
      setSelectedModel(loadedModels[0]);
    }
  }, []);

  // Save changes helper
  const updateModelsState = (updated: LLMModel[]) => {
    setModels(updated);
    saveModels(updated);
    if (selectedModel) {
      const stillExists = updated.find(m => m.id === selectedModel.id);
      setSelectedModel(stillExists || updated[0] || null);
    }
  };

  const updateUseCasesState = (updated: PreferredUseCase[]) => {
    setUseCases(updated);
    saveUseCases(updated);
  };

  // Open Model Modal for Create
  const handleOpenCreateModel = () => {
    setEditingModel(null);
    setModelName('');
    setModelProvider('Google');
    setModelIsPublic(true);
    setModelPreferredUseCaseId(useCases[0]?.id || '');
    setModelTokenLimit(30000000);
    setModelContextWindow(128000);
    setModelMaxOutputTokens(4096);
    setModelIdealUse('');
    setModelBenchmarkReasoning(80);
    setModelBenchmarkCoding(75);
    setModelBenchmarkSpeed(85);
    setModelBenchmarkCost(80);
    setIsModelModalOpen(true);
  };

  // Open Model Modal for Edit
  const handleOpenEditModel = (model: LLMModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingModel(model);
    setModelName(model.name);
    setModelProvider(model.provider || 'Geral');
    setModelIsPublic(model.isPublic);
    setModelPreferredUseCaseId(model.preferredUseCaseId);
    setModelTokenLimit(model.tokenLimitPerMonth);
    setModelContextWindow(model.contextWindow || 128000);
    setModelMaxOutputTokens(model.maxOutputTokens || 4096);
    setModelIdealUse(model.idealUse || '');
    setModelBenchmarkReasoning(model.benchmarks.reasoning);
    setModelBenchmarkCoding(model.benchmarks.coding);
    setModelBenchmarkSpeed(model.benchmarks.speed);
    setModelBenchmarkCost(model.benchmarks.costEfficiency);
    setIsModelModalOpen(true);
  };

  // Save Model (Create or Edit)
  const handleSaveModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) {
      alert('Por favor, informe o nome do modelo.');
      return;
    }

    if (editingModel) {
      // Edit mode
      const updated = models.map(m => {
        if (m.id === editingModel.id) {
          return {
            ...m,
            name: modelName,
            provider: modelProvider || 'Geral',
            isPublic: modelIsPublic,
            preferredUseCaseId: modelPreferredUseCaseId,
            tokenLimitPerMonth: modelTokenLimit,
            idealUse: modelIdealUse || '',
            contextWindow: modelContextWindow,
            maxOutputTokens: modelMaxOutputTokens,
            benchmarks: {
              reasoning: modelBenchmarkReasoning,
              coding: modelBenchmarkCoding,
              speed: modelBenchmarkSpeed,
              costEfficiency: modelBenchmarkCost
            }
          };
        }
        return m;
      });
      updateModelsState(updated);
    } else {
      // Create mode
      const newModel: LLMModel = {
        id: `m-${Date.now()}`,
        name: modelName,
        provider: modelProvider || 'Geral',
        isPublic: modelIsPublic,
        preferredUseCaseId: modelPreferredUseCaseId,
        tokenLimitPerMonth: modelTokenLimit,
        idealUse: modelIdealUse || '',
        contextWindow: modelContextWindow,
        maxOutputTokens: modelMaxOutputTokens,
        benchmarks: {
          reasoning: modelBenchmarkReasoning,
          coding: modelBenchmarkCoding,
          speed: modelBenchmarkSpeed,
          costEfficiency: modelBenchmarkCost
        },
        lunaConsumption: {
          totalCalls: 0,
          tokensConsumed: 0,
          estimatedCost: 0
        }
      };
      updateModelsState([...models, newModel]);
    }

    setIsModelModalOpen(false);
  };

  // Open Use Case Modal
  const handleOpenCreateUseCase = () => {
    setUseCaseName('');
    setUseCaseDescription('');
    setIsUseCaseModalOpen(true);
  };

  // Save Use Case
  const handleSaveUseCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!useCaseName.trim()) {
      alert('Por favor, insira o nome do caso de uso.');
      return;
    }

    const newUseCase: PreferredUseCase = {
      id: `uc-${Date.now()}`,
      name: useCaseName,
      description: useCaseDescription
    };

    const updated = [...useCases, newUseCase];
    updateUseCasesState(updated);
    setIsUseCaseModalOpen(false);
    alert('Caso de uso cadastrado com sucesso!');
  };

  // Delete Model
  const handleDeleteModel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza de que deseja excluir este modelo?')) {
      const updated = models.filter(m => m.id !== id);
      updateModelsState(updated);
    }
  };

  // Filter models
  const filteredModels = models.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = visibilityFilter === 'all' || 
                              (visibilityFilter === 'public' && m.isPublic) || 
                              (visibilityFilter === 'private' && !m.isPublic);
    
    return matchesSearch && matchesVisibility;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 font-sans">
      
      {/* Upper banner header with stylish background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 py-10 px-10 text-white shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Lista de Modelos de LLM</h1>
            <p className="text-sm text-slate-350 mt-1 max-w-2xl font-medium">
              Controle centralizado de modelos de linguagem disponíveis na Zucchetti. 
              Configure limites de consumo, veja relatórios de benchmark e defina modelos públicos ou privados com seus casos de uso preferenciais.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreateModel}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
            >
              <Icons.Plus className="w-4 h-4" />
              <span>Cadastrar Bench do Modelo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Filter and Model List */}
        <div className="w-full lg:w-[30%] border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
            <div className="relative">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar modelo por nome..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-250 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between">
              {/* Visibility filters */}
              <div className="flex bg-slate-200/60 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'public', label: 'Públicos' },
                  { id: 'private', label: 'Privados' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setVisibilityFilter(tab.id as any)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      visibilityFilter === tab.id 
                        ? 'bg-white text-sky-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-750'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Models */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
            {filteredModels.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icons.Cpu className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-xs font-bold text-slate-600">Nenhum modelo encontrado</div>
                <div className="text-[11px] text-slate-400 mt-1">Experimente remover alguns filtros ou buscar outro termo.</div>
              </div>
            ) : (
              filteredModels.map(model => {
                const isSelected = selectedModel?.id === model.id;
                const linkedUseCase = useCases.find(uc => uc.id === model.preferredUseCaseId);
                
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`p-4 rounded-[22px] border transition-all cursor-pointer relative group text-left ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500 shadow-sm' 
                        : 'border-slate-150 bg-white hover:border-slate-250 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-xs text-slate-800">{model.name}</h3>
                          
                          {/* Visibility badge */}
                          {model.isPublic ? (
                            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><circle cx="12" cy="12" r="3"/></svg>
                              Público
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[8px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
                              Privado
                            </span>
                          )}
                        </div>

                        {/* Context label */}
                        {model.idealUse && (
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <span className="text-[10px] font-semibold text-slate-400">Contexto:</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/30 max-w-[200px] truncate">
                              {model.idealUse}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hover action controls */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleOpenEditModel(model, e)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteModel(model.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Model View (Benchmarks, Consumption, and Parameters) */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex flex-col justify-between scrollbar-thin">
          {selectedModel ? (
            <motion.div
              key={selectedModel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 text-left"
            >
              
              {/* Header block inside details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">MÉTRICAS DO MODELO</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedModel.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${selectedModel.isPublic ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-indigo-700 bg-indigo-50 border border-indigo-100'}`}>
                      Visibilidade: {selectedModel.isPublic ? 'Disponível Publicamente' : 'Privado Corporativo'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleOpenEditModel(selectedModel, e)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-750 font-bold text-xs rounded-xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                  Editar Parâmetros
                </button>
              </div>

              {/* Detailed Specs Block */}
              <div className="grid grid-cols-1 gap-6">
                
                {/* Context detail card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                      </div>
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Contexto</span>
                    </div>
                    {selectedModel.idealUse ? (
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-650 font-medium leading-relaxed">{selectedModel.idealUse}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">Nenhum contexto informado.</p>
                    )}
                  </div>
                  
                  {/* Token limits monthly */}
                  <div className="hidden pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Limite de Tokens / Mês:</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {selectedModel.tokenLimitPerMonth.toLocaleString()} tokens
                    </span>
                  </div>
                </div>
              </div>

              {/* Unified Benchmarks & Capacity Report Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800">Relatório de Benchmarks & Capacidade de Contexto</h3>
                </div>

                {/* Capacity indicators integrated inside benchmarks section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Janela de Contexto</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100/50 px-2.5 py-1.5 rounded-xl border border-purple-200/50">
                      {selectedModel.contextWindow ? selectedModel.contextWindow.toLocaleString('pt-BR') : 'N/A'} tokens
                    </span>
                  </div>
                  <div className="bg-fuchsia-50/40 p-4 rounded-2xl border border-fuchsia-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-fuchsia-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Output Máximo</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-fuchsia-700 bg-fuchsia-100/50 px-2.5 py-1 rounded-xl border border-fuchsia-200/50">
                      {selectedModel.maxOutputTokens ? selectedModel.maxOutputTokens.toLocaleString('pt-BR') : 'N/A'} tokens
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Raciocínio & Lógica (Reasoning)', value: selectedModel.benchmarks.reasoning, color: 'bg-emerald-500' },
                    { label: 'Geração de Código (Coding)', value: selectedModel.benchmarks.coding, color: 'bg-blue-500' },
                    { label: 'Velocidade & Latência (Speed)', value: selectedModel.benchmarks.speed, color: 'bg-amber-500' },
                    { label: 'Eficiência de Custos (Cost)', value: selectedModel.benchmarks.costEfficiency, color: 'bg-indigo-500' }
                  ].map((bench, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-650">{bench.label}</span>
                        <span className="text-slate-800 font-extrabold">{bench.value}/100</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bench.value}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full ${bench.color}`}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
              <div className="w-16 h-16 bg-white border border-slate-100 rounded-[24px] flex items-center justify-center shadow-sm mb-4">
                <Icons.Cpu className="w-7 h-7 text-slate-350" />
              </div>
              <div className="text-sm font-bold text-slate-700">Nenhum Modelo Selecionado</div>
              <p className="text-xs text-slate-450 mt-1">Selecione um modelo à esquerda para visualizar benchmarks e estatísticas do Luna.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: Cadastro / Edição de Modelo */}
      <AnimatePresence>
        {isModelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left"
            >
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center">
                    <Icons.Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {editingModel ? 'Editar Modelo' : 'Cadastrar Novo Modelo LLM'}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium font-semibold">Defina as especificações lógicas e controle do modelo</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModelModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <form onSubmit={handleSaveModelSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                
                {/* Basic Section */}
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider ml-1">Nome do Modelo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: GPT-5 Enterprise"
                      value={modelName}
                      onChange={e => setModelName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Context Input Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider ml-1">Contexto</label>
                    <p className="text-[10px] text-slate-400 font-semibold mb-1">Descrição do contexto recomendado para o modelo</p>
                    <input
                      type="text"
                      placeholder="Ex: Ideal para análise de dados complexos"
                      value={modelIdealUse}
                      onChange={e => setModelIdealUse(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider ml-1 mb-2">Visibilidade / Privacidade</label>
                    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700">{modelIsPublic ? 'Modelo Público' : 'Modelo Privado'}</span>
                        <p className="text-[10px] text-slate-450">Públicos ficam listados para todos os times.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={modelIsPublic}
                          onChange={e => setModelIsPublic(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Token limits */}
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider ml-1">Limite Mensal de Tokens</label>
                    <input
                      type="number"
                      placeholder="Ex: 50000000"
                      value={modelTokenLimit}
                      onChange={e => setModelTokenLimit(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider ml-1">Janela de Contexto</label>
                    <input
                      type="number"
                      placeholder="Ex: 128000"
                      value={modelContextWindow}
                      onChange={e => setModelContextWindow(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider ml-1">Max Output Tokens</label>
                    <input
                      type="number"
                      placeholder="Ex: 4096"
                      value={modelMaxOutputTokens}
                      onChange={e => setModelMaxOutputTokens(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Benchmarks sliders */}
                <div className="border border-slate-150 p-6 rounded-2xl bg-slate-50/30 space-y-4">
                  <h4 className="text-xs font-bold text-slate-750 flex items-center gap-1.5 uppercase tracking-wide">
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c-.191-.568-1.002-.568-1.193 0L7.81 11.21l-8.283.947c-.615.07-.86.827-.413 1.259l6 5.845-1.702 8.164c-.127.608.509 1.07 1.049.756L12 23.51l7.242 4.123c.54.313 1.176-.148 1.049-.756l-1.702-8.164 6-5.845c.447-.432.202-1.19-.413-1.259l-8.283-.947-3.627-7.712z"/></svg>
                    Ajustar Notas de Benchmark (1 a 100)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Raciocínio & Lógica', val: modelBenchmarkReasoning, set: setModelBenchmarkReasoning },
                      { label: 'Geração de Código', val: modelBenchmarkCoding, set: setModelBenchmarkCoding },
                      { label: 'Velocidade & Latência', val: modelBenchmarkSpeed, set: setModelBenchmarkSpeed },
                      { label: 'Eficiência de Custo', val: modelBenchmarkCost, set: setModelBenchmarkCost }
                    ].map((slider, idx) => (
                      <div key={idx} className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600">{slider.label}</span>
                          <span className="text-indigo-650">{slider.val}/100</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={slider.val}
                          onChange={e => slider.set(Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModelModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md"
                  >
                    {editingModel ? 'Salvar Alterações' : 'Cadastrar Modelo'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Cadastro de Caso de Uso Preferencial */}
      <AnimatePresence>
        {isUseCaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col text-left"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900 tracking-tight">Novo Caso de Uso Preferencial</h3>
                    <p className="text-[10px] text-slate-400 font-semibold font-sans">Cadastre uma nova relação de uso ideal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUseCaseModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <form onSubmit={handleSaveUseCaseSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider ml-1">Nome do Caso de Uso *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Análise Jurídica Sênior"
                    value={useCaseName}
                    onChange={e => setUseCaseName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider ml-1">Descrição Detalhada *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Descreva de forma curta o que este caso de uso envolve para mapear com o modelo."
                    value={useCaseDescription}
                    onChange={e => setUseCaseDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUseCaseModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Confirmar Cadastro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ModelsPage;
