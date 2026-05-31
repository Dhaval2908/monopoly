import { gameState } from './gameState.js';
import { createDice, animateDice } from './dice.js';
import { movePlayer } from './moveLogic.js';
import { boardData } from './data.js';
import { showCardDetail } from './uiManager.js';
import { lobby } from './lobby.js'; // Lobby is usually imported here if needed
import { bankLogic } from './bankLogic.js'; // Bank logic for handling payments, ownership, etc.
import{tradeLogic} from './tradeLogic.js'; // Trade logic for property trading between players

// 1. Export Render Board so Lobby can call it
export function renderBoard() {
    const board = document.getElementById('game-board');
    // board.innerHTML = ''; // Clear board before rendering
    const existingSpaces = board.querySelectorAll('.space');   // Clear
    existingSpaces.forEach(s => s.remove()); // Clear existing spaces to prevent duplicates
    
    boardData.forEach((data, index) => {
        const space = document.createElement('div');
        space.className = 'space';
        space.id = `space-${index}`;

        if (index <= 10) space.style.gridArea = `11 / ${11 - index}`;
        else if (index <= 20) space.style.gridArea = `${11 - (index - 10)} / 1`;
        else if (index <= 30) space.style.gridArea = `1 / ${index - 19}`;
        else space.style.gridArea = `${index - 29} / 11`;

        space.onclick = () => showCardDetail(data);

        const colorBar = data.color ? `<div class="header-bar" style="background:${data.color}"></div>` : '';
        space.innerHTML = `
            ${colorBar}
            <div class="space-info">
                <div class="space-name">${data.name}</div>
                <div class="space-icon">${data.icon}</div>
                <div class="space-price">₹${data.price}</div>
            </div>
        `;
        board.appendChild(space);
    });
}

// 2. NEW: Exported function to place tokens after Lobby selection
export function initTokens() {
    gameState.players.forEach(p => {
        const token = document.createElement('div');
        token.id = `p${p.id}`;
        token.className = 'player'; // Your CSS class for the token
        token.innerText = p.icon;
        
        // Always start at space-0 (START)
        const startSpace = document.getElementById('space-0');
        if (startSpace) startSpace.appendChild(token);
    });
}

// 3. Setup global listeners (Modal, Dice, etc.)
function setupGlobalEvents() {
    const modal = document.getElementById('card-modal');
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'close-modal-btn') {
            closeModal();
        }
    });

    document.getElementById('roll-btn').onclick = () => {
        if (gameState.isMoving) return;
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        
        animateDice(d1, d2, () => {
            movePlayer(d1 + d2);
        });
    };
}

// 4. Close Modal Logic
function closeModal() {
    const modal = document.getElementById('card-modal');
    const content = document.getElementById('detail-card-content');
    if (gsap.isTweening(content)) return;

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

// On Page Load: Just setup events and 3D dice. Wait for Lobby for the rest.
document.addEventListener('DOMContentLoaded', () => {
    setupGlobalEvents();
    // createDice();
});

export function handleDiceRoll(d1, d2) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const isDouble = (d1 === d2);

    // JAIL TURN INTERCEPTION
    if (player.isJailed) {
        if (isDouble) {
            player.isJailed = false;
            player.jailTurns = 0;
            alert("🎲 Double rolled! You break out of Jail for free!");
            gameState.consecutiveDoubles = 0; // Don't award extra turn for escaping via double
            movePlayer(d1 + d2);
        } else {
            player.jailTurns++;
            if (player.jailTurns >= 3) {
                player.balance -= 50000; // Auto fine of 50k
                player.isJailed = false;
                player.jailTurns = 0;
                alert("👮 3 Rounds spent in Jail! Forced to pay a fine of ₹50,000. Proceeding with roll movement.");
                bankLogic.updateHUDDisplay();
                movePlayer(d1 + d2);
            } else {
                alert(`🔒 No double rolled. Turn ${player.jailTurns}/3 spent in isolation.`);
                gameState.consecutiveDoubles = 0;
                bankLogic.endTurnSequence();
            }
        }
        return;
    }

    // SPEEDING/3-DOUBLES RULE
    if (isDouble) {
        gameState.consecutiveDoubles++;
        if (gameState.consecutiveDoubles === 3) {
            alert("🚓 Reckless Speeding! You rolled 3 consecutive doubles. Go directly to Jail!");
            gameState.consecutiveDoubles = 0;
            bankLogic.sendToJail(player);
            return;
        }
        alert(`🎲 Double Rolled! (Streak: ${gameState.consecutiveDoubles}). Take another turn after this walk!`);
    } else {
        gameState.consecutiveDoubles = 0;
    }

    movePlayer(d1 + d2);
}

// JAIL SELECTION ACTIONS AVAILABLE TO UI
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