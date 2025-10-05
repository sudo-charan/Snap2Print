import fs from 'fs';
import path from 'path';

export function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✅ Created uploads directory at: ${uploadsDir}`);
    } catch (error) {
      console.error('❌ Failed to create uploads directory:', error);
      throw error;
    }
  }
  
  // Set permissions (read/write/execute for owner, read/execute for group/others)
  try {
    fs.chmodSync(uploadsDir, 0o755);
  } catch (error) {
    console.warn('⚠️ Could not set permissions on uploads directory:', error);
  }
  
  return uploadsDir;
}
