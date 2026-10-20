# HockeyRadio

Responsive statische Website für HockeyRadio. Veröffentlichung über GitHub und Vercel, ohne Build-Schritt oder Framework. Root Directory: Repository-Wurzel, Framework Preset: Other, Output Directory: unverändert / Wurzel.

## Inhalt und Betrieb

- Echter MP3-Stream: https://play.radioking.io/hockey-radio (128 kbit/s, RadioKing).
- Farben der referenzierten SpradeTV-Website: #07112a, #0e1c3f, #05d9ff, #a8b6d8.
- Beide vom Auftraggeber gelieferten SVG-Logos sind enthalten.
- Sendeplan ist ausdrücklich ein Beispiel. Keine tatsächlichen Übertragungen zugesichert.
- Mikrofonaufnahme erfolgt nur nach aktivem Start und Freigabe. Kein Upload; ausschließlich lokaler Download.
- Sender-Merkliste im lokalen Browser-Speicher. Keine Tracking- oder Marketingintegration.
- Vor offiziellem Launch: Betreiberangaben und Datenschutzerklärung redaktionell/juristisch freigeben, echten Sendeplan eintragen, Vorschauhinweise entfernen, robots-Meta von noindex auf index umstellen, Domain samt DNS in Vercel verbinden.

## Dateien

index.html, styles.css, app.js, arena.webp, logo-1.svg, logo-2.svg, favicon.svg, vercel.json.

## Bildnachweis

Arena-Motiv mit dem integrierten Imagegen-Tool generiert. Prompt: Atmosphärisches Eishockey-Arena-Foto auf Eishöhe mit anonymem Spieler rechts, dunkelblauer Freifläche links für Überschrift, eisblauem Stadionlicht; ohne Schrift, Logos oder Wasserzeichen.

## Lokal prüfen

Mit einem statischen HTTP-Server aus diesem Verzeichnis starten, beispielsweise `python3 -m http.server 4173`. Mikrofonfunktionen benötigen HTTPS oder localhost.
