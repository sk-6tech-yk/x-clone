import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

function getUserId(req: NextRequest): string | null {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: {params: Promise<{ id: string }>}
){
    try {
        const userId = getUserId(req);
        if(!userId) {
            return NextResponse.json({ error: "ログインが必要です"}, { status: 401 });
        }

        const { id } = await params;
        const tweet = await prisma.tweet.findUnique({ where: {id} });

        if(!tweet){
            return NextResponse.json({ error: "ツイートが見つかりません"}, { status: 404 });
        }

        if(tweet.authorId !== userId){
            return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
        }

        await prisma.tweet.delete({ where: { id } });

        return NextResponse.json({ message: "削除しました" });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, {status: 500});
    }
}