# DS — Design System

Um design system completo, neutro e CSS-first. Sem dependências de framework. Sem build step obrigatório. Tokens semânticos, dark mode nativo, camadas de cascade explícitas e theming por atributo.

---

## Índice

- [Filosofia](#filosofia)
- [Quick Start](#quick-start)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Tokens de Design](#tokens-de-design)
  - [Cores](#cores)
  - [Tipografia](#tipografia)
  - [Espaçamento](#espaçamento)
  - [Border Radius](#border-radius)
  - [Sombras](#sombras)
  - [Motion](#motion)
- [Dark Mode](#dark-mode)
- [Theming — Cor de destaque](#theming--cor-de-destaque)
- [Cascade Layers (@layer)](#cascade-layers-layer)
- [Layout](#layout)
  - [Container](#container)
  - [Grid](#grid)
  - [Stack & Inline](#stack--inline)
- [Componentes](#componentes)
  - [Button](#button)
  - [Input, Textarea, Select](#input-textarea-select)
  - [Checkbox, Radio, Switch](#checkbox-radio-switch)
  - [Card](#card)
  - [Badge](#badge)
  - [Alert](#alert)
  - [Modal & Drawer](#modal--drawer)
  - [Tabs](#tabs)
  - [Table](#table)
  - [Pagination](#pagination)
  - [Navbar & Sidebar](#navbar--sidebar)
  - [Avatar](#avatar)
  - [Tooltip & Popover](#tooltip--popover)
  - [Dropdown](#dropdown)
  - [Spinner, Progress & Skeleton](#spinner-progress--skeleton)
  - [Toast](#toast)
- [Utilitários](#utilitários)
- [Camada JavaScript](#camada-javascript)
  - [DS.toast](#dstoast)
  - [DS.modal](#dsmodal)
  - [DS.init](#dsinit)
- [Acessibilidade](#acessibilidade)
- [Browser Support](#browser-support)

---

## Filosofia

| Princípio | Decisão |
|-----------|---------|
| **CSS-first** | Todo estilo vive em CSS. JS existe apenas para comportamento (foco, teclado, timers). |
| **Sem build step** | Funciona com `<link>` direto. Compatível com qualquer bundler. |
| **Tokens semânticos** | Classes usam variáveis como `--interactive-default`, nunca `#3b6ef3`. Trocar tema = trocar variável. |
| **Cascade layers** | `@layer` garante que o CSS do seu projeto sempre derrota o DS, sem `!important`. |
| **Framework-agnostic** | Funciona com HTML puro, React, Vue, Svelte, HTMX — qualquer coisa que gere HTML. |
| **Acessibilidade built-in** | ARIA attributes, foco visível, teclado, `prefers-reduced-motion`, roles semânticos. |

---

## Quick Start

### Opção 1 — Link direto (sem build)

```html
<head>
  <link rel="stylesheet" href="ds.css">
</head>
<body>
  <!-- Comportamento interativo (opcional) -->
  <script type="module" src="js/ds.js"></script>
</body>
```

### Opção 2 — Import em bundler (Vite, webpack, etc.)

```js
// main.js / main.ts
import './design-system/ds.css';
import './design-system/js/ds.js';
```

### Opção 3 — Importar só o CSS (sem comportamento JS)

```css
/* Seu arquivo CSS principal */
@import './design-system/ds.css';
```

### Primeiro componente

```html
<button class="btn btn--solid">Clique aqui</button>

<div class="card">
  <div class="card__header">
    <h2 class="card__title">Título</h2>
  </div>
  <div class="card__body">
    <p>Conteúdo do card.</p>
  </div>
</div>
```

---

## Estrutura de arquivos

```
design-system/
├── ds.css                      ← Entry point único (importe só este)
├── index.html                  ← Demo/documentação visual
│
├── tokens/                     ← CSS custom properties
│   ├── colors.css              ← Escala de cores + aliases semânticos
│   ├── typography.css          ← Famílias, tamanhos, pesos, line-heights
│   ├── spacing.css             ← Escala de espaçamento (base 4px)
│   ├── radii.css               ← Border radius
│   ├── shadows.css             ← Box shadows
│   ├── motion.css              ← Durações, easings, prefers-reduced-motion
│   ├── index.css
│   └── themes/                 ← Temas de cor de destaque
│       ├── purple.css
│       ├── rose.css
│       ├── teal.css
│       ├── amber.css
│       └── index.css
│
├── base/
│   ├── reset.css               ← Reset moderno (box-sizing, margins, etc.)
│   ├── base.css                ← Defaults de elementos (h1-h6, a, code, hr…)
│   └── index.css
│
├── layout/
│   ├── container.css           ← .container com breakpoints responsivos
│   ├── grid.css                ← Grid de 12 colunas + auto-fit/fill
│   ├── stack.css               ← .stack (coluna) e .inline (linha)
│   └── index.css
│
├── components/                 ← 15 componentes UI
│   ├── button.css
│   ├── input.css               ← input, textarea, select, field, addon
│   ├── checkbox.css            ← checkbox, radio, switch
│   ├── card.css
│   ├── badge.css
│   ├── alert.css               ← alert + toast container
│   ├── modal.css               ← dialog nativo + drawer
│   ├── tooltip.css             ← tooltip CSS-only + popover
│   ├── dropdown.css
│   ├── tabs.css                ← underline + pills + vertical
│   ├── table.css
│   ├── pagination.css
│   ├── navbar.css              ← navbar + sidebar
│   ├── avatar.css              ← avatar + avatar-group
│   ├── spinner.css             ← spinner + dots + progress + skeleton
│   └── index.css
│
├── utilities/                  ← Classes atômicas
│   ├── spacing.css             ← m-*, p-*, gap-*, w-*, h-*, position…
│   ├── typography.css          ← text-*, font-*, leading-*, tracking-*…
│   ├── colors.css              ← text-*, bg-*, border-*, shadow-*, rounded-*…
│   ├── display.css             ← flex, grid, hidden, cursor, overflow…
│   └── index.css
│
└── js/                         ← Camada de comportamento (vanilla JS, ES modules)
    ├── utils.js                ← trapFocus, onOutsideClick, lockScroll, uid
    ├── dropdown.js
    ├── tabs.js
    ├── modal.js
    ├── toast.js
    ├── navbar.js
    └── ds.js                   ← Entry point — auto-init + window.DS
```

---

## Tokens de Design

Todos os tokens são CSS custom properties definidas em `:root`. Use-os diretamente no seu CSS para manter consistência.

### Cores

#### Escala primitiva

```css
/* Gray (base neutra) */
--color-gray-50 … --color-gray-950

/* Accent (azul, padrão) */
--color-accent-50 … --color-accent-950

/* Semânticas */
--color-success-50 … --color-success-950
--color-warning-50 … --color-warning-950
--color-error-50   … --color-error-950
--color-info-50    … --color-info-950
```

#### Aliases semânticos (use estes no seu código)

```css
/* Fundos */
--bg-page          /* Fundo da página */
--bg-surface       /* Cards, modais, inputs */
--bg-surface-2     /* Fundos sutis, cabeçalhos de tabela */
--bg-surface-3     /* Hover states, badges */
--bg-overlay       /* Backdrop de modais */

/* Texto */
--text-primary     /* Corpo de texto principal */
--text-secondary   /* Labels, legendas */
--text-tertiary    /* Placeholders, metadados */
--text-disabled    /* Elementos desabilitados */
--text-inverse     /* Texto sobre fundos escuros */
--text-on-accent   /* Texto sobre botões coloridos */

/* Bordas */
--border-default   /* Bordas padrão de cards, inputs */
--border-strong    /* Hover em inputs, separadores */
--border-focus     /* Outline de foco */

/* Interativo */
--interactive-default      /* Cor primária de botões, links */
--interactive-hover        /* Hover */
--interactive-active       /* Active/pressed */
--interactive-subtle       /* Background sutil (ghost hover) */
--interactive-subtle-hover

/* Feedback */
--feedback-success-bg / -text / -border / -icon
--feedback-warning-bg / -text / -border / -icon
--feedback-error-bg   / -text / -border / -icon
--feedback-info-bg    / -text / -border / -icon
```

### Tipografia

```css
/* Famílias */
--font-sans   /* System font stack */
--font-mono   /* Código */
--font-serif

/* Tamanhos */
--text-2xs   /* 10px */
--text-xs    /* 12px */
--text-sm    /* 14px */
--text-base  /* 16px */
--text-lg    /* 18px */
--text-xl    /* 20px */
--text-2xl   /* 24px */
--text-3xl   /* 30px */
--text-4xl   /* 36px */
--text-5xl   /* 48px */
--text-6xl   /* 60px */

/* Pesos */
--weight-light / -regular / -medium / -semibold / -bold

/* Line heights */
--leading-none / -tight / -snug / -normal / -relaxed / -loose

/* Letter spacing */
--tracking-tighter / -tight / -normal / -wide / -wider / -widest
```

### Espaçamento

Escala baseada em 4px (1 unit = 4px):

```css
--space-0    /*  0 */     --space-6    /* 24px */
--space-px   /*  1px */   --space-8    /* 32px */
--space-1    /*  4px */   --space-10   /* 40px */
--space-2    /*  8px */   --space-12   /* 48px */
--space-3    /* 12px */   --space-16   /* 64px */
--space-4    /* 16px */   --space-20   /* 80px */
--space-5    /* 20px */   --space-24   /* 96px */
/* ... até --space-64 (256px) */
```

### Border Radius

```css
--radius-none  /*  0     */
--radius-xs    /*  2px   */
--radius-sm    /*  4px   */
--radius-md    /*  6px   */
--radius-lg    /*  8px   */
--radius-xl    /* 12px   */
--radius-2xl   /* 16px   */
--radius-3xl   /* 24px   */
--radius-full  /* 9999px */
```

### Sombras

```css
--shadow-none
--shadow-xs
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
--shadow-2xl
--shadow-inner
--shadow-focus        /* Ring de foco (azul) */
--shadow-focus-error  /* Ring de foco (vermelho) */
```

### Motion

```css
/* Durações */
--duration-instant  /*   0ms */
--duration-fast     /* 100ms */
--duration-normal   /* 200ms */
--duration-slow     /* 300ms */
--duration-slower   /* 500ms */

/* Easings */
--ease-linear / -in / -out / -in-out / -spring / -bounce

/* Transições compostas */
--transition-fast
--transition-base
--transition-slow
--transition-colors   /* color, background, border, shadow */
```

> **`prefers-reduced-motion`** — todas as durações são zeradas automaticamente quando o usuário prefere movimento reduzido.

---

## Dark Mode

O dark mode funciona de duas formas simultâneas:

### Automático (sistema)

```html
<!-- Nenhuma configuração necessária -->
<!-- Segue prefers-color-scheme do sistema operacional -->
<html>
```

### Manual (atributo)

```html
<!-- Forçar dark -->
<html data-theme="dark">

<!-- Forçar light -->
<html data-theme="light">
```

### Implementar toggle

```js
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// Restaurar na carga (coloque antes do </head> para evitar flash)
const saved = localStorage.getItem('theme');
const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', saved ?? (prefersDark ? 'dark' : 'light'));
```

---

## Theming — Cor de destaque

Troque a cor primária de todo o design system com um único atributo:

```html
<!-- Padrão: Azul -->
<html>

<!-- Purple -->
<html data-accent="purple">

<!-- Rose -->
<html data-accent="rose">

<!-- Teal -->
<html data-accent="teal">

<!-- Amber -->
<html data-accent="amber">
```

Funciona em combinação com dark mode:

```html
<html data-theme="dark" data-accent="purple">
```

### Criar um tema customizado

Crie um arquivo `tokens/themes/minha-marca.css` sobrescrevendo apenas os tokens de accent:

```css
[data-accent="minha-marca"] {
  --color-accent-50:  #fdf4ff;
  --color-accent-500: #d946ef;
  --color-accent-600: #c026d3;
  --color-accent-700: #a21caf;
  /* ... outros steps */

  --interactive-default:      var(--color-accent-600);
  --interactive-hover:        var(--color-accent-700);
  --interactive-active:       var(--color-accent-800);
  --interactive-subtle:       var(--color-accent-50);
  --interactive-subtle-hover: var(--color-accent-100);
  --border-focus:             var(--color-accent-500);
  --shadow-focus:             0 0 0 3px rgba(217, 70, 239, 0.35);
}
```

Depois importe em `tokens/themes/index.css`:

```css
@import "./minha-marca.css" layer(ds-tokens);
```

---

## Cascade Layers (@layer)

Todos os estilos do DS vivem em layers nomeadas, declaradas nesta ordem:

```
ds-tokens → ds-reset → ds-base → ds-layout → ds-components → ds-utilities
```

**Por que isso importa:** qualquer CSS que você escrever *fora* de um `@layer` tem prioridade automática sobre todos os layers do DS, sem precisar de `!important` ou seletores mais específicos.

```css
/* Seu CSS — sem @layer, derrota os componentes automaticamente */
.btn {
  border-radius: 9999px; /* sobrescreve --radius-md do DS */
}

/* Ou coloque no seu próprio layer, com ordem explícita */
@layer meu-projeto {
  .btn { border-radius: 9999px; }
}
```

---

## Layout

### Container

```html
<div class="container">…</div>         <!-- Responsivo com max-width -->
<div class="container container--sm">…</div>  <!-- Máx. 640px -->
<div class="container container--lg">…</div>  <!-- Máx. 1024px -->
<div class="container container--fluid">…</div> <!-- Sem max-width -->
```

### Grid

Sistema de 12 colunas com CSS Grid:

```html
<!-- Colunas fixas -->
<div class="grid grid--cols-3 grid--gap-4">
  <div>…</div>
  <div>…</div>
  <div>…</div>
</div>

<!-- Coluna principal + sidebar (8/4) -->
<div class="grid grid--cols-12 grid--gap-6">
  <main class="col-span-8">…</main>
  <aside class="col-span-4">…</aside>
</div>

<!-- Auto-fit responsivo (sem media queries manuais) -->
<div class="grid grid--auto-fit" style="--grid-min: 240px;">
  <div>…</div>
  <div>…</div>
</div>
```

**Modificadores de gap:** `grid--gap-0` `grid--gap-2` `grid--gap-4` `grid--gap-6` `grid--gap-8`

**Spans:** `col-span-1` … `col-span-12` `col-span-full`

**Responsivo:** `md:grid--cols-2` `lg:grid--cols-4`

### Stack & Inline

```html
<!-- Stack: layout vertical com gap uniforme -->
<div class="stack stack--gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Inline: layout horizontal centralizado verticalmente -->
<div class="inline inline--gap-3">
  <span>Label</span>
  <button class="btn btn--solid btn--sm">Ação</button>
</div>

<!-- Spacer (empurra elementos para as extremidades) -->
<div class="inline">
  <span>Esquerda</span>
  <div class="spacer"></div>
  <span>Direita</span>
</div>
```

---

## Componentes

### Button

```html
<!-- Variantes -->
<button class="btn btn--solid">Solid</button>
<button class="btn btn--outline">Outline</button>
<button class="btn btn--ghost">Ghost</button>
<button class="btn btn--neutral">Neutral</button>
<button class="btn btn--danger">Danger</button>
<button class="btn btn--danger-outline">Danger Outline</button>

<!-- Tamanhos -->
<button class="btn btn--solid btn--xs">XSmall</button>
<button class="btn btn--solid btn--sm">Small</button>
<button class="btn btn--solid btn--md">Medium (padrão)</button>
<button class="btn btn--solid btn--lg">Large</button>
<button class="btn btn--solid btn--xl">XLarge</button>

<!-- Largura total -->
<button class="btn btn--solid btn--block">Full Width</button>

<!-- Somente ícone -->
<button class="btn btn--ghost btn--icon btn--md" aria-label="Configurações">
  <!-- svg -->
</button>

<!-- Com ícone + texto -->
<button class="btn btn--solid">
  <svg>…</svg>
  Salvar
</button>

<!-- Loading -->
<button class="btn btn--solid btn--loading" disabled>Salvando…</button>

<!-- Desabilitado -->
<button class="btn btn--solid" disabled>Desabilitado</button>

<!-- Grupo -->
<div class="btn-group">
  <button class="btn btn--neutral btn--sm">Dia</button>
  <button class="btn btn--neutral btn--sm">Semana</button>
  <button class="btn btn--solid btn--sm">Mês</button>
</div>
```

### Input, Textarea, Select

**Field wrapper** (label + input + hint/error):

```html
<div class="field">
  <label class="field__label field__label--required" for="email">Email</label>
  <input class="input" type="email" id="email" placeholder="voce@email.com">
  <span class="field__hint">Nunca compartilharemos seu email.</span>
</div>

<!-- Estado de erro -->
<div class="field">
  <label class="field__label" for="nome">Nome</label>
  <input class="input input--error" type="text" id="nome"
         aria-invalid="true" aria-describedby="nome-erro">
  <span class="field__error" id="nome-erro">Este campo é obrigatório.</span>
</div>
```

**Com ícone (prefix/suffix):**

```html
<div class="input-wrapper input-wrapper--prefix">
  <span class="input-wrapper__prefix"><!-- ícone svg --></span>
  <input class="input" type="search" placeholder="Buscar…">
</div>

<!-- Suffix clicável (ex: mostrar senha) -->
<div class="input-wrapper input-wrapper--suffix">
  <input class="input" type="password">
  <button class="input-wrapper__suffix input-wrapper__suffix--clickable"><!-- olho --></button>
</div>
```

**Addon (botão/texto colado):**

```html
<div class="input-addon">
  <span class="input-addon__item">https://</span>
  <input class="input" type="text" placeholder="meusite.com">
  <button class="btn btn--solid">Ir</button>
</div>
```

**Tamanhos:** `input--sm` `input--lg`

**Textarea:**

```html
<textarea class="input" rows="4" placeholder="Mensagem…"></textarea>
```

**Select:**

```html
<select class="input">
  <option value="">Selecione…</option>
  <option value="a">Opção A</option>
</select>
```

### Checkbox, Radio, Switch

```html
<!-- Checkbox -->
<label class="checkbox">
  <input class="checkbox__input" type="checkbox">
  <span class="checkbox__label">
    Aceito os termos
    <span class="checkbox__hint">Leia os termos antes de aceitar.</span>
  </span>
</label>

<!-- Radio group -->
<div class="radio-group">
  <label class="radio">
    <input class="radio__input" type="radio" name="plano" value="free" checked>
    <span class="radio__label">Gratuito</span>
  </label>
  <label class="radio">
    <input class="radio__input" type="radio" name="plano" value="pro">
    <span class="radio__label">Pro</span>
  </label>
</div>

<!-- Switch / Toggle -->
<label class="switch">
  <input class="switch__input" type="checkbox" checked>
  <span class="switch__label">Notificações ativas</span>
</label>
```

### Card

```html
<!-- Padrão -->
<div class="card">
  <div class="card__header">
    <h3 class="card__title">Título</h3>
    <p class="card__description">Subtítulo opcional.</p>
  </div>
  <div class="card__body">Conteúdo.</div>
  <hr class="card__divider">
  <div class="card__footer">
    <button class="btn btn--neutral btn--sm">Cancelar</button>
    <button class="btn btn--solid btn--sm">Confirmar</button>
  </div>
</div>

<!-- Com imagem -->
<div class="card">
  <img class="card__media" src="imagem.jpg" alt="…">
  <div class="card__body">…</div>
</div>
```

**Variantes:** `card--elevated` `card--flat` `card--ghost`

**Interativo:** `card--hoverable` `card--clickable`

**Tamanhos:** `card--sm` `card--lg`

### Badge

```html
<!-- Subtle (padrão) -->
<span class="badge badge--primary">Novo</span>
<span class="badge badge--success">Ativo</span>
<span class="badge badge--warning">Pendente</span>
<span class="badge badge--error">Erro</span>
<span class="badge badge--info">Info</span>
<span class="badge badge--neutral">Neutro</span>

<!-- Solid -->
<span class="badge badge--solid-primary">Novo</span>

<!-- Com indicador de status (dot) -->
<span class="badge badge--success badge--dot">Online</span>

<!-- Notificação posicional -->
<div class="badge-container">
  <button class="btn btn--neutral btn--icon"><!-- ícone --></button>
  <span class="badge badge--notification">5</span>
</div>
```

**Tamanhos:** `badge--sm` `badge--lg`

### Alert

```html
<div class="alert alert--info" role="alert">
  <svg class="alert__icon">…</svg>
  <div class="alert__content">
    <p class="alert__title">Informação</p>
    <p class="alert__body">Mensagem de contexto.</p>
  </div>
  <button class="alert__close" aria-label="Fechar">✕</button>
</div>
```

**Variantes:** `alert--info` `alert--success` `alert--warning` `alert--error`

**Variante com borda lateral:** adicione `alert--accent` junto com o tipo:

```html
<div class="alert alert--accent alert--success">…</div>
```

### Modal & Drawer

Usa o elemento nativo `<dialog>` para acessibilidade máxima.

```html
<!-- Trigger -->
<button data-modal-open="meu-modal">Abrir</button>

<!-- Modal -->
<dialog id="meu-modal" class="modal" data-modal>
  <div class="modal__header">
    <div>
      <h2 class="modal__title">Título</h2>
      <p class="modal__description">Subtítulo.</p>
    </div>
    <button class="modal__close" data-modal-close aria-label="Fechar">✕</button>
  </div>
  <div class="modal__body">
    Conteúdo do modal.
  </div>
  <div class="modal__footer">
    <button class="btn btn--neutral" data-modal-close>Cancelar</button>
    <button class="btn btn--solid">Confirmar</button>
  </div>
</dialog>
```

**Drawer (painel lateral):** troque `class="modal"` por `class="drawer"`.

**Tamanhos:** `modal--sm` `modal--lg` `modal--xl` `modal--full`

**JS API:**

```js
DS.modal.open('meu-modal');
DS.modal.close('meu-modal');
```

**Fechar no backdrop:** comportamento padrão. Para desabilitar: `data-modal-no-backdrop-close` no `<dialog>`.

### Tabs

```html
<div class="tabs" data-tabs>
  <div class="tab-list" role="tablist">
    <button class="tab" role="tab" aria-selected="true"  aria-controls="painel-1">Visão geral</button>
    <button class="tab" role="tab" aria-selected="false" aria-controls="painel-2">Analytics</button>
    <button class="tab" role="tab" aria-selected="false" disabled>Desabilitado</button>
  </div>
  <div id="painel-1" class="tab-panel" role="tabpanel">Conteúdo 1</div>
  <div id="painel-2" class="tab-panel" role="tabpanel" hidden>Conteúdo 2</div>
</div>
```

**Variante pills:**

```html
<div class="tab-list tab-list--pills" role="tablist">…</div>
```

**Tabs verticais:**

```html
<div class="tabs tabs--vertical" data-tabs>…</div>
```

**Badge no tab:**

```html
<button class="tab" role="tab">
  Mensagens <span class="tab__badge">12</span>
</button>
```

**Teclado:** `←` `→` navega, `Home` primeiro, `End` último, `Enter`/`Space` ativa.

### Table

```html
<div class="table-wrapper">
  <table class="table table--hover">
    <thead>
      <tr>
        <th>
          <button class="table__sort-btn" aria-sort="ascending">
            Nome <svg class="table__sort-icon">…</svg>
          </button>
        </th>
        <th>Status</th>
        <th class="align-right">Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ana Beatriz</td>
        <td><span class="badge badge--success badge--dot">Ativo</span></td>
        <td class="align-right">…</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Modificadores:** `table--hover` `table--striped` `table--bordered` `table--sm` `table--lg` `table--fixed`

**Skeleton de carregamento:**

```html
<td><div class="table__skeleton"></div></td>
```

### Pagination

```html
<nav class="pagination" aria-label="Paginação">
  <button class="pagination__item" aria-label="Anterior" disabled>←</button>
  <button class="pagination__item" aria-current="page">1</button>
  <button class="pagination__item">2</button>
  <button class="pagination__item">3</button>
  <span class="pagination__ellipsis">…</span>
  <button class="pagination__item">10</button>
  <button class="pagination__item" aria-label="Próximo">→</button>
</nav>
```

**Variantes:** `pagination--outline`

**Tamanhos:** `pagination--sm` `pagination--lg`

### Navbar & Sidebar

```html
<nav class="navbar" data-navbar>
  <a href="/" class="navbar__brand">
    <img class="navbar__brand-logo" src="logo.svg" alt="">
    MeuApp
  </a>

  <div class="navbar__nav" data-navbar-nav>
    <a href="/dashboard" class="navbar__link navbar__link--active">Dashboard</a>
    <a href="/projetos" class="navbar__link">Projetos</a>
  </div>

  <div class="navbar__spacer"></div>

  <div class="navbar__actions">
    <button class="btn btn--solid btn--sm">Upgrade</button>
    <div class="avatar avatar--sm">AB</div>
  </div>

  <button class="navbar__toggle" data-navbar-toggle aria-label="Menu">
    <span></span>
  </button>
</nav>
```

**Sidebar:**

```html
<aside class="sidebar">
  <div class="sidebar__section">
    <span class="sidebar__label">Geral</span>
    <a href="#" class="sidebar__item sidebar__item--active">
      <svg class="sidebar__item__icon">…</svg>
      Dashboard
      <span class="sidebar__item__badge">
        <span class="badge badge--primary">3</span>
      </span>
    </a>
  </div>
</aside>
```

### Avatar

```html
<!-- Iniciais -->
<div class="avatar avatar--md avatar--blue">AB</div>

<!-- Foto -->
<div class="avatar avatar--md">
  <img src="foto.jpg" alt="Nome">
</div>

<!-- Com status -->
<div class="avatar-wrapper">
  <div class="avatar avatar--md avatar--green">CD</div>
  <span class="avatar__status avatar__status--online"></span>
</div>

<!-- Grupo -->
<div class="avatar-group">
  <div class="avatar avatar--sm avatar--blue">AB</div>
  <div class="avatar avatar--sm avatar--green">CD</div>
  <div class="avatar avatar--sm avatar-group__overflow">+5</div>
</div>
```

**Tamanhos:** `avatar--xs` `avatar--sm` `avatar--md` `avatar--lg` `avatar--xl` `avatar--2xl`

**Cores:** `avatar--blue` `avatar--green` `avatar--amber` `avatar--red` `avatar--purple` `avatar--teal`

**Formas:** `avatar--square` `avatar--rounded`

**Status:** `avatar__status--online` `--busy` `--away` `--offline`

### Tooltip & Popover

CSS-only via `:hover` / `:focus-within`. Sem JavaScript necessário.

```html
<div class="tooltip-wrapper">
  <button class="btn btn--neutral">Hover aqui</button>
  <span class="tooltip tooltip--top" role="tooltip">Texto da dica</span>
</div>
```

**Posições:** `tooltip--top` (padrão) `tooltip--bottom` `tooltip--left` `tooltip--right`

**Popover (mais rico):**

```html
<div class="popover">
  <p class="popover__title">Título</p>
  <p class="popover__body">Conteúdo detalhado do popover.</p>
</div>
```

### Dropdown

```html
<div class="dropdown" data-dropdown>
  <button class="btn btn--neutral dropdown__trigger" data-dropdown-trigger>
    Ações <svg>…</svg>
  </button>
  <div class="dropdown__menu" role="menu">
    <span class="dropdown__label">Seção</span>
    <button class="dropdown__item" role="menuitem">
      <svg class="dropdown__item__icon">…</svg>
      Editar
      <span class="dropdown__item__badge">⌘E</span>
    </button>
    <div class="dropdown__separator"></div>
    <button class="dropdown__item dropdown__item--danger" role="menuitem">Excluir</button>
  </div>
</div>
```

**Posicionamento:** `dropdown__menu--right` `dropdown__menu--up`

**Estado ativo:** `dropdown__item--active`

**Teclado:** `↑` `↓` navega, `Home` `End`, `Escape` fecha.

### Spinner, Progress & Skeleton

```html
<!-- Spinner -->
<div class="spinner spinner--md"></div>
<div class="spinner spinner--white"></div>  <!-- em fundos coloridos -->

<!-- Dots -->
<div class="spinner-dots">
  <div class="spinner-dots__dot"></div>
  <div class="spinner-dots__dot"></div>
  <div class="spinner-dots__dot"></div>
</div>

<!-- Progress bar -->
<div class="progress progress--md">
  <div class="progress__bar" style="width: 65%;"></div>
</div>

<!-- Progress indeterminado -->
<div class="progress progress--indeterminate">
  <div class="progress__bar"></div>
</div>

<!-- Skeleton -->
<div class="skeleton skeleton--heading"></div>
<div class="skeleton skeleton--text"></div>
<div class="skeleton skeleton--text"></div>
<div class="skeleton skeleton--circle skeleton--avatar"></div>
```

**Tamanhos spinner:** `spinner--xs` `spinner--sm` `spinner--md` `spinner--lg` `spinner--xl`

**Tamanhos progress:** `progress--xs` `progress--sm` `progress--md` `progress--lg` `progress--xl`

**Cores progress:** `progress__bar--success` `--warning` `--error`

### Toast

Requer a camada JavaScript (`js/ds.js`).

```js
// Básico
DS.toast.show({ message: 'Operação concluída.', type: 'success' });

// Atalhos por tipo
DS.toast.success('Salvo com sucesso!');
DS.toast.error('Falha ao conectar.');
DS.toast.warning('Sessão expirando.');
DS.toast.info('Atualização disponível.');

// Com título
DS.toast.success('Perfil atualizado!', { title: 'Sucesso' });

// Persistente (duration: 0 = não fecha automaticamente)
DS.toast.show({ message: 'Atenção: manutenção em 5 min.', duration: 0 });

// Promise toast
DS.toast.promise(
  fetch('/api/salvar').then(r => r.json()),
  {
    loading: 'Salvando…',
    success: 'Dados salvos!',
    error:   (err) => `Erro: ${err.message}`,
  }
);
```

**Opções completas:**

```js
DS.toast.show({
  message:  'Texto obrigatório',
  title:    'Título opcional',
  type:     'success', // 'info' | 'success' | 'warning' | 'error' | 'neutral'
  duration: 4000,      // ms. 0 = persistente
  closable: true,      // mostra botão de fechar
  position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' |
                             // 'top-left' | 'top-center' | 'bottom-center'
});
```

---

## Utilitários

Classes atômicas para ajustes rápidos. Por estarem no layer `ds-utilities` (mais alto), sobrescrevem qualquer componente.

### Espaçamento

```html
<!-- Margin -->
<div class="mt-4 mb-8 mx-auto">…</div>

<!-- Padding -->
<div class="p-6 px-8 py-4">…</div>

<!-- Gap (em flex/grid) -->
<div class="flex gap-3">…</div>
```

Escala: `0` `1` `2` `3` `4` `5` `6` `8` `10` `12`

### Tipografia

```html
<p class="text-sm font-medium text-secondary leading-relaxed">…</p>
<p class="text-xl font-bold tracking-tight">…</p>
<span class="uppercase tracking-widest text-xs text-tertiary">Rótulo</span>
<code class="font-mono text-sm">código()</code>
```

### Cores & Bordas

```html
<div class="bg-surface border rounded-xl shadow-md">…</div>
<p class="text-accent font-medium">Link de destaque</p>
<div class="bg-success text-sm p-4 rounded-lg">…</div>
```

### Display & Layout

```html
<div class="flex items-center justify-between gap-4">…</div>
<div class="hidden sm:flex">…</div>  <!-- oculto no mobile -->
<div class="truncate">Texto muito longo que vai cortar…</div>
```

---

## Camada JavaScript

Importada via `<script type="module" src="js/ds.js">`. Expõe `window.DS`.

### DS.toast

Ver seção [Toast](#toast) acima.

### DS.modal

```js
// Abrir pelo ID do <dialog>
DS.modal.open('meu-modal');

// Fechar
DS.modal.close('meu-modal');
```

**Eventos customizados:**

```js
document.getElementById('meu-modal').addEventListener('ds:modal:open',  () => {});
document.getElementById('meu-modal').addEventListener('ds:modal:close', () => {});
```

### DS.init

Reinicializa todos os componentes dentro de um elemento. Útil quando você injeta HTML dinamicamente (HTMX, innerHTML, etc.):

```js
// Inicializar componentes num fragmento recém-inserido
const container = document.getElementById('dinamico');
container.innerHTML = `<div class="dropdown" data-dropdown>…</div>`;
DS.init(container);
```

> Por padrão, um `MutationObserver` chama `DS.init` automaticamente para nós adicionados ao `document.body`. Chame manualmente apenas se precisar de controle granular.

**Eventos customizados disponíveis:**

| Componente | Evento | `detail` |
|---|---|---|
| Dropdown | `ds:dropdown:open` / `ds:dropdown:close` | — |
| Tabs | `ds:tabs:change` | `{ tab, panelId }` |
| Modal | `ds:modal:open` / `ds:modal:close` | — |
| Navbar | `ds:navbar:open` / `ds:navbar:close` | — |
| Toast | `ds:toast:show` / `ds:toast:dismiss` | `{ type, message }` |

---

## Acessibilidade

| Feature | Implementação |
|---|---|
| Foco visível | `outline: 2px solid --border-focus` em todos os elementos focáveis |
| ARIA roles | Todos os componentes interativos possuem `role`, `aria-*` corretos |
| Focus trap | Modais prendem o foco com Tab/Shift+Tab dentro do diálogo |
| Scroll lock | Body scroll bloqueado enquanto modal está aberto |
| Screen readers | `.sr-only` para texto apenas para leitores de tela |
| `aria-live` | Toast container usa `aria-live="polite"` / `role="alert"` |
| Teclado completo | Dropdown, Tabs, Modal — todos navegáveis sem mouse |
| Motion | `prefers-reduced-motion: reduce` zera todas as animações |
| Semântica | Uso de `<dialog>`, `role="menu"`, `role="tablist"`, `aria-selected`, etc. |

---

## Browser Support

Requer suporte a:

| Feature | Suporte mínimo |
|---|---|
| CSS Custom Properties | Chrome 49, Firefox 31, Safari 9.1 |
| CSS `@layer` | Chrome 99, Firefox 97, Safari 15.4 |
| `@import ... layer()` | Chrome 99, Firefox 97, Safari 15.4 |
| `<dialog>` nativo | Chrome 37, Firefox 98, Safari 15.4 |
| ES Modules (`type="module"`) | Chrome 61, Firefox 60, Safari 10.1 |
| `prefers-color-scheme` | Chrome 76, Firefox 67, Safari 12.1 |

> Para suporte a browsers mais antigos (sem `@layer`), remova as declarações `layer()` dos `index.css` — o CSS continua funcionando, apenas sem o isolamento de cascade.
