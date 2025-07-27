# Guia de Configuração de Chaves de API

Este guia detalha o processo para obter todas as chaves de API necessárias para o funcionamento completo do **AI.MÉTODO EXPERT**.

**Você precisará obter 3 tipos de credenciais:**
1.  **Chave da API do Google Gemini:** Para a funcionalidade de Inteligência Artificial.
2.  **Credenciais da API do Google Drive:** Para a funcionalidade de "Conectar Drive". Isso inclui:
    -   Chave de API do Google Cloud
    -   ID do Cliente OAuth 2.0
    -   Número do Projeto

Guarde todas as chaves em um local seguro, pois você irá inseri-las na interface do software.

---

## 1. Obtendo a Chave da API do Google Gemini

A chave do Gemini permite que a aplicação realize as análises de imagem com IA.

1.  **Acesse o Google AI Studio:**
    -   Vá para [**aistudio.google.com/app/apikey**](https://aistudio.google.com/app/apikey).
2.  **Faça login com sua Conta Google:**
    -   Se solicitado, faça login. Pode ser necessário concordar com os Termos de Serviço.
3.  **Crie uma nova chave de API:**
    -   Clique no botão **"Create API key in new project"** (Criar chave de API em um novo projeto).
    -   O Google AI Studio irá gerar uma longa sequência de caracteres. Essa é a sua chave.
4.  **Copie e guarde a chave:**
    -   Clique no ícone de cópia ao lado da chave.
    -   Salve esta chave em um local seguro (por exemplo, um bloco de notas). Você a usará no campo **"Chave da API do Gemini"** no software.



---

## 2. Obtendo as Credenciais do Google Drive

Essas credenciais são usadas para as funcionalidades de "Conectar Drive" e "Analisar Pasta do Drive". Elas são obtidas no **Google Cloud Console**.

### Passo 2.1: Criar ou Selecionar um Projeto

1.  **Acesse o Google Cloud Console:**
    -   Vá para [**console.cloud.google.com**](https://console.cloud.google.com).
2.  **Crie um novo projeto:**
    -   No topo da página, ao lado do logo "Google Cloud", clique no seletor de projetos.
    -   Clique em **"NOVO PROJETO"**.
    -   Dê um nome ao projeto (ex: `ai-metodo-expert-sst`) e clique em **"CRIAR"**.
3.  **Anote o Número do Projeto:**
    -   Com o projeto criado e selecionado, vá para o menu principal (ícone de hambúrguer `☰`) > `IAM e administrador` > `Configurações`.
    -   Copie o **Número do projeto** (um ID puramente numérico, ex: `123456789012`).
    -   Guarde este número. Você o usará no campo **"Número do Projeto Google"**.

### Passo 2.2: Habilitar as APIs Necessárias

Você precisa habilitar duas APIs para o projeto.

1.  No menu de navegação, vá para `APIs e serviços` > `Biblioteca`.
2.  Pesquise por **"Google Drive API"** e clique em **"ATIVAR"**.
3.  Volte para a Biblioteca, pesquise por **"Google Picker API"** e clique em **"ATIVAR"**.

### Passo 2.3: Criar as Credenciais

Agora, vamos criar a Chave de API e o ID do Cliente.

1.  No menu de navegação, vá para `APIs e serviços` > `Credenciais`.

#### A. Criar a Chave de API do Google Cloud

1.  Clique em **"+ CRIAR CREDENCIAIS"** e selecione **"Chave de API"**.
2.  Uma chave será gerada. Copie-a e guarde-a. Você a usará no campo **"Chave da API do Google Drive"**.
3.  **Importante:** É recomendado restringir a chave para evitar uso não autorizado, mas para testes locais, você pode deixar como está por enquanto.

#### B. Criar o ID do Cliente OAuth 2.0

1.  **Configurar a Tela de Consentimento:**
    -   Antes de criar o ID do cliente, você precisa configurar a "Tela de consentimento OAuth". Se já estiver configurada, pule para o passo 2.
    -   Vá para a aba **"Tela de consentimento OAuth"**.
    -   Selecione **"Externo"** e clique em **"CRIAR"**.
    -   Preencha os campos obrigatórios:
        -   **Nome do app:** `AI.MÉTODO EXPERT`
        -   **E-mail de suporte do usuário:** (seu e-mail)
        -   **Informações de contato do desenvolvedor:** (seu e-mail)
    -   Clique em **"SALVAR E CONTINUAR"** nas próximas etapas até voltar ao painel.
    -   Clique em **"PUBLICAR APLICATIVO"** e confirme. Isso evita problemas de "acesso não verificado" para uso pessoal.

2.  **Criar o ID do Cliente:**
    -   Volte para a aba **"Credenciais"**.
    -   Clique em **"+ CRIAR CREDENCIAIS"** e selecione **"ID do cliente OAuth 2.0"**.
    -   **Tipo de aplicativo:** Selecione **"Aplicativo da Web"**.
    -   **Nome:** Pode deixar o padrão.
    -   Em **"Origens JavaScript autorizadas"**, clique em **"+ ADICIONAR URI"** e adicione o endereço do seu servidor local. Se você está usando a extensão "Live Server", o endereço geralmente é `http://127.0.0.1:5500`. Adicione também `http://localhost:5500`.
    -   Em **"URIs de redirecionamento autorizados"**, adicione os mesmos endereços: `http://127.0.0.1:5500` e `http://localhost:5500`.
    -   Clique em **"CRIAR"**.
    -   Um pop-up mostrará o seu **"ID do cliente"**. Copie-o e guarde-o. Você o usará no campo **"ID do Cliente Google Drive"**.

---

### Resumo das Chaves a Serem Inseridas no Software

Ao final deste guia, você deverá ter as seguintes 4 chaves salvas e prontas para serem inseridas no pop-up de configuração do **AI.MÉTODO EXPERT**:

1.  `Chave da API do Gemini`
2.  `Chave da API do Google Drive`
3.  `ID do Cliente Google Drive`
4.  `Número do Projeto Google` 
