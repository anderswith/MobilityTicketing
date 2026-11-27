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
| `$bsonSize` | Dokumentstørrelse | Beregner størrelsen af et dokument eller objekt i bytes. |
| `$size` | Array-størrelse | Returnerer antallet af elementer i et array. |
| `$$ROOT` | Systemvariabel | Refererer til hele det aktuelle dokument i aggregationen. |



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
| `findOne()` | Returnerer det første dokument, der matcher søgebetingelserne. |
| `insertOne()` | Indsætter ét nyt dokument i en collection. |
| `countDocuments()` | Returnerer antallet af dokumenter, der matcher søgebetingelserne. |


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


## Lecture 5 – Document growth

| Antal afgange | Dokumentstørrelse |
|---:|---:|
| 100 | 12.307 bytes |
| 1.000 | 123.007 bytes |

Testen viser, at dokumentets størrelse vokser omtrent
lineært med antallet af afgange.

For at undgå ubegrænset vækst vil jeg opdele dokumenterne
efter dato ved hjælp af serviceDate og fastsætte et
maksimalt antal afgange pr. dokument.

Hvis grænsen nås, kan afgangene opdeles i flere dokumenter.
Dette forhindrer, at dokumenterne overskrider MongoDBs
maksimale dokumentstørrelse på 16 MiB.

## Lecture 5 – Alternative datamodel

Den oprindelige datamodel gemmer flere afgange i et indlejret
departures-array, mens den alternative datamodel gemmer hver
afgang for et givent stoppar som et selvstændigt dokument
i collectionen journey_search_by_trip.

### Sammenligning af datamodeller

| Egenskab | Oprindelig model | Alternativ model |
|---|---|---|
| Datastruktur | Flere afgange pr. dokument | Én afgang pr. dokument pr. stoppar |
| Søgning | aggregate() med $match og $unwind | Direkte søgning med find() |
| Projektion | $project | Projection i find() |
| Sortering | $sort | sort() |
| Opdatering | Kræver arrayFilters ved målrettet opdatering | Direkte opdatering af dokumentets felter |
| Duplikering | Afgange duplikeres på tværs af stoppar | Afgange og fælles metadata duplikeres |
| Dokumentvækst | departures-array vokser | Flere selvstændige dokumenter |
| Konsistens | Alle kopier af en afgang skal opdateres | Alle kopier af en afgang skal opdateres |

### Søgning

Alle seks søgetests fra opgave 2 blev gennemført på begge
datamodeller og returnerede identiske resultater.

Den alternative datamodel gør søgningen simplere, da der
ikke længere er behov for $unwind eller $elemMatch.
Alle søgebetingelser kan evalueres direkte på dokumentet.

### Opdatering

Den alternative datamodel gør det simplere at annullere
en afgang, da status kan opdateres direkte med updateMany()
og $set uden brug af arrayFilters eller den filtrerede
positionelle operator $[trip].

Problemet med duplikeret data eksisterer dog stadig,
da samme afgang kan være repræsenteret i flere dokumenter.

### Dokumentvækst

I den oprindelige datamodel vokser dokumenternes størrelse,
når flere afgange tilføjes til departures-arrayet.
Dette kan på sigt medføre problemer med MongoDBs maksimale
dokumentstørrelse på 16 MiB.

I den alternative datamodel oprettes i stedet flere
selvstændige dokumenter. Dette reducerer risikoen for
problemer med dokumentstørrelsen, men medfører mere
duplikering af fælles metadata.

### Test af annullering

Afgangen LAB05-T-OK blev annulleret ved hjælp af updateMany()
og $set i den alternative datamodel.

Begge dokumenter, der repræsenterer afgangen, blev opdateret:

- Nørreport -> Airport
- Nørreport -> Central

Efter annulleringen blev søgefunktionen testet for begge
stoppar. Begge søgninger returnerede et tomt array, hvilket
bekræfter, at annullerede afgange filtreres korrekt fra.

### Valg af datamodel

Jeg har valgt at arbejde videre med den alternative datamodel
(journey_search_by_trip) i næste uge.

Denne model har følgende fordele:

- Simplere søgninger uden brug af $unwind og $elemMatch.
- Simplere opdateringer uden brug af arrayFilters.
- Ingen voksende departures-arrays.
- Mere forudsigelig dokumentstørrelse.

Ulempen ved modellen er, at den medfører flere dokumenter
og mere duplikering af fælles metadata.

Derudover eksisterer konsistensproblemet stadig, da alle
dokumenter, der repræsenterer samme afgang, skal opdateres
ved ændringer.

Jeg vurderer dog, at fordelene ved simplere søgninger,
opdateringer og mere forudsigelige dokumentstørrelser
opvejer disse ulemper.