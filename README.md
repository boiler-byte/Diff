# HTML Diff – PWA

Die App vergleicht HTML und Text und erkennt doppelte Zeilen, Wörter und Blöcke.
Alle Inhalte werden ausschließlich im Browser verarbeitet. Keine Bibliotheken, APIs oder Backends.

## Bereitstellung

Den gesamten Inhalt dieses Ordners auf einen **HTTPS**-Webserver oder statischen Hostingdienst hochladen. Alle Dateien und der Ordner `icons/` müssen gemeinsam verfügbar sein. Danach die URL im Browser öffnen und über die Browserfunktion **Installieren / Zum Startbildschirm hinzufügen** installieren. In Chrome/Edge erscheint ggf. zusätzlich die Schaltfläche „App installieren“ in der Anwendung.

## Lokal testen

Im PWA-Ordner einen lokalen Server starten, z. B.:

    python3 -m http.server 8080

Dann `http://localhost:8080/` öffnen und nach dem ersten erfolgreichen Laden bei Bedarf die Netzwerkverbindung trennen. Die App bleibt offline nutzbar.

**Wichtig:** Beim direkten Öffnen von `index.html` per Doppelklick (`file://`) funktioniert die normale Diff-App, aber Service Worker und installierbare PWA-Eigenschaften benötigen `localhost` oder HTTPS.

## Enthaltene Dateien

- `index.html` – vorhandene App mit PWA-Integration
- `manifest.webmanifest` – Name, Startseite, Darstellung, Icons
- `sw.js` – Offline-Cache ausschließlich für statische App-Dateien
- `icons/` – App-, Maskable- und Apple-Icons

Beim Bearbeiten des Service Workers die `CACHE_NAME`-Version erhöhen, damit veraltete App-Dateien entfernt werden. Die Navigation lädt online bevorzugt die aktuelle `index.html` und verwendet bei Offline-Betrieb die gecachte Version.

## Boiler Room – Metadatenstandard v2

Die drei öffentlichen Schnittstellendateien `manifest.webmanifest`,
`boiler-room.json` und `sw.js` liegen im selben Basis-URL-Verzeichnis.
Der vorhandene Einstiegspunkt ist `index.html`; Manifest-ID, Scope und
Service-Worker-Verhalten bleiben unverändert. Die Workspace-Zuordnung
(z. B. `workspace_entry` in `repos.js`) erfolgt weiterhin separat.

- `boiler-room.json` enthält die technische App-Version und Offline-Ressourcen.
- Technische Version `1`: erstmalige Zuordnung zum Boiler-Room-Standard.
  Im gelieferten Altbestand ist keine technische App-Version dokumentiert;
  `html-diff-pwa-v1` ist ausschließlich die vorhandene Cache-Kennung.
  Diese bleibt unverändert. Künftige veröffentlichte App-Stände erhalten
  eine höhere technische Version in `boiler-room.json`.
- `created: null`: Das Datum der Erstveröffentlichung ist aus dem gelieferten
  Archiv nicht belegbar. Dateizeitstempel sind kein Veröffentlichungsnachweis.
- `updated: 2026-11-25`: Datum des hier erstellten Paketstands, vorgesehen
  für die Veröffentlichung an diesem Datum. Bei späterer Erstveröffentlichung
  dieses Paketstands den Wert auf das tatsächliche Veröffentlichungsdatum setzen.
- Offline-Modus `full`: Vergleich, Duplikatsuche und Dateiimport laufen lokal.
  Das Kopieren hängt wie bisher von den Browserberechtigungen ab, nicht von
  einer Internetverbindung. Die Browserinstallation ist vom Browserkontext
  abhängig. Die Ressourcenliste enthält auch das Service-Worker-Skript für
  die bestehende PWA-Integration; sie ändert nicht dessen Cache-Strategie.
- Nicht belegbare optionale Angaben (Autor, Lizenz, Versionsbezeichnung,
  veröffentlichte Änderungshistorie) wurden nicht ergänzt.

Für die Prüfung der Metadaten die mit dem Boiler-Room-Standard v2 gelieferte
`boiler-room.schema.json` mit aktivierter Datumsformatprüfung verwenden.

### Integrationsprüfung (25.11.2026)

- Bestanden: JSON-Schema v2 einschließlich Datumsformatprüfung.
- Bestanden: Manifest-Pflichtfelder, unveränderte PWA-Identität und tatsächliche
  PNG-Icon-Abmessungen.
- Bestanden: Alle drei Schnittstellendateien sowie alle neun Einträge in
  `files` über einen lokalen HTTP-Server unter einem App-Unterpfad abrufbar
  (HTTP 200, unveränderte Dateiinhalte, JavaScript-MIME-Typ für `sw.js`).
- Bestanden: JavaScript-Syntax von Inline-App-Skript und Service Worker;
  statischer Abgleich der Offline-Ressourcen mit der vorhandenen App-Shell.
- Bestanden: Alle ursprünglichen Dateien außer der ergänzten README sind
  byteidentisch zum gelieferten Archiv.
- Nicht bestätigt: Browserbasierter Offline-Neustart, praktische App-Funktion
  und iframe-Nutzung. Der lokale Chromium-Test wurde bei der Navigation
  durch die Testumgebung blockiert (`ERR_BLOCKED_BY_ADMINISTRATOR`).
  Die Einstufung `full` beruht auf dem vorhandenen Quellcode, der vollständigen
  lokalen Ressourcenliste und der bestehenden Service-Worker-Implementierung,
  nicht auf einem erfolgreich ausgeführten Offline-Browsertest.
- Offen: Prüfung an der tatsächlichen öffentlichen Basis-URL und im echten
  Boiler-Room-Workspace nach Bereitstellung. Insbesondere iframe-Berechtigungen
  für Zwischenablage, PWA-Installation und Service Worker sind dort zu prüfen.
