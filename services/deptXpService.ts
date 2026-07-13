import { User, UserRole, Notification } from '../types';

export interface GestorDeptLink {
  id: string;
  gestorId: string;
  gestorName: string;
  gestorEmail: string;
  department: string;
  createdAt: string;
}

export interface XpRedemption {
  id: string;
  gestorName: string;
  department: string;
  amount: number;
  actionType: 'Compactar Squad' | 'Elevar Padrão' | 'Escalar Operação';
  details: string;
  timestamp: string;
}

export interface DeptAuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  date: string;
  status: 'Sucesso' | 'Falha';
  details: any;
}

export interface DeptBadge {
  cycle: number;
  name: string;
  description: string;
  xpRequired: number;
}

export const DEPARTMENTS = [
  'Desenvolvimento',
  'Produto',
  'Comercial',
  'Suporte',
  'Administração',
  'Staff',
  'POS',
  'HR TECH'
];

export const MOCK_USERS_LIST = [
  { id: 'u1', name: 'Gabrielli Carvalho', email: 'gabrielli.carvalho@zucchetti.com.br', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabi', bu: 'Desenvolvimento' },
  { id: 'u8', name: 'Kristofer Pinheiro', email: 'kristofer.pinheiro@zucchetti.com.br', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kris', bu: 'Produto' },
  { id: 'u2', name: 'Ana Costa', email: 'ana.costa@zucchetti.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', bu: 'Comercial' },
  { id: 'u3', name: 'Marcos Oliveira', email: 'marcos.oliveira@zucchetti.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos', bu: 'Administração' },
  { id: 'u4', name: 'Alice Castro', email: 'alice.castro@zucchetti.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', bu: 'Staff' },
  { id: 'u5', name: 'Ricardo Souza', email: 'ricardo.souza@zucchetti.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo', bu: 'POS' },
  { id: 'u6', name: 'Paula Lima', email: 'paula.lima@zucchetti.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paula', bu: 'HR TECH' },
  { id: 'u7', name: 'Fernando Dias', email: 'fernando.dias@zucchetti.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernando', bu: 'Suporte' }
];

export const BADGES_TABLE: DeptBadge[] = [
  { cycle: 1, name: 'Primeira Luz', description: 'Você é um gestor que abriu o caminho — o primeiro ciclo de eficiência do seu time já roda com IA.', xpRequired: 10560 },
  { cycle: 2, name: 'Maré Alta', description: 'Você é um gestor que criou tração — sua área já sente o efeito da IA no dia a dia.', xpRequired: 21120 },
  { cycle: 3, name: 'Órbita Estável', description: 'Você é um gestor que consolidou o hábito — IA já é rotina, não experimento.', xpRequired: 31680 },
  { cycle: 4, name: 'Constelação em Formação', description: 'Você é um gestor que multiplicou resultado — vários recursos, um só time.', xpRequired: 42240 },
  { cycle: 5, name: 'Meia-Lua', description: 'Você é um gestor na metade do caminho que poucos completam.', xpRequired: 52800 },
  { cycle: 6, name: 'Lua Cheia', description: 'Você é um gestor de referência — seu time é citado como exemplo de adoção de IA.', xpRequired: 63360 },
  { cycle: 7, name: 'Eclipse de Eficiência', description: 'Você é um gestor que ofusca a média — sua área performa acima do esperado.', xpRequired: 73920 },
  { cycle: 8, name: 'Supernova', description: 'Você é um gestor que expandiu além dos limites do próprio time.', xpRequired: 84480 },
  { cycle: 9, name: 'Sistema Estelar', description: 'Você é um gestor que construiu um ecossistema — cada função do seu time tem IA por trás.', xpRequired: 95040 },
  { cycle: 10, name: 'Status Lunar', description: 'Você é um gestor lendário — poucos na Zucchetti chegam onde você chegou. Selo permanente, fora da contagem numérica.', xpRequired: 105600 }
];

// Helper to format Date as YYYY-MM-DD HH:mm:ss
export function formatDateTime(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const deptXpService = {
  // --- BASE XP HISTÓRICO FOR DEPARTMENTS ---
  getDeptBaseXp(): Record<string, number> {
    const cached = localStorage.getItem('luna_dept_base_xp');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    const defaultXp: Record<string, number> = {
      'Desenvolvimento': 125400, // Level 10, Status Lunar
      'Produto': 75000,        // Level 7, Eclipse de Eficiência
      'Comercial': 48000,      // Level 4, Constelação em Formação
      'Suporte': 32500,        // Level 3, Órbita Estável
      'Administração': 18000,  // Level 1, Primeira Luz
      'Staff': 8500,           // Level 0, No badges
      'POS': 12000,            // Level 1, Primeira Luz
      'HR TECH': 5000          // Level 0, No badges
    };
    localStorage.setItem('luna_dept_base_xp', JSON.stringify(defaultXp));
    return defaultXp;
  },

  setDeptBaseXp(xp: Record<string, number>) {
    localStorage.setItem('luna_dept_base_xp', JSON.stringify(xp));
  },

  increaseDeptXp(department: string, amount: number) {
    const xp = this.getDeptBaseXp();
    if (xp[department] !== undefined) {
      xp[department] += amount;
    } else {
      xp[department] = amount;
    }
    this.setDeptBaseXp(xp);
  },

  // --- GESTOR-DEPARTMENT LINKS ---
  getLinks(): GestorDeptLink[] {
    const cached = localStorage.getItem('luna_gestor_dept_links');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    // Seed initial links to make it look active on first view
    const initialLinks: GestorDeptLink[] = [
      {
        id: 'link-1',
        gestorId: 'u1',
        gestorName: 'Gabrielli Carvalho',
        gestorEmail: 'gabrielli.carvalho@zucchetti.com.br',
        department: 'Desenvolvimento',
        createdAt: formatDateTime(new Date(2026, 5, 1, 9, 0, 0))
      },
      {
        id: 'link-2',
        gestorId: 'u8',
        gestorName: 'Kristofer Pinheiro',
        gestorEmail: 'kristofer.pinheiro@zucchetti.com.br',
        department: 'Produto',
        createdAt: formatDateTime(new Date(2026, 5, 2, 10, 0, 0))
      },
      {
        id: 'link-3',
        gestorId: 'u2',
        gestorName: 'Ana Costa',
        gestorEmail: 'ana.costa@zucchetti.com',
        department: 'Comercial',
        createdAt: formatDateTime(new Date(2026, 5, 3, 11, 0, 0))
      },
      {
        id: 'link-4',
        gestorId: 'u3',
        gestorName: 'Marcos Oliveira',
        gestorEmail: 'marcos.oliveira@zucchetti.com',
        department: 'Administração',
        createdAt: formatDateTime(new Date(2026, 5, 4, 14, 0, 0))
      }
    ];
    localStorage.setItem('luna_gestor_dept_links', JSON.stringify(initialLinks));
    return initialLinks;
  },

  addLink(adminName: string, gestorId: string, department: string): boolean {
    const links = this.getLinks();
    const gestor = MOCK_USERS_LIST.find(u => u.id === gestorId);
    if (!gestor) return false;

    // Check if link already exists
    const exists = links.some(l => l.gestorId === gestorId && l.department === department);
    if (exists) return false;

    const newLink: GestorDeptLink = {
      id: `link-${Date.now()}`,
      gestorId,
      gestorName: gestor.name,
      gestorEmail: gestor.email,
      department,
      createdAt: formatDateTime(new Date())
    };

    links.push(newLink);
    localStorage.setItem('luna_gestor_dept_links', JSON.stringify(links));

    // Audit Log
    this.addAuditLog({
      id: `audit-${Date.now()}`,
      user: adminName,
      action: 'Vínculo de Gestor Criado',
      resource: department,
      date: formatDateTime(new Date()),
      status: 'Sucesso',
      details: {
        department,
        gestor: gestor.name,
        gestorEmail: gestor.email,
        operation: 'criação',
        ip: '192.168.1.1'
      }
    });

    return true;
  },

  removeLink(adminName: string, linkId: string): boolean {
    const links = this.getLinks();
    const linkToRemove = links.find(l => l.id === linkId);
    if (!linkToRemove) return false;

    const filtered = links.filter(l => l.id !== linkId);
    localStorage.setItem('luna_gestor_dept_links', JSON.stringify(filtered));

    // Audit Log
    this.addAuditLog({
      id: `audit-${Date.now()}`,
      user: adminName,
      action: 'Vínculo de Gestor Removido',
      resource: linkToRemove.department,
      date: formatDateTime(new Date()),
      status: 'Sucesso',
      details: {
        department: linkToRemove.department,
        gestor: linkToRemove.gestorName,
        gestorEmail: linkToRemove.gestorEmail,
        operation: 'remoção',
        ip: '192.168.1.1'
      }
    });

    return true;
  },

  getDepartmentsForGestor(gestorName: string): string[] {
    const links = this.getLinks();
    return links
      .filter(l => l.gestorName.toLowerCase() === gestorName.toLowerCase())
      .map(l => l.department);
  },

  // --- REDEMPTIONS ---
  getRedemptions(): XpRedemption[] {
    const cached = localStorage.getItem('luna_xp_redemptions');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    // Seed initial redemptions to show history
    const initialRedemptions: XpRedemption[] = [
      {
        id: 'red-1',
        gestorName: 'Gabrielli Carvalho',
        department: 'Desenvolvimento',
        amount: 10560,
        actionType: 'Compactar Squad',
        details: 'Redução de equipe de suporte técnico e redistribuição de tarefas com apoio da inteligência artificial para otimização do fluxo.',
        timestamp: formatDateTime(new Date(2026, 6, 1, 15, 30, 0))
      },
      {
        id: 'red-2',
        gestorName: 'Kristofer Pinheiro',
        department: 'Produto',
        amount: 21120,
        actionType: 'Elevar Padrão',
        details: 'Melhoria das especificações técnicas de novos módulos utilizando geração automática de diagramas e testes automatizados.',
        timestamp: formatDateTime(new Date(2026, 6, 5, 10, 15, 0))
      }
    ];
    localStorage.setItem('luna_xp_redemptions', JSON.stringify(initialRedemptions));
    return initialRedemptions;
  },

  getRedemptionsForDept(department: string): XpRedemption[] {
    return this.getRedemptions().filter(r => r.department === department);
  },

  getDeptRedeemedXp(department: string): number {
    return this.getRedemptionsForDept(department).reduce((acc, curr) => acc + curr.amount, 0);
  },

  getDeptXpData(department: string) {
    const historico = this.getDeptBaseXp()[department] || 0;
    const resgatado = this.getDeptRedeemedXp(department);
    const disponivel = Math.max(0, historico - resgatado);
    return {
      historico,
      resgatado,
      disponivel,
      hasResgateAvailable: disponivel >= 10560
    };
  },

  requestRedemption(
    gestorName: string,
    department: string,
    amount: number,
    actionType: 'Compactar Squad' | 'Elevar Padrão' | 'Escalar Operação',
    details: string
  ): { success: boolean; error?: string } {
    if (!details || details.trim().length === 0) {
      return { success: false, error: 'O detalhamento é obrigatório para confirmar o resgate.' };
    }

    const { disponivel } = this.getDeptXpData(department);
    if (amount <= 0) {
      return { success: false, error: 'A quantidade de XP a ser resgatada deve ser maior que zero.' };
    }
    if (amount > disponivel) {
      return { success: false, error: `A quantidade excede o saldo de Luna XP Disponível (${disponivel} XP).` };
    }

    const redemptions = this.getRedemptions();
    const newRedemption: XpRedemption = {
      id: `red-${Date.now()}`,
      gestorName,
      department,
      amount,
      actionType,
      details,
      timestamp: formatDateTime(new Date())
    };

    redemptions.unshift(newRedemption);
    localStorage.setItem('luna_xp_redemptions', JSON.stringify(redemptions));

    // Audit Log
    this.addAuditLog({
      id: `audit-${Date.now()}`,
      user: gestorName,
      action: 'Resgate de Luna XP do Departamento',
      resource: department,
      date: formatDateTime(new Date()),
      status: 'Sucesso',
      details: {
        department,
        amount,
        actionType,
        details,
        gestor: gestorName,
        ip: '192.168.1.1'
      }
    });

    return { success: true };
  },

  // --- BADGES ---
  getBadgesForDept(department: string): DeptBadge[] {
    const { historico } = this.getDeptXpData(department);
    return BADGES_TABLE.filter(b => historico >= b.xpRequired);
  },

  getLatestBadgeForDept(department: string): DeptBadge | null {
    const badges = this.getBadgesForDept(department);
    return badges.length > 0 ? badges[badges.length - 1] : null;
  },

  // Idempotent Notifications & Achievements Anim trigger
  getUnnotifiedBadgesForGestor(gestorName: string, department: string): DeptBadge[] {
    const unlocked = this.getBadgesForDept(department);
    const notified = this.getNotifiedBadges();
    
    // Filter out badges that have already been notified for this gestor and department
    return unlocked.filter(badge => {
      return !notified.some(
        n => n.gestorName.toLowerCase() === gestorName.toLowerCase() && 
             n.department.toLowerCase() === department.toLowerCase() && 
             n.cycle === badge.cycle
      );
    });
  },

  markBadgeAsNotified(gestorName: string, department: string, cycle: number) {
    const notified = this.getNotifiedBadges();
    const alreadyExists = notified.some(
      n => n.gestorName.toLowerCase() === gestorName.toLowerCase() && 
           n.department.toLowerCase() === department.toLowerCase() && 
           n.cycle === cycle
    );

    if (!alreadyExists) {
      notified.push({ gestorName, department, cycle, date: formatDateTime(new Date()) });
      localStorage.setItem('luna_notified_badges', JSON.stringify(notified));
    }
  },

  getNotifiedBadges(): Array<{ gestorName: string; department: string; cycle: number; date: string }> {
    const cached = localStorage.getItem('luna_notified_badges');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  },

  // --- SYSTEM-WIDE AUDIT LOG INTEGRATION ---
  getAuditLogs(): DeptAuditLog[] {
    const cached = localStorage.getItem('luna_custom_audit_logs');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  },

  addAuditLog(log: DeptAuditLog) {
    const logs = this.getAuditLogs();
    logs.unshift(log);
    localStorage.setItem('luna_custom_audit_logs', JSON.stringify(logs));
  }
};
