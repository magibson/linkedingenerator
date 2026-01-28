import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { username, password, email } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    console.log("Checking if user exists:", username);
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    console.log("User lookup result:", existingUser);

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with default settings
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        email: email || null,
        settings: {
          create: {
            postsPerBatch: 5,
            batchCount: 1,
            postLength: "medium",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    return NextResponse.json(
      { error: "Failed to create account", details: error?.message },
      { status: 500 }
    );
  }
}
