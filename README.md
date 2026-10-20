# HockeyRadio

Responsive statische Website für HockeyRadio. Veröffentlichung über GitHub und Vercel, ohne Build-Schritt oder Framework. Root Directory: Repository-Wurzel, Framework Preset: Other, Output Directory: unverändert / Wurzel.

## Inhalt und Betrieb

- Echter MP3-Stream: https://play.radioking.io/hockey-radio (128 kbit/s, RadioKing).
- Farben der referenzierten SpradeTV-Website: #07112a, #0e1c3f, #05d9ff, #a8b6d8.
- Beide vom Auftraggeber gelieferten SVG-Logos sind enthalten.
- Sendeplan ist ausdrücklich ein Beispiel. Keine tatsächlichen Übertragungen zugesichert.
- Radiogrüße über das offizielle RadioKing-Widget. Lädt erst nach Klick; Mikrofonzugriff nur nach Aufnahme-Start und Browserfreigabe. Tatsächlicher Versand erfolgt über RadioKing.
- Sender-Merkliste im lokalen Browser-Speicher. Keine Tracking- oder Marketingintegration.
- Impressum von SpradeTV übernommen. SpradeTV-Datenschutztext vollständig und als Originalfassung wiedergegeben; technische HockeyRadio-Hinweise zu Vercel, RadioKing, Google Fonts und lokaler Merkliste ergänzt.
- Vor offiziellem Launch: Rechtstexte für den tatsächlichen Betrieb final prüfen, echten Sendeplan eintragen, Vorschauhinweise entfernen, robots-Meta von noindex auf index umstellen, Domain samt DNS in Vercel verbinden.
- Fünf gelieferte Partnerlogos im pausierbaren Endlos-Slider. Prominenter Hauptplayer und unterer Player steuern dasselbe Audioelement.
- Permissions-Policy gestattet Mikrofonzugriff für https://widget.radioking.io; zusätzlich iframe allow="microphone".

## Dateien

index.html, styles.css, app.js, arena.webp, logo-1.svg, logo-2.svg, favicon.svg, vercel.json.

## Bildnachweis

Arena-Motiv mit dem integrierten Imagegen-Tool generiert. Prompt: Atmosphärisches Eishockey-Arena-Foto auf Eishöhe mit anonymem Spieler rechts, dunkelblauer Freifläche links für Überschrift, eisblauem Stadionlicht; ohne Schrift, Logos oder Wasserzeichen.

## Lokal prüfen

Mit einem statischen HTTP-Server aus diesem Verzeichnis starten, beispielsweise `python3 -m http.server 4173`. Mikrofonfunktionen benötigen HTTPS oder localhost.
