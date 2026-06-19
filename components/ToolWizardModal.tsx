import React, { useState, useEffect } from 'react';
import { Tool, ToolType, ToolParameter } from '../types';
import { Icons } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface ToolWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Tool) => void;
  existingTool: Tool | null; // Prefills state if in editing mode
  siblingTools: Tool[]; // To prevent name duplicate conflicts inside the same resource
}

export const ToolWizardModal: React.FC<ToolWizardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTool,
  siblingTools
}) => {
  // Stepper state
  const [step, setStep] = useState(1);

  // Form states
  const [toolType, setToolType] = useState<ToolType>(ToolType.HTTP);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [parameters, setParameters] = useState<ToolParameter[]>([]);

  // HTTP Connection Specifics
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [parameterMapping, setParameterMapping] = useState<{ paramName: string; location: 'query' | 'path' | 'body' | 'header' }[]>([]);
  const [bodyFormat, setBodyFormat] = useState<'JSON' | 'form-data'>('JSON');
  const [responseMapping, setResponseMapping] = useState('');

  // MCP Connection Specifics
  const [serverUrl, setServerUrl] = useState('');
  const [transportProtocol, setTransportProtocol] = useState<'SSE' | 'stdio' | 'HTTP'>('SSE');
  const [authCredentials, setAuthCredentials] = useState('');
  const [discoveredTools, setDiscoveredTools] = useState<string[]>([]);
  const [selectedDiscoveredTool, setSelectedDiscoveredTool] = useState('');

  // Utility states
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverMessage, setDiscoverMessage] = useState('');
  const [hasDiscoveredSuccessfully, setHasDiscoveredSuccessfully] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Reset or pre-fill states on open/change
  useEffect(() => {
    if (isOpen) {
      if (existingTool) {
        setStep(1);
        setToolType(existingTool.type);
        setName(existingTool.name);
        setDescription(existingTool.description);
        setStatus(existingTool.status);
        setParameters(existingTool.parameters || []);
        
        // HTTP
        setUrl(existingTool.url || '');
        setMethod(existingTool.method || 'GET');
        setHeaders(existingTool.headers?.length ? existingTool.headers : [{ key: '', value: '' }]);
        setParameterMapping(existingTool.parameterMapping || []);
        setBodyFormat(existingTool.bodyFormat || 'JSON');
        setResponseMapping(existingTool.responseMapping || '');

        // MCP
        setServerUrl(existingTool.serverUrl || '');
        setTransportProtocol(existingTool.transportProtocol || 'SSE');
        setAuthCredentials(existingTool.authCredentials || '');
        setDiscoveredTools(existingTool.discoveredTools || []);
        setSelectedDiscoveredTool(existingTool.selectedDiscoveredTool || '');
        setHasDiscoveredSuccessfully(!!existingTool.selectedDiscoveredTool);
      } else {
        // Reset to initial
        setStep(1);
        setToolType(ToolType.HTTP);
        setName('');
        setDescription('');
        setStatus('active');
        setParameters([]);
        setUrl('');
        setMethod('GET');
        setHeaders([{ key: '', value: '' }]);
        setParameterMapping([]);
        setBodyFormat('JSON');
        setResponseMapping('');
        setServerUrl('');
        setTransportProtocol('SSE');
        setAuthCredentials('');
        setDiscoveredTools([]);
        setSelectedDiscoveredTool('');
        setHasDiscoveredSuccessfully(false);
      }
      setValidationError('');
    }
  }, [isOpen, existingTool]);

  // Add/remove headers
  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...headers];
    updated[index][field] = val;
    setHeaders(updated);
  };

  // Add/remove parameters
  const handleAddParameter = () => {
    setParameters([...parameters, { name: '', type: 'string', required: true, description: '' }]);
  };

  const handleRemoveParameter = (index: number) => {
    const paramToRemove = parameters[index];
    setParameters(parameters.filter((_, i) => i !== index));
    // Also remove parameter mapping for this param
    if (paramToRemove) {
      setParameterMapping(parameterMapping.filter(pm => pm.paramName !== paramToRemove.name));
    }
  };

  const handleParameterChange = (index: number, updatedParam: Partial<ToolParameter>) => {
    const updated = [...parameters];
    const oldName = updated[index].name;
    updated[index] = { ...updated[index], ...updatedParam } as ToolParameter;
    setParameters(updated);

    // If param name changes, reflect in map
    if (updatedParam.name && updatedParam.name !== oldName) {
      setParameterMapping(parameterMapping.map(pm => pm.paramName === oldName ? { ...pm, paramName: updatedParam.name! } : pm));
    }
  };

  // Sync parameter mapping list when parameters change (make sure every parameter has a mapping if in HTTP mode)
  useEffect(() => {
    if (toolType === ToolType.HTTP) {
      const validNames = parameters.map(p => p.name).filter(Boolean);
      // Remove stale mapping
      let updatedMapping = parameterMapping.filter(pm => validNames.includes(pm.paramName));
      // Add missing mappings
      validNames.forEach(name => {
        if (!updatedMapping.some(pm => pm.paramName === name)) {
          updatedMapping.push({ paramName: name, location: 'query' });
        }
      });
      setParameterMapping(updatedMapping);
    }
  }, [parameters, toolType]);

  const handleMappingChange = (paramName: string, location: 'query' | 'path' | 'body' | 'header') => {
    setParameterMapping(parameterMapping.map(pm => pm.paramName === paramName ? { ...pm, location } : pm));
  };

  // Trigger MCP Tool Discovery simulation/mock
  const handleConnectAndDiscoverMcp = () => {
    if (!serverUrl.trim()) {
      setValidationError("O endereço do servidor MCP é obrigatório.");
      return;
    }
    setValidationError('');
    setIsDiscovering(true);
    setDiscoverMessage("Iniciando Handshake de descoberta do protocolo MCP...");

    setTimeout(() => {
      setDiscoverMessage("Negociando capabilities do protocolo e autenticando...");
      setTimeout(() => {
        setDiscoverMessage("Inspecionando schemas de ferramentas expostos pelo servidor...");
        setTimeout(() => {
          let list: string[] = ['generic_action_dispatcher', 'health_check'];
          const lowerUrl = serverUrl.toLowerCase();
          if (lowerUrl.includes('slack')) {
            list = ['sendSlackAlert', 'getSlackChannels', 'createSlackChannel', 'inviteUserToSlack'];
          } else if (lowerUrl.includes('sql') || lowerUrl.includes('db') || lowerUrl.includes('postgres')) {
            list = ['runSQLQuery', 'getSchemaTables', 'exportTableData', 'validateIndexSchema'];
          } else if (lowerUrl.includes('jira') || lowerUrl.includes('ticket')) {
            list = ['createJiraTicket', 'addTicketComment', 'updateTicketStatus', 'searchJiraIssues'];
          } else if (lowerUrl.includes('email') || lowerUrl.includes('gmail')) {
            list = ['sendDraftEmail', 'retrieveInboxUnread', 'searchEmailsBySubject'];
          } else if (lowerUrl.includes('crm') || lowerUrl.includes('hubspot')) {
            list = ['retrieveContactCRM', 'updateDealStage', 'createCompanyProfile'];
          }
          
          setDiscoveredTools(list);
          setSelectedDiscoveredTool(list[0]);
          setHasDiscoveredSuccessfully(true);
          setIsDiscovering(false);
          setDiscoverMessage('');
        }, 600);
      }, 605);
    }, 600);
  };

  // Auto populate on MCP Discovered Tool selection
  const handleSelectDiscoveredTool = (toolName: string) => {
    setSelectedDiscoveredTool(toolName);
    setName(toolName);
    setDescription(`Executa a ação MCP importada do servidor: ${toolName}.`);
    
    // Autofill standard params based on common names
    if (toolName === 'sendSlackAlert') {
      setParameters([
        { name: 'channel', type: 'string', required: true, description: 'Canal de destino (Ex: #suporte)' },
        { name: 'message', type: 'string', required: true, description: 'Mensagem formatada com detalhes do alerta' }
      ]);
    } else if (toolName === 'runSQLQuery') {
      setParameters([
        { name: 'query', type: 'string', required: true, description: 'Query SQL SELECT válida para execução' }
      ]);
    } else if (toolName === 'createJiraTicket') {
      setParameters([
        { name: 'summary', type: 'string', required: true, description: 'Resumo com o título principal do ticket' },
        { name: 'description', type: 'string', required: true, description: 'Detalhamento técnico do problema' },
        { name: 'priority', type: 'string', required: false, description: 'Nível de prioridade: Baixa, Média, Alta' }
      ]);
    } else if (toolName === 'sendDraftEmail') {
      setParameters([
        { name: 'recipient', type: 'string', required: true, description: 'Endereço de e-mail do destinatário' },
        { name: 'subject', type: 'string', required: true, description: 'Assunto do e-mail' },
        { name: 'body', type: 'string', required: true, description: 'Corpo da mensagem do e-mail' }
      ]);
    } else if (toolName === 'retrieveContactCRM') {
      setParameters([
        { name: 'email', type: 'string', required: true, description: 'E-mail do contato no CRM para filiar' }
      ]);
    } else {
      setParameters([
        { name: 'input_param', type: 'string', required: true, description: 'Parâmetro geral para o utilitário MCP' }
      ]);
    }
  };

  // Trigger form step progression validation
  const handleNextStep = () => {
    setValidationError('');

    if (step === 1) {
      setStep(2);
    } 
    else if (step === 2) {
      if (toolType === ToolType.HTTP) {
        if (url.trim()) {
          // Basic URL validator
          if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
            setValidationError("A URL deve ser válida (começando com http://, https:// ou caminho relativo de API/).");
            return;
          }
        }
      } else {
        if (serverUrl.trim()) {
          if (!hasDiscoveredSuccessfully || !selectedDiscoveredTool) {
            setValidationError("É obrigatório testar a conexão e selecionar uma das tools expostas pelo servidor MCP para prosseguir.");
            return;
          }
        }
      }
      setStep(3);
    } 
    else if (step === 3) {
      const cleanName = name.trim();
      if (!cleanName) {
        setValidationError("O nome de identificação da tool é obrigatório.");
        return;
      }
      // Alphanumeric, underscores, camelCase validation
      if (!/^[a-zA-Z0-9_\-]+$/.test(cleanName)) {
        setValidationError("O nome deve conter apenas letras, números, hífens ou underlines, sem espaços.");
        return;
      }
      if (!description.trim()) {
        setValidationError("A descrição orientada à LLM é obrigatória.");
        return;
      }

      // RF07 name uniqueness inside current resource
      const hasDuplicate = siblingTools.some(st => {
        // Exclude the current tool being edited itself is existing
        if (existingTool && st.id === existingTool.id) return false;
        return st.name.toLowerCase() === cleanName.toLowerCase();
      });

      if (hasDuplicate) {
        setValidationError("Já existe uma tool com o nome correspondente vinculada a esta resource. Escolha outro nome para evitar problemas de roteamento.");
        return;
      }

      setStep(4);
    } 
    else if (step === 4) {
      // Validate parameters
      if (parameters.length > 0) {
        for (let i = 0; i < parameters.length; i++) {
          const p = parameters[i];
          if (!p.name.trim()) {
            setValidationError(`O nome do parâmetro #${i + 1} não pode ficar vazio.`);
            return;
          }
          if (!/^[a-zA-Z0-9_]+$/.test(p.name)) {
            setValidationError(`O nome do parâmetro "${p.name}" deve conter apenas caracteres alfanuméricos, sem espaços.`);
            return;
          }
          if (!p.description.trim()) {
            setValidationError(`Forneça uma descrição clara para o parâmetro "${p.name}" orientando o LLM.`);
            return;
          }
        }
      }
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setValidationError('');
      setStep(step - 1);
    }
  };

  const handlePublish = () => {
    const finalTool: Tool = {
      id: existingTool ? existingTool.id : `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      type: toolType,
      description: description.trim(),
      status: status,
      parameters: parameters,
      ...(toolType === ToolType.HTTP ? {
        url: url.trim(),
        method,
        headers: headers.filter(h => h.key.trim() && h.value.trim()),
        parameterMapping,
        bodyFormat,
        responseMapping: responseMapping.trim() || undefined
      } : {
        serverUrl: serverUrl.trim(),
        transportProtocol,
        authCredentials: authCredentials.trim() || undefined,
        discoveredTools,
        selectedDiscoveredTool
      })
    };

    onSave(finalTool);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl h-[88vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Stepper Header */}
        <div className="px-10 py-5 bg-slate-50 border-b border-slate-100 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shadow-sm">
                <Icons.Workflow className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                  {existingTool ? "Editar Tool Cadastrada" : "Wizard de Cadastro de Tool"}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Configurando conector e parâmetros para LLM
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              type="button"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-5 gap-2 items-center text-center">
            {[
              { id: 1, label: "1. Tipo" },
              { id: 2, label: "2. Conexão" },
              { id: 3, label: "3. Identificação" },
              { id: 4, label: "4. Parâmetros" },
              { id: 5, label: "5. Revisão" }
            ].map(s => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              return (
                <button
                  key={s.id}
                  disabled={existingTool ? false : s.id > step && !existingTool}
                  onClick={() => {
                    if (existingTool || s.id < step) {
                      setValidationError('');
                      setStep(s.id);
                    }
                  }}
                  className={`py-1 text-[11px] font-bold border-b-3 transition-all truncate ${isActive ? 'border-sky-500 text-sky-600 font-extrabold' : isCompleted ? 'border-emerald-500 text-emerald-600' : 'border-slate-100 text-slate-400'}`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {isCompleted && <Icons.Check className="w-3.5 h-3.5 inline text-emerald-500" />}
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
          
          {/* Error Banner */}
          {validationError && (
            <div className="mb-6 px-5 py-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
              <span className="text-xl">⚠️</span>
              <p className="text-xs font-semibold leading-relaxed">{validationError}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* STAGE 1: CONNECTION TYPE */}
              {step === 1 && (
                <div className="space-y-6 text-center max-w-xl mx-auto py-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900">Tipo de Protocolo de Conexão</h3>
                    <p className="text-xs text-slate-400 font-medium">Selecione o protocolo apropriado para disparar ações do agente corporativo</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {/* HTTP card */}
                    <button
                      type="button"
                      onClick={() => setToolType(ToolType.HTTP)}
                      className={`p-6 rounded-3xl border text-left flex flex-col gap-4 group transition-all duration-300 ${toolType === ToolType.HTTP ? 'bg-sky-50/50 border-sky-400 ring-4 ring-sky-500/5 shadow-sm' : 'bg-white border-slate-150 hover:border-slate-250 shadow-sm'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${toolType === ToolType.HTTP ? 'bg-sky-500/10 border-sky-200 text-sky-600' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:text-blue-500'}`}>
                        <Icons.Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">HTTP Request</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Dispara endpoints (APIs REST) de terceiros, microserviços ou webhooks externos usando requisições Web tradicionais.</p>
                      </div>
                    </button>

                    {/* MCP card */}
                    <button
                      type="button"
                      onClick={() => setToolType(ToolType.MCP)}
                      className={`p-6 rounded-3xl border text-left flex flex-col gap-4 group transition-all duration-300 ${toolType === ToolType.MCP ? 'bg-purple-50/50 border-purple-300 ring-4 ring-purple-550/5 shadow-sm' : 'bg-white border-slate-150 hover:border-slate-250 shadow-sm'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${toolType === ToolType.MCP ? 'bg-purple-500/10 border-purple-200 text-purple-600' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:text-purple-500'}`}>
                        <Icons.Terminal className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">Servidor MCP (Model Context Protocol)</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Conecta-se a um servidor nativo de protocolo MCP para obter capabilities e orquestrar múltiplos microsserviços integrados.</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: CONNECTION VARIABLES */}
              {step === 2 && (
                <div className="space-y-6 text-left">
                  {toolType === ToolType.HTTP ? (
                    /* HTTP CONNECTION FIELDS */
                    <div className="space-y-5">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <Icons.Info className="w-5 h-5 text-slate-400 shrink-0" />
                        <p className="text-[11.5px] text-slate-500 leading-relaxed font-semibold">
                          Defina o endpoint HTTP. Use marcadores dinâmicos precedidos de dois pontos (ex: <code>:id</code> ou <code>:cnpj</code>) se desejar mapear os parâmetros da LLM diretamente na rota/URL.
                        </p>
                      </div>

                      {/* URL input */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">URL / Endpoint Base</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="e.g. https://api.zucchetti.com.br/v1/customers/:id"
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-mono font-medium text-slate-700 transition-all bg-white"
                          />
                        </div>
                      </div>

                      {/* Method & Format Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Método HTTP</label>
                          <div className="relative">
                            <select
                              value={method}
                              onChange={e => setMethod(e.target.value as any)}
                              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800 bg-white appearance-none cursor-pointer"
                            >
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="PATCH">PATCH</option>
                              <option value="DELETE">DELETE</option>
                            </select>
                            <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Formato do Corpo (Body)</label>
                          <div className="relative">
                            <select
                              value={bodyFormat}
                              onChange={e => setBodyFormat(e.target.value as any)}
                              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold text-slate-800 bg-white appearance-none cursor-pointer"
                            >
                              <option value="JSON">JSON (Standard payload)</option>
                              <option value="form-data">form-data (Key/Value files or strings)</option>
                            </select>
                            <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Request Headers */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                          <span>Request Headers (Autenticação / Customização)</span>
                          <button
                            type="button"
                            onClick={handleAddHeader}
                            className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-lg"
                          >
                            <Icons.Plus className="w-3 h-3" />
                            <span>Adicionar Header</span>
                          </button>
                        </label>
                        
                        <div className="space-y-2.5">
                          {headers.map((hdr, hIdx) => (
                            <div key={hIdx} className="flex gap-2.5 items-center">
                              <input
                                type="text"
                                placeholder="Key (ex: Authorization)"
                                value={hdr.key}
                                onChange={e => handleHeaderChange(hIdx, 'key', e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-white text-xs font-semibold border border-slate-205 rounded-xl text-slate-800 focus:outline-sky-500 focus:ring-1"
                              />
                              <input
                                type="text"
                                placeholder="Value (ex: Bearer token-xyz)"
                                value={hdr.value}
                                onChange={e => handleHeaderChange(hIdx, 'value', e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-white text-xs border border-slate-205 rounded-xl text-slate-800 focus:outline-sky-500 focus:ring-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveHeader(hIdx)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                title="Remover"
                              >
                                <Icons.Trash className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Response Mapping Expression */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Resposta: Mapeamento de Retorno (JSONPath/Regex) - Opcional</label>
                        <input
                          type="text"
                          value={responseMapping}
                          onChange={e => setResponseMapping(e.target.value)}
                          placeholder="e.g. $.data.customerName (Filtra o JSON do retorno para a LLM ler de forma otimizada)"
                          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-mono text-slate-700 transition-all bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* MCP CONNECTION FIELDS WITH SIMULATED DISCOVERY SHAKE */
                    <div className="space-y-5">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <Icons.Info className="w-5 h-5 text-purple-400 shrink-0" />
                        <p className="text-[11.5px] text-slate-500 leading-relaxed font-semibold">
                          Insira o endereço do servidor MCP. Após inserir o endereço, execute o teste de conectividade e handshake para descobrir as ferramentas expostas por esse servidor.
                        </p>
                      </div>

                      {/* Server URL field */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Endereço do Servidor MCP</label>
                        <input
                          type="text"
                          value={serverUrl}
                          onChange={e => setServerUrl(e.target.value)}
                          placeholder="Ex: http://mcp.zucchetti.internal:9000/slack ou mcp://localhost:8080"
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 text-xs font-mono text-slate-700 transition-all bg-white"
                        />
                      </div>

                      {/* Transport, Auth credentials Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Protocolo de Transporte</label>
                          <div className="relative">
                            <select
                              value={transportProtocol}
                              onChange={e => setTransportProtocol(e.target.value as any)}
                              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 text-xs font-semibold text-slate-800 bg-white appearance-none cursor-pointer"
                            >
                              <option value="SSE">SSE (Server-Sent Events)</option>
                              <option value="stdio">stdio (Stream de Console Local)</option>
                              <option value="HTTP">HTTP streamable</option>
                            </select>
                            <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Credenciais / Chave de Acesso (Opcional)</label>
                          <input
                            type="password"
                            value={authCredentials}
                            onChange={e => setAuthCredentials(e.target.value)}
                            placeholder="Credenciais de autenticação se necessário"
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 text-xs font-semibold text-slate-850 transition-all bg-white"
                          />
                        </div>
                      </div>

                      {/* MCP DISCOVERY TRIGGERS */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
                        {isDiscovering ? (
                          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                            <Icons.Loader className="w-8 h-8 text-purple-600 animate-spin" />
                            <p className="text-xs text-purple-700 font-extrabold animate-pulse">{discoverMessage}</p>
                          </div>
                        ) : (
                          <div className="w-full">
                            <button
                              type="button"
                              onClick={handleConnectAndDiscoverMcp}
                              className="w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100"
                            >
                              <span className="text-sm">⚡</span>
                              Testar Conexão & Descobrir Tools expostas no Servidor (Handshake)
                            </button>

                            {/* Discovered item list selector */}
                            {hasDiscoveredSuccessfully && (
                              <div className="mt-5 p-5 bg-purple-50/50 rounded-2xl border border-purple-150 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                                  <span className="text-xs font-black text-purple-950 uppercase tracking-wider">Descoberta do Servidor com Sucesso: {discoveredTools.length} Tools Listadas</span>
                                </div>
                                <p className="text-[11px] text-purple-800 leading-relaxed font-semibold">
                                  Selecione de qual Tool exposta no servidor você deseja obter os schemas para esta ação:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {discoveredTools.map((tool, tIdx) => (
                                    <button
                                      key={tIdx}
                                      type="button"
                                      onClick={() => handleSelectDiscoveredTool(tool)}
                                      className={`px-4 py-3 text-left text-xs font-bold font-mono rounded-xl border transition-all ${selectedDiscoveredTool === tool ? 'bg-purple-650 text-white border-purple-650 ring-4 ring-purple-500/10' : 'bg-white text-purple-800 hover:bg-purple-100/50 border-purple-100'}`}
                                    >
                                      🛠️ {tool}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 3: IDENTIFICATION */}
              {step === 3 && (
                <div className="space-y-5 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome de Identificação (Chamada da LLM)</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: getCustomerHistory, sendSlackNotification"
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-mono font-bold text-slate-850 transition-all bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status de Disponibilidade</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setStatus('active')}
                          className={`flex-1 py-3 text-xs font-bold rounded-xl border-2 transition-all ${status === 'active' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-50' : 'bg-white text-slate-500 border-slate-150 hover:bg-slate-50'}`}
                        >
                          Ativo / Pronto
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus('inactive')}
                          className={`flex-1 py-3 text-xs font-bold rounded-xl border-2 transition-all ${status === 'inactive' ? 'bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-100' : 'bg-white text-slate-500 border-slate-150 hover:bg-slate-50'}`}
                        >
                          Inativo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descrição para LLM (Instruções de Roteamento / Impacto)</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Indique à LLM o que esta ferramenta faz, quando invocá-la e o que esperar como resultado. Ex: Use esta ferramenta para consultar o histórico completo de faturamento do cliente usando o CPF limpo. Retorna um objeto JSON com as faturas ativas no ERP."
                      className="w-full px-5 py-[16px] min-h-[110px] rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-semibold leading-relaxed text-slate-800 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STAGE 4: USER INPUT ATTRIBUTE SCHEMAS */}
              {step === 4 && (
                <div className="space-y-5 text-left">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Schema de Parâmetros de Entrada</h4>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">Defina os parâmetros de entrada que o LLM enviará para esta ferramenta.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddParameter}
                      className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-md shadow-sky-100 transition-all flex items-center gap-1.5"
                    >
                      <Icons.Plus className="w-3.5 h-3.5" />
                      Adicionar Campo
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[46vh] overflow-y-auto pr-2 custom-scrollbar">
                    {parameters.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400">
                         <span className="text-2xl mb-2 block">🗂️</span>
                         <p className="text-xs text-slate-650 font-bold">Nenhum parâmetro mapeado</p>
                         <p className="text-[10px] text-slate-400 mt-0.5">Se a ferramenta não precisar de parâmetros, prossiga diretamente. Caso contrário, adicione campos acima.</p>
                      </div>
                    ) : (
                      parameters.map((param, pIdx) => (
                        <div key={pIdx} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-4 shadow-sm relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveParameter(pIdx)}
                            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            title="Excluir Parâmetro"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-10 items-start">
                            {/* Param Name */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Nome do Campo</label>
                              <input
                                type="text"
                                placeholder="e.g. userId"
                                value={param.name}
                                onChange={e => handleParameterChange(pIdx, { name: e.target.value })}
                                className="w-full px-4 py-2 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-205 rounded-xl focus:outline-sky-500"
                              />
                            </div>

                            {/* Param Type */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tipo</label>
                              <select
                                value={param.type}
                                onChange={e => handleParameterChange(pIdx, { type: e.target.value as any })}
                                className="w-full px-4 py-2 text-xs font-semibold text-slate-850 bg-white border border-slate-205 rounded-xl focus:outline-sky-500"
                              >
                                <option value="string">string</option>
                                <option value="number">number</option>
                                <option value="boolean">boolean</option>
                                <option value="object">object</option>
                                <option value="array">array</option>
                              </select>
                            </div>

                            {/* Param Required */}
                            <div className="space-y-1.5 flex flex-col">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Obrigatório</label>
                              <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={param.required}
                                  onChange={e => handleParameterChange(pIdx, { required: e.target.checked })}
                                  className="w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500 cursor-pointer"
                                />
                                <span className={`text-[11px] font-bold ${param.required ? 'text-sky-600' : 'text-slate-400'}`}>
                                  {param.required ? 'Sim' : 'Não / Opcional'}
                                </span>
                              </label>
                            </div>

                            {/* HTTP mapping if applicable */}
                            {toolType === ToolType.HTTP && (
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Onde injetar no HTTP</label>
                                <select
                                  value={parameterMapping.find(pm => pm.paramName === param.name)?.location || 'query'}
                                  onChange={e => handleMappingChange(param.name, e.target.value as any)}
                                  className="w-full px-4 py-2 text-xs font-semibold text-sky-900 bg-white border border-slate-205 rounded-xl focus:outline-sky-500"
                                >
                                  <option value="query">Query string (?name=..)</option>
                                  <option value="path">Caminho da URL (:name)</option>
                                  <option value="body">Request Body (JSON)</option>
                                  <option value="header">Request Header</option>
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Param Desc */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-0.5">Descrição explicativa para LLM (Orientação)</label>
                            <input
                              type="text"
                              placeholder="e.g. ID único do contato no CRM para filiar"
                              value={param.description}
                              onChange={e => handleParameterChange(pIdx, { description: e.target.value })}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-205 rounded-xl focus:outline-sky-500"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 5: SUMMATION AND REVIEW */}
              {step === 5 && (
                <div className="space-y-6 text-left">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-start gap-4">
                    <span className="text-2xl mt-0.5">✅</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-emerald-950">Pronto para Conclusão!</h4>
                      <p className="text-[10.5px] text-emerald-805 leading-relaxed mt-0.5 font-medium">
                        Revise os dados operacionais compilados da sua ferramenta abaixo. Uma vez concluído, esta ferramenta poderá ser consumida imediatamente e anexada à inteligência do recurso de IA.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-h-[46vh] overflow-y-auto pr-1">
                    {/* General Metadata */}
                    <div className="p-5 rounded-2xl border border-slate-150 bg-white space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 border-b pb-2">Identificação Geral</h4>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <div className="grid grid-cols-3">
                          <span className="text-slate-400 font-bold">Nome:</span>
                          <span className="col-span-2 font-mono font-bold text-slate-800">{name}</span>
                        </div>
                        <div className="grid grid-cols-3">
                          <span className="text-slate-400 font-bold">Protocolo:</span>
                          <span className="col-span-2 font-bold text-slate-800">
                            {toolType === ToolType.HTTP ? 'HTTP Request (API REST)' : 'Servidor MCP'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3">
                          <span className="text-slate-400 font-bold">Status:</span>
                          <span className={`col-span-2 font-semibold ${status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                            ● {status === 'active' ? 'Ativo / Pronto para IA' : 'Inativo / Manutenção'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">Descrição para LLM:</span>
                          <p className="text-slate-600 font-medium italic bg-slate-50 p-2.5 rounded-lg border border-slate-150">{description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Connection parameters */}
                    <div className="p-5 rounded-2xl border border-slate-150 bg-white space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 border-b pb-2">Configurações de Conectividade</h4>
                      <div className="space-y-3 text-xs leading-relaxed">
                        {toolType === ToolType.HTTP ? (
                          <>
                            <div className="grid grid-cols-3">
                              <span className="text-slate-400 font-bold">Método / Verbo:</span>
                              <span className="col-span-2 font-mono font-bold text-rose-600">{method}</span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="text-slate-400 font-bold-xs">Endpoint URL:</span>
                              <span className="col-span-2 font-mono text-sky-700 truncate block font-semibold" title={url}>{url}</span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="text-slate-400 font-bold">Enroitamento Body:</span>
                              <span className="col-span-2 font-mono font-bold text-slate-700">{bodyFormat}</span>
                            </div>
                            {headers.filter(h => h.key.trim() && h.value.trim()).length > 0 && (
                              <div>
                                <span className="text-slate-400 font-bold block mb-1">Headers de Requisição:</span>
                                <div className="bg-slate-50 p-2 rounded-lg font-mono text-[10px] space-y-1">
                                  {headers.filter(h => h.key.trim() && h.value.trim()).map((h, hIdx) => (
                                    <div key={hIdx} className="truncate"><strong>{h.key}</strong>: {h.value}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-3">
                              <span className="text-slate-400 font-bold">Endereço Server:</span>
                              <span className="col-span-2 font-mono text-purple-700 truncate block font-bold" title={serverUrl}>{serverUrl}</span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="text-slate-400 font-bold">Transporte:</span>
                              <span className="col-span-2 font-mono font-bold text-purple-650">{transportProtocol}</span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="text-slate-400 font-bold">Tool Vinculada:</span>
                              <span className="col-span-2 font-mono font-bold text-emerald-600">🛠️ {selectedDiscoveredTool}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Parameters summary */}
                    <div className="p-5 rounded-2xl border border-slate-150 bg-white space-y-4 md:col-span-2">
                      <h4 className="text-xs font-bold text-slate-800 border-b pb-2">Schema de Argumentos Invocador (LLM Function Parameters)</h4>
                      {parameters.length === 0 ? (
                        <p className="text-slate-400 text-xs italic">Nenhum argumento de entrada é exigido para esta chamada.</p>
                      ) : (
                        <table className="w-full text-left text-xs bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100">
                          <thead>
                            <tr className="bg-slate-100 text-slate-500 font-bold">
                              <th className="px-4 py-2 font-extrabold">Nome</th>
                              <th className="px-4 py-2 font-extrabold">Tipo</th>
                              <th className="px-4 py-2 font-extrabold">Obrigatório</th>
                              {toolType === ToolType.HTTP && <th className="px-4 py-2 font-extrabold">Mapeamento HTTP</th>}
                              <th className="px-4 py-2 font-extrabold">Descrição (Orientação LLM)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parameters.map((p, pIdx) => (
                              <tr key={pIdx} className="border-t border-slate-100">
                                <td className="px-4 py-2 font-mono font-bold text-slate-800">{p.name}</td>
                                <td className="px-4 py-2 font-mono text-slate-650">{p.type}</td>
                                <td className="px-4 py-2 font-bold select-none">
                                  {p.required ? (
                                    <span className="text-sky-600 font-bold">Sim</span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">Opcional</span>
                                  )}
                                </td>
                                {toolType === ToolType.HTTP && (
                                  <td className="px-4 py-2 font-semibold text-slate-700">
                                    {parameterMapping.find(pm => pm.paramName === p.name)?.location || 'query'}
                                  </td>
                                )}
                                <td className="px-4 py-2 text-slate-500 leading-relaxed font-semibold italic">{p.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Footer Navigation */}
        <div className="px-10 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Etapa {step} de 5
          </span>
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-xl border border-slate-205 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all font-sans"
              >
                Voltar
              </button>
            )}
            
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-lg shadow-slate-100 transition-all font-sans"
              >
                Avançar
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                className="px-7 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-lg shadow-sky-100 transition-all font-sans flex items-center gap-1.5"
              >
                <Icons.Check className="w-4 h-4" />
                Concluir & Vincular
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
