    // -- Tema --
    const temas = ['default', 'gold', 'black', 'pink'];
    let temaActual = 0;
    function cambiarTema() {
        temaActual = (temaActual + 1) % temas.length;
        document.documentElement.setAttribute('data-theme', temas[temaActual]);
    }

    // -- Subsistema VTHA --
    let currentUserId = "UTFBK_" + Math.floor(Math.random() * 99999);
    let currentUserName = "GUEST_RENEGADE";

    function recordarId() {
        alert(`Tu ID UTFBK (😜) ha sido sincronizado en memoria local.\nID: ${currentUserId}`);
    }

    function exportarVtha() {
        const contenido = `--- EXPEDIENTE VTHA ---\nUSER=${currentUserName}\nID=${currentUserId}\nSTATUS=ACTIVE\nACCESS=GRANTED`;
        const blob = new Blob([contenido], { type: 'text/plain' });
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `${currentUserName}.vtha`;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }