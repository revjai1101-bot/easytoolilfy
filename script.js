/* ===== HASH SPA NAVIGATION ===== */
function showTool(id) {
  document.querySelectorAll(".tool-panel").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
  window.location.hash = id;
  window.scrollTo(0, 0);
}

function goBack() {
  window.history.back();
}

window.addEventListener("hashchange", () => {
  const id = window.location.hash.replace("#", "");
  document.querySelectorAll(".tool-panel").forEach(p => p.style.display = "none");
  if (id) document.getElementById(id).style.display = "block";
});

/* ===== Search Filter ===== */
document.getElementById("tool-search").addEventListener("input", function () {
  const q = this.value.toLowerCase();
  document.querySelectorAll(".tool-card").forEach(c =>
    c.style.display = c.innerText.toLowerCase().includes(q) ? "block" : "none"
  );
});

/* ===== Dropdown Scroll Fix ===== */
document.querySelectorAll("select").forEach(sel => {
  sel.addEventListener("mousedown", () => document.body.style.overflow = "hidden");
  sel.addEventListener("blur", () => document.body.style.overflow = "");
  sel.addEventListener("change", () => document.body.style.overflow = "");
});

/* ===== Tools ===== */
document.getElementById("convertBtn").addEventListener("click", () =>
  document.getElementById("currencyResult").innerText = "Live rates disabled"
);

function convertUnit() {
  document.getElementById("unit-result").innerText = "Converted!";
}

function generatePassword() {
  const len = document.getElementById("password-length").value;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  document.getElementById("password-result").innerText =
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function generateQR() {
  const t = document.getElementById("qr-input").value;
  document.getElementById("qr-result").innerHTML =
    `<img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(t)}">`;
}

function calculateAge() {
  const d = new Date(document.getElementById("birthdate").value);
  const age = new Date(Date.now() - d).getUTCFullYear() - 1970;
  document.getElementById("age-result").innerText = `Age: ${age}`;
}

function resizeAndDisplayImage() {
  const f = document.getElementById("image-upload").files[0];
  if (!f) return alert("Upload image first");
  const w = +document.getElementById("resize-width").value;
  const h = +document.getElementById("resize-height").value;
  const r = new FileReader();
  r.onload = e => {
    const i = new Image();
    i.onload = () => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(i, 0, 0, w, h);
      document.getElementById("image-result-display").innerHTML =
        `<img src="${c.toDataURL("image/jpeg")}" style="max-width:100%;">`;
      document.getElementById("image-result-text").innerText = "Image resized successfully!";
    };
    i.src = e.target.result;
  };
  r.readAsDataURL(f);
}
