
const m = db.getSiblingDB("mobility");

const journeys = m.journey_search.find({
    _id: /^LAB05:/
}).toArray();

for (const journey of journeys) {
    for (const departure of journey.departures) {
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

        m.journey_search_by_trip.insertOne(trip);
    }
}

printjson(m.journey_search_by_trip.countDocuments({}));
