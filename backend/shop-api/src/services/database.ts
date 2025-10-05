import { MongoClient, Db, Collection, ModifyResult } from 'mongodb';
import { Shop, PrintJob, User } from '../models/types';
import { config } from '../config/env';

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private shopsCollection: Collection<Shop> | null = null;
  private printJobsCollection: Collection<PrintJob> | null = null;
  private usersCollection: Collection<User> | null = null;

  constructor() {
    // Initialize database service
  }

  private async connect(): Promise<boolean> {
    try {
      this.client = new MongoClient(config.mongodb.uri);
      await this.client.connect();
      this.db = this.client.db('snap2print');

      // Initialize collections
      this.shopsCollection = this.db.collection<Shop>('shops');
      this.printJobsCollection = this.db.collection<PrintJob>('printJobs');
      this.usersCollection = this.db.collection<User>('users');

      // Create indexes for better performance
      await this.shopsCollection.createIndex({ shopId: 1 }, { unique: true });
      await this.shopsCollection.createIndex({ email: 1 }, { unique: true });
      await this.printJobsCollection.createIndex({ jobId: 1 }, { unique: true });
      await this.printJobsCollection.createIndex({ shopId: 1 });
      await this.usersCollection.createIndex({ email: 1 }, { unique: true });
      await this.usersCollection.createIndex({ userId: 1 }, { unique: true });

      return true;
    } catch (error) {
      console.error('Database connection failed');
      return false;
    }
  }

  // Shop operations
  async createShop(shopData: Omit<Shop, '_id' | 'createdAt' | 'updatedAt'>): Promise<Shop> {
    if (!this.shopsCollection) {
      await this.connect();
    }

    const shop: Shop = {
      _id: undefined, // MongoDB will generate ObjectId
      ...shopData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await this.shopsCollection!.insertOne(shop);
      return { ...shop, _id: result.insertedId };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Shop ID or email already exists');
      }
      throw error;
    }
  }

  async getShop(shopId: string): Promise<Shop | null> {
    if (!this.shopsCollection) {
      await this.connect();
    }

    return await this.shopsCollection!.findOne({ shopId });
  }

  async getAllShops(): Promise<Shop[]> {
    if (!this.shopsCollection) {
      await this.connect();
    }

    return await this.shopsCollection!.find({}).toArray();
  }

  async updateShop(shopId: string, updates: Partial<Shop>): Promise<Shop | null> {
    if (!this.shopsCollection) {
      await this.connect();
    }

    const result = await this.shopsCollection!.findOneAndUpdate(
      { shopId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result ? (result as any).value : null;
  }

  async deleteShop(shopId: string): Promise<boolean> {
    if (!this.shopsCollection) {
      await this.connect();
    }

    const result = await this.shopsCollection!.deleteOne({ shopId });
    return result.deletedCount > 0;
  }

  // Print job operations
  async createPrintJob(jobData: Omit<PrintJob, '_id' | 'createdAt' | 'updatedAt'>): Promise<PrintJob> {
    if (!this.printJobsCollection) {
      await this.connect();
    }

    const printJob: PrintJob = {
      _id: undefined, // MongoDB will generate ObjectId
      ...jobData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await this.printJobsCollection!.insertOne(printJob);
      return { ...printJob, _id: result.insertedId };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Job ID already exists');
      }
      throw error;
    }
  }

  async getPrintJob(jobId: string): Promise<PrintJob | null> {
    if (!this.printJobsCollection) {
      await this.connect();
    }

    return await this.printJobsCollection!.findOne({ jobId });
  }

  async getPrintJobsByShop(shopId: string): Promise<PrintJob[]> {
    if (!this.printJobsCollection) {
      await this.connect();
    }

    return await this.printJobsCollection!.find({ shopId }).sort({ createdAt: -1 }).toArray();
  }

  async updatePrintJobStatus(jobId: string, status: 'pending' | 'completed'): Promise<PrintJob | null> {
    if (!this.printJobsCollection) {
      await this.connect();
    }

    const result = await this.printJobsCollection!.findOneAndUpdate(
      { jobId },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result ? (result as any).value : null;
  }

  async deletePrintJob(jobId: string): Promise<boolean> {
    if (!this.printJobsCollection) {
      await this.connect();
    }

    const result = await this.printJobsCollection!.deleteOne({ jobId });
    return result.deletedCount > 0;
  }

  // User operations
  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!this.usersCollection) {
      await this.connect();
    }

    const user: User = {
      _id: undefined, // MongoDB will generate ObjectId
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await this.usersCollection!.insertOne(user);
      return { ...user, _id: result.insertedId };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('User ID or email already exists');
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.usersCollection) {
      await this.connect();
    }

    return await this.usersCollection!.findOne({ email: email.toLowerCase() });
  }

  async getUser(userId: string): Promise<User | null> {
    if (!this.usersCollection) {
      await this.connect();
    }

    return await this.usersCollection!.findOne({ userId });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    if (!this.usersCollection) {
      await this.connect();
    }

    const result = await this.usersCollection!.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result ? (result as any).value : null;
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (!this.usersCollection) {
      await this.connect();
    }

    const result = await this.usersCollection!.deleteOne({ userId });
    return result.deletedCount > 0;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) {
        await this.connect();
      }
      // Ping the database
      await this.db!.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Close connection (for graceful shutdown)
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.shopsCollection = null;
      this.printJobsCollection = null;
      this.usersCollection = null;
    }
  }
}

// Export singleton instance
export const db = new Database();
