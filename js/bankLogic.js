
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
        if (data.name === "Go To Jail" || data.name === "Traffic Jam!") {
            // Show the "Go To Jail" layout card first so they understand why they are moving
            showCardDetail(data, true);
            
            // Automatically process their arrest movement after a small dramatic delay
            setTimeout(() => {
                window.closeModalOnly();
                this.sendToJail(player);
            }, 3000); 
            return;
        }
        
        // For standard casual corners like "START" or "Chai Break"
        console.log(`Landed on corner space: ${data.name}. Displaying card layout.`);
        showCardDetail(data, true); // true sets up the action footer layout button
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
            console.log("No ownership or landed on own property. Showing card detail for potential purchase or info.");
            showCardDetail(data, true); 
        }
    },

    /**
     * Computes scaling tier rent metrics and routes funds to asset holders.
     */
   payRent(player, ownerIndex, spaceIndex, priceNum, data) {
    let baseRent = data.type === "property" ? Math.round(priceNum * 0.1) : 25000;
    let houseCount = gameState.structures[spaceIndex] || 0;
    
    // Calculate basic structural scale tier rent adjustments
    let finalRent = baseRent;
    if (houseCount === 1) finalRent = baseRent * 3;
    if (houseCount === 2) finalRent = baseRent * 9;
    if (houseCount === 3) finalRent = baseRent * 25;
    if (houseCount === 4) finalRent = baseRent * 40;
    if (houseCount === 5) finalRent = baseRent * 50;

    const owner = gameState.players[ownerIndex];
    const tenantId = player.id; // The unique ID of the landing player

    // -------------------------------------------------------------
    // PERK CHANGE 1: Check for Rent-Free Grace Period Immunity
    // -------------------------------------------------------------
    if (data.rentFreeAllowances && data.rentFreeAllowances[tenantId] > 0) {
        data.rentFreeAllowances[tenantId]--; // Use up one token pass
        
        alert(`🎟️ Rent-Free Grace Period Triggered!\nYour partnership deal covers this visit to ${data.name}. You owe ₹0!\n(${data.rentFreeAllowances[tenantId]} free visits remaining).`);
        
        window.closeModal();
        this.endTurnSequence();
        return; // Halt execution early - no money changes hands!
    }

    // -------------------------------------------------------------
    // PERK CHANGE 2: Check for Rent Profit-Share Partnership Splits
    // -------------------------------------------------------------
    if (data.profitSharePercentage > 0 && data.profitSharePartnerId) {
        const partnerIndex = gameState.players.findIndex(p => p.id === data.profitSharePartnerId);
        
        // Split the money using the agreed percentages
        const partnerCut = Math.floor(finalRent * (data.profitSharePercentage / 100));
        const ownerCut = finalRent - partnerCut;

        // Execute payment deduction step for landing player
        player.balance -= finalRent;

        // Distribute dividends to both partners safely
        owner.balance += ownerCut;
        if (partnerIndex !== -1) {
            gameState.players[partnerIndex].balance += partnerCut;
        }

        const partner = gameState.players.find(p => p.id === data.profitSharePartnerId);
        alert(`📊 Venture Dividend Split Alert!\nLanded on ${data.name}. Rent: ₹${finalRent.toLocaleString()}.\n\n` + 
              `🏢 Owner ${owner.name} receives: ₹${ownerCut.toLocaleString()}\n` + 
              `🤝 Partner ${partner.name} receives (${data.profitSharePercentage}%): ₹${partnerCut.toLocaleString()}`);
        
        // Refresh your board balances HUD layout metrics
        this.updateHUDDisplay(); 
        window.closeModal();
        this.endTurnSequence();
    } 
    else {
        // -------------------------------------------------------------
        // STANDARD FLOW: Standard execution if no trade deals exist
        // -------------------------------------------------------------
        this.processPayment(gameState.currentPlayerIndex, ownerIndex, finalRent, () => {
            alert(`💥 Rent Notice!\nLanded on ${data.name}. Paid ₹${finalRent.toLocaleString()} to ${owner.name}!`);
            window.closeModal(); 
            this.endTurnSequence();
        });
    }
},

    /**
     * Purchases unowned properties from the bank.
     */
    /**
     * Purchases unowned properties from the bank.
     */
    /**
     * Purchases unowned properties from the bank.
     */
    buyProperty(spaceIndex) {
        // SAFETY GUARD: Prevent accidental double-firing if the modal is already processing
        if (this._isProcessingPurchase) return;
        this._isProcessingPurchase = true;

        const player = gameState.players[gameState.currentPlayerIndex];
        const data = boardData[spaceIndex];
        const priceNum = data.price ? (parseInt(data.price.replace('k', '')) * 1000) || 0 : 0;

        this.processPayment(gameState.currentPlayerIndex, null, priceNum, () => {
            // Assign ownership permanently
            gameState.ownership[spaceIndex] = gameState.currentPlayerIndex;
            

            // Update physical UI board map layout
            const spaceEl = document.getElementById(`space-${spaceIndex}`);
            if (spaceEl) {
                let flag = spaceEl.querySelector('.owner-flag') || document.createElement('div');
                flag.className = 'owner-flag';
                flag.innerText = player.icon;
                spaceEl.appendChild(flag);
            }

            // Close modal overlay cleanly 
            window.closeModal();

            // Finalize state adjustments before swapping turn pointers
            gameState.activeTurnSpaceChecked = true; 
            
            this.endTurnSequence();
            
            // Reset the safety guard flag after the turn sequence finishes winding down
            setTimeout(() => {
                this._isProcessingPurchase = false;
            }, 100);
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
        player.jailWaitCounter = 3; // Initialize wait counter to exactly 3 rounds
        player.position = 10; // Instantly snap coordinates to jail board index
        
        const token = document.getElementById(`p${player.id}`);
        const jailSpace = document.getElementById('space-10');
        if (token && jailSpace) jailSpace.appendChild(token);
        
        alert(`🚔 ${player.name} sent to custody! You must pay bail, roll doubles, or serve 3 rounds.`);
        this.endTurnSequence();
    },
    /**
     * Tracks and handles consuming a Jail Free card to immediately liberate a player.
     */
    useJailEscapeCard(playerIndex) {
        const player = gameState.players[playerIndex];
        
        if (player.jailCards && player.jailCards > 0) {
            player.jailCards -= 1;
            player.isJailed = false;
            player.jailTurns = 0;
            
            alert(`🕊️ You used a "Free Jail Escape Card"! You are now free.`);
            this.updateHUDDisplay();
            
            if (window.closeModal) {
                window.closeModal();
            }
            this.endTurnSequence(); 
        } else {
            alert("❌ You do not possess a Free Jail Escape Card!");
        }
    },

    /**
     * Refreshes dashboard layouts and hands off turn pointers.
     */
    // endTurnSequence() {
    //     console.log("BEFORE CHANGE:", gameState.currentPlayerIndex);
    //     this.updateHUDDisplay();
    //     gameState.changeTurn();
    //     console.log("AFTER CHANGE:", gameState.currentPlayerIndex);
    // },
    // js/bankLogic.js
endTurnSequence() {
        console.log("🔄 [BANK CENTRAL CONTROL] Progressing turn index pointer forward...");
        window.closeModalOnly();

        // Increment internal player tracking indexes natively via gameState engine
        gameState.changeTurn();
        this.updateHUDDisplay();
        
        // Inspect the upcoming current player object
        const nextPlayer = gameState.players[gameState.currentPlayerIndex];
        
        // INTERCEPT TRIGGER: If player is jailed, block rolling and display the choices menu
        if (nextPlayer.isJailed) {
            console.log(`🚔 Intercepting jailed player turn selection state...`);
            
            if (typeof window.setTurnControlUIMode === "function") {
                window.setTurnControlUIMode("THINKING_PHASE"); // Disable roll dice elements
            }
            
            // Pop open choice dialog automatically so they can select an action at the start of their turn
            handleJailInterventionModal(); 
        } 
        // Standard normal player workflow
        else {
            if (typeof window.setTurnControlUIMode === "function") {
                window.setTurnControlUIMode("ROLLING_PHASE"); // Unlock dice components
            } else {
                const rollBtn = document.getElementById('roll-btn');
                if (rollBtn) rollBtn.disabled = false;
            }
        }
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
                      console.log(
        "clicked",
        item.id,
        "activeTurnSpaceChecked:",
        gameState.activeTurnSpaceChecked
    );
                    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
                    const ownerIndex = gameState.ownership[item.id];
                    const isBuyable = item.type === "property" || item.type === "transport" || item.type === "utility";

                    if (currentPlayer.position === item.id && isBuyable && ownerIndex === undefined && !gameState.activeTurnSpaceChecked) {
                        console.log("hu moklu chu 1");
                        showCardDetail(item, true);
                    } else {
                        console.log("hu moklu chu 2");
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
        console.log("Processing payment from player balance:", debtor.balance);

        if (debtor.balance < amount) {
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
        
        setTimeout(() => {
            modal.style.display = 'flex';
        }, 10);

        document.getElementById('crisis-mortgage-btn').onclick = () => {
            this.renderCrisisMortgageList(playerIndex, amountNeeded, creditorIndex, successCallback);
        };
        
        document.getElementById('crisis-loan-btn').onclick = () => {
            this.takeBankLoan(playerIndex, deficit);
            
            // Re-attempt payment settlement. This fires the buyProperty successCallback cleanly.
            const paid = this.processPayment(playerIndex, creditorIndex, amountNeeded, successCallback);
            if (paid) {
                // Do NOT explicitly mutate activeTurnSpaceChecked or call closeModal here.
                // The successCallback (buyProperty) handles closing the modal and advancing the turn sequence.
                console.log("Crisis resolved successfully via Bank Loan.");
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
window.useJailEscapeCard = () => bankLogic.useJailEscapeCard(gameState.currentPlayerIndex);
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
