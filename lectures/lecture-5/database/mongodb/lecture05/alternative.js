// Alternativ datamodel, hvor hver afgang er et selvstændigt dokument i en separat collection.
// kør kommando for at teste: docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/alternative.js
const m = db.getSiblingDB("mobility");

/*
// Henter alle fixture-dokumenter.
const journeys = m.journey_search.find({
    _id: /^LAB05:/
}).toArray();
*/


// Gennemgår alle journey-dokumenter.
/*
for (const journey of journeys) {

    // Gennemgår hver afgang i dokumentet.
    for (const departure of journey.departures) {

        // Opretter et selvstændigt dokument for hver afgang.
        // Ved at kombinere by, rute, startstoppested, slutstoppested og tripId får vi et deterministisk ID -
        // der identificerer den enkelte afgang og stopkombination.
        const trip = {
            _id: `${journey.cityId}:${journey.routeId}:${journey.fromStopId}:${journey.toStopId}:${departure.tripId}`,
            cityId: journey.cityId,
            routeId: journey.routeId,
            fromStopId: journey.fromStopId,
            toStopId: journey.toStopId,
            tripId: departure.tripId,
            departureUtc: departure.departureUtc,
            arrivalUtc: departure.arrivalUtc,
            status: departure.status,
            availableSeats: departure.availableSeats,
            price: journey.price,
            currency: journey.currency,
            schemaVersion: journey.schemaVersion
        };

        // Indsætter afgangen i den alternative collection.
        m.journey_search_by_trip.insertOne(trip);
    }
}
*/

// Viser antallet af dokumenter i den nye collection.
/*
printjson(m.journey_search_by_trip.countDocuments({}));
*/
// Undersøger hvordan LAB05-T-OK er gemt
// i den alternative datamodel.
/*
printjson(
    m.journey_search_by_trip.find({
        tripId: "LAB05-T-OK"
    }).toArray()
);
*/


function search(cityId, fromStopId, toStopId, start, end) {

    // Validerer input.
    if (!cityId || !fromStopId || !toStopId) {
        throw new Error("City, origin and destination must not be empty");
    }

    if (!(start instanceof Date) || !(end instanceof Date) ||
        !Number.isFinite(start.getTime()) ||
        !Number.isFinite(end.getTime()) ||
        end <= start) {
        throw new Error("Invalid time interval");
    }

    // Søger direkte efter afgange uden at opdele arrays.
    return m.journey_search_by_trip.find(
        {
            cityId,
            fromStopId,
            toStopId,
            status: "Scheduled",
            departureUtc: {
                $gte: start,
                $lt: end
            }
        },
        {
            _id: 0,
            cityId: 1,
            routeId: 1,
            fromStopId: 1,
            toStopId: 1,
            tripId: 1,
            departureUtc: 1,
            arrivalUtc: 1,
            availableSeats: 1,
            price: 1,
            currency: 1
        }
    ).sort({ departureUtc: 1 }).toArray();
}
/*
{
    const start = ISODate("2026-10-02T06:00:00Z");
    const end = ISODate("2026-10-02T07:00:00Z");

    printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end));
}
*/

// Kører en række tests for at demonstrere søgefunktionen.
/*
{
    const start = ISODate("2026-10-02T06:00:00Z");
    const end = ISODate("2026-10-02T07:00:00Z");

    // Test 1: Normal rejsesøgning.
    print("Test 1:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end));

    // Test 2: Sluttidspunktet er eksklusivt.
    print("Test 2:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT",
        start, ISODate("2026-10-02T06:20:00Z")));

    // Test 3: Starttidspunktet er inkluderet.
    print("Test 3:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT",
        ISODate("2026-10-02T06:20:00Z"), end));

    // Test 4: Omvendt rejseretning.
    print("Test 4:");
    printjson(search("CPH", "STOP-AIRPORT", "STOP-NORREPORT", start, end));

    // Test 5: Søgning på en anden dato.
    print("Test 5:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT",
        ISODate("2026-10-03T06:00:00Z"),
        ISODate("2026-10-03T07:00:00Z")));

    // Test 6: Destination uden match.
    print("Test 6:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-NO-MATCH", start, end));
}
*/


// Annullerer alle dokumenter med det angivne tripId.
printjson(
    m.journey_search_by_trip.updateMany(
        {
            tripId: "LAB05-T-OK"
        },
        {
            $set: {
                status: "Cancelled"
            }
        }
    )
);

// Kontrollerer status på begge dokumenter.
printjson(
    m.journey_search_by_trip.find({
        tripId: "LAB05-T-OK"
    }).toArray()
);


// Kontrollerer at den annullerede afgang ikke længere
// returneres for nogen af de to destinationer.
{
    const start = ISODate("2026-10-02T06:00:00Z");
    const end = ISODate("2026-10-02T07:00:00Z");

    // Nørreport -> Airport.
    print("Norreport -> Airport:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end));

    // Nørreport -> Central.
    print("Norreport -> Central:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-CENTRAL", start, end));
}