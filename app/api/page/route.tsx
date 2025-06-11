import Page from '@/models/Page';
import connectDB from '@/config/database';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { pageName, title, content } = await req.json();

    if (!pageName || !title || !content) {
      return NextResponse.json({ error: "Page Name, Title, and Content are required" }, { status: 400 });
    }

    const newPage = new Page({ pageName, title, content });
    await newPage.save();

    return NextResponse.json({ message: "Page added successfully", page: newPage }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const pageName = searchParams.get("name");

    if (pageName) {
      // Fetch a specific page by name
      const page = await Page.findOne({ pageName });

      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }

      return NextResponse.json(page, { status: 200 });
    }

    // If no pageName is provided, return all pages
    const pages = await Page.find();
    return NextResponse.json({ pages }, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
