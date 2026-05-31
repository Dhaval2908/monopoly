// js/data.js

const boardData = [
    { id: 0, name: "START", type: "corner", price: "Collect ₹2L", color: "", icon: "🚩" },
    { id: 1, name: "Mumbai", type: "property", color: "var(--clr-mumbai)", price: "450k", icon: "🌊" },
    { id: 2, name: "Luck Card", type: "luck", color: "var(--clr-luck)", price: "LUCK", icon: "✨" },
    { id: 3, name: "Guwahati", type: "property", color: "var(--clr-pune)", price: "120k", icon: "🏔️" },
    { id: 4, name: "Income Tax", type: "tax", color: "", price: "150k", icon: "💸" },
    { id: 5, name: "Vande Bharat", type: "transport", color: "var(--clr-transport)", price: "200k", icon: "🚄" },
    { id: 6, name: "Delhi", type: "property", color: "var(--clr-delhi)", price: "400k", icon: "🏛️" },
    { id: 7, name: "Fate Card", type: "fate", color: "var(--clr-luck)", price: "FATE", icon: "🃏" },
    { id: 8, name: "Ahmedabad", type: "property", color: "var(--clr-chennai)", price: "320k", icon: "🧵" },
    { id: 9, name: "Bengaluru", type: "property", color: "var(--clr-bengaluru)", price: "350k", icon: "💻" },
    { id: 10, name: "Jail", type: "corner", price: "Visiting", color: "", icon: "👮" },
    { id: 11, name: "Kochi", type: "property", color: "var(--clr-kolkata)", price: "280k", icon: "⚓" },
    { id: 12, name: "Electric Co.", type: "utility", color: "var(--clr-utility)", price: "150k", icon: "⚡" },
    { id: 13, name: "Hyderabad", type: "property", color: "var(--clr-mumbai)", price: "300k", icon: "🕌" },
    { id: 14, name: "Chennai", type: "property", color: "var(--clr-delhi)", price: "320k", icon: "🥥" },
    { id: 15, name: "Indigo Air", type: "transport", color: "var(--clr-transport)", price: "200k", icon: "✈️" },
    { id: 16, name: "Kolkata", type: "property", color: "var(--clr-pune)", price: "260k", icon: "🚋" },
    { id: 17, name: "Luck Card", type: "luck", color: "var(--clr-luck)", price: "LUCK", icon: "✨" },
    { id: 18, name: "Lucknow", type: "property", color: "var(--clr-bengaluru)", price: "220k", icon: "🥘" },
    { id: 19, name: "Jaipur", type: "property", color: "var(--clr-chennai)", price: "200k", icon: "🏰" },
    { id: 20, name: "Chai Break", type: "corner", price: "Free", color: "", icon: "☕" },
    { id: 21, name: "Indore", type: "property", color: "var(--clr-kolkata)", price: "180k", icon: "🥙" },
    { id: 22, name: "Fate Card", type: "fate", color: "var(--clr-luck)", price: "FATE", icon: "🃏" },
    { id: 23, name: "Surat", type: "property", color: "var(--clr-mumbai)", price: "180k", icon: "💎" },
    { id: 24, name: "Chandigarh", type: "property", color: "var(--clr-delhi)", price: "160k", icon: "🏢" },
    { id: 25, name: "Air India", type: "transport", color: "var(--clr-transport)", price: "200k", icon: "🛫" },
    { id: 26, name: "Bhopal", type: "property", color: "var(--clr-pune)", price: "140k", icon: "🏞️" },
    { id: 27, name: "Nagpur", type: "property", color: "var(--clr-bengaluru)", price: "140k", icon: "🍊" },
    { id: 28, name: "Water Works", type: "utility", color: "var(--clr-utility)", price: "150k", icon: "🚰" },
    { id: 29, name: "Nashik", type: "property", color: "var(--clr-chennai)", price: "120k", icon: "🍇" },
    { id: 30, name: "Go To Jail", type: "corner", price: "Police", color: "", icon: "🚦" },
    { id: 31, name: "Vizag", type: "property", color: "var(--clr-kolkata)", price: "100k", icon: "⛰️" },
    { id: 32, name: "Patna", type: "property", color: "var(--clr-mumbai)", price: "100k", icon: "📜" },
    { id: 33, name: "Luck Card", type: "luck", color: "var(--clr-luck)", price: "LUCK", icon: "✨" },
    { id: 34, name: "Ranchi", type: "property", color: "var(--clr-delhi)", price: "80k", icon: "🏏" },
    { id: 35, name: "Metro Line", type: "transport", color: "var(--clr-transport)", price: "200k", icon: "🚇" },
    { id: 36, name: "Fate Card", type: "fate", color: "var(--clr-luck)", price: "FATE", icon: "🃏" },
    { id: 37, name: "Madurai", type: "property", color: "var(--clr-pune)", price: "60k", icon: "🛕" },
    { id: 38, name: "Wealth Tax", type: "tax", color: "", price: "100k", icon: "💰" },
    { id: 39, name: "Amritsar", type: "property", color: "var(--clr-bengaluru)", price: "60k", icon: "🕌" }
];

const luckCards = [
    { title: "Jackpot!", msg: "You won a local lottery!", effect: "Gain ₹1,50,000", icon: "💰" },
    { title: "Tax Refund", msg: "Government returned your overpaid taxes.", effect: "Gain ₹50,000", icon: "🧾" },
    { title: "Angel Investment", msg: "A venture capitalist funded your business idea.", effect: "Gain ₹2,00,000", icon: "🚀" },
    { title: "Stock Rise", msg: "Your investments in tech grew overnight.", effect: "Gain ₹1,00,000", icon: "📈" },
    { title: "Inheritance", msg: "A distant relative left you a small fortune.", effect: "Gain ₹3,00,000", icon: "🏰" },
    { title: "Property Dividend", msg: "Commercial tenants cleared their outstanding backlog.", effect: "Gain ₹80,000", icon: "🏠" },
    { title: "Fixed Deposit Matures", msg: "Your high-yield security interest pays out.", effect: "Gain ₹60,000", icon: "🪙" },
    { title: "Consulting Bonus", msg: "Your corporate technical advisory architecture paid off.", effect: "Gain ₹1,20,000", icon: "👔" },
    { title: "Crypto Moon", msg: "Your digital asset reserves surged up.", effect: "Gain ₹75,000", icon: "🪙" },
    { title: "Award Winner", msg: "Won the state innovation challenge grant.", effect: "Gain ₹1,00,000", icon: "🏆" },
    { title: "VIP Access", msg: "You made high-profile government connections.", effect: "Get 1 Free Jail Escape Card", icon: "🎟️" }
];

const fateCards = [
    { title: "Traffic Fine", msg: "Caught overspeeding on the Sea Link freeway.", effect: "Lose ₹40,000", icon: "🚔" },
    { title: "Hospital Bill", msg: "Emergency medical suite treatment cost deductions.", effect: "Lose ₹60,000", icon: "🏥" },
    { title: "Market Crash", msg: "The stock market indices dropped sharply.", effect: "Lose ₹1,50,000", icon: "📉" },
    { title: "Structural Repair", msg: "Urgent engineering work required across properties.", effect: "Lose ₹1,20,000", icon: "🏗️" },
    { title: "Luxury Surcharge", msg: "Retroactive custom assessments levied on luxury imports.", effect: "Lose ₹1,00,000", icon: "💎" },
    { title: "GST Audit Penalty", msg: "Corporate ledger reconciliation identified discrepancies.", effect: "Lose ₹2,00,000", icon: "📑" },
    { title: "Server Server Crash", msg: "Your business servers went down during peak sales hours.", effect: "Lose ₹80,000", icon: "💻" },
    { title: "Monsoon Flood Damage", msg: "Monsoon rain infrastructure breaches damaged warehouses.", effect: "Lose ₹2,50,000", icon: "⛈️" },
    { title: "Legal Fees", msg: "Settled a commercial copyright registration claim.", effect: "Lose ₹1,10,000", icon: "⚖️" },
    { title: "Bad Startup Investment", msg: "Seed capital injected into a failing startup dissolved.", effect: "Lose ₹1,50,000", icon: "📉" },
    { title: "Corporate Fraud", msg: "Tax authorities investigated your shell accounts.", effect: "Go To Jail Immediately", icon: "🚓" }
];

const rotations = [
    { x: 0, y: 0 },   // 1: Front
    { x: 0, y: 180 }, // 2: Back
    { x: 0, y: -90 }, // 3: Right
    { x: 0, y: 90 },  // 4: Left
    { x: -90, y: 0 }, // 5: Top
    { x: 90, y: 0 }   // 6: Bottom
];

const dicePips = [
    [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]
];

export { boardData, luckCards, fateCards, rotations, dicePips };