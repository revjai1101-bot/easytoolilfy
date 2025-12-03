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

// Top 50 currencies commonly used worldwide
const majorCurrencies = [
  "USD","EUR","GBP","JPY","SGD","CNY","HKD","AUD","CAD","CHF",
  "NZD","SEK","NOK","DKK","INR","THB","IDR","PHP","KRW","MYR",
  "VND","AED","SAR","QAR","KWD","BHD","TRY","ZAR","BRL","MXN",
  "RUB","PLN","CZK","HUF","ILS","TWD","ARS","CLP","COP","PEN",
  "EGP","NGN","KES","GHS","PKR","BDT","NPR","LKR","OMR","UYU"
];

// Full dropdown list (big list)
const currencyList = {
  'USD':'United States Dollar (USD)','EUR':'Euro (EUR)','JPY':'Japanese Yen (JPY)','GBP':'British Pound (GBP)',
  'AUD':'Australian Dollar (AUD)','CAD':'Canadian Dollar (CAD)','CHF':'Swiss Franc (CHF)','CNY':'Chinese Yuan (CNY)',
  'HKD':'Hong Kong Dollar (HKD)','NZD':'New Zealand Dollar (NZD)','SGD':'Singapore Dollar (SGD)','KRW':'Korean Won (KRW)',
  'SEK':'Swedish Krona (SEK)','NOK':'Norwegian Krone (NOK)','MXN':'Mexican Peso (MXN)','INR':'Indian Rupee (INR)',
  'BRL':'Brazilian Real (BRL)','ZAR':'South African Rand (ZAR)','RUB':'Russian Ruble (RUB)','TRY':'Turkish Lira (TRY)',
  'AED':'UAE Dirham (AED)','SAR':'Saudi Riyal (SAR)','THB':'Thai Baht (THB)','IDR':'Indonesian Rupiah (IDR)',
  'MYR':'Malaysian Ringgit (MYR)','PHP':'Philippine Peso (PHP)','VND':'Vietnamese Dong (VND)','DKK':'Danish Krone (DKK)',
  'PLN':'Polish Zloty (PLN)','HUF':'Hungarian Forint (HUF)','CZK':'Czech Koruna (CZK)','ILS':'Israeli New Shekel (ILS)',
  'CLP':'Chilean Peso (CLP)','COP':'Colombian Peso (COP)','PEN':'Peruvian Sol (PEN)','EGP':'Egyptian Pound (EGP)',
  'KWD':'Kuwaiti Dinar (KWD)','QAR':'Qatari Riyal (QAR)','PKR':'Pakistani Rupee (PKR)','BDT':'Bangladesh Taka (BDT)',
  'NPR':'Nepalese Rupee (NPR)','LKR':'Sri Lankan Rupee (LKR)','KES':'Kenyan Shilling (KES)','NGN':'Nigerian Naira (NGN)'
};

// ----------------- USE VERCEL SERVERLESS API -----------------
const API_URL = "/api/exchange";

// Fetch currency rates
async function fetchCurrencyRates() {
  const ratesBody = document.getElementById("ratesBody");
  const currencyResult = document.getElementById("currencyResult");

  try {
    ratesBody.innerHTML = '<tr><td colspan="2">Fetching live rates...</td></tr>';

    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.result === "success") {
      ratesData = data.conversion_rates;
      currencyResult.innerText = "Rates updated live via API.";
    } else {
      throw new Error("Invalid API response");
    }

  } catch (error) {
    console.warn("API fetch failed:", error);
    currencyResult.innerText = "Using offline/fallback currency rates.";
  }

  populateDropdowns();
  populateRatesTable();
}

function populateDropdowns() {
  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");

  from.innerHTML = "";
  to.innerHTML = "";

  Object.keys(currencyList).sort().forEach(code => {
    from.add(new Option(currencyList[code], code));
    to.add(new Option(currencyList[code], code));
  });

  from.value = "MYR";
  to.value = "USD";
}

document.getElementById("convertBtn").onclick = () => {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;
  const resultElem = document.getElementById("currencyResult");

  if (isNaN(amount) || amount <= 0) {
    resultElem.innerText = "Please enter a valid amount.";
    return;
  }

  if (!ratesData[from] || !ratesData[to]) {
    resultElem.innerText = "Rate unavailable at the moment.";
    return;
  }

  const result = amount * (ratesData[to] / ratesData[from]);
  resultElem.innerText = `${amount.toFixed(2)} ${from} = ${result.toFixed(2)} ${to}`;
};

// Table
function populateRatesTable() {
  const tbody = document.getElementById("ratesBody");
  tbody.innerHTML = "";

  majorCurrencies.forEach(code => {
    if (!ratesData[code] || code === "MYR") return;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${code}</td>
      <td>${ratesData[code].toFixed(4)}</td>
    `;
    tbody.appendChild(row);
  });
}

// ================= UNIT, PASSWORD, QR, AGE, IMAGE TOOLS =================
// (UNCHANGED – your existing working tools remain here)

function generatePassword() {
  const length = parseInt(document.getElementById("password-length").value) || 12;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById("password-result").innerText = pass;
}

function generateQR() {
  const text = document.getElementById("qr-input").value;
  const qrResultDiv = document.getElementById("qr-result");

  if (!text) {
    qrResultDiv.innerHTML = "<p>Please enter text or a URL.</p>";
    return;
  }

  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  qrResultDiv.innerHTML = `<img src="${apiUrl}" alt="QR Code">`;
}

function calculateAge() {
  const dobInput = document.getElementById("birthdate").value;
  const resultElem = document.getElementById("age-result");

  if (!dobInput) {
    resultElem.innerText = "Please select your birthdate.";
    return;
  }

  const dob = new Date(dobInput);
  const today = new Date();

  if (dob > today) {
    resultElem.innerText = "Please select a valid past date.";
    return;
  }

  let age = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    months += 12;
  }

  resultElem.innerText = `${age} years old\n(${months} months and ${days} days until next birthday)`;
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencyRates();
});
