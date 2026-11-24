//Updatering af data

// for at teste kør: docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/update.js
// for at resette data kør: docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/reset.js
/*
const m = db.getSiblingDB("mobility");

printjson(
    m.journey_search.updateMany(
        {
            // Finder fixture-dokumenter med den pågældende afgang
            _id: /^LAB05:/,
            "departures.tripId": "LAB05-T-OK",
        },
        {
            // Ændrer status til Cancelled
            $set: {
                "departures.$[trip].status": "Cancelled",
            },
        },
        {
            // Arrayfilters sikrer at kun den ønskede afgang opdateres
            arrayFilters: [
                {
                    "trip.tripId": "LAB05-T-OK",
                },
            ],
        },
    ),
);
*/


// Annullerer kun afgangen i dokument A for at skabe
// inkonsistens mellem kopierne af samme afgang.
/*
const m = db.getSiblingDB("mobility");
printjson(
    //da vi kun updatere 1 dokument, kan vi bruge updateOne i stedet for updateMany
    m.journey_search.updateOne(
        {
            _id: "LAB05:A",
            "departures.tripId": "LAB05-T-OK",
        },
        {
            $set: {
                "departures.$[trip].status": "Cancelled",
            },
        },
        {
            arrayFilters: [
                {
                    "trip.tripId": "LAB05-T-OK",
                },
            ],
        },
    ),
);
*/

// Finder alle dokumenter, der indeholder LAB05-T-OK.
// Bruges til at undersøge forskellen mellem kopierne.
/*
const m = db.getSiblingDB("mobility");
printjson(
    m.journey_search.find({
        "departures.tripId": "LAB05-T-OK"
    }).toArray()
);
*/


// Reparerer inkonsistensen ved at annullere
// den resterende kopi af LAB05-T-OK i dokument C.
/*
const m = db.getSiblingDB("mobility");
printjson(
    m.journey_search.updateOne(
        {
            _id: "LAB05:C",
            "departures.tripId": "LAB05-T-OK",
        },
        {
            $set: {
                "departures.$[trip].status": "Cancelled",
            },
        },
        {
            arrayFilters: [
                {
                    "trip.tripId": "LAB05-T-OK",
                },
            ],
        },
    ),
);
*/


// Ændrer afgangs- og ankomsttidspunktet i alle
// kopier af LAB05-T-OK for at bevare konsistens.
/*
const m = db.getSiblingDB("mobility");
printjson(
    m.journey_search.updateMany(
        {
            _id: /^LAB05:/,
            "departures.tripId": "LAB05-T-OK",
        },
        {
            $set: {
                "departures.$[trip].departureUtc": ISODate("2026-10-02T07:05:00Z"),
                "departures.$[trip].arrivalUtc": ISODate("2026-10-02T07:25:00Z"),
            },
        },
        {
            arrayFilters: [
                {
                    "trip.tripId": "LAB05-T-OK",
                },
            ],
        },
    ),
);
*/


// Opdaterer prisen til 40 DKK for alle dokumenter,
// der tilhører rute LINE-M2 i København.
/*
const m = db.getSiblingDB("mobility");
printjson(
    m.journey_search.updateMany(
        {
            cityId: "CPH",
            routeId: "LINE-M2",
        },
        {
            $set: {
                price: NumberDecimal("40.00"),
            },
        },
    ),
);
*/


// Viser by, rute og pris for alle fixture-dokumenter.
// Bruges til at kontrollere, hvilke priser der er ændret.

const m = db.getSiblingDB("mobility");
printjson(
    m.journey_search.find(
        { _id: /^LAB05:/ },
        {
            _id: 1,
            cityId: 1,
            routeId: 1,
            price: 1,
            currency: 1
        }
    ).sort({ _id: 1 }).toArray()
);

