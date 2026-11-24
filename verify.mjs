// Kontrollerar uppgiftsgeneratorn i public/app.js:
//  – nivå 1 ligger i 11–29, nivå 2 i 30–89, nivå 3 är jämnt tiotal (30–90) eller tal som slutar på 9,
//  – tiotal + ental ger alltid talet, ental ≤ 9,
//  – talordet stämmer för alla 10–99 (tabell nedan, kontrollerad mot svensk räkneord),
//  – frågan innehåller talordet och förklaringen rätt tiotal/ental.
//   node verify.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./public/app.js", import.meta.url), "utf8");
const start = src.indexOf("var TALORD = [");
const end = src.indexOf("* 2. Kotten");
if (start < 0 || end < 0) throw new Error("hittar inte den rena generatorn i app.js");
const ren = src.slice(start, src.lastIndexOf("/*", end));
const G = eval("(function(){" + ren + "\nreturn {uppgift:uppgift, talord:talord};})()");

// Oberoende tabell för 10–99, skriven för hand.
const TIO = ["", "tio", "tjugo", "trettio", "fyrtio", "femtio", "sextio", "sjuttio", "åttio", "nittio"];
const ETT = ["noll", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio",
  "tio", "elva", "tolv", "tretton", "fjorton", "femton", "sexton", "sjutton", "arton", "nitton"];
const facit = (n) => n < 20 ? ETT[n] : TIO[Math.floor(n / 10)] + (n % 10 ? ETT[n % 10] : "");

let seed = 20261124;
Math.random = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

let fel = 0;
const kolla = (c, m, p) => { if (!c) { fel++; if (fel <= 25) console.log("FEL", m, JSON.stringify(p)); } };
const antal = { 1: 0, 2: 0, 3: 0 };
const tal = { 1: new Set(), 2: new Set(), 3: new Set() };

for (const n of [10, 20, 30, 40, 50, 60, 70, 80, 90, 99, 11, 21, 43, 58, 67, 75, 84]) {
  kolla(G.talord(n) === facit(n), "fel talord för " + n + ": " + G.talord(n));
}

for (let k = 0; k < 30000; k++) {
  for (const niva of [1, 2, 3]) {
    const p = G.uppgift(niva);
    antal[niva]++; tal[niva].add(p.tal);

    kolla(p.niva === niva, "fel nivå", p.niva);
    kolla(p.tiotal === Math.floor(p.tal / 10), "fel tiotal", p);
    kolla(p.ental === p.tal % 10, "fel ental", p);
    kolla(p.tiotal * 10 + p.ental === p.tal, "delarna ger inte talet", p);
    kolla(p.ental >= 0 && p.ental <= 9, "ental utanför 0–9", p);
    kolla(p.tal >= 10 && p.tal <= 99, "tal utanför 10–99", p);
    kolla(p.ord === facit(p.tal), "fel ord för talet", p);
    kolla(p.fraga === "Bygg " + facit(p.tal) + ".", "fel fråga", p);
    kolla(p.text.indexOf(String(p.tiotal) + " tiotal") > 0 && p.text.indexOf(String(p.ental) + " ental") > 0,
      "förklaringen saknar tiotal/ental", p);

    if (niva === 1) kolla(p.tal >= 11 && p.tal <= 29, "nivå 1 utanför 11–29", p);
    if (niva === 2) kolla(p.tal >= 30 && p.tal <= 89, "nivå 2 utanför 30–89", p);
    if (niva === 3) {
      const jamnt = p.tal % 10 === 0 && p.tal >= 30 && p.tal <= 90;
      const nia = p.tal % 10 === 9 && p.tal >= 19 && p.tal <= 89;
      kolla(jamnt || nia, "nivå 3 är varken jämnt tiotal eller tal som slutar på 9", p);
    }
  }
}

// Nivå 3 måste innehålla båda slagen, och alla tal i serien ska dyka upp.
const n3 = [...tal[3]];
kolla(n3.some(t => t % 10 === 0), "nivå 3 saknar jämna tiotal");
kolla(n3.some(t => t % 10 === 9), "nivå 3 saknar tal som slutar på 9");
kolla(n3.length === 15, "nivå 3 ska ha 15 olika tal, har " + n3.length);

// Nivå 1 och 2 ska täcka sina intervall brett.
kolla(tal[1].size === 19, "nivå 1 ska ge alla 19 tal, gav " + tal[1].size);
kolla(tal[2].size === 60, "nivå 2 ska ge alla 60 tal, gav " + tal[2].size);

for (const niva of [1, 2, 3]) console.log("nivå " + niva + ":", antal[niva], "uppgifter,", tal[niva].size, "olika tal");
console.log(talordSvep());
function talordSvep() {
  for (let n = 10; n <= 99; n++) if (G.talord(n) !== facit(n)) { fel++; return "FEL talord " + n; }
  return "talord 10–99: alla 90 stämmer";
}
console.log(fel === 0 ? "OK – 0 fel" : fel + " FEL");
process.exit(fel === 0 ? 0 : 1);