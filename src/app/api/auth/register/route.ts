import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // emailVerified is null by default
      },
    });

    // Generate verification token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    // MOCK EMAIL SENDING
    const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
    console.log("\n=======================================================");
    console.log("📨 MOCK EMAIL: Action Required: Verify your OmniFlow account");
    console.log(`Hello ${user.name},`);
    console.log(`Please verify your email address by clicking the link below:`);
    console.log(verificationUrl);
    console.log("=======================================================\n");

    return NextResponse.json(
      { message: "Registration successful. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register account" },
      { status: 500 }
    );
  }
}
