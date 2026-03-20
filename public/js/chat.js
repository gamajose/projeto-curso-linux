// public/js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    const chatHTML = `
        <button class="chat-popup-btn" id="openChatBtn">💬</button>
        <div class="chat-popup" id="chatPopup">
            <div class="chat-header">
                <span>Chat da Comunidade</span>
                <button class="close-btn" id="closeChatBtn">&times;</button>
            </div>
            <div class="chat-messages">
                <ul id="chat-messages-list"></ul>
            </div>
            <div class="chat-input-area">
                <form id="chatForm">
                    <input id="messageInput" autocomplete="off" placeholder="Digite sua mensagem..." required />
                    <button type="submit">Enviar</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    const openChatBtn = document.getElementById('openChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatPopup = document.getElementById('chatPopup');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessagesList = document.getElementById('chat-messages-list');
    const chatMessagesDiv = document.querySelector('.chat-messages');

    const socket = io();
    let currentUser = { id: null, username: 'Anônimo', avatar_url: '/images/avatar-padrao.png' };

    console.log("[CHAT DIAGNÓSTICO] Iniciando script do chat.");

    const token = localStorage.getItem('authToken');
    if (token) {
        console.log("[CHAT DIAGNÓSTICO] Token encontrado no localStorage:", token);
        
        fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(response => {
            console.log("[CHAT DIAGNÓSTICO] Resposta da API /api/users/me:", response);
            if (!response.ok) {
                throw new Error(`Falha na API: Status ${response.status}`);
            }
            return response.json();
        })
        .then(user => {
            console.log("[CHAT DIAGNÓSTICO] ✅ DADOS DO USUÁRIO RECEBIDOS:", user);
            currentUser = {
                id: user.id,
                username: user.username || user.name.split(' ')[0],
                avatar_url: user.avatar_url || '/images/avatar-padrao.png'
            };
            console.log("[CHAT DIAGNÓSTICO] currentUser foi definido como:", currentUser);
        })
        .catch(error => {
            console.error("[CHAT DIAGNÓSTICO] ❌ Erro ao buscar dados do usuário:", error);
            // Se houver erro, o usuário continua como "Anônimo"
        });
    } else {
        console.warn("[CHAT DIAGNÓSTICO] ⚠️ Nenhum 'authToken' encontrado no localStorage. O usuário será 'Anônimo'.");
    }

    openChatBtn.addEventListener('click', () => {
        chatPopup.classList.add('open');
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    });
    
    closeChatBtn.addEventListener('click', () => chatPopup.classList.remove('open'));

    const renderMessage = (data, isHistory = false) => {
        const item = document.createElement('li');
        const isMe = data.userId === currentUser.id;

        item.className = isMe ? 'my-message message-container' : 'other-message message-container';

        const avatarSrc = data.avatar || '/images/avatar-padrao.png';

        item.innerHTML = `
            <img src="${avatarSrc}" alt="Avatar" class="chat-avatar">
            <div class="message-content">
                <span class="message-nickname">${data.username}</span>
                <div class="message-text">${data.text.replace(/<a/g, '<a target="_blank"')}</div>
            </div>
        `;
        
        chatMessagesList.appendChild(item);
    };

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let messageText = messageInput.value.trim();
        if (!messageText) return;

        const commandRegex = /^\/(faq|ask)\s+/i;
        const match = messageText.match(commandRegex);

        if (match) {
            const question = messageText.substring(match[0].length);

            fetch('/api/chat/ask-local', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question })
            })
            .catch(err => console.error("Erro ao tentar enviar a pergunta:", err));

        } else {
            const messageData = {
                userId: currentUser.id,
                username: currentUser.username,
                avatar: currentUser.avatar_url,
                text: messageText
            };
            socket.emit('chat message', messageData);
        }
        messageInput.value = '';
    });

    socket.on('chat message', (data) => {
        renderMessage(data);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    });

    socket.on('chat history', (history) => {
        chatMessagesList.innerHTML = '';
        history.forEach(data => renderMessage(data));
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    });
});