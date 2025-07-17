export const runtime = "nodejs";

import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = "mongodb+srv://iosachinruhela:kavyakart@data.t3b3ogv.mongodb.net/?retryWrites=true&w=majority&appName=data";
const dbName = "data";

let cachedClient = null;

async function connectDB() {
  if (!cachedClient) {
    cachedClient = await MongoClient.connect(uri);
  }
  return cachedClient.db(dbName);
}

export async function GET() {
  const db = await connectDB();
  const users = await db.collection("users").find({}, {
    projection: { name: 1, email: 1, uid: 1 }
  }).toArray();
  return NextResponse.json(users);
}
