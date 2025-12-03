/* ============================================================
   GLOBAL PANEL & HISTORY HANDLING (Back Button Fix)
   ============================================================ */

function showTool(id) {
    document.querySelectorAll(".tool-panel").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
    window.scrollTo(0, 0);

    history.pushState({ tool: id }, "", `/${id}`);
}

function goBack() {
    history.back();
}

window.addEventListener('popstate', function(event) {
    document.querySelectorAll(".tool-panel").forEach(p => p.style.display = "none");

    if (event.state && event.state.tool) {
        const panel = document.getElementById(event.state.tool);
        if (panel) panel.style.display = "block";
    }

    window.scrollTo(0, 0);
});

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
   CURRENCY CONVERTER + FAVORITES (API functionality disabled)
   ============================================================ */

const topCurrencies = [
    "USD","EUR","GBP","JPY","AUD","CAD","SGD","CHF","THB","IDR","CNY","HKD","NZD","SAR",
    "AED","INR","KRW","PHP","VND","BDT","PKR","MMK","BRL","ZAR","SEK","NOK","DKK","PLN",
    "TRY","HUF","EGP","QAR","KWD","BHD","OMR","LKR","NPR","KES","RUB","MXN","ARS","NGN",
    "COP","CLP","CZK","RON","ILS","MAD","MYR"
];

const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const currencyResult = document.getElementById("currencyResult");

let favFrom = JSON.parse(localStorage.getItem("fav_from")) || [];
let favTo = JSON.parse(localStorage.getItem("fav_to")) || [];

function buildCurrencyDropdowns() {
    function buildOptions(favorites, target) {
        target.innerHTML = "";
        favorites.forEach(f => target.innerHTML += `<option value="${f}">⭐ ${f}</option>`);
        topCurrencies.forEach(cur => {
            if (!favorites.includes(cur)) target.innerHTML += `<option value="${cur}">${cur}</option>`;
        });
    }

    buildOptions(favFrom, fromCurrency);
    buildOptions(favTo, toCurrency);

    if (!fromCurrency.value) fromCurrency.value = "MYR";
    if (!toCurrency.value) toCurrency.value = "USD";
}
buildCurrencyDropdowns();

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

document.getElementById("convertBtn").addEventListener("click", () => {
    currencyResult.innerText = "⚠️ Live exchange rates currently disabled.";
});


/* ============================================================
   FIX: Prevent dropdown from opening upward 🚀
   ============================================================ */

document.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("mousedown", () => {
        document.body.style.overflow = "hidden"; // stop scroll jump
    });

    sel.addEventListener("blur", () => {
        document.body.style.overflow = ""; // restore scroll
    });

    sel.addEventListener("change", () => {
        document.body.style.overflow = ""; // restore scroll after selection
    });
});


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
    document.getElementById("qr-result").innerHTML =
        `<img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}" />`;
}


/* ============================================================
   AGE CALCULATOR
   ============================================================ */

function calculateAge() {
    const birth = new Date(document.getElementById("birthdate").value);
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
