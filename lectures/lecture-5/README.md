# MobilityTicketing: Lecture 5 starter

Add MongoDB support for journey search. You need Docker Desktop with Compose. Start both databases from this directory:

```bash
docker compose up -d
docker compose ps
```

PostgreSQL is available at `localhost:5432` (database, user, and password: `mobility`). MongoDB is available at `localhost:27017`. MongoDB setup and query templates are in `database/mongodb/lecture05/`.

Stop the databases:

```bash
docker compose down
```


## MongoDB – Operatorer

| Operator | Betydning | Beskrivelse |
|---|-----------|---|
| `$match` | Filtrering | Finder dokumenter, der opfylder betingelser (SQL: WHERE). |
| `$unwind` | Opdeling  | Opdeler et array til individuelle dokumenter. |
| `$project` | Vælg felter | Bestemmer hvilke felter, der returneres (SQL: SELECT). |
| `$sort` | Sortering | Sorterer resultater (SQL: ORDER BY). |
| `$elemMatch` | Array-match | Kræver at alle betingelser gælder samme array-element. |
| `$gte` | '>='        | Større end eller lig med. |
| `$gt` | '>'        | Større end. |
| `$lte` | <=        | Mindre end eller lig med. |
| `$lt` | <         | Mindre end. |
| `$set` | Opdatering | Ændrer værdien af et bestemt felt. |
| `$[trip]` | Filtreret array-opdatering | Opdaterer de array-elementer, der matcher arrayFilters. |
| `updateOne()` | Opdaterer det første dokument, der matcher søgebetingelserne. |
| `sort()` | Sorterer dokumenterne i søgeresultatet. 1 er stigende, og -1 er faldende rækkefølge. |
| `find(filter, projection)` | Finder dokumenter og bestemmer, hvilke felter der returneres. |


## MongoDB – Funktioner

| Funktion | Beskrivelse |
|---|---|
| `aggregate()` | Kører en pipeline med flere operationer. |
| `find()` | Finder dokumenter, der matcher en søgning. |
| `toArray()` | Konverterer resultatet til et JavaScript-array. |
| `ISODate()` | Opretter et MongoDB-datoobjekt. |
| `printjson()` | Udskriver resultatet i terminalen. |
| `_id: 0` | Udelader `_id` fra resultatet. |
| `cityId: 1` | Medtager `cityId` i resultatet. |
| `"$departures.tripId"` | Refererer til et felt i et indlejret objekt. |
| `updateMany()` | Opdaterer alle dokumenter, der matcher søgebetingelserne. |
| `arrayFilters` | Bestemmer hvilke elementer i et array, der skal opdateres. |
| `/^LAB05:/` | Regulært udtryk, der matcher værdier, som starter med LAB05:. |
| `NumberDecimal()` | Opretter en Decimal128-værdi, som er velegnet til præcis håndtering af pengebeløb. |


## Lecture 5 – Updating duplicated data

Opgaven demonstrerer fordele og ulemper ved duplikeret data
i MongoDB.

- Duplikeret data gør rejsesøgninger nemmere.
- Opdateringer skal foretages i alle relevante kopier.
- Manglende opdatering af en kopi kan skabe inkonsistent data.
- Gentagelse af samme opdatering demonstrerer idempotens.
- Prisopdateringen kræver, at både cityId og routeId matcher.
- Dokument D opdateres ikke, da det har et andet cityId,
  selvom det har samme routeId.

Prisændringen i MongoDB påvirker ikke allerede gemte
billetter i PostgreSQL, da prisen tilhører MongoDBs søgemodel.
