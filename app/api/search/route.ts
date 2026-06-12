import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.trim() === "") {
            return NextResponse.json({ users: [], tweets: [] });
        }

        //find users
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query, mode: "insensitive" } },
                    { name: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                bio: true,
            },
            take: 5,
        });

        //find tweet
        const tweets = await prisma.tweet.findMany({
            where: {
                content: { contains: query, mode: "insensitive" },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
                author: {
                    select: { id: true, username: true, name: true, avatar: true },
                },
                _count: { select: { likes: true, replies: true } },
            },
        });

        return NextResponse.json({ users, tweets });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}