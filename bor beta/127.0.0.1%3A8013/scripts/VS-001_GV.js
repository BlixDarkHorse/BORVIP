        (function() {
            const gxContainer = document.getElementById('gx-chat-container');
            const gxWindow = document.getElementById('gx-window');
            const gxBubble = document.getElementById('gx-bubble');
            const btnMin = document.getElementById('gx-minimize');
            const dragHandle = document.getElementById('gx-drag-handle');
            
            const chatBody = document.getElementById('gx-chat-body');
            const inputText = document.getElementById('gx-input-text');
            const btnSend = document.getElementById('gx-btn-send');

            function addMsg(text, type, isTyping = false) {
                const msgDiv = document.createElement('div');
                msgDiv.className = type === 'user' ? 'gx-msg-user' : 'gx-msg-bot';
                if(isTyping) msgDiv.classList.add('gx-typing');
                
                // Si contiene HTML (saltos de linea) lo renderizamos, sino textContent
                msgDiv.innerHTML = text; 
                
                const id = 'msg_' + Date.now();
                msgDiv.id = id;
                chatBody.appendChild(msgDiv);
                chatBody.scrollTop = chatBody.scrollHeight;
                return id;
            }

            function updateMsg(id, text) {
                const msgDiv = document.getElementById(id);
                if(msgDiv) {
                    msgDiv.innerHTML = text;
                    msgDiv.classList.remove('gx-typing');
                }
            }

            async function procesarMensajeIA(mensaje) {
                if(!mensaje.trim()) return;
                
                // 1. Mostrar mensaje del usuario
                addMsg(mensaje, 'user');
                inputText.value = '';

                // 2. Mostrar indicador de carga IA
                const typingId = addMsg("📡 Vitalanetjer estableciendo conexión...", 'bot', true);

                try {
                    // CONFIGURACIÓN HACIA TU DARK SITE (Azure Function / API)
                    const DARK_SITE_URL = "https://tu-azure-function-url.azurewebsites.net/api/verificarUsuario";
                    
                    // ==========================================
                    // DESCOMENTA ESTO CUANDO TENGAS LA API REAL:
                    // ==========================================
                    /*
                    const response = await fetch(DARK_SITE_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ clave: mensaje })
                    });
                    
                    if (!response.ok) throw new Error("Error en matriz Dark Site");
                    
                    const data = await response.json();
                    updateMsg(typingId, data.mensaje_ia || "Código procesado. Acceso concedido.");
                    */

                    // ==========================================
                    // SIMULACIÓN VISUAL (Mientras conectas la API real)
                    // ==========================================
                    setTimeout(() => {
                        updateMsg(typingId, `Análisis cuántico completado.<br>He buscado <b>[${mensaje}]</b> en la tabla Blob de Azure.<br><i>Estatus: Esperando enlace de base de datos real.</i>`);
                    }, 2000);

                } catch (error) {
                    updateMsg(typingId, "⚠️ Error de conexión con el Dark Site. Verifica la anomalía espacial.");
                    console.error("Dark Site Error:", error);
                }
            }

            // Eventos de envío de chat
            btnSend.addEventListener('click', () => procesarMensajeIA(inputText.value));
            inputText.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') procesarMensajeIA(inputText.value);
            });


            // Función de Cambio de Estado
            function abrirGxChat() {
                gxBubble.classList.add('gx-hidden');
                gxWindow.classList.remove('gx-hidden');
            }

            function cerrarGxChat() {
                gxWindow.classList.add('gx-hidden');
                gxBubble.classList.remove('gx-hidden');
            }

            btnMin.addEventListener('click', cerrarGxChat);

            // Auto-minimizar tras 8 segundos (Requerimiento)
            setTimeout(() => {
                if(!gxWindow.classList.contains('gx-hidden')) {
                    cerrarGxChat();
                }
            }, 8000);

            // Lógica Física VTHA Drag & Drop Aislada
            let drag = false;
            let startX, startY;
            let cLeft, cTop;
            let mX = 0, mY = 0;

            const draggables = [dragHandle, gxBubble];

            draggables.forEach(el => {
                el.addEventListener('mousedown', (e) => {
                    if(e.target === btnMin) return;
                    drag = true; mX = 0; mY = 0;
                    startX = e.clientX; startY = e.clientY;
                    const rect = gxContainer.getBoundingClientRect();
                    cLeft = rect.left; cTop = rect.top;
                    
                    gxContainer.style.bottom = 'auto';
                    gxContainer.style.right = 'auto';
                    gxContainer.style.left = `${cLeft}px`;
                    gxContainer.style.top = `${cTop}px`;

                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
            });

            function onMove(e) {
                if(!drag) return;
                mX = e.clientX - startX;
                mY = e.clientY - startY;
                gxContainer.style.left = `${cLeft + mX}px`;
                gxContainer.style.top = `${cTop + mY}px`;
            }

            function onUp(e) {
                if(!drag) return;
                drag = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);

                // Diferenciar Click vs Drag (Tolerancia de 5px)
                const dist = Math.sqrt(mX*mX + mY*mY);
                if (dist < 5 && (e.target === gxBubble || gxBubble.contains(e.target))) {
                    abrirGxChat();
                }
            }
        })();