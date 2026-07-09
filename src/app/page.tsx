"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Loader2, Sparkles, Download, Image as ImageIcon, Trash2, FileText, Palette, Wand2, CopyCheck, Globe } from "lucide-react";

export default function Home() {
  const [prompts, setPrompts] = useState<{
    basicCore: string;
    optionalCore: { name: string; content: string; image: string | null }[];
    autoStyle: string;
    exportPrompt: string;
  }>({
    basicCore: "",
    optionalCore: [],
    autoStyle: "",
    exportPrompt: ""
  });
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  // Workflow state
  const [workflow, setWorkflow] = useState<"infographic" | "lesson_plan" | "comic" | "tools">("infographic");

  // App Step state
  const [currentStep, setCurrentStep] = useState<"gioi_thieu" | "chuan_bi" | "xuat_prompt" | "clone_phong_cach">("gioi_thieu");

  // Lesson Plan Step state
  const [lessonPlanStep, setLessonPlanStep] = useState<"step1" | "step2" | "step3">("step1");
  const [lessonPlanPrompt, setLessonPlanPrompt] = useState("");

  // Comic Step state
  const [comicStep, setComicStep] = useState<"step1" | "step2">("step1");
  const [comicPrompt, setComicPrompt] = useState("");

  // Tools Tab state
  const [toolTab, setToolTab] = useState<"mail_edu" | "slot2" | "slot3">("mail_edu");
  const [mailProvider, setMailProvider] = useState<"etempmail" | "boomlify">("etempmail");

  // Main Tabs state (for chuan_bi step)
  const [mainTab, setMainTab] = useState<"basic" | "optional" | "auto" | "clone">("basic");

  // Form states for Clone
  const [apiKey, setApiKey] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");

  // Result states
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedResult, setCopiedResult] = useState(false);

  // State for Step 2
  const [promptCount, setPromptCount] = useState("3");
  const [referenceMaterial, setReferenceMaterial] = useState("sách giáo khoa toán 9 tập 1");
  const [lessonRange, setLessonRange] = useState("Bài 10 đến bài 12");

  const generatedExportPrompt = `Hãy kết hợp tài liệu tôi gửi lên vào prompt lõi, tạo ra ${promptCount} prompt tương ứng với ${promptCount} bài học trong ${referenceMaterial}.
#Tuỳ chọn prompt lõi tạo ra bố cục, phong cách phù hợp với nội dung bài học.
#Mỗi bài học có bố cục khác nhau.
#Bố cục: infographic, sơ đồ tư duy, sơ đồ câu, hành trình, dòng chảy.
[BAI]
${lessonRange}.
Xuống dòng mỗi bài và có dòng line, kèm số thứ tự...`;

  useEffect(() => {
    fetch("/api/prompts")
      .then(res => res.json())
      .then(data => {
        setPrompts(data);
        setLoadingPrompts(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPrompts(false);
      });

    fetch("/PROMPT_tao_Word.txt")
      .then(res => res.text())
      .then(text => setLessonPlanPrompt(text))
      .catch(err => console.error(err));

    fetch("/Prompt loi Truyen tranh.txt")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.text();
      })
      .then(text => setComicPrompt(text))
      .catch(err => console.error("Error fetching comic prompt:", err));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageBase64("");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      alert("Vui lòng nhập API Key Gemini.");
      return;
    }
    if (!imageBase64) {
      alert("Vui lòng tải lên hình ảnh.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setCopiedResult(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          imageBase64,
          basicCore: prompts.basicCore
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      setResult(data.result || data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-blue-600 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8" />
            AI "thực chiến" cho Giáo Viên
          </h1>
          <p className="text-gray-500">Quản lý các loại Prompt và tự động tạo JSON</p>
        </header>

        {/* Workflow Navigation */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-blue-50 p-2 rounded-2xl shadow-sm border border-blue-100 flex-col md:flex-row gap-2">
            <button
              onClick={() => setWorkflow("infographic")}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${workflow === "infographic" ? "bg-blue-600 text-white shadow-md transform scale-105" : "text-blue-700 hover:bg-blue-100"}`}
            >
              Quy trình tạo Infographic
            </button>
            <button
              onClick={() => setWorkflow("lesson_plan")}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${workflow === "lesson_plan" ? "bg-blue-600 text-white shadow-md transform scale-105" : "text-blue-700 hover:bg-blue-100"}`}
            >
              Quy trình tạo Giáo án tự động
            </button>
            <button
              onClick={() => setWorkflow("comic")}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${workflow === "comic" ? "bg-blue-600 text-white shadow-md transform scale-105" : "text-blue-700 hover:bg-blue-100"}`}
            >
              Quy trình tích hợp truyện tranh
            </button>
            <button
              onClick={() => setWorkflow("tools")}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${workflow === "tools" ? "bg-blue-600 text-white shadow-md transform scale-105" : "text-blue-700 hover:bg-blue-100"}`}
            >
              Công cụ
            </button>
          </div>
        </div>

        {workflow === "infographic" && (
          <>
            {/* Global Steps Navigation */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-200 p-1.5 rounded-2xl shadow-inner flex-col md:flex-row gap-1">
                <button
                  onClick={() => setCurrentStep("gioi_thieu")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${currentStep === "gioi_thieu" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Bước 1: Giới thiệu
                </button>
                <button
                  onClick={() => setCurrentStep("chuan_bi")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${currentStep === "chuan_bi" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Bước 2: Chuẩn bị tài nguyên
                </button>
                <button
                  onClick={() => setCurrentStep("xuat_prompt")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${currentStep === "xuat_prompt" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Bước 3: Xuất prompt tạo ảnh
                </button>
                <button
                  onClick={() => setCurrentStep("clone_phong_cach")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${currentStep === "clone_phong_cach" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Mở rộng: Clone prompt lõi
                </button>
              </div>
            </div>

            {loadingPrompts ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="mt-8">

                {/* STEP 0: GIỚI THIỆU */}
                {currentStep === "gioi_thieu" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center">
                    <img src="/Anh gioi thieu.png" alt="Giới thiệu" className="max-w-4xl w-full rounded-2xl shadow-sm border border-gray-200 object-contain bg-white p-2" />
                  </div>
                )}

                {/* STEP 1: CHUẨN BỊ TÀI NGUYÊN */}
                {currentStep === "chuan_bi" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Main Navigation Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                      <button
                        onClick={() => setMainTab("basic")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${mainTab === "basic" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        <FileText className="w-5 h-5" /> Prompt Lõi cơ bản
                      </button>
                      <button
                        onClick={() => setMainTab("optional")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${mainTab === "optional" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        <Palette className="w-5 h-5" /> Prompt lõi tùy chọn
                      </button>
                      <button
                        onClick={() => setMainTab("auto")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${mainTab === "auto" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        <Wand2 className="w-5 h-5" /> Prompt Auto phong cách
                      </button>
                    </div>

                    {/* TAB 1: Prompt Lõi cơ bản */}
                    {mainTab === "basic" && (
                      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-blue-50 p-12 flex flex-col items-center justify-center text-center space-y-4">
                          <h2 className="text-3xl font-extrabold text-blue-800">Prompt Lõi cơ bản</h2>
                          <p className="text-blue-600 max-w-md text-lg">Nhấn nút bên dưới để copy toàn bộ nội dung Prompt Lõi cơ bản vào bộ nhớ tạm để sử dụng.</p>
                          <button
                            onClick={() => {
                              copyToClipboard(prompts.basicCore);
                              alert("Đã copy Prompt Lõi cơ bản!");
                            }}
                            className="mt-6 px-10 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition font-bold flex items-center gap-3 text-lg"
                          >
                            <Copy className="w-6 h-6" /> Copy Prompt Ngay
                          </button>
                        </div>
                      </section>
                    )}

                    {/* TAB 2: Prompt lõi tùy chọn */}
                    {mainTab === "optional" && (
                      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-indigo-50 border-b border-gray-200 p-4">
                          <h2 className="text-xl font-bold text-indigo-800">Prompt lõi tùy chọn</h2>
                          <p className="text-sm text-indigo-600 mt-1">Các phiên bản prompt tùy chọn.</p>
                        </div>

                        <div className="p-6">
                          {/* List of optional prompts */}
                          <div className="grid grid-cols-1 gap-6">
                            {prompts.optionalCore.map((item, idx) => (
                              <div key={idx} className="border rounded-xl flex flex-col md:flex-row bg-gray-50 hover:shadow-md transition overflow-hidden">

                                {/* Text Content (Left) */}
                                <div className="p-5 flex flex-col flex-1">
                                  <h3 className="font-bold text-xl mb-3 text-gray-800">{item.name}</h3>
                                  <div className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm font-mono flex-1 overflow-auto max-h-[400px] mb-4">
                                    <pre className="whitespace-pre-wrap">{item.content}</pre>
                                  </div>
                                  <div className="mt-auto">
                                    <button
                                      onClick={() => {
                                        copyToClipboard(item.content);
                                        alert(`Đã copy ${item.name}`);
                                      }}
                                      className="w-full md:w-auto px-6 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-100 transition text-sm font-medium flex justify-center items-center gap-2"
                                    >
                                      <Copy className="w-4 h-4" /> Copy Toàn Bộ Prompt
                                    </button>
                                  </div>
                                </div>

                                {/* Image Content (Right) */}
                                {item.image && (
                                  <div className="w-full md:w-1/3 max-w-sm flex-shrink-0 bg-gray-200 border-t md:border-t-0 md:border-l border-gray-200 flex items-center justify-center p-2">
                                    <img src={item.image} alt={item.name} className="w-full h-auto max-h-[500px] object-contain rounded" />
                                  </div>
                                )}

                              </div>
                            ))}

                            {prompts.optionalCore.length === 0 && (
                              <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                Không có file nào trong thư mục này.
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* TAB 3: Prompt Auto phong cách */}
                    {mainTab === "auto" && (
                      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-green-50 border-b border-gray-200 p-4 flex justify-between items-center">
                          <h2 className="text-xl font-bold text-green-800">Prompt Auto phong cách</h2>
                          <button
                            onClick={() => {
                              copyToClipboard(prompts.autoStyle);
                              alert("Đã copy Prompt Auto phong cách!");
                            }}
                            className="px-4 py-2 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition text-sm font-medium flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" /> Copy Prompt
                          </button>
                        </div>
                        <div className="p-6 bg-gray-900 text-green-400 font-mono text-sm overflow-auto max-h-[600px]">
                          <pre className="whitespace-pre-wrap">{prompts.autoStyle || "Không tìm thấy nội dung (Prompt tạo ảnh cho bài hoc Hoang update.txt)."}</pre>
                        </div>
                      </section>
                    )}

                  </div>
                )}

                {/* STEP 4: CLONE PHONG CÁCH */}
                {currentStep === "clone_phong_cach" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-purple-50 border-b border-gray-200 p-4">
                        <h2 className="text-xl font-bold text-purple-800">Mở rộng: Clone prompt lõi</h2>
                        <p className="text-sm text-purple-600 mt-1">Import ảnh mẫu và sử dụng Gemini để sinh prompt/json tương ứng.</p>
                      </div>

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Form */}
                        <form onSubmit={handleGenerate} className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">API Key Gemini <span className="text-red-500">*</span></label>
                            <input
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="Nhập API Key của bạn..."
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Import file ảnh từ máy tính <span className="text-red-500">*</span></label>
                            {imageBase64 ? (
                              <div className="relative inline-block w-full">
                                <img src={imageBase64} alt="Reference" className="w-full max-h-64 object-contain rounded-xl border border-gray-200 shadow-sm bg-gray-100" />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                                  <p className="text-base text-gray-600 mb-1"><span className="font-semibold text-purple-600">Click để tải ảnh lên</span></p>
                                  <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                              </label>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-70 shadow-md hover:shadow-lg"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-5 h-5" />
                                Clone / Phân tích ảnh
                              </>
                            )}
                          </button>
                        </form>

                        {/* Output */}
                        <div className="flex flex-col">
                          <label className="block text-sm font-medium mb-2 text-gray-700">Kết quả (Output text)</label>
                          <div className="bg-gray-900 text-gray-100 rounded-xl shadow-inner border border-gray-800 flex flex-col h-[500px]">
                            <div className="flex justify-between items-center p-3 border-b border-gray-800 bg-gray-950 rounded-t-xl">
                              <span className="text-sm font-medium text-gray-400">Kết quả từ Gemini</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (result) {
                                    // If result is object, stringify it. If string, just copy.
                                    const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
                                    copyToClipboard(textToCopy);
                                    setCopiedResult(true);
                                    setTimeout(() => setCopiedResult(false), 2000);
                                  }
                                }}
                                disabled={!result}
                                className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition flex items-center gap-1 text-xs"
                              >
                                {copiedResult ? <><Check className="w-3 h-3 text-green-400" /> Đã copy</> : <><Copy className="w-3 h-3" /> Copy</>}
                              </button>
                            </div>

                            <div className="flex-1 p-4 overflow-auto font-mono text-sm relative">
                              {result ? (
                                <pre className="text-green-400 whitespace-pre-wrap font-sans">
                                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                                </pre>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                                  <Wand2 className="w-12 h-12 mb-4 opacity-20" />
                                  <p>Tải ảnh lên và nhập API Key để xem kết quả phân tích.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {/* STEP 2: XUẤT PROMPT TẠO ẢNH */}
                {currentStep === "xuat_prompt" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-emerald-50 border-b border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-emerald-800 mb-2">Tùy chỉnh Prompt tạo ảnh</h2>
                        <p className="text-sm text-emerald-600">Nhập thông tin bên dưới để tự động tạo ra Prompt xuất ảnh từ NotebookLM.</p>
                      </div>

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50">

                        {/* Form Tùy Chỉnh */}
                        <div className="space-y-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Số lượng prompt</label>
                            <input
                              type="text"
                              value={promptCount}
                              onChange={(e) => setPromptCount(e.target.value)}
                              placeholder="Ví dụ: 3"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Tài liệu tham chiếu</label>
                            <input
                              type="text"
                              value={referenceMaterial}
                              onChange={(e) => setReferenceMaterial(e.target.value)}
                              placeholder="Ví dụ: sách giáo khoa toán 9 tập 1"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Từ bài đến bài</label>
                            <input
                              type="text"
                              value={lessonRange}
                              onChange={(e) => setLessonRange(e.target.value)}
                              placeholder="Ví dụ: Bài 10 đến bài 12"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Kết quả Output */}
                        <div className="flex flex-col">
                          <div className="bg-gray-900 text-gray-100 rounded-xl shadow-inner border border-gray-800 flex flex-col flex-1 min-h-[300px]">
                            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-950 rounded-t-xl">
                              <span className="font-semibold text-emerald-400 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Kết quả Prompt</span>
                              <button
                                type="button"
                                onClick={() => {
                                  copyToClipboard(generatedExportPrompt);
                                  alert("Đã copy Prompt!");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition flex items-center gap-2 text-sm"
                              >
                                <Copy className="w-4 h-4" /> Copy Prompt
                              </button>
                            </div>
                            <div className="flex-1 p-5 overflow-auto font-mono text-sm">
                              <div className="whitespace-pre-wrap text-emerald-50 leading-relaxed font-sans">
                                Hãy kết hợp tài liệu tôi gửi lên vào prompt lõi, tạo ra <strong className="text-emerald-300 font-bold bg-emerald-900/50 px-1 rounded">{promptCount || "..."}</strong> prompt tương ứng với <strong className="text-emerald-300 font-bold bg-emerald-900/50 px-1 rounded">{promptCount || "..."}</strong> bài học trong <strong className="text-emerald-300 font-bold bg-emerald-900/50 px-1 rounded">{referenceMaterial || "..."}</strong>.
                                {"\n#Tuỳ chọn prompt lõi tạo ra bố cục, phong cách phù hợp với nội dung bài học."}
                                {"\n#Mỗi bài học có bố cục khác nhau."}
                                {"\n#Bố cục: infographic, sơ đồ tư duy, sơ đồ câu, hành trình, dòng chảy."}
                                {"\n[BAI]\n"}
                                <strong className="text-emerald-300 font-bold bg-emerald-900/50 px-1 rounded">{lessonRange || "..."}</strong>.
                                {"\nXuống dòng mỗi bài và có dòng line, kèm số thứ tự..."}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {workflow === "lesson_plan" && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-200 p-1.5 rounded-2xl shadow-inner flex-col md:flex-row gap-1">
                <button
                  onClick={() => setLessonPlanStep("step1")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${lessonPlanStep === "step1" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Bước 1: Giới thiệu
                </button>
                <button
                  onClick={() => setLessonPlanStep("step2")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${lessonPlanStep === "step2" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Bước 2: Thêm nguồn vào NotebookLM
                </button>
                <button
                  onClick={() => setLessonPlanStep("step3")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${lessonPlanStep === "step3" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Bước 3: Copy Prompt Word
                </button>
              </div>
            </div>

            <div className="mt-8">
              {lessonPlanStep === "step1" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center">
                  <img src="/Quy_trinh_tao_giao_an_tu_dong.png" alt="Giới thiệu" className="max-w-4xl w-full rounded-2xl shadow-sm border border-gray-200 object-contain bg-white p-2" />
                </div>
              )}

              {lessonPlanStep === "step2" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-50 border-b border-gray-200 p-6">
                      <h2 className="text-2xl font-bold text-blue-800 mb-2">Thêm nguồn vào NotebookLM</h2>
                      <p className="text-sm text-blue-600">Tải về 3 file mẫu dưới đây và upload lên NotebookLM làm nguồn tài liệu.</p>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50">
                      <a href="/KHTN_9_KNTT_722db.pdf" download className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition gap-4 group">
                        <FileText className="w-12 h-12 text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-gray-700 text-center">KHTN 9 KNTT.pdf</span>
                        <span className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-4 py-2 rounded-full"><Download className="w-4 h-4" /> Tải về</span>
                      </a>
                      <a href="/Nang_luc_so_V6.0.pdf" download className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition gap-4 group">
                        <FileText className="w-12 h-12 text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-gray-700 text-center">Năng lực số V6.0.pdf</span>
                        <span className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-4 py-2 rounded-full"><Download className="w-4 h-4" /> Tải về</span>
                      </a>
                      <a href="/Giao_an_Mau_KHTN_LOP_9.docx" download className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition gap-4 group">
                        <FileText className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-gray-700 text-center">Giáo án Mẫu KHTN.docx</span>
                        <span className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-4 py-2 rounded-full"><Download className="w-4 h-4" /> Tải về</span>
                      </a>
                    </div>
                  </section>
                </div>
              )}

              {lessonPlanStep === "step3" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-emerald-50 border-b border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-emerald-800 mb-2">Copy prompt lõi tạo cấu hình file Word cho chatGPT</h2>
                        <p className="text-sm text-emerald-600">Sử dụng prompt này để tạo file Word hoàn chỉnh.</p>
                      </div>
                      <button
                        onClick={() => {
                          copyToClipboard(lessonPlanPrompt);
                          alert("Đã copy Prompt!");
                        }}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md transition font-bold flex items-center gap-2 whitespace-nowrap"
                      >
                        <Copy className="w-5 h-5" /> Copy Prompt Ngay
                      </button>
                    </div>
                    <div className="p-6 bg-gray-900 text-emerald-400 font-mono text-sm overflow-auto max-h-[600px]">
                      <pre className="whitespace-pre-wrap">{lessonPlanPrompt || "Đang tải prompt..."}</pre>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}

        {workflow === "comic" && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-200 p-1.5 rounded-2xl shadow-inner flex-col md:flex-row gap-1">
                <button
                  onClick={() => setComicStep("step1")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${comicStep === "step1" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Bước 1: Giới thiệu
                </button>
                <button
                  onClick={() => setComicStep("step2")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${comicStep === "step2" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Bước 2: Copy Prompt lõi Truyện tranh
                </button>
              </div>
            </div>

            <div className="mt-8">
              {comicStep === "step1" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center">
                  <img src="/Quy_trinh_tao_truyen_AI.png" alt="Giới thiệu Truyện Tranh" className="max-w-4xl w-full rounded-2xl shadow-sm border border-gray-200 object-contain bg-white p-2" />
                </div>
              )}

              {comicStep === "step2" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-amber-50 border-b border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-amber-800 mb-2">Copy prompt lõi tạo Truyện tranh</h2>
                        <p className="text-sm text-amber-600">Sử dụng prompt này để tạo truyện tranh bằng AI.</p>
                      </div>
                      <button 
                        onClick={() => {
                          copyToClipboard(comicPrompt);
                          alert("Đã copy Prompt Truyện tranh!");
                        }}
                        className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-md transition font-bold flex items-center gap-2 whitespace-nowrap"
                      >
                        <Copy className="w-5 h-5" /> Copy Prompt Ngay
                      </button>
                    </div>
                    <div className="p-6 bg-gray-900 text-amber-400 font-mono text-sm overflow-auto max-h-[600px]">
                      <pre className="whitespace-pre-wrap">{comicPrompt || "Đang tải prompt..."}</pre>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}

        {workflow === "tools" && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-200 p-1.5 rounded-2xl shadow-inner flex-col md:flex-row gap-1">
                <button
                  onClick={() => setToolTab("mail_edu")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${toolTab === "mail_edu" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Tạo mail edu ảo
                </button>
                <button
                  onClick={() => setToolTab("slot2")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${toolTab === "slot2" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Slot 2: tạo sẵn chưa dùng
                </button>
                <button
                  onClick={() => setToolTab("slot3")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${toolTab === "slot3" ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-300"}`}
                >
                  Slot 3: tạo sẵn chưa dùng
                </button>
              </div>
            </div>

            <div className="mt-8">
              {toolTab === "mail_edu" && (
                <div className="flex flex-col animate-in fade-in bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-blue-50 border-b border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-blue-800">Tạo mail edu ảo</h2>
                      <p className="text-sm text-blue-600 mt-1">Lấy trực tiếp email ảo từ các dịch vụ bên dưới.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        value={mailProvider}
                        onChange={(e) => setMailProvider(e.target.value as any)}
                        className="px-4 py-2 border border-blue-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white text-blue-800"
                      >
                        <option value="etempmail">Dịch vụ: etempmail.com</option>
                        <option value="boomlify">Dịch vụ: boomlify.com</option>
                      </select>

                      {mailProvider === "etempmail" && (
                        <a href="https://etempmail.com/" target="_blank" rel="noreferrer" className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition text-sm font-medium flex items-center gap-2 z-10 whitespace-nowrap">
                          <Globe className="w-4 h-4" /> Mở trang gốc
                        </a>
                      )}
                      {mailProvider === "boomlify" && (
                        <a href="https://boomlify.com/vi/edu-temp-mail" target="_blank" rel="noreferrer" className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition text-sm font-medium flex items-center gap-2 z-10 whitespace-nowrap">
                          <Globe className="w-4 h-4" /> Mở trang gốc
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {mailProvider === "etempmail" && (
                    <div className="relative w-full overflow-hidden bg-gray-50" style={{ height: '700px' }}>
                      {/* Che 2 bên quảng cáo (nếu có trên màn hình rộng) bằng thẻ div */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] z-10"></div>
                      
                      <iframe 
                        src="https://etempmail.com/" 
                        className="absolute left-0 w-full border-none"
                        style={{ 
                          top: '-280px', // Đẩy iframe lên trên để giấu thanh Header
                          height: '1100px', // Tăng chiều cao bù lại phần bị đẩy lên
                        }}
                        title="eTempMail"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                    </div>
                  )}

                  {mailProvider === "boomlify" && (
                    <div className="relative w-full overflow-hidden bg-gray-50" style={{ height: '800px' }}>
                      <iframe 
                        src="https://boomlify.com/vi/edu-temp-mail" 
                        className="w-full h-full border-none"
                        title="Boomlify Edu Temp Mail"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                    </div>
                  )}
                </div>
              )}

              {toolTab === "slot2" && (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-sm border border-gray-200 animate-in fade-in">
                  <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800">Slot 2</h2>
                  <p className="text-gray-500 mt-2">Tính năng này đang được phát triển...</p>
                </div>
              )}

              {toolTab === "slot3" && (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-sm border border-gray-200 animate-in fade-in">
                  <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800">Slot 3</h2>
                  <p className="text-gray-500 mt-2">Tính năng này đang được phát triển...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Liên Hệ */}
        <footer className="mt-16 bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in">
          <div className="text-left space-y-3">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Liên hệ & Hỗ trợ</h3>
            <p className="text-gray-700 text-lg flex items-center gap-2">
              <strong className="w-32">Số điện thoại:</strong> <span className="text-blue-600 font-semibold">091.694.1504</span>
            </p>
            <p className="text-gray-700 text-lg flex items-center gap-2">
              <strong className="w-32">Email:</strong> <span className="text-blue-600 font-semibold">huyhoang194@gmail.com</span>
            </p>
            <p className="text-gray-700 text-lg flex items-center gap-2">
              <strong className="w-32">Nhóm Zalo:</strong>
              <a href="https://zalo.me/g/tbolvtcmeo5qszixspn6" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold bg-blue-50 px-3 py-1 rounded-lg transition">Tham gia ngay</a>
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <img src="/QR-Nhom.jpg" alt="QR Code Nhóm AI thực chiến" className="w-40 h-40 rounded-lg border border-gray-300 shadow-sm object-cover" />
            <span className="text-sm font-bold text-gray-700">QR "AI thực chiến"</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

