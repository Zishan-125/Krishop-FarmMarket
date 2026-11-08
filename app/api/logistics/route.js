import { NextResponse } from "next/server";
import { planRoute } from "@/utils/logistics";

export async function POST(request) {
    try {
        const body = await request.json();
        if (!Array.isArray(body.stops) || body.stops.length < 2) return NextResponse.json({ message: "At least two route stops are required" }, { status: 400 });
        return NextResponse.json(planRoute(body.stops));
    } catch {
        return NextResponse.json({ message: "Unable to plan route" }, { status: 400 });
    }
}
