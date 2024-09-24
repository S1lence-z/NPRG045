# Detailní specifikace ročníkového projektu

## Cíl projektu

Cílem projektu je vytvořit webovou aplikaci, která bude schopna komunikovat se senzorem připojeným přes COM port. Aplikace umožní uživateli provádět měření (např. vzdálenosti) a vyhodnocovat data. Hlavními funkcemi aplikace budou:

-   Připojení k senzoru přes COM port
-   Měření vzdálenosti a dalších parametrů
-   Zobrazení naměřených dat v reálném čase
-   Nahlížení do historie dat
-   Neuronová síť pro zpracování dat (v rámci budoucí práce na BP)

## Použité technologie

### Frontend

-   Vite + React
-   TypeScript
-   CoreUI React

### Backend

-   Python
-   Django
-   SQLite3 (s možností pozdějšího upgradu na MySQL)
-   Neural Network for data processing (TBD)

## Komunikace

### REST API

REST API bude využito pro komunikaci mezi frontendem a backendem.

### Pyserial

Pyserial bude zajišťovat obousměrnou komunikaci mezi senzorem a aplikací.

### Websocket

Bude zajišťovat obousměrnou komunikaci frontendu a backendu v reálném čase.

## Implementace

### Frontend + Backend

Frontend bude komunikovat s backendem pomocí Axios API calls. Velká část komunikace bude probíhat přes REST API, které bude sloužit pro requesty zalogovaných událostí do databáze. Navázání spojení přes COM port bude probíhat pomocí Web Serial API dostupného pro Chromium-based prohlížeče v Node.js.

## Prozatímní návrh fungování aplikace

-   Aplikace se připojí k vybranému COM portu
-   V první fázi bude senzor měřit vzdálenost
-   Začátek měření vzdálenosti:
    -   Měření začne a hodnoty se budou logovat do databáze
    -   V reálném čase se bude zobrazovat graf naměřených hodnot
    -   Po kliknutí na "stop" se logování do databáze ukončí a uloží se jedna událost měření
    -   Uživatel bude mít možnost nahlédnout do této události

## Co bude hotovo ke dni udělení zápočtu

-   Funkční propojení frontend a backend
-   Sjednocené uživatelské rozhraní
-   Implementace základního REST API
-   Schopnost měřit vzdálenost a amplitudu a fázi signálu
