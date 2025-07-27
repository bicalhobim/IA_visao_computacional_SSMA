# Guia de Instalação - AI.MÉTODO EXPERT

**Versão:** Beta.21.2025

Bem-vindo! Este guia irá ajudá-lo a executar a aplicação **AI.MÉTODO EXPERT** em seu computador local. O processo foi desenhado para ser o mais simples possível, sem a necessidade de conhecimentos de programação.

---

## Pré-requisitos

Antes de começar, você precisará de duas coisas:

1.  **Um navegador de internet moderno:** Google Chrome, Mozilla Firefox, ou Microsoft Edge.
2.  **Visual Studio Code (VS Code):** Um editor de código leve e gratuito.
    -   Se você não o tiver, [**baixe e instale o VS Code aqui**](https://code.visualstudio.com/download).

---

## Passo 1: Instalar a Extensão "Live Server"

O "Live Server" é uma extensão para o VS Code que cria um servidor web local com um único clique.

1.  Abra o **VS Code**.
2.  Clique no ícone de **Extensões** na barra lateral esquerda (parece um conjunto de quadrados).
3.  Na barra de pesquisa, digite `Live Server`.
4.  Encontre a extensão criada por **Ritwick Dey** e clique em **Instalar**.



---

## Passo 2: Baixar e Abrir o Projeto

1.  **Baixe o código-fonte:**
    -   Clique [**aqui para baixar o projeto como um arquivo .zip**](https://github.com/bicalhobim/ai-metodo-expert/archive/refs/heads/main.zip) (link genérico de exemplo, substitua se necessário).
2.  **Extraia o arquivo:**
    -   Encontre o arquivo `.zip` baixado e extraia seu conteúdo para uma pasta de sua preferência (por exemplo, na sua "Área de Trabalho").
3.  **Abra a pasta no VS Code:**
    -   No VS Code, vá em `Arquivo` > `Abrir Pasta...` (ou `File` > `Open Folder...`).
    -   Navegue até a pasta que você acabou de extrair e selecione-a.

---

## Passo 3: Obter as Chaves de API

A aplicação precisa de credenciais (chaves de API) para se conectar aos serviços do Google (Gemini e Drive).

-   Para obter essas chaves, siga o nosso **[Guia de Configuração.md](./Guia%20de%20Configuração.md)**. Ele explica passo a passo como criar cada uma das chaves necessárias.

**Importante:** Você **NÃO** precisa editar nenhum arquivo de código. As chaves serão inseridas diretamente na interface do software no próximo passo.

---

## Passo 4: Executar a Aplicação

Com a extensão Live Server instalada e o projeto aberto no VS Code, você está pronto para iniciar.

1.  Na barra de explorador de arquivos do VS Code (à esquerda), encontre o arquivo `index.html`.
2.  Clique com o **botão direito** no arquivo `index.html`.
3.  No menu que aparecer, selecione **"Open with Live Server"**.



Isso abrirá automaticamente o seu navegador padrão com a aplicação em execução!

---

## Passo 5: Configurar as Chaves na Aplicação

1.  A primeira tela que você verá é a de **Login**. Insira qualquer e-mail e senha para prosseguir.
2.  Imediatamente após o login, um **pop-up de "Configuração de API"** aparecerá.
3.  Copie e cole as chaves que você obteve no **Passo 3** nos campos correspondentes.
4.  Clique em **"Salvar"**. As chaves ficarão salvas no seu navegador, e você não precisará inseri-las novamente.

Pronto! A aplicação está configurada e pronta para uso.

---

## Solução de Problemas Comuns

-   **"O botão 'Conectar Drive' está desativado."**
    -   Isso geralmente significa que as chaves do Google Drive não foram inseridas ou salvas corretamente no pop-up de configuração.
-   **"A análise falha com um erro de 'API Key'."**
    -   Verifique se a sua chave da API do Gemini foi copiada e colada corretamente no pop-up.
-   **"O Live Server não abre o navegador."**
    -   Verifique se a extensão foi instalada e ativada corretamente. Tente fechar e reabrir o VS Code.
