const boardData = [
    { id: 0, name: "START", type: "corner", price: "Collect ₹2L", color: "", icon: "🚩" },
    { id: 1, name: "Mumbai", type: "property", color: "var(--clr-mumbai)", price: "40k", icon: "🌊" },
    { id: 2, name: "Luck Card", type: "luck", color: "var(--clr-luck)", price: "LUCK", icon: "✨" },
    { id: 3, name: "Guwahati", type: "property", color: "var(--clr-pune)", price: "10k", icon: "🏔️" },
    { id: 4, name: "Income Tax", type: "tax", color: "", price: "20k", icon: "💸" },
    { id: 5, name: "Vande Bharat", type: "transport", color: "var(--clr-transport)", price: "20k", icon: "🚄" },
    { id: 6, name: "Delhi", type: "property", color: "var(--clr-delhi)", price: "30k", icon: "🏛️" },
    { id: 7, name: "Fate Card", type: "fate", color: "var(--clr-luck)", price: "FATE", icon: "🃏" },
    { id: 8, name: "Ahmedabad", type: "property", color: "var(--clr-chennai)", price: "28k", icon: "🧵" },
    { id: 9, name: "Bengaluru", type: "property", color: "var(--clr-bengaluru)", price: "26k", icon: "💻" },
    { id: 10, name: "Jail", type: "corner", price: "Visiting", color: "", icon: "👮" },
    { id: 11, name: "Kochi", type: "property", color: "var(--clr-kolkata)", price: "24k", icon: "⚓" },
    { id: 12, name: "Electric Co.", type: "utility", color: "var(--clr-utility)", price: "15k", icon: "⚡" },
    { id: 13, name: "Hyderabad", type: "property", color: "var(--clr-mumbai)", price: "22k", icon: "🕌" },
    { id: 14, name: "Chennai", type: "property", color: "var(--clr-delhi)", price: "20k", icon: "🥥" },
    { id: 15, name: "Indigo Air", type: "transport", color: "var(--clr-transport)", price: "20k", icon: "✈️" },
    { id: 16, name: "Kolkata", type: "property", color: "var(--clr-pune)", price: "18k", icon: "🚋" },
    { id: 17, name: "Luck Card", type: "luck", color: "var(--clr-luck)", price: "LUCK", icon: "✨" },
    { id: 18, name: "Lucknow", type: "property", color: "var(--clr-bengaluru)", price: "16k", icon: "🥘" },
    { id: 19, name: "Jaipur", type: "property", color: "var(--clr-chennai)", price: "14k", icon: "🏰" },
    { id: 20, name: "Chai Break", type: "corner", price: "Free", color: "", icon: "☕" },
    { id: 21, name: "Indore", type: "property", color: "var(--clr-kolkata)", price: "12k", icon: "🥙" },
    { id: 22, name: "Fate Card", type: "fate", color: "var(--clr-luck)", price: "FATE", icon: "🃏" },
    { id: 23, name: "Surat", type: "property", color: "var(--clr-mumbai)", price: "10k", icon: "💎" },
    { id: 24, name: "Chandigarh", type: "property", color: "var(--clr-delhi)", price: "10k", icon: "🏢" },
    { id: 25, name: "Air India", type: "transport", color: "var(--clr-transport)", price: "20k", icon: "🛫" },
    { id: 26, name: "Bhopal", type: "property", color: "var(--clr-pune)", price: "8k", icon: "🏞️" },
    { id: 27, name: "Nagpur", type: "property", color: "var(--clr-bengaluru)", price: "8k", icon: "🍊" },
    { id: 28, name: "Water Works", type: "utility", color: "var(--clr-utility)", price: "15k", icon: "🚰" },
    { id: 29, name: "Nashik", type: "property", color: "var(--clr-chennai)", price: "6k", icon: "🍇" },
    { id: 30, name: "Go To Jail", type: "corner", price: "Police", color: "", icon: "🚦" },
    { id: 31, name: "Vizag", type: "property", color: "var(--clr-kolkata)", price: "6k", icon: "⛰️" },
    { id: 32, name: "Patna", type: "property", color: "var(--clr-mumbai)", price: "6k", icon: "📜" },
    { id: 33, name: "Luck Card", type: "luck", color: "var(--clr-luck)", price: "LUCK", icon: "✨" },
    { id: 34, name: "Ranchi", type: "property", color: "var(--clr-delhi)", price: "4k", icon: "🏏" },
    { id: 35, name: "Metro Line", type: "transport", color: "var(--clr-transport)", price: "20k", icon: "🚇" },
    { id: 36, name: "Fate Card", type: "fate", color: "var(--clr-luck)", price: "FATE", icon: "🃏" },
    { id: 37, name: "Madurai", type: "property", color: "var(--clr-pune)", price: "2k", icon: "🛕" },
    { id: 38, name: "Wealth Tax", type: "tax", color: "", price: "10k", icon: "💰" },
    { id: 39, name: "Amritsar", type: "property", color: "var(--clr-bengaluru)", price: "2k", icon: "🕌" }
];
const luckCards = [
    { title: "Jackpot!", msg: "You won a local lottery!", effect: "Gain ₹50,000", icon: "💰" },
    { title: "Tax Refund", msg: "Government returned your overpaid taxes.", effect: "Gain ₹20,000", icon: "🧾" },
    { title: "Birthday Gift", msg: "Every player gives you a treat.", effect: "Gain ₹10,000", icon: "🎂" },
    { title: "Stock Rise", msg: "Your investments in tech grew overnight.", effect: "Gain ₹30,000", icon: "📈" },
    { title: "Inheritance", msg: "A distant relative left you a small fortune.", effect: "Gain ₹1,00,000", icon: "🏰" },
    { title: "Property Value Up", msg: "Real estate market is booming.", effect: "Gain ₹15,000", icon: "🏠" },
    { title: "Found Wallet", msg: "You found a wallet and kept the change.", effect: "Gain ₹5,000", icon: "👛" },
    { title: "Business Bonus", msg: "Your startup hit a milestone.", effect: "Gain ₹40,000", icon: "🚀" },
    { title: "Crypto Moon", msg: "Your 'DesiCoin' just doubled.", effect: "Gain ₹25,000", icon: "🪙" },
    { title: "Award Winner", msg: "You won 'Entrepreneur of the Year'.", effect: "Gain ₹60,000", icon: "🏆" }
];
const fateCards = [
    { title: "Traffic Fine", msg: "Caught overspeeding on the Sea Link.", effect: "Lose ₹10,000", icon: "🚔" },
    { title: "Hospital Bill", msg: "Too much street food! Recovery cost.", effect: "Lose ₹15,000", icon: "🏥" },
    { title: "Market Crash", msg: "The Sensex dropped sharply.", effect: "Lose ₹30,000", icon: "📉" },
    { title: "Repair Work", msg: "Termites found in your property.", effect: "Lose ₹25,000", icon: "🐜" },
    { title: "Luxury Tax", msg: "New government policy on luxury items.", effect: "Lose ₹20,000", icon: "💎" },
    { title: "GST Dues", msg: "Audit found some unpaid GST.", effect: "Lose ₹40,000", icon: "📑" },
    { title: "Phone Screen Broke", msg: "Dropped your phone at a party.", effect: "Lose ₹5,000", icon: "📱" },
    { title: "Rain Damage", msg: "Monsoon floods damaged your office.", effect: "Lose ₹50,000", icon: "⛈️" },
    { title: "Donation", msg: "Charity drive at your local club.", effect: "Lose ₹10,000", icon: "🤝" },
    { title: "Bad Investment", msg: "Your friend's 'Idea' failed.", effect: "Lose ₹20,000", icon: "📉" }
];

const buildingRules = {
    housePrice: "₹10,000",
    hotelPrice: "₹20,000",
    mortgage: "50% of Price"
};

const rotations = [
    { x: 0, y: 0 },          // 1: Front
    { x: 0, y: 180 },        // 2: Back
    { x: 0, y: -90 },        // 3: Right
    { x: 0, y: 90 },         // 4: Left
    { x: -90, y: 0 },        // 5: Top
    { x: 90, y: 0 }          // 6: Bottom
];
const dicePips = [
    [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]
];

let playerPos = [0, 0];
let currentPlayer = 0;
let isMoving = false;

function createDice() {
    const cubes = [document.getElementById('cube1'), document.getElementById('cube2')];
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    cubes.forEach(cube => {
        faces.forEach((f, i) => {
            const faceDiv = document.createElement('div');
            faceDiv.className = `face ${f}`;
            dicePips[i].forEach(p => {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dot.style.gridArea = `${Math.floor(p/3)+1} / ${(p%3)+1}`;
                faceDiv.appendChild(dot);
            });
            cube.appendChild(faceDiv);
        });
    });
}

function renderBoard() {
    const board = document.getElementById('game-board');
    boardData.forEach((data, index) => {
        const space = document.createElement('div');
        space.className = 'space';
        space.id = `space-${index}`;

        // Grid Positioning (Keep your existing logic)
        if (index <= 10) space.style.gridArea = `11 / ${11 - index}`;
        else if (index <= 20) space.style.gridArea = `${11 - (index - 10)} / 1`;
        else if (index <= 30) space.style.gridArea = `1 / ${index - 19}`;
        else space.style.gridArea = `${index - 29} / 11`;

        // Click Event for Popup
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
    
    document.getElementById('space-0').innerHTML += `
        <div id="p1" class="player">🛺</div>
        <div id="p2" class="player">🏏</div>
    `;
}

async function move(steps) {
    if (isMoving) return; // Guard clause
    isMoving = true;
    
    // Lock the current player so it doesn't change mid-animation
    const activePlayerIndex = currentPlayer; 
    const token = document.getElementById(`p${activePlayerIndex + 1}`);
    
    for (let i = 0; i < steps; i++) {
        // Update the position for the SPECIFIC player
        playerPos[activePlayerIndex] = (playerPos[activePlayerIndex] + 1) % 40;
        
        const target = document.getElementById(`space-${playerPos[activePlayerIndex]}`);
        
        // Jump animation
        await gsap.to(token, { 
            y: -40, 
            scale: 1.2, 
            duration: 0.15, 
            ease: "power1.out" 
        });
        
        target.appendChild(token);
        
        await gsap.to(token, { 
            y: 0, 
            scale: 1, 
            duration: 0.1, 
            ease: "bounce.out" 
        });
    }

    // ONLY swap turns AFTER the full movement is finished
    currentPlayer = (currentPlayer === 0) ? 1 : 0;
    
    // Update UI
    const nextEmoji = (currentPlayer === 0 ? '🛺' : '🏏');
    document.getElementById('status-msg').innerText = `PLAYER ${currentPlayer + 1} (${nextEmoji}) TURN`;
    
    isMoving = false;
}

// document.getElementById('roll-btn').onclick = () => {
//     if (isMoving) return;
    
//     // 1. Generate the random numbers
//     const d1 = Math.floor(Math.random() * 6) + 1;
//     const d2 = Math.floor(Math.random() * 6) + 1;
//     const totalSteps = d1 + d2;

//     // 2. Animate the cubes
//     // We use "rotationX: '+=1440'" to ensure it always spins forward
//     gsap.to(".cube", {
//         duration: 1.2, // Slightly longer for a smoother feel
//         rotationX: "+=1440", 
//         rotationY: "+=1440",
//         rotationZ: "+=720",
//         ease: "expo.out",
//         onComplete: () => {
//             // 3. SNAP to the exact face for the numbers rolled
//             // This ensures if d1 is 6, the dice actually shows 6
//             gsap.set("#cube1", { 
//                 rotationX: rotations[d1-1].x, 
//                 rotationY: rotations[d1-1].y,
//                 rotationZ: 0 
//             });
//             gsap.set("#cube2", { 
//                 rotationX: rotations[d2-1].x, 
//                 rotationY: rotations[d2-1].y,
//                 rotationZ: 0 
//             });

//             // 4. Update status message immediately so player knows what they got
//             document.getElementById('status-msg').innerText = `ROLLED: ${totalSteps} (${d1} + ${d2})`;

//             // 5. Move the player only after the dice stop
//             setTimeout(() => {
//                 move(totalSteps);
//             }, 300); // Small pause for the player to see the dice
//         }
//     });
// };

document.getElementById('roll-btn').onclick = () => {
    if (isMoving) return; // Prevent clicking while moving
    
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    console.log("--- NEW ROLL ---");
    console.log(`Dice 1: ${d1} (Index: ${d1-1})`);
    console.log(`Dice 2: ${d2} (Index: ${d2-1})`);
    console.log(`Total Steps to Move: ${total}`);
    // -------------------------

    // Spin animation
    // Inside your roll-btn.onclick GSAP animation
gsap.to(".cube", {
    duration: 0.8,
    rotationX: "+=1440",
    rotationY: "+=1440",
    rotationZ: "+=360", // Adds a tumble effect
    ease: "power2.inOut",
    onComplete: () => {
        // Snap to exact face
        gsap.set("#cube1", { 
            rotationX: rotations[d1-1].x, 
            rotationY: rotations[d1-1].y,
            rotationZ: 0 // Reset Z so it sits flat
        });
        gsap.set("#cube2", { 
            rotationX: rotations[d2-1].x, 
            rotationY: rotations[d2-1].y,
            rotationZ: 0 
        });
        
        setTimeout(() => { move(total); }, 400);
    }
});
};
function showCardDetail(data) {
    const modal = document.getElementById('card-modal');
    const content = document.getElementById('detail-card-content');
    content.className = "detail-card";
    
    let detailHTML = '';
    const priceNum = parseInt(data.price.replace('k', '')) || 0;

    if (data.name === "Jail" || data.name === "Police Station") {
        content.classList.add("jail-theme");
        detailHTML = `
            <div class="detail-header" style="background: #2c3e50; color: white;">
                <h2 style="color:white">POLICE STATION 👮</h2>
                <div style="font-size:10px;">JUST VISITING</div>
            </div>
            <div class="detail-body">
                <div class="corner-msg">
                    <p>You are here to meet a friend or settle a fine.</p>
                    <hr>
                    <p><strong>Don't worry!</strong> You are just a visitor. No penalty this time. Relax and enjoy the tea.</p>
                </div>
            </div>
        `;
    }
    // --- CORNER 2: CHAI BREAK (Free Parking) ---
    else if (data.name === "Chai Break") {
        content.classList.add("chai-theme");
        detailHTML = `
            <div class="detail-header" style="background: #e67e22; color: white;">
                <h2 style="color:white">CHAI BREAK ☕</h2>
                <div style="font-size:10px;">FREE PARKING</div>
            </div>
            <div class="detail-body">
                <div class="corner-msg">
                    <p>Take a deep breath! The market is busy, but you found a quiet stall.</p>
                    <hr>
                    <p>Stay here as long as you like. No rent, no taxes, just <strong>kadak chai</strong> and biscuits.</p>
                </div>
            </div>
        `;
    }
    // --- CORNER 3: TRAFFIC JAM (Go To Jail) ---
    else if (data.name === "Go To Jail" || data.name === "Traffic Jam!") {
        content.classList.add("police-theme");
        detailHTML = `
            <div class="detail-header" style="background: #c0392b; color: white;">
                <h2 style="color:white">TRAFFIC JAM! 🚦</h2>
                <div style="font-size:10px;">POLICE IS HERE</div>
            </div>
            <div class="detail-body">
                <div class="corner-msg">
                    <p>Oh no! You broke the signal and got caught in a massive jam.</p>
                    <hr>
                    <p style="color:#c0392b; font-weight:bold;">GO DIRECTLY TO JAIL!</p>
                    <p>Do not pass START. Do not collect ₹2L.</p>
                </div>
            </div>
        `;
    }
    else if (data.type === "luck") {
        const randomCard = luckCards[Math.floor(Math.random() * luckCards.length)];
        content.classList.add("luck-theme");
        detailHTML = `
            <div class="detail-header" style="background: var(--clr-luck); color: white;">
                <h2 style="color:white">${randomCard.title} ${randomCard.icon}</h2>
            </div>
            <div class="detail-body">
                <div class="card-msg">${randomCard.msg}</div>
                <div class="card-reward">${randomCard.effect}</div>
            </div>
        `;
    } 
    else if (data.type === "luck" || data.price === "FATE") { // Handling "Fate Card" name specifically
        const randomCard = fateCards[Math.floor(Math.random() * fateCards.length)];
        content.classList.add("fate-theme");
        detailHTML = `
            <div class="detail-header" style="background: #6c5ce7; color: white;">
                <h2 style="color:white">${randomCard.title} ${randomCard.icon}</h2>
            </div>
            <div class="detail-body">
                <div class="card-msg">${randomCard.msg}</div>
                <div class="card-penalty">${randomCard.effect}</div>
            </div>
        `;
    }
    else if (data.type === "transport") {
        const base = 2500; // Standard base rent for transport
        detailHTML = `
            <div class="detail-header" style="background: #333; color: white;">
                <h2 style="color:white">${data.name}</h2>
                <div style="font-size:10px;">TRANSPORTATION SERVICES</div>
            </div>
            <div class="detail-body">
                <p style="text-align:center; font-size:12px; color:#666;">Rent depends on how many Stations you own.</p>
                <div class="detail-row"><span>Owns 1 Station</span> <span>₹${base}</span></div>
                <div class="detail-row"><span>Owns 2 Stations</span> <span>₹${base * 2}</span></div>
                <div class="detail-row"><span>Owns 3 Stations</span> <span>₹${base * 4}</span></div>
                <div class="detail-row"><span>Owns 4 Stations</span> <span>₹${base * 8}</span></div>
            </div>
            <div class="detail-footer">Mortgage Value: ₹${(priceNum * 1000) / 2}</div>
        `;
    } 
    // --- BRANCH 2: UTILITY CARDS (Electric Co. / Water Works) ---
    else if (data.type === "utility") {
        detailHTML = `
            <div class="detail-header" style="background: #f1c40f;">
                <h2>${data.name}</h2>
                <div style="font-size:10px;">PUBLIC UTILITY</div>
            </div>
            <div class="detail-body">
                <p style="text-align:center; font-size:12px; margin-bottom:15px;">Rent is based on Dice Roll.</p>
                <div class="detail-row" style="border:none">
                    <span style="width:100%; text-align:center;">
                        If 1 Utility is owned:<br>
                        <strong>4x the amount shown on dice</strong>
                    </span>
                </div>
                <div class="detail-row" style="border:none; margin-top:10px;">
                    <span style="width:100%; text-align:center;">
                        If BOTH Utilities are owned:<br>
                        <strong>10x the amount shown on dice</strong>
                    </span>
                </div>
            </div>
            <div class="detail-footer">Mortgage Value: ₹${(priceNum * 1000) / 2}</div>
        `;
    }
    // --- BRANCH 3: REGULAR PROPERTIES (Mumbai, Delhi, etc.) ---
    else if (data.type === "property") {
        const baseRent = priceNum * 100;
        detailHTML = `
            <div class="detail-header" style="background: ${data.color}">
                <h2>${data.name}</h2>
                <div style="font-size:10px;">TITLE DEED</div>
            </div>
            <div class="detail-body">
                <div class="detail-row"><span>RENT Alone</span> <span>₹${baseRent}</span></div>
                <div class="detail-row"><span>With 1 House</span> <span>₹${baseRent * 4}</span></div>
                <div class="detail-row"><span>With 2 Houses</span> <span>₹${baseRent * 12}</span></div>
                <div class="detail-row"><span>With 3 Houses</span> <span>₹${baseRent * 28}</span></div>
                <div class="detail-row"><span>With HOTEL</span> <span>₹${baseRent * 50}</span></div>
            </div>
            <div class="detail-footer">
                Houses cost ₹${priceNum * 200} each<br>
                Mortgage Value: ₹${(priceNum * 1000) / 2}
            </div>
        `;
    } else {
        return; // Don't show modal for START, Jail, Luck, etc.
    }

    content.innerHTML = detailHTML;
    modal.style.display = 'flex';

    // Same Smooth Animation
    gsap.killTweensOf(".detail-card");
    gsap.fromTo(".detail-card", 
        { opacity: 0, scale: 0.8, rotationX: 20, y: 50 },
        { opacity: 1, scale: 1, rotationX: 0, y: 0, duration: 0.5, ease: "expo.out", force3D: true }
    );
}

// Smooth Closing
document.getElementById('card-modal').onclick = (e) => {
    if (e.target.id === 'card-modal') {
        gsap.to(".detail-card", { 
            opacity: 0, 
            scale: 0.9, 
            y: 30, 
            duration: 0.3, 
            ease: "power2.in",
            onComplete: () => {
                document.getElementById('card-modal').style.display = 'none';
            }
        });
    }
};
window.onload = () => { createDice(); renderBoard(); };