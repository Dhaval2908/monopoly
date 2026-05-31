// js/gameState.js
export const gameState = {
    players: [],
    currentPlayerIndex: 0,
    isMoving: false,
    ownership: {},
    structures: {},
    
    // NEW TRACKING ENGINES
    mortgagedProperties: {}, 
    activeTurnSpaceChecked: false,

    initPlayers(selections) {
        this.players = selections.map((p, i) => ({
            id: i,
            name: p.name,
            icon: p.icon,
            balance: 100000,
            position: 0,
            isJailed: false,
            // Setup default objects for jail handling and banking loans
            jailTurns: 0,
            jailCards: 0,
            loans: []
        }));
        
        document.getElementById('lobby-screen').style.display = 'none';
        document.getElementById('game-container-layout').style.display = 'flex';
        
        this.createHUDPanel();
        this.renderSidebars();
        
        // Link safe informational check hooks
        import('./bankLogic.js').then(m => m.bankLogic.setupBoardClickListeners());
    },

    changeTurn() {
        // Reset turn action guards before switching pointers
        this.activeTurnSpaceChecked = false;

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
                const isCurrentPlayer = (p.id === activePlayer.id);
                let sectionHTML = `<div class="player-sidebar-group"><h4>${p.icon} ${p.name} Assets</h4>`;
                
                // --- 1. RENDER REAL ESTATE ASSETS ---
                const propertiesOwned = Object.keys(this.ownership)
                    .filter(k => this.ownership[k] === p.id)
                    .map(k => boardData[k]);

                if (propertiesOwned.length === 0) {
                    sectionHTML += `<p class="none-text">No real estate assets held.</p>`;
                } else {
                    propertiesOwned.forEach(space => {
                        let houses = this.structures[space.id] || 0;
                        let structuralIcons = houses === 5 ? "🏨" : "🏡".repeat(houses);
                        let isMortgaged = this.mortgagedProperties[space.id];
                        
                        let mortgageText = isMortgaged ? " <span style='color:#e74c3c;font-size:11px;'>[MORTGAGED]</span>" : "";
                        
                        sectionHTML += `
                            <div class="mini-deed-row" style="border-left: 6px solid ${space.color || '#95a5a6'}; opacity: ${isMortgaged ? '0.5' : '1'}; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; padding: 4px;">
                                <span>${space.name} ${structuralIcons}${mortgageText}</span>
                                ${isCurrentPlayer && isMortgaged ? `
                                    <button onclick="window.paybackMortgage(${space.id})" style="background:#2ecc71; color:white; border:none; padding:2px 6px; font-size:10px; border-radius:3px; cursor:pointer;">
                                        Lift (₹${Math.round((parseInt(space.price.replace('k',''))*1000)/2 * 1.1).toLocaleString()})
                                    </button>
                                ` : ''}
                            </div>
                        `;
                    });
                }

                // --- 2. RENDER ACTIVE LOANS (Only show if they have loans) ---
                if (p.loans && p.loans.length > 0) {
                    sectionHTML += `<h5 style="margin: 10px 0 5px 0; color: #c0392b;">Active Bank Loans</h5>`;
                    p.loans.forEach((loan, loanIdx) => {
                        sectionHTML += `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#fdf2f2; padding:5px; margin-bottom:4px; border-radius:4px; font-size:12px;">
                                <span>Loan: ₹${loan.principal.toLocaleString()}</span>
                                ${isCurrentPlayer ? `
                                    <button onclick="window.paybackLoan(${loanIdx})" style="background:#2980b9; color:white; border:none; padding:2px 6px; font-size:10px; border-radius:3px; cursor:pointer;">Pay Off</button>
                                ` : ''}
                            </div>
                        `;
                    });
                }

                sectionHTML += `</div>`;

                if (isCurrentPlayer) {
                    leftBox.innerHTML = sectionHTML; // Current player gets interactive buttons
                } else {
                    rightBox.innerHTML += sectionHTML; // Opponents are read-only
                }
            });
        });
    }
};