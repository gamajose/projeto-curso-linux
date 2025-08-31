// public/js/main.js
document.addEventListener('DOMContentLoaded', async () => {
    const navAuthLinks = document.getElementById('nav-auth-links');
    const logoLink = document.getElementById('logo-link');
    const token = localStorage.getItem('authToken');

    if (token) {
        // --- USUÁRIO ESTÁ LOGADO ---
        if (logoLink) {
            // Verifica a página atual para decidir o link do logo
            if (window.location.pathname === '/' || window.location.pathname === '/login.html') {
                 logoLink.href = '/home';
            } else {
                 logoLink.href = '/home';
            }
        }

        try {
            const response = await fetch('/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                // Se o token for inválido (expirado, etc.), desloga o usuário silenciosamente
                localStorage.removeItem('authToken');
                renderDefaultMenu();
                // Apenas redireciona se não estiver na página inicial/login
                if (window.location.pathname !== '/' && window.location.pathname !== '/login.html') {
                    window.location.href = '/';
                }
                return;
            }
            const user = await response.json();
            renderUserMenu(user);
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            renderDefaultMenu();
        }
    } else {
        // --- USUÁRIO NÃO ESTÁ LOGADO ---
        if (logoLink) {
            logoLink.href = '/'; // Garante que o link do logo aponte para o login
        }
        renderDefaultMenu();
    }
});

function renderDefaultMenu() {
    const navAuthLinks = document.getElementById('nav-auth-links');
    if (navAuthLinks) {
      navAuthLinks.innerHTML = `<li><a href="/">Login</a></li>`;
    }
}

function renderUserMenu(user) {
    const navAuthLinks = document.getElementById('nav-auth-links');
    const avatar = user.avatar_url || '/images/avatar-padrao.png';

    navAuthLinks.innerHTML = `
        <li class="user-menu-container">
            <div id="userMenuButton" class="user-menu-button">
                <img src="${avatar}" alt="Avatar do usuário" class="avatar">
                <span>${user.name.split(' ')[0]}</span>
            </div>
            <div id="userDropdown" class="user-dropdown">
                <a href="/dashboard">Meu Painel</a>
                <a href="/profile">Editar Perfil</a>
                <a href="/change-password">Alterar Senha</a>
                <a href="#" id="logoutButton">Sair</a>
            </div>
        </li>
    `;

    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');

    if(userMenuButton) {
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }

    document.getElementById('logoutButton').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        
        // **SUBSTITUIÇÃO DO ALERT**
        if (typeof showToast === 'function') {
            showToast('Você foi desconectado.', 'info');
        } else {
            alert('Você foi desconectado.'); // Fallback caso o script de toast não carregue
        }

        setTimeout(() => { window.location.href = '/'; }, 1500); // Delay para a notificação ser lida
    });
    
    window.addEventListener('click', () => {
        if (userDropdown && userDropdown.style.display === 'block') {
            userDropdown.style.display = 'none';
        }
    });
}