# GuiaSeller — Brand Guidelines & Design System

> Documento de referência primária para o agente Designer e para a equipe de desenvolvimento.
> Gerado a partir de auditoria completa do código-fonte em 19/02/2026.

---

## 1. Fontes Oficiais

| Token Tailwind    | Família                           | Uso                                      |
|-------------------|-----------------------------------|------------------------------------------|
| `font-geist`      | Geist, Inter, sans-serif          | **Primária** — textos, labels, headings  |
| `font-geist-mono` | Geist Mono, Consolas, monospace   | **Números** — métricas, preços, tabular  |
| `font-sans`       | Inter, system-ui, sans-serif      | **Fallback** — corpo geral               |
| `font-mono`       | Consolas, Courier New, monospace  | **Código** — snippets, IDs técnicos      |

### ⛔ NÃO USAR
- `font-poppins` — declarada no Tailwind mas **nunca importada**. Não há `@font-face` nem link Google Fonts.
- Fontes custom não listadas acima.

### Regras
- Valores monetários e métricas: **sempre** `font-geist-mono` + `tabular-nums`.
- Labels e corpo: **sempre** `font-geist` (ou `font-sans` como fallback).
- Tamanho mínimo: `text-xs` (12px). Tamanho máximo em dashboards: `text-lg` (18px).
- Feature settings do Inter: `cv02, cv03, cv04, cv11` (definidos globalmente em `index.css`).

---

## 2. Escala Tipográfica

### Fluid (responsiva — usar para headings e corpo fora de dashboards)
| Classe         | Range         |
|----------------|---------------|
| `text-fluid-xs`  | 12px → 14px   |
| `text-fluid-sm`  | 14px → 16px   |
| `text-fluid-base`| 16px → 18px   |
| `text-fluid-lg`  | 18px → 20px   |
| `text-fluid-xl`  | 20px → 24px   |
| `text-fluid-2xl` | 24px → 32px   |

### Fixa (dashboards e dados densos — 12px a 18px)
| Nível     | Classe      | Uso                        |
|-----------|-------------|----------------------------|
| Mínimo    | `text-xs`   | Labels, badges, helpers    |
| Padrão    | `text-sm`   | Corpo, inputs, values      |
| Destaque  | `text-base` | Headings secundários       |
| Máximo    | `text-lg`   | H1 de dashboard, primary metric |

---

## 3. Paleta de Cores Semânticas

### Backgrounds
| Uso              | Light                | Dark                          |
|------------------|----------------------|-------------------------------|
| Página           | `bg-white`           | `dark:bg-gray-900`            |
| Card             | `bg-white`           | `dark:bg-gray-800`            |
| Card secundário  | `bg-gray-50`         | `dark:bg-gray-700/50`         |
| Disabled         | `bg-gray-50→gray-100`| `dark:bg-gray-800→gray-700/50`|

### Estados
| Estado    | Background Light       | Background Dark              | Texto Light        | Texto Dark                |
|-----------|------------------------|------------------------------|--------------------|---------------------------|
| Positivo  | `bg-green-100`         | `dark:bg-green-900/30`       | `text-green-600`   | `dark:text-green-400`     |
| Negativo  | `bg-red-100`           | `dark:bg-red-900/30`         | `text-red-600`     | `dark:text-red-400`       |
| Sucesso   | `bg-emerald-50`        | `dark:bg-emerald-900/20`     | `text-emerald-700` | `dark:text-emerald-400`   |
| Erro      | `bg-red-50`            | `dark:bg-red-900/20`         | `text-red-700`     | `dark:text-red-400`       |
| Alerta    | `bg-yellow-50`         | `dark:bg-yellow-900/20`      | `text-yellow-700`  | `dark:text-yellow-400`    |
| Info      | `bg-blue-50`           | `dark:bg-blue-900/20`        | `text-blue-700`    | `dark:text-blue-400`      |
| Neutro    | `bg-gray-50`           | `dark:bg-gray-700/50`        | `text-gray-700`    | `dark:text-gray-300`      |

### Acentos de Marca
| Cor            | Uso                                           |
|----------------|-----------------------------------------------|
| `blue-600`     | CTA primário, links, active sidebar, info      |
| `emerald-500`  | Sucesso, calculadora shortcut, referral FAB    |
| `teal-500`     | CTA dos cards de plano                         |
| `purple-500`   | Admin accent, premium badge, IA badge          |
| `amber/yellow` | Lock state, Mercado Livre, Founder             |
| `orange-500`   | Shopee                                         |

### ⛔ NÃO USAR
- Cores raw sem dark mode pair (ex: `text-red-500` sem `dark:text-red-400`).
- Gradientes em cards de dados — reservados para FABs, hovers decorativos e landing pages.
- `backdrop-blur` fora de modais/overlays.

---

## 4. Cores por Marketplace

| Marketplace    | Primary bg       | Badge Light                           | Badge Dark                                        |
|----------------|------------------|---------------------------------------|---------------------------------------------------|
| Mercado Livre  | `bg-yellow-500`  | `bg-yellow-100 text-yellow-800`       | `dark:bg-yellow-900/30 dark:text-yellow-200`      |
| Shopee         | `bg-orange-500`  | `bg-orange-100 text-orange-800`       | `dark:bg-orange-900/30 dark:text-orange-200`      |
| Magalu         | `bg-blue-600`    | `bg-blue-100 text-blue-800`           | `dark:bg-blue-900/30 dark:text-blue-200`          |
| Shein          | `bg-black`       | `bg-pink-100 text-pink-800`           | `dark:bg-pink-900/30 dark:text-pink-200`          |
| TikTok         | `bg-cyan-500`    | `bg-gray-100 text-gray-800`           | `dark:bg-gray-900/30 dark:text-gray-200`          |
| Amazon         | `bg-orange-600`  | `bg-orange-100 text-orange-800`       | `dark:bg-orange-900/30 dark:text-orange-200`      |

---

## 5. Espaçamento

### Fluid Spacing (usar em containers e layouts)
| Token        | Range          |
|--------------|----------------|
| `fluid-1`    | 4px → 6px      |
| `fluid-2`    | 8px → 12px     |
| `fluid-3`    | 12px → 18px    |
| `fluid-4`    | 16px → 24px    |
| `fluid-6`    | 24px → 40px    |
| `fluid-8`    | 32px → 48px    |
| `fluid-10`   | 40px → 64px    |
| `fluid-12`   | 48px → 80px    |

### Breakpoints
| Token  | Pixels | Dispositivo           |
|--------|--------|-----------------------|
| `xs`   | 480px  | Celulares grandes     |
| `sm`   | 640px  | Tablets pequenos      |
| `md`   | 768px  | iPad                  |
| `lg`   | 1024px | MacBook Air           |
| `xl`   | 1280px | Desktop HD            |
| `2xl`  | 1536px | MacBook Pro 16"       |
| `3xl`  | 1920px | Full HD               |
| `4xl`  | 2560px | 2K / 4K               |

---

## 6. Ícones

### Biblioteca: `lucide-react` (ÚNICA oficial)
- **Todas as páginas** usam exclusivamente lucide-react.
- Exceções históricas: `react-icons/fi` em 2 arquivos (legado — migrar para lucide).
- `@heroicons/react` listado no package.json mas **sem uso** — candidato a remoção.

### Tamanhos padrão
| Contexto        | Classes          |
|-----------------|------------------|
| Inline (texto)  | `w-3 h-3`       |
| Small (badges)  | `w-3.5 h-3.5`   |
| Padrão (botões) | `w-4 h-4`       |
| Medium (cards)  | `w-5 h-5`       |
| Large (headers) | `w-6 h-6`       |
| Hero (empty)    | `w-8 h-8`+ ou `w-16 h-16` |

---

## 7. Componentes Reutilizáveis

| Componente        | Path                                  | Uso                                     |
|-------------------|---------------------------------------|-----------------------------------------|
| `Button`          | `src/components/common/Button.tsx`    | Variantes: primary, secondary, ghost, danger |
| `Card`            | `src/components/common/Card.tsx`      | Card + CardHeader + CardContent + CardTitle  |
| `Badge`           | `src/components/common/Badge.tsx`     | Variantes: default, success, error, warning, info |
| `Toggle`          | `src/components/common/Toggle.tsx`    | Switch on/off                            |
| `Tooltip`         | `src/components/common/Tooltip.tsx`   | Posição smart, com delay                 |
| `Modal`           | `src/components/common/Modal.tsx`     | Tipos: confirm, form, info               |
| `PageHeader`      | `src/components/shared/PageHeader.tsx` | Cabeçalho padronizado com ícone e features |
| `ToolPageHeader`  | `src/components/shared/ToolPageHeader.tsx` | Header para ferramentas com promo     |
| `Typography`      | `src/components/shared/Typography.tsx` | Heading, Text, Label, Badge, Price, Gradient |

---

## 8. Padrões de Layout por Página

| Página        | Grid Principal              | Card Anatomy                          |
|---------------|-----------------------------|---------------------------------------|
| Dashboard     | `md:5-col` stats + `lg:2-col` charts | Icon + Title + Value + Change + Previous |
| Vendas        | `space-y-6` full-width table | Date + Marketplace tabs + Status filter |
| Anúncios      | `space-y-6` full-width table | Marketplace tabs + Sort + Search + Pagination |
| Integrações   | `grid gap-3` single col     | PageHeader + CompanySelector + IntegrationsList |
| Settings      | `flex gap-6` 2-col          | Sidebar nav + Content pane             |
| Planos        | `lg:4-col` grid             | Plan cards + Price toggle + Features   |
| Admin         | `lg:3-col` grid             | Tab nav + StatCards + User list + Page stats |

---

## 9. Animações Aprovadas

| Nome               | Uso                         | Duração     |
|--------------------|-----------------------------|-------------|
| `float`            | Partículas decorativas      | 5s infinite |
| `pulseSubtle`      | Dots de status, notificações| 2s infinite |
| `fadeSlideUp`      | Entrada de elementos        | 0.5s once   |
| `modalIn/modalOut` | Modais enter/exit           | 0.3s/0.2s   |

### Transições padrão
```css
transition-all duration-300        /* Layout shifts */
transition-colors duration-150     /* Hovers de cor */
transition-opacity duration-200    /* Fades */
hover:shadow-md transition-shadow  /* Card hovers */
```

---

## 10. Dark Mode

- Estratégia: **`class`** (não media query) — definido em `tailwind.config.js`.
- **Todo componente** deve ter par `dark:` para backgrounds, textos e bordas.
- Padrão para cards: `bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700`.
- Glassmorphism (`backdrop-blur`): **exclusivo para modais e overlays**.

---

## 11. Tokens por Vertical

Cada seção da plataforma possui arquivos dedicados de tipografia e cores. **Sempre usar o set específico antes do fallback genérico.**

| Vertical         | Typography                           | Colors                              |
|------------------|--------------------------------------|-------------------------------------|
| Dashboard        | `dashboardTypography.ts`             | `dashboardColors.ts`                |
| Analytics        | `analyticsTypography.ts`             | `analyticsColors.ts`                |
| Vendas/Sales     | `salesTypography.ts`                 | `salesColors.ts`                    |
| Sales Analytics  | `salesAnalyticsTypography.ts`        | `salesAnalyticsColors.ts`           |
| Calculadora      | `calculatorTypography.ts`            | `calculatorColors.ts`               |
| Integrações      | `integrationsTypography.ts`          | `integrationsColors.ts`             |
| Listings         | `listingsTypography.ts`             | `listingsColors.ts`                 |
| Tools            | `toolsTypography.ts`                | `toolsColors.ts`                    |
| **Genérico**     | `typography.ts` ⚠️ legado            | _(inline)_                          |

---

## 12. Sugestões de Padronização

### 🔴 Inconsistências encontradas
1. **Status Badges** — 3 variações diferentes entre Admin (`text-red-600 bg-red-100`), Anúncios (`bg-orange-100 text-orange-700`) e Common Badge (`bg-red-100 text-red-800`). → **Padronizar usando `Badge` de `common/`.**
2. **Loading Spinners** — 2 estilos: `animate-spin border-4 border-blue-500` (Integrações) vs `animate-pulse bg-gray-200` (skeleton). → **Ambos são válidos mas documentar quando usar cada um.**
3. **Empty States** — sem componente reutilizável; cada página recria o pattern. → **Criar `EmptyState` em `common/`.**
4. **Card padding** — varia entre `p-2`, `p-2.5`, `p-3`, `p-4`. → **Padronizar: `p-2.5` (compact), `p-3` (default), `p-4` (spacious).**
5. **Geist font** — declarada no Tailwind mas **sem import**. Funciona se pacote `geist` estiver instalado via npm, senão cai em Inter.

### 🟡 Recomendações
- Remover `@heroicons/react` do package.json (sem uso).
- Migrar os 2 arquivos que usam `react-icons` para `lucide-react`.
- Criar componente `EmptyState` reutilizável com ícone + título + descrição + CTA.
- Documentar os gradientes aprovados (são poucos e decorativos).
