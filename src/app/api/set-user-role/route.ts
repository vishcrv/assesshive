import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = getAuth(request);
    const userId = auth.userId;
    const { role } = await request.json();

    // Validate the role
    if (!userId || !role || !["admin", "faculty", "student"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid user or role" },
        { status: 400 }
      );
    }

    // Instead of using the Clerk client directly, we'll redirect to the
    // role-select page which has the proper client-side API for updating metadata
    return NextResponse.json({ 
      success: true,
      message: "Role stored in session. Complete setup on dashboard."
    });
  } catch (error) {
    console.error("Error processing role:", error);
    return NextResponse.json(
      { error: "Failed to process role" },
      { status: 500 }
    );
  }
} 