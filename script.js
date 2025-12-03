/* ===== SPA HASH ROUTING ===== */
function showTool(id){
  document.querySelectorAll(".tool-panel").forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
  window.location.hash=id;
}
function goBack(){ history.back(); }
window.addEventListener("hashchange",()=>{
  const id=location.hash.replace("#","");
  document.querySelectorAll(".tool-panel").forEach(p=>p.style.display="none");
  if(id) document.getElementById(id).style.display="block";
});

/* SEARCH */
document.getElementById("tool-search").addEventListener("input",function(){
  const q=this.value.toLowerCase();
  document.querySelectorAll(".tool-card").forEach(c=>
    c.style.display=c.innerText.toLowerCase().includes(q)?"block":"none"
  );
});

/************ CURRENCY ************/
const topCurrencies=["USD","EUR","GBP","JPY","AUD","CAD","SGD","CHF","THB","IDR","CNY","HKD","NZD","SAR","AED","INR","KRW","PHP","VND","BDT","PKR","MMK","BRL","ZAR","SEK","NOK","DKK","PLN","TRY","HUF","EGP","QAR","KWD","BHD","OMR","LKR","NPR","KES","RUB","MXN","ARS","NGN","COP","CLP","CZK","RON","ILS","MAD","MYR"];
const fromCurrency=document.getElementById("fromCurrency");
const toCurrency=document.getElementById("toCurrency");
let favFrom=JSON.parse(localStorage.getItem("fav_from"))||[];
let favTo=JSON.parse(localStorage.getItem("fav_to"))||[];

function buildDropdown(target, favs){
  target.innerHTML="";
  favs.forEach(f=>target.innerHTML+=`<option value="${f}">⭐ ${f}</option>`);
  topCurrencies.forEach(c=>{ if(!favs.includes(c)) target.innerHTML+=`<option value="${c}">${c}</option>`; });
}
function refreshCurrencyUI(){ buildDropdown(fromCurrency,favFrom); buildDropdown(toCurrency,favTo);}
refreshCurrencyUI();

document.getElementById("favFromBtn").onclick=()=>{
  const c=fromCurrency.value;
  favFrom=favFrom.includes(c)?favFrom.filter(x=>x!==c):[...favFrom,c];
  localStorage.setItem("fav_from",JSON.stringify(favFrom));
  refreshCurrencyUI();
};
document.getElementById("favToBtn").onclick=()=>{
  const c=toCurrency.value;
  favTo=favTo.includes(c)?favTo.filter(x=>x!==c):[...favTo,c];
  localStorage.setItem("fav_to",JSON.stringify(favTo));
  refreshCurrencyUI();
};

document.getElementById("convertBtn").onclick=()=>{
  const amt=parseFloat(document.getElementById("amount").value);
  if(isNaN(amt)) return currencyResult.innerText="Enter amount";
  const r=(topCurrencies.indexOf(toCurrency.value)+1)/(topCurrencies.indexOf(fromCurrency.value)+1);
  currencyResult.innerText=`${amt} ${fromCurrency.value} ≈ ${(amt*r).toFixed(2)} ${toCurrency.value}`;
};

/************ UNIT ************/
const unitCategory=document.getElementById("unit-category");
const unitFrom=document.getElementById("unit-from");
const unitTo=document.getElementById("unit-to");
const units={
  length:{m:1,cm:100,mm:1000,km:0.001,inch:39.37,ft:3.28},
  weight:{kg:1,g:1000,mg:1000000,lb:2.2,oz:35.27},
  temperature:"special",
  speed:{"m/s":1,"km/h":3.6,mph:2.23}
};

function loadUnits(){
  const cat=unitCategory.value;
  unitFrom.innerHTML=unitTo.innerHTML="";
  if(cat==="temperature"){
    ["Celsius","Fahrenheit","Kelvin"].forEach(u=>{
      unitFrom.innerHTML+=`<option>${u}</option>`;
      unitTo.innerHTML+=`<option>${u}</option>`;
    });
  }else{
    Object.keys(units[cat]).forEach(u=>{
      unitFrom.innerHTML+=`<option value="${u}">${u}</option>`;
      unitTo.innerHTML+=`<option value="${u}">${u}</option>`;
    });
  }
}
unitCategory.onchange=loadUnits;
loadUnits();

function convertUnit(){
  const val=parseFloat(unitValue.value);
  if(isNaN(val)) return unitResult.innerText="Enter value";
  const from=unitFrom.value,to=unitTo.value,cat=unitCategory.value;
  if(cat==="temperature"){
    let k=(from==="Celsius")?val+273.15:(from==="Fahrenheit")?((val-32)*5/9+273.15):val;
    let result=(to==="Celsius")?k-273.15:(to==="Fahrenheit")?((k-273.15)*9/5+32):k;
    unitResult.innerText=`${val} ${from} = ${result.toFixed(2)} ${to}`;
  }else{
    const base=val/units[cat][from];
    const result=base*units[cat][to];
    unitResult.innerText=`${val} ${from} = ${result.toFixed(4)} ${to}`;
  }
}
document.getElementById("unit-convert-btn").addEventListener("click", convertUnit);

/************ QR ************/
function generateQR(){
  const txt=qr-input.value;
  qr-result.innerHTML=`<img id="qrImg" src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(txt)}">`;
  qr-download.style.display="block";
}
qr-download.onclick=()=>{
  const a=document.createElement("a");
  a.download="qrcode.png";
  a.href=document.getElementById("qrImg").src;
  a.click();
};

/************ IMAGE ************/
function resizeAndDisplayImage(){
  const f=document.getElementById("image-upload").files[0];
  if(!f) return alert("Upload image");
  const w=+resize-width.value,h=+resize-height.value;
  const r=new FileReader();
  r.onload=e=>{
    const img=new Image(); img.onload=()=>{
      const c=document.createElement("canvas");
      c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
      const url=c.toDataURL("image/png");
      image-result-display.innerHTML=`<img id="resizedImg" src="${url}">`;
      image-result-text.innerText="Image resized!";
      img-download.style.display="block";
    }; img.src=e.target.result;
  }; r.readAsDataURL(f);
}
img-download.onclick=()=>{
  const a=document.createElement("a");
  a.download="resized.png";
  a.href=document.getElementById("resizedImg").src;
  a.click();
};
