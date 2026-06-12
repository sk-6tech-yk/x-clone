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

// POST /api/users/[username]/follow - follow and unfollow
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const userId = getUserId(req);
        if(!userId) {
            return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
        }
        const { username } = await params;

        //get users to follow
        const targetUser = await prisma.user.findUnique({ where: { username } });
        if(!targetUser) {
            return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
        }

        //you can't follow yourself
        if(targetUser.id === userId) {
            return NextResponse.json({ error: "自分自身はフォローできません" }, { status: 400 });
        }

        //check if you are already following.
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUser.id,
                },
            },
        });

        if(existing){
            //unfollow
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetUser.id,
                    },
                },
            });
            return NextResponse.json({ followed: false });
        } else {
            //follow
            await prisma.follow.create({
                data: {
                    followerId: userId,
                    followingId: targetUser.id,
                },
            });
            return NextResponse.json({ followed: true });
        }
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}