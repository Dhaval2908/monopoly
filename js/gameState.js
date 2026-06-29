// js/gameState.js
export const gameState = {
    players: [],
    currentPlayerIndex: 0,
    isMoving: false,
    ownership: {},
    accumulatedSteps: 0,
    structures: {},
    contracts: {}, // Track contracts for each property
    
    // NEW TRACKING ENGINES
    mortgagedProperties: {}, 
    activeTurnSpaceChecked: false,

    initPlayers(selections) {
        this.players = selections.map((p, i) => ({
            id: i,
            name: p.name,
            icon: p.icon,
            balance: 1500000,
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

    // changeTurn() {
    //     // Reset turn action guards before switching pointers
    //     this.activeTurnSpaceChecked = false;

    //     this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    //     const p = this.players[this.currentPlayerIndex];
        
    //     document.getElementById('status-msg').innerText = `${p.name}'s (${p.icon}) TURN`;
    //     this.createHUDPanel();
    //     this.renderSidebars();
    // },

    // js/gameState.js
changeTurn() {
    // 1. Reset all state guards for the turn
    this.activeTurnSpaceChecked = false;
    this.activeTurnActionCompleted = false; 

    // 2. Increment the index EXACTLY once
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    const nextPlayer = this.players[this.currentPlayerIndex];
    
    // 3. Update the core text status
    const statusMsg = document.getElementById('status-msg');
    if (statusMsg) {
        statusMsg.innerText = `${nextPlayer.name}'s (${nextPlayer.icon}) TURN`;
    }
    
    // 4. Refresh core panels
    this.createHUDPanel();
    this.renderSidebars();

    return nextPlayer;
},
   createHUDPanel() {
    const parent = document.querySelector('.center-piece-controls') || document.getElementById('board-ui-overlay-container');
    if (!parent) return; // Safety guard clause

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

    // 🌟 FIXED: Use 'parent' instead of the undefined 'centerPiece'
    parent.insertBefore(hud, parent.firstChild);
},

renderSidebars() {
    const leftBox = document.getElementById('current-player-deeds');
    const rightBox = document.getElementById('opponent-deeds-container');
    if (!leftBox || !rightBox) return;

    // Clear previous renders cleanly
    leftBox.innerHTML = '';
    rightBox.innerHTML = '';

    const activePlayer = this.players[this.currentPlayerIndex];
    if (!activePlayer) return;

    import('./data.js').then(({ boardData }) => {
        
        // Helper function to dynamically map space groups to CSS theme variables
        const getCityColorVar = (space) => {
            if (!space) return '#95a5a6';
            const groupName = space.group ? space.group.toLowerCase().trim() : '';
            
            if (groupName.includes('mumbai'))    return 'var(--clr-mumbai, #00d2d3)';
            if (groupName.includes('delhi'))     return 'var(--clr-delhi, #1dd1a1)';
            if (groupName.includes('bengaluru')) return 'var(--clr-bengaluru, #feca57)';
            if (groupName.includes('chennai'))   return 'var(--clr-chennai, #ff9f43)';
            if (groupName.includes('kolkata'))   return 'var(--clr-kolkata, #ff9ff3)';
            if (groupName.includes('pune'))      return 'var(--clr-pune, #ff6b6b)';
            if (groupName.includes('transport')) return 'var(--clr-transport, #576574)';
            if (groupName.includes('utility'))   return 'var(--clr-utility, #48dbfb)';
            
            return space.color || '#95a5a6';
        };

        // ==========================================
        // 1. RENDER CURRENT PLAYER SIDEBAR (LEFT)
        // ==========================================
        let leftHTML = `
            <div class="player-sidebar-group active-player-card">
                <div class="sidebar-card-header">
                    <h3>${activePlayer.icon} ${activePlayer.name} <span class="you-badge">(You)</span></h3>
                    <span class="player-card-balance">₹${activePlayer.balance ? activePlayer.balance.toLocaleString() : '0'}</span>
                </div>
        `;

        if (activePlayer.jailCards > 0) {
            leftHTML += `<div class="jail-card-badge">🎟️ Jail Free Cards: ${activePlayer.jailCards} Held</div>`;
        }

        leftHTML += `<div class="sidebar-section-title">Your Deeds</div>`;

        const activeDeeds = Object.keys(this.ownership)
            .filter(k => this.ownership[k] === activePlayer.id)
            .map(k => boardData[k]);

        if (activeDeeds.length === 0) {
            leftHTML += `<p class="none-text">No properties owned yet.</p>`;
        } else {
            activeDeeds.forEach(space => {
                let houses = this.structures[space.id] || 0;
                let structuralIcons = houses === 5 ? "🏨" : "🏡".repeat(houses);
                let isMortgaged = this.mortgagedProperties[space.id];
                let mortgageText = isMortgaged ? " <span class='mortgage-tag'>[MORTGAGED]</span>" : "";
                
                let cityColor = getCityColorVar(space);

                leftHTML += `
                    <div class="mini-deed-row" style="opacity: ${isMortgaged ? '0.5' : '1'};">
                        <div class="deed-color-block" style="background: ${cityColor} !important;"></div>
                        
                        <div class="deed-content-frame">
                            <span class="deed-name-text">${space.name} ${structuralIcons}${mortgageText}</span>
                            ${isMortgaged ? `
                                <button onclick="window.paybackMortgage(${space.id})" class="lift-mortgage-btn">Lift</button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }

        if (activePlayer.loans && activePlayer.loans.length > 0) {
            leftHTML += `<div class="sidebar-section-title loan-title">Active Loans</div>`;
            activePlayer.loans.forEach((loan, loanIdx) => {
                leftHTML += `
                    <div class="loan-row">
                        <span>Principal: ₹${loan.principal.toLocaleString()}</span>
                        <button onclick="window.paybackLoan(${loanIdx})" class="loan-pay-btn">Pay Off</button>
                    </div>
                `;
            });
        }

        leftHTML += `</div>`;
        leftBox.innerHTML = leftHTML;

        // ==========================================
        // 2. RENDER OPPONENTS SIDEBAR (RIGHT)
        // ==========================================
        let rightHTML = '';

        this.players.forEach(p => {
            if (p.id === activePlayer.id) return;

            rightHTML += `
                <div class="player-sidebar-group opponent-player-card">
                    <div class="sidebar-card-header">
                        <h4>${p.icon} ${p.name}</h4>
                        <span class="player-card-balance opponent-bal">₹${p.balance ? p.balance.toLocaleString() : '0'}</span>
                    </div>
            `;

            if (p.jailCards > 0) {
                rightHTML += `<div class="opponent-jail-badge">🎟️ Jail Free Cards: ${p.jailCards}</div>`;
            }

            const opponentDeeds = Object.keys(this.ownership)
                .filter(k => this.ownership[k] === p.id)
                .map(k => boardData[k]);

            if (opponentDeeds.length === 0) {
                rightHTML += `<p class="none-text">No assets held.</p>`;
            } else {
                opponentDeeds.forEach(space => {
                    let isMortgaged = this.mortgagedProperties[space.id];
                    let houses = this.structures[space.id] || 0;
                    let structuralIcons = houses === 5 ? "🏨" : "🏡".repeat(houses);
                    let mortgageText = isMortgaged ? " <span class='mortgage-tag'>[MORTGAGED]</span>" : "";
                    
                    let cityColor = getCityColorVar(space);

                    rightHTML += `
                        <div class="mini-deed-row" style="opacity: ${isMortgaged ? '0.5' : '1'};">
                            <div class="deed-color-block" style="background: ${cityColor} !important;"></div>
                            
                            <div class="deed-content-frame">
                                <span class="deed-name-text">${space.name} ${structuralIcons}${mortgageText}</span>
                            </div>
                        </div>
                    `;
                });
            }

            if (p.loans && p.loans.length > 0) {
                let totalLoanDebt = p.loans.reduce((acc, curr) => acc + curr.principal, 0);
                rightHTML += `<div class="opponent-debt-alert">⚠️ Total Debt: ₹${totalLoanDebt.toLocaleString()}</div>`;
            }

            rightHTML += `</div>`;
        });

        if (rightHTML === '') {
            rightHTML = `<p class="none-text center-text">No other competitors connected.</p>`;
        }

        rightBox.innerHTML = rightHTML;
    });
}
};