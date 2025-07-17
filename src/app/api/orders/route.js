// src/app/api/orders/route.js
import { MongoClient, ObjectId } from "mongodb";
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

// ✅ GET all orders
export async function GET() {
  try {
    const db = await connectDB();
    const orders = await db.collection("orders").find().toArray();
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

// ✅ PATCH (update status)
export async function PATCH(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    const { status } = await req.json();

    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid or missing status" }, { status: 400 });
    }

    const db = await connectDB();
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.modifiedCount > 0) {
      return NextResponse.json({ success: true, updated: result.modifiedCount });
    } else {
      return NextResponse.json({ success: false, message: "No changes made" });
    }

  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
