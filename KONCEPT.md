# KONCEPT – Kotten och tiostavarna

**Mål (en sak):** barnet ska bygga ett tvåsiffrigt tal av tiostavar och entalsklossar och därmed
förstå att siffrorna i ett tal betyder olika mycket beroende på plats.

**Målgrupp:** FK–2 (innehållet hör till åk 1–3 matematik). Spelbart utan att kunna läsa: målet
visas som siffror, instruktionen läses upp.

**Kärnmekanik (touch först):** överst står målet som en stor siffra ("43") och Kotten säger
"Bygg fyrtiotre". Barnet trycker på **+10** (en tiostav) eller **+1** (en entalskloss) och bygger
talet på brädan; en ångra-knapp tar bort den sista biten. Tio ental förvandlas automatiskt till
en tiostav ("tio ental blir en tiostav") – spelet lär ut växlingen utan en enda förklarande rad.
När brädan visar exakt målet lyser den guld, Kotten firar och nästa tal kommer. Blir det för
många säger Kotten "det blev för många, ta bort en" och ångra-knappen pulserar.

**5-minuterssession:** sex tal per runda (ett bygge tar 10–20 sekunder), "en runda till"-knapp.

**Belöning barnet kan berätta om:** stjärnor, "6 av 6 rätt" – och att det kan säga att 43 är fyra
tiostavar och tre ental.

**Vad barnet lär:** positionssystemet. Nivå 1: 11–29 (högst två tiostavar). Nivå 2: 30–89.
Nivå 3: talen där det är lätt att fortsätta ett steg för mycket – jämna tiotal (30, 40 … 90) och
tal som slutar på nio (19, 29 … 89) – alltså fallen då barnet måste veta när det ska sluta.

**Lgr22:** MA.1-3.1.2 – ”Positionssystemet och hur det används för att beskriva naturliga tal.”
(ordagrant ur Skolverkets syllabus-API, hämtad 2026-11-24)

**Varför det funkar på iPad:** tre knappar i rad längst ned (≥ 88 px), brädan fyller resten och
skalar om efter skärmen, inget scroll. Allt avgörs med ett finger; ingen text i spelytan utöver
siffrorna. Tiostavarna ritas som tio sammanhängande rutor, så barnet kan räkna dem med fingret.

## Testplan (mätbara krav)

1. `node verify.mjs`: 90 000 uppgifter, 0 fel. Nivå 1 ligger i 11–29, nivå 2 i 30–89, nivå 3 är
   antingen ett jämnt tiotal 30–90 eller ett tal som slutar på 9 (19–89); tiotal + ental ger
   alltid talet; ental ≤ 9; talordet stämmer för alla 10–99 (tabell i verifieraren); frågan
   innehåller talordet.
2. 0 px scroll (båda axlarna) i 1024×768, 768×1024, 390×844, 1440×900, före och efter Spela.
3. Hela rundan spelas med pekdon (`Input.dispatchTouchEvent`): 6/6, stjärnor, prickar, ogenomskinlig
   resultatruta som täcker HUD.
4. Tio ental växlas till en tiostav (tiotal +1, ental 0, summan oförändrad).
5. Ett steg för mycket ger "för många", ångra pulserar och inget går förlorat.
6. Nivå 3 innehåller både jämna tiotal och tal som slutar på 9 (mätt över 2 000 uppgifter).
7. Ingen inloggning, inga länkar ut, ingen reklam, ingen tredjeparts-CDN förutom kotten.js.
8. Kortbilden är ett spelmoment 1200×900 (4:3) utan pålagd text.

## Validering före bygge

`delegate_task` finns inte i den här sessionen (inga subagent-verktyg), så go/no-go gjordes som
skriftlig egenkontroll mot de tre frågorna:

- **Frivilligt 5 minuter?** Ja – bygg-loopen är fysisk (tryck, biten landar, talet växer) och
  belöningen kommer vid varje färdigt tal, inte bara i slutet. Risk: passivt tryckande; därför
  bara sex tal per runda och ett mål som kräver att barnet slutar i tid på nivå 3.
- **Verkligt kunskapskrav?** Ja – MA.1-3.1.2 ordagrant citerat. Katalogen (54 appar) har ingen
  app för positionssystemet: `list_apps` visar MA.1-3.1.1/1.5/1.6/1.7/1.8 men inte 1.2.
- **Teknisk risk:** låg – statisk app, samma upplägg som de sex publicerade Kotten-apparna, ren
  generator som verifieras headless, inga fysikmotorer och ingen tidspress.

Go.