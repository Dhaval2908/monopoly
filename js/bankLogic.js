// js/bankLogic.js
import { gameState } from './gameState.js';
import { boardData } from './data.js';
import { showCardDetail } from './uiManager.js';

export const bankLogic = {
    handleLanding(spaceIndex) {
        const player = gameState.players[gameState.currentPlayerIndex];
        const data = boardData[spaceIndex];
        const priceNum = data.price ? (parseInt(data.price.replace('k', '')) * 1000) || 0 : 0;

        if (data.type === "corner") {
            if (data.name === "START") { player.balance += 200000; }
            if (data.name === "Go To Jail" || data.name === "Traffic Jam!") {
                this.sendToJail(player);
                return;
            }
            this.endTurnSequence();
            return;
        }

        if (data.type === "tax") {
            player.balance -= priceNum;
            alert(`💸 Tax office collected ₹${priceNum.toLocaleString()} from your account!`);
            this.endTurnSequence();
            return;
        }

        // Check if property is owned to direct rent processing vs interactive modal flows
        const ownerIndex = gameState.ownership[spaceIndex];
        if (ownerIndex !== undefined && ownerIndex !== gameState.currentPlayerIndex) {
            this.payRent(player, ownerIndex, spaceIndex, priceNum, data);
        } else {
            showCardDetail(data, true); 
        }
    },

    payRent(player, ownerIndex, spaceIndex, priceNum, data) {
        const owner = gameState.players[ownerIndex];
        let baseRent = data.type === "property" ? Math.round(priceNum * 0.1) : 25000;
        let houseCount = gameState.structures[spaceIndex] || 0;
        
        let finalRent = baseRent;
        if (houseCount === 1) finalRent = baseRent * 3;
        if (houseCount === 2) finalRent = baseRent * 9;
        if (houseCount === 3) finalRent = baseRent * 25;
        if (houseCount === 4) finalRent = baseRent * 40;
        if (houseCount === 5) finalRent = baseRent * 50;

        player.balance -= finalRent;
        owner.balance += finalRent;
        alert(`💥 Rent Notice!\nLanded on ${data.name}. Paid ₹${finalRent.toLocaleString()} to ${owner.name}!`);
        this.endTurnSequence();
    },

    buyProperty(spaceIndex) {
        const player = gameState.players[gameState.currentPlayerIndex];
        const data = boardData[spaceIndex];
        const priceNum = data.price ? (parseInt(data.price.replace('k', '')) * 1000) || 0 : 0;

        if (player.balance >= priceNum) {
            player.balance -= priceNum;
            gameState.ownership[spaceIndex] = gameState.currentPlayerIndex;

            const spaceEl = document.getElementById(`space-${spaceIndex}`);
            if (spaceEl) {
                let flag = spaceEl.querySelector('.owner-flag') || document.createElement('div');
                flag.className = 'owner-flag';
                flag.innerText = player.icon;
                spaceEl.appendChild(flag);
            }

            window.closeModal();
            this.endTurnSequence();
        } else {
            alert("❌ Insufficient bank reserves!");
        }
    },

    buildHouseOnLand(spaceIndex, cost) {
        const player = gameState.players[gameState.currentPlayerIndex];
        if (player.balance >= cost) {
            player.balance -= cost;
            gameState.structures[spaceIndex] = (gameState.structures[spaceIndex] || 0) + 1;
            
            const count = gameState.structures[spaceIndex];
            const spaceEl = document.getElementById(`space-${spaceIndex}`);
            
            if (spaceEl) {
                let badge = spaceEl.querySelector('.build-badge') || document.createElement('div');
                badge.className = 'build-badge';
                badge.innerText = count === 5 ? "🏨" : "🏡".repeat(count);
                spaceEl.appendChild(badge);
            }

            alert(`🏡 Upgraded asset structure to level ${count === 5 ? 'Hotel Complex' : count}`);
            window.closeModal();
            this.endTurnSequence();
        } else {
            alert("❌ Insufficient funds to buy infrastructure upgrades.");
        }
    },
    applyCardFinancials(cardObject, isLuckCard) {
        const player = gameState.players[gameState.currentPlayerIndex];
        
        // 1. Strip symbols (₹, commas) and extract pure integers from string: "Gain ₹1,00,000" -> 100000
        const numericAmount = parseInt(cardObject.effect.replace(/[^0-9]/g, ''), 10) || 0;
        
        // 2. Perform math operation based on whether card type is Luck vs Fate
        if (isLuckCard) {
            player.balance += numericAmount;
        } else {
            player.balance -= numericAmount;
        }
        
        // 3. Immediately redraw elements so changes reflect instantly on the UI HUD
        this.updateHUDDisplay();
    },

    sendToJail(player) {
        player.isJailed = true;
        player.position = 10;
        const targetCell = document.getElementById('space-10');
        const token = document.getElementById(`p${player.id}`);
        if (targetCell && token) { targetCell.appendChild(token); }
        this.endTurnSequence();
    },

    endTurnSequence() {
        this.updateHUDDisplay();
        gameState.changeTurn();
    },



    // REFIXED WATCHER MAP FUNCTION: No cloneNodes to prevent event breakage!
    setupBoardClickListeners() {
        boardData.forEach(item => {
            const spaceElement = document.getElementById(`space-${item.id}`);
            if (spaceElement) {
                // Remove any old event listeners by replacing the outer node cleanly once
                const oldListener = spaceElement.onclick;
                spaceElement.onclick = null; 
                
                spaceElement.addEventListener('click', (e) => {
                    // Stop event bubble issues from closing the modal immediately
                    e.stopPropagation(); 
                    showCardDetail(item, false);
                });
            }
        });
    },

    canAfford(playerIndex, amount) {
        return gameState.players[playerIndex].balance >= amount;
    },
    // Processes standard payments (Rent, Tax, Fines)
    processPayment(fromPlayerIndex, toPlayerIndex, amount) {
        const debtor = gameState.players[fromPlayerIndex];

        if (debtor.balance < amount) {
            alert(`🚨 ${debtor.name} does not have ₹${amount.toLocaleString()}! You must mortgage assets or take a Bank Loan.`);
            this.openFinancialCrisisModal(fromPlayerIndex, amount, toPlayerIndex);
            return false; // Transaction paused until liquid
        }

        debtor.balance -= amount;
        if (toPlayerIndex !== null) {
            gameState.players[toPlayerIndex].balance += amount;
        }
        this.updateHUDDisplay();
        return true;
    },

    // Loan Engine: Calculates maximum mortgage values (50% of card original price)
    mortgageAsset(playerIndex, spaceId) {
        const space = boardData.find(s => s.id === spaceId);
        const priceNum = parseInt(space.price.replace('k', '')) * 1000;
        const mortgageValue = priceNum / 2;

        // Register mortgage structure
        gameState.mortgagedProperties[spaceId] = true;
        gameState.players[playerIndex].balance += mortgageValue;
        
        alert(`🏦 Bank accepted ${space.name} collateral. Granted cash: ₹${mortgageValue.toLocaleString()}`);
        this.updateHUDDisplay();
    },

    // Issues an official Bank Loan with an 18% structural cycle liability attachment
    takeBankLoan(playerIndex, loanAmount) {
        const player = gameState.players[playerIndex];
        
        if (!player.loans) player.loans = [];
        
        player.loans.push({
            principal: loanAmount,
            accumulatedInterest: 0,
            startLapCount: player.lapCount || 0
        });

        player.balance += loanAmount;
        alert(`💵 Bank issued dynamic loan of ₹${loanAmount.toLocaleString()}. 18% compound interest will be assessed when passing START!`);
        this.updateHUDDisplay();
    },

    // Triggers automatically inside movePlayer logic when checking if a player crossed START
    assessLapLoanInterest(playerIndex) {
        const player = gameState.players[playerIndex];
        if (!player.loans || player.loans.length === 0) return;

        player.loans.forEach(loan => {
            const interestCharge = Math.round(loan.principal * 0.18);
            loan.principal += interestCharge;
            alert(`⚠️ Bank Loan Interest Assessment! ${player.name}'s loan accrued +18% interest (+₹${interestCharge.toLocaleString()})`);
        });
        this.updateHUDDisplay();
    },
    
    updateHUDDisplay() {
        gameState.players.forEach(p => {
            const row = document.getElementById(`leaderboard-row-${p.id}`);
            if (row) row.querySelector('.hud-bal').innerText = `₹${p.balance.toLocaleString()}`;
        });
        gameState.renderSidebars();
    },
    
};

window.buyProperty = (id) => bankLogic.buyProperty(id);
window.buildHouseOnLand = (id, cost) => bankLogic.buildHouseOnLand(id, cost);
window.passTurn = () => {
    window.closeModal();
    bankLogic.endTurnSequence();
};