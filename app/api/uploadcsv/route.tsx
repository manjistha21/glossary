import { NextResponse } from "next/server";
import { parse } from "papaparse";
import Page from "@/models/page"; // Make sure this is correct
import connectDB from "@/config/database";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const reader = file.stream().getReader();
    let decoder = new TextDecoder("utf-8");
    let csvContent = "";

    let done, value;
    while (!done) {
      ({ done, value } = await reader.read());
      if (value) {
        csvContent += decoder.decode(value);
      }
    }

    // Parse CSV with header row & skipping empty lines
    const { data, errors } = parse(csvContent, { header: true, skipEmptyLines: true });

    if (errors.length > 0) {
      console.error("CSV Parsing errors:", errors);
      return NextResponse.json({ message: "Error parsing CSV file", errors }, { status: 400 });
    }

    // Validate and clean data
    const filteredData = data.map((row) => {
      const { pageName, title, content } = row;

      if (!pageName || !title || !content) {
        return null; // Skip invalid rows
      }

      return { pageName: pageName.trim(), title: title.trim(), content: content.trim() };
    }).filter(Boolean);

    if (filteredData.length === 0) {
      return NextResponse.json({ message: "No valid data found in CSV" }, { status: 400 });
    }

    await connectDB();
    const newPages = await Page.insertMany(filteredData);

    return NextResponse.json({
      message: "CSV uploaded successfully",
      importedCount: newPages.length,
      "pages": newPages,
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to process CSV file:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
