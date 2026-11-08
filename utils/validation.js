export function text(value, field, { max = 120, required = true } = {}) {
    if (typeof value !== "string" || (required && !value.trim())) {
        throw new Error(`${field} is required`);
    }
    const normalized = value.trim();
    if (normalized.length > max) throw new Error(`${field} is too long`);
    return normalized;
}

export function positiveNumber(value, field) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) throw new Error(`${field} must be greater than zero`);
    return number;
}

export function optionalNumber(value, field, { min, max } = {}) {
    if (value === undefined || value === null || value === "") return undefined;
    const number = Number(value);
    if (!Number.isFinite(number) || (min !== undefined && number < min) || (max !== undefined && number > max)) {
        throw new Error(`${field} is invalid`);
    }
    return number;
}

export function dateValue(value, field, { required = false } = {}) {
    if (!value && !required) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error(`${field} is invalid`);
    return date;
}

export function parseListingInput(body) {
    const units = ["kg", "ตัน", "piece", "crate", "bag"];
    const unit = text(body.unit, "Unit");
    const priceUnit = text(body.priceUnit || body.unit, "Price unit");
    if (!units.includes(unit) || !units.includes(priceUnit)) throw new Error("Unsupported unit");
    return {
        crop: text(body.crop, "Crop", { max: 80 }),
        category: text(body.category, "Category", { max: 60 }),
        description: text(body.description || "", "Description", { max: 1000, required: false }),
        quantity: positiveNumber(body.quantity, "Quantity"),
        unit,
        askingPrice: positiveNumber(body.askingPrice, "Asking price"),
        priceUnit,
        location: text(body.location, "Location", { max: 120 }),
        quality: text(body.quality || "Not specified", "Quality", { max: 60 }),
        grade: ["A", "B", "C"].includes(body.grade) ? body.grade : "B",
        harvestDate: dateValue(body.harvestDate, "Harvest date"),
        district: text(body.district || body.location, "District", { max: 80 }),
        lat: optionalNumber(body.lat, "Latitude", { min: -90, max: 90 }),
        lng: optionalNumber(body.lng, "Longitude", { min: -180, max: 180 }),
        lat: optionalNumber(body.lat, "Latitude", { min: -90, max: 90 }),
        lng: optionalNumber(body.lng, "Longitude", { min: -180, max: 180 }),
        images: Array.isArray(body.images) ? body.images.slice(0, 5).map((image) => text(image, "Image URL", { max: 500 })) : [],
        availableFrom: dateValue(body.availableFrom, "Available date"),
        imageUrl: text(body.imageUrl || "", "Image URL", { max: 500, required: false }),
    };
}

export function parseDemandInput(body) {
    const units = ["kg", "ตัน", "piece", "crate", "bag"];
    const unit = text(body.unit, "Unit");
    const priceUnit = text(body.priceUnit || body.unit, "Price unit");
    if (!units.includes(unit) || !units.includes(priceUnit)) throw new Error("Unsupported unit");
    const from = dateValue(body.deliveryFrom, "Delivery start", { required: true });
    const to = dateValue(body.deliveryTo, "Delivery end", { required: true });
    if (to < from) throw new Error("Delivery end must be after delivery start");
    return {
        crop: text(body.crop, "Crop", { max: 80 }),
        category: text(body.category || "", "Category", { max: 60, required: false }),
        grade: ["A", "B", "C", "any"].includes(body.grade) ? body.grade : "any",
        quantity: positiveNumber(body.quantity, "Quantity"),
        unit,
        targetPrice: positiveNumber(body.targetPrice, "Target price"),
        priceUnit,
        deliveryWindow: { from, to },
        location: text(body.location, "Location", { max: 120 }),
        district: text(body.district || body.location, "District", { max: 80 }),
        notes: text(body.notes || "", "Notes", { max: 1000, required: false }),
    };
}

export function parseOfferInput(body) {
    return {
        quantity: positiveNumber(body.quantity, "Quantity"),
        price: positiveNumber(body.price, "Price"),
        message: text(body.message || "", "Message", { max: 500, required: false }),
    };
}
