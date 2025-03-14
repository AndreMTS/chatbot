let mediaRecorder;
let audioChunks = [];
let showDownloadButton = false;

const CHAT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/4712/4712139.png';
const USER_AVATAR = 'https://i.ibb.co/vCmNHvKh/eupix.png';

// Função para formatar o texto com markdown
function formatText(text) {
    // Substituir marcações por HTML
    return text
        // Negrito
        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
        // Itálico
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        // Tachado
        .replace(/~([^~]+)~/g, '<del>$1</del>')
        // Citação (processa linha por linha)
        .split('\n')
        .map(line => line.trim().startsWith('>') 
            ? `<blockquote>${line.substring(1).trim()}</blockquote>`
            : line)
        .join('\n');
}

// Configuração do gravador de áudio
async function setupAudioRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const base64Audio = await blobToBase64(audioBlob);
            sendMessage(base64Audio, 'audio');
            audioChunks = [];
        };
    } catch (error) {
        console.error('Erro ao acessar microfone:', error);
    }
}

// Converter Blob para Base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Adicionar mensagem ao chat
function addMessageToChat(message, type, isSent = true) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;

    // Adicionar avatar
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = isSent ? USER_AVATAR : CHAT_AVATAR;
    avatar.alt = isSent ? 'User Avatar' : 'CHAT_AVATAR';
    messageDiv.appendChild(avatar);

    // Container para o conteúdo
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';

    if (type === 'text') {
        // Aplicar formatação markdown
        contentDiv.innerHTML = formatText(message);
    } else if (type === 'audio') {
        const audioContainer = document.createElement('div');
        audioContainer.className = 'audio-message';
        
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        
        if (message.startsWith('data:audio')) {
            audioElement.src = message;
        } else {
            audioElement.src = `data:audio/wav;base64,${message}`;
        }

        audioContainer.appendChild(audioElement);

        if (showDownloadButton) {
            const downloadButton = document.createElement('button');
            downloadButton.className = 'btn btn-sm btn-outline-primary ms-2';
            downloadButton.innerHTML = '<i class="bi bi-download"></i> Baixar';
            downloadButton.onclick = () => {
                const blob = base64ToBlob(message, 'audio/wav');
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audio-${Date.now()}.wav`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            };
            audioContainer.appendChild(downloadButton);
        }

        contentDiv.appendChild(audioContainer);
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função auxiliar para converter base64 para Blob
function base64ToBlob(base64, type) {
    const byteCharacters = atob(base64.replace(/^data:.*?;base64,/, ''));
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: type });
}

function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    
    switch(status) {
        case 'connected':
            statusElement.textContent = 'Conectado';
            statusElement.className = 'badge bg-success';
            break;
        case 'disconnected':
            statusElement.textContent = 'Desconectado';
            statusElement.className = 'badge bg-danger';
            break;
        case 'connecting':
            statusElement.textContent = 'Conectando...';
            statusElement.className = 'badge bg-secondary';
            break;
    }
}

// Conectar ao SSE para receber mensagens
function connectToSSE() {
    updateConnectionStatus('connecting');
    const eventSource = new EventSource('http://localhost:3000/events');

    eventSource.onopen = () => {
        updateConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        addMessageToChat(data.message, data.type, false);
    };

    eventSource.onerror = (error) => {
        console.error('Erro na conexão SSE:', error);
        updateConnectionStatus('disconnected');
        eventSource.close();
        // Tentar reconectar após 5 segundos
        setTimeout(connectToSSE, 5000);
    };
}

// Modificar a função sendMessage para lidar com respostas assíncronas
async function sendMessage(message, type) {
    try {
        const response = await fetch('http://localhost:3000/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, type })
        });
        const data = await response.json();
        
        // Adicionar mensagem enviada ao chat
        addMessageToChat(message, type);
        
        // Se houver resposta imediata, mostrar
        if (data.response) {
            addMessageToChat(data.response, data.responseType, false);
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
    }
}

// Event Listeners
document.getElementById('send-text').addEventListener('click', () => {
    const textInput = document.getElementById('text-input');
    if (textInput.value.trim()) {
        sendMessage(textInput.value, 'text');
        textInput.value = '';
    }
});

document.getElementById('start-recording').addEventListener('click', () => {
    mediaRecorder.start();
    document.getElementById('start-recording').disabled = true;
    document.getElementById('stop-recording').disabled = false;
});

document.getElementById('stop-recording').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('start-recording').disabled = false;
    document.getElementById('stop-recording').disabled = true;
});

// Inicializar conexão SSE quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    setupAudioRecording();
    connectToSSE();

    // Adicionar listener para o checkbox
    const downloadCheckbox = document.getElementById('showDownloadButton');
    downloadCheckbox.addEventListener('change', (e) => {
        showDownloadButton = e.target.checked;
        // Atualizar mensagens existentes
        updateExistingAudioMessages();
    });
});

// Função para atualizar mensagens de áudio existentes
function updateExistingAudioMessages() {
    const audioMessages = document.querySelectorAll('.audio-message');
    audioMessages.forEach(container => {
        // Remover botão existente se houver
        const existingButton = container.querySelector('button');
        if (existingButton) {
            existingButton.remove();
        }

        // Adicionar novo botão se necessário
        if (showDownloadButton) {
            const audioElement = container.querySelector('audio');
            const message = audioElement.src;
            
            const downloadButton = document.createElement('button');
            downloadButton.className = 'btn btn-sm btn-outline-primary ms-2';
            downloadButton.innerHTML = '<i class="bi bi-download"></i> Baixar';
            downloadButton.onclick = () => {
                const blob = base64ToBlob(message, 'audio/wav');
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audio-${Date.now()}.wav`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            };
            container.appendChild(downloadButton);
        }
    });
}

// Adicione esta função temporariamente para teste
async function testAudioBase64() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const base64Audio = await blobToBase64(audioBlob);
            console.log('Base64 Audio:', base64Audio);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 3000); // Grava 3 segundos
    } catch (error) {
        console.error('Erro:', error);
    }
} 