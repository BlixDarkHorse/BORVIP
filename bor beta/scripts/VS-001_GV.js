        (function() {
            const gxContainer = document.getElementById('gx-chat-container');
            const gxWindow = document.getElementById('gx-window');
            const gxBubble = document.getElementById('gx-bubble');
            const btnMin = document.getElementById('gx-minimize');
            const dragHandle = document.getElementById('gx-drag-handle');
            
            const chatBody = document.getElementById('gx-chat-body');
            const inputText = document.getElementById('gx-input-text');
            const btnSend = document.getElementById('gx-btn-send');
            
            // --- LÓGICA BKING (TECLADO CELULAR) ---
            const bkingPanel = document.getElementById('gx-bking-panel');
            const tokenPreview = document.getElementById('gx-token-preview');
            let selectedToken = null;
            
            const bkingTokens = [
                "🔥", "🌸", "🕷", "🕸", "☠", "♟", "🩸", "🍃", "🐼", "😹", "🧠", "👻", "👽", "⚔", "🐎", "🤖", 
                "📌", "📡", "🗡", "📦", "🧰", "🏧", "🎯", "🍱", "🖤", "🚀", "♠", "🛸", "🏞", "🌹", "👑", "👗", 
                "🧚🏼‍♀️", "👅", "🐲", "🎃", "🐱‍👤", "🌚", "🍄", "💎", "💅", "💼", "🎱", "📈", "🧱", "🚁", "🧺", "🪐", 
                "🐉", "💀", "🤫", "📚", "✨", "👹", "😎", "🐍", "🎻", "💞", "🛡️", "🧬", "🧿", "🪓", "🦾", "🦇", 
                "🪄", "🪞", "🛠", "🌌", "🦕", "👿", "🌍", "🏝", "🦄", "🟣", "🎡", "🗺", "🍀", "🗼", "🔁", "⌛", 
                "📖", "🗄", "🖼", "🌀", "▶", "🐛", "⏳", "🦋", "👾", "🍨", "⚖", "⚰", "🎇", "🚥", "🗽", "📽", 
                "🎭", "🎦", "🪔", "🔦", "💡", "🧊", "💠", "🕯", "😲", "🧃", "👁‍🗨", "💜", "😊", "🧙‍♂", "🥚", "🍇", 
                "🌆", "🎈", "🚪", "☮", "📝", "🎒", "🕋", "🥊", "🏴‍‍‍☠️", "🏴", "🔎", "🔍", "🍂", "😼", "🌑", "🎙", 
                "🆚", "🆑", "🎀", "💽", "🌷", "👉🏼", "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", 
                "🫠", "😉", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", 
                "😝", "🤑", "🤗", "🤭", "🫢", "🫣", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒", 
                "🙄", "😬", "🤥", "🫨", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵"
            ];

            // Renderizar teclado emoji
            bkingTokens.forEach(token => {
                const el = document.createElement('div');
                el.className = 'gx-emoji';
                el.textContent = token;
                el.onclick = () => {
                    document.querySelectorAll('.gx-emoji').forEach(e => e.classList.remove('selected'));
                    el.classList.add('selected');
                    selectedToken = token;
                    tokenPreview.textContent = token;
                };
                bkingPanel.appendChild(el);
            });

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

            async function procesarMensajeIA() {
                const alias = inputText.value.trim();
                if(!alias) return;

                // Construimos el mensaje con el token si hay uno seleccionado
                const mensajeFinal = selectedToken ? `[${selectedToken}] ${alias}` : alias;
                
                // 1. Mostrar mensaje del usuario
                addMsg(mensajeFinal, 'user');
                inputText.value = '';
                
                // Reset del token visual
                tokenPreview.textContent = '❓';
                document.querySelectorAll('.gx-emoji').forEach(e => e.classList.remove('selected'));
                const tokenParaIA = selectedToken;
                selectedToken = null;

                // 2. Mostrar indicador de carga IA
                const typingId = addMsg("📡 Estableciendo conexión matriz...", 'bot', true);

                try {
                    // SIMULACIÓN VISUAL BKING
                    setTimeout(() => {
                        if(tokenParaIA) {
                            updateMsg(typingId, `Estatus confirmado para <b>${alias}</b>.<br>Matriz <b>${tokenParaIA}</b> enlazada exitosamente a la red.`);
                        } else {
                            updateMsg(typingId, `Recibido, <b>${alias}</b>. (<i>Advertencia: No seleccionaste Token BKING</i>).`);
                        }
                    }, 1500);

                } catch (error) {
                    updateMsg(typingId, "⚠️ Error de conexión con el Dark Site. Verifica la anomalía espacial.");
                    console.error("Dark Site Error:", error);
                }
            }

            // Eventos de envío de chat
            btnSend.addEventListener('click', procesarMensajeIA);
            inputText.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') procesarMensajeIA();
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
                    
                    /* Limpiamos transform para que no pelee con el drag absoluto */
                    gxContainer.style.transform = 'none';
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
    