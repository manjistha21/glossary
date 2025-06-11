import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (username === "admin" && password === "password123") {
    // Create a response with the successful message and set a cookie for the local store
    const response = NextResponse.json(
      { message: "Authentication successful" },
      { status: 200 }
    );
    response.cookies.set("auth", "true", { httpOnly: true });
    return response;
  } else {
    return NextResponse.json(
      { message: "Invalid username or password. Please try again." },
      { status: 401 }
    );
  }
}
