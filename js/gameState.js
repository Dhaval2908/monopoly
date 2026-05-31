// js/gameState.js
export const gameState = {
    players: [],
    currentPlayerIndex: 0,
    isMoving: false,
    ownership: {},
    structures: {},

    initPlayers(selections) {
        this.players = selections.map((p, i) => ({
            id: i,
            name: p.name,
            icon: p.icon,
            balance: 1500000,
            position: 0,
            isJailed: false
        }));
        
        document.getElementById('lobby-screen').style.display = 'none';
        document.getElementById('game-container-layout').style.display = 'flex';
        
        this.createHUDPanel();
        this.renderSidebars();
        
        // Link safe informational check hooks
        import('./bankLogic.js').then(m => m.bankLogic.setupBoardClickListeners());
    },

    changeTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        const p = this.players[this.currentPlayerIndex];
        
        document.getElementById('status-msg').innerText = `${p.name}'s (${p.icon}) TURN`;
        this.createHUDPanel();
        this.renderSidebars();
    },

    createHUDPanel() {
        let centerPiece = document.querySelector('.center-piece');
        let hud = document.getElementById('game-hud') || document.createElement('div');
        hud.id = 'game-hud';
        hud.innerHTML = '';
        
        this.players.forEach((p, idx) => {
            hud.innerHTML += `
                <div class="hud-item ${idx === this.currentPlayerIndex ? 'active' : ''}" id="leaderboard-row-${p.id}">
                    <span>${p.icon} <b>${p.name}</b>: <span class="hud-bal">₹${p.balance.toLocaleString()}</span></span>
                </div>
            `;
        });
        centerPiece.insertBefore(hud, centerPiece.firstChild);
    },

    renderSidebars() {
        const leftBox = document.getElementById('current-player-deeds');
        const rightBox = document.getElementById('opponent-deeds-container');
        if (!leftBox || !rightBox) return;

        leftBox.innerHTML = '';
        rightBox.innerHTML = '';

        const activePlayer = this.players[this.currentPlayerIndex];

        import('./data.js').then(({ boardData }) => {
            this.players.forEach(p => {
                let sectionHTML = `<div class="player-sidebar-group"><h4>${p.icon} ${p.name} Assets</h4>`;
                
                const propertiesOwned = Object.keys(this.ownership)
                    .filter(k => this.ownership[k] === p.id)
                    .map(k => boardData[k]);

                if (propertiesOwned.length === 0) {
                    sectionHTML += `<p class="none-text">No real estate assets held.</p>`;
                } else {
                    propertiesOwned.forEach(space => {
                        let houses = this.structures[space.id] || 0;
                        let structuralIcons = houses === 5 ? "🏨" : "🏡".repeat(houses);
                        sectionHTML += `
                            <div class="mini-deed-row" style="border-left: 6px solid ${space.color || '#95a5a6'}">
                                <span>${space.name} ${structuralIcons}</span>
                            </div>
                        `;
                    });
                }
                sectionHTML += `</div>`;

                if (p.id === activePlayer.id) {
                    leftBox.innerHTML = sectionHTML; // Renders to Left
                } else {
                    rightBox.innerHTML += sectionHTML; // Appends to Right Stack
                }
            });
        });
    }
};