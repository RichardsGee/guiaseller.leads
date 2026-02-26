// src/components/Sidebar/Sidebar.tsx
import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ShoppingBag,
  Layers,
  Cog,
  Building2,
  MessagesSquare,
  PenTool as Tool,
  Zap,
  Share2,
  Wallet,
  CircleUser,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Unlock,
  PlayCircle,
  Calculator,
  Code2,
  Crown,
  Target,
  Rocket,
  Palette,
  Wrench,
  CheckCircle2,
  Gem,
  Sprout,
  BookOpen,
  Gift,
} from 'lucide-react';
import { UserLevel } from './UserLevel';
import { useUser } from '../../contexts/UserContext';
import { useFeatures } from '../../contexts/FeatureContext';
import { useNewsNotificationsContext } from '../../contexts/NewsNotificationsContext';
import { useTools } from '../../hooks/useTools';
import { useSalesPrefetch } from '../../hooks/useSalesPrefetch'; // ⚡ Prefetch otimização

/* ─────────────────── props ─────────────────── */
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Tipagem dos itens do menu para evitar erros de propriedades opcionais
import { LucideIcon } from 'lucide-react';

type MenuItem = {
  name: string;
  icon: LucideIcon;
  path: string;
  requiresSubscription?: boolean;
  badge?: string;
  badgeStyle?: string;
  disabled?: boolean;
  hidden?: boolean; // Para páginas que só aparecem na busca
  keywords?: string[]; // Palavras-chave para busca
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

/* ────────────────── componente ──────────────── */
export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useUser();
  const { userLevel, status } = useFeatures();
  const { unreadCount } = useNewsNotificationsContext();
  const { checkToolAccess } = useTools();
  const { prefetchSales } = useSalesPrefetch(); // ⚡ Prefetch hook
  
  const isBasicUser = userLevel?.toLowerCase() === 'basic';
  
  // Verifica se usuário basic tem calculadora (cached)
  const calculatorAccess = useMemo(() => checkToolAccess('pricing-calculator'), [checkToolAccess]);
  const hasCalculator = isBasicUser && calculatorAccess.hasAccess && 
    (calculatorAccess.accessType === 'purchased' || calculatorAccess.accessType === 'subscription');
  
  // Determina o tipo de plano da calculadora (ANNUAL ou LIFETIME)
  const calculatorPlanType = hasCalculator && calculatorAccess.expirationInfo?.type;
  const calculatorDaysLeft = hasCalculator && calculatorAccess.expirationInfo?.daysLeft;

  // Controle de animação da moeda
  const [isFlipped, setIsFlipped] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const flipTimeout = useRef<NodeJS.Timeout | null>(null);

  // Effect para animação de rotação (APENAS quando user.uid mudar)
  useEffect(() => {
    setIsFlipped(false);
    setSpinCount(0);
    if (flipTimeout.current) clearTimeout(flipTimeout.current);
    
    // Gira 3 vezes antes de mostrar o avatar
    const totalSpins = 3;
    const spinDuration = 600; // ms por giro
    let spins = 0;
    
    function doSpin() {
      setSpinCount(spins + 1);
      spins++;
      if (spins < totalSpins) {
        flipTimeout.current = setTimeout(doSpin, spinDuration);
      } else {
        flipTimeout.current = setTimeout(() => setIsFlipped(true), spinDuration);
      }
    }
    
    doSpin();
    
    return () => {
      if (flipTimeout.current) clearTimeout(flipTimeout.current);
    };
  }, [user?.uid]);
  
  /* ---- menu definition (useMemo - HOOK) ---- */
  const menuItems: MenuSection[] = useMemo(() => [
    {
      title: 'Gerenciamento',
      items: [
        { name: 'Dashboard', icon: BarChart3, path: '/dashboard', keywords: ['painel', 'inicio', 'home'] },
        { name: 'Vendas', icon: ShoppingBag, path: '/vendas', requiresSubscription: true, keywords: ['sales', 'venda', 'pedidos'] },
        { name: 'Anúncios', icon: Layers, path: '/anuncios', requiresSubscription: true, keywords: ['ads', 'publicidade', 'campanhas'] },
        { name: 'Lojas', icon: Building2, path: '/lojas', requiresSubscription: true, keywords: ['stores', 'marketplace', 'loja'] },
      ],
    },
    {
      title: 'Assinatura',
      items: [
        {
          name: 'Planos',
          icon: Wallet,
          path: '/planos',
          keywords: ['subscription', 'premium', 'upgrade', 'preco'],
        },
        { name: 'Meus Pagamentos', icon: CircleUser, path: '/assinatura', keywords: ['billing', 'faturas', 'cobranca'] },
        { name: 'Indicações', icon: Gift, path: '/indicacoes', keywords: ['referral', 'indicar', 'amigos', 'recompensa', 'trust score'], hidden: true },
        { name: 'Carteira', icon: Wallet, path: '/wallet', keywords: ['wallet', 'saldo', 'saque', 'dinheiro', 'pix'], hidden: true },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { name: 'Configurações', icon: Cog, path: '/configuracoes', requiresSubscription: true, keywords: ['settings', 'ajustes'] },
        { name: 'Integrações', icon: Share2, path: '/integracoes', requiresSubscription: true, keywords: ['api', 'webhooks', 'conectar'] },
        { name: 'Design System', icon: Palette, path: '/design-system', hidden: userLevel !== 'admin', keywords: ['design', 'tokens', 'cores', 'tipografia', 'brand'] },
      ],
    },
    {
      title: 'Ferramentas',
      items: [
        { 
          name: 'Ferramentas', 
          icon: Tool, 
          path: '/ferramentas', 
          keywords: ['tools', 'utilitarios']
        },
        { name: 'Ferramentas IA', icon: Zap, path: '/ferramentas-ia', badge: 'IA', requiresSubscription: true, keywords: ['ai', 'artificial', 'inteligencia'] },
      ],
    },
    {
      title: 'Educação',
      items: [
        { name: 'Tutoriais', icon: PlayCircle, path: '/tutoriais', keywords: ['videos', 'aprender', 'curso'] },
        { 
          name: 'Novidades', 
          icon: MessagesSquare, 
          path: '/novidades', 
          keywords: ['news', 'updates', 'blog'],
          badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount.toString()) : undefined,
          badgeStyle: unreadCount > 0 ? 'bg-red-500 text-white animate-pulse' : undefined
        },
      ],
    },
  ], [unreadCount]);

  /* ---- usuário (useMemo - HOOK) ---- */
  const UserInfo = useMemo(() => {
    if (!user) {
      // Não renderiza nada se não tiver usuário (App.tsx já mostra FullScreenLoading)
      return null;
    }

    // Exibe o primeiro nome e sobrenome, limitado a 2 palavras
    const firstNameParts = (user.first_name || '').split(' ');
    const lastName = user.last_name || '';
    let displayName = firstNameParts[0] || '';
    if (lastName) {
      displayName += ' ' + lastName;
    }
    const avatarUrl =
      user.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${user.first_name || ''} ${user.last_name || ''}`
      )}&background=random`;

    return (
      <div
        className={`
          flex items-center border-b border-gray-100 dark:border-gray-800
          transition-all duration-200
          ${isCollapsed ? 'justify-center gap-0 p-2' : 'gap-2 px-2.5 py-2'}
        `}
      >
        <div className="relative flex-shrink-0">
          <div className={`
            relative rounded-lg overflow-hidden
            ${status?.toLowerCase() === 'inactive'
              ? 'ring-1 ring-red-400/30'
              : 'ring-1 ring-emerald-400/20'
            }
          `}>
            <img
              src={avatarUrl}
              alt="avatar"
              className="
                h-9 w-9 
                lg:h-[clamp(36px,2.8vw,44px)] 
                lg:w-[clamp(36px,2.8vw,44px)]
                3xl:h-11 3xl:w-11
                rounded-lg object-cover 
                bg-gray-100 dark:bg-gray-800
              "
              loading="eager"
            />
          </div>
          <span
            className={`
              absolute -bottom-0.5 -right-0.5
              h-2.5 w-2.5 rounded-full
              ${status?.toLowerCase() === 'inactive'
                ? 'bg-red-500'
                : 'bg-emerald-500'
              }
              border-2 border-white dark:border-gray-900
              shadow-sm
            `}
          />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
            <p className="
              w-full overflow-hidden text-ellipsis whitespace-nowrap
              text-[clamp(0.9375rem,1.1vw,1.0625rem)] 
              lg:text-[clamp(0.9375rem,1.05vw,1.0625rem)]
              3xl:text-[1.0625rem]
              font-semibold text-gray-900 dark:text-white leading-tight
            ">
              {displayName}
            </p>
            <div className="flex items-center gap-1 overflow-hidden min-w-0 w-full">
              <UserLevel 
                level={userLevel || 'Basic'} 
                onlyIcon={false}
              />
              {/* Team Role - vem do backend via /complete */}
              {(() => {
                if (!user?.team_role) return null;
                
                const role = user.team_role.toUpperCase();
                
                // Hierarquia de cargos (ordem de importância) - Sincronizado com useRoleStyles
                const roleConfig = {
                  'FOUNDER': { icon: Crown, color: '#f59e0b' }, // Dourado
                  'FUNDADOR': { icon: Crown, color: '#f59e0b' }, // Dourado
                  'CO-FOUNDER': { icon: Crown, color: '#f59e0b' }, // Dourado
                  'CO-FUNDADOR': { icon: Crown, color: '#f59e0b' }, // Dourado
                  'CTO': { icon: Target, color: '#7c3aed' }, // Roxo escuro
                  'TECH LEAD': { icon: Zap, color: '#3b82f6' }, // Azul
                  'LÍDER TÉCNICO': { icon: Zap, color: '#3b82f6' }, // Azul
                  'BACKEND LEAD': { icon: Wrench, color: '#8b5cf6' }, // Roxo
                  'LÍDER BACKEND': { icon: Wrench, color: '#8b5cf6' }, // Roxo
                  'FRONTEND LEAD': { icon: Palette, color: '#ec4899' }, // Rosa
                  'LÍDER FRONTEND': { icon: Palette, color: '#ec4899' }, // Rosa
                  'DEVOPS LEAD': { icon: Rocket, color: '#14b8a6' }, // Teal
                  'LÍDER DEVOPS': { icon: Rocket, color: '#14b8a6' }, // Teal
                  'QA LEAD': { icon: CheckCircle2, color: '#8b5cf6' }, // Roxo
                  'LÍDER QA': { icon: CheckCircle2, color: '#8b5cf6' }, // Roxo
                  'SENIOR DEVELOPER': { icon: Gem, color: '#10b981' }, // Verde
                  'DESENVOLVEDOR SÊNIOR': { icon: Gem, color: '#10b981' }, // Verde
                  'DEVELOPER': { icon: Code2, color: '#6b7280' }, // Cinza
                  'DESENVOLVEDOR': { icon: Code2, color: '#6b7280' }, // Cinza
                  'JUNIOR DEVELOPER': { icon: Sprout, color: '#94a3b8' }, // Cinza claro
                  'DESENVOLVEDOR JÚNIOR': { icon: Sprout, color: '#94a3b8' }, // Cinza claro
                  'INTERN': { icon: BookOpen, color: '#cbd5e1' }, // Cinza muito claro
                  'ESTAGIÁRIO': { icon: BookOpen, color: '#cbd5e1' }, // Cinza muito claro
                };
                
                // Encontra configuração do cargo (fallback para DEVELOPER)
                const config = roleConfig[role as keyof typeof roleConfig] || roleConfig['DEVELOPER'];
                const RoleIcon = config.icon;
                
                return (
                  <div className="flex items-center gap-1 bg-[#202020] px-2 py-0.5 rounded-full min-w-0 flex-shrink overflow-hidden">
                    <RoleIcon 
                      className="w-2.5 h-2.5 flex-shrink-0"
                      strokeWidth={2.5}
                      color={config.color}
                    />
                    <span className="
                      text-[8px]
                      tracking-wider font-bold text-white overflow-hidden text-ellipsis whitespace-nowrap
                    ">
                      {role}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    ); // fecha o useMemo
  }, [user, isCollapsed, isFlipped, spinCount, userLevel, status, hasCalculator, calculatorPlanType, calculatorDaysLeft]);

  // ==================== RENDER ====================
  return (
    <aside
      className={`
        fixed left-0 top-12 md:top-14 z-40 h-[calc(100vh-3rem)] md:h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-3.5rem)]
        bg-white dark:bg-gray-900 backdrop-blur-sm 
        border-r border-gray-200 dark:border-gray-800
        shadow-sm transition-all duration-300 ease-in-out
        ${
          isCollapsed 
            ? 'w-16 lg:w-[clamp(56px,4vw,80px)]' 
            : 'w-56 lg:w-[clamp(200px,15vw,280px)] 3xl:w-[clamp(230px,12vw,320px)]'
        }
        flex flex-col
        overflow-hidden
      `}
    >
      {UserInfo}

      <nav className="mt-1 flex-1 h-full overflow-y-auto pb-2 sidebar-scroll">
        {/* Botão Recolher */}
        <div className={`${isCollapsed ? 'px-1' : 'px-3'} mb-1`}>
          <button
            onClick={onToggle}
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            className={`
              w-full flex items-center justify-center rounded-lg transition-all duration-200
              text-blue-600 dark:text-blue-400
              hover:bg-blue-50 dark:hover:bg-blue-900/20
              ${isCollapsed ? 'p-fluid-2' : 'px-fluid-2 py-fluid-1'}
              min-h-[2rem]
            `}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 lg:h-[clamp(16px,1.2vw,20px)] lg:w-[clamp(16px,1.2vw,20px)] flex-shrink-0 transition-transform duration-200" />
            ) : (
              <PanelLeftClose className="h-4 w-4 lg:h-[clamp(16px,1.2vw,20px)] lg:w-[clamp(16px,1.2vw,20px)] flex-shrink-0 transition-transform duration-200" />
            )}
          </button>
        </div>

        {/* Seção Calculadora */}
        <div className={`${isCollapsed ? 'px-1' : 'px-3 mb-2'}`}>
          <ul className={`${isCollapsed ? 'space-y-0.5' : 'space-y-0.5'}`}>
            <li className="px-1">
              <Link
                to="/ferramentas/calculadora-precos"
                title="Calculadora"
                className={`
                  w-full flex items-center gap-2 rounded-lg px-2 py-1.5
                  bg-emerald-50 dark:bg-emerald-900/20
                  text-emerald-600 dark:text-emerald-400
                  border border-emerald-200/60 dark:border-emerald-800/40
                  hover:bg-emerald-100 dark:hover:bg-emerald-900/30
                  transition-colors duration-150
                  ${isCollapsed ? 'justify-center' : ''}
                  min-h-[2rem]
                `}
              >
                <div className="flex items-center gap-2 w-full">
                  {isCollapsed ? (
                    <Calculator className="h-4 w-4 flex-shrink-0 mx-auto" />
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-semibold truncate">
                        Calculadora
                      </span>
                    </>
                  )}
                </div>
              </Link>
            </li>
          </ul>
        </div>

        {menuItems.map(({ title, items }) => (
          <div key={title} className={`${isCollapsed ? 'px-1' : 'px-3 mb-0.5'}`}>
            {/* título seção */}
            {!isCollapsed && (
              <div className="mb-0.5 px-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {title}
                </h3>
              </div>
            )}

            <ul className={`${isCollapsed ? 'space-y-0.5' : 'space-y-0.5'}`}>
              {items.filter(item => !item.hidden).map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                const locked = isBasicUser && item.requiresSubscription;
                const disabled = item.disabled || locked;

                return (
                  <li key={item.name} className="px-1">
                    <Link
                      to={item.path}
                      onClick={(e) => disabled && e.preventDefault()}
                      onMouseEnter={() => item.path === '/vendas' && prefetchSales()} // ⚡ Prefetch ao hover
                      title={disabled ? 'Assine para desbloquear este recurso' : item.name}
                      className={`
                        w-full flex items-center gap-1 md:gap-2 rounded-lg transition-all duration-200 relative
                        ${isCollapsed ? 'justify-center p-fluid-2' : 'px-fluid-2 py-fluid-1'}
                        ${
                          active
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm border-l-3 border-blue-500'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 hover:shadow-sm'
                        }
                        ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
                        ${locked ? 'group' : ''}
                        min-h-[2rem]
                      `}
                    >
                      {locked && isCollapsed && (
                        <div className="absolute -top-1 -right-1">
                          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-gray-200 text-[7px] font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300 group-hover:bg-yellow-500 group-hover:text-yellow-950 transition-colors duration-200">
                            <Lock className="h-2 w-2" />
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 md:gap-2 w-full">
                        {isCollapsed ? (
                          <Icon className="h-4 w-4 lg:h-[clamp(16px,1.2vw,20px)] lg:w-[clamp(16px,1.2vw,20px)] flex-shrink-0 mx-auto" />
                        ) : (
                          <>
                            <Icon className="h-4 w-4 lg:h-[clamp(16px,1.2vw,20px)] lg:w-[clamp(16px,1.2vw,20px)] flex-shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="text-xs-fluid truncate">
                                  {item.name}
                                </span>
                                {locked && (
                                  <span className="text-gray-400 dark:text-gray-500">
                                    <Lock className="h-2.5 w-2.5" />
                                  </span>
                                )}
                              </div>
                              {item.badge && (
                                <span className={`
                                  px-1.5 py-0.5 text-[8px] font-semibold rounded-full
                                  ${item.badgeStyle ?? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'}
                                `}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {/* Hover effect for locked items */}
                      {locked && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/90 to-amber-500/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex flex-col items-center text-yellow-950">
                            <Unlock className="h-4 w-4 animate-pulse" />
                            <span className="text-[10px] font-medium mt-0.5">Assine para liberar</span>
                          </div>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Separador sutil entre seções */}
            {!isCollapsed && title !== 'Em Breve' && items.length > 0 && (
              <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />
            )}
          </div>
        ))}
        
        
      </nav>
    </aside>
  );
}
