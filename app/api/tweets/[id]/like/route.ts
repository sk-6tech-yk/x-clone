import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

function getUserId(req: NextRequest): string | null {
    const token = req.cookies.get("token")?.value;
    if(!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

// POST /api/tweets/[id]/like - いいね・いいね解除
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = getUserId(req);
        if(!userId) {
            return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
        }

        const { id } = await params;

        //すでにいいねしているか
        const existing = await prisma.like.findUnique({
            where: { userId_tweetId: { userId, tweetId: id }},
        });

        if(existing) {
            //いいね解除
            await prisma.like.delete({
                where: { userId_tweetId: { userId, tweetId: id } },
            });
            return NextResponse.json({ liked: false });
        } else {
            //いいね
            await prisma.like.create({
                data: { userId, tweetId: id },
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "サーバーエラーが発生しました"}, { status: 500 });
    }
}