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
