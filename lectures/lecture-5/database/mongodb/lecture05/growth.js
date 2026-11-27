// vækst og størrelsesmåling af dokumenter i MongoDB
// for at køre: docker compose exec -T mongo mongosh --quiet --file /scripts/lecture05/growth.js
const m = db.getSiblingDB("mobility");

// Henter det oprindelige dokument A.
const original = m.journey_search.findOne({
    _id: "LAB05:A",
});

// Kopierer dokument A og tildeler et nyt ID.
const growth = {
    ...original,
    _id: "LAB05:GROWTH",
};

// Erstatter departures-arrayet - length er antal afgange
// ændre antal afgange for at se hvordan det påvirker dokumentets størrelse.
// med hver deres unikke tripId.
growth.departures = Array.from({ length: 100 }, (_, i) => ({
    ...original.departures[0],
    tripId: `LAB05-GROWTH-${i}`,
}));


// Erstatter det eksisterende departures-array
// med et nyt array indeholdende 1000 afgange.

printjson(
    m.journey_search.updateOne(
        { _id: "LAB05:GROWTH" },
        {
            $set: {
                departures: growth.departures
            }
        }
    )
);

// Måler dokumentets størrelse efter opdateringen.

printjson(
    m.journey_search.aggregate([
        {
            $match: {
                _id: "LAB05:GROWTH",
            },
        },
        {
            $project: {
                _id: 0,
                bytes: {
                    $bsonSize: "$$ROOT",
                },
                departures: {
                    $size: "$departures",
                },
            },
        },
    ]).toArray()
);
