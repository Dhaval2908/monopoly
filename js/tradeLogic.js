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
        this.populateContractPropertyDropdown(); 
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

        // Listen for checkbox changes to update labels dynamically without wiping out retained properties
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

    populateContractPropertyDropdown() {
        const select = document.getElementById('contract-property-select');
        if (!select) return;
        
        const previousSelection = select.value;
        select.innerHTML = '<option value="">-- Choose Property --</option>';

        const activePlayerIndex = gameState.currentPlayerIndex;
        const activePlayerId = gameState.players[activePlayerIndex].id;
        const targetId = parseInt(document.getElementById('trade-target-select').value);
        const targetPlayerIndex = gameState.players.findIndex(p => p.id === targetId);

        // Find out what is actively checked for deed transfer
        const yourCheckedOffered = Array.from(document.getElementById('your-trade-assets').querySelectorAll('.asset-transfer-checkbox:checked')).map(cb => parseInt(cb.value));
        const theirCheckedDemanded = Array.from(document.getElementById('their-trade-assets').querySelectorAll('.asset-transfer-checkbox:checked')).map(cb => parseInt(cb.value));

        boardData.forEach((space, index) => {
            const currentOwnerIndex = gameState.ownership[index];
            
            // Limit choices strictly to items owned by the two players currently making the transaction
            if (Number(currentOwnerIndex) !== Number(activePlayerIndex) && Number(currentOwnerIndex) !== Number(targetPlayerIndex)) return;

            let futureOwnerId;
            let statusLabel = "";

            if (Number(currentOwnerIndex) === Number(activePlayerIndex)) {
                // Property is yours
                if (yourCheckedOffered.includes(space.id)) {
                    futureOwnerId = targetId;
                    statusLabel = "Giving to Them";
                } else {
                    futureOwnerId = activePlayerId;
                    statusLabel = "Keeping (Your Asset)";
                }
            } else {
                // Property is theirs
                if (theirCheckedDemanded.includes(space.id)) {
                    futureOwnerId = activePlayerId;
                    statusLabel = "Taking to Yours";
                } else {
                    futureOwnerId = targetId;
                    statusLabel = "They Keep (Their Asset)";
                }
            }

            const opt = document.createElement('option');
            opt.value = space.id;
            opt.dataset.futureOwnerId = futureOwnerId; 
            opt.innerText = `${space.name} [${statusLabel}]`;
            
            select.appendChild(opt);
        });

        if (previousSelection && select.querySelector(`option[value="${previousSelection}"]`)) {
            select.value = previousSelection;
        }
    },

    syncCovenantUIList() {
        const displayList = document.getElementById('active-covenants-list');
        if (!displayList) return;
        displayList.innerHTML = '';

        this.proposedCovenants.forEach(c => {
            const row = document.createElement('div');
            row.id = `cov-item-row-${c.propertyId}`;
            row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 6px 10px; border-radius: 4px; border: 1px solid #cbd5e1; font-size: 11px; margin-bottom:4px;";
            
            let labelText = `📍 <b>${c.propertyName}</b>: `;
            if (c.profitShare > 0) labelText += `📊 ${c.profitShare}% Split `;
            if (c.rentFreeTurns > 0) labelText += `🎟️ ${c.rentFreeTurns}x Free `;

            row.innerHTML = `
                <span>${labelText}</span>
                <button type="button" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:14px; padding:0 4px;">×</button>
            `;

            row.querySelector('button').onclick = () => {
                this.proposedCovenants = this.proposedCovenants.filter(cov => cov.propertyId !== c.propertyId);
                row.remove();
            };
            displayList.appendChild(row);
        });
    },

    setupCovenantButtonAction() {
        const addBtn = document.getElementById('add-covenant-row-btn');
        if (!addBtn) return;

        addBtn.onclick = null; 
        addBtn.onclick = () => {
            const propertySelect = document.getElementById('contract-property-select');
            const profitInput = document.getElementById('contract-profit-share');
            const rentFreeInput = document.getElementById('contract-rent-free');

            const propId = parseInt(propertySelect.value);
            if (!propId) {
                alert("Please select a target property from the dropdown list first.");
                return;
            }

            const profitShare = parseInt(profitInput.value) || 0;
            const rentFreeTurns = parseInt(rentFreeInput.value) || 0;

            if (profitShare === 0 && rentFreeTurns === 0) {
                alert("Please specify a Profit Share % or Rent-Free count.");
                return;
            }

            if (this.proposedCovenants.some(c => c.propertyId === propId)) {
                alert("A condition clause has already been appended to this property.");
                return;
            }

            const targetProp = boardData.find(s => s.id === propId);
            const selectedOpt = propertySelect.options[propertySelect.selectedIndex];
            const futureOwnerId = parseInt(selectedOpt.dataset.futureOwnerId);
            
            const activePlayerId = gameState.players[gameState.currentPlayerIndex].id;
            const targetId = parseInt(document.getElementById('trade-target-select').value);

            // Beneficiary is whoever DOES NOT own the asset at the end of the deal
            const beneficiaryId = (futureOwnerId === activePlayerId) ? targetId : activePlayerId;

            this.proposedCovenants.push({
                propertyId: propId,
                propertyName: targetProp.name,
                futureOwnerId: futureOwnerId,
                beneficiaryId: beneficiaryId,
                partnerId: beneficiaryId,
                profitShare: Math.min(100, Math.max(0, profitShare)),
                rentFreeTurns: Math.max(0, rentFreeTurns)
            });

            this.syncCovenantUIList();

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
            proposerId: activePlayer.id,
            receiverId: targetPlayer.id,
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
        const receiver = gameState.players.find(pl => pl.id === p.receiverId);
        document.getElementById('trade-review-headline').innerText = `🚨 DEAL REVIEW FOR ${receiver.icon}`;

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
            if (c.beneficiaryId === p.receiverId) {
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
            if (c.beneficiaryId === p.proposerId) {
                let perkText = `<div class="review-item" style="color:#b91c1c; font-weight:bold;">📜 Grant Covenant on ${c.propertyName}:`;
                if (c.profitShare > 0) perkText += ` [Give ${c.profitShare}% Split]`;
                if (c.rentFreeTurns > 0) perkText += ` [Give ${c.rentFreeTurns}x Free]`;
                perkText += `</div>`;
                givingList.innerHTML += perkText;
            }
        });

        if (receivingList.innerHTML === '') receivingList.innerText = 'Nothing';
        if (givingList.innerHTML === '') givingList.innerText = 'Nothing';

        this.setupReviewActionButtons();
    },

    setupReviewActionButtons() {
        let btnContainer = document.getElementById('trade-review-actions-container');
        
        if (btnContainer) {
            btnContainer.innerHTML = `
                <button id="trade-accept-btn" style="background:#10b981; color:#fff; padding:8px 16px; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Accept</button>
                <button id="trade-counter-btn" style="background:#f59e0b; color:#fff; padding:8px 16px; border:none; border-radius:4px; font-weight:bold; cursor:pointer; margin: 0 6px;">Counter Deal</button>
                <button id="trade-decline-btn" style="background:#ef4444; color:#fff; padding:8px 16px; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Decline</button>
            `;
        }

        const acceptBtn = document.getElementById('trade-accept-btn');
        const counterBtn = document.getElementById('trade-counter-btn');
        const declineBtn = document.getElementById('trade-decline-btn');

        if (acceptBtn) acceptBtn.onclick = () => this.executeTradeDeal();
        if (declineBtn) declineBtn.onclick = () => { alert("Deal declined."); this.closePanel(); };
        if (counterBtn) counterBtn.onclick = () => this.initiateCounterProposal();
    },

    initiateCounterProposal() {
        const p = this.currentProposal;
        if (!p) return;

        const originalProposerIndex = gameState.players.findIndex(pl => pl.id === p.proposerId);
        const originalReceiverIndex = gameState.players.findIndex(pl => pl.id === p.receiverId);
        
        gameState.currentPlayerIndex = originalReceiverIndex;

        document.getElementById('trade-setup-view').style.display = 'flex';
        document.getElementById('trade-review-view').style.display = 'none';

        const partnerSelect = document.getElementById('trade-target-select');
        this.populatePartnersList();
        partnerSelect.value = p.proposerId;

        this.renderAssetSelection();

        p.transferOffered.forEach(id => {
            const cb = document.querySelector(`.asset-transfer-checkbox[value="${id}"]`);
            if (cb) cb.checked = true;
        });
        p.transferDemanded.forEach(id => {
            const cb = document.querySelector(`.asset-transfer-checkbox[value="${id}"]`);
            if (cb) cb.checked = true;
        });

        document.getElementById('your-trade-cash').value = p.demandedCash;
        document.getElementById('their-trade-cash').value = p.offeredCash;

        this.proposedCovenants = p.covenants;
        this.syncCovenantUIList();
        this.populateContractPropertyDropdown();

        alert(`🔄 Counter-offering! You are now negotiating as Player ${p.receiverId}.`);
    },

    executeTradeDeal() {
        const p = this.currentProposal;
        const proposer = gameState.players.find(pl => pl.id === p.proposerId);
        const receiver = gameState.players.find(pl => pl.id === p.receiverId);

        proposer.balance -= p.offeredCash;
        proposer.balance += p.demandedCash;
        receiver.balance += p.offeredCash;
        receiver.balance -= p.demandedCash;

        const proposerIndex = gameState.players.findIndex(pl => pl.id === p.proposerId);
        const receiverIndex = gameState.players.findIndex(pl => pl.id === p.receiverId);

        if (!gameState.contracts) gameState.contracts = {};

        p.transferDemanded.forEach(id => {
            const spaceIndex = boardData.findIndex(s => s.id === id);
            if (spaceIndex === -1) return;
            gameState.ownership[spaceIndex] = proposerIndex;
            delete gameState.contracts[id]; 
            this.updateMapFlag(spaceIndex, proposer.icon);
        });

        p.transferOffered.forEach(id => {
            const spaceIndex = boardData.findIndex(s => s.id === id);
            if (spaceIndex === -1) return;
            gameState.ownership[spaceIndex] = receiverIndex;
            delete gameState.contracts[id]; 
            this.updateMapFlag(spaceIndex, receiver.icon);
        });

        p.covenants.forEach(c => {
            const spaceIndex = boardData.findIndex(s => s.id === c.propertyId);
            const finalOwnerIndex = gameState.ownership[spaceIndex];
            const finalOwnerId = gameState.players[finalOwnerIndex].id;

            const partnerId = (finalOwnerId === p.proposerId) ? p.receiverId : p.proposerId;

            gameState.contracts[c.propertyId] = {
                profitSharePartnerId: parseInt(partnerId),
                profitSharePercentage: parseInt(c.profitShare) || 0,
                rentFreeAllowances: {}
            };
            if (c.rentFreeTurns > 0) {
                gameState.contracts[c.propertyId].rentFreeAllowances[String(c.beneficiaryId)] = parseInt(c.rentFreeTurns);
            }
        });

        alert("🤝 Deal accepted and executed completely!");
        if (bankLogic && typeof bankLogic.updateHUDDisplay === 'function') bankLogic.updateHUDDisplay();
        this.closePanel();
    },

    updateMapFlag(spaceIndex, icon) {
        const spaceEl = document.getElementById(`space-${spaceIndex}`);
        if (spaceEl) {
            let flag = spaceEl.querySelector('.owner-flag') || document.createElement('div');
            flag.className = 'owner-flag';
            flag.innerText = icon;
            if (!spaceEl.querySelector('.owner-flag')) spaceEl.appendChild(flag);
        }
    }
};