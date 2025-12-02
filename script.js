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
        if (toolName.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// ================= CURRENCY =================
let ratesData = {};

// --- Full Static List of Currencies (ISO 4217 Codes and Names) ---
const currencyList = {
    'USD': 'United States Dollar (USD)', 'EUR': 'Euro (EUR)', 'JPY': 'Japanese Yen (JPY)', 'GBP': 'British Pound (GBP)', 
    'AUD': 'Australian Dollar (AUD)', 'CAD': 'Canadian Dollar (CAD)', 'CHF': 'Swiss Franc (CHF)', 'CNY': 'Chinese Yuan Renminbi (CNY)',
    'HKD': 'Hong Kong Dollar (HKD)', 'NZD': 'New Zealand Dollar (NZD)', 'SGD': 'Singapore Dollar (SGD)', 'KRW': 'South Korean Won (KRW)',
    'SEK': 'Swedish Krona (SEK)', 'NOK': 'Norwegian Krone (NOK)', 'MXN': 'Mexican Peso (MXN)', 'INR': 'Indian Rupee (INR)',
    'BRL': 'Brazilian Real (BRL)', 'ZAR': 'South African Rand (ZAR)', 'RUB': 'Russian Ruble (RUB)', 'TRY': 'Turkish Lira (TRY)',
    'AED': 'UAE Dirham (AED)', 'SAR': 'Saudi Riyal (SAR)', 'THB': 'Thai Baht (THB)', 'IDR': 'Indonesian Rupiah (IDR)',
    'MYR': 'Malaysian Ringgit (MYR)', 'PHP': 'Philippine Peso (PHP)', 'VND': 'Vietnamese Dong (VND)', 'DKK': 'Danish Krone (DKK)',
    'PLN': 'Polish Zloty (PLN)', 'HUF': 'Hungarian Forint (HUF)', 'CZK': 'Czech Koruna (CZK)', 'ILS': 'Israeli New Shekel (ILS)',
    'CLP': 'Chilean Peso (CLP)', 'COP': 'Colombian Peso (COP)', 'PEN': 'Peruvian Sol (PEN)', 'EGP': 'Egyptian Pound (EGP)',
    'KWD': 'Kuwaiti Dinar (KWD)', 'QAR': 'Qatari Rial (QAR)', 'PKR': 'Pakistani Rupee (PKR)', 'BDT': 'Bangladeshi Taka (BDT)',
    'NPR': 'Nepalese Rupee (NPR)', 'LKR': 'Sri Lankan Rupee (LKR)', 'KES': 'Kenyan Shilling (KES)', 'NGN': 'Nigerian Naira (NGN)',
    'GHS': 'Ghanaian Cedi (GHS)', 'XOF': 'CFA Franc BCEAO (XOF)', 'XAF': 'CFA Franc BEAC (XAF)', 'ARS': 'Argentine Peso (ARS)',
    'VEF': 'Venezuelan Bolívar (VEF)', 'TWD': 'New Taiwan Dollar (TWD)', 'JOD': 'Jordanian Dinar (JOD)', 'OMR': 'Omani Rial (OMR)',
    'BHD': 'Bahraini Dinar (BHD)', 'ISK': 'Icelandic Króna (ISK)', 'HRK': 'Croatian Kuna (HRK)', 'RON': 'Romanian Leu (RON)',
    'BGN': 'Bulgarian Lev (BGN)', 'GEL': 'Georgian Lari (GEL)', 'RSD': 'Serbian Dinar (RSD)', 'UAH': 'Ukrainian Hryvnia (UAH)',
    'KZT': 'Kazakhstani Tenge (KZT)', 'UZS': 'Uzbekistani Som (UZS)', 'AFN': 'Afghan Afghani (AFN)', 'ALL': 'Albanian Lek (ALL)',
    'DZD': 'Algerian Dinar (DZD)', 'AOA': 'Angolan Kwanza (AOA)', 'AMD': 'Armenian Dram (AMD)', 'AWG': 'Aruban Florin (AWG)',
    'AZN': 'Azerbaijani Manat (AZN)', 'BBD': 'Barbadian Dollar (BBD)', 'BZD': 'Belize Dollar (BZD)', 'BMD': 'Bermudian Dollar (BMD)',
    'BWP': 'Botswana Pula (BWP)', 'BND': 'Brunei Dollar (BND)', 'BIF': 'Burundian Franc (BIF)', 'KHR': 'Cambodian Riel (KHR)',
    'CVE': 'Cape Verdean Escudo (CVE)', 'KYD': 'Cayman Islands Dollar (KYD)', 'KMF': 'Comorian Franc (KMF)', 'CDF': 'Congolese Franc (CDF)',
    'CRC': 'Costa Rican Colón (CRC)', 'CUP': 'Cuban Peso (CUP)', 'DJF': 'Djiboutian Franc (DJF)', 'DOP': 'Dominican Peso (DOP)',
    'XCD': 'East Caribbean Dollar (XCD)', 'SVC': 'Salvadoran Colón (SVC)', 'ERN': 'Eritrean Nakfa (ERN)', 'ETB': 'Ethiopian Birr (ETB)',
    'FJD': 'Fijian Dollar (FJD)', 'GMD': 'Gambian Dalasi (GMD)', 'GTQ': 'Guatemalan Quetzal (GTQ)', 'GNF': 'Guinean Franc (GNF)',
    'GYD': 'Guyanese Dollar (GYD)', 'HTG': 'Haitian Gourde (HTG)', 'HNL': 'Honduran Lempira (HNL)', 'IRR': 'Iranian Rial (IRR)',
    'IQD': 'Iraqi Dinar (IQD)', 'JMD': 'Jamaican Dollar (JMD)', 'KGS': 'Kyrgyzstani Som (KGS)', 'LAK': 'Lao Kip (LAK)',
    'LBP': 'Lebanese Pound (LBP)', 'LRD': 'Liberian Dollar (LRD)', 'MGA': 'Malagasy Ariary (MGA)', 'MWK': 'Malawian Kwacha (MWK)',
    'MVR': 'Maldivian Rufiyaa (MVR)', 'MUR': 'Mauritian Rupee (MUR)', 'MZN': 'Mozambican Metical (MZN)', 'NAD': 'Namibian Dollar (NAD)',
    'NIO': 'Nicaraguan Córdoba (NIO)', 'PAB': 'Panamanian Balboa (PAB)', 'PGK': 'Papua New Guinean Kina (PGK)', 'PYG': 'Paraguayan Guaraní (PYG)',
    'RWF': 'Rwandan Franc (RWF)', 'WST': 'Samoan Tala (WST)', 'STD': 'São Tomé and Príncipe Dobra (STD)', 'SLL': 'Sierra Leonean Leone (SLL)',
    'SOS': 'Somali Shilling (SOS)', 'SSP': 'South Sudanese Pound (SSP)', 'SRD': 'Surinamese Dollar (SRD)', 'SZL': 'Eswatini Lilangeni (SZL)',
    'TJS': 'Tajikistani Somoni (TJS)', 'TZS': 'Tanzanian Shilling (TZS)', 'TOP': 'Tongan Paʻanga (TOP)', 'TTD': 'Trinidad and Tobago Dollar (TTD)',
    'UGX': 'Ugandan Shilling (UGX)', 'UYU': 'Uruguayan Peso (UYU)', 'VUV': 'Vanuatu Vatu (VUV)', 'YER': 'Yemeni Rial (YER)',
    'ZMW': 'Zambian Kwacha (ZMW)', 'ZWL': 'Zimbabwean Dollar (ZWL)'
};

const majorCurrencies = ["USD", "EUR", "GBP", "SGD", "JPY", "IDR", "THB", "CNY", "AUD"];

// --- API Setup ---
const V6_API_KEY = 'YOUR_V6_API_KEY_HERE'; 
const API_URL = `https://v6.exchangerate-api.com/v6/${V6_API_KEY}/latest/MYR`; 

// Hardcoded fallback rates (MYR as base: 1 MYR = X Foreign Currency)
const fallbackRates = {
    "MYR": 1, "USD": 0.2120, "EUR": 0.1945, "GBP": 0.1650, "SGD": 0.2855,
    "JPY": 31.40,  "AUD": 0.3180, "CAD": 0.2890, "CNY": 1.50,
    "THB": 7.70,   "IDR": 3300.00, "HKD": 1.6500, "INR": 17.65,
    "PHP": 11.75,  "KRW": 275.00, "VND": 5000.00, "SAR": 0.7950, 
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
    
    if (!res.ok) {
        throw new Error(`API returned HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    
    if (data.result === 'success' && data.conversion_rates && Object.keys(data.conversion_rates).length > 0) {
        ratesData = data.conversion_rates; 
        currencyResult.innerText = 'Rates updated live via API.';
    } else {
        throw new Error(data.error || "API returned malformed or failed data.");
    }
    
  } catch(error) {
    console.warn("API fetch failed, falling back to local data:", error);
    ratesData = fallbackRates;
    currencyResult.innerText = 'Using offline/fallback currency rates.';
  } finally {
    if (Object.keys(ratesData).length > 0) {
        populateDropdowns();
        populateRatesTable();
    } else {
        ratesBody.innerHTML = '<tr><td colspan="2">FATAL ERROR: Failed to load any currency data.</td></tr>';
    }
  }
}

function populateDropdowns() {
  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  
  from.innerHTML = ""; to.innerHTML = "";

  // Populate dropdowns using the static, comprehensive list (currencyList)
  Object.keys(currencyList).sort().forEach(code => {
    const name = currencyList[code];
    from.add(new Option(name, code));
    to.add(new Option(name, code));
  });

  // Set default values using codes
  from.value = "USD";
  to.value = "MYR";
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
    // If ratesData is missing a currency, check if it's in the fallback list
    if (fallbackRates[from] && fallbackRates[to]) {
      ratesData = fallbackRates; // Temporarily use fallback rates for calculation
    } else {
      resultElem.innerText = `Conversion rate for ${from} or ${to} not found in available rate data.`;
      return;
    }
  }

  // Conversion formula using MYR as the implicit base
  const result = amount * (ratesData[to] / ratesData[from]); 
  
  resultElem.innerText = `${amount.toFixed(2)} ${from} = ${result.toFixed(2)} ${to}`;
};

// RATE TABLE
function populateRatesTable() {
  const tbody = document.getElementById("ratesBody");
  tbody.innerHTML = "";

  const displayCurrencies = majorCurrencies;

  displayCurrencies.forEach(code => {
    if (!ratesData[code] || code === "MYR") return;
    const row = document.createElement("tr");
    
    const rate = ratesData[code]; 

    row.innerHTML = `
      <td>${code}</td>
      <td>${rate.toFixed(4)}</td>`;
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
  const selectFrom = document.getElementById("unit-from");
  const selectTo = document.getElementById("unit-to");
  
  selectFrom.innerHTML = "";
  unitOptions[cat].forEach(u => selectFrom.add(new Option(u, u)));

  selectTo.innerHTML = "";
  unitOptions[cat].forEach(u => selectTo.add(new Option(u, u)));
  
  selectFrom.value = unitOptions[cat][0];
  selectTo.value = unitOptions[cat][1] || unitOptions[cat][0];
  
  document.getElementById("unit-result").innerText = '';
}

document.getElementById("unit-category").onchange = populateUnitDropdowns;

function convertUnit() {
  const val = parseFloat(document.getElementById("unit-value").value);
  const fromUnit = document.getElementById("unit-from").value;
  const toUnit = document.getElementById("unit-to").value;
  const category = document.getElementById("unit-category").value;
  const resultElem = document.getElementById("unit-result");
  let result;
  let baseValue;

  if (isNaN(val) || val === 0) {
    resultElem.innerText = "Please enter a valid value.";
    return;
  }
  
  try {
    if (category === 'length') {
      // Base: meter (m)
      if (fromUnit === "cm") baseValue = val / 100;
      else if (fromUnit === "mm") baseValue = val / 1000;
      else if (fromUnit === "km") baseValue = val * 1000;
      else if (fromUnit === "in") baseValue = val * 0.0254;
      else if (fromUnit === "ft") baseValue = val * 0.3048;
      else baseValue = val; 

      if (toUnit === "cm") result = baseValue * 100;
      else if (toUnit === "mm") result = baseValue * 1000;
      else if (toUnit === "km") result = baseValue / 1000;
      else if (toUnit === "in") result = baseValue / 0.0254;
      else if (toUnit === "ft") result = baseValue / 0.3048;
      else result = baseValue; 

    } else if (category === 'weight') {
      // Base: kilogram (kg)
      if (fromUnit === "g") baseValue = val / 1000;
      else if (fromUnit === "lb") baseValue = val * 0.453592;
      else if (fromUnit === "oz") baseValue = val * 0.0283495;
      else baseValue = val; // kg

      if (toUnit === "g") result = baseValue * 1000;
      else if (toUnit === "lb") result = baseValue / 0.453592;
      else if (toUnit === "oz") result = baseValue / 0.0283495;
      else result = baseValue; // kg

    } else if (category === 'temperature') {
        // Base: Celsius (°C)
        if (fromUnit === '°C') baseValue = val;
        else if (fromUnit === '°F') baseValue = (val - 32) * (5/9);
        else if (fromUnit === 'K') baseValue = val - 273.15;
        
        if (toUnit === '°C') result = baseValue;
        else if (toUnit === '°F') result = (baseValue * (9/5)) + 32;
        else if (toUnit === 'K') result = baseValue + 273.15;
    
    } else if (category === 'speed') {
      // Base: meters per second (m/s)
      if (fromUnit === "km/h") baseValue = val / 3.6;
      else if (fromUnit === "mph") baseValue = val / 2.237;
      else if (fromUnit === "knot") baseValue = val * 0.514444;
      else baseValue = val; // m/s

      if (toUnit === "km/h") result = baseValue * 3.6;
      else if (toUnit === "mph") result = baseValue * 2.237;
      else if (toUnit === "knot") result = baseValue / 0.514444;
      else result = baseValue; // m/s

    } else {
      resultElem.innerText = `Conversion for ${category} is not yet supported.`;
      return;
    }
    
    resultElem.innerText = `${val} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`;

  } catch(e) {
    resultElem.innerText = `An error occurred during conversion.`;
    console.error(e);
  }
}

// ================= PASSWORD =================
function generatePassword() {
  const length = parseInt(document.getElementById("password-length").value) || 12;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let pass = "";
  for(let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById("password-result").innerText = pass;
}

// ================= QR =================
function generateQR() {
  const text = document.getElementById("qr-input").value;
  const qrResultDiv = document.getElementById("qr-result");

  if (!text) {
    qrResultDiv.innerHTML = "<p style='color: #222;'>Please enter text or a URL to generate a QR code.</p>";
    return;
  }
  
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  
  qrResultDiv.innerHTML = `<img src="${apiUrl}" alt="Generated QR Code for ${text}">`;
}

// ================= AGE =================
function calculateAge() {
  const dobInput = document.getElementById("birthdate").value;
  const resultElem = document.getElementById("age-result");
  
  if (!dobInput) {
    resultElem.innerText = "Please select your date of birth.";
    return;
  }
  
  const dob = new Date(dobInput);
  const today = new Date();

  if (dob > today) {
    resultElem.innerText = "Are you a time traveler? Please select a date in the past.";
    return;
  }
  
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
  }

  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    months += 12;
  }

  resultElem.innerText = `${age} years old\n(${months} months and ${days} days remaining for your next birthday)`;
}

// ================= IMAGE RESIZER =================

function fileToDataUri(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

async function resizeAndDisplayImage() {
  const fileInput = document.getElementById("image-upload");
  const widthInput = document.getElementById("resize-width");
  const heightInput = document.getElementById("resize-height");
  const resultDiv = document.getElementById("image-result-display");
  const resultText = document.getElementById("image-result-text");

  const file = fileInput.files[0];
  const newWidth = parseInt(widthInput.value);
  const newHeight = parseInt(heightInput.value);

  if (!file || isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
    resultText.innerText = "Please upload an image and specify valid width/height.";
    resultDiv.innerHTML = '';
    return;
  }
  
  resultText.innerText = "Resizing...";
  resultDiv.innerHTML = '';
  
  const originalImageSrc = await fileToDataUri(file);
  const img = new Image();
  img.src = originalImageSrc;

  img.onload = function() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.9); 

    const resizedImgElement = document.createElement("img");
    resizedImgElement.src = resizedDataUrl;
    resizedImgElement.style.maxWidth = '100%';
    resizedImgElement.style.height = 'auto';
    resizedImgElement.style.marginTop = '15px';
    resultDiv.appendChild(resizedImgElement);

    const downloadLink = document.createElement('a');
    downloadLink.href = resizedDataUrl;
    downloadLink.download = `${file.name.replace(/\.[^/.]+$/, "")}_resized.jpeg`;
    downloadLink.textContent = 'Download Resized Image';
    downloadLink.className = 'download-link-btn';
    resultDiv.appendChild(downloadLink);
    
    resultText.innerText = `Image successfully resized to ${newWidth}x${newHeight}px.`;
  };

  img.onerror = function() {
      resultText.innerText = "Error loading image file.";
  };
}

// ================= INIT AFTER HTML LOADED =================
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencyRates();
  populateUnitDropdowns();
});