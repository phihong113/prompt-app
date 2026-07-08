import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const basePath = 'G:\\AI 2025\\MathHub\\AI thuc chien giao vien\\Notebook\\Prompt quan trong\\web site chua Prompt\\prompt-app\\Style prompt lõi';
    
    // Default response structure
    let responseData: any = {
      basicCore: "Không tìm thấy nội dung.",
      optionalCore: [],
      autoStyle: "Không tìm thấy nội dung.",
      exportPrompt: "Không tìm thấy nội dung."
    };

    try {
      await fs.access(basePath);
    } catch {
      return NextResponse.json(responseData);
    }

    // 1. Prompt Lõi cơ bản
    try {
      const basicCorePath = path.join(basePath, 'prompt lõi Notebook BAI HỌC.txt');
      responseData.basicCore = await fs.readFile(basicCorePath, 'utf-8');
    } catch (e) {
      console.error("Error reading basicCore:", e);
    }

    // 2. Prompt lõi tùy chọn
    const readStyleDir = async (dirName: string) => {
      const items: { name: string, content: string, image: string | null }[] = [];
      try {
        const dirPath = path.join(basePath, dirName);
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          if (file.endsWith('.txt')) {
            const name = file.replace('.txt', '');
            const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
            
            // Check for image
            let image = null;
            const possibleExtensions = ['.png', '.jpg', '.jpeg'];
            for (const ext of possibleExtensions) {
              if (files.includes(name + ext)) {
                // In a real app we'd serve this statically or convert to base64
                // For simplicity, converting to base64 here if it's small, or just returning a path.
                // Since this runs in node, we'll read it as base64 to pass to frontend
                const imgBuffer = await fs.readFile(path.join(dirPath, name + ext));
                const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
                image = `data:${mime};base64,${imgBuffer.toString('base64')}`;
                break;
              }
            }
            
            items.push({ name, content, image });
          }
        }
      } catch (e) {
        console.error(`Error reading ${dirName}:`, e);
      }
      return items;
    };

    responseData.optionalCore = await readStyleDir('Prompt tuy chon');

    // 3. Prompt Auto phong cách
    try {
      const autoStylePath = path.join(basePath, 'Prompt tạo ảnh cho bài hoc Hoang update.txt');
      responseData.autoStyle = await fs.readFile(autoStylePath, 'utf-8');
    } catch (e) {
      console.error("Error reading autoStyle:", e);
    }

    // 4. Xuất prompt tạo ảnh từ NotebookLM
    try {
      const exportPromptPath = path.join(basePath, 'Prompt tạo ảnh cho bài hoc - Upweb.txt');
      responseData.exportPrompt = await fs.readFile(exportPromptPath, 'utf-8');
    } catch (e) {
      console.error("Error reading exportPrompt:", e);
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Lỗi API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
