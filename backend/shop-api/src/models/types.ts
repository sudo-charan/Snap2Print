// Database models and types
export interface Shop {
  _id?: string;
  shopId: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: string;
  userId: string;
  email: string;
  password: string; // hashed
  shopId: string;
  shopName: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintJob {
  _id?: string;
  jobId: string;
  shopId: string;
  studentName: string;
  fileName: string;
  fileOriginalName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  status: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShopRequest {
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
}

export interface CreatePrintJobRequest {
  shopId: string;
  studentName: string;
  file: Express.Multer.File;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  shopName: string;
  location: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    shopId: string;
    shopName: string;
  };
}
