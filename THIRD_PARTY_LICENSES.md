# Licenças de Software de Terceiros

A aplicação **AI.MÉTODO EXPERT** utiliza diversas bibliotecas de código aberto para seu funcionamento. Agradecemos às comunidades e mantenedores desses projetos. Abaixo estão as bibliotecas utilizadas e suas respectivas licenças.

## Isenção de Responsabilidade
A utilização deste software implica na aceitação dos termos descritos na seção "Isenção de Responsabilidade" do arquivo `README.md`. O software é fornecido "COMO ESTÁ", e os criadores (Lucas Bicalho, Verum Institute) não se responsabilizam por qualquer resultado derivado de seu uso. A responsabilidade pela validação e aplicação das informações é inteiramente do usuário.

## Licença da Aplicação

O código-fonte da aplicação **AI.MÉTODO EXPERT** é licenciado sob a **Apache License 2.0**.
**Copyright 2024 Lucas Bicalho, PMP**

---

## Dependências de Produção

As seguintes bibliotecas são carregadas via `importmap` no `index.html` e são essenciais para o funcionamento da aplicação.

### **@google/genai**
- **Licença:** Apache License 2.0
- **Propósito:** SDK oficial para interagir com a API do Google Gemini.
- **Repositório:** [github.com/google/generative-ai-js](https://github.com/google/generative-ai-js)

### **React & React DOM**
- **Licença:** MIT License
- **Propósito:** Biblioteca principal para a construção da interface de usuário.
- **Repositório:** [github.com/facebook/react](https://github.com/facebook/react)

### **Jotai**
- **Licença:** MIT License
- **Propósito:** Gerenciador de estado global primitivo e flexível para React.
- **Repositório:** [github.com/pmndrs/jotai](https://github.com/pmndrs/jotai)

### **Tailwind CSS (via `@tailwindcss/browser`)**
- **Licença:** MIT License
- **Propósito:** Framework CSS "utility-first" para estilização rápida da interface. A versão `@tailwindcss/browser` é um script "standalone" para uso direto no navegador.
- **Repositório:** [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)

### **jsPDF & jspdf-autotable**
- **Licença:** MIT License
- **Propósito:** `jsPDF` é usado para criar documentos PDF no lado do cliente. `jspdf-autotable` é um plugin para `jsPDF` que facilita a criação de tabelas.
- **Repositórios:**
  - [github.com/parallax/jsPDF](https://github.com/parallax/jsPDF)
  - [github.com/simonbengtsson/jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

### **perfect-freehand**
- **Licença:** MIT License
- **Propósito:** Biblioteca para desenhar linhas de forma suave, usada na funcionalidade de desenho livre sobre a imagem.
- **Repositório:** [github.com/steveruizok/perfect-freehand](https://github.com/steveruizok/perfect-freehand)

### **react-resize-detector**
- **Licença:** MIT License
- **Propósito:** Hook React para detectar alterações de tamanho em elementos do DOM, usado para manter as sobreposições de análise responsivas.
- **Repositório:** [github.com/maslianok/react-resize-detector](https://github.com/maslianok/react-resize-detector)