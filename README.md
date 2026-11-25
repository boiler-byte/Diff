# HTML Diff – PWA · Version 2

HTML- und Textversionen vergleichen, Textanalyse gegenüberstellen und doppelte
Zeilen, Wörter oder Blöcke finden. Alle Eingaben werden ausschließlich im
Browser verarbeitet. Es gibt keine APIs, Backends oder externen Bibliotheken.

## Neuerungen in Version 2

Unter **Versionen vergleichen → Vergleichsergebnis** gibt es neben Side-by-Side
und Inline-Diff die neue Ansicht **Analyse**. Sie verwendet dieselben Eingaben
und denselben Vergleichsstand wie die bisherigen Diff-Ansichten. Bei aktivem
„Automatisch vergleichen“ wird der Vergleich nach Eingabe aktualisiert; andernfalls
über „Vergleichen“. Seiten tauschen, Zurücksetzen und Dateiimport wirken auf alle
Ergebnisansichten. Die separate Duplikatsuche bleibt erhalten.

- **Basis:** Zeichen mit und ohne Leerzeichen, Wörter nach Whitespace und
  Unicode-Buchstaben, Sätze und Absätze.
- **Lesbarkeit:** bisherige Flesch- und Wiener-Näherungswerte, mittlere Wort- und
  Satzlänge, Anteil langer Wörter (>6 Zeichen) mit Balken.
- **Wortschatz:** Unique Words, Type-Token-Ratio, längstes Wort,
  Wortlängen-Verteilung und Top 12 Wörter pro Text.
- **Zeit & Wolke:** Lesezeit mit 200 und 250 Wörtern/min, Sprechzeit mit 130
  Wörtern/min und zwei lokale Wortwolken mit gemeinsamer Häufigkeitsskala.
- Numerische Werte werden in Original (Alt), Neue Version (Neu) und Δ (Neu − Alt)
  dargestellt. Differenzen beziehen sich auf die angezeigte Rundung; PP steht
  für Prozentpunkte. Nicht definierte Lesbarkeitswerte werden als „—“ gezeigt.
- Der gemeinsame Stoppwortfilter betrifft nur Top-Wörter und Wortwolken.
  „Leerzeichen ignorieren“ und Vergleichstiefe ändern keine Analysekennzahlen.
- „Ergebnis kopieren“ übernimmt in der Analyseansicht die Textstatistiken,
  Differenzen, Wortlängen-Verteilungen und Top-Wörter als tabellarischen Text
  (nicht die grafischen Wortwolken). In den Diff-Ansichten bleibt der bisherige
  Text-Export erhalten.

### Methodische Hinweise

Die Analyse übernimmt die Zählregeln und die beiden Lesbarkeitsformeln der
bisherigen Textanalyse-App. Die dort implementierten Formeln entsprechen nicht
den standardkonformen Amstad- und Wiener-Sachtextformeln. Damit frühere Werte
weiter vergleichbar bleiben, wurden sie **nicht** geändert und werden in der
Oberfläche ausdrücklich als Altformeln gekennzeichnet. Sie eignen sich daher
nicht als normgerechte Lesbarkeitsindizes.

HTML wird als unveränderter Quelltext gezählt, nicht als gerenderter Seiteninhalt.
Die Zeitdarstellung rundet auf ganze Sekunden (mit korrektem Minutenübertrag).
Die lokale Wortwolke zeigt bis zu 65 Begriffe je Text; tatsächliche Platzierung
und Größe hängen zusätzlich vom verfügbaren Platz ab.

## Bereitstellung

Den gesamten Inhalt dieses Ordners auf denselben **HTTPS**-Webserver bzw.
statischen Hostingdienst hochladen. Die bisherige Basis-URL von HTML Diff kann
weiterverwendet werden. Die Manifest-ID, Start-URL, Scope und Icons bleiben
unverändert; der Cache-Name wurde auf `html-diff-pwa-v2` erhöht. Der alte
HTML-Diff-Cache wird bei Aktivierung des neuen Service Workers entfernt.

Danach die URL im Browser öffnen und über „Installieren / Zum Startbildschirm
hinzufügen“ installieren. In Chrome/Edge erscheint ggf. „App installieren“.

### Lokal testen

Im entpackten Ordner einen Server starten, beispielsweise:

    python3 -m http.server 8080

Anschließend `http://localhost:8080/` öffnen. Nach dem ersten vollständigen
Laden und der Service-Worker-Aktivierung ist Offline-Betrieb vorgesehen.
Direktes Öffnen der `index.html` per Doppelklick funktioniert ebenfalls für
Vergleich und Analyse, sofern die beiden lokalen Skripte daneben liegen;
PWA-Installation und Service Worker benötigen HTTPS oder localhost.

## Dateien

- `index.html` – gemeinsame App-Oberfläche, Diff, Duplikatsuche und Integration
- `text-analysis.js` – lokale Analysefunktionen und Vergleichsansicht
- `wordcloud.js` – lokale Canvas-Wortwolken, aus der Textanalyse übernommen und angepasst
- `manifest.webmanifest` – unveränderte PWA-Identität, aktualisierte Beschreibung
- `sw.js` – Offline-Cache der App-Shell einschließlich beider neuer Skripte
- `boiler-room.json` – technische Version 2 und vollständige Ressourcenliste
- `icons/` – unveränderte Icons

## Boiler Room – Metadatenstandard v2

`manifest.webmanifest`, `boiler-room.json` und `sw.js` liegen weiterhin im selben
Basis-URL-Verzeichnis. Die technische App-Version ist von 1 auf 2 erhöht;
`schema_version` bleibt 2. Workspace-Zuordnung (z. B. `workspace_entry` in
`repos.js`) erfolgt weiterhin separat. `created: null` wurde beibehalten, da das
Datum der Erstveröffentlichung nicht belegt ist. `updated: 2026-11-25` ist das
Datum dieses Paketstands; bei späterer Veröffentlichung entsprechend anpassen.

Offline-Modus `full`: Sämtliche Analyse-, Vergleichs-, Duplikat- und Importfunktionen
sind lokal implementiert. Kopieren und Installation hängen von den jeweiligen
Browserberechtigungen ab. Alle statischen Laufzeitdateien sind in der Ressourcenliste
enthalten. Bei Änderungen der App-Shell die Cache-Version entsprechend erhöhen.

## Integrationsprüfung (25.11.2026)

- JavaScript-Syntax aller Skripte und Inline-App-Code geprüft.
- Chromium-Funktionstest mit in die Testseite eingebetteten lokalen Skripten:
  Diff-Ansichten, Analysekennzahlen und Differenzen, Stoppwortfilter, Wortwolken,
  Seitenwechsel, manueller/automatischer Vergleich, Reset, Duplikatsuche,
  Dateiimport, leere bzw. rein numerische Texte und mobile Ansicht geprüft.
  Kopiertext beider Ansichten über eine simulierte Zwischenablage geprüft.
  Alle Ressourcen über einen lokalen HTTP-Server mit HTTP 200 verifiziert.
- Manifest-Identität und Icon-Dateien unverändert; lokale Laufzeitressourcen in
  Metadaten und Service-Worker-App-Shell abgeglichen. Das externe Boiler-Room-
  JSON-Schema wurde nicht mitgeliefert; eine erneute Schema-Validierung ist offen.
- Einschränkung: Die Navigation zu lokalen Dateien bzw. dem lokalen Testserver
  wird in der Testumgebung durch die Browser-Richtlinie blockiert. Installation,
  tatsächlicher Service-Worker-Offline-Neustart und Nutzung im Boiler-Room-iframe
  sind daher noch auf der Ziel-URL zu prüfen. Der eingebettete Browser-Test
  prüft die App-Logik, nicht die HTTP-/Offline-Auslieferung.
