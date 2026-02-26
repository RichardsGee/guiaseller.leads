/**
 * Design System — Icon Inventory
 *
 * Complete catalogue of lucide-react icons used across the platform.
 * Organised by functional category for the Designer agent and the
 * /design-system showcase page.
 *
 * 🔒 RULE: Only lucide-react icons. No heroicons, no react-icons (legacy).
 */

export const iconInventory = {
  // ─── Navigation & Layout ───────────────────────────────────
  navigation: [
    { name: 'BarChart3',      usage: 'Dashboard sidebar' },
    { name: 'ShoppingBag',    usage: 'Vendas sidebar' },
    { name: 'Layers',         usage: 'Anúncios sidebar' },
    { name: 'Building2',      usage: 'Lojas sidebar' },
    { name: 'Cog',            usage: 'Configurações sidebar' },
    { name: 'Share2',         usage: 'Integrações sidebar' },
    { name: 'Wallet',         usage: 'Planos & Carteira sidebar' },
    { name: 'CircleUser',     usage: 'Meus Pagamentos sidebar' },
    { name: 'Gift',           usage: 'Indicações sidebar' },
    { name: 'BookOpen',       usage: 'Tutoriais sidebar' },
    { name: 'Newspaper',      usage: 'Novidades sidebar' },
    { name: 'Calculator',     usage: 'Calculadora shortcut' },
    { name: 'PanelLeftClose',  usage: 'Sidebar collapse' },
    { name: 'PanelLeftOpen',   usage: 'Sidebar expand' },
    { name: 'Lock',           usage: 'Locked menu item' },
    { name: 'Unlock',         usage: 'Unlocked menu item' },
    { name: 'ChevronDown',    usage: 'Dropdown indicator' },
    { name: 'ChevronRight',   usage: 'Breadcrumb / expand' },
    { name: 'ChevronLeft',    usage: 'Back navigation' },
    { name: 'Menu',           usage: 'Mobile hamburger' },
    { name: 'X',              usage: 'Close / dismiss' },
  ],

  // ─── Header ────────────────────────────────────────────────
  header: [
    { name: 'Sun',            usage: 'Light theme toggle' },
    { name: 'Moon',           usage: 'Dark theme toggle' },
    { name: 'Bell',           usage: 'Notifications' },
    { name: 'BellDot',        usage: 'Notifications with unread' },
    { name: 'Search',         usage: 'Search / Cmd+K' },
    { name: 'LogOut',         usage: 'Logout button' },
    { name: 'Sparkles',       usage: 'Premium/AI badge' },
    { name: 'Star',           usage: 'Favorites toggle' },
    { name: 'Heart',          usage: 'Favorites alt' },
    { name: 'Wrench',         usage: 'Tools dropdown' },
    { name: 'Zap',            usage: 'AI Tools' },
  ],

  // ─── Dashboard ─────────────────────────────────────────────
  dashboard: [
    { name: 'DollarSign',     usage: 'Revenue metric' },
    { name: 'TrendingUp',     usage: 'Positive trend' },
    { name: 'TrendingDown',   usage: 'Negative trend' },
    { name: 'ArrowUpRight',   usage: 'Positive change indicator' },
    { name: 'ArrowDownRight', usage: 'Negative change indicator' },
    { name: 'Package',        usage: 'Orders metric' },
    { name: 'ShoppingCart',   usage: 'Sales metric' },
    { name: 'Activity',       usage: 'Activity / Admin panel' },
    { name: 'BarChart2',      usage: 'Charts section header' },
    { name: 'Eye',            usage: 'Blur toggle / visibility' },
    { name: 'EyeOff',         usage: 'Values hidden' },
    { name: 'Calendar',       usage: 'Date range selector' },
  ],

  // ─── Admin Panel ───────────────────────────────────────────
  admin: [
    { name: 'Users',          usage: 'Online users count' },
    { name: 'Globe',          usage: 'Global stats' },
    { name: 'Clock',          usage: 'Session duration' },
    { name: 'MapPin',         usage: 'User location' },
    { name: 'UserCircle',     usage: 'Impersonation' },
    { name: 'History',        usage: 'Impersonation history' },
    { name: 'Shield',         usage: 'Admin badge / access denied' },
    { name: 'Palette',        usage: 'Design System sidebar' },
  ],

  // ─── Plans & Payments ─────────────────────────────────────
  plans: [
    { name: 'Check',          usage: 'Feature included' },
    { name: 'CheckCircle2',   usage: 'Feature confirmed' },
    { name: 'Crown',          usage: 'Founder / premium plan' },
    { name: 'Gem',            usage: 'Lifetime plan' },
    { name: 'Rocket',         usage: 'Pro plan' },
    { name: 'Target',         usage: 'Calculator plan' },
    { name: 'Sprout',         usage: 'Basic plan' },
    { name: 'CreditCard',     usage: 'Payment method' },
    { name: 'Receipt',        usage: 'Invoice / receipt' },
  ],

  // ─── Integrations ─────────────────────────────────────────
  integrations: [
    { name: 'Plug2',          usage: 'Integrations header' },
    { name: 'RefreshCw',      usage: 'Sync / refresh' },
    { name: 'Link',           usage: 'Connection / link' },
    { name: 'Unlink',         usage: 'Disconnected' },
    { name: 'Loader2',        usage: 'Loading spinner (animate-spin)' },
  ],

  // ─── Anúncios & Listings ──────────────────────────────────
  listings: [
    { name: 'Filter',         usage: 'Filter toggle' },
    { name: 'SortAsc',        usage: 'Sort ascending' },
    { name: 'SortDesc',       usage: 'Sort descending' },
    { name: 'ArrowUpDown',    usage: 'Sort toggle' },
    { name: 'ExternalLink',   usage: 'Open in marketplace' },
    { name: 'Copy',           usage: 'Copy SKU / ID' },
    { name: 'Image',          usage: 'No image placeholder' },
    { name: 'Tag',            usage: 'SKU / label' },
  ],

  // ─── Feedback & States ─────────────────────────────────────
  feedback: [
    { name: 'AlertTriangle',  usage: 'Warning state' },
    { name: 'AlertCircle',    usage: 'Error state' },
    { name: 'Info',           usage: 'Info tooltip / alert' },
    { name: 'CircleCheck',    usage: 'Success state' },
    { name: 'Ban',            usage: 'Blocked / forbidden' },
    { name: 'HelpCircle',     usage: 'Help / FAQ' },
  ],

  // ─── Actions ───────────────────────────────────────────────
  actions: [
    { name: 'Plus',           usage: 'Add / create' },
    { name: 'Minus',          usage: 'Remove / decrement' },
    { name: 'Trash2',         usage: 'Delete' },
    { name: 'Edit3',          usage: 'Edit / rename' },
    { name: 'Save',           usage: 'Save action' },
    { name: 'Download',       usage: 'Download / export' },
    { name: 'Upload',         usage: 'Upload / import' },
    { name: 'Clipboard',      usage: 'Copy to clipboard' },
    { name: 'Send',           usage: 'Submit / send' },
  ],

  // ─── Role Icons (Sidebar) ─────────────────────────────────
  roles: [
    { name: 'Crown',    role: 'FOUNDER / CO-FOUNDER', color: '#f59e0b' },
    { name: 'Code2',    role: 'CTO',                  color: '#7c3aed' },
    { name: 'Target',   role: 'TECH LEAD',            color: '#3b82f6' },
    { name: 'Palette',  role: 'FRONTEND LEAD',        color: '#ec4899' },
    { name: 'Rocket',   role: 'DEVOPS LEAD',          color: '#14b8a6' },
    { name: 'CheckCircle2', role: 'SENIOR DEV',       color: '#10b981' },
    { name: 'Wrench',   role: 'DEVELOPER',            color: '#6b7280' },
  ],
} as const;

// All icon names used (flat list for validation / search)
export const allIconNames = Object.values(iconInventory)
  .flatMap(category => category.map((item: any) => item.name))
  .filter((v, i, a) => a.indexOf(v) === i)
  .sort();

export type IconCategory = keyof typeof iconInventory;
