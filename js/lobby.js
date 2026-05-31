import { gameState } from './gameState.js';
import { renderBoard, initTokens } from './main.js';
import { createDice } from './dice.js';

const icons = ["🛺", "🏏", "☕", "🚆", "💻", "🍛", "🏠", "💎"];

export const lobby = {
    setupPlayers(count) {
        const container = document.getElementById('player-input-container');
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            container.innerHTML += `
                <div class="player-config-row">
                    <input type="text" id="p-name-${i}" placeholder="Player ${i+1} Name">
                    <select id="p-icon-${i}">
                        ${icons.map((icon, idx) => `<option value="${icon}" ${idx === i ? 'selected' : ''}>${icon}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        document.getElementById('lobby-step-1').style.display = 'none';
        document.getElementById('lobby-step-2').style.display = 'block';
    },

    startGame() {
        const rows = document.querySelectorAll('.player-config-row');
        const selections = [];
        
        rows.forEach((row, i) => {
            const name = document.getElementById(`p-name-${i}`).value || `Player ${i+1}`;
            const icon = document.getElementById(`p-icon-${i}`).value;
            selections.push({ name, icon });
        });

        // 1. Initialize logic
        gameState.initPlayers(selections);
        
        // 2. Switch screens
        document.getElementById('lobby-screen').style.display = 'none';
        document.getElementById('game-board').style.display = 'grid'; // or 'block'
        
        // 3. Draw game
        requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            console.log("Searching for cubes...");
            renderBoard();
            createDice(); 
            initTokens();
        });
    });
    }
};

// CRITICAL: This makes the functions clickable from HTML
window.lobby = lobby;