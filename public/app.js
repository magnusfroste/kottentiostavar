/* Kotten och tiostavarna – positionssystemet (tiotal och ental).
   Statisk app, inga beroenden. Tränar MA.1-3.1.2. Barnet bygger ett
   tvåsiffrigt tal med tiostavar och entalsklossar; tio ental växlas
   automatiskt till en tiostav. Allt ritas i kod: bitarna i SVG, Kotten som
   egen SVG-figur, ljud i WebAudio + talsyntes. Uppgiftsgeneratorn är en ren
   funktion som verify.mjs kontrollerar. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. Ren uppgiftsgenerator                                            *
   * ------------------------------------------------------------------ */
  var RUNDA = 6;

  var TALORD = ["noll", "ett", "två", "tre", "fyra", "fem", "sex", "sju",
    "åtta", "nio", "tio", "elva", "tolv", "tretton", "fjorton", "femton",
    "sexton", "sjutton", "arton", "nitton"];
  var TIOTAL = ["", "tio", "tjugo", "trettio", "fyrtio", "femtio", "sextio",
    "sjuttio", "åttio", "nittio"];

  /* 10–99 som ord: "fyrtiotre", "tjugoett", "nittio" */
  function talord(n) {
    if (n < 20) return TALORD[n];
    var t = Math.floor(n / 10), e = n % 10;
    return TIOTAL[t] + (e ? TALORD[e] : "");
  }

  function heltal(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function blanda(a) {
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* Nivå 1: 11–29 (högst två tiostavar).
     Nivå 2: 30–89.
     Nivå 3: talen där det gäller att sluta i tid – jämna tiotal (30–90) och
     tal som slutar på nio (19–89). */
  function uppgift(niva) {
    niva = niva === 2 || niva === 3 ? niva : 1;
    var tal;
    if (niva === 1) tal = heltal(11, 29);
    else if (niva === 2) tal = heltal(30, 89);
    else tal = Math.random() < 0.5 ? 10 * heltal(3, 9) : 10 * heltal(1, 8) + 9;

    var tiotal = Math.floor(tal / 10), ental = tal % 10;
    var ord = talord(tal);
    return {
      niva: niva,
      tal: tal,
      tiotal: tiotal,
      ental: ental,
      ord: ord,
      fraga: "Bygg " + ord + ".",
      text: tal + " är " + tiotal + " tiotal och " + ental + " ental."
    };
  }

  /* ------------------------------------------------------------------ *
   * 2. Kotten (egen SVG-figur, fem uttryck – samma som i familjen)       *
   * ------------------------------------------------------------------ */
  function kottenSvg(uttryck, klass) {
    var F = "#b07d4b", M = "#8a5f36", O = "#2b2118", mun, ogen = "", extra = "";
    if (uttryck === "hejar") { mun = '<path d="M22 36 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else if (uttryck === "firar") {
      mun = '<path d="M21 34 q9 12 18 0" fill="#fff"/><path d="M21 34 q9 12 18 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
      extra = '<path d="M10 12 l3 6M50 12 l-3 6M30 6 v5" stroke="#e8a33d" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    }
    else if (uttryck === "tanker") { mun = '<path d="M24 37 h11" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>'; ogen = '<circle cx="46" cy="24" r="4" fill="none" stroke="' + M + '" stroke-width="1.6" opacity=".5"/>'; }
    else if (uttryck === "funderar") { mun = '<path d="M22 38 q8 -6 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else { mun = '<path d="M22 34 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    var oga = '<circle cx="23" cy="24" r="5.2" fill="#fff"/><circle cx="37" cy="24" r="5.2" fill="#fff"/>' +
      '<circle cx="24" cy="24.6" r="2.5" fill="' + O + '"/><circle cx="36" cy="24.6" r="2.5" fill="' + O + '"/>';
    return '<svg class="' + (klass || "kotten-svg") + '" viewBox="0 0 60 60" aria-hidden="true">' + extra +
      '<path d="M30 6 q9 4 12 12 q9 12 4 24 q-4 12 -16 14 q-12 -2 -16 -14 q-5 -12 4 -24 q3 -8 12 -12z" fill="' + F + '"/>' +
      '<path d="M19 20 q11 -5 22 0M16 30 q14 -5 28 0M16 40 q14 -4 28 0" stroke="' + M + '" stroke-width="1.7" fill="none" opacity=".85" stroke-linecap="round"/>' +
      oga + ogen + mun + '</svg>';
  }

  /* ------------------------------------------------------------------ *
   * 3. Ljud (WebAudio + talsyntes, skapas vid första gesten)             *
   * ------------------------------------------------------------------ */
  var ac = null, ljudPa = true;
  function ljud(frekvens, längd, typ) {
    if (!ljudPa) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || "sine"; o.frequency.value = frekvens;
      g.gain.value = 0.001; o.connect(g); g.connect(ac.destination);
      var t = ac.currentTime;
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + längd);
      o.start(t); o.stop(t + längd + 0.02);
    } catch (e) { }
  }
  function sag(text) {
    if (!ljudPa || !text) return;
    try {
      if (!("speechSynthesis" in window)) return;
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "sv-SE"; u.rate = 0.95; u.volume = 0.9;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) { }
  }
  function spar(namn, värde) { try { if (window.skolappar && window.skolappar.event) window.skolappar.event(namn, värde); } catch (e) { } }

  /* ------------------------------------------------------------------ *
   * 4. Brädan: tiostavar och entalsklossar                              *
   * ------------------------------------------------------------------ */
  var S = {
    skärm: "start", niva: 1, runda: 1, item: 0, svarRätt: 0, stjärnor: 0,
    felförsök: 0, p: null, tiotal: 0, ental: 0, klar: false, senast: null
  };

  var PAD = 12;

  function ritaScen() {
    var el = document.getElementById("scen");
    if (!el || !S.p) return;
    var w = el.clientWidth, hh = el.clientHeight;
    if (!w || !hh) return;

    /* Entalsklossarna ligger i ett 3×3-rutnät, så brädan behöver bara tre
       kolumner för dem och bitarna blir stora även på en telefon. Bygget
       centreras och står på en golvlinje, så det ser likadant ut hela tiden. */
    var nTen = Math.max(1, S.p.tiotal);
    var cols = nTen + 4;
    var slot = Math.floor(Math.min((w - 2 * PAD) / (cols + 0.6), (hh - 2 * PAD) / 8.7));
    slot = Math.max(slot, 6);
    var rodW = slot * 0.78, rodH = rodW * 10, cube = rodW;
    var bottom = hh - PAD - 6;
    var top = bottom - rodH;
    var X0 = Math.max(PAD, (w - (nTen + 3.8) * slot) / 2);
    var out = [];

    out.push('<rect x="0" y="0" width="' + w + '" height="' + hh + '" fill="#fff"/>');

    /* avdelare mellan tiostavar och ental */
    var divX = X0 + (nTen + 0.45) * slot;
    out.push('<line x1="' + divX + '" y1="' + (top - 6) + '" x2="' + divX + '" y2="' + (bottom + 4) + '" stroke="var(--linje)" stroke-width="2" stroke-dasharray="7 7"/>');

    /* tiostavar */
    var hoger = X0;
    for (var i = 0; i < S.tiotal; i++) {
      var x = X0 + i * slot + (slot - rodW) / 2;
      var ny = S.senast && S.senast.sort === "tio" && i === S.tiotal - 1;
      out.push('<g class="' + (ny ? "bit-ny" : "") + '">' +
        '<rect x="' + x + '" y="' + top + '" width="' + rodW + '" height="' + rodH + '" rx="' + (rodW * 0.16) + '" fill="var(--trä)" stroke="var(--trä-mörk)" stroke-width="1.6"/>');
      for (var k = 1; k < 10; k++) {
        out.push('<line x1="' + x + '" y1="' + (top + rodH * k / 10) + '" x2="' + (x + rodW) + '" y2="' + (top + rodH * k / 10) + '" stroke="#a86f36" stroke-width="1.2"/>');
      }
      out.push('</g>');
      hoger = x + rodW;
    }

    /* entalsklossar i 3×3, ställda på golvet */
    var ettX = X0 + (nTen + 0.75) * slot;
    for (var j = 0; j < S.ental; j++) {
      var kol = j % 3, rad = Math.floor(j / 3);
      var cx = ettX + kol * slot + (slot - cube) / 2;
      var cy = bottom - cube - rad * (cube + Math.max(2, cube * 0.09));
      var nyE = S.senast && S.senast.sort === "ett" && j === S.ental - 1;
      out.push('<g class="' + (nyE ? "bit-ny" : "") + '"><rect x="' + cx + '" y="' + cy + '" width="' + cube + '" height="' + cube + '" rx="' + (cube * 0.16) + '" fill="var(--trä)" stroke="var(--trä-mörk)" stroke-width="1.6"/></g>');
      hoger = Math.max(hoger, cx + cube);
    }

    /* golvlinjen */
    out.push('<line x1="' + (X0 - 6) + '" y1="' + (bottom + 2) + '" x2="' + (X0 + (nTen + 3.6) * slot) + '" y2="' + (bottom + 2) + '" stroke="var(--linje)" stroke-width="3" stroke-linecap="round"/>');

    /* när talet är klart: guldram runt allt som är byggt */
    if (S.klar) {
      out.push('<rect x="' + (X0 - 6) + '" y="' + (top - 6) + '" width="' + (hoger - X0 + 14) + '" height="' + (rodH + 14) + '" rx="14" fill="none" stroke="var(--stjärna)" stroke-width="5" opacity=".9"/>');
    }

    el.setAttribute("viewBox", "0 0 " + w + " " + hh);
    el.innerHTML = out.join("");
  }

  function ritaPrickar() {
    var s = "", i;
    for (i = 0; i < RUNDA; i++) s += '<i class="' + (i < S.item ? "klar" : "") + '"></i>';
    document.getElementById("prickar").innerHTML = s;
  }
  function ritaStjärnor() {
    document.getElementById("stjarnor").textContent = "★".repeat(Math.min(S.stjärnor, 12)) + (S.stjärnor > 12 ? "+" : "");
  }
  function kottenByt(uttryck) {
    var el = document.getElementById("kotten");
    if (el) el.innerHTML = kottenSvg(uttryck, "kotten-svg");
  }

  /* ------------------------------------------------------------------ *
   * 5. Spelflöde                                                       *
   * ------------------------------------------------------------------ */
  var idleTimer = null, vinkTimer = null;

  function vink(av) {
    ["plus-tio", "plus-ett", "angra"].forEach(function (id) { document.getElementById(id).classList.remove("vink"); });
    if (!av) return;
    document.getElementById(av).classList.add("vink");
  }

  function behovsKnapp() {
    var p = S.p;
    if (S.tiotal > p.tiotal) return "angra";
    if (S.tiotal < p.tiotal) return "plus-tio";
    return "plus-ett";
  }

  function tipsa(auto) {
    if (S.skärm !== "spel" || S.klar) return;
    var p = S.p, id = behovsKnapp(), text;
    if (id === "angra") text = "Det är för många. Ta bort en bit.";
    else if (id === "plus-tio") text = "Lägg till en tiostav. " + p.fraga;
    else text = "Lägg till en kloss. " + p.fraga;
    sag(text);
    vink(id);
    spar("hint");
    if (!auto) { kottenByt("tanker"); setTimeout(function () { if (!S.klar) kottenByt("glad"); }, 1600); }
  }

  function startIdle() {
    clearTimeout(idleTimer);
    vink(null);
    idleTimer = setTimeout(function () {
      if (S.skärm === "spel" && !S.klar) tipsa(true);
    }, 11000);
  }

  function visaMal() {
    var p = S.p;
    document.getElementById("mal-tal").textContent = String(p.tal);
    document.getElementById("mal-ord").textContent = p.ord;
    document.querySelector(".mal").classList.toggle("klar", !!S.klar);
  }

  function nyUppgift() {
    S.p = uppgift(S.niva);
    S.tiotal = 0; S.ental = 0; S.klar = false; S.felförsök = 0; S.senast = null;
    visaMal(); ritaScen(); ritaPrickar();
    sag(S.p.fraga);
    startIdle();
  }

  /* Lägg till en bit. Tio ental blir automatiskt en tiostav – spelet lär ut
     växlingen utan en förklarande rad. */
  function laggTill(sort) {
    if (S.skärm !== "spel" || S.klar) return;
    clearTimeout(idleTimer); vink(null);
    if (sort === "tio") { S.tiotal++; S.senast = { sort: "tio" }; }
    else {
      S.ental++; S.senast = { sort: "ett" };
      ljud(430, 0.07, "triangle");
      if (S.ental >= 10) {
        S.ental -= 10; S.tiotal++;
        setTimeout(function () { ljud(560, 0.14, "sine"); sag("Tio ental blir en tiostav."); }, 140);
      }
    }
    kontroll();
  }

  function angra() {
    if (S.skärm !== "spel" || S.klar) return;
    clearTimeout(idleTimer); vink(null);
    if (S.ental > 0) S.ental--;
    else if (S.tiotal > 0) S.tiotal--;
    else { sag("Brädan är tom. Lägg till en bit."); }
    S.senast = null;
    ljud(300, 0.09, "triangle");
    kontroll();
  }

  function kontroll() {
    var v = S.tiotal * 10 + S.ental, p = S.p;
    if (v === p.tal) {
      S.klar = true; S.item++; S.svarRätt++; S.stjärnor++;
      visaMal(); ritaScen(); ritaPrickar(); ritaStjärnor();
      kottenByt("firar");
      ljud(520, 0.12, "square");
      setTimeout(function () { ljud(780, 0.14, "sine"); }, 130);
      setTimeout(function () { ljud(1040, 0.18, "sine"); }, 260);
      sag("Rätt! " + p.text);
      setTimeout(function () {
        kottenByt("glad");
        if (S.item >= RUNDA) rundaKlar(); else nyUppgift();
      }, 2300);
      return;
    }
    ritaScen();
    if (v > p.tal) {
      S.felförsök++;
      ljud(220, 0.14, "triangle");
      var b = document.querySelector(".brada");
      b.classList.remove("skaka"); void b.offsetWidth; b.classList.add("skaka");
      kottenByt("funderar");
      sag("Det blev för många. Ta bort en bit.");
      vink("angra");
      clearTimeout(idleTimer);
      setTimeout(function () { if (!S.klar) { kottenByt("glad"); startIdle(); } }, 1800);
      return;
    }
    startIdle();
  }

  function rundaKlar() {
    S.skärm = "överlägg";
    var procent = Math.round(100 * S.svarRätt / RUNDA);
    spar("round_done", procent);
    sag("Rundan är klar. " + S.svarRätt + " av " + RUNDA + " rätt.");
    var stegUpp = S.svarRätt >= 5 && S.niva < 3;
    visaOverlay(S.svarRätt >= 5 ? "firar" : "hejar", "Rundan är klar!",
      S.svarRätt + " av " + RUNDA + " tal. " + S.stjärnor + " stjärnor totalt." +
      (stegUpp ? " Nu blir det svårare!" : ""),
      "En runda till →", function () {
        if (stegUpp) { S.niva++; spar("level", S.niva); }
        S.runda++; startaRunda(S.niva);
      }, true);
  }

  function visaOverlay(uttryck, titel, text, knapptext, vidare, medNiva) {
    var ov = document.getElementById("overlay");
    document.getElementById("ov-bild").innerHTML = kottenSvg(uttryck, "ov-kotten");
    document.getElementById("ov-titel").textContent = titel;
    document.getElementById("ov-text").textContent = text;
    var b = document.getElementById("ov-nasta");
    b.textContent = knapptext;
    b.onclick = function () { ov.hidden = true; vidare(); };
    var n = document.getElementById("ov-niva");
    n.hidden = !medNiva;
    n.onclick = function () { ov.hidden = true; S.niva = S.niva >= 3 ? 1 : S.niva + 1; S.runda++; startaRunda(S.niva); };
    ov.hidden = false;
  }

  function startaRunda(niva) {
    S.niva = niva; S.skärm = "spel"; S.item = 0; S.svarRätt = 0; S.felförsök = 0;
    document.getElementById("startskarm").hidden = true;
    document.getElementById("spel").hidden = false;
    document.getElementById("overlay").hidden = true;
    ritaStjärnor(); kottenByt("glad");
    spar("round_start"); spar("level", niva);
    if (niva === 2) setTimeout(function () { sag("Nu blir talen större. Lyssna noga."); }, 1000);
    else if (niva === 3) setTimeout(function () { sag("Lyssna noga – ibland ska du sluta i tid."); }, 1000);
    nyUppgift();
  }

  /* ------------------------------------------------------------------ *
   * 6. Händelser och start                                             *
   * ------------------------------------------------------------------ */
  function ritaLjudIkon() {
    document.getElementById("ljudikon").innerHTML = ljudPa
      ? '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 8a5 5 0 0 1 0 8"/>'
      : '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 9l5 6M20 9l-5 6"/>';
  }

  function bind() {
    document.getElementById("plus-tio").addEventListener("pointerdown", function (e) { e.preventDefault(); laggTill("tio"); });
    document.getElementById("plus-ett").addEventListener("pointerdown", function (e) { e.preventDefault(); laggTill("ett"); });
    document.getElementById("angra").addEventListener("pointerdown", function (e) { e.preventDefault(); angra(); });
    document.getElementById("spela").addEventListener("click", function () { ljud(600, 0.1); startaRunda(1); });
    document.getElementById("hjalp").addEventListener("click", function () { tipsa(false); });
    document.getElementById("ljud").addEventListener("click", function () {
      ljudPa = !ljudPa;
      if (!ljudPa && "speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) { } }
      ritaLjudIkon(); spar("sound_off");
    });
    document.addEventListener("keydown", function (e) {
      if (S.skärm !== "spel") return;
      if (e.key === "1" || e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); laggTill("tio"); }
      if (e.key === "2" || e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); laggTill("ett"); }
      if (e.key === "Backspace" || e.key === "z") { e.preventDefault(); angra(); }
      if (e.key === "h" || e.key === "?") tipsa(false);
    });
    window.addEventListener("resize", function () { if (S.p) ritaScen(); });
    window.addEventListener("orientationchange", function () { setTimeout(function () { if (S.p) ritaScen(); }, 250); });
  }

  function init() {
    bind(); ritaLjudIkon(); ritaStjärnor(); ritaPrickar();
    document.getElementById("kotten-hud").innerHTML = kottenSvg("glad", "kotten-hud");
    kottenByt("glad");
    window.__game = {
      S: S, uppgift: uppgift, talord: talord, RUNDA: RUNDA,
      laggTill: laggTill, angra: angra, kontroll: kontroll,
      startaRunda: startaRunda, nyUppgift: nyUppgift, tipsa: tipsa,
      behovsKnapp: behovsKnapp, ritaScen: ritaScen
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();