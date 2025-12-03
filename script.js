// ================= CORE UI =================
function showTool(id) {
  document.querySelectorAll(".tool-panel").forEach(e => e.style.display = "none");
  document.getElementById(id).style.display = "block";
}

function goBack() {
  document.querySelectorAll(".tool-panel").forEach(e => e.style.display = "none");
}

// ================= SEARCH =================
document.getElementById('tool-search').addEventListener('keyup', function() {
  const query = this.value.toLowerCase();
  document.querySelectorAll('.tool-card').forEach(card => {
    const toolName = card.querySelector('p').textContent.toLowerCase();
    card.style.display = toolName.includes(query) ? 'block' : 'none';
  });
});

// ================= CURRENCY =================
let ratesData = {};

// Modern full currency list
const currencyList = {
  'USD': 'United States Dollar (USD)', 'EUR': 'Euro (EUR)', 'JPY': 'Japanese Yen (JPY)', 'GBP': 'British Pound (GBP)',
  'AUD': 'Australian Dollar (AUD)', 'CAD': 'Canadian Dollar (CAD)', 'CHF': 'Swiss Franc (CHF)', 'CNY': 'Chinese Yuan (CNY)',
  'HKD': 'Hong Kong Dollar (HKD)', 'NZD': 'New Zealand Dollar (NZD)', 'SGD': 'Singapore Dollar (SGD)', 'KRW': 'Korean Won (KRW)',
  'SEK': 'Swedish Krona (SEK)', 'NOK': 'Norwegian Krone (NOK)', 'MXN': 'Mexican Peso (MXN)', 'INR': 'Indian Rupee (INR)',
  'BRL': 'Brazilian Real (BRL)', 'ZAR': 'South African Rand (ZAR)', 'RUB': 'Russian Ruble (RUB)', 'TRY': 'Turkish Lira (TRY)',
  'AED': 'UAE Dirham (AED)', 'SAR': 'Saudi Riyal (SAR)', 'THB': 'Thai Baht (THB)', 'IDR': 'Indonesian Rupiah (IDR)',
  'MYR': 'Malaysian Ringgit (MYR)', 'PHP': 'Philippine Peso (PHP)', 'VND': 'Vietnamese Dong (VND)', 'DKK': 'Danish Krone (DKK)',
  'PLN': 'Polish Zloty (PLN)', 'HUF': 'Hungarian Forint (HUF)', 'CZK': 'Czech Koruna (CZK)', 'ILS': 'Israeli Shekel (ILS)',
  'CLP': 'Chilean Peso (CLP)', 'COP': 'Colombian Peso (COP)', 'PEN': 'Peruvian Sol (PEN)', 'EGP': 'Egyptian Pound (EGP)',
  'KWD': 'Kuwaiti Dinar (KWD)', 'QAR': 'Qatari Rial (QAR)', 'PKR': 'Pakistani Rupee (PKR)', 'BDT': 'Bangladeshi Taka (BDT)',
  'NPR': 'Nepal Rupee (NPR)', 'LKR': 'Sri Lankan Rupee (LKR)', 'KES': 'Kenyan Shilling (KES)', 'NGN': 'Nigerian Naira (NGN)',
  'GHS': 'Ghanaian Cedi (GHS)', 'TWD': 'Taiwan Dollar (TWD)', 'ZMW': 'Zambian Kwacha (ZMW)'
};

// Currencies shown in table
const majorCurrencies = ["USD", "EUR", "GBP", "SGD", "JPY", "IDR", "THB", "CNY", "AUD"];

// NEW API (NO CORS, NO KEY NEEDED)
const API_URL = "https://open.er-api.com/v6/latest/MYR";

// Fallback rates
const fallbackRates = {
  "MYR": 1,
  "USD": 0.2120, "EUR": 0.1945, "GBP": 0.1650, "SGD": 0.2855,
  "JPY": 31.40, "AUD": 0.3180, "CAD": 0.2890, "CNY": 1.50,
  "THB": 7.70, "IDR": 3300.00, "HKD": 1.6500, "INR": 17.65,
  "PHP": 11.75, "KRW": 275.00, "VND": 5000.00, "SAR": 0.7950,
  "AED": 0.7800, "NZD": 0.3420, "ZAR": 3.8500, "CHF": 0.1870,
  "SEK": 2.2500, "NOK": 2.2200, "MXN": 3.5000, "BRL": 1.1000,
  "TWD": 6.8000, "ILS": 0.7800
};

async function fetchCurrencyRates() {
  const ratesBody = document.getElementById("ratesBody");
  const currencyResult = document.getElementById("currencyResult");

  try {
    ratesBody.innerHTML = '<tr><td colspan="2">Fetching live rates...</td></tr>';
    const res = await fetch(API_URL);

    if (!res.ok) throw new Error(`HTTP ERROR: ${res.status}`);

    const data = await res.json();

    if (data.result === "success") {
      ratesData = data.rates;
      currencyResult.innerText = "Rates updated live.";
    } else throw new Error("API failed");
  } catch (e) {
    console.warn("API FAILED USING FALLBACK", e);
    ratesData = fallbackRates;
    currencyResult.innerText = "Using offline/fallback currency rates.";
  }

  populateDropdowns();
  populateRatesTable();
}

function populateDropdowns() {
  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  from.innerHTML = ""; to.innerHTML = "";

  Object.keys(currencyList).sort().forEach(code => {
    from.add(new Option(currencyList[code], code));
    to.add(new Option(currencyList[code], code));
  });

  from.value = "USD";
  to.value = "MYR";
}

document.getElementById("convertBtn").onclick = () => {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;
  const resElem = document.getElementById("currencyResult");

  if (!amount || amount <= 0) return resElem.innerText = "Enter valid amount";

  if (!ratesData[from] || !ratesData[to]) return resElem.innerText = "Rate unavailable";

  const result = amount * (ratesData[to] / ratesData[from]);
  resElem.innerText = `${amount.toFixed(2)} ${from} = ${result.toFixed(2)} ${to}`;
};

function populateRatesTable() {
  const tbody = document.getElementById("ratesBody");
  tbody.innerHTML = "";

  majorCurrencies.forEach(code => {
    if (!ratesData[code] || code === "MYR") return;
    const row = document.createElement("tr");
    row.innerHTML = `<td>${code}</td><td>${ratesData[code].toFixed(4)}</td>`;
    tbody.append(row);
  });
}

// ================= UNIT =================
const unitOptions = {
  length: ["m", "cm", "mm", "km", "in", "ft"],
  weight: ["kg", "g", "lb", "oz"],
  temperature: ["°C", "°F", "K"],
  speed: ["km/h", "m/s", "mph", "knot"]
};

function populateUnitDropdowns() {
  const cat = document.getElementById("unit-category").value;
  const f = document.getElementById("unit-from");
  const t = document.getElementById("unit-to");

  f.innerHTML = ""; t.innerHTML = "";
  unitOptions[cat].forEach(u => {
    f.add(new Option(u, u));
    t.add(new Option(u, u));
  });

  f.value = unitOptions[cat][0];
  t.value = unitOptions[cat][1];
}

document.getElementById("unit-category").onchange = populateUnitDropdowns;

function convertUnit() {
  const val = parseFloat(document.getElementById("unit-value").value);
  const from = document.getElementById("unit-from").value;
  const to = document.getElementById("unit-to").value;
  const cat = document.getElementById("unit-category").value;
  const result = document.getElementById("unit-result");
  let base, out;

  if (!val) return result.innerText = "Enter valid number.";

  try {
    if (cat === "length") {
      if (from === "cm") base = val / 100;
      else if (from === "mm") base = val / 1000;
      else if (from === "km") base = val * 1000;
      else if (from === "in") base = val * 0.0254;
      else if (from === "ft") base = val * 0.3048;
      else base = val;

      if (to === "cm") out = base * 100;
      else if (to === "mm") out = base * 1000;
      else if (to === "km") out = base / 1000;
      else if (to === "in") out = base / 0.0254;
      else if (to === "ft") out = base / 0.3048;
      else out = base;
    }

    else if (cat === "weight") {
      if (from === "g") base = val / 1000;
      else if (from === "lb") base = val * 0.453592;
      else if (from === "oz") base = val * 0.0283495;
      else base = val;

      if (to === "g") out = base * 1000;
      else if (to === "lb") out = base / 0.453592;
      else if (to === "oz") out = base / 0.0283495;
      else out = base;
    }

    else if (cat === "temperature") {
      if (from === "°C") base = val;
      else if (from === "°F") base = (val - 32) * (5 / 9);
      else if (from === "K") base = val - 273.15;

      if (to === "°C") out = base;
      else if (to === "°F") out = base * 1.8 + 32;
      else if (to === "K") out = base + 273.15;
    }

    else if (cat === "speed") {
      if (from === "km/h") base = val / 3.6;
      else if (from === "mph") base = val / 2.237;
      else if (from === "knot") base = val * 0.514444;
      else base = val;

      if (to === "km/h") out = base * 3.6;
      else if (to === "mph") out = base * 2.237;
      else if (to === "knot") out = base / 0.514444;
      else out = base;
    }

    result.innerText = `${val} ${from} = ${out.toFixed(4)} ${to}`;
  } catch {
    result.innerText = "Conversion error.";
  }
}

// ================= PASSWORD =================
function generatePassword() {
  const length = parseInt(document.getElementById("password-length").value) || 12;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let pass = "";
  for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById("password-result").innerText = pass;
}

// ================= QR =================
function generateQR() {
  const text = document.getElementById("qr-input").value;
  const out = document.getElementById("qr-result");

  if (!text) return out.innerHTML = "<p>Please enter text or URL.</p>";

  out.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}">`;
}

// ================= AGE =================
function calculateAge() {
  const dobInput = document.getElementById("birthdate").value;
  const out = document.getElementById("age-result");

  if (!dobInput) return out.innerText = "Select date of birth.";

  const dob = new Date(dobInput);
  const today = new Date();

  if (dob > today) return out.innerText = "Invalid date.";

  let age = today.getFullYear() - dob.getFullYear();
  let m = today.getMonth() - dob.getMonth();
  let d = today.getDate() - dob.getDate();

  if (d < 0) {
    m--;
    d += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (m < 0) {
    age--;
    m += 12;
  }

  out.innerText = `${age} years old (${m} months, ${d} days)`;
}

// ================= IMAGE RESIZER =================
function fileToDataUri(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

async function resizeAndDisplayImage() {
  const file = document.getElementById("image-upload").files[0];
  const w = parseInt(document.getElementById("resize-width").value);
  const h = parseInt(document.getElementById("resize-height").value);
  const div = document.getElementById("image-result-display");
  const text = document.getElementById("image-result-text");

  if (!file || !w || !h) {
    text.innerText = "Upload image & enter size.";
    div.innerHTML = "";
    return;
  }

  text.innerText = "Resizing...";
  div.innerHTML = "";

  const src = await fileToDataUri(file);
  const img = new Image();
  img.src = src;

  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);

    const output = canvas.toDataURL("image/jpeg", 0.9);
    const el = document.createElement("img");
    el.src = output;
    el.style.maxWidth = "100%";
    el.style.marginTop = "15px";

    div.appendChild(el);

    const dl = document.createElement("a");
    dl.href = output;
    dl.download = `${file.name.replace(/\.[^/.]+$/, "")}_resized.jpeg`;
    dl.textContent = "Download Resized Image";
    dl.className = "download-link-btn";
    div.appendChild(dl);

    text.innerText = `Image resized to ${w}x${h}px.`;
  };
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencyRates();
  populateUnitDropdowns();
});
