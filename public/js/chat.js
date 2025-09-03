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

    const socket = io();
    let currentUser = { name: 'Anônimo' };

    const token = localStorage.getItem('authToken');
    if (token) {
        fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(user => {
            currentUser = user;
        })
        .catch(error => console.error('Erro ao buscar dados do usuário para o chat:', error));
    }

    openChatBtn.addEventListener('click', () => chatPopup.classList.add('open'));
    closeChatBtn.addEventListener('click', () => chatPopup.classList.remove('open'));

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (messageInput.value) {
            const messageData = {
                user: currentUser.name,
                text: messageInput.value
            };
            socket.emit('chat message', messageData);
            messageInput.value = '';
        }
    });

    socket.on('chat message', (data) => {
        const item = document.createElement('li');
        const isMe = data.user === currentUser.name;
        item.className = isMe ? 'my-message' : 'other-message';
        item.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
        chatMessagesList.appendChild(item);
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
    });
});