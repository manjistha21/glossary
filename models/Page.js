import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  pageName: { type: String, required: true }, // Page Name as a category
  title: { type: String, required: true },
  content: { type: String, required: true }, // For rich-text content
}, { timestamps: true });

const Page = mongoose.models.Page || mongoose.model("Page", pageSchema);
export default Page;
