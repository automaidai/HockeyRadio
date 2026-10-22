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


## Programm aus Google Sheets

Redaktion: https://docs.google.com/spreadsheets/d/1ixwQOZKarw2xRhHxnXsQ8CrZ1LBAoBM1J3lvg-pZEt8/edit

Das Blatt `Wochenplan` ist als CSV veröffentlicht, automatisches Neuveröffentlichen ist aktiviert. Nur Programminhalte gehören auf dieses öffentliche Blatt. Neue weitere Blätter werden nicht automatisch veröffentlicht.

- Spalten A–H: Tag, Reihenfolge, Rhythmus, Von, Bis, Sendung, Beschreibung, Stand. Kopfzeile erhalten.
- Für jeden Wochentag eigene Zeilen. Reihenfolge als positive Zahl eintragen.
- `Stündlich` zeigt `JEDE STUNDE`; für tägliche Sendungen Zeiten wie `06:00` und `24:00` eintragen.
- `Entwurf` kennzeichnet eine Beispielsendung, `Vorgabe`/`Bestätigt` eine reguläre Sendung. `Inaktiv`, `Ausgeblendet` oder `Pausiert` blendet eine Zeile aus.
- Titel und Beschreibung sowie zusätzliche Zeilen werden übernommen; das vorhandene Kartendesign bleibt erhalten.
- `/api/program` liest das veröffentlichte Blatt serverseitig, validiert die Daten und liefert JSON. Keine Besucheranfragen an Google nötig. `PROGRAM_CSV_URL` kann optional die feste Quelle überschreiben.
- Website prüft beim Öffnen und danach jede Minute im sichtbaren Tab. Server/CDN puffern jeweils bis zu einer Minute; Googles Veröffentlichung kann zusätzlich einige Minuten dauern. Kein erneuter Website-Deploy für Inhaltsänderungen nötig.
- Bei ungültigen Zeilen oder Google-Ausfällen bleibt das letzte gültige Programm sichtbar (Server und Browser bis 24 Stunden, anschließend mitgelieferter Ausgangsplan).
- Keine Zugangsdaten oder Bearbeitungsrechte werden öffentlich gemacht.

## Programm, Infos und Live-Markierung

- Kompakte Programmkarten und Umschalter Programm / Infos. Infos erscheinen als schlichte Liste ohne Artwork-Karten.
- `schedule.js` berechnet die aktuelle Sendung nach Europe/Berlin einschließlich Zeitumstellung, Mitternacht und Sendungen über Tagesgrenzen. Intervalle sind am Ende exklusiv; stündliche Rubriken ohne genaue Sendeminute werden nicht durchgehend live markiert.
- Die Liveanzeige basiert auf dem Sendeplan, nicht auf einer Audioanalyse. Sie wird im sichtbaren Tab alle 15 Sekunden und beim Zurückkehren aktualisiert.
- Für Infos gibt es das separate öffentliche Blatt `Website-Infos` (gid 20261023), mit Zustimmung des Nutzers veröffentlicht. Es enthält ausschließlich Formeln auf die Spalten A:D des internen `Einspieler`-Tabs und technische Typkennzeichen. Sponsor, Vermarktung, Preis und Notizen werden nicht übernommen. Nur `Wochenplan` und `Website-Infos` sind veröffentlicht.
- Die Redaktion pflegt weiterhin `Einspieler`: Formatkatalog A7:D10 und Slotplan A14:D120. Die öffentliche Leseansicht zieht diese Angaben per Formel nach; nicht manuell überschreiben.
- `/api/infos` validiert die fünf öffentlichen Spalten und gruppiert Einspieler. Live-Markierungen für Einspieler setzen einen zugeordneten Slot, gültige Wochentage und Dauer in Sekunden voraus. Fehlende Slotangaben können die Werte aus dem Formatkatalog übernehmen. Unterstützt sind etwa Täglich, Mo-Fr, Sa / So und einzelne deutsche Wochentage.

## SpradeTV-Banner

Die früheren Hero-Kennzahlen sind durch einen als Werbung gekennzeichneten SpradeTV-Banner ersetzt. Original-SpradeTV-Logo, „Alle Spiele live in HD“, „Jetzt buchen“, Link https://sprade.tv/de/. Mobil mit eigenem CTA unter Logo und Text.
