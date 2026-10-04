// ---------------------------------------------------------
// CONTROL VISUAL DEL PERFIL Y AVATARES
// ---------------------------------------------------------

window.actualizarInterfazPerfil = function(identidad, sesionActiva) {
    const btnLoginView = document.getElementById('bdh-btn-login-view');
    const profileView = document.getElementById('bdh-profile-view');
    const navUsername = document.getElementById('bdh-nav-username');
    const modalUsername = document.getElementById('bdh-modal-username');
    
    const navAvatar = document.getElementById('bdh-nav-avatar');
    const modalAvatar = document.getElementById('bdh-modal-avatar-grande');
    const avatarUrl = localStorage.getItem('bdh_vip_avatar') || "https://raw.githubusercontent.com/BlixDarkHorse/BlixDarkHorse.github.io/main/assets/fondo-default.jpg";
    
    if (identidad && sesionActiva) {
        if (btnLoginView) btnLoginView.style.display = 'none';
        if (profileView) profileView.style.display = 'flex';
        
        if (navUsername) navUsername.innerText = identidad.split('@')[0];
        if (modalUsername) modalUsername.innerText = identidad;
        if (navAvatar && navAvatar.src !== avatarUrl) navAvatar.src = avatarUrl;
        if (modalAvatar && modalAvatar.src !== avatarUrl) modalAvatar.src = avatarUrl;
    } else {
        if (btnLoginView) btnLoginView.style.display = 'block';
        if (profileView) profileView.style.display = 'none';
    }
};

window.abrirModalPerfil = function() {
    const modalPerfilOverlay = document.getElementById('bdh-profile-modal-overlay');
    if (modalPerfilOverlay) modalPerfilOverlay.style.display = 'flex';
};

window.cerrarModalPerfil = function() {
    const modalPerfilOverlay = document.getElementById('bdh-profile-modal-overlay');
    if (modalPerfilOverlay) modalPerfilOverlay.style.display = 'none';
    const galeria = document.getElementById('bdh-avatar-gallery');
    if (galeria) galeria.style.display = 'none';
};

window.toggleGaleriaAvatares = function() {
    const galeria = document.getElementById('bdh-avatar-gallery');
    if (galeria) {
        galeria.style.display = galeria.style.display === 'none' ? 'flex' : 'none';
    }
};

window.seleccionarAvatar = function(url) {
    localStorage.setItem('bdh_vip_avatar', url);
    // Necesitamos saber si hay sesion activa para actualizar
    const exp = localStorage.getItem('bdh_vip_exp');
    const restante = exp ? Math.max(0, parseInt(exp) - Date.now()) : 0;
    window.actualizarInterfazPerfil(localStorage.getItem('bdh_vip_identity'), restante > 0);
    window.toggleGaleriaAvatares();
};

window.cerrarSesionBDH = function() {
    localStorage.removeItem('bdh_vip_exp');
    localStorage.removeItem('bdh_vip_identity');
    window.location.reload();
};
