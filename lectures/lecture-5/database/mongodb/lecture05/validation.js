//Schema validation in MongoDB
// kør kommando for at teste filen: docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/validation.js
/*
const m = db.getSiblingDB("mobility");
//1. Ugyldig datatype: departureUtc som string i stedet for BSON Date.
const invalid = m.journey_search.findOne({ _id: "LAB05:A" });

invalid._id = "LAB05:INVALID-DATE";
// MongoDB burde afvise dokumentet, da departureUtc er en streng og ikke en BSON Date
invalid.departures[0].departureUtc = "2026-10-02T06:20:00Z";

m.journey_search.insertOne(invalid);
*/

/*
const m = db.getSiblingDB("mobility");
//2. Ugyldig værdi: availableSeats = -1, fordi antallet af ledige pladser ikke må være negativt.
const invalidSeats = m.journey_search.findOne({ _id: "LAB05:A" });

invalidSeats._id = "LAB05:INVALID-SEATS";
//mongoDB burde afvise dokumentet, da availableSeats er et negativt tal og ikke et positivt tal
invalidSeats.departures[0].availableSeats = NumberInt(-1);

m.journey_search.insertOne(invalidSeats);
*/


//Validerings tests  som burde returnere error code 121
const m = db.getSiblingDB("mobility");

function testInvalidDocument(id, change) {
    const invalid = m.journey_search.findOne({ _id: "LAB05:A" });
    invalid._id = id;
    change(invalid);

    try {
        m.journey_search.insertOne(invalid);
        print("ERROR: Document was accepted");
    } catch (e) {
        print(`${id}: Error code ${e.code}`);
    }
}
//fejler da departureUtc er en streng og ikke en BSON Date
testInvalidDocument("LAB05:INVALID-DATE", doc => {
    doc.departures[0].departureUtc = "2026-10-02T06:20:00Z";
});
//fejler da availableSeats er et negativt tal og ikke et positivt tal
testInvalidDocument("LAB05:INVALID-SEATS", doc => {
    doc.departures[0].availableSeats = NumberInt(-1);
});