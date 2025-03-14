const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Rota para enviar mensagem ao webhook 
app.post('/send-message', async (req, res) => {
    try {
        const { message, type } = req.body;
        const webhookUrl = 'https://SEU-WEBHOOK'; // Substitua pela URL do seu webhook

        const response = await axios.post(webhookUrl, {
            message,
            type
        });

        res.json(response.data);
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

// Nova rota para receber mensagens posteriormente
app.post('/receive-message', async (req, res) => {
    try {
        const { message, type, messageId } = req.body;
        
        // Emitir evento para todos os clientes conectados via SSE
        clients.forEach(client => {
            client.res.write(`data: ${JSON.stringify({ message, type, messageId })}\n\n`);
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao receber mensagem:', error);
        res.status(500).json({ error: 'Erro ao processar mensagem' });
    }
});

// Adicionar suporte a Server-Sent Events (SSE)
let clients = [];

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = {
        id: Date.now(),
        res
    };
    
    clients.push(client);

    req.on('close', () => {
        clients = clients.filter(c => c.id !== client.id);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 