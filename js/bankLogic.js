// js/bankLogic.js
import { gameState } from './gameState.js';
import { boardData } from './data.js';
import { showCardDetail, handleJailInterventionModal } from './uiManager.js';

export const bankLogic = {
    /**
     * Handles the landing logic when a player's token stops on a space.
     * @param {number} spaceIndex - The board array position index.
     */
    handleLanding(spaceIndex) {
        const player = gameState.players[gameState.currentPlayerIndex];
        const data = boardData[spaceIndex];
        const priceNum = data.price ? (parseInt(data.price.replace('k', '')) * 1000) || 0 : 0;

        if (data.type === "corner") {
            if (data.name === "START") { 
                this.endTurnSequence();
                return;
            }
            if (data.name === "Go To Jail" || data.name === "Traffic Jam!") {
                this.sendToJail(player);
                return;
            }
            this.endTurnSequence();
            return;
        }

        if (data.type === "tax") {
            showCardDetail(data, false);
            
            setTimeout(() => {
                this.processPayment(gameState.currentPlayerIndex, null, priceNum, () => {
                    alert(`💸 Tax office collected ₹${priceNum.toLocaleString()} from your account!`);
                    window.closeModal();
                    this.endTurnSequence();
                });
            }, 500);
            return;
        }

        const ownerIndex = gameState.ownership[spaceIndex];
        if (ownerIndex !== undefined && ownerIndex !== gameState.currentPlayerIndex) {
            if (gameState.mortgagedProperties[spaceIndex]) {
                alert(`🏳️ ${data.name} is currently mortgaged to the Bank. Rent is waived!`);
                this.endTurnSequence();
            } else {
                this.payRent(player, ownerIndex, spaceIndex, priceNum, data);
            }
        } else {
            showCardDetail(data, true); 
        }
    },

    /**
     * Computes scaling tier rent metrics and routes funds to asset holders.
     */
    payRent(player, ownerIndex, spaceIndex, priceNum, data) {
        let baseRent = data.type === "property" ? Math.round(priceNum * 0.1) : 25000;
        let houseCount = gameState.structures[spaceIndex] || 0;
        
        let finalRent = baseRent;
        if (houseCount === 1) finalRent = baseRent * 3;
        if (houseCount === 2) finalRent = baseRent * 9;
        if (houseCount === 3) finalRent = baseRent * 25;
        if (houseCount === 4) finalRent = baseRent * 40;
        if (houseCount === 5) finalRent = baseRent * 50;

        this.processPayment(gameState.currentPlayerIndex, ownerIndex, finalRent, () => {
            const owner = gameState.players[ownerIndex];
            alert(`💥 Rent Notice!\nLanded on ${data.name}. Paid ₹${finalRent.toLocaleString()} to ${owner.name}!`);
            window.closeModal(); 
            this.endTurnSequence();
        });
    },

    /**
     * Purchases unowned properties from the bank.
     */
    buyProperty(spaceIndex) {
        const player = gameState.players[gameState.currentPlayerIndex];
        const data = boardData[spaceIndex];
        const priceNum = data.price ? (parseInt(data.price.replace('k', '')) * 1000) || 0 : 0;

        this.processPayment(gameState.currentPlayerIndex, null, priceNum, () => {
            gameState.ownership[spaceIndex] = gameState.currentPlayerIndex;
            gameState.activeTurnSpaceChecked = true; 

            const spaceEl = document.getElementById(`space-${spaceIndex}`);
            if (spaceEl) {
                let flag = spaceEl.querySelector('.owner-flag') || document.createElement('div');
                flag.className = 'owner-flag';
                flag.innerText = player.icon;
                spaceEl.appendChild(flag);
            }

            window.closeModal();
            this.endTurnSequence();
        });
    },

    /**
     * Upgrades property tiers by adding houses or hotels.
     */
    buildHouseOnLand(spaceIndex, cost) {
        this.processPayment(gameState.currentPlayerIndex, null, cost, () => {
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
        });
    },

    /**
     * Evaluates card actions fetched from Fortune/Fate piles.
     */
   /**
     * Evaluates card actions fetched from Fortune/Fate piles.
     */
    applyCardFinancials(cardObject, isLuckCard) {
        const player = gameState.players[gameState.currentPlayerIndex];
        
        if (cardObject.effect.includes("Free Jail Escape Card")) {
            player.jailCards = (player.jailCards || 0) + 1;
            this.updateHUDDisplay();
            window.closeModal();
            this.endTurnSequence();
            return;
        }
        if (cardObject.effect.includes("Go To Jail Immediately")) {
            this.sendToJail(player);
            return;
        }

        const numericAmount = parseInt(cardObject.effect.replace(/[^0-9]/g, ''), 10) || 0;
        console.log(isLuckCard, numericAmount);

        if (isLuckCard) {
            player.balance += numericAmount;
            this.updateHUDDisplay();
            alert(`🎉 Reward Collected: Added ₹${numericAmount.toLocaleString()} to your account!`);
            window.closeModal();
            this.endTurnSequence();
        } else {
            // Hand payment off directly to processPayment
            this.processPayment(gameState.currentPlayerIndex, null, numericAmount, () => {
                alert(`📋 Card Penalty Cleared: Paid ₹${numericAmount.toLocaleString()}`);
                window.closeModal();
                this.endTurnSequence();
            });
        }
    },
    /**
     * Locks a player into the jail sector.
     */
    sendToJail(player) {
        player.isJailed = true;
        player.position = 10;
        player.jailTurns = 0;
        const targetCell = document.getElementById('space-10');
        const token = document.getElementById(`p${player.id}`);
        if (targetCell && token) { targetCell.appendChild(token); }
        
        this.updateHUDDisplay();
        setTimeout(() => {
            handleJailInterventionModal();
        }, 600);
    },

    /**
     * Refreshes dashboard layouts and hands off turn pointers.
     */
    endTurnSequence() {
        this.updateHUDDisplay();
        gameState.changeTurn();
    },

    /**
     * Maps clickable event callbacks onto the physical CSS map spaces.
     */
    setupBoardClickListeners() {
        boardData.forEach(item => {
            const spaceElement = document.getElementById(`space-${item.id}`);
            if (spaceElement) {
                spaceElement.onclick = null; 
                spaceElement.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    
                    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
                    const ownerIndex = gameState.ownership[item.id];
                    const isBuyable = item.type === "property" || item.type === "transport" || item.type === "utility";

                    if (currentPlayer.position === item.id && isBuyable && ownerIndex === undefined && !gameState.activeTurnSpaceChecked) {
                        showCardDetail(item, true);
                    } else {
                        showCardDetail(item, false);
                    }
                });
            }
        });
    },

    canAfford(playerIndex, amount) {
        return gameState.players[playerIndex].balance >= amount;
    },

    /**
     * Core transactional hub verifying affordability before cash deductions.
     */
    processPayment(fromPlayerIndex, toPlayerIndex, amount, successCallback) {
        const debtor = gameState.players[fromPlayerIndex];
        console.log("hi");
        console.log(debtor.balance);

        if (debtor.balance < amount) {
            console.log("karu chu oprn bhai  ");
            this.openFinancialCrisisModal(fromPlayerIndex, amount, toPlayerIndex, successCallback);
            return false; 
        }

        debtor.balance -= amount;
        if (toPlayerIndex !== null && toPlayerIndex !== undefined) {
            gameState.players[toPlayerIndex].balance += amount;
        }
        this.updateHUDDisplay();
        
        if (successCallback) successCallback();
        return true;
    },

    /**
     * Centralized route managing Lap Completing Salary and immediate loan charges.
     */
    processLapCompletion(playerIndex) {
        const player = gameState.players[playerIndex];
        
        player.balance += 200000;
        this.updateHUDDisplay();
        alert(`💰 Passed START! Collected lap salary of ₹2,00,000.`);

        this.assessLapLoanInterest(playerIndex);
    },

    /**
     * Deploys financial crisis layout if wallet defaults.
     */
    openFinancialCrisisModal(playerIndex, amountNeeded, creditorIndex, successCallback) {
        const modal = document.getElementById('card-modal');
        const content = document.getElementById('detail-card-content');
        if (!modal || !content) return;
        modal.onclick = (e) => { e.stopPropagation(); };
        const player = gameState.players[playerIndex];
        const deficit = amountNeeded - player.balance;

        content.className = "detail-card jail-theme";
        content.innerHTML = `
            <div class="detail-header" style="background: #c0392b; color: white; padding: 15px; text-align: center;">
                <h2 style="margin:0; color:#fff;">🚨 LIQUIDITY CRISIS</h2>
            </div>
            <div class="detail-body" style="padding: 20px; text-align: center;">
                <p><b>${player.name}</b>, you owe <b>₹${amountNeeded.toLocaleString()}</b>.</p>
                <p style="color: #e74c3c; font-weight: bold; font-size:18px;">Deficit Shortfall: ₹${deficit.toLocaleString()}</p>
                <hr style="border:0; border-top:1px solid #eee; margin:15px 0;"/>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                    <button id="crisis-mortgage-btn" style="background: #e67e22; color:white; border:none; padding:12px; font-weight:bold; border-radius:6px; cursor:pointer;">
                        🏠 Mortgage Owned Assets
                    </button>
                    <button id="crisis-loan-btn" style="background: #2980b9; color:white; border:none; padding:12px; font-weight:bold; border-radius:6px; cursor:pointer;">
                        🏦 Take Bank Loan (18% Interest)
                    </button>
                </div>
            </div>
        `;
        
        // Use a tiny 10ms timeout to force this view to show AFTER the external file closes the card modal
        setTimeout(() => {
            modal.style.display = 'flex';
        }, 10);

        document.getElementById('crisis-mortgage-btn').onclick = () => {
            this.renderCrisisMortgageList(playerIndex, amountNeeded, creditorIndex, successCallback);
        };
        
        document.getElementById('crisis-loan-btn').onclick = () => {
            this.takeBankLoan(playerIndex, deficit);
            
            const paid = this.processPayment(playerIndex, creditorIndex, amountNeeded, successCallback);
            if (paid) {
               gameState.activeTurnSpaceChecked = true;
                window.closeModal()
            }
        };
    },

    renderCrisisMortgageList(playerIndex, amountNeeded, creditorIndex, successCallback) {
        const content = document.getElementById('detail-card-content');
        
        const ownedProperties = Object.keys(gameState.ownership)
            .filter(k => gameState.ownership[k] === playerIndex && !gameState.mortgagedProperties[k])
            .map(k => boardData[k]);

        if (ownedProperties.length === 0) {
            alert("❌ You hold no unmortgaged properties to serve as collateral!");
            this.openFinancialCrisisModal(playerIndex, amountNeeded, creditorIndex, successCallback);
            return;
        }

        let listHTML = `
            <div class="detail-header" style="background: #e67e22; color: white; padding: 15px; text-align: center;">
                <h2 style="margin:0; color:#fff;">SELECT COLLATERAL</h2>
            </div>
            <div class="detail-body" style="padding: 15px; max-height: 240px; overflow-y: auto;">
        `;

        ownedProperties.forEach(prop => {
            const val = (parseInt(prop.price.replace('k', '')) * 1000) / 2;
            listHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#f8f9fa; padding:10px; margin-bottom:6px; border-radius:6px; border-left:5px solid ${prop.color || '#333'}">
                    <span style="font-size:13px; font-weight:bold;">${prop.name} (Value: ₹${val.toLocaleString()})</span>
                    <button class="execute-mortgage-action-btn" data-id="${prop.id}" style="background:#27ae60; color:white; border:none; padding:6px 12px; border-radius:4px; font-size:12px; cursor:pointer; font-weight:bold;">Mortgage</button>
                </div>
            `;
        });

        listHTML += `</div>`;
        content.innerHTML = listHTML;

        const self = this;
        const buttons = content.querySelectorAll('.execute-mortgage-action-btn');
        buttons.forEach(btn => {
            btn.onclick = (e) => {
                const spaceId = parseInt(e.target.getAttribute('data-id'));
                self.mortgageAsset(playerIndex, spaceId);
                
                const paid = self.processPayment(playerIndex, creditorIndex, amountNeeded, successCallback);
                if (paid) {
                    window.closeModal();
                }
            };
        });
    },

    mortgageAsset(playerIndex, spaceId) {
        const space = boardData.find(s => s.id === spaceId);
        const priceNum = parseInt(space.price.replace('k', '')) * 1000;
        const mortgageValue = priceNum / 2;

        gameState.mortgagedProperties[spaceId] = true;
        gameState.players[playerIndex].balance += mortgageValue;
        
        alert(`🏦 Collateral accepted. Added liquidity: +₹${mortgageValue.toLocaleString()}`);
        this.updateHUDDisplay();
    },

    takeBankLoan(playerIndex, loanAmount) {
        const player = gameState.players[playerIndex];
        
        if (!player.loans) {
            player.loans = [];
        }
        
        player.loans.push({ principal: Math.ceil(loanAmount) });
        player.balance += Math.ceil(loanAmount);
        
        alert(`💵 Bank processed relief loan of ₹${Math.ceil(loanAmount).toLocaleString()}.\nAn 18% charge applies per lap past START.`);
        this.updateHUDDisplay();
    },

    assessLapLoanInterest(playerIndex) {
        const player = gameState.players[playerIndex];
        if (!player.loans || player.loans.length === 0) return;

        for (let i = 0; i < player.loans.length; i++) {
            let loan = player.loans[i];
            let interestCharge = Math.round(loan.principal * 0.18);
            
            loan.principal += interestCharge;
            
            this.processPayment(playerIndex, null, interestCharge, () => {
                alert(`⚠️ Liability Interest!\n${player.name}'s active loan generated a +18% interest charge.\nDeducted: ₹${interestCharge.toLocaleString()} from your wallet.`);
            });
        }
    },
    
    updateHUDDisplay() {
        gameState.players.forEach(p => {
            const row = document.getElementById(`leaderboard-row-${p.id}`);
            if (row) row.querySelector('.hud-bal').innerText = `₹${p.balance.toLocaleString()}`;
        });
        gameState.renderSidebars();
    }
};

/* Global window hooks for UI and layout controls */
window.buyProperty = (id) => bankLogic.buyProperty(id);
window.buildHouseOnLand = (id, cost) => bankLogic.buildHouseOnLand(id, cost);
window.passTurn = () => {
    gameState.activeTurnSpaceChecked = true; 
    window.closeModal();
    bankLogic.endTurnSequence();
};

window.paybackMortgage = (spaceId) => {
    const playerIndex = gameState.currentPlayerIndex;
    const player = gameState.players[playerIndex];
    const space = boardData.find(s => s.id === spaceId);
    
    const mortgageValue = (parseInt(space.price.replace('k', '')) * 1000) / 2;
    const costToLift = Math.round(mortgageValue * 1.1);

    if (player.balance < costToLift) {
        alert("❌ Insufficient liquid capital to clear this property's mortgage!");
        return;
    }

    player.balance -= costToLift;
    delete gameState.mortgagedProperties[spaceId];
    
    alert(`🔓 Mortgage lifted from ${space.name}! It can now collect rent again.`);
    bankLogic.updateHUDDisplay();
};

window.paybackLoan = (loanIndex) => {
    const playerIndex = gameState.currentPlayerIndex;
    const player = gameState.players[playerIndex];
    const loan = player.loans[loanIndex];

    if (player.balance < loan.principal) {
        alert("❌ You don't have enough money in your wallet to settle this loan balance!");
        return;
    }

    player.balance -= loan.principal;
    alert(`✅ Settle payment successful! Paid off loan of ₹${loan.principal.toLocaleString()}.`);
    
    player.loans.splice(loanIndex, 1);
    bankLogic.updateHUDDisplay();
};

// TEMPORARY FOR CONSOLE TESTING
window.gameState = gameState;
window.bankLogic = bankLogic;