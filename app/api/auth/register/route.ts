import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const {username, email, password, name} = await req.json();

        //validation
        if(!username || !email || !password || !name){
            return NextResponse.json(
                {error: "全ての項目を入力してください"},
                {status: 400}
            );
        }

        //既存user check
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if(existing){
            return NextResponse.json(
                {error: "このメールアドレスまたはユーザー名は既に使われています"},
                {status: 400}
            );
        }

        //password hashrize
        const hashedPassword = await bcrypt.hash(password, 10);

        //create user
        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword, name },
        });

        return NextResponse.json(
            {
                user:{
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                },
            },
            {status: 201}
        );
    }catch(error){
        console.error(error);
        return NextResponse.json(
            {error: "サーバーエラーが発生しました"},
            {status: 500}
        );
    }
}