# SPEC de Interface-Base do SmartTrip

**Documento:** Especificação Técnica de Interface do Usuário (UI/UX Specification & Screen Contracts)  
**ID do Documento:** SPEC-UI-001  
**Versão:** 1.0.0  
**Data:** 2026-09-19  
**Status:** Aprovado para Implementação de UI  
**Rastreabilidade:** Alinhado à [SPEC Mestre](../SPEC_MESTRE.md) e [SPEC Operacional](SPEC_OPERACIONAL.md)  

---

## 1. Visão Geral e Princípios de Design

A interface do **SmartTrip** é concebida para oferecer uma experiência visual moderna, responsiva e de alta fluidez. O design prioriza:
- **Clareza Contextual:** Informações meteorológicas, temporais e geográficas visíveis sem sobrecarregar o usuário.
- **Microinterações Vivas:** Feedback imediato ao interagir com cards, seletores e turnos do itinerário.
- **Soberania do Usuário:** Facilidade extrema para editar, reordenar e excluir qualquer bloco sugerido pela IA.
- **Contratos de Interface Desacoplados:** Telas preparadas com contratos de dados bem tipados em TypeScript, operando inicialmente com dados mock estruturados antes da integração com Firebase e Gemini API.

---

## 2. Catálogo de Componentes Reutilizáveis Globais

| Componente | Função Principal | Variações / Estados |
| :--- | :--- | :--- |
| `Navbar` | Cabeçalho global com logo, links de navegação e avatar de usuário ou botões de login/cadastro. | Pública (anônima) / Autenticada. |
| `BottomNav` | Barra de navegação inferior exclusiva para dispositivos móveis (`< 768px`). | Ativo / Inativo em: Início, Explorar, Viagens, Perfil. |
| `Sidebar` | Menu lateral de navegação em desktop para telas privadas. | Recolhido / Expandido. |
| `Button` | Botão padrão da aplicação com suporte a microanimações e loading. | `primary`, `secondary`, `outline`, `ghost`, `danger`, `loading`. |
| `Input` / `Select` | Campos de formulário com label flutuante, ícones de apoio e mensagem de erro. | Default, Focus, Error, Disabled. |
| `DateRangePicker` | Seletor de data inicial e final com cálculo automático de dias. | Validação de 1 a 15 dias consecutivos. |
| `Modal` / `Dialog` | Janela sobreposta para confirmações destrutivas e adições de itens. | Entrada suave (*fade & scale*), fechamento por `Esc` ou backdrop. |
| `TripCard` | Card de exibição de viagem com capa, destino, datas, status e ações. | Padrão, Hover (*lift*), Opções (Ver / Excluir). |
| `WeatherRibbon` | Fita horizontal resumindo a previsão do tempo diária. | Sol, Parcialmente Nublado, Chuva, Tempestade. |
| `TimelineDay` | Bloco vertical que agrupa as atividades de um determinado dia da viagem. | Recolhível (*accordion*), cabeçalho com data e clima do dia. |
| `ActivityCard` | Card de atividade em um turno específico com botões de editar e remover. | Manhã (`morning`), Tarde (`afternoon`), Noite (`evening`). |
| `EmptyState` | Ilustração/ícone, título, descrição e CTA quando não há dados. | Sem viagens, sem folgas cadastradas, sem resultados de busca. |
| `SkeletonLoader` | Esqueletos pulsantes simulando o layout enquanto dados carregam. | Linha, Card, Timeline. |
| `Toast` / `Banner` | Notificações temporárias de sucesso, alerta ou falha. | Success, Info, Warning, Error. |

---

## 3. Matriz de Acesso e Rotas

| Rota | Nome da Tela | Visibilidade | Redirecionamento se Não Autenticado | Redirecionamento se Autenticado |
| :--- | :--- | :---: | :---: | :---: |
| `/` | Landing Page | Pública | Permite acesso livre | Permite acesso (ou atalho para Dashboard) |
| `/login` | Autenticação | Pública | Permite acesso | Redireciona para `/dashboard` |
| `/register` | Cadastro | Pública | Permite acesso | Redireciona para `/dashboard` |
| `/dashboard` | Painel Geral | Privada | Redireciona para `/login` | Permite acesso |
| `/profile` | Perfil e Preferências | Privada | Redireciona para `/login` | Permite acesso |
| `/availability` | Períodos de Folga | Privada | Redireciona para `/login` | Permite acesso |
| `/explore` | Gerador / Explorador | Privada | Redireciona para `/login` | Permite acesso |
| `/trips` | Minhas Viagens | Privada | Redireciona para `/login` | Permite acesso |
| `/trips/[id]` | Detalhe e Revisão | Privada | Redireciona para `/login` | Permite acesso |

---

## 4. Especificação Detalhada das Telas do MVP

---

### 4.1 Rota `/` — Landing Page (Home)
* **Objetivo:** Apresentar a proposta de valor do SmartTrip, demonstrar como a IA e o clima otimizam roteiros e converter visitantes em cadastros.
* **Elementos Obrigatórios:**
  - Hero section com chamada de impacto, subtítulo explicativo e CTA principal ("Começar a Planejar Grátis").
  - Demonstração interativa simulada (mock visual de um roteiro inteligente adaptado à chuva).
  - Seção com os 3 pilares: (1) IA Sob Medida, (2) Coerência com Clima, (3) Revisão Humana Total.
  - Rodapé institucional com links de termos, privacidade e GitHub do projeto.
* **Layout:**
  - *Desktop:* Grid de 2 colunas no Hero (texto + preview de card 3D/animado); grid de 3 cards nos pilares.
  - *Mobile:* Coluna única vertical, tipografia fluida e CTA fixo no rodapé após rolagem.
* **Componentes Utilizados:** `Navbar` (variante pública), `Button`, `TripCard` (demonstração).
* **Estados da Tela:** Padrão (estático/interativo com microinterações).
* **Acessibilidade:** Título `<h1>` único, contraste de cor nos botões `> 4.5:1`, foco visível via teclado.
* **Mocks Permitidos:** Card mock estático de roteiro em "Montevidéu".
* **Critérios de Aceite:**
  - `CA-UI-001`: O clique no CTA principal deve navegar para `/register` (ou `/dashboard` se autenticado).
  - `CA-UI-002`: O layout deve se adaptar a telas de 360px sem transbordamento horizontal.

---

### 4.2 Rota `/login` — Login
* **Objetivo:** Autenticar usuários cadastrados de forma simples e segura.
* **Elementos Obrigatórios:**
  - Campo de E-mail com validação de formato.
  - Campo de Senha com alternador para exibir/ocultar senha.
  - Botão de submissão ("Entrar").
  - Botão de Login Social ("Entrar com o Google").
  - Link de recuperação de senha ("Esqueceu sua senha?").
  - Link de navegação para a tela de cadastro (`/register`).
* **Layout:**
  - *Desktop:* Painel centralizado em container de 420px com fundo sutil ou divisão 50/50 com imagem ilustrativa de viagem.
  - *Mobile:* Tela cheia ocupando 100% da viewport com espaçamento de toque de no mínimo 48px por botão.
* **Componentes Utilizados:** `Input`, `Button`, `Toast`.
* **Estados da Tela:**
  - *Normal:* Campos vazios ou com autofill do navegador.
  - *Loading:* Botão com spinner e campos desabilitados durante requisição.
  - *Error:* Mensagem destacada em vermelho (ex.: "Credenciais inválidas").
* **Acessibilidade:** Labels associados aos inputs via `htmlFor`, atributos `autocomplete="email"` e `autocomplete="current-password"`.
* **Mocks Permitidos:** Mock handler que valida qualquer e-mail com `@` e redireciona para `/dashboard`.
* **Critérios de Aceite:**
  - `CA-UI-003`: Não permitir envio com e-mail inválido ou senha menor que 6 dígitos.
  - `CA-UI-004`: Sucesso na autenticação mock redireciona para `/dashboard`.

---

### 4.3 Rota `/register` — Cadastro de Novo Usuário
* **Objetivo:** Permitir criação de nova conta pelo usuário.
* **Elementos Obrigatórios:**
  - Campo de Nome Completo.
  - Campo de E-mail.
  - Campo de Senha e Confirmação de Senha (com medidor visual de força da senha).
  - Checkbox de consentimento com termos de uso.
  - Botão "Criar Conta".
  - Botão "Cadastrar com o Google".
  - Link para `/login` ("Já tem uma conta? Conecte-se").
* **Layout:** Idêntico ao padrão da tela de `/login`.
* **Componentes Utilizados:** `Input`, `Button`, `Toast`.
* **Estados da Tela:**
  - *Normal / Loading / Error:* Idêntico ao login com verificação extra de senha divergente.
* **Acessibilidade:** Mensagens de erro de validação vinculadas via `aria-describedby`.
* **Mocks Permitidos:** Registro mock que popula objeto de usuário na sessão em memória.
* **Critérios de Aceite:**
  - `CA-UI-005`: O botão permanece desabilitado se senhas não coincidirem ou termos não forem marcados.

---

### 4.4 Rota `/dashboard` — Painel Principal do Viajante
* **Objetivo:** Centralizar o status do viajante: próxima viagem programada, atalhos rápidos e resumo das folgas cadastradas.
* **Elementos Obrigatórios:**
  - Saudação personalizada (ex.: "Olá, Larissa!").
  - Card de Destaque da "Próxima Viagem" com contagem regressiva e resumo do clima.
  - Grade de Ações Rápidas: "Novo Roteiro", "Gerenciar Folgas", "Explorar Destinos".
  - Carrossel ou lista de viagens recentes.
  - Banner informativo se o usuário ainda não tiver cadastrado preferências no perfil.
* **Layout:**
  - *Desktop:* Sidebar fixa à esquerda + conteúdo principal em grid responsivo com cards.
  - *Mobile:* Header compacto com avatar + BottomNav na base.
* **Componentes Utilizados:** `Navbar`, `Sidebar`, `BottomNav`, `TripCard`, `Button`, `EmptyState`.
* **Estados da Tela:**
  - *Normal:* Lista de viagens preenchida.
  - *Vazio (Zero State):* Ilustração amigável "Você ainda não tem viagens planejadas" com botão "Criar Meu Primeiro Roteiro" direcionando para `/explore`.
  - *Loading:* Skeletons de cards de viagem.
* **Acessibilidade:** Áreas interativas com `role="region"` e títulos hierárquicos `<h2>`.
* **Mocks Permitidos:** Array com 2 viagens mockadas (1 futura e 1 passada).
* **Critérios de Aceite:**
  - `CA-UI-006`: Renderizar o estado vazio com CTA quando o array de viagens estiver vazio.
  - `CA-UI-007`: Clicar no card de viagem deve navegar para `/trips/[id]`.

---

### 4.5 Rota `/profile` — Perfil e Preferências
* **Objetivo:** Permitir ao usuário editar suas informações de identificação e calibrar os estilos de viagem padrão que a IA usará como base.
* **Elementos Obrigatórios:**
  - Foto de avatar (com opção de troca/upload mockado).
  - Campos: Nome de Exibição, E-mail (somente leitura), Cidade Base.
  - Seletor de Estilos Favoritos (pílulas selecionáveis: *Gastronomia*, *Cultura*, *Ecoturismo*, *Relaxamento*, *Vida Noturna*).
  - Seletor de Ritmo Padrão (*Tranquilo*, *Moderado*, *Intenso*).
  - Seletor de Faixa de Orçamento Padrão (*Econômico*, *Moderado*, *Conforto/Luxo*).
  - Botão "Salvar Alterações".
* **Layout:**
  - Formulário estruturado em seções com cards delimitados (*Dados Pessoais* e *Preferências de IA*).
* **Componentes Utilizados:** `Input`, `Select`, `Button`, `Toast`.
* **Estados da Tela:**
  - *Padrão:* Carregado com valores atuais.
  - *Dirty/Editado:* Botão "Salvar" destacado com animação sutil.
  - *Sucesso:* Toast confirmando "Preferências atualizadas com sucesso!".
* **Critérios de Aceite:**
  - `CA-UI-008`: Permitir selecionar múltiplos estilos favoritos e garantir que pelo menos 1 esteja ativo.

---

### 4.6 Rota `/availability` — Períodos de Folga
* **Objetivo:** Cadastrar e visualizar intervalos de datas livres (férias, feriados prolongados, fins de semana) para agilizar o planejamento.
* **Elementos Obrigatórios:**
  - Botão "Adicionar Período de Folga".
  - Calendário ou lista de intervalos já cadastrados (Data Início, Data Fim, Quantidade de Dias, Título opcional ex.: "Feriado Tiradentes").
  - Botão "Planejar Viagem Nesta Folga" ao lado de cada período cadastrado (atalho para `/explore` com datas pré-preenchidas).
  - Botão de exclusão de período de folga.
* **Layout:**
  - *Desktop:* Lista tabular estilizada com tags de duração em dias.
  - *Mobile:* Lista de cards com ações acessíveis por toque.
* **Componentes Utilizados:** `Modal`, `DateRangePicker`, `Input`, `Button`, `EmptyState`.
* **Estados da Tela:**
  - *Vazio:* "Nenhuma folga cadastrada. Adicione seus feriados para planejar viagens sem esforço."
  - *Modal Aberto:* Formulário de cadastro de nova folga.
* **Critérios de Aceite:**
  - `CA-UI-009`: Validar que a data final da folga seja posterior ou igual à data de início.
  - `CA-UI-010`: Clicar em "Planejar" redireciona para `/explore?startDate=...&endDate=...`.

---

### 4.7 Rota `/explore` — Busca, Clima & Geração de Roteiro
* **Objetivo:** O coração do fluxo de criação do SmartTrip. Coleta destino, datas e preferências, exibe o resumo climático previsto e dispara a geração com IA.
* **Elementos Obrigatórios:**
  - Campo de busca de Destino (com autocomplete mockado: ex.: "Rio de Janeiro", "Buenos Aires", "Lisboa", "Florianópolis").
  - Seletor de Datas (1 a 15 dias).
  - Painel de Preferências da Viagem (estilos, ritmo, orçamento — pré-carregados do perfil).
  - Card de Previsão do Clima (aparece após selecionar destino e datas, exibindo temperatura média e probabilidade de chuva).
  - Botão de Ação: "Gerar Roteiro Inteligente".
  - Modal/Tela de Espera com **Stepper de Status Progressivo**:
    - [x] Conectando dados meteorológicos...
    - [x] Mapeando pontos turísticos ideais...
    - [ ] Gemini estruturando seu itinerário...
* **Layout:**
  - Formulário em etapas (Wizard ou painel fluido de 2 colunas: parâmetros à esquerda, preview de clima à direita).
* **Componentes Utilizados:** `Input`, `DateRangePicker`, `WeatherRibbon`, `Button`, `Modal`.
* **Estados da Tela:**
  - *Formulário Inicial:* Campos em preenchimento.
  - *Clima Carregado:* WeatherRibbon visível com alertas (ex.: "Atenção: previsão de chuva no dia 2").
  - *Gerando (Loading):* Interface bloqueada com feedback visual dinâmico.
  - *Erro:* Mensagem caso o período exceda 15 dias ou falhe a conexão.
* **Critérios de Aceite:**
  - `CA-UI-011`: O botão "Gerar Roteiro" só fica habilitado com destino preenchido e datas válidas.
  - `CA-UI-012`: Ao concluir a geração mockada, navega automaticamente para `/trips/[id]` em modo de revisão.

---

### 4.8 Rota `/trips` — Minhas Viagens (Listagem Completa)
* **Objetivo:** Exibir todas as viagens do usuário com opções de filtro, busca e exclusão.
* **Elementos Obrigatórios:**
  - Barra superior de busca por nome de destino.
  - Filtros de status: "Todas", "Próximas", "Passadas".
  - Grid de `TripCard`.
  - Botão flutuante ou no topo "Nova Viagem" direcionando para `/explore`.
  - Modal de Confirmação de Exclusão ("Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.").
* **Layout:**
  - *Desktop:* Grid de 3 colunas de cards com paginação ou scroll infinito.
  - *Mobile:* Coluna única de cards com scroll vertical e espaçamento entre toques.
* **Componentes Utilizados:** `Navbar`, `BottomNav`, `TripCard`, `Modal`, `EmptyState`.
* **Estados da Tela:**
  - *Normal:* Grid com cards de viagem.
  - *Vazio:* "Você ainda não possui viagens nesta categoria."
  - *Exclusão:* Modal ativo com foco preso no diálogo (*focus trap*).
* **Critérios de Aceite:**
  - `CA-UI-013`: A confirmação de exclusão deve remover o card imediatamente da visualização com feedback visual de sucesso.

---

### 4.9 Rota `/trips/[id]` — Detalhe e Revisão Humana Interativa
* **Objetivo:** Visualização detalhada do itinerário dia a dia e aplicação da filosofia *"IA propõe, o humano dispõe"*, permitindo edição fina de cada bloco.
* **Elementos Obrigatórios:**
  - Cabeçalho da Viagem: Destino, período de datas, badge de status (`Rascunho` ou `Salvo`) e botões de ação: "Salvar Roteiro", "Compartilhar", "Exportar".
  - Fita de Clima (`WeatherRibbon`) com navegação rápida entre os dias da viagem.
  - Timeline estruturada por dias (`Dia 1`, `Dia 2`, etc.).
  - Blocos de Turno: Manhã, Tarde, Noite.
  - Para cada Atividade (`ActivityCard`):
    - Horário sugerido, título, descrição curta, badge de categoria e custo estimado.
    - Dica de Clima (ex.: "Ótimo para manhã ensolarada").
    - Ações em cada card: **Editar** (abre edição inline ou modal) e **Excluir** (remove atividade com 1 clique).
  - Botão "+ Adicionar Atividade Manual" ao final de cada dia.
* **Layout:**
  - *Desktop:* Timeline cronológica ampla com menu de atalho para os dias na lateral esquerda.
  - *Mobile:* Visualização em abas por dia (`Dia 1 | Dia 2 | Dia 3`) com scroll vertical das atividades.
* **Componentes Utilizados:** `TimelineDay`, `ActivityCard`, `WeatherRibbon`, `Modal`, `Button`, `Toast`.
* **Estados da Tela:**
  - *Modo Leitura:* Roteiro exibido de forma limpa.
  - *Modo Edição:* Campos editáveis inline com botão "Salvar Alteração".
  - *Atividade Excluída:* Remoção com animação suave de recolhimento (*collapse*).
* **Critérios de Aceite:**
  - `CA-UI-014`: O usuário consegue alterar o texto do título e descrição de qualquer atividade e ver a atualização refletida imediatamente.
  - `CA-UI-015`: O usuário consegue remover uma atividade com feedback instantâneo.
  - `CA-UI-016`: Clicar em "Salvar Roteiro" atualiza o badge de status para "Salvo" e emite Toast de confirmação.

---

## 5. Contratos de Dados Mock (TypeScript)

Para assegurar desenvolvimento sem dependência imediata de backend, as telas consumirão os tipos padronizados:

```typescript
export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  homeCity: string;
  preferences: {
    styles: string[];
    pace: 'tranquilo' | 'moderado' | 'intenso';
    budget: 'economico' | 'moderado' | 'luxo';
  };
}

export interface MockActivity {
  id: string;
  period: 'morning' | 'afternoon' | 'evening';
  time: string;
  title: string;
  description: string;
  category: 'cultural' | 'gastronomia' | 'natureza' | 'lazer';
  estimatedCost: 'gratis' | '$' | '$$' | '$$$';
  weatherTip: string;
  isCustom: boolean;
}

export interface MockDayPlan {
  dayIndex: number;
  date: string;
  weather: {
    tempMin: number;
    tempMax: number;
    rainProbability: number;
    condition: string;
  };
  activities: MockActivity[];
}

export interface MockTrip {
  id: string;
  title: string;
  destination: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'draft' | 'saved' | 'archived';
  itinerary: MockDayPlan[];
}
```

---

## 6. Diretrizes de Acessibilidade (a11y)

1. **Navegação por Teclado:** Todas as ações críticas (salvar, editar, excluir, abrir modal) devem ser acionáveis por tecla `Enter` ou `Espaço`, e modais devem fechar com `Escape`.
2. **Focus Management:** Ao abrir um modal, o foco do teclado é transferido para o primeiro elemento interativo interno; ao fechar, retorna ao botão que disparou a ação.
3. **Contraste de Cores:** Relação de contraste mínima de `4.5:1` para textos regulares e `3:1` para textos grandes e componentes de UI conforme padrão WCAG 2.1 AA.
4. **Semântica:** Uso correto de tags `<main>`, `<nav>`, `<header>`, `<section>`, `<article>` e atributos `aria-expanded`, `aria-label` e `aria-live` em notificações Toast.
