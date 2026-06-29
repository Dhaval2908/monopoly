// js/uiManager.js
import { boardData, luckCards, fateCards } from './data.js';
import { gameState } from './gameState.js';
import { bankLogic } from './bankLogic.js';

// Tracks whether the currently open modal represents an active turn action
let landedActionInModal = false;

/**
 * Manages disabled states for the roll dice button.
 * @param {string} phaseMode - Can be either "ROLLING_PHASE" or "THINKING_PHASE"
 */
export function setTurnControlUIMode(phaseMode) {
    const rollBtn = document.getElementById('roll-btn');
    if (!rollBtn) return;

    if (phaseMode === "ROLLING_PHASE") {
        rollBtn.disabled = false; // Ready for next player to roll
    } else if (phaseMode === "THINKING_PHASE") {
        rollBtn.disabled = true;  // Lock roll button during active choice tracking
    }
}

/**
 * Triggered when a user clicks on ANY space on the board layout manually.
 */
export function handleSpaceClick(spaceId) {
    // Coerce data types to string to guarantee a clean match across data structures
    const targetSpace = boardData.find(s => String(s.id) === String(spaceId));
    if (!targetSpace) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Check if the roll button is disabled, meaning a roll already happened this turn
    const rollBtn = document.getElementById('roll-btn');
    const hasRolled = rollBtn ? rollBtn.disabled : false;
    
    // CRITICAL FIX: Use loose equality '==' or String coercion so that number vs string ID differences don't break validation
    const isStandingOnThisSpace = (String(currentPlayer.position) === String(targetSpace.id));

    if (isStandingOnThisSpace && hasRolled) {
        // Re-open with full functional operational panel (BUY / PASS options restored!)
        showCardDetail(targetSpace, true); 
    } else {
        showCardDetail(targetSpace, false); // Standard inspection preview for other properties
    }
}

/**
 * Renders the asset deed or special event card in a centralized modal box.
 */
export function showCardDetail(data, isLandedAction = false) {
    const modal = document.getElementById('card-modal');
    const content = document.getElementById('detail-card-content');
    if (!modal || !content) return;
    
    // Track if this is a landed action so that background clicks know to switch to THINKING_PHASE
    landedActionInModal = isLandedAction;
    
    modal.onclick = (e) => {
        if (e.target === modal) { e.stopPropagation(); }
    };
    
    modal.style.opacity = "";
    modal.style.transform = "";
    modal.style.visibility = "";
    content.style.opacity = "";
    content.style.transform = "";
    
    content.className = "detail-card";
    let detailHTML = '';
    
    const priceNum = data.price ? (parseInt(data.price.replace('k', '')) * 1000) || 0 : 0;
    const isBuyable = data.type === "property" || data.type === "transport" || data.type === "utility";
    const ownerIndex = gameState.ownership[data.id];

    let activeLandedCard = null;
    let isActiveCardLuck = false;

    // --- 1. LUCK / FATE DECK MANAGEMENT ---
    if (data.type === "luck" || data.type === "fate") {
        const isLuck = data.type === "luck";
        const deck = isLuck ? luckCards : fateCards;
        const randomCard = deck[Math.floor(Math.random() * deck.length)];
        const cardThemeColor = isLuck ? "#8e44ad" : "#c0392b";
        
       if (isLandedAction) {
    activeLandedCard = randomCard;
    isActiveCardLuck = isLuck;
    
    // 💡 PRIVATE TRACKING FLAG (Closure Scope)
    // This variable lives privately inside this card creation instance.
    // It remains 'false' until the card action is actually triggered.
    let cardActionProcessed = false;
    
    window.executeLandedCardAction = () => {
        
        // 🛡️ STEP 1: SELF-BLOCKING GUARD (Prevents Double Execution)
        // If this specific card's code is already running (or has finished running),
        // we bounce out immediately. This protects us if the function gets executed
        // simultaneously by a rapid button-mash and a background-click.
        if (cardActionProcessed) {
            console.log("Luck/Fate card action already executed. Ignoring duplicate execution.");
            return;
        }

        // 📝 STEP 2: LOCK THE IN-PROGRESS STATE
        // We flip this flag to 'true' instantly before executing any heavy game logic.
        // Even if the global window variable gets set to 'null' by an outside script,
        // this private 'cardActionProcessed' tracking tag stays safely 'true'.
        cardActionProcessed = true;
        
        // 🧹 STEP 3: DISARM GLOBAL ACCESS
        // We delete the function from the global 'window' object right now.
        // If the background overlay script tries to check for an action a millisecond later,
        // it will see 'null' and realize the card has already been dealt with.
        window.executeLandedCardAction = null; 
        
        // 💰 STEP 4: TRIGGER TRANSACTION & TURN ROTATION
        // Now that all duplicate safety guards are completely locked, it is 100% safe to 
        // add/subtract money and transition the game to the next player's turn.
        bankLogic.applyCardFinancials(activeLandedCard, isActiveCardLuck); 
    };
}
        detailHTML = `
            <div class="detail-header" style="background: ${cardThemeColor}; color: #fff; padding: 15px; text-align: center;">
                <h2 style="margin: 0; color: #fff;">${randomCard.icon} ${randomCard.title}</h2>
                <span style="font-size: 11px; opacity: 0.8; letter-spacing: 1px;">${data.type.toUpperCase()} ACTION</span>
            </div>
            <div class="detail-body text-center" style="padding: 20px; text-align: center;">
                <p style="font-size: 16px; margin: 10px 0; color: #2c3e50; font-weight: 500;">"${randomCard.msg}"</p>
                <div style="background: #f8f9fa; border: 2px dashed ${cardThemeColor}; padding: 12px; border-radius: 8px; display: inline-block; margin-top: 10px;">
                    <strong style="color: ${cardThemeColor}; font-size: 15px;">${randomCard.effect}</strong>
                </div>
            </div>
        `;
    }
    // --- 2. CORNER & SPECIAL CARDS ---
    else if (data.type === "corner" || data.type === "tax") {
        let titleColor = "#2c3e50";
        let description = "Follow corporate administrative board rule instructions instantly.";
        
        if (data.name === "START") {
            titleColor = "#27ae60";
            description = "Collect baseline salary allowance of ₹2,0,0,000 every single time you cycle past.";
        } else if (data.name === "Chai Break") {
            titleColor = "#16a085";
            description = "Relax and unwind at the stall. No fees, no dues, no rent collections.";
        } else if (data.name === "Jail") {
            titleColor = "#7f8c8d";
            description = "Secured holding complex compound. Visiting safely or serving penalty rounds.";
        } else if (data.name === "Go To Jail") {
            titleColor = "#d35400";
            description = "Violated local traffic regulations. Divert tokens directly to the Jail cell block.";
        } else if (data.type === "tax") {
            titleColor = "#c0392b";
            description = `Administrative government dues assessment. Pay mandatory flat fee processing charges to the bank treasury.`;
        }

        detailHTML = `
            <div class="detail-header" style="background: ${titleColor}; color: #fff; padding: 15px; text-align: center;">
                <h2 style="margin:0; color:#fff;">${data.icon} ${data.name}</h2>
            </div>
            <div class="detail-body text-center" style="padding: 20px; text-align: center;">
                <p style="font-size: 15px; color: #333; line-height: 1.4;">${description}</p>
                ${data.type === "tax" ? `<h3 style="color:#e74c3c; margin: 15px 0 0 0; font-size:22px;">Fee: ₹${priceNum.toLocaleString()}</h3>` : ''}
            </div>
        `;
    }
    // --- 3. BUYABLE PROPERTIES ---
    else if (isBuyable) {
        let baseRent = data.type === "property" ? Math.round(priceNum * 0.1) : 25000;
        let h1 = baseRent * 3, h2 = baseRent * 9, h3 = baseRent * 25, hotel = baseRent * 50;
        let colorStyle = data.color ? `background: ${data.color}; color: #000;` : 'background: #2c3e50; color: #fff;';

        detailHTML = `
            <div class="detail-header" style="${colorStyle} padding: 15px; text-align: center;">
                <h2 style="color: inherit; margin:0;">${data.icon} ${data.name}</h2>
                <span style="font-size: 11px; opacity: 0.8; font-weight: bold;">${data.type.toUpperCase()} DEED</span>
            </div>
            <div class="detail-body" style="padding: 15px;">
                <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 8px;"><strong>Site Purchase Value</strong> <strong style="color:#2c3e50;">₹${priceNum.toLocaleString()}</strong></div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Base Flat Rent</span> <span>₹${baseRent.toLocaleString()}</span></div>
                ${data.type === "property" ? `
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>With 1 House</span> <span>₹${h1.toLocaleString()}</span></div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>With 2 Houses</span> <span>₹${h2.toLocaleString()}</span></div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>With 3 Houses</span> <span>₹${h3.toLocaleString()}</span></div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #e74c3c; font-weight:bold;"><span>With HOTEL STRUCTURE</span> <span>₹${hotel.toLocaleString()}</span></div>
                ` : `<p style="font-size:11px; color:#7f8c8d; font-style: italic; margin: 10px 0;">Rent scales based on corporate holdings owned.</p>`}
                <div class="detail-row" style="display: flex; justify-content: space-between; margin-top: 4px; font-size:12px; color:#7f8c8d;"><span>Mortgage Value</span> <span>₹${(priceNum / 2).toLocaleString()}</span></div>
            </div>
        `;
    }

    // --- BUTTON FOOTER ASSEMBLY ---
    if (isLandedAction) {
        if (data.type === "luck" || data.type === "fate") {
            const actionLabel = data.type === "luck" ? "COLLECT REWARD" : "PAY PENALTY";
            const btnColor = data.type === "luck" ? "#8e44ad" : "#c0392b";
            detailHTML += `
                <div style="padding:12px; background: #f8f9fa;">
                    <button style="width:100%; padding:14px; background:${btnColor}; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px; letter-spacing:0.5px;" onclick="window.executeLandedCardAction()">
                        👉 ${actionLabel}
                    </button>
                </div>`;
        }
        else if (ownerIndex === undefined && isBuyable) {
            detailHTML += `
                <div class="action-footer-box" style="padding: 12px; background: #f8f9fa; display: flex; gap: 10px;">
                    <button style="flex:1; padding:12px; background:#2ecc71; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.buyPropertyAndPass(${data.id})">BUY DEED</button>
                    <button style="flex:1; padding:12px; background:#e74c3c; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="bankLogic.endTurnSequence()">PASS TURN</button>
                </div>
            `;
        } 
        else if (ownerIndex === gameState.currentPlayerIndex && data.type === "property") {
            const currentHouses = gameState.structures[data.id] || 0;
            const houseCost = Math.round(priceNum * 0.4);

            if (currentHouses < 5) {
                detailHTML += `
                    <div class="action-footer-box" style="padding: 12px; background: #f8f9fa; display: flex; gap: 10px;">
                        <button style="flex:1; padding:12px; background:#3498db; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.buildHouseOnLand(${data.id}, ${houseCost})">
                            BUILD ${currentHouses === 4 ? 'HOTEL' : 'HOUSE'} (₹${houseCost.toLocaleString()})
                        </button>
                        <button style="flex:1; padding:12px; background:#e74c3c; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="bankLogic.endTurnSequence()">PASS TURN</button>
                    </div>
                `;
            } else {
                detailHTML += `
                    <div style="padding: 15px; text-align:center; background: #f8f9fa;">
                        <p style="color:#27ae60; font-weight:bold; margin:0 0 10px 0;">🏨 Max Hotel infrastructure achieved!</p>
                        <button style="width:100%; padding:10px; background:#e74c3c; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="bankLogic.endTurnSequence()">PASS TURN</button>
                    </div>`;
            }
        } 
        else {
            if (ownerIndex !== undefined && ownerIndex !== gameState.currentPlayerIndex) {
                let rentDues = data.type === "property" ? Math.round(priceNum * 0.1) : 25000;
                const currentHouses = gameState.structures[data.id] || 0;
                if (currentHouses === 1) rentDues *= 3;
                else if (currentHouses === 2) rentDues *= 9;
                else if (currentHouses === 3) rentDues *= 25;
                else if (currentHouses >= 4) rentDues *= 50;

                detailHTML += `
                    <div style="padding:12px; background: #f8f9fa;">
                        <button style="width:100%; padding:14px; background:#e67e22; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.payRentAndPass(${gameState.currentPlayerIndex}, ${ownerIndex}, ${rentDues})">
                            💸 PAY RENT (₹${rentDues.toLocaleString()})
                        </button>
                    </div>`;
            } else {
                detailHTML += `
                    <div style="padding:12px; background: #f8f9fa;">
                        <button style="width:100%; padding:12px; background:#2c3e50; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="bankLogic.endTurnSequence()">CONTINUE</button>
                    </div>`;
            }
        }
    } else {
        detailHTML += `
            <div style="padding:12px; background: #f8f9fa;">
                <button style="width:100%; padding:12px; background:#7f8c8d; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.closeModalOnly()">CLOSE DETAILS</button>
            </div>`;
    }

    content.innerHTML = detailHTML;
    modal.style.display = 'flex';
}

/**
 * Jail Layout Handler
 */
export function handleJailInterventionModal() {
    const modal = document.getElementById('card-modal');
    const content = document.getElementById('detail-card-content');
    if (!modal || !content) return;

    modal.onclick = (e) => { if (e.target === modal) e.stopPropagation(); };

    const player = gameState.players[gameState.currentPlayerIndex];
    
    // Initialize required state variables cleanly if undefined
    if (player.jailWaitCounter === undefined) player.jailWaitCounter = 3;
    if (player.jailCards === undefined) player.jailCards = 0;

    content.className = "detail-card jail-theme";
    
    let optionsHTML = `
        <div class="detail-header" style="background: #2c3e50; color: #fff; padding: 15px; text-align: center;">
            <h2 style="margin:0; color:#fff;">🚔 CENTRAL JAIL LOCKUP</h2>
            <span style="font-size: 12px; opacity: 0.9; font-weight: bold; letter-spacing: 0.5px;">
                ⚠️ CONFINEMENT REMAINING: ${player.jailWaitCounter} ROUNDS
            </span>
        </div>
        <div class="detail-body" style="padding: 20px; text-align: center;">
            <p style="font-size: 14px; color:#333; margin-bottom: 15px;">Choose an action for this round:</p>
            <div class="jail-options-list" style="display: flex; flex-direction: column; gap: 10px;">
                
                <button onclick="window.payJailBailImmediate()" style="width:100%; padding:12px; background:#2ecc71; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                    💸 Pay Immediate Bail (₹50,000) ${player.jailWaitCounter === 3 ? '(Exit Next Round)' : '(Roll Now)'}
                </button>
                
                <button onclick="window.attemptJailEscapeRoll()" style="width:100%; padding:12px; background:#3498db; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                    🎲 Roll for Doubles (Free Escape)
                </button>
                
                <button onclick="window.servePassiveJailRound()" style="width:100%; padding:12px; background:#e67e22; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                    ⏳ Wait Out This Round (Pass Turn)
                </button>

                ${player.jailCards > 0 ? `
                    <button onclick="window.useJailFreeCard()" style="width:100%; padding:12px; background:#9b59b6; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                        🎟️ Use 'Jail Free' Luck Card (${player.jailCards} Available)
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    content.innerHTML = optionsHTML;
    modal.style.display = 'flex';
}

/* Global Window Hooks for Jail Operations */

window.payJailBailImmediate = () => {
    const activeIndex = gameState.currentPlayerIndex;
    const player = gameState.players[activeIndex];
    
    import('./bankLogic.js').then(m => {
        m.bankLogic.processPayment(activeIndex, null, 50000, () => {
            player.isJailed = false;
            
            // Check if this is their first attempt (Counter is still at 3)
            if (player.jailWaitCounter === 3) {
                alert("🤝 Bail settled on 1st round! Release authorized. Your turn will pass, and you can roll normally next round.");
                player.jailWaitCounter = 0; 
                window.closeModalOnly();
                m.bankLogic.endTurnSequence(); // End turn immediately
            } else {
                alert("🤝 Bail settled early! Release authorized. You can roll your dice right now!");
                player.jailWaitCounter = 0;
                window.closeModalOnly();
                
                // Authorize rolling immediately
                if (typeof window.setTurnControlUIMode === "function") {
                    window.setTurnControlUIMode("ROLLING_PHASE");
                } else {
                    const rollBtn = document.getElementById('roll-btn');
                    if (rollBtn) rollBtn.disabled = false;
                }
                m.bankLogic.updateHUDDisplay();
            }
        });
    });
};

window.attemptJailEscapeRoll = () => {
    const activeIndex = gameState.currentPlayerIndex;
    const player = gameState.players[activeIndex];
    
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    alert(`Dice rolled: [${d1}] and [${d2}]`);
    
    import('./bankLogic.js').then(m => {
        if (d1 === d2) {
            player.isJailed = false;
            
            // Check if it was their first turn attempt
            if (player.jailWaitCounter === 3) {
                alert("🎉 Doubles matched on 1st turn! Escape authorized. Your turn will pass, and you roll normally starting next round.");
                player.jailWaitCounter = 0;
                window.closeModalOnly();
                m.bankLogic.endTurnSequence();
            } else {
                alert("🎉 Doubles matched! Escape authorized. Take your immediate roll turn right now!");
                player.jailWaitCounter = 0;
                window.closeModalOnly();
                
                if (typeof window.setTurnControlUIMode === "function") {
                    window.setTurnControlUIMode("ROLLING_PHASE");
                } else {
                    const rollBtn = document.getElementById('roll-btn');
                    if (rollBtn) rollBtn.disabled = false;
                }
                m.bankLogic.updateHUDDisplay();
            }
        } else {
            alert("❌ No match! Escape attempt failed.");
            player.jailWaitCounter -= 1; // Decrement remaining rounds
            
            if (player.jailWaitCounter <= 0) {
                alert(`🔓 You have completed all 3 jail round requirements! You are released and can move normally next turn.`);
                player.isJailed = false;
                player.jailWaitCounter = 0;
            } else {
                alert(`⏳ Remaining custody rounds left: ${player.jailWaitCounter}`);
            }
            
            window.closeModalOnly();
            m.bankLogic.endTurnSequence(); 
        }
    });
};

window.servePassiveJailRound = () => {
    const activeIndex = gameState.currentPlayerIndex;
    const player = gameState.players[activeIndex];

    player.jailWaitCounter -= 1;
    alert(`⏳ Confinement round served. Counter reduced. Remaining rounds left: ${player.jailWaitCounter}`);

    if (player.jailWaitCounter <= 0) {
        alert(`🔓 Sentence fully served! You are released and can move normally starting next turn.`);
        player.isJailed = false;
        player.jailWaitCounter = 0;
    }

    window.closeModalOnly();
    import('./bankLogic.js').then(m => m.bankLogic.endTurnSequence());
};

window.useJailFreeCard = () => {
    const player = gameState.players[gameState.currentPlayerIndex];
    player.jailCards--;
    player.isJailed = false;
    
    import('./bankLogic.js').then(m => {
        if (player.jailWaitCounter === 3) {
            alert("🎟️ Card used on 1st round! Turn passed. Move normally starting next round.");
            player.jailWaitCounter = 0;
            window.closeModalOnly();
            m.bankLogic.endTurnSequence();
        } else {
            alert("🎟️ Card used! You are released. Roll your dice to move normally right now!");
            player.jailWaitCounter = 0;
            window.closeModalOnly();
            
            if (typeof window.setTurnControlUIMode === "function") {
                window.setTurnControlUIMode("ROLLING_PHASE");
            } else {
                const rollBtn = document.getElementById('roll-btn');
                if (rollBtn) rollBtn.disabled = false;
            }
            m.bankLogic.updateHUDDisplay();
        }
    });
};
window.buyPropertyAndPass = (spaceId) => {
    if (typeof window.buyProperty === "function") {
        console.log(`Attempting to buy property with ID: ${spaceId}`);
        window.buyProperty(spaceId);
    }
    console.log("buy done");
    
};

window.payRentAndPass = (fromIndex, toIndex, amount) => {
    bankLogic.processPayment(fromIndex, toIndex, amount, () => {
        // window.forceNextTurn();
    });
};


// window.forceNextTurn = () => {
//     console.log("🎬 Initiating streamlined turn transition from UI...");
    
//     // 1. Close any open dialog views safely
//     const modal = document.getElementById('card-modal');
//     if (modal) modal.style.display = 'none';
    
//     // 2. Reset active flag counters
//     landedActionInModal = false;
    
//     // 3. Route directly into the bank control sequence (DO NOT increment index here!)
//     bankLogic.endTurnSequence();
// };
window.closeModalOnly = () => {
    const modal = document.getElementById('card-modal');
    if (modal) modal.style.display = 'none';
};

window.closeModal = () => {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.style.display = 'none';
        
        // When closing via background click during an active turn, 
        // lock the roll button into the THINKING_PHASE so they can't roll again,
        // but DO NOT skip their turn so they can re-tap the property to buy it.
        if (landedActionInModal) {
            setTurnControlUIMode("THINKING_PHASE"); 
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
               // 1. Check if an active Luck/Fate card is waiting
                if (typeof window.executeLandedCardAction === 'function') {
                    console.log("Luck/Fate card closed via background. Auto-executing action...");
                    
                    const actionToRun = window.executeLandedCardAction;
                    window.executeLandedCardAction = null; // Disarm immediately
                    
                    actionToRun(); // This runs financial logic, which safely closes the modal internally!
                } 
                // 2. Otherwise, treat it like a normal property background click
                else {
                    window.closeModal();
                }
            }
        });
    }
});

//if clicl on outside cdard then it close the card and we can not buy  or pass and because of that we can not roll the dice 
// second in  income tax and waleth tax same if we click in background then it chnage turn and not deduct the money .
// this is testing cheat code .
// what we can do we can disable backrouf touch that the easy way to solve this problem but i want to solve this problem without disable the background touch because if we disable the background touch then we can not click on background to close the card and that is also a problem so i want to solve this problem without disable the background touch and also we can click on background to close the card and also we can not change the turn when we click on background and also we can not buy or pass when we click on background so how we can do this .
// // 1. Drain the current player's money to ₹0 to force a crisis
// gameState.players[gameState.currentPlayerIndex].balance = 0;
// bankLogic.updateHUDDisplay();

// // 2. Force land them on Space Index 5 (or whatever your Tax index is)
// bankLogic.handleLanding(30);