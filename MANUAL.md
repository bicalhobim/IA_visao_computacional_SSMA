# Manual do Usuário e Técnico - AI.MÉTODO EXPERT

**Versão:** Beta.21.2025
**Desenvolvido por:** Lucas Bicalho, PMP

---

## 📜 Sumário

1.  [**Introdução**](#1-introdução)
2.  [**⚠️ Isenção de Responsabilidade Obrigatória**](#2-️-isenção-de-responsabilidade-obrigatória)
3.  [**Guia de Início Rápido: Instalação e Configuração**](#3-guia-de-início-rápido-instalação-e-configuração)
4.  [**Guia do Usuário (Para Profissionais de SST)**](#4-guia-do-usuário-para-profissionais-de-sst)
    - [Visão Geral da Interface](#visão-geral-da-interface)
    - [Passo a Passo: Realizando uma Análise](#passo-a-passo-realizando-uma-análise)
    - [Gerenciando a Fila de Análise & Histórico](#gerenciando-a-fila-de-análise--histórico)
    - [Entendendo e Interagindo com os Resultados](#entendendo-e-interagindo-com-os-resultados)
    - [Otimizando seu Espaço de Trabalho](#otimizando-seu-espaço-de-trabalho)
    - [Visualizando e Exportando Relatórios](#visualizando-e-exportando-relatórios)
5.  [**Guia Técnico (Para Desenvolvedores e Especialistas)**](#5-guia-técnico-para-desenvolvedores-e-especialistas)
    - [Arquitetura da Aplicação e Tecnologias](#arquitetura-da-aplicação-e-tecnologias)
    - [O Coração da IA: Lógica de Prompts e RAG](#o-coração-da-ia-lógica-de-prompts-e-rag)
    - [Fluxo de Dados e Gerenciamento de Estado (Jotai)](#fluxo-de-dados-e-gerenciamento-de-estado-jotai)
6.  [**Licenciamento e Contato**](#6-licenciamento-e-contato)

---

## 1. Introdução

O **AI.MÉTODO EXPERT** é uma plataforma de software inovadora que atua como um agente de Inteligência Artificial para Segurança, Saúde e Meio Ambiente (SSMA). Utilizando a avançada API Google Gemini, a ferramenta analisa imagens para identificar riscos e não conformidades com base nas Normas Regulamentadoras (NRs) brasileiras.

Este manual foi projetado para dois públicos:
-   **Profissionais de SST:** Para que possam utilizar a ferramenta em seu potencial máximo no dia a dia.
-   **Desenvolvedores e especialistas:** Para que compreendam a arquitetura, a tecnologia e a lógica por trás da aplicação.

## 2. ⚠️ Isenção de Responsabilidade Obrigatória

Este software, **AI.MÉTODO EXPERT**, é fornecido "COMO ESTÁ", sem garantias de qualquer tipo, expressas ou implícitas. Ele é uma ferramenta de auxílio baseada em inteligência artificial e está sujeito a erros, omissões e imprecisões.

O usuário assume **total e exclusiva responsabilidade** pela verificação, validação, interpretação e aplicação de qualquer informação obtida através deste software.

## 3. Guia de Início Rápido: Instalação e Configuração

Para começar a usar o software, siga os dois guias detalhados abaixo. Eles foram criados para serem seguidos por qualquer pessoa, mesmo sem conhecimento técnico.

1.  ### **[Guia de Instalação.md](./Guia%20de%20Instalação.md)**
    Este guia mostra como executar o software em seu computador local usando ferramentas gratuitas e simples.

2.  ### **[Guia de Configuração.md](./Guia%20de%20Configuração.md)**
    Este guia mostra como obter as **chaves de API** necessárias do Google (Gemini e Drive). **Você inserirá essas chaves diretamente na interface do programa**, não precisará editar nenhum código.

## 4. Guia do Usuário (Para Profissionais de SST)

### Visão Geral da Interface

A tela principal é dividida em três áreas:

1.  **Painel de Controle (Esquerda):** É aqui que você carrega imagens e configura sua análise.
2.  **Área de Visualização (Centro):** Exibe a imagem ativa e os resultados visuais da análise.
3.  **Painel de Resultados (Direita):** Detalha cada risco encontrado e permite exportar relatórios.

### Passo a Passo: Realizando uma Análise

#### Passo 1: Login e Configuração de Chaves
-   **Login:** Ao abrir o software, você será recebido por uma tela de login. Insira qualquer e-mail e senha para prosseguir.
-   **Configuração de Chaves:** Se for seu primeiro acesso, um pop-up aparecerá solicitando as chaves de API. Copie as chaves que você obteve seguindo o **Guia de Configuração** e cole-as nos campos correspondentes. Elas ficarão salvas no seu navegador.

#### Passo 2: Carregue Suas Imagens
No **Painel de Controle**, clique no botão **"Carregar Imagem(ns)"**. Você pode selecionar um ou vários arquivos de imagem do seu computador. As imagens selecionadas aparecerão como miniaturas no painel **"Análise & Histórico"**.

#### Passo 3: Selecione e Configure a Análise
-   **Selecione a Imagem:** Clique em uma das miniaturas no histórico para torná-la ativa.
-   **Escolha o Tipo de Detecção:** Em "Configurar Análise", selecione como a IA deve apontar os riscos (ex: "Caixas 2D").
-   **Defina o Foco:** Em "Prompt de Análise", descreva o que a IA deve procurar (ex: `"Verificar falta de EPIs como capacetes e luvas"`).

#### Passo 4: Inicie a Análise
Clique no grande botão azul **"Analisar Imagem"**. O status da miniatura mudará para amarelo (analisando) e, ao concluir, para verde. Os resultados aparecerão no painel direito.

### Gerenciando a Fila de Análise & Histórico

Esta seção é o seu centro de controle de sessão.
-   **Status Visual:** Cada miniatura tem um indicador de status (Cinza: na fila, Amarelo: analisando, Verde: concluída).
-   **ID Único:** Cada imagem recebe uma etiqueta de ID para fácil referência.
-   **Persistência:** Suas últimas 5 análises *concluídas* são salvas no seu navegador.

### Entendendo e Interagindo com os Resultados

-   **Painel de Resultados (Direita):** Lista cada risco com descrição, fonte na NR e plano de ação.
-   **Visualizador de Relatório Integrado:** Após a análise, um botão **"Visualizar"** aparece sobre a imagem. Clicar nele abre uma tela com o relatório HTML completo, **incluindo a imagem com as anotações visuais desenhadas**.

### Otimizando seu Espaço de Trabalho
-   **Painéis Recolhíveis:** Clique nas setas (`<` ou `>`) nas bordas dos painéis laterais para recolhê-los ou expandi-los.

### Visualizando e Exportando Relatórios

No final do Painel de Resultados, você pode exportar seus relatórios:
-   **JSON:** Dados brutos.
-   **PDF:** Relatório formal que inclui a imagem com as anotações visuais.
-   **HTML:** Relatório web editável, que também inclui a imagem com anotações.

## 5. Guia Técnico (Para Desenvolvedores e Especialistas)

### Arquitetura da Aplicação e Tecnologias

-   **Framework Frontend:** [**React 19**](https://react.dev/) com [**TypeScript**](https://www.typescriptlang.org/).
-   **Gerenciamento de Estado:** [**Jotai**](https://jotai.org/). As chaves de API são gerenciadas por átomos que persistem no `localStorage`.
-   **API de IA:** [**Google Gemini API (`@google/genai`)**](https://ai.google.dev/).

### O Coração da IA: Lógica de Prompts e RAG

A precisão da análise vem de uma técnica de **RAG (Retrieval-Augmented Generation)**. O processo ocorre em `SideControls.tsx` na função `handleAnalyze`.

**O Processo RAG em 3 Etapas:**
1.  **Pré-Análise:** A imagem é enviada ao Gemini para identificar NRs relevantes (ex: `["NR-6", "NR-35"]`).
2.  **Recuperação:** O sistema consulta `public/nr_knowledge_base.json` e extrai os textos correspondentes.
3.  **Aumento e Geração:** O prompt final é montado dinamicamente, combinando o **conhecimento recuperado** com o **molde do prompt principal** e o **foco do usuário**, forçando o modelo a basear suas respostas em informações verificadas.

### Fluxo de Dados e Gerenciamento de Estado (Jotai)

-   `IsUserAuthenticatedAtom`: Controla o fluxo de login.
-   `ApiKeyAtoms`: Um conjunto de átomos que gerenciam as chaves de API do usuário, persistidas no `localStorage`.
-   `IsApiKeyModalVisibleAtom`: Controla a exibição do pop-up de configuração de chaves.
-   `RecentAnalysesAtom`: Gerencia a fila de imagens, seus status e os resultados.
-   `ReportHtmlToViewAtom`: Armazena o HTML do relatório para o visualizador integrado.

## 6. Licenciamento e Contato

-   **Licença:** O código-fonte é licenciado sob a **Apache License 2.0**. A propriedade intelectual do design e customizações pertence a **Lucas Bicalho, PMP**.
-   **Contato:** [linkedin.com/in/bicalhobim](https://www.linkedin.com/in/bicalhobim/).