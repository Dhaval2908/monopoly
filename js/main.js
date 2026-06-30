import { gameState } from './gameState.js';
import { createDice, animateDice } from './dice.js';
import { movePlayer } from './moveLogic.js';
import { boardData } from './data.js';
import { showCardDetail, handleSpaceClick } from './uiManager.js';
import { lobby } from './lobby.js'; 
import { bankLogic } from './bankLogic.js'; 
import { tradeLogic } from './tradeLogic.js'; 

export function renderBoard() {
    const board = document.getElementById('game-board');
    if (!board) return;

    const existingSpaces = board.querySelectorAll('.space');   
    existingSpaces.forEach(s => s.remove()); 
    
    boardData.forEach((data, index) => {
        const space = document.createElement('div');
        space.id = `space-${index}`;
        
        if (index <= 10) space.style.gridArea = `11 / ${11 - index}`;
        else if (index <= 20) space.style.gridArea = `${11 - (index - 10)} / 1`;
        else if (index <= 30) space.style.gridArea = `1 / ${index - 19}`;
        else space.style.gridArea = `${index - 29} / 11`;

        const isCorner = (index === 0 || index === 10 || index === 20 || index === 30);
        space.className = `space ${isCorner ? 'corner-tile' : 'property-tile'}`;

        space.onclick = () => {
            if (typeof handleSpaceClick === 'function') {
                handleSpaceClick(data.id);
            }
        };

        const cityColor = data.color || '#bdc3c7';
        const displayPrice = data.price ? `₹${data.price}` : '';
        const displayIcon = data.icon || '';

        if (isCorner) {
            space.innerHTML = `
                <div class="tile-body corner-body">
                    <div class="tile-name corner-name">${data.name}</div>
                    <div class="tile-icon">${displayIcon}</div>
                    <div class="tile-price">${displayPrice}</div>
                </div>
            `;
        } else {
            space.innerHTML = `
                <div class="tile-color-banner" style="background: ${cityColor} !important;"></div>
                <div class="tile-body">
                    <div class="tile-name">${data.name}</div>
                    <div class="tile-icon">${displayIcon}</div>
                    <div class="tile-price">${displayPrice}</div>
                </div>
            `;
        }

        board.appendChild(space);
    });

    gsap.fromTo(".space", 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.01, ease: "power2.out" }
    );
}

export function initTokens() {
    gameState.players.forEach(p => {
        const token = document.createElement('div');
        token.id = `p${p.id}`;
        token.className = 'player'; 
        token.innerText = p.icon;
        
        const startSpace = document.getElementById('space-0');
        if (startSpace) startSpace.appendChild(token);
    });
}

function setupGlobalEvents() {
    // ---- Card Modal Window Evts ----
    const cardModal = document.getElementById('card-modal');
    if (cardModal) {
        cardModal.onclick = (e) => {
            if (e.target === cardModal || e.target.id === 'close-modal-btn') {
                closeModal();
            }
        };
    }

    // ---- Dice Roll Click Trigger ----
    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) {
        rollBtn.onclick = () => {
            if (gameState.isMoving) return;
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            animateDice(d1, d2, () => {
                handleDiceRoll(d1, d2);
            });
        };
    }

    // ---- Rules Engine Popups ----
    const rulesBtn = document.getElementById('rules-btn');
    const rulesModal = document.getElementById('rules-modal');
    const closeRulesBtn = document.getElementById('close-rules-btn');

    if (rulesBtn && rulesModal) {
        rulesBtn.onclick = () => {
            rulesModal.style.display = 'flex';
            gsap.fromTo(".rules-card-content", 
                { scale: 0.7, opacity: 0, y: 40 }, 
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
            );
        };
    }

    if (rulesModal) {
        rulesModal.onclick = (e) => {
            if (e.target === rulesModal) closeRulesWindow();
        };
    }

    if (closeRulesBtn) {
        closeRulesBtn.onclick = closeRulesWindow;
    }

    // ---- Clean Trade Overlay Wireups ----
    const closeTradeBtn = document.getElementById('close-trade-btn');
    if (closeTradeBtn) closeTradeBtn.onclick = () => tradeLogic.closePanel();

    const submitProposalBtn = document.getElementById('submit-trade-proposal-btn');
    if (submitProposalBtn) submitProposalBtn.onclick = () => tradeLogic.processProposal();

    // 💡 REMOVED: Handlers for accept-trade-btn and decline-trade-btn have been removed from here.
    // They are now entirely managed dynamically by tradeLogic.setupReviewActionButtons() inside your wrapper.

    // Expose trade open context explicitly to match your index.html launcher button assignment
    window.openTradePanel = () => tradeLogic.openPanel();
}

function closeRulesWindow() {
    gsap.to(".rules-card-content", {
        scale: 0.8, opacity: 0, y: 20, duration: 0.25, ease: "power2.in", onComplete: () => {
            document.getElementById('rules-modal').style.display = 'none';
        }
    });
}

function closeModal() {
    const modal = document.getElementById('card-modal');
    const content = document.getElementById('detail-card-content');
    if (!modal || !content || gsap.isTweening(content)) return;

    gsap.to(content, { 
        opacity: 0, 
        scale: 0.9, 
        y: 30, 
        duration: 0.3, 
        ease: "power2.in",
        onComplete: () => {
            modal.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupGlobalEvents();
});

export function handleDiceRoll(d1, d2) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const isDouble = (d1 === d2);
    const rollTotal = d1 + d2;

    // ==========================================
    // 1. HANDLE JAIL ESCAPE LOGIC (IF JAILED)
    // ==========================================
    if (player.isJailed) {
        if (isDouble) {
            player.isJailed = false;
            player.jailTurns = 0;
            alert("🎲 Double rolled! You break out of Jail! Moving forward.");
            gameState.consecutiveDoubles = 0; 
            gameState.lastDoubleValue = null;
            gameState.accumulatedSteps = rollTotal;
            executeStackedMove();
        } else {
            player.jailTurns++;
            if (player.jailTurns >= 3) {
                player.balance -= 50000; 
                player.isJailed = false;
                player.jailTurns = 0;
                alert("👮 3 Rounds in Jail! Forced to pay ₹50,000 fine. Moving forward.");
                if (bankLogic && typeof bankLogic.updateHUDDisplay === 'function') bankLogic.updateHUDDisplay();
                gameState.accumulatedSteps = rollTotal;
                executeStackedMove();
            } else {
                alert(`🔒 No double rolled. Turn ${player.jailTurns}/3 spent in isolation.`);
                gameState.consecutiveDoubles = 0;
                gameState.lastDoubleValue = null;
                gameState.accumulatedSteps = 0;
                if (bankLogic && typeof bankLogic.endTurnSequence === 'function') bankLogic.endTurnSequence();
            }
        }
        return; 
    }

    // ==========================================
    // 2. NORMAL TURN LOGIC (NOT JAILED)
    // ==========================================
    gameState.accumulatedSteps += rollTotal;

    if (isDouble) {
        if (gameState.lastDoubleValue === null) {
            gameState.consecutiveDoubles = 1;
            gameState.lastDoubleValue = rollTotal;
        } else if (gameState.lastDoubleValue === rollTotal) {
            gameState.consecutiveDoubles += 1;
        } else {
            gameState.consecutiveDoubles = 1;
            gameState.lastDoubleValue = rollTotal;
        }
        
        console.log(`🎯 Double Detected! Combo Total: ${rollTotal} (${d1}&${d2}), Streak Count: ${gameState.consecutiveDoubles}`);

        if (gameState.consecutiveDoubles >= 3) {
            alert(`🚓 Triple ${d1}s rolled consecutively! Speeding violation! Go directly to Jail.`);
            gameState.consecutiveDoubles = 0;
            gameState.lastDoubleValue = null;
            gameState.accumulatedSteps = 0; 
            
            if (bankLogic && typeof bankLogic.sendToJail === 'function') {
                bankLogic.sendToJail(player);
            }
            return;
        }

        alert(`🎲 Double Rolled (${d1}&${d2})! Stacked Total: ${gameState.accumulatedSteps} spaces. Roll your BONUS dice!`);
        return; 
    }

    executeStackedMove();
}

function executeStackedMove() {
    const totalMoveAmount = gameState.accumulatedSteps;
    
    gameState.consecutiveDoubles = 0;
    gameState.accumulatedSteps = 0; 

    console.log(`🚀 Rolling chain finished! Moving total of ${totalMoveAmount} spaces.`);
    movePlayer(totalMoveAmount);
}

window.payJailFine = () => {
    const player = gameState.players[gameState.currentPlayerIndex];
    if (player.balance >= 50000) {
        player.balance -= 50000;
        player.isJailed = false;
        player.jailTurns = 0;
        alert("💸 Fine paid! Your record is clear. You can now roll normally next turn.");
        bankLogic.endTurnSequence();
    } else {
        alert("Insufficient funds!");
    }
};

window.useJailFreeCard = () => {
    const player = gameState.players[gameState.currentPlayerIndex];
    if (player.jailCards > 0) {
        player.jailCards--;
        player.isJailed = false;
        player.jailTurns = 0;
        alert("🎫 Used a 'Get Out Of Jail Free' card! Clean escape.");
        bankLogic.endTurnSequence();
    }
};