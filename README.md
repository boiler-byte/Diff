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
