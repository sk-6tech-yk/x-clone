import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password){
            return NextResponse.json(
                {error: "メールアドレスとパスワードを入力してください"},
                {status: 400}
            );
        }

        //find user
        const user = await prisma.user.findUnique({ where: { email } });

        if(!user){
            return NextResponse.json(
                {error: "メールアドレスまたはパスワードが間違っています"},
                {status: 401}
            )
        }

        //confirm password
        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return NextResponse.json(
                {error: "メールアドレスまたはパスワードが間違っています"},
                {status: 401}
            );
        }

        // JWTトークン発行
        const token = jwt.sign(
            {userId: user.id},
            process.env.JWT_SECRET!,
            {expiresIn: "7d"}
        );

        const response = NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
            },
        });

        // Set JWT to cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {error: "サーバーエラーが発生しました"},
            {status: 500}
        );
    }
}

