import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Building2, 
  Plus, 
  Trash2, 
  Calendar, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  X
} from 'lucide-react';
import { deptXpService, DEPARTMENTS, MOCK_USERS_LIST, GestorDeptLink } from '../services/deptXpService';
import { User, UserRole } from '../types';

interface AdminGestaoLinksPageProps {
  user: User;
}

export default function AdminGestaoLinksPage({ user }: AdminGestaoLinksPageProps) {
  const [links, setLinks] = useState<GestorDeptLink[]>(() => deptXpService.getLinks());
  const [selectedGestorId, setSelectedGestorId] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const filteredLinks = links.filter((link) => {
    const matchesSearch = 
      link.gestorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.gestorEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !filterDept || link.department === filterDept;
    return matchesSearch && matchesDept;
  });

  if (user.role !== UserRole.ADMINISTRATOR) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[80vh] max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Acesso Restrito</h2>
        <p className="text-sm text-slate-500 mt-2">
          Apenas usuários com perfil de **Administrador** têm permissão para acessar a tela de gerenciamento de vínculos de gestores e departamentos.
        </p>
      </div>
    );
  }

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!selectedGestorId || !selectedDept) {
      setErrorMessage('Por favor, selecione um gestor e um departamento.');
      return;
    }

    const success = deptXpService.addLink(user.name, selectedGestorId, selectedDept);

    if (success) {
      const updatedLinks = deptXpService.getLinks();
      setLinks(updatedLinks);
      
      const gestorObj = MOCK_USERS_LIST.find(u => u.id === selectedGestorId);
      setSuccessMessage(`Gestor ${gestorObj?.name} vinculado com sucesso ao departamento ${selectedDept}!`);
      
      setSelectedGestorId('');
      setSelectedDept('');
    } else {
      setErrorMessage('Este vínculo já existe ou o gestor selecionado é inválido.');
    }
  };

  const handleRemoveLink = (linkId: string) => {
    if (window.confirm('Deseja realmente remover este vínculo?')) {
      const success = deptXpService.removeLink(user.name, linkId);
      if (success) {
        setLinks(deptXpService.getLinks());
        setSuccessMessage('Vínculo removido com sucesso!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-2xl">
              <Users className="w-8 h-8" />
            </span>
            Vínculos de Gestores
          </h1>
          <p className="text-slate-500 mt-1">
            Vincule gestores a departamentos para habilitar o acompanhamento do Luna XP acumulado.
          </p>
        </div>
      </div>

      {/* Grid: Formulário de Associação + Lista de Vínculos Atuais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário (Esquerda, col-span-1) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-600" />
              Novo Vínculo
            </h2>

            <form onSubmit={handleAddLink} className="space-y-4">
              {/* Gestor */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Gestor</label>
                <select
                  value={selectedGestorId}
                  onChange={(e) => setSelectedGestorId(e.target.value)}
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer"
                >
                  <option value="">Selecione um Gestor...</option>
                  {MOCK_USERS_LIST.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.bu})
                    </option>
                  ))}
                </select>
              </div>

              {/* Departamento */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Departamento</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer"
                >
                  <option value="">Selecione um Departamento...</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 italic">
                  * Apenas departamentos existentes podem ser vinculados (RF05).
                </p>
              </div>

              {/* Botão de envio */}
              <button
                type="submit"
                className="w-full p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-100 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Vincular Gestor
              </button>
            </form>

            {/* Mensagens */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-700 font-medium flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Lista de Vínculos (Direita, col-span-2) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between select-none">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-400" />
                Vínculos Ativos ({links.length})
              </h2>
            </div>

            {/* Filtros e Busca */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-3 select-none">
              {/* Input de Busca */}
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar gestor por nome ou e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 text-slate-700 placeholder-slate-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Seletor de Departamento */}
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full text-xs font-bold pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 text-slate-700 cursor-pointer appearance-none"
                >
                  <option value="">Todos os Departamentos</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Contador de Resultados Ativos */}
            {(searchQuery || filterDept) && (
              <div className="px-6 py-2 bg-sky-50/50 border-b border-slate-100 flex items-center justify-between text-xs text-sky-800 font-semibold select-none animate-fadeIn">
                <span>
                  Mostrando <strong className="font-extrabold text-sky-900">{filteredLinks.length}</strong> de <strong className="font-extrabold text-sky-900">{links.length}</strong> vínculos encontrados
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterDept('');
                  }}
                  className="text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-100 overflow-y-auto flex-grow max-h-[500px]">
              {filteredLinks.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-400 italic">
                  {links.length === 0 
                    ? "Nenhum vínculo de gestor cadastrado." 
                    : "Nenhum vínculo corresponde aos filtros de busca aplicados."}
                </div>
              ) : (
                filteredLinks.map((link) => {
                  const gestorObj = MOCK_USERS_LIST.find(u => u.name === link.gestorName);
                  return (
                    <div 
                      key={link.id}
                      className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Gestor Info */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={gestorObj?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'} 
                          alt={link.gestorName} 
                          className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-800">{link.gestorName}</div>
                          <div className="text-[11px] text-slate-450 font-semibold flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {link.gestorEmail}
                          </div>
                        </div>
                      </div>

                      {/* Department & Meta */}
                      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-xs font-bold uppercase tracking-wider">
                            {link.department}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {link.createdAt}
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => handleRemoveLink(link.id)}
                          className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-150 rounded-xl transition-all hover:scale-105 cursor-pointer"
                          title="Remover Vínculo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
