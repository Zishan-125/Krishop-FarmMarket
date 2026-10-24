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
        availableFrom: body.availableFrom ? new Date(body.availableFrom) : undefined,
        imageUrl: text(body.imageUrl || "", "Image URL", { max: 500, required: false }),
    };
}
