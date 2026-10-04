    // ---------------------------------------------------------
    // MOTOR DE BÚSQUEDA BLAZAR ON READY
    // ---------------------------------------------------------
    const buscador = document.getElementById('bdh-buscador');
    if (buscador) {
        buscador.addEventListener('input', function(e) {
            const filtro = e.target.value.toLowerCase().trim();
            const contenidos = document.querySelectorAll('.cover-box, .masonry-item, .trailer-box');
            
            contenidos.forEach(item => {
                const titleElement = item.querySelector('.cover-title') || item.querySelector('h3');
                if (titleElement) {
                    const titulo = titleElement.innerText.toLowerCase();
                    if (titulo.includes(filtro)) {
                        item.style.display = ''; 
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    }

    // ---------------------------------------------------------
    // PROTOCOLO DE INTERCEPCIÓN (BARRERA DE AUTENTICACIÓN)
    // ---------------------------------------------------------
    let sesionActiva = false; 

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('ep-btn') || (e.target.tagName === 'BUTTON' && (e.target.innerText.includes('Capítulo') || e.target.innerText.includes('Volumen') || e.target.innerText.includes('REPRODUCIR')))) {
            if (!sesionActiva) {
                e.preventDefault(); 
                e.stopPropagation();

                
                const modalesAbiertos = document.querySelectorAll('.modal-trigger:checked');
                modalesAbiertos.forEach(modal => modal.checked = false);

                const modalLogin = document.getElementById('bdh-toggle-modal');
                if (modalLogin) modalLogin.checked = true;

                console.warn("BLAZAR ALERTA: Intento de acceso sin forjar credenciales. Redirigiendo a Auth.");
            }
        }
    }, true);

    // El control visual del perfil fue movido a bdh-profile.js

    // ---------------------------------------------------------
    // MOTOR DE AUTENTICACIÓN Y LLAVES TARÁNTULA BDH
    // ---------------------------------------------------------

    function getDeviceID() {
        let deviceId = localStorage.getItem('bdh_device_id');
        if (!deviceId) {
            deviceId = 'DEV-' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('bdh_device_id', deviceId);
        }
        return deviceId;
    }

    function calcularTiempoRestante() {
        const exp = localStorage.getItem('bdh_vip_exp');
        if (!exp) return 0;
        return Math.max(0, parseInt(exp) - Date.now());
    }

    function actualizarCronometro() {
        let timerDisplay = document.getElementById('bdh-user-time');
        let modalTimerDisplay = document.getElementById('bdh-user-time-modal');
        if (!timerDisplay && !modalTimerDisplay) return;

        let restante = calcularTiempoRestante();
        
        if (restante <= 0) {
            if (timerDisplay) {
                timerDisplay.innerText = "ACCESO BLOQUEADO";
                timerDisplay.style.color = "red";
            }
            if (modalTimerDisplay) {
                modalTimerDisplay.innerText = "ACCESO BLOQUEADO";
                modalTimerDisplay.style.color = "red";
            }
            sesionActiva = false;
        } else {
            if (timerDisplay) timerDisplay.style.color = "#fff";
            if (modalTimerDisplay) modalTimerDisplay.style.color = "#fff";
            sesionActiva = true;
            
            let segs = Math.floor(restante / 1000);
            let d = Math.floor(segs / 86400); segs %= 86400;
            let h = Math.floor(segs / 3600); segs %= 3600;
            let m = Math.floor(segs / 60);
            let s = segs % 60;
            
            const hStr = h < 10 ? '0'+h : h;
            const mStr = m < 10 ? '0'+m : m;
            const sStr = s < 10 ? '0'+s : s;
            
            let timeText = `${d} Días ${hStr}:${mStr}:${sStr}`;
            if (timerDisplay) timerDisplay.innerText = timeText;
            if (modalTimerDisplay) modalTimerDisplay.innerText = timeText;
        }
        
        const identidadGuardada = localStorage.getItem('bdh_vip_identity');
        if (window.actualizarInterfazPerfil) window.actualizarInterfazPerfil(identidadGuardada, sesionActiva);
    }

    document.addEventListener('DOMContentLoaded', () => {
        actualizarCronometro();
        
        // Autocompletado fáctico de identidad
        const identidadGuardada = localStorage.getItem('bdh_vip_identity');
        if (identidadGuardada) {
            const inputTopLogin = document.getElementById('bdh-top-user-login');
            const inputStarsLogin = document.getElementById('bdh-vip-user');
            
            if (inputTopLogin) inputTopLogin.value = identidadGuardada;
            if (inputStarsLogin) inputStarsLogin.value = identidadGuardada;
        }
    });

    setInterval(actualizarCronometro, 1000);

    window.procesarAccesoVIP = async function(esCanje, origenModal) {
        let userInput, codeInput;
        
        if (origenModal === 'top-login') {
            userInput = document.getElementById('bdh-top-user-login');
            codeInput = null;
        } else if (origenModal === 'top-registro') {
            userInput = document.getElementById('bdh-top-user-registro');
            codeInput = document.getElementById('bdh-top-code-registro');
        } else {
            userInput = document.getElementById('bdh-vip-user');
            codeInput = document.getElementById('bdh-vip-code');
        }

        if (!userInput) return;
        
        const usuario = userInput.value.trim();
        const codigo_vip = esCanje ? (codeInput ? codeInput.value.trim() : "") : "";
        const device_id = getDeviceID();
        
        if (!usuario) {
            alert("❌ Debes ingresar tu Usuario / Alias.");
            return;
        }

        if (esCanje && !codigo_vip) {
            alert("❌ Ingresa el código VIP que deseas canjear.");
            return;
        }

        try {
            const response = await fetch('https://bdh-auth-core-f4gka6hua8bqe3bb.eastus-01.azurewebsites.net/api/authvip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, codigo_vip, device_id })
            });

            const data = await response.json();

            if (response.ok) {
                const identidadOficial = data.identidad || usuario;
                
                const expMs = new Date(data.expiracion).getTime();
                localStorage.setItem('bdh_vip_exp', expMs.toString());
                localStorage.setItem('bdh_vip_identity', identidadOficial);
                
                if (codeInput) codeInput.value = '';
                actualizarCronometro();
                if (window.actualizarInterfazPerfil) window.actualizarInterfazPerfil(identidadOficial, true);

                if (esCanje) {
                    alert(`⚠️ ALTO. TOMA CAPTURA DE PANTALLA AHORA MISMO ⚠️\n\nTu Identidad Oficial y Permanente es:\n\n👉 ${identidadOficial} 👈\n\nGuarda esta captura. Si pierdes este nombre exacto, perderás tu tiempo VIP en otros dispositivos y no habrá recuperación.`);
                } else {
                    alert(`✅ ${data.mensaje}`);
                }

                const modales = document.querySelectorAll('.bdh-motor-estado, .modal-trigger');
                modales.forEach(m => m.checked = false);

            } else {
                alert("❌ Error: " + (data.error || "No se pudo procesar la solicitud."));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Error de conexión con el servidor central de Azure.");
        }
    };