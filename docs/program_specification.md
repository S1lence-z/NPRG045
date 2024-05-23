# Detailní specifikace ročníkového projektu

## Cíl projektu
Cílem projektu je vytvořit webovou aplikaci, která bude schopna komunikovat se senzorem připojeným přes COM port. Aplikace umožní uživateli provádět měření (např. vzdálenosti) a logovat výsledky do databáze. Hlavními funkcemi aplikace budou:

- Připojení k senzoru přes COM port
- Měření vzdálenosti a dalších parametrů
- Zobrazení naměřených dat v reálném čase
- Logování výsledků do databáze a možnost jejich zpětného prohlížení

## Použité technologie

### Frontend
- Vite + React
- TypeScript
- Reactstrap

### Backend
- Python
- Django
- SQLite3 (s možností pozdějšího upgradu na MySQL)
- Neuronová síť pro zpracování dat (v rámci budoucí práce na BP)

## Uživatelské prostředí
- Figma: [Mockup designu aplikace](https://www.figma.com/design/o9V8yXjr5oUiyplonAdLfV/Ro%C4%8Dn%C3%ADkov%C3%BD-projekt---webov%C3%A1-aplikace?node-id=0%3A1&t=FgNzOnn3w0ou3REI-1)

## Komunikace
### REST API
REST API bude využito pro komunikaci mezi frontendem a backendem, zejména pro přístup k logům předchozích měření uložených v databázi.

### Web Serial API
Web Serial API bude použito pro navázání spojení mezi frontendem a senzorem přes COM port.

### MQTT
MQTT bude zajišťovat obousměrnou komunikaci mezi senzorem a aplikací.

## Implementace

### Frontend + Backend
Frontend bude komunikovat s backendem pomocí Axios API calls. Velká část komunikace bude probíhat přes REST API, které bude sloužit pro requesty zalogovaných událostí do databáze. Navázání spojení přes COM port bude probíhat pomocí Web Serial API dostupného pro Chromium-based prohlížeče v Node.js.

### Komunikace
- MQTT bude použito pro zajištění obousměrné komunikace mezi senzorem a aplikací.

## Prozatímní návrh fungování aplikace
- Aplikace se připojí k vybranému COM portu
- V první fázi bude senzor měřit vzdálenost
- Uživatel se připojí k zařízení a na další stránce si vybere z různých možností měření (vzdálenost, presence apod.)
- Začátek měření vzdálenosti:
  - Měření začne a hodnoty se budou logovat do databáze
  - V reálném čase se bude zobrazovat graf naměřených hodnot
  - Po kliknutí na "stop" se logování do databáze ukončí a uloží se jedna událost měření
  - Uživatel bude mít možnost nahlédnout do této události

## Co bude hotovo ke dni udělení zápočtu
- Funkční propojení frontend a backend
- Sjednocené uživatelské rozhraní
- Implementace základního REST API
- Schopnost měřit vzdálenost a logovat data do databáze
