import {NextRequest, NextResponse} from "next/server";
import jwt from "jsonwebtoken";
import {prisma} from "@/lib/prisma";

//helper: get user id from jwt
function getUserId(req: NextRequest): string | null {
    const token = req.cookies.get("token")?.value;
    if(!token) return null;
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

//POST tweets
export async function POST(req: NextRequest) {
    try{
        const userId = getUserId(req);
        if(!userId){
            return NextResponse.json({error: "ログインが必要です"}, {status: 401});
        }

        const {content} = await req.json();

        if (!content || content.trim() === ""){
            return NextResponse.json({error: "内容を入力してください"}, {status: 400});
        }

        if(content.length > 140){
            return NextResponse.json({error: "140文字以内で入力してください"}, {status: 400});
        }

        const tweet = await prisma.tweet.create({
            data: {content, authorId: userId},
            include: {
                author: {
                    select: { id: true, username: true, name: true, avatar: true},
                },
                _count: { select: { likes: true, replies: true }},
            },
        });

        return NextResponse.json({ tweet }, {status: 201});
    } catch(error) {
        console.error(error);
        return NextResponse.json({error: "サーバーエラーが発生しました"}, {status: 500});
    }
}

//GET api/tweets get timeline
export async function GET(req: NextRequest) {
    try {
        const userId = getUserId(req);

        const tweets = await prisma.tweet.findMany({
            where: { parentId: null },
            orderBy: { createdAt: "desc"},
            take: 20,
            include: {
                author: {
                    select: { id: true, username: true, name: true, avatar: true },
                },
                _count: { select: { likes: true, replies: true }},
                likes: userId ? { where: { userId }} : false,
            },
        });

        return NextResponse.json({ tweets });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}