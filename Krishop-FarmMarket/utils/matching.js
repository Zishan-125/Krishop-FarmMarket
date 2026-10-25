const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
    return (value * Math.PI) / 180;
}

export function distanceKm(first, second) {
    if (![first?.lat, first?.lng, second?.lat, second?.lng].every(Number.isFinite)) return null;
    const latitudeDelta = toRadians(second.lat - first.lat);
    const longitudeDelta = toRadians(second.lng - first.lng);
    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(toRadians(first.lat)) *
            Math.cos(toRadians(second.lat)) *
            Math.sin(longitudeDelta / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalise(value) {
    return String(value || "").trim().toLowerCase();
}

export function scoreListingAgainstDemand(listing, demand) {
    const reasons = [];
    let score = 0;

    if (normalise(listing.crop) === normalise(demand.crop)) {
        score += 35;
        reasons.push("Crop matches");
    } else {
        return { score: 0, reasons: ["Crop does not match"] };
    }

    if (demand.grade === "any" || !demand.grade || listing.grade === demand.grade) {
        score += 15;
        reasons.push("Grade meets demand");
    }

    if (listing.quantity >= demand.quantity) {
        score += 20;
        reasons.push("Enough quantity available");
    } else if (listing.quantity > 0) {
        score += 10;
        reasons.push("Partial quantity available");
    }

    const priceRatio = demand.targetPrice > 0 ? listing.askingPrice / demand.targetPrice : 1;
    if (priceRatio <= 1) {
        score += 15;
        reasons.push("Asking price is within target");
    } else if (priceRatio <= 1.1) {
        score += 8;
        reasons.push("Asking price is close to target");
    }

    if (normalise(listing.district || listing.location) === normalise(demand.district || demand.location)) {
        score += 10;
        reasons.push("Same district");
    } else {
        const distance = distanceKm(listing, demand);
        if (distance !== null && distance <= 100) {
            score += 7;
            reasons.push(`${Math.round(distance)} km apart`);
        }
    }

    const availableDate = listing.availableFrom ? new Date(listing.availableFrom) : null;
    if (availableDate && demand.deliveryWindow?.from && demand.deliveryWindow?.to) {
        if (availableDate >= new Date(demand.deliveryWindow.from) && availableDate <= new Date(demand.deliveryWindow.to)) {
            score += 5;
            reasons.push("Available in delivery window");
        }
    }

    return { score: Math.min(100, score), reasons };
}
