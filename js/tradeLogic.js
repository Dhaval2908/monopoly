import { gameState } from './gameState.js';
import { boardData } from './data.js';
import { bankLogic } from './bankLogic.js';

export const tradeLogic = {
    currentProposal: null,
    proposedCovenants: [], 

    openPanel() {
        const modal = document.getElementById('trade-modal');
        if (!modal) return;

        document.getElementById('trade-setup-view').style.display = 'flex';
        document.getElementById('trade-review-view').style.display = 'none';

        this.proposedCovenants = []; 
        const displayList = document.getElementById('active-covenants-list');
        if (displayList) displayList.innerHTML = '';

        this.populatePartnersList();
        this.renderAssetSelection();
        this.populateContractPropertyDropdown(); // Initial population
        this.setupCovenantButtonAction(); 

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
        if (!select) return;
        select.innerHTML = '';
        
        const activePlayer = gameState.players[gameState.currentPlayerIndex];
        
        gameState.players.forEach(p => {
            if (p.id !== activePlayer.id) {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.innerText = `Player ${p.id} ${p.icon}`;
                select.appendChild(opt);
            }
        });

        select.onchange = () => {
            this.proposedCovenants = [];
            const displayList = document.getElementById('active-covenants-list');
            if (displayList) displayList.innerHTML = '';
            
            this.renderAssetSelection();
            this.populateContractPropertyDropdown();
        };
    },

    renderAssetSelection() {
        const activePlayerIndex = gameState.currentPlayerIndex;
        const targetId = parseInt(document.getElementById('trade-target-select').value);
        const targetPlayerIndex = gameState.players.findIndex(p => p.id === targetId);

        const yourAssetsContainer = document.getElementById('your-trade-assets');
        const theirAssetsContainer = document.getElementById('their-trade-assets');
        
        yourAssetsContainer.innerHTML = '';
        theirAssetsContainer.innerHTML = '';

        boardData.forEach((space, index) => {
            const ownerIndex = gameState.ownership[index];
            if (ownerIndex === undefined || ownerIndex === null) return;

            if (Number(ownerIndex) === Number(activePlayerIndex)) {
                yourAssetsContainer.appendChild(this.createCleanAssetRow(space));
            } else if (Number(ownerIndex) === Number(targetPlayerIndex)) {
                theirAssetsContainer.appendChild(this.createCleanAssetRow(space));
            }
        });

        if (yourAssetsContainer.innerHTML === '') yourAssetsContainer.innerHTML = '<div class="empty-text">No assets owned</div>';
        if (theirAssetsContainer.innerHTML === '') theirAssetsContainer.innerHTML = '<div class="empty-text">No assets owned</div>';

        // 💡 Listen for changes on checkboxes to instantly recalculate valid dropdown options
        const checkboxes = document.querySelectorAll('.asset-transfer-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.populateContractPropertyDropdown();
            });
        });
    },

    createCleanAssetRow(space) {
        const label = document.createElement('label');
        label.className = 'trade-item-checkbox';
        label.style.cssText = "display:flex; align-items:center; gap:8px; padding:6px; cursor:pointer;";
        label.innerHTML = `
            <input type="checkbox" value="${space.id}" class="asset-transfer-checkbox">
            <span style="display:inline-block; width:10px; height:10px; background:${space.color || '#ccc'}; border-radius:2px;"></span>
            <span style="font-size:13px;">${space.name}</span>
        `;
        return label;
    },

    // 💡 UI Optimization: Dynamically controls options based on what properties are changing hands
    populateContractPropertyDropdown() {
        const select = document.getElementById('contract-property-select');
        if (!select) return;
        
        // Save the currently selected value so it doesn't jump around while checking cards
        const previousSelection = select.value;
        select.innerHTML = '<option value="">-- Choose Property --</option>';

        const activePlayerIndex = gameState.currentPlayerIndex;
        const targetId = parseInt(document.getElementById('trade-target-select').value);

        // Figure out what cards are selected to change owners right now
        const checkedAssets = Array.from(document.querySelectorAll('.asset-transfer-checkbox:checked')).map(cb => parseInt(cb.value));

        boardData.forEach((space, index) => {
            const currentOwnerIndex = gameState.ownership[index];
            if (currentOwnerIndex !== activePlayerIndex && currentOwnerIndex !== targetId) return;

            const isChangingHands = checkedAssets.includes(space.id);
            
            // Determine who WILL own the property after this deal processes
            let futureOwnerId;
            let statusLabel = "";

            if (currentOwnerIndex === activePlayerIndex) {
                // Yours originally
                futureOwnerId = isChangingHands ? targetId : gameState.players[activePlayerIndex].id;
                statusLabel = isChangingHands ? "Giving to Them" : "Keeping Yours";
            } else {
                // Theirs originally
                futureOwnerId = isChangingHands ? gameState.players[activePlayerIndex].id : targetId;
                statusLabel = isChangingHands ? "Taking to Yours" : "Staying Theirs";
            }

            // Create option item
            const opt = document.createElement('option');
            opt.value = space.id;
            opt.dataset.futureOwnerId = futureOwnerId; // Store metadata safely
            opt.innerText = `${space.name} [⚡ ${statusLabel}]`;
            
            select.appendChild(opt);
        });

        // Restore selection if it still exists
        if (previousSelection) {
            select.value = previousSelection;
        }
    },

    setupCovenantButtonAction() {
        const addBtn = document.getElementById('add-covenant-row-btn');
        if (!addBtn) return;

        addBtn.onclick = null; // Unbind
        addBtn.onclick = () => {
            const propertySelect = document.getElementById('contract-property-select');
            const profitInput = document.getElementById('contract-profit-share');
            const rentFreeInput = document.getElementById('contract-rent-free');
            const displayList = document.getElementById('active-covenants-list');

            const propId = parseInt(propertySelect.value);
            if (!propId) {
                alert("Please select a target property from the dropdown list first.");
                return;
            }

            const profitShare = parseInt(profitInput.value) || 0;
            const rentFreeTurns = parseInt(rentFreeInput.value) || 0;

            if (profitShare === 0 && rentFreeTurns === 0) {
                alert("Please specify a Profit Share % or Rent-Free count to establish a deal covenant.");
                return;
            }

            if (this.proposedCovenants.some(c => c.propertyId === propId)) {
                alert("A condition clause has already been appended to this property. Delete it below to override.");
                return;
            }

            const targetProp = boardData.find(s => s.id === propId);
            
            // Grab future metadata from our dynamic options selector!
            const selectedOpt = propertySelect.options[propertySelect.selectedIndex];
            const futureOwnerId = parseInt(selectedOpt.dataset.futureOwnerId);
            
            const activePlayerId = gameState.players[gameState.currentPlayerIndex].id;
            const targetId = parseInt(document.getElementById('trade-target-select').value);

            // 💡 Smart Core Calculation Logic: 
            // The person receiving the benefit/perk is always the person who does NOT own the land!
            const beneficiaryId = (futureOwnerId === activePlayerId) ? targetId : activePlayerId;
            const partnerId = beneficiaryId; 

            const covenantData = {
                propertyId: propId,
                propertyName: targetProp.name,
                futureOwnerId: futureOwnerId,
                beneficiaryId: beneficiaryId,
                partnerId: partnerId,
                profitShare: Math.min(100, Math.max(0, profitShare)),
                rentFreeTurns: Math.max(0, rentFreeTurns)
            };

            this.proposedCovenants.push(covenantData);

            const row = document.createElement('div');
            row.id = `cov-item-row-${propId}`;
            row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 6px 10px; border-radius: 4px; border: 1px solid #cbd5e1; font-size: 11px;";
            
            let labelText = `📍 <b>${targetProp.name}</b>: `;
            if (profitShare > 0) labelText += `📊 ${profitShare}% Split `;
            if (rentFreeTurns > 0) labelText += `🎟️ ${rentFreeTurns}x Free `;

            row.innerHTML = `
                <span>${labelText}</span>
                <button type="button" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:14px; padding:0 4px;">×</button>
            `;

            row.querySelector('button').onclick = () => {
                this.proposedCovenants = this.proposedCovenants.filter(c => c.propertyId !== propId);
                row.remove();
            };

            displayList.appendChild(row);

            propertySelect.value = "";
            profitInput.value = "0";
            rentFreeInput.value = "0";
        };
    },

    processProposal() {
        const activePlayer = gameState.players[gameState.currentPlayerIndex];
        const targetId = parseInt(document.getElementById('trade-target-select').value);
        const targetPlayer = gameState.players.find(p => p.id === targetId);

        const transferOfferedIds = Array.from(document.getElementById('your-trade-assets').querySelectorAll('.asset-transfer-checkbox:checked')).map(i => parseInt(i.value));
        const transferDemandedIds = Array.from(document.getElementById('their-trade-assets').querySelectorAll('.asset-transfer-checkbox:checked')).map(i => parseInt(i.value));

        const offerCash = parseInt(document.getElementById('your-trade-cash').value) || 0;
        const demandCash = parseInt(document.getElementById('their-trade-cash').value) || 0;

        if (offerCash > activePlayer.balance) {
            alert("You cannot offer more cash than you possess!");
            return;
        }

        this.currentProposal = {
            proposer: activePlayer,
            receiver: targetPlayer,
            transferOffered: transferOfferedIds,   
            transferDemanded: transferDemandedIds, 
            covenants: [...this.proposedCovenants], 
            offeredCash: offerCash,
            demandedCash: demandCash
        };

        this.showReviewScreen();
    },

    showReviewScreen() {
        document.getElementById('trade-setup-view').style.display = 'none';
        document.getElementById('trade-review-view').style.display = 'flex';

        const p = this.currentProposal;
        document.getElementById('trade-review-headline').innerText = `🚨 DEAL REVIEW FOR ${p.receiver.icon}`;

        const receivingList = document.getElementById('review-receiving-list');
        const givingList = document.getElementById('review-giving-list');

        receivingList.innerHTML = '';
        givingList.innerHTML = '';

        p.transferOffered.forEach(id => {
            const name = boardData.find(s => s.id === id).name;
            receivingList.innerHTML += `<div class="review-item">🏠 <b>Card Deed:</b> ${name}</div>`;
        });
        if (p.offeredCash > 0) {
            receivingList.innerHTML += `<div class="review-item" style="color:#059669; font-weight:bold;">💰 +₹${p.offeredCash.toLocaleString()} Cash</div>`;
        }
        
        p.covenants.forEach(c => {
            if (c.beneficiaryId === p.receiver.id) {
                let perkText = `<div class="review-item" style="color:#7c3aed; font-weight:bold;">📜 Covenant on ${c.propertyName}:`;
                if (c.profitShare > 0) perkText += ` [📊 ${c.profitShare}% Profits]`;
                if (c.rentFreeTurns > 0) perkText += ` [🎟️ ${c.rentFreeTurns}x Free Visits]`;
                perkText += `</div>`;
                receivingList.innerHTML += perkText;
            }
        });

        p.transferDemanded.forEach(id => {
            const name = boardData.find(s => s.id === id).name;
            givingList.innerHTML += `<div class="review-item">🏠 <b>Card Deed:</b> ${name}</div>`;
        });
        if (p.demandedCash > 0) {
            givingList.innerHTML += `<div class="review-item" style="color:#ef4444; font-weight:bold;">💰 -₹${p.demandedCash.toLocaleString()} Cash</div>`;
        }

        p.covenants.forEach(c => {
            if (c.beneficiaryId === p.proposer.id) {
                let perkText = `<div class="review-item" style="color:#b91c1c; font-weight:bold;">📜 Grant Covenant on ${c.propertyName}:`;
                if (c.profitShare > 0) perkText += ` [Give ${c.profitShare}% Split]`;
                if (c.rentFreeTurns > 0) perkText += ` [Give ${c.rentFreeTurns}x Free]`;
                perkText += `</div>`;
                givingList.innerHTML += perkText;
            }
        });

        if (receivingList.innerHTML === '') receivingList.innerText = 'Nothing';
        if (givingList.innerHTML === '') givingList.innerText = 'Nothing';
    },

    executeTradeDeal() {
        const p = this.currentProposal;
        console.log("=== 🤝 PROCESSING STREAMLINED TRADE TRANSACTION ===");

        p.proposer.balance -= p.offeredCash;
        p.proposer.balance += p.demandedCash;
        p.receiver.balance += p.offeredCash;
        p.receiver.balance -= p.demandedCash;

        const proposerIndex = gameState.players.findIndex(player => player.id === p.proposer.id);
        const receiverIndex = gameState.players.findIndex(player => player.id === p.receiver.id);

        if (!gameState.contracts) {
            gameState.contracts = {};
        }

        p.transferDemanded.forEach(id => {
            const spaceIndex = boardData.findIndex(s => s.id === id);
            if (spaceIndex === -1) return;
            
            gameState.ownership[spaceIndex] = proposerIndex;
            delete gameState.contracts[id]; 

            const spaceEl = document.getElementById(`space-${spaceIndex}`);
            if (spaceEl) {
                let flag = spaceEl.querySelector('.owner-flag') || document.createElement('div');
                flag.className = 'owner-flag';
                flag.innerText = p.proposer.icon;
                if (!spaceEl.querySelector('.owner-flag')) spaceEl.appendChild(flag);
            }
        });

        p.transferOffered.forEach(id => {
            const spaceIndex = boardData.findIndex(s => s.id === id);
            if (spaceIndex === -1) return;

            gameState.ownership[spaceIndex] = receiverIndex;
            delete gameState.contracts[id]; 

            const spaceEl = document.getElementById(`space-${spaceIndex}`);
            if (spaceEl) {
                let flag = spaceEl.querySelector('.owner-flag') || document.createElement('div');
                flag.className = 'owner-flag';
                flag.innerText = p.receiver.icon;
                if (!spaceEl.querySelector('.owner-flag')) spaceEl.appendChild(flag);
            }
        });

        // 💡 Process covenants with dynamic post-deal ownership targeting
        p.covenants.forEach(c => {
            const propId = c.propertyId;

            gameState.contracts[propId] = {
                profitSharePartnerId: parseInt(c.partnerId),
                profitSharePercentage: parseInt(c.profitShare) || 0,
                rentFreeAllowances: {}
            };

            if (c.rentFreeTurns > 0) {
                const beneficiaryKey = String(c.beneficiaryId);
                gameState.contracts[propId].rentFreeAllowances[beneficiaryKey] = parseInt(c.rentFreeTurns);
            }
            console.log(`📜 Multi-Covenant registered on Property ID ${propId}:`, gameState.contracts[propId]);
        });

        alert("🤝 Custom multi-property trade deal settled completely!");
        
        if (typeof this.updateHUDDisplay === 'function') {
            this.updateHUDDisplay();
        } else if (bankLogic && typeof bankLogic.updateHUDDisplay === 'function') {
            bankLogic.updateHUDDisplay();
        }
        
        this.closePanel();
    }
};