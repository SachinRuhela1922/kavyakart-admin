// src/app/api/products/route.js
import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

const uri = "mongodb+srv://iosachinruhela:kavyakart@data.t3b3ogv.mongodb.net/?retryWrites=true&w=majority&appName=data";
const dbName = "data";

cloudinary.v2.config({
  cloud_name: "dmliuh8nm",
  api_key: "875524685123382",
  api_secret: "YLiTt7HOnhLwWn33CH7mxLGdm2c"
});

let cachedClient = null;

async function connectDB() {
  if (!cachedClient) {
    cachedClient = await MongoClient.connect(uri);
  }
  return cachedClient.db(dbName);
}

// ✅ GET: All products
export async function GET() {
  const db = await connectDB();
  const products = await db.collection("products").find({}).toArray();
  return NextResponse.json(products);
}


export async function POST(req) {
  const form = await req.formData();

  const title = form.get("title");
  const price = parseFloat(form.get("price"));
  const original = parseFloat(form.get("original"));
  const discount = form.get("discount");
  const rating = form.get("rating");
  const reviews = form.get("reviews");
  const label = form.get("label");
  const type = form.get("type");
  const category = form.get("category");
  const imageFile = form.get("image");

  let imageUrl = "";

  if (imageFile && typeof imageFile === "object") {
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: "products" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    imageUrl = uploadResult.secure_url;
  }

  const newProduct = {
    title,
    price,
    original,
    discount,
    rating,
    reviews,
    label,
    type,
    category,
    image: imageUrl,
  };

  const db = await connectDB();
  const result = await db.collection("products").insertOne(newProduct);

  return NextResponse.json({ insertedId: result.insertedId });
}

// ✅ DELETE: Remove a product by ID
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const db = await connectDB();
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}



// ✅ PUT: Update + Cloudinary
export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const form = await req.formData();
  const title = form.get("title");
  const price = parseFloat(form.get("price"));
  const imageFile = form.get("image");

  let imageUrl;

  if (imageFile && typeof imageFile === "object") {
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: "products" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    imageUrl = uploadResult.secure_url;
  }

  const updateData = {
    title,
    price,
  };

  if (imageUrl) {
    updateData.image = imageUrl;
  }

  const db = await connectDB();
  const result = await db.collection("products").updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  return NextResponse.json({ updated: result.modifiedCount });
}
