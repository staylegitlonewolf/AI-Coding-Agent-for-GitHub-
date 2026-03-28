import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    const filePath = path.join(process.cwd(), "..", "AGENT_NEO.MD");
    
    fs.writeFileSync(filePath, content, "utf8");
    
    return NextResponse.json({ success: true, path: filePath });
  } catch (error: any) {
    console.error("Failed to save AGENT_NEO.MD:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
