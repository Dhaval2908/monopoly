// js/uiManager.js
import { boardData, luckCards, fateCards } from './data.js';
import { gameState } from './gameState.js';
import { bankLogic } from './bankLogic.js';

export function showCardDetail(data, isLandedAction = false) {
    const modal = document.getElementById('card-modal');
    const content = document.getElementById('detail-card-content');
    if (!modal || !content) return;
    
    // Reset any inline properties left behind by animations
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

    // --- 1. LUCK / FATE DYNAMIC OBJECT DECK HANDLER (WITH WALLET COUPLING) ---
    if (data.type === "luck" || data.type === "fate") {
        const isLuck = data.type === "luck";
        const deck = isLuck ? luckCards : fateCards;
        const randomCard = deck[Math.floor(Math.random() * deck.length)];
        const cardThemeColor = isLuck ? "#8e44ad" : "#c0392b";
        
        // EXECUTE TRANSACTION ACTION IF LANDED RUNTIME ACTIVATED
        if (isLandedAction) {
            bankLogic.applyCardFinancials(randomCard, isLuck);
        }

        detailHTML = `
            <div class="detail-header" style="background: ${cardThemeColor}; color: #fff; padding: 15px; text-align: center;">
                <h2 style="margin: 0; color: #fff;">${randomCard.icon} ${randomCard.title}</h2>
                <span style="font-size: 11px; opacity: 0.8; letter-spacing: 1px;">${data.type.toUpperCase()} ACTION PERFORMED</span>
            </div>
            <div class="detail-body text-center" style="padding: 20px; text-align: center;">
                <p style="font-size: 16px; margin: 10px 0; color: #2c3e50; font-weight: 500;">"${randomCard.msg}"</p>
                <div style="background: #f8f9fa; border: 2px dashed ${cardThemeColor}; padding: 12px; border-radius: 8px; display: inline-block; margin-top: 10px;">
                    <strong style="color: ${cardThemeColor}; font-size: 15px;">${randomCard.effect}</strong>
                </div>
                <p style="font-size:11px; color:#27ae60; margin-top:12px; font-weight:bold;">✓ Account ledger automatically balanced by Bank.</p>
            </div>
        `;
    }
    // --- 2. CORNER & SPECIAL CARDS ---
    else if (data.type === "corner" || data.type === "tax") {
        let titleColor = "#2c3e50";
        let description = "Follow corporate administrative board rule instructions instantly.";
        
        if (data.name === "START") {
            titleColor = "#27ae60";
            description = "Collect baseline salary allowance of ₹2,0,000 every single time you cycle past.";
        } else if (data.name === "Chai Break") {
            titleColor = "#16a085";
            description = "Relax and unwind at the stall. No fees, no dues, no rent collections—just safe break time.";
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
    // --- 3. STANDARD PROPERTIES ---
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
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>House Construction Cost</span> <span>₹${Math.round(priceNum * 0.4).toLocaleString()} each</span></div>
                ` : `<p style="font-size:11px; color:#7f8c8d; font-style: italic; margin: 10px 0;">Rent rules scale upward proportionally based on total municipal holdings owned.</p>`}
                <div class="detail-row" style="display: flex; justify-content: space-between; margin-top: 4px; font-size:12px; color:#7f8c8d;"><span>Mortgage Value</span> <span>₹${(priceNum / 2).toLocaleString()}</span></div>
            </div>
        `;
    }

    // --- BUTTON OPTIONS FOOTER ---
    if (isLandedAction) {
        if (ownerIndex === undefined && isBuyable) {
            detailHTML += `
                <div class="action-footer-box" style="padding: 12px; background: #f8f9fa; display: flex; gap: 10px;">
                    <button style="flex:1; padding:12px; background:#2ecc71; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.buyProperty(${data.id})">BUY DEED</button>
                    <button style="flex:1; padding:12px; background:#95a5a6; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.passTurn()">PASS TURN</button>
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
                        <button style="flex:1; padding:12px; background:#95a5a6; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.passTurn()">PASS TURN</button>
                    </div>
                `;
            } else {
                detailHTML += `
                    <div style="padding: 15px; text-align:center; background: #f8f9fa;">
                        <p style="color:#27ae60; font-weight:bold; margin:0 0 10px 0;">🏨 Max Hotel infrastructure achieved here!</p>
                        <button style="width:100%; padding:10px; background:#2c3e50; color:#fff; border:none; border-radius:6px; cursor:pointer;" onclick="window.passTurn()">CONTINUE</button>
                    </div>`;
            }
        } 
        else {
            detailHTML += `
                <div style="padding:12px; background: #f8f9fa;">
                    <button style="width:100%; padding:12px; background:#2c3e50; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.passTurn()">CONTINUE</button>
                </div>`;
        }
    } else {
        detailHTML += `
            <div style="padding:12px; background: #f8f9fa;">
                <button style="width:100%; padding:12px; background:#e74c3c; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="window.closeModal()">CLOSE DETAILS</button>
            </div>`;
    }

    content.innerHTML = detailHTML;
    modal.style.display = 'flex';
}

export function handleJailInterventionModal() {
    const modal = document.getElementById('card-modal');
    const content = document.getElementById('detail-card-content');
    if (!modal || !content) return;

    const player = gameState.players[gameState.currentPlayerIndex];
    
    // Safety check: ensure jail properties are initialized
    if (player.jailTurns === undefined) player.jailTurns = 0;
    if (player.jailCards === undefined) player.jailCards = 0;

    content.className = "detail-card jail-theme";
    
    let optionsHTML = `
        <div class="detail-header" style="background: #2c3e50; color: #fff; padding: 15px; text-align: center;">
            <h2 style="margin:0; color:#fff;">🚔 CENTRAL JAIL LOCKUP</h2>
            <span style="font-size: 11px; opacity: 0.8;">TURN ${player.jailTurns + 1} OF 3 IN CONFINEMENT</span>
        </div>
        <div class="detail-body" style="padding: 20px; text-align: center;">
            <p style="font-size: 14px; color:#333;">Select your legal strategy to secure release from the holding block:</p>
            
            <div class="jail-options-list" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                
                <button onclick="window.attemptJailEscapeRoll()" style="width:100%; padding:12px; background:#3498db; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                    🎲 Roll for Doubles (Free Escape)
                </button>
                
                <button onclick="window.payJailBailImmediate()" style="width:100%; padding:12px; background:#2ecc71; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                    💸 Pay Immediate Bail (₹50,000)
                </button>
                
                ${player.jailCards > 0 ? `
                    <button onclick="window.useJailFreeCard()" style="width:100%; padding:12px; background:#9b59b6; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                        🎟️ Use 'Jail Free' Luck Card (${player.jailCards} Available)
                    </button>
                ` : ''}

                <button ${player.jailTurns < 2 ? 'disabled style="background:#bdc3c7; cursor:not-allowed;"' : 'style="background:#e67e22;"'} onclick="window.serveOutFinalJailRound()" style="width:100%; padding:12px; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                    ⏳ ${player.jailTurns < 2 ? `Serve ${2 - player.jailTurns} More Rounds` : 'Serve Third Round & Pay Fine (₹20,000)'}
                </button>
            </div>
        </div>
    `;

    content.innerHTML = optionsHTML;
    modal.style.display = 'flex';
}

// Global actions connected directly to your buttons
window.attemptJailEscapeRoll = () => {
    // Generate two random values for the dice
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    
    alert(`Dice rolled: [${d1}] and [${d2}]`);
    
    if (d1 === d2) {
        alert("🎉 Doubles! Your legal appeal succeeded. You are released from Jail!");
        gameState.players[gameState.currentPlayerIndex].inJail = false;
        gameState.players[gameState.currentPlayerIndex].jailTurns = 0;
        window.closeModal();
    } else {
        alert("❌ Not doubles. Your release request was denied. Your turn passes.");
        gameState.players[gameState.currentPlayerIndex].jailTurns += 1;
        window.closeModal();
        window.passTurn(); // Automatically move to the next player's turn
    }
};

window.payJailBailImmediate = () => {
    const activeIndex = gameState.currentPlayerIndex;
    const success = bankLogic.processPayment(activeIndex, null, 50000);
    
    if (success) {
        alert("🤝 Bail posting processed successfully! Your token is released.");
        gameState.players[activeIndex].inJail = false;
        gameState.players[activeIndex].jailTurns = 0;
        window.closeModal();
    }
};

window.useJailFreeCard = () => {
    const player = gameState.players[gameState.currentPlayerIndex];
    player.jailCards--;
    player.inJail = false;
    player.jailTurns = 0;
    alert("🎟️ Card surrendered to authorities. You are free to move!");
    window.closeModal();
};

window.serveOutFinalJailRound = () => {
    const activeIndex = gameState.currentPlayerIndex;
    const success = bankLogic.processPayment(activeIndex, null, 20000);
    
    if (success) {
        alert("⏳ Sentence served. Minimum processing fee paid. You are released.");
        gameState.players[activeIndex].inJail = false;
        gameState.players[activeIndex].jailTurns = 0;
        window.closeModal();
    }
};

window.closeCardModal = (e) => {
    if (e.target.id === "card-modal") { window.closeModal(); }
};

window.closeModal = () => {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.style.display = 'none';
        const content = document.getElementById('detail-card-content');
        if (content) { content.style.opacity = ""; content.style.transform = ""; }
    }
};