import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
){
    try {
        const { username } = await params;

        const user = await prisma.user.findUnique({ where: { username } });
        if(!user) {
            return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
        }

        const tweets = await prisma.tweet.findMany({
            where: { authorId: user.id, parentId: null },
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: { id: true, username: true, name: true, avatar: true },
                },
                _count: { select: { likes: true, replies: true} },
            },
        });

        return NextResponse.json({ tweets });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}