import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { LedgerBlock } from "@/Model/LedgerBlock";
import { verifyChain } from "@/utils/ledger";

export async function GET(request, { params }) {
    try {
        await connect();
        const { id } = await params;
        const blocks = await LedgerBlock.find({ batchId: id }).sort({ recordedAt: 1 }).lean();
        return NextResponse.json({ batchId: id, blocks, verification: verifyChain(blocks) });
    } catch (error) {
        console.error("Ledger verification failed", error);
        return NextResponse.json({ message: "Unable to verify batch ledger" }, { status: 500 });
    }
}
