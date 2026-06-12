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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }>}
){
    try {
        const { username } = await params;
        const currentUserId = getUserId(req);

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                avatar: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        tweets: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
        }

        //check follow status
        let isFollowing = false;
        if(currentUserId && currentUserId !== user.id){
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: user.id,
                    },
                },
            });
            isFollowing = !!follow;
        }

        return NextResponse.json({ user, isFollowing });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}