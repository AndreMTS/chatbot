# Chatbot Interface

Interface de chat interativa para integração com webhooks e APIs, oferecendo suporte a mensagens de texto e áudio.

<img src="/assets/gif/demostracaoChat.gif">

## 🚀 Funcionalidades

- 💬 Suporte a mensagens de texto com formatação Markdown
  - **Negrito**: Use `*texto*`
  - *Itálico*: Use `_texto_`
  - ~~Tachado~~: Use `~texto~`
  - > Citações: Use `> texto`
- 🎤 Gravação e envio de mensagens de áudio
- 📥 Download de mensagens de áudio
- 🔄 Conexão em tempo real via Server-Sent Events (SSE)
- 🎨 Interface responsiva e amigável
- 👤 Avatares personalizados para usuário e bot

## 🛠️ Tecnologias Utilizadas

- Frontend:
  - HTML5
  - CSS3
  - JavaScript
  - Bootstrap 5
  - Bootstrap Icons
- Backend:
  - Node.js
  - Express
  - Axios
  - CORS

## 📦 Instalação

1. Clone o repositório:

- bash
- git clone https://github.com/AndreMTS/chatbot.git
- cd chatbot

2. Instale as dependências do backend:

- bash
- cd backend
- npm install

3. Configure o webhook:
   - Abra o arquivo `backend/server.js`
   - Substitua `'SEU-WEBHOOK'` pela URL do seu webhook

4. Inicie o servidor:

- bash
- npm start

5. Acesse a aplicação:
   - Abra `http://localhost:3000` no seu navegador

## 💡 Uso

1. **Envio de Mensagens de Texto**:
   - Digite sua mensagem na caixa de texto
   - Use as marcações Markdown para formatar o texto
   - Clique em "Enviar" ou pressione Enter

2. **Envio de Mensagens de Áudio**:
   - Clique em "Gravar Áudio"
   - Fale sua mensagem
   - Clique em "Parar Gravação" para enviar

3. **Download de Áudios**:
   - Ative a opção "Mostrar botão de download"
   - Use o botão de download ao lado das mensagens de áudio

## 🔧 Configuração

O projeto pode ser configurado através das seguintes variáveis:
- `port`: Porta do servidor (padrão: 3000)
- `webhookUrl`: URL do webhook para integração

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.