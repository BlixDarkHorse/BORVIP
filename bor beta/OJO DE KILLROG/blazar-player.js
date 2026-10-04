/**
 * BLAZAR ON READY - KEPPLER ENGINE WEB (Ojo de Kilrog)
 * Librería de Reproducción Vanilla JS - Build: Black Hole Edition
 */
class BlazarPlayer {
    constructor(containerSelector, videoSrc) {
        this.container = document.querySelector(containerSelector);
        this.videoSrc = videoSrc;

        this.init();
    }

    init() {
        // 1. Construye el cascarón HTML
        this.renderUI();

        // 2. Captura los elementos
        this.video = this.container.querySelector('video');
        this.progressBar = this.container.querySelector('.blazar-progress');
        this.btnPlay = this.container.querySelector('.btn-play');
        this.btnVol = this.container.querySelector('.btn-vol');
        this.shield = this.container.querySelector('.anti-piracy-shield');

        // 3. ENRUTADOR BIFURCADO FÁCTICO CON INTERCEPTOR DE HARDWARE (XHR)
        if (this.videoSrc.includes('.m3u8')) {
            // 1. Aislamiento matemático del SAS Token y URL Base
            const partesUrl = this.videoSrc.split('?');
            const baseUrl = partesUrl[0].substring(0, partesUrl[0].lastIndexOf('/') + 1);
            const sasToken = partesUrl.slice(1).join('?');

            if (typeof Hls !== 'undefined' && Hls.isSupported()) {

                // FFmpeg escribe los audios dos veces: como EXT-X-MEDIA y
                // como niveles EXT-X-STREAM-INF. HLS.js puede escoger esos
                // niveles AAC como si fueran video y provocar bufferAppendError.
                // Se limpia únicamente la respuesta del master; no se crea
                // ningún blob local, así las rutas relativas siguen apuntando
                // al Blob de Azure.
                const normalizarMasterEnMemoria = (manifest) => {
                    const lineas = manifest.split(/\r?\n/);
                    const salida = [];
                    let audioDefaultAsignado = false;

                    for (let i = 0; i < lineas.length; i++) {
                        let linea = lineas[i];
                        const limpia = linea.trim();

                        if (limpia.startsWith('#EXT-X-MEDIA:TYPE=SUBTITLES')) {
                            continue;
                        }

                        if (limpia.startsWith('#EXT-X-STREAM-INF:')) {
                            const esAudio = !limpia.includes('RESOLUTION=') &&
                                /CODECS="mp4a\./i.test(limpia);
                            if (esAudio) {
                                // El URI del nivel está en la siguiente línea.
                                i++;
                                continue;
                            }
                            linea = linea.replace(/,SUBTITLES="[^"]+"/g, '');
                            linea = linea.replace(/,mp4a\.[^"]+/g, '');
                        }

                        if (limpia.startsWith('#EXT-X-MEDIA:TYPE=AUDIO')) {
                            if (/DEFAULT=YES/i.test(linea)) {
                                if (audioDefaultAsignado) {
                                    linea = linea.replace(/DEFAULT=YES/i, 'DEFAULT=NO');
                                } else {
                                    audioDefaultAsignado = true;
                                }
                            }
                        }

                        salida.push(linea);
                    }

                    return salida.join('\n');
                };

                class BlazarMasterLoader extends Hls.DefaultConfig.loader {
                    load(context, config, callbacks) {
                        const originalSuccess = callbacks.onSuccess;
                        callbacks.onSuccess = (response, stats, ctx, networkDetails) => {
                            if (context.type === 'manifest' && typeof response.data === 'string' &&
                                response.data.includes('#EXTM3U')) {
                                response.data = normalizarMasterEnMemoria(response.data);
                            }
                            originalSuccess(response, stats, ctx, networkDetails);
                        };
                        return super.load(context, config, callbacks);
                    }
                }

                const hls = this.hls = new Hls({
                    loader: BlazarMasterLoader,
                    debug: false,
                    xhrSetup: function (xhr, url) {
                        let newUrl = url;

                        // A. Aniquilación de URLs Fantasma y Remapeo de Archivos AES
                        if (newUrl.includes('example.com')) {
                            const keyFilename = newUrl.substring(newUrl.lastIndexOf('/') + 1);
                            const realKeyName = keyFilename.replace('.key', '_aes.key');
                            newUrl = baseUrl + realKeyName;
                        }

                        // B. Inyector Absoluto del Token SAS
                        if (sasToken && !newUrl.includes('sig=')) {
                            const separador = newUrl.includes('?') ? '&' : '?';
                            newUrl = newUrl + separador + sasToken;
                        }

                        xhr.open('GET', newUrl, true);
                    }
                });

                hls.attachMedia(this.video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log("✅ Motor HLS ensamblado. Aplicando protocolos de idioma y subtítulos...");

                    // 1. AUTO-SELECCIÓN DE AUDIO LATINO
                    if (hls.audioTracks && hls.audioTracks.length > 0) {
                        for (let i = 0; i < hls.audioTracks.length; i++) {
                            const nombre = (hls.audioTracks[i].name || '').toLowerCase();
                            const idioma = (hls.audioTracks[i].lang || '').toLowerCase();
                            if (nombre.includes('latino') || idioma.includes('es')) {
                                // Latino ya queda DEFAULT=YES en el master normalizado.
                                // No cambiar la pista mientras MSE anexa el primer buffer.
                                console.log("🔥 Audio Latino fijado por defecto en índice:", i);
                                break;
                            }
                        }
                    }

                    // 2. AUTO-INYECCIÓN UNIVERSAL DE SUBTÍTULOS (vía <track>)
                    try {
                        const query = sasToken ? ('?' + sasToken) : '';
                        
                        const trackSpa = document.createElement('track');
                        trackSpa.kind = 'subtitles';
                        trackSpa.label = 'Español';
                        trackSpa.srclang = 'es';
                        trackSpa.src = baseUrl + 'subtitulo_0.vtt' + query;
                        trackSpa.default = true;

                        const trackEng = document.createElement('track');
                        trackEng.kind = 'subtitles';
                        trackEng.label = 'English';
                        trackEng.srclang = 'en';
                        trackEng.src = baseUrl + 'subtitulo_1.vtt' + query;

                        while (this.video.firstChild) { this.video.removeChild(this.video.firstChild); }
                        this.video.appendChild(trackSpa);
                        this.video.appendChild(trackEng);

                        trackSpa.addEventListener('load', () => {
                            trackSpa.track.mode = 'showing';
                            const subsVal = document.querySelector('#bh-subs-val');
                            if (subsVal) subsVal.innerText = 'Español';
                        });
                    } catch(err) {
                        console.warn("Aviso: Fallo al intentar inyectar subtítulos externos.");
                    }

                    // 3. AUTOPLAY CON MANEJO DE RACE CONDITION
                    const tryPlay = () => {
                        this.video.play().catch(e => {
                            if (e.name === 'AbortError') {
                                setTimeout(() => this.video.play().catch(() => {}), 400);
                                return;
                            }
                            console.warn("Autoplay con sonido prevenido por Chrome. Silenciando temporalmente...");
                            this.video.muted = true;
                            if (this.btnVol) this.btnVol.innerText = "🔇";
                            this.video.play().catch(() => {});
                        });
                    };
                    if (this.video.readyState >= 3) {
                        tryPlay();
                    } else {
                        this.video.addEventListener('canplay', tryPlay, { once: true });
                    }
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error("Error crítico en HLS:", data.type, data.details);
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            if (this._mediaRecoveryAttempted) return;
                            this._mediaRecoveryAttempted = true;
                            if (data.details === 'bufferAppendError' && typeof hls.swapAudioCodec === 'function') {
                                hls.swapAudioCodec();
                            }
                            hls.recoverMediaError();
                        }
                    }
                });

                // Carga cruda del manifiesto maestro sin la mutación del BLOB
                hls.loadSource(this.videoSrc);

            } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                this.video.src = this.videoSrc; // Respaldo Apple
            }
        } else {
            // RUTA B: Es un video estándar (MP4, MKV local, etc.)
            this.video.src = this.videoSrc;
        }

        // 4. Se inicializan sus protecciones y eventos
        this.buildBlackHole();
        this.attachHardwareEvents();
        this.attachSecurityProtocols();
        this.attachMediaEvents();
    }

    renderUI() {
        this.container.innerHTML = `
            <style>
                .blazar-player-wrapper {
                    position: relative; width: 100%; background: #000;
                    border: 2px solid #ff00d4; border-radius: 8px;
                    overflow: hidden; font-family: 'OLD ENGLISH TEXT', serif;
                }
                .blazar-player-wrapper video {
                    width: 100%; display: block; transition: filter 0.1s; 
                }
                .anti-piracy-shield {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;
                }
                .blazar-controls {
                    position: absolute; bottom: 0; left: 0; width: 100%;
                    background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
                    padding: 20px 10px 10px; display: flex; flex-direction: column; z-index: 20;
                    opacity: 0; transition: opacity 0.3s;
                }
                .blazar-player-wrapper:hover .blazar-controls { opacity: 1; }
                .blazar-progress {
                    width: 100%; appearance: none; background: #222; height: 5px; border-radius: 5px; outline: none; cursor: pointer; margin-bottom: 10px;
                }
                .blazar-progress::-webkit-slider-thumb {
                    appearance: none; width: 15px; height: 15px; border-radius: 50%;
                    background: #ff00d4; box-shadow: 0 0 10px #ff00d4;
                }
                .blazar-btn {
                    background: transparent; border: none; font-size: 1.2rem; cursor: pointer; font-weight: bold;
                    color: #000; -webkit-text-stroke: 1px #D4AF37; text-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
                    text-transform: uppercase; margin-right: 15px;
                }
                .blazar-btn:hover { color: #222; -webkit-text-stroke: 1px #ff00d4; }
                .controls-row { display: flex; align-items: center; justify-content: space-between; }
                .blazar-player-wrapper:fullscreen .blazar-controls {
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
               }
               .blazar-player-wrapper:fullscreen .hide-on-fullscreen {
               display: none !important;
               }
                /* ESTILOS DEL BLACK HOLE (WARM HOLE) */
                .black-hole-menu {
                    position: fixed; background: #050505; border: 1px solid #ff00d4;
                    box-shadow: 0 0 25px rgba(255, 0, 212, 0.4), inset 0 0 15px rgba(0,0,0,1);
                    border-radius: 12px; padding: 10px 0; min-width: 220px; z-index: 99999;
                    display: none; flex-direction: column; font-family: 'OLD ENGLISH TEXT', serif;
                    transform: scale(0.9); opacity: 0; transition: transform 0.2s, opacity 0.2s;
                }
                .black-hole-menu.active { display: flex; transform: scale(1); opacity: 1; }
                .bh-title {
                    color: #D4AF37; text-align: center; font-size: 1.2rem; border-bottom: 1px solid #333;
                    padding-bottom: 5px; margin-bottom: 5px; letter-spacing: 1px; -webkit-text-stroke: 0.5px #000;
                }
                .bh-item {
                    color: #ff00d4; padding: 10px 20px; cursor: pointer; font-size: 1.1rem;
                    transition: background 0.2s, color 0.2s; font-weight: bold; display: flex; justify-content: space-between;
                }
                .bh-item:hover { background: #ff00d4; color: #000; }
                video::cue {
                    background: rgba(0, 0, 0, 0.75);
                    color: #ffffff;
                    font-size: 1.2rem;
                    text-shadow: 0 0 5px #000;
                }
            </style>

            <div class="blazar-player-wrapper">
                <div class="anti-piracy-shield"></div>
                <!-- ATENCIÓN: src vacío porque HLS se encargará de inyectar el Blob -->
                <video preload="auto" crossorigin="anonymous"></video>
                <div class="blazar-controls">
                    <input type="range" class="blazar-progress" value="0" min="0" max="100" step="0.1">
                    <div class="controls-row">
                        <div>
                            <button class="blazar-btn btn-play">▶ Reproducir</button>
<!-- INYECTAR ESTA LÍNEA EXACTA: -->
                            <button class="blazar-btn btn-vol">🔊</button>
                             <span style="color:#D4AF37; font-size:0.9rem; margin-left:10px;">[ESC: salir fullscreen]</span>
                        </div>
                        <div class="blazar-btn" style="cursor:default;" class="hide-on-fullscreen">UNIVERSO BDH</div>
                    </div>
                </div>
            </div>
        `;
    }

    buildBlackHole() {
        this.blackHole = document.createElement('div');
        this.blackHole.className = 'black-hole-menu';
        this.blackHole.innerHTML = `
            <div class="bh-title">🌀 Black Hole Settings</div>
            <div class="bh-item" id="bh-fullscreen"><span>Pantalla Completa</span> <span>⛶</span></div>
            <div class="bh-item" id="bh-pip"><span>Imagen en Imagen</span> <span>📺</span></div>
            <div class="bh-item" id="bh-speed"><span>Velocidad</span> <span id="bh-speed-val">1.0x</span></div>
            <div class="bh-item" id="bh-subs"><span>Subtítulos</span> <span id="bh-subs-val">OFF</span></div>
            <div class="bh-item" id="bh-audio"><span>Audio Tracker</span> <span>⚙️</span></div>
        `;
        document.body.appendChild(this.blackHole);

        this.blackHole.querySelector('#bh-fullscreen').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                this.container.querySelector('.blazar-player-wrapper').requestFullscreen();
            } else { document.exitFullscreen(); }
            this.closeBlackHole();
        });

        this.blackHole.querySelector('#bh-pip').addEventListener('click', () => {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else { this.video.requestPictureInPicture(); }
            this.closeBlackHole();
        });

        this.blackHole.querySelector('#bh-speed').addEventListener('click', (e) => {
            let rates = [0.5, 1.0, 1.25, 1.5, 2.0];
            let current = this.video.playbackRate;
            let next = rates[(rates.indexOf(current) + 1) % rates.length];
            this.video.playbackRate = next;
            e.currentTarget.querySelector('#bh-speed-val').innerText = next.toFixed(1) + 'x';
            this.showVisualFeedback(`Velocidad: ${next}x`);
        });

        this.blackHole.querySelector('#bh-subs').addEventListener('click', (e) => {
            let tracks = this.video.textTracks;
            if (tracks && tracks.length > 0) {
                let activeIdx = -1;
                for (let i = 0; i < tracks.length; i++) {
                    if (tracks[i].mode === 'showing') {
                        activeIdx = i;
                        break;
                    }
                }
                for (let i = 0; i < tracks.length; i++) {
                    tracks[i].mode = 'hidden';
                }
                let nextIdx = activeIdx + 1;
                let text = 'OFF';
                if (nextIdx < tracks.length) {
                    tracks[nextIdx].mode = 'showing';
                    text = tracks[nextIdx].label || ('Sub ' + (nextIdx + 1));
                }
                e.currentTarget.querySelector('#bh-subs-val').innerText = text;
                this.showVisualFeedback(`Subs: ${text}`);
            } else if (this.hls && this.hls.subtitleTracks && this.hls.subtitleTracks.length > 0) {
                let current = this.hls.subtitleTrack;
                let next = (current + 1) >= this.hls.subtitleTracks.length ? -1 : current + 1;
                this.hls.subtitleTrack = next;
                let text = next === -1 ? 'OFF' : (this.hls.subtitleTracks[next].name || `Sub ${next + 1}`);
                e.currentTarget.querySelector('#bh-subs-val').innerText = text;
                this.showVisualFeedback(`Subs: ${text}`);
            } else {
                this.showVisualFeedback("Sin Subs Físicos");
            }
        });
            this.blackHole.querySelector('#bh-audio').addEventListener('click', (e) => {
            if (this.hls && this.hls.audioTracks && this.hls.audioTracks.length > 0) {
                let current = this.hls.audioTrack;
                let next = (current + 1) % this.hls.audioTracks.length;
                this.hls.audioTrack = next;
                let lang = this.hls.audioTracks[next].name || this.hls.audioTracks[next].lang || `Pista ${next + 1}`;
                e.currentTarget.querySelector('span:nth-child(2)').innerText = lang;
                this.showVisualFeedback(`Audio: ${lang}`);
            } else {
                this.showVisualFeedback("Audio Único");
            }
        });
    }
    attachHardwareEvents() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.openBlackHole(e.clientX, e.clientY);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.black-hole-menu')) {
                this.closeBlackHole();
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 3) {
                e.preventDefault();
                this.video.currentTime -= 10;
                this.showVisualFeedback("<< 10s");
            } else if (e.button === 4) {
                e.preventDefault();
                this.video.currentTime += 10;
                this.showVisualFeedback(">> 10s");
            }
        });

        // REEMPLAZA EL EVENTO CLICK DEL SHIELD POR ESTE MOTOR TÁCTIL:
        let ultimoToque = 0;
        this.shield.addEventListener('touchstart', (e) => {
            const tiempoActual = new Date().getTime();
            const duracionToque = tiempoActual - ultimoToque;
            
            if (duracionToque < 300 && duracionToque > 0) {
                // DOBLE TOQUE: Calcula si fue en la mitad izquierda o derecha
                e.preventDefault();
                const rect = this.shield.getBoundingClientRect();
                const toqueX = e.changedTouches[0].clientX - rect.left;
                
                if (toqueX < rect.width / 2) {
                    this.video.currentTime -= 10;
                    this.showVisualFeedback("<< 10s");
                } else {
                    this.video.currentTime += 10;
                    this.showVisualFeedback(">> 10s");
                }
            } else {
                // TOQUE SIMPLE: Fuerza Fullscreen en móviles y da Play
                const esMovil = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
                if (esMovil && !document.fullscreenElement) {
                    this.container.querySelector('.blazar-player-wrapper').requestFullscreen().catch(()=>{});
                }
                
                // Pequeño retraso para evitar que un doble toque pause el video
                setTimeout(() => {
                    if (new Date().getTime() - ultimoToque >= 300) {
                        this.togglePlay();
                    }
                }, 300);
            }
            ultimoToque = tiempoActual;
        }, { passive: false });

        // Mantiene el click normal intacto para usuarios de PC con mouse
        this.shield.addEventListener('click', (e) => {
            if (e.button === 0 && !(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))) {
                this.togglePlay();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
            if (e.code === 'ArrowRight') { this.video.currentTime += 5; this.showVisualFeedback(">> 5s"); }
            if (e.code === 'ArrowLeft') { this.video.currentTime -= 5; this.showVisualFeedback("<< 5s"); }
            if (e.code === 'ArrowUp') { 
                e.preventDefault(); 
                this.video.volume = Math.min(1, this.video.volume + 0.1); 
                this.showVisualFeedback(`Volumen: ${Math.round(this.video.volume * 100)}%`); 
            }
            if (e.code === 'ArrowDown') { 
                e.preventDefault(); 
                this.video.volume = Math.max(0, this.video.volume - 0.1); 
                this.showVisualFeedback(`Volumen: ${Math.round(this.video.volume * 100)}%`); 
            }
            if (e.code === 'KeyF') {
                if (!document.fullscreenElement) {
                    this.container.querySelector('.blazar-player-wrapper').requestFullscreen();
                } else { document.exitFullscreen(); }
            }
        });

        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            let vol = this.video.volume;
            if (e.deltaY < 0) {
                vol = Math.min(1, vol + 0.1);
            } else {
                vol = Math.max(0, vol - 0.1);
            }
            this.video.volume = vol;
            this.showVisualFeedback(`Volumen: ${Math.round(vol * 100)}%`);
        });
    }
    
    attachSecurityProtocols() {
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen') {
                this.video.style.filter = 'brightness(0)';
                navigator.clipboard.writeText("Bloqueo de Piratería - Universo BDH");
                setTimeout(() => { this.video.style.filter = 'none'; }, 3000);
            }
        });
        document.addEventListener('visibilitychange', () => {
            this.video.style.filter = document.hidden ? 'brightness(0)' : 'none';
        });
    }

    attachMediaEvents() {
        this.video.addEventListener('timeupdate', () => {
            if (!this.video.duration) return;
            const progress = (this.video.currentTime / this.video.duration) * 100;
            this.progressBar.value = progress;
            this.progressBar.style.background = `linear-gradient(to right, #ff00d4 ${progress}%, #222 ${progress}%)`;
        });
        this.progressBar.addEventListener('input', (e) => {
            this.video.currentTime = (e.target.value / 100) * this.video.duration;
        });
        this.btnPlay.addEventListener('click', () => this.togglePlay());

        if (this.btnVol) {
            this.btnVol.addEventListener('click', () => {
                this.video.muted = !this.video.muted;
                if (!this.video.muted && this.video.volume === 0) this.video.volume = 1.0;
                this.btnVol.innerText = this.video.muted ? "🔇" : "🔊";
                this.showVisualFeedback(this.video.muted ? "Silenciado 🔇" : "Sonido 🔊");
            });
        }
        
        if (this.shield) {
            this.shield.addEventListener('click', () => {
                if (this.video.muted) {
                    this.video.muted = false;
                    this.video.volume = 1.0;
                    if (this.btnVol) this.btnVol.innerText = "🔊";
                    this.showVisualFeedback("Sonido Activado 🔊");
                }
                this.togglePlay();
            });
        }

        let inactividadTimer;
        this.container.addEventListener('mousemove', () => {
            if (document.fullscreenElement) {
                this.container.style.cursor = 'default';
                this.container.querySelector('.blazar-controls').style.opacity = '1';

                clearTimeout(inactividadTimer);

                inactividadTimer = setTimeout(() => {
                    if (document.fullscreenElement) {
                        this.container.style.cursor = 'none'; 
                        this.container.querySelector('.blazar-controls').style.opacity = '0'; 
                    }
                }, 2500);
            } else {
                this.container.style.cursor = 'default';
            }
        });
    }

    togglePlay() {
        if (this.video.muted) {
            this.video.muted = false;
            this.video.volume = 1.0;
            if (this.btnVol) this.btnVol.innerText = "🔊";
        }
        if (this.video.paused) {
            const playPromise = this.video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(error => {
                    console.warn('Play cancelado por el estado actual de HLS:', error.name);
                });
            }
            this.btnPlay.innerText = "❚❚";
        } else {
            this.video.pause();
            this.btnPlay.innerText = "▶";
        }
    }

    openBlackHole(x, y) {
        this.blackHole.style.left = `${x}px`;
        this.blackHole.style.top = `${y}px`;

        setTimeout(() => this.blackHole.classList.add('active'), 10);
    }

    closeBlackHole() {
        this.blackHole.classList.remove('active');
    }

    showVisualFeedback(text) {
        let oldFeedback = this.container.querySelector('.v-feedback');
        if (oldFeedback) oldFeedback.remove();

        const feedback = document.createElement('div');
        feedback.className = 'v-feedback';
        feedback.innerText = text;
        feedback.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: #000; -webkit-text-stroke: 1.5px #ff00d4; font-size: 4rem; font-weight: bold;
            z-index: 100; pointer-events: none; text-shadow: 0 0 20px rgba(255, 0, 212, 0.8);
            animation: pulse-fade 1s forwards; font-family: 'OLD ENGLISH TEXT', serif;
        `;
        if (!document.getElementById('feedback-style')) {
            const style = document.createElement('style');
            style.id = 'feedback-style';
            style.innerHTML = `@keyframes pulse-fade { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; } 50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 0; } }`;
            document.head.appendChild(style);
        }

        this.container.querySelector('.blazar-player-wrapper').appendChild(feedback);
        setTimeout(() => feedback.remove(), 1000);
    }
}
