import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, LogOut, Bell, Check, Calendar, ExternalLink, Trash2, Menu, 
  Wrench, Star, Lock, Zap, Calculator, TrendingUp, Megaphone, Package, 
  MessageSquare, DollarSign, RotateCcw, FileText, Target, BarChart3, ChevronDown,
  ShieldCheck, Award, Medal, Gem, Infinity
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useRoleStyles } from '../../hooks/useRoleStyles';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tokens } from '../tokens/Tokens';
import { useUser } from '../../contexts/UserContext'; // SOLID: Identidade + signOut
import { useFeatures } from '../../contexts/FeatureContext';
import { NotificationBanner } from '../notifications/NotificationBanner';
import { notifications as siteNotifications } from '../../config/notifications';
import {
  markNotificationAsRead,
  fetchUserNotifications,
  deleteNotification
} from '../../utils/notifications/notificationUtils';
import { toast } from 'react-toastify';
import { useTools } from '../../hooks/useTools';
import { dashboardTypography } from '../../styles/dashboardTypography';
import { dashboardColors, dashboardCards } from '../../styles/dashboardColors';

interface UserNotification {
  notification_id: string;
  platform: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: UserNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface HeaderProps {
  onMobileSidebarToggle?: () => void;
}

export function Header({ onMobileSidebarToggle }: HeaderProps) {
  // ==================== HOOKS (SEMPRE NO TOPO - React Rules of Hooks) ====================
  const { theme, toggleTheme } = useTheme();
  const { headerClasses, headerBorderClasses, rolePhrase, accentColor, roleIcon } = useRoleStyles();
  const navigate = useNavigate();
  const { user, signOut } = useUser(); // SOLID: Identidade + signOut
  const { userLevel } = useFeatures();
  const location = useLocation();
  const { tools, favorites, toggleFavorite, checkToolAccess } = useTools();
  
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Fetch user notifications - APENAS uma vez por sessão
  useEffect(() => {
    // Chave única para armazenar se já buscou nesta sessão
    const sessionKey = `notifications_fetched_${user?.uid}`;
    const alreadyFetched = sessionStorage.getItem(sessionKey);
    
    const fetchNotifications = async () => {
      if (!user?.uid || alreadyFetched || isLoadingNotifications) return;
      
      setIsLoadingNotifications(true);
      
      try {
        const response: NotificationsResponse = await fetchUserNotifications(user.uid, 1, 10, false);
        if (response.success) {
          setUserNotifications(response.data);
          setNotificationsCount(response.pagination.total);
          // Marca como já buscado nesta sessão
          sessionStorage.setItem(sessionKey, 'true');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    
    fetchNotifications();
  }, [user?.uid]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowTools(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== HELPER FUNCTIONS ====================
  // Mark as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return;
    const success = await markNotificationAsRead(notificationId, user.uid);
    if (success) {
      setUserNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, read: true } : n
        )
      );
      setNotificationsCount(prev => Math.max(0, prev - 1));
      toast.success('Notificação marcada como lida');
    } else {
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  // Delete
  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    const success = await deleteNotification(notificationId);
    if (success) {
      const wasUnread = userNotifications.find(n => n.notification_id === notificationId)?.read === false;
      setUserNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
      if (wasUnread) setNotificationsCount(prev => Math.max(0, prev - 1));
      toast.success('Notificação removida com sucesso');
    } else {
      toast.error('Erro ao remover notificação');
    }
  };

  // Click
  const handleNotificationClick = (notification: UserNotification) => {
    if (!notification.read) markAsRead(notification.notification_id);
  };

  // Active notification banner
  const activeNotification = siteNotifications.find(n => n.active);

  // Hide on login/signup
  if (location.pathname === '/login' || location.pathname === '/signup') return null;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch {
      console.error('Failed to log out:');
    }
  };

  // Platform colors
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      mercadolivre: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      magalu:        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      shopee:        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      shein:         'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      system:        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[platform.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm border-b z-50 ${headerClasses} ${headerBorderClasses}`}>
      <div className="max-w-[1920px] mx-auto">
        <div className="flex items-center h-10 md:h-12 px-3">
          {/* Left Section */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            <img 
              src="/logo.webp" 
              alt="Logo" 
              className="h-7 md:h-9 w-auto"
            />
            <div className="hidden md:flex items-center px-2">
              <span 
                className="text-sm font-light transition-colors duration-300 flex items-center gap-1.5"
                style={{ color: accentColor }}
              >
                {/* Ícones no começo */}
                {roleIcon && (() => {
                  const RoleIcon = roleIcon;
                  return <RoleIcon className="w-4 h-4" strokeWidth={2} />;
                })()}
                {(() => {
                  const level = (userLevel || 'basic').toLowerCase();
                  const UserLevelIcon = 
                    level === 'admin' ? Award :
                    level === 'pro' ? Medal :
                    level === 'premium' ? Gem :
                    level === 'vitalicio' ? Infinity :
                    ShieldCheck;
                  
                  return <UserLevelIcon className="w-4 h-4" strokeWidth={2} />;
                })()}
                {(() => {
                  const isBasicUser = userLevel?.toLowerCase() === 'basic';
                  const calculatorAccess = checkToolAccess('pricing-calculator');
                  const hasCalculator = isBasicUser && calculatorAccess.hasAccess;
                  const planType = calculatorAccess?.expirationInfo?.type;
                  
                  if (hasCalculator) {
                    return (
                      <Calculator 
                        className={`w-4 h-4 ${
                          planType === 'ANNUAL' 
                            ? 'text-blue-500 dark:text-blue-400' 
                            : 'text-amber-500 dark:text-amber-400'
                        }`}
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                })()}
                
                {/* Textos */}
                {(() => {
                  const isBasicUser = userLevel?.toLowerCase() === 'basic';
                  const calculatorAccess = checkToolAccess('pricing-calculator');
                  const hasCalculator = isBasicUser && calculatorAccess.hasAccess;
                  const planType = calculatorAccess?.expirationInfo?.type;
                  
                  // Fundador ou outros roles especiais
                  if (rolePhrase && rolePhrase !== 'Preços & Gestão') {
                    const level = (userLevel || 'basic').toLowerCase();
                    const prefix = level === 'admin' ? 'Admin' : 
                                   level === 'premium' || level === 'pro' || level === 'vitalicio' ? level.charAt(0).toUpperCase() + level.slice(1) :
                                   'Membro';
                    return <span className="text-sm font-semibold">{prefix} {rolePhrase}</span>;
                  }
                  
                  // Basic com calculadora
                  if (hasCalculator) {
                    return (
                      <span className={`text-sm font-semibold ${
                        planType === 'ANNUAL' 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        Membro Precificador
                      </span>
                    );
                  }
                  
                  // Premium/Pro/Vitalicio (assinantes)
                  const level = (userLevel || 'basic').toLowerCase();
                  if (level === 'premium' || level === 'pro' || level === 'vitalicio') {
                    return <span className="text-sm font-semibold">Membro Assinante</span>;
                  }
                  
                  // Basic padrão
                  return <span className="text-sm font-semibold">Membro Basic</span>;
                })()}
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 md:space-x-3 ml-auto">
            {/* Tools Dropdown */}
            <div className="relative flex items-center" ref={toolsRef}>
              <button
                onClick={() => setShowTools(!showTools)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-sm ${
                  showTools 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                aria-label="Ferramentas"
              >
                <Wrench className="w-4 h-4" />
                <span className="hidden md:inline text-xs font-medium">Ferramentas</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showTools ? 'rotate-180' : ''}`} />
              </button>

              {showTools && (
                <div className={`absolute right-0 mt-2 w-[340px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden top-full`}>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {tools
                      .filter(tool => ['pricing-calculator', 'sales-analytics', 'anuncios-management'].includes(tool.id))
                      .map(tool => {
                      // Get colors based on tool platform
                      const getPlatformColors = (platform: string) => {
                        if (platform === 'Mercado Livre') return {
                          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                          border: 'border-yellow-200 dark:border-yellow-800/50',
                          text: 'text-yellow-700 dark:text-yellow-400'
                        };
                        if (platform === 'Magazine Luiza') return {
                          bg: 'bg-blue-50 dark:bg-blue-900/20',
                          border: 'border-blue-200 dark:border-blue-800/50',
                          text: 'text-blue-700 dark:text-blue-400'
                        };
                        if (platform === 'Shein') return {
                          bg: 'bg-pink-50 dark:bg-pink-900/20',
                          border: 'border-pink-200 dark:border-pink-800/50',
                          text: 'text-pink-700 dark:text-pink-400'
                        };
                        return {
                          bg: 'bg-slate-50 dark:bg-slate-900/20',
                          border: 'border-slate-200 dark:border-slate-800/50',
                          text: 'text-slate-700 dark:text-slate-400'
                        };
                      };

                        const colors = getPlatformColors(tool.platform);

                        // Forçar nomes e subtítulos mais neutros para ferramentas principais
                        const displayName =
                          tool.id === 'pricing-calculator' ? 'Calculadora' :
                          tool.id === 'sales-analytics' ? 'Análise de Vendas' :
                          tool.id === 'anuncios-management' ? 'Ger. Anúncios' :
                          tool.name;

                        const displayPlatform = ['pricing-calculator', 'sales-analytics', 'anuncios-management'].includes(tool.id)
                          ? 'Multi-plataforma'
                          : (tool.platform || 'Geral');

                      return (
                        <div
                          key={tool.id}
                          className={`px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                            tool.status === 'coming_soon' || tool.isLocked ? 'opacity-50' : ''
                          }`}
                          onClick={() => {
                            if (tool.status !== 'coming_soon' && !tool.isLocked && tool.route) {
                              navigate(tool.route);
                              setShowTools(false);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Tool icon on the left */}
                            <div className={`w-8 h-8 flex-shrink-0 rounded-md flex items-center justify-center ${
                              tool.id === 'pricing-calculator' ? `${dashboardColors.states.info.bg} border ${dashboardColors.states.info.border}` :
                              tool.id === 'sales-analytics' ? `${dashboardColors.states.success.bg} border ${dashboardColors.states.success.border}` :
                              `${dashboardColors.states.neutral.bg} border ${dashboardColors.states.neutral.border}`
                            }`}>
                              {tool.id === 'pricing-calculator' ? (
                                <Calculator className={`w-4 h-4 ${dashboardColors.states.info.icon}`} />
                              ) : tool.id === 'sales-analytics' ? (
                                <TrendingUp className={`w-4 h-4 ${dashboardColors.states.success.icon}`} />
                              ) : (
                                <Megaphone className={`w-4 h-4 ${dashboardColors.icons.muted}`} />
                              )}
                            </div>
                            
                            {/* Tool info - fixed width */}
                            <div className="w-44 flex-shrink-0">
                              <div className={`${dashboardTypography.labels.medium} text-gray-900 dark:text-white truncate`}>
                                {displayName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {displayPlatform}
                              </div>
                            </div>
                            
                            {/* Lock icon centered */}
                            <div className="w-5 flex-shrink-0 flex items-center justify-center">
                              {tool.isLocked && <Lock className={`w-4 h-4 ${dashboardColors.states.warning.icon}`} />}
                            </div>
                            
                            {/* Actions on the right */}
                            <div className="flex items-center justify-end flex-1 min-w-0">
                              {tool.status === 'coming_soon' ? (
                                <span className={`px-2 py-1 ${dashboardTypography.badges.medium} ${dashboardColors.states.warning.bg} ${dashboardColors.states.warning.text} rounded-md shadow-sm whitespace-nowrap`}>
                                  Em breve
                                </span>
                              ) : tool.isLocked ? (
                                <span className={`px-2 py-1 ${dashboardTypography.badges.medium} ${dashboardColors.states.warning.bg} ${dashboardColors.states.warning.text} rounded-md flex items-center gap-1 shadow-sm whitespace-nowrap`}>
                                  <Zap className="w-3 h-3" />
                                  {tool.tokenCost}
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(tool.id);
                                  }}
                                  className={`p-1.5 rounded-md hover:${dashboardColors.states.warning.bg} transition-colors`}
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      favorites.includes(tool.id)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-400 hover:text-amber-400'
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => { navigate('/ferramentas'); setShowTools(false); }}
                      className="w-full px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      Ver todas as ferramentas
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative group"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white dark:border-gray-800">
                    {notificationsCount > 99 ? '99+' : notificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[380px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all transform origin-top-right">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <Bell className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Notificações</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      {notificationsCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          {notificationsCount} não lidas
                        </span>
                      )}
                      <button
                        onClick={() => navigate('/notificacoes')}
                        className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Ver todas as notificações"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoadingNotifications ? (
                      <div className="space-y-2 p-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex items-center space-x-3 animate-pulse">
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="flex-1 space-y-2 py-1">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : userNotifications.length > 0 ? (
                      userNotifications.map(notification => (
                        <div
                          key={notification.notification_id}
                          className="flex items-center p-3 h-24 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={`p-2 rounded-full ${getPlatformColor(notification.platform)} flex-shrink-0 mr-3`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); markAsRead(notification.notification_id); }}
                                    className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    title="Marcar como lida"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleDeleteNotification(notification.notification_id, e)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title="Remover notificação"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Nenhuma notificação não lida
                      </div>
                    )}
                  </div>

                  {userNotifications.length > 0 && (
                    <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => { navigate('/notificacoes'); setShowNotifications(false); }}
                        className="w-full px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center"
                      >
                        <span>Ver todas as notificações</span>
                        <ExternalLink className="w-3 h-3 ml-1.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tokens */}
            <div className="hidden md:flex items-center">
              <Tokens />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={onMobileSidebarToggle}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
