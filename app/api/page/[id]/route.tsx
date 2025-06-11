import Page from '@/models/page';
import connectDB from '@/config/database';
import { NextResponse } from "next/server";

// Get a single page
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const page = await Page.findById(params.id);
        if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

        return NextResponse.json({ page }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// Update a page
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const {pageName, title, content } = await req.json();
        const updatedPage = await Page.findByIdAndUpdate(params.id, { pageName,title, content }, { new: true });

        if (!updatedPage) return NextResponse.json({ error: "Page not found" }, { status: 404 });

        return NextResponse.json({ message: "Page updated successfully", page: updatedPage }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// Delete a page
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const deletedPage = await Page.findByIdAndDelete(params.id);
        if (!deletedPage) return NextResponse.json({ error: "Page not found" }, { status: 404 });

        return NextResponse.json({ message: "Page deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
