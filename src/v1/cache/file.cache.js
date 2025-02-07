import fs from "fs/promises";
import path from "path";
import AppError from "../core/errors/AppError.js";

class FileCache {
  constructor(config) {
    this.storageDir = config.storageDir || "./storage/cache";
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create storage directory:", error);
    }
  }

  async get(key) {
    try {
      const filePath = path.join(this.storageDir, `${key}.json`);
      const data = await fs.readFile(filePath, "utf8");
      const { value, expiry } = JSON.parse(data);

      if (expiry && Date.now() > expiry) {
        await this.delete(key);
        return null;
      }

      return value;
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw new AppError("Cache read failed", 500, "CACHE_READ_ERROR");
    }
  }

  async set(key, value, createdAt, ttl = 0) {
    try {
      const filePath = path.join(this.storageDir, `${key}.json`);
      const data = {
        value,
        createdAt,
        expiry: ttl ? createdAt + ttl * 1000 : null,
      };
      await fs.writeFile(filePath, JSON.stringify(data));
      return true;
    } catch (error) {
      throw new AppError("Cache write failed", 500, "CACHE_WRITE_ERROR");
    }
  }

  async delete(key) {
    try {
      const filePath = path.join(this.storageDir, `${key}.json`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") return true;
      throw new AppError("Cache delete failed", 500, "CACHE_DELETE_ERROR");
    }
  }

  async healthCheck() {
    try {
      const testFile = path.join(this.storageDir, "health-check.txt");
      await fs.writeFile(testFile, "health check");
      await fs.unlink(testFile);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default FileCache;
