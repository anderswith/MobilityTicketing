// A query that looks right, but isn't
// kør kommando for at teste: docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/search_bug.js

/*
const m = db.getSiblingDB("mobility");

const start = ISODate("2026-10-02T06:00:00Z");
const end = ISODate("2026-10-02T07:00:00Z");

//Denne query søger efter dokumenter, hvor der findes en afgang med status "Scheduled" og en afgang med departureUtc mellem start og end.
//Problemet er at en afgang ikke behøver at opfylde begge betingelser som det er nu.
//Hvilket betyder at dokumenter returneres selv hvis kun 1 betingelse er opfyldt.
const query = {
    cityId: "CPH",
    fromStopId: "STOP-NORREPORT",
    toStopId: "STOP-AIRPORT",

    // Søger efter en afgang med status Scheduled
    "departures.status": "Scheduled",

    // Søger efter en afgang inden for tidsintervallet
    "departures.departureUtc": {
        $gte: start,
        $lt: end
    }
};

printjson(m.journey_search.find(query).toArray());
 */


const m = db.getSiblingDB("mobility");

const start = ISODate("2026-10-02T06:00:00Z");
const end = ISODate("2026-10-02T07:00:00Z");

const query = {
    cityId: "CPH",
    fromStopId: "STOP-NORREPORT",
    toStopId: "STOP-AIRPORT",

    // Begge betingelser skal opfyldes af samme afgang
    departures: {
        $elemMatch: {
            status: "Scheduled",
            departureUtc: {
                $gte: start,
                $lt: end
            }
        }
    }
};

printjson(m.journey_search.find(query).toArray());


/*
Den oprindelige forespørgsel returnerede fejlagtigt dokument B,
fordi MongoDB kunne opfylde betingelserne for status og
departureUtc med forskellige elementer i departures-arrayet.

Én afgang opfyldte statusbetingelsen, mens en anden
opfyldte tidsbetingelsen.

Forespørgslen blev rettet med $elemMatch, som sikrer,
at den samme afgang skal opfylde begge betingelser.

Efter rettelsen blev dokument B ikke længere returneret.
*/