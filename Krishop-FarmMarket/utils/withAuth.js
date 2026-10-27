import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export function withAuth(handler) {
    return async (req, context) => {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }
            req.user = session.user;
            return await handler(req, context);
        } catch (error) {
            console.error("Authenticated request failed", error);
            return NextResponse.json({ message: "Request failed" }, { status: 500 });
        }
    };
}

export const requireRole = (...roles) => (handler) =>
    withAuth(async (req, context) => {
        if (!roles.includes(req.user.role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        return handler(req, context);
    });
