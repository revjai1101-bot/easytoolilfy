"use strict";

/* =========================
   SPA NAVIGATION (HASH)
   ========================= */

function showTool(id) {
  document.querySelectorAll(".tool-panel").forEach(p => p.style.display = "none");
  const panel = document.getElementById(id);
  if (panel) panel.style.display = "block";
  window.location.hash = id;
  window.scrollTo(0, 0);
}

function goBack() {
  history.back();
}

function handleHashChange() {
  const id = window.location.hash.replace("#", "");
  document.querySelectorAll(".tool-panel").forEach(p => p.style.display = "none");
  if (id) {
    const panel = document.getElementById(id);
    if (panel) panel.style.display = "block";
  }
}

window.addEventListener("hashchange", handleHashChange);
// Initial load
handleHashChange();

/* =========================
   SEARCH FILTER
   ========================= */
const toolSearch = document.getElementById("tool-search");
if (toolSearch) {
  toolSearch.addEventListener("input", function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll(".tool-card").forEach(card => {
      card.style.display = card.innerText.toLowerCase().includes(q) ? "block" : "none";
    });
  });
}

/* =========================
   CURRENCY CONVERTER
   ========================= */

const topCurrencies = [
  "USD","EUR","GBP","JPY","AUD","CAD","SGD","CHF","THB","IDR","CNY","HKD","NZD","SAR",
  "AED","INR","KRW","PHP","VND","BDT","PKR","MMK","BRL","ZAR","SEK","NOK","DKK","PLN",
  "TRY","HUF","EGP","QAR","KWD","BHD","OMR","LKR","NPR","KES","RUB","MXN","ARS","NGN",
  "COP","CLP","CZK","RON","ILS","MAD","MYR"
];

const fromCurrency = document.getElementById("fromCurrency");
const toCurrency   = document.getElementById("toCurrency");
const currencyResult = document.getElementById("currencyResult");

let favFrom = JSON.parse(localStorage.getItem("fav_from") || "[]");
let favTo   = JSON.parse(localStorage.getItem("fav_to")   || "[]");

function buildCurrencySelect(target, favorites) {
  if (!target) return;
  target.innerHTML = "";
  // Favorites on top
  favorites.forEach(code => {
    target.innerHTML += `<option value="${code}">⭐ ${code}</option>`;
  });
  // Rest
  topCurrencies.forEach(code => {
    if (!favorites.includes(code)) {
      target.innerHTML += `<option value="${code}">${code}</option>`;
    }
  });
}

function refreshCurrencyDropdowns() {
  buildCurrencySelect(fromCurrency, favFrom);
  buildCurrencySelect(toCurrency, favTo);

  // Some sensible defaults
  if (fromCurrency && !fromCurrency.value) fromCurrency.value = "MYR";
  if (toCurrency && !toCurrency.value) toCurrency.value = "USD";
}

refreshCurrencyDropdowns();

// Favorite buttons
const favFromBtn = document.getElementById("favFromBtn");
const favToBtn   = document.getElementById("favToBtn");

if (favFromBtn) {
  favFromBtn.addEventListener("click", () => {
    if (!fromCurrency) return;
    const cur = fromCurrency.value;
    favFrom = favFrom.includes(cur) ? favFrom.filter(c => c !== cur) : [...favFrom, cur];
    localStorage.setItem("fav_from", JSON.stringify(favFrom));
    refreshCurrencyDropdowns();
  });
}

if (favToBtn) {
  favToBtn.addEventListener("click", () => {
    if (!toCurrency) return;
    const cur = toCurrency.value;
    favTo = favTo.includes(cur) ? favTo.filter(c => c !== cur) : [...favTo, cur];
    localStorage.setItem("fav_to", JSON.stringify(favTo));
    refreshCurrencyDropdowns();
  });
}

const amountInput = document.getElementById("amount");
const convertBtn  = document.getElementById("convertBtn");

if (convertBtn) {
  convertBtn.addEventListener("click", () => {
    if (!amountInput || !fromCurrency || !toCurrency || !currencyResult) return;

    const amt = parseFloat(amountInput.value);
    if (isNaN(amt)) {
      currencyResult.innerText = "Please enter a valid amount.";
      return;
    }

    const fromIndex = topCurrencies.indexOf(fromCurrency.value);
    const toIndex   = topCurrencies.indexOf(toCurrency.value);
    if (fromIndex === -1 || toIndex === -1) {
      currencyResult.innerText = "Currency not supported.";
      return;
    }

    // Simple offline pseudo-rate based on index
    const rate = (toIndex + 1) / (fromIndex + 1);
    const converted = amt * rate;

    currencyResult.innerText = `${amt} ${fromCurrency.value} ≈ ${converted.toFixed(2)} ${toCurrency.value}`;
  });
}

/* =========================
   UNIT CONVERTER
   ========================= */

const unitCategory = document.getElementById("unit-category");
const unitFrom     = document.getElementById("unit-from");
const unitTo       = document.getElementById("unit-to");
const unitValue    = document.getElementById("unit-value");
const unitResult   = document.getElementById("unit-result");
const unitConvertBtn = document.getElementById("unit-convert-btn");

const units = {
  length: { m: 1, cm: 100, mm: 1000, km: 0.001, inch: 39.37, ft: 3.28 },
  weight: { kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274 },
  temperature: "special",
  speed: { "m/s": 1, "km/h": 3.6, mph: 2.23694 }
};

function loadUnits() {
  if (!unitCategory || !unitFrom || !unitTo) return;
  const cat = unitCategory.value;
  unitFrom.innerHTML = "";
  unitTo.innerHTML   = "";

  if (cat === "temperature") {
    ["Celsius", "Fahrenheit", "Kelvin"].forEach(u => {
      unitFrom.innerHTML += `<option>${u}</option>`;
      unitTo.innerHTML   += `<option>${u}</option>`;
    });
  } else {
    Object.keys(units[cat]).forEach(u => {
      unitFrom.innerHTML += `<option value="${u}">${u}</option>`;
      unitTo.innerHTML   += `<option value="${u}">${u}</option>`;
    });
  }
}

if (unitCategory) {
  unitCategory.addEventListener("change", loadUnits);
  loadUnits(); // initial
}

function convertUnit() {
  if (!unitCategory || !unitFrom || !unitTo || !unitValue || !unitResult) return;

  const cat  = unitCategory.value;
  const from = unitFrom.value;
  const to   = unitTo.value;
  const v    = parseFloat(unitValue.value);

  if (isNaN(v)) {
    unitResult.innerText = "Please enter a number.";
    return;
  }

  if (cat === "temperature") {
    let kelvin;

    if (from === "Celsius")      kelvin = v + 273.15;
    else if (from === "Fahrenheit") kelvin = (v - 32) * 5/9 + 273.15;
    else                          kelvin = v; // Kelvin

    let final;
    if (to === "Celsius")        final = kelvin - 273.15;
    else if (to === "Fahrenheit")final = (kelvin - 273.15) * 9/5 + 32;
    else                         final = kelvin;

    unitResult.innerText = `${v} ${from} = ${final.toFixed(2)} ${to}`;
    return;
  }

  const base = v / units[cat][from];
  const final = base * units[cat][to];
  unitResult.innerText = `${v} ${from} = ${final.toFixed(4)} ${to}`;
}

if (unitConvertBtn) {
  unitConvertBtn.addEventListener("click", convertUnit);
}

/* =========================
   PASSWORD GENERATOR
   ========================= */

function generatePassword() {
  const lengthInput = document.getElementById("password-length");
  const resultBox   = document.getElementById("password-result");
  if (!lengthInput || !resultBox) return;

  const len = parseInt(lengthInput.value, 10) || 12;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let pass = "";
  for (let i = 0; i < len; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  resultBox.innerText = pass;
}
window.generatePassword = generatePassword; // for inline onclick

/* =========================
   QR GENERATOR + DOWNLOAD
   ========================= */

function generateQR() {
  const input = document.getElementById("qr-input");
  const resultDiv = document.getElementById("qr-result");
  const dlBtn = document.getElementById("qr-download");
  if (!input || !resultDiv || !dlBtn) return;

  const text = input.value.trim();
  if (!text) {
    resultDiv.innerHTML = "Please enter some text.";
    dlBtn.style.display = "none";
    return;
  }

  const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;
  resultDiv.innerHTML = `<img id="qr-image" src="${url}" alt="QR Code">`;
  dlBtn.style.display = "block";
}
window.generateQR = generateQR; // for inline onclick

const qrDownloadBtn = document.getElementById("qr-download");
if (qrDownloadBtn) {
  qrDownloadBtn.addEventListener("click", () => {
    const img = document.getElementById("qr-image");
    if (!img) return;
    const link = document.createElement("a");
    link.href = img.src;
    link.download = "qrcode.png";
    link.click();
  });
}

/* =========================
   AGE CALCULATOR
   ========================= */

function calculateAge() {
  const birthInput = document.getElementById("birthdate");
  const out = document.getElementById("age-result");
  if (!birthInput || !out) return;

  const birth = new Date(birthInput.value);
  if (!birthInput.value || isNaN(birth.getTime())) {
    out.innerText = "Please choose a valid date.";
    return;
  }

  const diff = Date.now() - birth.getTime();
  const age  = new Date(diff).getUTCFullYear() - 1970;
  out.innerText = `Age: ${age} years`;
}
window.calculateAge = calculateAge; // for inline onclick

/* =========================
   IMAGE RESIZER + DOWNLOAD
   ========================= */

function resizeAndDisplayImage() {
  const fileInput = document.getElementById("image-upload");
  const widthInput = document.getElementById("resize-width");
  const heightInput = document.getElementById("resize-height");
  const resultText = document.getElementById("image-result-text");
  const resultDiv  = document.getElementById("image-result-display");
  const dlBtn      = document.getElementById("img-download");

  if (!fileInput || !widthInput || !heightInput || !resultText || !resultDiv || !dlBtn) return;

  const file = fileInput.files[0];
  if (!file) {
    alert("Please upload an image first.");
    return;
  }

  const w = parseInt(widthInput.value, 10);
  const h = parseInt(heightInput.value, 10);
  if (!w || !h) {
    resultText.innerText = "Please enter valid width and height.";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const url = canvas.toDataURL("image/png");
      resultDiv.innerHTML = `<img id="resized-image" src="${url}" style="max-width:100%;border-radius:10px;margin-top:10px;">`;
      resultText.innerText = "Image resized successfully!";
      dlBtn.style.display = "block";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
window.resizeAndDisplayImage = resizeAndDisplayImage; // for inline onclick

const imgDownloadBtn = document.getElementById("img-download");
if (imgDownloadBtn) {
  imgDownloadBtn.addEventListener("click", () => {
    const img = document.getElementById("resized-image");
    if (!img) return;
    const link = document.createElement("a");
    link.href = img.src;
    link.download = "resized-image.png";
    link.click();
  });
}
