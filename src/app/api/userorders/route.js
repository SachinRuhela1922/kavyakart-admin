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

// GET Orders from users.orders
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "Missing UID" }, { status: 400 });
  }

  const db = await connectDB();
  const user = await db.collection("users").findOne({ uid });

  if (!user || !user.orders) {
    return NextResponse.json([]);
  }

  return NextResponse.json(user.orders);
}

// PATCH: Update order status by index in user.orders array
export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const { orderIndex, status } = await req.json();

  if (!uid || orderIndex === undefined || !status) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const db = await connectDB();
  const user = await db.collection("users").findOne({ uid });

  if (!user || !user.orders || !user.orders[orderIndex]) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  user.orders[orderIndex].status = status;

  const result = await db.collection("users").updateOne(
    { uid },
    { $set: { orders: user.orders } }
  );

  return NextResponse.json({ updated: result.modifiedCount > 0 });
}
