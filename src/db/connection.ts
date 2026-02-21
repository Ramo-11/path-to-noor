import mongoose from "mongoose";
import { getMongoUri } from "@/config/env";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

const connectionOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  const MONGODB_URI = getMongoUri();

  cached.promise = mongoose
    .connect(MONGODB_URI, connectionOptions)
    .then((instance) => {
      console.log("[MongoDB] Connected successfully");
      return instance;
    })
    .catch((error) => {
      cached.promise = null;
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    });

  cached.conn = await cached.promise;
  return cached.conn;
}
