function showToast(message, type = 'info') {
    // Verifica se o container de toasts já existe, se não, cria
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Adiciona a classe 'show' para iniciar a animação de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Define um tempo para a notificação desaparecer
    setTimeout(() => {
        toast.classList.remove('show');
        // Remove o elemento do DOM após a animação de saída
        toast.addEventListener('transitionend', () => toast.remove());
    }, 5000);
}