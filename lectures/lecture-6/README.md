# MobilityTicketing: Lecture 6 starter

## Docker-kommandoer

Kontrollér, om Redis kører og svarer:

```powershell
docker compose up -d mongo redis
docker compose exec -T redis redis-cli PING
```

Åbn Redis' interaktive kommandolinje for at betjene databasen:

```powershell
docker compose exec redis redis-cli
```
For at komme ud af Redis CLI, skriv:

```powershell
exit
```
For at resette databasen, skriv:

```powershell
docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/reset.js
```

## Redis-kommandoer

| Kommando | Kategori | Beskrivelse |
|---|---|---|
| `PING` | Forbindelse | Kontrollerer forbindelsen til Redis og returnerer PONG. |
| `SET` | Skrivning | Gemmer en værdi under en angivet nøgle. |
| `GET` | Læsning | Henter værdien for en angivet nøgle. Returnerer nil, hvis nøglen ikke eksisterer. |
| `EX` | Udløb | Argument til SET, der angiver nøglens levetid i sekunder. |
| `TTL` | Udløb | Returnerer nøglens resterende levetid i sekunder. |
| `DEL` | Sletning | Sletter en eller flere angivne nøgler. |
| `exit` | Kommandolinje | Afslutter Redis CLI. |

### TTL-returværdier

| Returværdi | Beskrivelse |
|---|---|
| `>= 0` | Nøglens resterende levetid i sekunder. |
| `-1` | Nøglen eksisterer uden udløbstid. |
| `-2` | Nøglen eksisterer ikke. |

## Opgave 1 – Start Redis

Redis blev startet via Docker Compose og verificeret med
PING, som returnerede PONG.

En nøgle med navnet stop:LAB06:STOP-NORREPORT blev oprettet
med værdien "Norreport" og en levetid på 20 sekunder.

Inden udløb returnerede GET værdien "Norreport", og TTL
returnerede nøglens resterende levetid.

Efter udløb returnerede GET nil og TTL -2, hvilket
bekræfter, at Redis automatisk fjerner udløbne nøgler.

### Verificering af eksisterende rejsesøgning

MongoDB-testdata blev nulstillet med følgende kommando:

```powershell
docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/reset.js
```

Den eksisterende rejsesøgning blev derefter testet uden caching:

```powershell
dotnet run --project database/redis/lecture06/CacheLab/CacheLab.csproj
```

| Parameter | Værdi |
|---|---|
| City | CPH |
| From | STOP-NORREPORT |
| To | STOP-AIRPORT |
| Date | 2026-10-02 |
| Time | 06:00-07:00 UTC |

Søgningen returnerede udelukkende LAB05-T-OK som forventet.
Den eksisterende søgefunktion fungerer derfor korrekt,
inden implementeringen af Redis-caching påbegyndes.

PostgreSQLs eksterne port blev ændret til 5433 og MongoDBs
til 27018 for at undgå portkonflikter med Lecture 5.
MongoDBs connection string blev tilpasset tilsvarende.
Den øvrige C#-starterkode er uændret.