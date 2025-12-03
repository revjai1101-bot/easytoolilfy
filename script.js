/* ============================================================
   GLOBAL PANEL & HISTORY HANDLING (Back Button Fix)
   ============================================================ */

/**
 * Shows a specific tool panel and updates the browser history.
 * @param {string} id - The ID of the tool panel to show (e.g., 'currency').
 */
function showTool(id) {
    document.querySelectorAll(".tool-panel").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
    window.scrollTo(0, 0);

    // 1. Add a new entry to the browser's history
    history.pushState({ tool: id }, "", `/${id}`); 
}

/**
 * Navigates back in the browser's history.
 */
function goBack() {
    // Uses the browser's native back functionality
    history.back();
}

/**
 * Handles browser's back/forward navigation (popstate event).
 */
window.addEventListener('popstate', function(event) {
    // Hide all panels first
    document.querySelectorAll(".tool-panel").forEach(p => p.style.display = "none");

    // Check the history state to see what needs to be displayed
    if (event.state && event.state.tool) {
        // If the state includes a tool ID, show that panel
        const toolId = event.state.tool;
        const panel = document.getElementById(toolId);
        if (panel) {
            panel.style.display = "block";
        }
    } else {
        // If back at the root '/', re-push a disposable state to prevent exiting the site
        setTimeout(() => {
            history.pushState({ tool: null }, "", "/");
        }, 0); 
    }
    
    window.scrollTo(0, 0);
});

// IMPORTANT: Initialize the history state on page load.
history.replaceState({ tool: null }, "", "/");


/* ============================================================
   SEARCH TOOL
   ============================================================ */

document.getElementById("tool-search").addEventListener("input", function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll(".tool-card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(q) ? "block" : "none";
    });
});

/* ============================================================
   CURRENCY CONVERTER + FAVORITES
   ============================================================ */

// WARNING: This API base URL will likely fail since the Vercel API function was removed.
const API_BASE = "https://www.easytoolilfy.com/api/exchange?base="; 

const topCurrencies = [
    "USD","EUR","GBP","JPY","AUD","CAD","SGD","CHF","THB","IDR","CNY","HKD","NZD","SAR",
    "AED","INR","KRW","PHP","VND","BDT","PKR","MMK","BRL","ZAR","SEK","NOK","DKK","PLN",
    "TRY","HUF","EGP","QAR","KWD","BHD","OMR","LKR","NPR","KES","RUB","MXN","ARS","NGN",
    "COP","CLP","CZK","RON","ILS","MAD","MYR"
];

const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const currencyResult = document.getElementById("currencyResult");

/* ===== FAVORITES ===== */
let favFrom = JSON.parse(localStorage.getItem("fav_from")) || [];
let favTo = JSON.parse(localStorage.getItem("fav_to")) || [];

/* ===== BUILD DROPDOWNS ===== */
function buildCurrencyDropdowns() {
    function buildOptions(favorites, target) {
        target.innerHTML = "";

        favorites.forEach(f => {
            target.innerHTML += `<option value="${f}">⭐ ${f}</option>`;
        });

        topCurrencies.forEach(cur => {
            if (!favorites.includes(cur)) {
                target.innerHTML += `<option value="${cur}">${cur}</option>`;
            }
        });
    }

    buildOptions(favFrom, fromCurrency);
    buildOptions(favTo, toCurrency);

    if (!fromCurrency.value) fromCurrency.value = "MYR";
    if (!toCurrency.value) toCurrency.value = "USD";
}

buildCurrencyDropdowns();

/* ===== FAVORITE BUTTONS ===== */
document.getElementById("favFromBtn").addEventListener("click", () => {
    const cur = fromCurrency.value;

    if (!favFrom.includes(cur)) favFrom.push(cur);
    else favFrom = favFrom.filter(c => c !== cur);

    localStorage.setItem("fav_from", JSON.stringify(favFrom));
    buildCurrencyDropdowns();
});

document.getElementById("favToBtn").addEventListener("click", () => {
    const cur = toCurrency.value;

    if (!favTo.includes(cur)) favTo.push(cur);
    else favTo = favTo.filter(c => c !== cur);

    localStorage.setItem("fav_to", JSON.stringify(favTo));
    buildCurrencyDropdowns();
});

/* ===== CONVERT CURRENCY ===== */

document.getElementById("convertBtn").addEventListener("click", convertCurrency);

async function convertCurrency() {
    let amount = document.getElementById("amount").value;
    if (!amount) return currencyResult.innerText = "Enter amount first.";

    try {
        const res = await fetch(API_BASE + fromCurrency.value);
        const data = await res.json();

        if (!data.conversion_rates) {
            currencyResult.innerText = "Error loading currency rates.";
            return;
        }

        const rate = data.conversion_rates[toCurrency.value];
        const converted = amount * rate;

        currencyResult.innerText =
            `${amount} ${fromCurrency.value} = ${converted.toFixed(2)} ${toCurrency.value}`;

    } catch (e) {
        currencyResult.innerText = "Failed — check internet or API.";
    }
}

/* ============================================================
   LIVE MONEY CHANGER TABLE
   ============================================================ */

async function loadMYRTable() {
    const ratesBody = document.getElementById("ratesBody");

    try {
        const res = await fetch(API_BASE + "MYR");
        const data = await res.json();

        ratesBody.innerHTML = "";

        topCurrencies.forEach(cur => {
            if (!data.conversion_rates[cur]) return;

            const rate = data.conversion_rates[cur];
            ratesBody.innerHTML += `
            <tr>
                <td>${cur}</td>
                <td style="text-align:right">${rate.toFixed(4)}</td>
            </tr>`;
        });
    } catch (e) {
        ratesBody.innerHTML = `<tr><td colspan="2">Failed to load…</td></tr>`;
    }
}

/* AUTO REFRESH EVERY 5 MINUTES */
loadMYRTable();
setInterval(loadMYRTable, 5 * 60 * 1000);

/* ============================================================
   UNIT CONVERTER
   ============================================================ */

const unitCategory = document.getElementById("unit-category");
const unitFrom = document.getElementById("unit-from");
const unitTo = document.getElementById("unit-to");
const unitValue = document.getElementById("unit-value");
const unitResult = document.getElementById("unit-result");

const units = {
    length: { m: 1, cm: 100, mm: 1000, km: 0.001, inch: 39.3701, ft: 3.28084, yard: 1.09361 },
    weight: { kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274 },
    temperature: "special",
    speed: { "m/s": 1, "km/h": 3.6, mph: 2.23694, "km/s": 0.001 }
};

function loadUnits() {
    const cat = unitCategory.value;
    unitFrom.innerHTML = "";
    unitTo.innerHTML = "";

    if (cat === "temperature") {
        ["Celsius", "Fahrenheit", "Kelvin"].forEach(u => {
            unitFrom.innerHTML += `<option>${u}</option>`;
            unitTo.innerHTML += `<option>${u}</option>`;
        });
        return;
    }

    Object.keys(units[cat]).forEach(u => {
        unitFrom.innerHTML += `<option value="${u}">${u}</option>`;
        unitTo.innerHTML += `<option value="${u}">${u}</option>`;
    });
}

unitCategory.addEventListener("change", loadUnits);
loadUnits();

function convertUnit() {
    const cat = unitCategory.value;
    const from = unitFrom.value;
    const to = unitTo.value;
    const value = parseFloat(unitValue.value);

    if (isNaN(value)) {
        unitResult.innerText = "Enter a number.";
        return;
    }

    if (cat === "temperature") {
        let kelvin;

        if (from === "Celsius") kelvin = value + 273.15;
        else if (from === "Fahrenheit") kelvin = (value - 32) * 5/9 + 273.15;
        else kelvin = value;

        let final;
        if (to === "Celsius") final = kelvin - 273.15;
        else if (to === "Fahrenheit") final = (kelvin - 273.15) * 9/5 + 32;
        else final = kelvin;

        unitResult.innerText = `${value} ${from} = ${final.toFixed(2)} ${to}`;
        return;
    }

    const base = value / units[cat][from];
    const final = base * units[cat][to];

    unitResult.innerText = `${value} ${from} = ${final.toFixed(4)} ${to}`;
}

/* ============================================================
   PASSWORD GENERATOR
   ============================================================ */

function generatePassword() {
    const len = document.getElementById("password-length").value;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";

    for (let i = 0; i < len; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    document.getElementById("password-result").innerText = pass;
}

/* ============================================================
   QR GENERATOR
   ============================================================ */

function generateQR() {
    const text = document.getElementById("qr-input").value;
    // Note: This relies on an external, free API (qrserver.com)
    document.getElementById("qr-result").innerHTML =
        `<img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}" />`;
}

/* ============================================================
   AGE CALCULATOR
   ============================================================ */

function calculateAge() {
    const birth = new Date(document.getElementById("birthdate").value);
    if (!birth) return;

    const diff = Date.now() - birth.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;

    document.getElementById("age-result").innerText = `Age: ${age} years`;
}

/* ============================================================
   IMAGE RESIZER
   ============================================================ */

function resizeAndDisplayImage() {
    const file = document.getElementById("image-upload").files[0];
    if (!file) return alert("Upload image first.");

    const w = parseInt(document.getElementById("resize-width").value);
    const h = parseInt(document.getElementById("resize-height").value);

    const reader = new FileReader();
    reader.onload = function (e) {

        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);

            const resizedURL = canvas.toDataURL("image/jpeg");

            document.getElementById("image-result-display").innerHTML =
                `<img src="${resizedURL}" style="max-width:100%; border-radius:10px; margin-top:10px;">`;

            document.getElementById("image-result-text").innerText = "Image resized successfully!";
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}
