import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if(!token){
            return NextResponse.json({ error: "未ログイン" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id:true, username: true, name: true, avatar: true },
        });

        if(!user){
            return NextResponse.json({ error: "ユーザーが見つかりません"}, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ error: "未ログイン"}, { status: 401 });
    }
}