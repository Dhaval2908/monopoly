import { gameState } from './gameState.js';
import { boardData } from './data.js';
import { bankLogic } from './bankLogic.js';

export const tradeLogic = {
    currentProposal: null,

    openPanel() {
        const modal = document.getElementById('trade-modal');
        if (!modal) return;

        // Reset display views
        document.getElementById('trade-setup-view').style.display = 'flex';
        document.getElementById('trade-review-view').style.display = 'none';

        this.populatePartnersList();
        this.renderAssetSelection();

        modal.style.display = 'flex';
        gsap.fromTo(".trade-card", 
            { scale: 0.7, opacity: 0, y: 30 }, 
            { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.2)" }
        );
    },

    closePanel() {
        gsap.to(".trade-card", {
            scale: 0.8, opacity: 0, y: 20, duration: 0.2, ease: "power2.in", onComplete: () => {
                document.getElementById('trade-modal').style.display = 'none';
            }
        });
    },

    populatePartnersList() {
        const select = document.getElementById('trade-target-select');
        select.innerHTML = '';
        
        const activePlayer = gameState.players[gameState.currentPlayerIndex];
        
        // Find all players who are not the active rolling player
        gameState.players.forEach(p => {
            if (p.id !== activePlayer.id) {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.innerText = `Player ${p.id} ${p.icon}`;
                select.appendChild(opt);
            }
        });

        // Refresh asset column lists if target choice changes
        select.onchange = () => this.renderAssetSelection();
    },

   renderAssetSelection() {
        // Get current rolling player index and target partner id
        const activePlayerIndex = gameState.currentPlayerIndex;
        const activePlayer = gameState.players[activePlayerIndex];
        
        const targetSelectElement = document.getElementById('trade-target-select');
        if (!targetSelectElement || !targetSelectElement.value) return;

        const targetId = parseInt(targetSelectElement.value);
        // Find the partner player object and their corresponding index in the players array
        const targetPlayerIndex = gameState.players.findIndex(p => p.id === targetId);
        const targetPlayer = gameState.players[targetPlayerIndex];

        if (!targetPlayer || targetPlayerIndex === -1) return;

        document.getElementById('your-trade-title').innerText = `Your Offer (${activePlayer.icon})`;
        document.getElementById('their-trade-title').innerText = `${targetPlayer.icon} Assets`;

        const yourAssetsContainer = document.getElementById('your-trade-assets');
        const theirAssetsContainer = document.getElementById('their-trade-assets');
        
        yourAssetsContainer.innerHTML = '';
        theirAssetsContainer.innerHTML = '';

        // Loop through your board tiles using their index keys
        boardData.forEach((space, index) => {
            // Read ownership directly from your gameState tracking map
            const ownerIndex = gameState.ownership[index];

            // If ownerIndex is undefined or null, nobody owns it
            if (ownerIndex === undefined || ownerIndex === null) return;

            // Match against player index locations
            if (Number(ownerIndex) === Number(activePlayerIndex)) {
                yourAssetsContainer.appendChild(this.createAssetRow(space));
            } else if (Number(ownerIndex) === Number(targetPlayerIndex)) {
                theirAssetsContainer.appendChild(this.createAssetRow(space));
            }
        });

        // UI Placeholders if collections are empty
        if (yourAssetsContainer.innerHTML === '') {
            yourAssetsContainer.innerHTML = '<div style="font-size:11px; color:#94a3b8; font-style:italic; padding:6px;">No assets owned</div>';
        }
        if (theirAssetsContainer.innerHTML === '') {
            theirAssetsContainer.innerHTML = '<div style="font-size:11px; color:#94a3b8; font-style:italic; padding:6px;">No assets owned</div>';
        }
    },
    createAssetRow(space) {
        const label = document.createElement('label');
        label.className = 'trade-item-checkbox';
        label.innerHTML = `
            <input type="checkbox" value="${space.id}" data-name="${space.name}">
            <span style="display:inline-block; width:8px; height:8px; background:${space.color || '#ccc'}; border-radius:2px;"></span>
            ${space.name}
        `;
        return label;
    },

   processProposal() {
        const activePlayer = gameState.players[gameState.currentPlayerIndex];
        const targetId = parseInt(document.getElementById('trade-target-select').value);
        const targetPlayer = gameState.players.find(p => p.id === targetId);

        const offerAssetIds = Array.from(document.getElementById('your-trade-assets').querySelectorAll('input:checked')).map(i => parseInt(i.value));
        const demandAssetIds = Array.from(document.getElementById('their-trade-assets').querySelectorAll('input:checked')).map(i => parseInt(i.value));

        const offerCash = parseInt(document.getElementById('your-trade-cash').value) || 0;
        const demandCash = parseInt(document.getElementById('their-trade-cash').value) || 0;

        // NEW: Pull perk variables out of the input boxes
        const profitSharePercent = Math.min(100, Math.max(0, parseInt(document.getElementById('trade-profit-share').value) || 0));
        const rentFreeTurns = Math.max(0, parseInt(document.getElementById('trade-rent-free').value) || 0);

        if (offerCash > activePlayer.balance) {
            alert("You cannot offer more cash than you possess!");
            return;
        }

        this.currentProposal = {
            proposer: activePlayer,
            receiver: targetPlayer,
            offeredProperties: offerAssetIds,
            demandedProperties: demandAssetIds,
            offeredCash: offerCash,
            demandedCash: demandCash,
            // Store perks safely in the data object payload
            profitShare: profitSharePercent,
            rentFreeCount: rentFreeTurns
        };

        this.showReviewScreen();
    },

    showReviewScreen() {
        document.getElementById('trade-setup-view').style.display = 'none';
        document.getElementById('trade-review-view').style.display = 'flex';

        const p = this.currentProposal;
        document.getElementById('trade-review-headline').innerText = `🚨 ATTENTION ${p.receiver.icon}: TRADE PROPOSAL`;

        const receivingList = document.getElementById('review-receiving-list');
        const givingList = document.getElementById('review-giving-list');

        receivingList.innerHTML = '';
        givingList.innerHTML = '';

        p.offeredProperties.forEach(id => {
            const name = boardData.find(s => s.id === id).name;
            let perksText = '';
            // Show condition terms on review screen if values exist
            if (p.profitShare > 0) perksText += ` (📊 ${p.profitShare}% Rent Share)`;
            if (p.rentFreeCount > 0) perksText += ` (🎟️ ${p.rentFreeCount}x Rent Free)`;
            receivingList.innerHTML += `<div class="review-item">🏢 ${name}${perksText}</div>`;
        });
        if (p.offeredCash > 0) receivingList.innerHTML += `<div class="review-item" style="color:#059669">💰 +₹${p.offeredCash} Cash</div>`;

        p.demandedProperties.forEach(id => {
            const name = boardData.find(s => s.id === id).name;
            givingList.innerHTML += `<div class="review-item">🏢 ${name}</div>`;
        });
        if (p.demandedCash > 0) givingList.innerHTML += `<div class="review-item" style="color:#ef4444">💰 -₹${p.demandedCash} Cash</div>`;

        if (receivingList.innerHTML === '') receivingList.innerText = 'Nothing';
        if (givingList.innerHTML === '') givingList.innerText = 'Nothing';
    },

    executeTradeDeal() {
        const p = this.currentProposal;

        // 1. Cash transfers
        p.proposer.balance -= p.offeredCash;
        p.proposer.balance += p.demandedCash;
        p.receiver.balance += p.offeredCash;
        p.receiver.balance -= p.demandedCash;

        // Find numerical array index mappings for both players inside your state array
        const proposerIndex = gameState.players.findIndex(player => player.id === p.proposer.id);
        const receiverIndex = gameState.players.findIndex(player => player.id === p.receiver.id);

        // 2. Reassigning DEMANDED items (Properties YOU receive)
        p.demandedProperties.forEach(id => {
            const spaceIndex = boardData.findIndex(s => s.id === id);
            if (spaceIndex === -1) return;
            
            const space = boardData[spaceIndex];

            // Update ownership tracking map index values
            gameState.ownership[spaceIndex] = proposerIndex;

            // Clear legacy partnership perks since property ownership changed hands
            delete space.profitSharePartnerId;
            delete space.profitSharePercentage;
            delete space.rentFreeAllowances;

            // Update the physical board UI flag indicator icon
            const spaceEl = document.getElementById(`space-${spaceIndex}`);
            if (spaceEl) {
                let flag = spaceEl.querySelector('.owner-flag') || document.createElement('div');
                flag.className = 'owner-flag';
                flag.innerText = p.proposer.icon;
                if (!spaceEl.querySelector('.owner-flag')) spaceEl.appendChild(flag);
            }
        });

        // 3. Reassigning OFFERED items (Properties THEY receive + Special Deal Perks)
        p.offeredProperties.forEach(id => {
            const spaceIndex = boardData.findIndex(s => s.id === id);
            if (spaceIndex === -1) return;

            const space = boardData[spaceIndex];

            // Update ownership tracking map index values
            gameState.ownership[spaceIndex] = receiverIndex;

            // Apply special advanced partnership contract rules right to the space object
            if (p.profitShare > 0) {
                space.profitSharePartnerId = p.proposer.id; 
                space.profitSharePercentage = p.profitShare;
            }
            if (p.rentFreeCount > 0) {
                space.rentFreeAllowances = space.rentFreeAllowances || {};
                space.rentFreeAllowances[p.proposer.id] = p.rentFreeCount;
            }

            // Update the physical board UI flag indicator icon
            const spaceEl = document.getElementById(`space-${spaceIndex}`);
            if (spaceEl) {
                let flag = spaceEl.querySelector('.owner-flag') || document.createElement('div');
                flag.className = 'owner-flag';
                flag.innerText = p.receiver.icon;
                if (!spaceEl.querySelector('.owner-flag')) spaceEl.appendChild(flag);
            }
        });

        alert("🤝 Partnership agreement signed successfully! Contract perks are live.");
        
        // 4. Force HUD interface updates to refresh cash metrics display text labels
        if (typeof this.updateHUDDisplay === 'function') {
            this.updateHUDDisplay();
        } else if (bankLogic && typeof bankLogic.updateHUDDisplay === 'function') {
            bankLogic.updateHUDDisplay();
        }
        
        this.closePanel();
    },

}