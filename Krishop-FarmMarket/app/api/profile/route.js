import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { User } from "@/Model/User";
import { withAuth } from "@/utils/withAuth";
import { text } from "@/utils/validation";

function profileResponse(user) {
    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        district: user.district || "",
        bio: user.bio || "",
        businessName: user.businessName || "",
    };
}

export const GET = withAuth(async (request) => {
    await connect();
    const user = await User.findById(request.user.id);
    if (!user) return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    return NextResponse.json({ user: profileResponse(user) });
});

export const PATCH = withAuth(async (request) => {
    try {
        const body = await request.json();
        await connect();
        const user = await User.findById(request.user.id);
        if (!user) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

        const username = text(body.username, "Name", { max: 80 });
        const duplicate = await User.findOne({ username, _id: { $ne: user._id } });
        if (duplicate) return NextResponse.json({ message: "That name is already in use" }, { status: 409 });

        user.username = username;
        user.phone = text(body.phone || "", "Phone", { max: 30, required: false });
        user.district = text(body.district || "", "District", { max: 80, required: false });
        user.bio = text(body.bio || "", "Bio", { max: 500, required: false });
        user.businessName = text(body.businessName || "", "Business name", { max: 120, required: false });
        user.updatedAt = new Date();
        await user.save();

        return NextResponse.json({ message: "Profile updated successfully", user: profileResponse(user) });
    } catch (error) {
        return NextResponse.json({ message: error.message || "Unable to update profile" }, { status: 400 });
    }
});
