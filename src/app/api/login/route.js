import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = "Madamji"; // Replace this with a strong key
const FIXED_EMAIL = "admin@example.com";
const FIXED_PASSWORD = "admin123";

export async function POST(req) {
  const { email, password } = await req.json();

  if (email === FIXED_EMAIL && password === FIXED_PASSWORD) {
    const token = jwt.sign({ email }, SECRET, { expiresIn: "2h" });

    return NextResponse.json({ success: true, token });
  } else {
    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  }
}
