// In-memory storage models for when MongoDB is not available
import { Types } from "mongoose";
import { inMemoryData } from "../config/db";

// Type definitions for in-memory documents
export interface InMemoryShopDocument {
  _id: string;
  name: string;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryPrintJobDocument {
  _id: string;
  shop: string;
  studentName: string;
  fileOriginalName: string;
  filePath: string;
  fileSizeBytes: number;
  status: "pending" | "completed";
  copies: number;
  printType: "bw" | "color";
  createdAt: Date;
  updatedAt: Date;
}

export class InMemoryShop {
  static async findOne(query: any): Promise<InMemoryShopDocument | null> {
    if (query.shopId && inMemoryData.shops) {
      return inMemoryData.shops.find(shop => shop.shopId === query.shopId) || null;
    }
    if (query._id && inMemoryData.shops) {
      return inMemoryData.shops.find(shop => shop._id === query._id) || null;
    }
    return null;
  }

  static async findById(id: string): Promise<InMemoryShopDocument | null> {
    if (inMemoryData.shops) {
      return inMemoryData.shops.find(shop => shop._id === id) || null;
    }
    return null;
  }
}

export class InMemoryPrintJob {
  static async create(data: any): Promise<InMemoryPrintJobDocument> {
    if (!inMemoryData.printJobs) {
      inMemoryData.printJobs = [];
    }

    const newJob: InMemoryPrintJobDocument = {
      _id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shop: data.shop,
      studentName: data.studentName,
      fileOriginalName: data.fileOriginalName,
      filePath: data.filePath,
      fileSizeBytes: data.fileSizeBytes,
      copies: data.copies || 1,
      printType: data.printType || "bw",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryData.printJobs.push(newJob);
    return Promise.resolve(newJob);
  }

  static async find(query: any): Promise<InMemoryPrintJobDocument[]> {
    if (!inMemoryData.printJobs) {
      return [];
    }

    if (query.shop) {
      return inMemoryData.printJobs.filter(job => job.shop === query.shop);
    }
    return inMemoryData.printJobs;
  }

  static async findByIdAndDelete(id: string): Promise<InMemoryPrintJobDocument | null> {
    if (!inMemoryData.printJobs) {
      return null;
    }

    const jobIndex = inMemoryData.printJobs.findIndex(job => job._id === id);
    if (jobIndex === -1) return null;

    const deletedJob = inMemoryData.printJobs[jobIndex];
    inMemoryData.printJobs.splice(jobIndex, 1);
    return deletedJob;
  }

  static get data(): InMemoryPrintJobDocument[] {
    return inMemoryData.printJobs || [];
  }
}
