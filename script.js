/* --- 1. THE CORE TERMINAL ENGINE --- */
const Terminal = {
    // Switches between the menu, game selection, and the game itself
    show: (id) => {
        const screens = ['menu-screen', 'game-selection', 'game-stage'];
        screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) {
                el.style.display = (s === id ? 'flex' : 'none');
            }
        });
    },

    // Fixed Scroll: Specifically handles the GAME, ABOUT, PROJECTS buttons
    jumpTo: (id, e) => {
        if (e) e.preventDefault();
        
        // If heading to the game, reset the terminal state first
        if (id === 'game') Terminal.reset();

        const target = document.getElementById(id);
        if (target) {
            const offset = 120; // Space for your top navbar
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    },

    toggleFullscreen: (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const wrapper = document.getElementById('game-ui-wrapper');
        if (wrapper) {
            if (!document.fullscreenElement) wrapper.requestFullscreen().catch(() => {});
            else document.exitFullscreen();
        }
    },

    reset: () => {
        clearInterval(window.dodgeLoop);
        clearInterval(window.countdownInterval);
        window.onkeydown = null;
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        Terminal.show('menu-screen');
    }
};

/* --- 2. THE CORE DEFENSE GAME --- */
function loadDodgeGame() {
    Terminal.show('game-stage');
    const stage = document.getElementById('game-stage');
    
    stage.innerHTML = `
        <div id="game-ui-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; width:100%; background:#000; color:#00f2ff; font-family:monospace;">
            <div style="margin-bottom:15px; display:flex; gap:10px;">
                <button id="fs-btn" style="background:#00f2ff; color:#000; border:none; padding:10px 20px; cursor:pointer; font-weight:bold;">FULLSCREEN</button>
                <button id="exit-btn" style="background:none; color:red; border:1px solid red; padding:10px 20px; cursor:pointer;">EXIT</button>
            </div>
            <div id="arena" style="width:300px; height:300px; border:2px solid #00f2ff; position:relative; overflow:hidden;">
                <div id="p" style="width:20px; height:20px; background:#fbbf24; position:absolute; left:140px; top:260px;"></div>
                <div id="countdown-box" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.8); font-size:80px; color:#00f2ff; z-index:10;">5</div>
            </div>
            <p id="status-text" style="margin-top:15px;">INITIALIZING...</p>
        </div>
    `;

    document.getElementById('fs-btn').onclick = Terminal.toggleFullscreen;
    document.getElementById('exit-btn').onclick = () => Terminal.reset();

    let px = 140, py = 260, obs = [], start = null, count = 5;
    const box = document.getElementById('countdown-box');

    // COUNTDOWN LOGIC
    window.countdownInterval = setInterval(() => {
        count--;
        if (box) box.innerText = count > 0 ? count : "GO!";
        if (count < 0) {
            clearInterval(window.countdownInterval);
            if (box) box.style.display = 'none';
            start = Date.now();
            startGameLoop();
        }
    }, 1000);

    // CONTROLS
    window.onkeydown = (e) => {
        const move = 20;
        if (e.key === 'ArrowLeft' || e.key === 'a') px -= move;
        if (e.key === 'ArrowRight' || e.key === 'd') px += move;
        px = Math.max(0, Math.min(280, px));
        const p = document.getElementById('p');
        if (p) p.style.left = px + 'px';
    };

    function startGameLoop() {
        window.dodgeLoop = setInterval(() => {
            const arena = document.getElementById('arena');
            if (!arena) return;

            if (Math.random() < 0.15) {
                const d = document.createElement('div');
                d.style = `width:10px; height:10px; background:#00f2ff; position:absolute; top:0; left:${Math.random()*290}px;`;
                arena.appendChild(d);
                obs.push({ el: d, y: 0, x: parseFloat(d.style.left) });
            }

            obs.forEach((o, i) => {
                o.y += 5;
                o.el.style.top = o.y + 'px';
                if (px < o.x + 10 && px + 20 > o.x && py < o.y + 10 && py + 20 > o.y) {
                    clearInterval(window.dodgeLoop); alert("TERMINAL LOCKED"); Terminal.reset();
                }
                if (o.y > 300) { o.el.remove(); obs.splice(i, 1); }
            });

            let time = Math.floor((Date.now() - start) / 1000);
            document.getElementById('status-text').innerText = `STABILITY: ${time}s / 15s`;
            if (time >= 15) { clearInterval(window.dodgeLoop); alert("ACCESS GRANTED"); Terminal.reset(); }
        }, 30);
    }
}

/* --- 3. THE INTERCEPTOR (Safe for CodePen) --- */
document.addEventListener('click', (e) => {
    const text = e.target.innerText ? e.target.innerText.toUpperCase().trim() : "";

    // Nav Buttons
    if (text === "GAME") return Terminal.jumpTo('game', e);
    if (text === "ABOUT") return Terminal.jumpTo('about', e);
    if (text === "PROJECTS") return Terminal.jumpTo('projects', e);
    if (text === "CONTACT") return Terminal.jumpTo('contact', e);

    // Terminal Controls
    if (text.includes("START SYSTEM")) {
        e.preventDefault();
        Terminal.show('game-selection');
    }
    if (text.includes("CORE DEFENSE")) {
        e.preventDefault();
        loadDodgeGame();
    }
});

// Setup Game Selection
window.onload = () => {
    const gs = document.getElementById('game-selection');
    if (gs) gs.innerHTML = `<button style="padding:15px; border:1px solid #00f2ff; background:none; color:#00f2ff; cursor:pointer;">CORE DEFENSE</button>`;
};