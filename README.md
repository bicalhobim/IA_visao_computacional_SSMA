# AI.MÉTODO EXPERT - Agente Autônomo de Segurança do Trabalho

**Versão:** Beta.21.2025

Bem-vindo ao AI.MÉTODO EXPERT! Esta é uma plataforma de software de ponta que utiliza a API Google Gemini para funcionar como um agente de Segurança, Saúde e Meio Ambiente (SSMA). A ferramenta permite analisar imagens de diversas fontes para detectar e relatar riscos de segurança, com base nas Normas Regulamentadoras (NRs) brasileiras.

---

### **Desenvolvido por: Lucas Bicalho, PMP**

- **WhatsApp:** `+55 31988277069`
- **LinkedIn:** [linkedin.com/in/bicalhobim](https://www.linkedin.com/in/bicalhobim/)
- **Instagram:** [@bicalhobim.eng](https://www.instagram.com/bicalhobim.eng/)
- **Github:** [github.com/bicalhobim](https://github.com/bicalhobim)

---

## 📜 Índice

- [✨ Funcionalidades Principais](#-funcionalidades-principais)
- [⚠️ Isenção de Responsabilidade (Disclaimer)](#️-isenção-de-responsabilidade-disclaimer)
- [🚀 Guia de Início Rápido (Quick Start)](#-guia-de-início-rápido-quick-start)
- [🏗️ Arquitetura da Aplicação](#️-arquitetura-da-aplicação)
- [⚖️ Licenciamento](#️-licenciamento)

## ✨ Funcionalidades Principais

- **Configuração Amigável via UI**: Esqueça a edição de arquivos de código. As chaves de API do Gemini e do Google Drive são inseridas em um pop-up seguro após o login, tornando a configuração inicial acessível a todos.
- **Análise Inteligente com RAG**: Utiliza o modelo `gemini-2.5-flash` com uma técnica de **Geração Aumentada por Recuperação (RAG)**, consultando uma base de conhecimento das NRs brasileiras para garantir respostas precisas e rastreáveis.
- **Fluxo de Trabalho por Sessão**:
  - **Login Profissional**: A aplicação inicia com uma tela de login para um acesso seguro.
  - **Carregamento em Lote**: Carregue múltiplas imagens de uma vez do seu computador.
  - **Fila de Análise com Status**: As imagens carregadas aparecem no painel "Análise & Histórico" com um indicador visual de status: na fila (cinza), analisando (amarelo) ou concluída (verde).
- **Interface Flexível**:
  - **Painéis Recolhíveis**: Maximize o foco na imagem recolhendo os painéis laterais de controle e resultados.
  - **Visualizador de Relatório Integrado**: Visualize relatórios HTML interativos em uma nova tela dentro do app, sem precisar baixar arquivos.
- **Relatórios Visuais e Detalhados**:
  - **Anotações na Imagem**: Os relatórios exportados (PDF, HTML) incluem a imagem com as **caixas de detecção e etiquetas desenhadas sobre ela**, criando um documento "What You See Is What You Get".
  - **Formatos de Exportação**: Gere relatórios em **JSON** (para dados), **PDF** (para documentos formais) e **HTML** (para edição interativa).

## ⚠️ Isenção de Responsabilidade (Disclaimer)

Este software, **AI.MÉTODO EXPERT**, é fornecido "COMO ESTÁ", sem garantias de qualquer tipo, expressas ou implícitas. Ele é uma ferramenta de auxílio baseada em inteligência artificial e está sujeito a erros, omissões e imprecisões.

O usuário assume **total e exclusiva responsabilidade** pela verificação, validação, interpretação e aplicação de qualquer informação obtida através deste software. É responsabilidade do usuário garantir a conformidade com todas as leis, normas e regulamentações aplicáveis.

Ao utilizar esta aplicação, você concorda que **Lucas Bicalho, Verum Institute, seus afiliados e os desenvolvedores não serão responsáveis** por quaisquer danos diretos, indiretos, incidentais, consequenciais ou de qualquer outra natureza, resultantes do uso ou da incapacidade de usar este software.

## 🚀 Guia de Início Rápido (Quick Start)

Siga os dois guias abaixo para colocar a aplicação em funcionamento em poucos minutos.

1.  ### **[Guia de Instalação.md](./Guia%20de%20Instalação.md)**
    Este guia mostra como executar o software em seu computador local usando o VS Code e a extensão Live Server, **sem precisar de conhecimentos de programação**.

2.  ### **[Guia de Configuração.md](./Guia%20de%20Configuração.md)**
    Este guia mostra como obter as **chaves de API** necessárias do Google (Gemini e Drive) para habilitar todas as funcionalidades do software.

## 🏗️ Arquitetura da Aplicação

Este projeto foi construído com uma arquitetura moderna e simplificada, focada em rodar diretamente no navegador sem a necessidade de um processo de build complexo.

- **Frontend**: [**React**](https://react.dev/) com [**TypeScript**](https://www.typescriptlang.org/).
- **Gerenciamento de Estado**: [**Jotai**](https://jotai.org/) para um gerenciamento de estado global atômico e leve. As chaves de API são gerenciadas com átomos persistidos no `localStorage`.
- **Estilização**: [**Tailwind CSS**](https://tailwindcss.com/) para uma estilização rápida e consistente.
- **API de IA**: [**Google Gemini API (`@google/genai`)**](https://ai.google.dev/).
- **Integração com a Nuvem**: Google Drive API v3 e Google Picker API.
- **Geração de Relatórios**: [**jsPDF**](https://github.com/parallax/jsPDF) e [**jspdf-autotable**](https://github.com/simonbengtsson/jsPDF-AutoTable).
- **Gerenciamento de Dependências**: O arquivo `index.html` utiliza um `importmap` para carregar todas as dependências diretamente de uma CDN (esm.sh).

## ⚖️ Licenciamento

O código-fonte desta aplicação é licenciado sob a **Apache License 2.0**. A propriedade intelectual do design, customizações e da aplicação como um todo pertence a **Lucas Bicalho, PMP**.

Para mais detalhes sobre as bibliotecas de código aberto utilizadas e suas respectivas licenças, consulte o arquivo `THIRD_PARTY_LICENSES.md`.