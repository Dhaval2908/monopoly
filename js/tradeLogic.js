// js/tradeLogic.js
import { gameState } from './gameState.js';

export const tradeLogic = {
    openTradePanel() {
        if (gameState.isMoving) {
            alert("🚨 Cannot trade properties while tokens are actively in motion!");
            return;
        }

        const activeUser = gameState.players[gameState.currentPlayerIndex];
        const targets = gameState.players.filter(p => p.id !== activeUser.id);
        
        if (targets.length === 0) return;

        let options = targets.map(t => `<option value="${t.id}">${t.icon} ${t.name}</option>`).join('');

        let div = document.createElement('div');
        div.id = 'trade-overlay-screen';
        div.className = 'modal-backdrop-blur';
        div.innerHTML = `
            <div class="trade-card-view">
                <h3>🤝 Liquidity Trade Channel</h3>
                <p>Proposing deal from perspective of player ${activeUser.icon}</p>
                <hr>
                <label>Select Target Counterparty:</label>
                <select id="trade-target-user">${options}</select>
                
                <div class="trade-split-grid">
                    <div>
                        <h5>Your Cash Offering</h5>
                        <input type="number" id="trade-send-funds" value="0" min="0">
                    </div>
                    <div>
                        <h5>Their Demanded Cash</h5>
                        <input type="number" id="trade-receive-funds" value="0" min="0">
                    </div>
                </div>
                
                <div class="trade-actions-row">
                    <button class="t-btn confirm" onclick="window.processTradeOffer()">SEND OFFER</button>
                    <button class="t-btn cancel" onclick="document.getElementById('trade-overlay-screen').remove()">CANCEL</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    },

    evaluateProposal() {
        const targetId = parseInt(document.getElementById('trade-target-user').value);
        const sendFunds = parseInt(document.getElementById('trade-send-funds').value) || 0;
        const receiveFunds = parseInt(document.getElementById('trade-receive-funds').value) || 0;

        const sender = gameState.players[gameState.currentPlayerIndex];
        const receiver = gameState.players[targetId];

        if (sender.balance < sendFunds) return alert("Error: Cash injection amount exceeds current available funds wallet!");
        if (receiver.balance < receiveFunds) return alert("Error: Counterparty doesn't hold enough reserves to pay that amount!");

        let approval = confirm(`🔔 incoming Deal Notice for ${receiver.icon} ${receiver.name}!\n\n` + 
            `${sender.name} is offering to pay you ₹${sendFunds.toLocaleString()} in exchange for a payout fee of ₹${receiveFunds.toLocaleString()}.\n\n` +
            `Do you authorize and accept this transaction deal?`);

        if (approval) {
            sender.balance -= sendFunds;
            sender.balance += receiveFunds;
            receiver.balance += sendFunds;
            receiver.balance -= receiveFunds;

            alert("🤝 Deal locked down and finalized! Transferring asset assets across sidebars.");
            import('./bankLogic.js').then(m => m.bankLogic.updateHUDDisplay());
        } else {
            alert("❌ Proposition rejected by counterparty.");
        }
        document.getElementById('trade-overlay-screen').remove();
    }
};

window.openTradePanel = () => tradeLogic.openTradePanel();
window.processTradeOffer = () => tradeLogic.evaluateProposal();