"use strict";

/* =============================
   CURRENCY (only runs on currency.html)
   ============================= */
const topCurrencies = [
  "USD","EUR","GBP","JPY","AUD","CAD","SGD","CHF","THB","IDR","CNY","HKD","NZD","SAR",
  "AED","INR","KRW","PHP","VND","BDT","PKR","MMK","BRL","ZAR","SEK","NOK","DKK","PLN",
  "TRY","HUF","EGP","QAR","KWD","BHD","OMR","LKR","NPR","KES","RUB","MXN","ARS","NGN",
  "COP","CLP","CZK","RON","ILS","MAD","MYR"
];

const fallbackMYR = {
  MYR: 1, USD: 0.2120, EUR: 0.1945, GBP: 0.1650, JPY: 31.40, AUD: 0.3180,
  CAD: 0.2890, SGD: 0.2855, CHF: 0.1870, THB: 7.70, IDR: 3300, CNY: 1.50,
  HKD: 1.65, NZD: 0.3420, SAR: 0.7950, AED: 0.7800, INR: 17.65, KRW: 275,
  PHP: 11.75, VND: 5000, BDT: 23, PKR: 59, MMK: 450, BRL: 1.10, ZAR: 3.85,
  SEK: 2.25, NOK: 2.22, DKK: 1.45, PLN: 0.84, TRY: 6.9, HUF: 72, EGP: 13.5,
  QAR: 0.77, KWD: 0.065, BHD: 0.08, OMR: 0.08, LKR: 70, NPR: 29, KES: 33,
  RUB: 19, MXN: 3.50, ARS: 190, NGN: 180, COP: 850, CLP: 230, CZK: 4.5,
  RON: 0.96, ILS: 0.78, MAD: 2.2
};

let LIVE_RATES = null;

async function loadRates() {
  try {
    const res = await fetch("https://v6.exchangerate-api.com/v6/f1d5ca13ec0d67c2ef78b766/latest/MYR");
    const json = await res.json();
    LIVE_RATES = json.conversion_rates;
  } catch {
    LIVE_RATES = fallbackMYR;
  }
}

function buildCurrencyOptions(target, favList) {
  target.innerHTML = "";
  favList.forEach(c => target.innerHTML += `<option value="${c}">⭐ ${c}</option>`);
  topCurrencies.forEach(c => {
    if (!favList.includes(c)) target.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function initCurrency() {
  const fromSel = document.getElementById("fromCurrency");
  const toSel = document.getElementById("toCurrency");
  const resultBox = document.getElementById("currencyResult");
  const ratesBody = document.getElementById("ratesBody");

  if (!fromSel || !toSel || !resultBox) return; // not on currency page

  let favFrom = JSON.parse(localStorage.getItem("fav_from") || "[]");
  let favTo = JSON.parse(localStorage.getItem("fav_to") || "[]");

  function refreshDropdowns() {
    buildCurrencyOptions(fromSel, favFrom);
    buildCurrencyOptions(toSel, favTo);
    if (!fromSel.value) fromSel.value = "MYR";
    if (!toSel.value) toSel.value = "USD";
  }

  function buildRatesTable() {
    if (!ratesBody) return;
    const rates = LIVE_RATES || fallbackMYR;
    ratesBody.innerHTML = "";
    Object.keys(rates).sort().forEach(code => {
      const val = Number(rates[code]);
      ratesBody.innerHTML += `
        <tr>
          <td>${code}</td>
          <td>${isFinite(val) ? val.toFixed(4) : "-"}</td>
        </tr>
      `;
    });
  }

  document.getElementById("favFromBtn")?.addEventListener("click", () => {
    const c = fromSel.value;
    favFrom = favFrom.includes(c) ? favFrom.filter(x => x !== c) : [...favFrom, c];
    localStorage.setItem("fav_from", JSON.stringify(favFrom));
    refreshDropdowns();
  });

  document.getElementById("favToBtn")?.addEventListener("click", () => {
    const c = toSel.value;
    favTo = favTo.includes(c) ? favTo.filter(x => x !== c) : [...favTo, c];
    localStorage.setItem("fav_to", JSON.stringify(favTo));
    refreshDropdowns();
  });

  document.getElementById("convertBtn")?.addEventListener("click", () => {
    const amt = parseFloat(document.getElementById("amount")?.value);
    if (isNaN(amt)) { resultBox.innerText = "Enter a valid amount."; return; }

    const rates = LIVE_RATES || fallbackMYR;
    const from = fromSel.value;
    const to = toSel.value;

    let myrValue = (from === "MYR") ? amt : amt / rates[from];
    let final = (to === "MYR") ? myrValue : myrValue * rates[to];

    resultBox.innerText = `${amt} ${from} ≈ ${final.toFixed(4)} ${to}`;
  });

  // Load rates then render
  loadRates().finally(() => {
    refreshDropdowns();
    buildRatesTable();
  });
}

/* =============================
   UNIT CONVERTER (unit.html)
   ============================= */
function initUnit() {
  const unitCategory = document.getElementById("unit-category");
  const unitFrom = document.getElementById("unit-from");
  const unitTo = document.getElementById("unit-to");
  const unitVal = document.getElementById("unit-value");
  const unitResult = document.getElementById("unit-result");
  if (!unitCategory || !unitFrom || !unitTo || !unitVal || !unitResult) return;

  const units = {
    length: { m:1, cm:100, mm:1000, km:0.001, inch:39.37, ft:3.28 },
    weight: { kg:1, g:1000, mg:1000000, lb:2.20462, oz:35.274 },
    temperature: "special",
    speed: { "m/s":1, "km/h":3.6, mph:2.23694 }
  };

  function loadUnits() {
    const c = unitCategory.value;
    unitFrom.innerHTML = "";
    unitTo.innerHTML = "";

    if (c === "temperature") {
      ["Celsius","Fahrenheit","Kelvin"].forEach(u=>{
        unitFrom.innerHTML += `<option>${u}</option>`;
        unitTo.innerHTML += `<option>${u}</option>`;
      });
    } else {
      Object.keys(units[c]).forEach(u=>{
        unitFrom.innerHTML += `<option>${u}</option>`;
        unitTo.innerHTML += `<option>${u}</option>`;
      });
    }
  }

  unitCategory.addEventListener("change", loadUnits);
  loadUnits();

  document.getElementById("unit-convert-btn")?.addEventListener("click", () => {
    const c = unitCategory.value;
    const from = unitFrom.value;
    const to = unitTo.value;
    const v = parseFloat(unitVal.value);
    if (isNaN(v)) { unitResult.innerText = "Enter a value."; return; }

    if (c === "temperature") {
      let k;
      if (from === "Celsius") k = v + 273.15;
      else if (from === "Fahrenheit") k = (v - 32) * 5/9 + 273.15;
      else k = v;

      let final;
      if (to === "Celsius") final = k - 273.15;
      else if (to === "Fahrenheit") final = (k - 273.15) * 9/5 + 32;
      else final = k;

      unitResult.innerText = `${v} ${from} = ${final.toFixed(2)} ${to}`;
      return;
    }

    const base = v / units[c][from];
    const final = base * units[c][to];
    unitResult.innerText = `${v} ${from} = ${final.toFixed(4)} ${to}`;
  });
}

/* =============================
   PASSWORD (password.html)
   ============================= */
function initPassword() {
  const out = document.getElementById("password-result");
  const lenInput = document.getElementById("password-length");
  const btn = document.getElementById("password-generate");
  if (!out || !lenInput || !btn) return;

  btn.addEventListener("click", () => {
    const len = parseInt(lenInput.value) || 12;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < len; i++) pass += chars[Math.floor(Math.random()*chars.length)];
    out.innerText = pass;
  });
}

/* =============================
   QR (qr.html)
   ============================= */
function initQR() {
  const input = document.getElementById("qr-input");
  const out = document.getElementById("qr-result");
  const genBtn = document.getElementById("qr-generate");
  const dlBtn = document.getElementById("qr-download");
  if (!input || !out || !genBtn || !dlBtn) return;

  genBtn.addEventListener("click", () => {
    const val = input.value.trim();
    if (!val) { out.innerHTML = "Enter text or a URL."; dlBtn.style.display="none"; return; }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(val)}`;
    out.innerHTML = `<img id="qr-image" src="${url}" alt="QR Code">`;
    dlBtn.style.display = "inline-block";
  });

  dlBtn.addEventListener("click", () => {
    const img = document.getElementById("qr-image");
    if (!img) return;
    const link = document.createElement("a");
    link.href = img.src;
    link.download = "qrcode.png";
    link.click();
  });
}

/* =============================
   AGE (age.html)
   ============================= */
function initAge() {
  const date = document.getElementById("birthdate");
  const btn = document.getElementById("age-calc");
  const out = document.getElementById("age-result");
  if (!date || !btn || !out) return;

  btn.addEventListener("click", () => {
    const birth = new Date(date.value);
    if (isNaN(birth.getTime())) { out.innerText = "Select a valid date."; return; }
    const diff = Date.now() - birth.getTime();
    out.innerText = `Age: ${new Date(diff).getUTCFullYear() - 1970} years`;
  });
}

/* =============================
   IMAGE (image.html)
   ============================= */
function initImage() {
  const upload = document.getElementById("image-upload");
  const wInput = document.getElementById("resize-width");
  const hInput = document.getElementById("resize-height");
  const btn = document.getElementById("image-resize");
  const out = document.getElementById("image-result-display");
  const msg = document.getElementById("image-result-text");
  const dl = document.getElementById("img-download");
  if (!upload || !wInput || !hInput || !btn || !out || !msg || !dl) return;

  btn.addEventListener("click", () => {
    const file = upload.files[0];
    const w = parseInt(wInput.value);
    const h = parseInt(hInput.value);

    if (!file) { msg.innerText = "Please upload an image."; return; }
    if (!w || !h) { msg.innerText = "Invalid size."; return; }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        const url = c.toDataURL("image/png");
        out.innerHTML = `<img id="resized-image" src="${url}" style="max-width:100%;" alt="Resized">`;
        msg.innerText = "Image resized!";
        dl.style.display = "inline-block";
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  dl.addEventListener("click", () => {
    const img = document.getElementById("resized-image");
    if (!img) return;
    const link = document.createElement("a");
    link.href = img.src;
    link.download = "resized-image.png";
    link.click();
  });
}

/* Boot */
document.addEventListener("DOMContentLoaded", () => {
  initCurrency();
  initUnit();
  initPassword();
  initQR();
  initAge();
  initImage();
});
