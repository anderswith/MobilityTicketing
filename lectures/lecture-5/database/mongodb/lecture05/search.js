//Rejse søgning og filtrering i mongodb
//kør kommando for at teste: docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/search.js


const m = db.getSiblingDB("mobility");

function search(cityId, fromStopId, toStopId, start, end) {
    //validering af søgeparametre, hvis en af dem er tom, kastes en fejl
    if (!cityId || !fromStopId || !toStopId) {
        throw new Error("City, origin and destination must not be empty");
    }

    if (!(start instanceof Date) || !(end instanceof Date) ||
        !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) ||
        end <= start) {
        throw new Error("Invalid time interval");
    }
    
    return m.journey_search
        .aggregate([
            {
                //søger på cityId, fromStopId og toStopId
                $match: { cityId, fromStopId, toStopId }
            },
            {
                // Opdeler departures-arrayet, så hver afgang bliver til
                // sit eget dokument. Det gør det muligt at filtrere
                // de enkelte afgange efter status og tidspunkt.
                $unwind: "$departures"
            },
            {
                $match: {
                    //kun afgange hvor status = "Scheduled" og hvor departureUtc ligger mellem start og end
                    "departures.status": "Scheduled",
                    "departures.departureUtc": {
                        //gte: start - Afgangen skal være større end eller lig med starttidspunktet 
                        $gte: start,
                        //lt: end - Afgangen skal være mindre end sluttidspunktet
                        $lt: end
                    }
                }
                
            },
            {
                // Vælger de felter, der skal returneres.
                // Henter afgangsoplysningerne ud fra departures.
                // 0 returneres ikke
                // 1 returneres
                // subdocument felter kan hentes ud med dot notation, fx departures.tripId
                $project: {
                    _id: 0,
                    cityId: 1,
                    routeId: 1,
                    fromStopId: 1,
                    toStopId: 1,
                    tripId: "$departures.tripId",
                    departureUtc: "$departures.departureUtc",
                    arrivalUtc: "$departures.arrivalUtc",
                    availableSeats: "$departures.availableSeats",
                    price: 1,
                    currency: 1
                }
            },
            {
                // Sorterer resultaterne efter afgangstid,
                // så den tidligste afgang vises først.
                $sort: { departureUtc: 1 }
            }


        ])
        .toArray();
}

//Test 1: Starttidspunktet er inkluderet ($gte).
// Vi tester, at en afgang præcis kl. 06:20 bliver fundet.
// Forventet resultat: LAB05-T-OK.
/*
const start = ISODate("2026-10-02T06:20:00Z");
const end = ISODate("2026-10-02T07:00:00Z");

printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end))
*/

/*
//Test 2: Omvendt rejseretning.
// Vi tester, at søgningen skelner mellem start- og slutstoppested.
// Forventet resultat: LAB05-T-E.

const start = ISODate("2026-10-02T06:00:00Z");
const end = ISODate("2026-10-02T07:00:00Z");

printjson(search("CPH", "STOP-AIRPORT", "STOP-NORREPORT", start, end));
*/

/*
//Test 3: Søgning på en anden dato.
// Vi tester, at datoen filtreres korrekt via departureUtc.
// Forventet resultat: LAB05-T-F.

const start = ISODate("2026-10-03T06:00:00Z");
const end = ISODate("2026-10-03T07:00:00Z");

printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end));
*/

/*
//Test 4: Destinationen findes ikke.
// Vi tester, at søgningen returnerer et tomt array,
// når ingen rejser matcher destinationen.
// Forventet resultat: [].
const start = ISODate("2026-10-02T06:00:00Z");
const end = ISODate("2026-10-02T07:00:00Z");

printjson(search("CPH", "STOP-NORREPORT", "STOP-NO-MATCH", start, end))
*/

/*
//Test 5: Tomt startstoppested.
// Vi tester, at inputvalideringen afviser et tomt stop-ID.
// Forventet resultat: Error.
const start = ISODate("2026-10-02T06:00:00Z");
const end = ISODate("2026-10-02T07:00:00Z");

printjson(search("CPH", "", "STOP-AIRPORT", start, end));
*/

//Test 6: Annulleret afgang.
// Tester at en annulleret afgang ikke længere returneres.
// Forventet resultat: [].
/* 
const start = ISODate("2026-10-02T06:00:00Z");
const end = ISODate("2026-10-02T07:00:00Z");

printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end));
*/

/*
const start = ISODate("2026-10-02T06:00:00Z");
const end = ISODate("2026-10-02T07:00:00Z");

// Tester Nørreport til Airport.
// Forventet: LAB05-T-OK returneres ikke.
print("Norreport to Airport:");
printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end));

// Tester Nørreport til Central.
// Forventet: LAB05-T-OK returneres stadig.
print("Norreport to Central:");
printjson(search("CPH", "STOP-NORREPORT", "STOP-CENTRAL", start, end));
*/


{
    // Tester det oprindelige tidsinterval.
    // Forventet: LAB05-T-OK returneres ikke.
    const start = ISODate("2026-10-02T06:00:00Z");
    const end = ISODate("2026-10-02T07:00:00Z");

    print("Original time interval:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end));
}

{
    // Tester det nye tidsinterval.
    // Forventet: LAB05-T-OK returneres med de nye tidspunkter.
    const start = ISODate("2026-10-02T07:00:00Z");
    const end = ISODate("2026-10-02T08:00:00Z");

    print("New time interval:");
    printjson(search("CPH", "STOP-NORREPORT", "STOP-AIRPORT", start, end));
}
