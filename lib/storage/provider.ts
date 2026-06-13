import fs from "fs";
import path from "path";

export interface StorageProvider {
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ key: string; url: string; size: number }>;
  getFileUrl(key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), "public", "uploads");

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ key: string; url: string; size: number }> {
    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(this.uploadDir, safeFileName);
    
    // Write buffer to local disk
    fs.writeFileSync(filePath, fileBuffer);
    
    const key = `uploads/${safeFileName}`;
    const url = `/uploads/${safeFileName}`;
    
    return {
      key,
      url,
      size: fileBuffer.length,
    };
  }

  async getFileUrl(key: string): Promise<string> {
    return `/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const fileName = key.replace("uploads/", "");
    const filePath = path.join(this.uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// Global factory to get the selected storage provider
export const storageProvider: StorageProvider = new LocalStorageProvider();
