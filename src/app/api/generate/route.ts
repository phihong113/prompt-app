import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { apiKey, imageBase64, basicCore } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "Vui lòng cung cấp API Key của Gemini" }, { status: 400 });
    }
    if (!imageBase64) {
      return NextResponse.json({ error: "Vui lòng cung cấp hình ảnh" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const promptText = `Từ Prompt lõi cơ bản, hãy viết lại prompt theo phong cách infographic của ảnh đính kèm.

Yêu cầu BẮT BUỘC:
1. Chỉ xuất nội dung định dạng JSON chuẩn (không giải thích, không markdown dư thừa).
2. Rút gọn nội dung, lược bỏ các từ ngữ không cần thiết. TỔNG ĐỘ DÀI KẾT QUẢ PHẢI DƯỚI 8000 ký tự (để không bị lỗi vượt quá giới hạn 10000).

[PROMPT LÕI CƠ BẢN]
${basicCore || "Không có nội dung prompt lõi."}
`;

    let parts: any[] = [promptText];

    if (imageBase64) {
      const mimeTypeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    const result = await model.generateContent(parts);
    let text = result.response.text();
    
    // Replace markdown json block with custom header
    text = text.replace(/```json/gi, `#Vai trò là một Visual Notetaker chuyên nghiệp.
#Nhiệm vụ: Bạn hãy nghiên cứu tài liệu tôi tải lên và viết thành outline chi tiết để tạo infoghaphic, sơ đồ tư duy theo bài học môn, sau đó tạo prompt json hoàn chỉnh với kiến thức từ dự liệu nguồn vào prompt lõi
Đây là lõi của prompt  `);
    
    // Remove the trailing code block markers
    text = text.replace(/```/g, "");

    return NextResponse.json({ result: text.trim() });
  } catch (error: any) {
    console.error("Lỗi tạo JSON:", error);
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi" }, { status: 500 });
  }
}
