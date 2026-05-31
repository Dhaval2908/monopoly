// js/moveLogic.js
import { gameState } from './gameState.js';
import { bankLogic } from './bankLogic.js';

export async function movePlayer(steps) {
    gameState.isMoving = true;
    const player = gameState.players[gameState.currentPlayerIndex];
    const token = document.getElementById(`p${player.id}`);

    // Break free from jail handling if rolling
    if (player.isJailed) {
        player.isJailed = false;
        alert("🔓 You cleared your traffic dues and left the Police Station!");
    }

    for (let i = 0; i < steps; i++) {
        player.position = (player.position + 1) % 40;
        
        // Pass START Salary logic
        if (player.position === 0) {
            player.balance += 200000;
            alert(`🚩 Passed START! Collected salary bonus of ₹2,00,000`);
            bankLogic.updateHUDDisplay();
        }

        const target = document.getElementById(`space-${player.position}`);

        await gsap.to(token, { y: -30, scale: 1.3, duration: 0.15, ease: "power1.out" });
        target.appendChild(token);
        
        // Dynamic alignment inside target space
        adjustTokenPositions(target);

        await gsap.to(token, { y: 0, scale: 1, duration: 0.1, ease: "bounce.out" });
    }

    gameState.isMoving = false;
    
    // Evaluate choices on land
    bankLogic.handleLanding(player.position);
}

function adjustTokenPositions(spaceElement) {
    const tokens = spaceElement.querySelectorAll('.player');
    if (tokens.length <= 1) {
        if (tokens[0]) { tokens[0].style.transform = 'translate(0, 0)'; }
        return;
    }
    // Distribute tokens inside grid layouts elegantly
    const offsets = [
        {x: '-8px', y: '8px'},  {x: '8px', y: '8px'},
        {x: '-8px', y: '-8px'}, {x: '8px', y: '-8px'}
    ];
    tokens.forEach((t, index) => {
        const offset = offsets[index % offsets.length];
        t.style.position = 'absolute';
        t.style.left = '50%';
        t.style.top = '50%';
        t.style.transform = `translate(calc(-50% + ${offset.x}), calc(-50% + ${offset.y}))`;
    });
}