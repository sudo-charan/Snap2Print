import mongoose from "mongoose";

// In-memory storage for when MongoDB is not available
const inMemoryData: { [key: string]: any[] } = {
  shops: [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "Test Xerox Center",
      shopId: "test-shop",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  printJobs: []
};

export async function connectToDatabase(mongoUri: string): Promise<void> {
	// Use in-memory storage if no MongoDB URI is provided
	if (!mongoUri || mongoUri.trim() === "") {
		console.log("MongoDB not available, using in-memory storage");
		// Initialize with some test data
		inMemoryData.shops = [
			{
				_id: "507f1f77bcf86cd799439011",
				name: "Test Xerox Center",
				shopId: "test-shop",
				createdAt: new Date(),
				updatedAt: new Date()
			}
		];
		inMemoryData.printJobs = [];
		return Promise.resolve();
	}

	// Try to connect to MongoDB
	try {
		mongoose.set("strictQuery", true);
		await mongoose.connect(mongoUri);
		console.log("✅ Connected to MongoDB successfully");
	} catch (error) {
		console.error("❌ Failed to connect to MongoDB:", error);
		throw error; // Re-throw to let server.ts handle it
	}
}

// Export in-memory data for use in models
export { inMemoryData };



