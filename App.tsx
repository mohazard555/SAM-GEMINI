
import React, { useState, useEffect, useRef } from 'react';
import { generateImage } from './services/geminiService';
import type { GalleryItem, UploadedImage } from './types';
import { CameraIcon, UploadIcon, DownloadIcon, SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const galleryItems: GalleryItem[] = [
    { id: 1, prompt: 'قطة لطيفة ترتدي قبعة ساحر وتجلس على كومة من الكتب القديمة، بأسلوب فن رقمي', imageUrl: 'https://picsum.photos/seed/cat-wizard/300/300' },
    { id: 2, prompt: 'سيارة رياضية مستقبلية تحلق فوق مدينة نيون مضيئة ليلاً، بأسلوب السايبربانك', imageUrl: 'https://picsum.photos/seed/cyberpunk-car/300/300' },
    { id: 3, prompt: 'غابة مسحورة بأشجار متوهجة وشلالات متلألئة تحت سماء مرصعة بالنجوم', imageUrl: 'https://picsum.photos/seed/magic-forest/300/300' },
    { id: 4, prompt: 'رائد فضاء يطفو في الفضاء ويصطاد الكواكب الصغيرة بشبكة فراشات، بأسلوب كرتوني', imageUrl: 'https://picsum.photos/seed/space-astronaut/300/300' },
    { id: 5, prompt: 'بورتريه لكلب من فصيلة الهاسكي يرتدي نظارات شمسية عاكسة، بألوان زاهية', imageUrl: 'https://picsum.photos/seed/husky-glasses/300/300' },
    { id: 6, prompt: 'مدينة تحت الماء مصنوعة من الكريستال والمرجان، تسبح فيها الأسماك المضيئة', imageUrl: 'https://picsum.photos/seed/underwater-city/300/300' },
  ];

  const fileToBase64 = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({ mimeType: file.type, data: base64Data });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImagePreview(URL.createObjectURL(file));
      const base64Image = await fileToBase64(file);
      setUploadedImage(base64Image);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt && !uploadedImage) {
      setError('يرجى كتابة وصف أو رفع صورة مرجعية.');
      return;
    }

    // Explicitly check for the API key before proceeding.
    // This prevents the app from using mock data and provides clear feedback.
    if (!process.env.API_KEY) {
      setError('مفتاح API غير متوفر. يرجى التأكد من إعداده للمتابعة.');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      // The API key exists, so we proceed with the real API call.
      const imageData = await generateImage(prompt, uploadedImage);
      setGeneratedImage(`data:image/png;base64,${imageData}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `sam-gimini-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleGalleryClick = (itemPrompt: string) => {
    setPrompt(itemPrompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`flex flex-col min-h-screen bg-pink-50 text-purple-900 transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <header className="py-4 px-6 md:px-12 shadow-md bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-center">
          <CameraIcon className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mx-3">
            SAM GIMINI
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <section className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-4">أنشئ صورتك بالذكاء الاصطناعي</h2>
          <p className="text-center text-purple-700/80 mb-6">اكتب وصفاً دقيقاً للصورة التي تتخيلها، أو ارفع صورة كمرجع للإلهام.</p>
          
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: أسد يرتدي نظارات شمسية على الشاطئ، بأسلوب الرسم الزيتي..."
              className="w-full p-4 border-2 border-pink-200 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-300 h-28 resize-none"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 p-3 bg-gray-100 text-purple-800 rounded-2xl hover:bg-gray-200 transition-all duration-300 shadow-sm"
              >
                <UploadIcon className="w-5 h-5" />
                <span>رفع صورة مرجعية</span>
              </button>
              {uploadedImagePreview && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-pink-200 p-1">
                  <img src={uploadedImagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  <span>إنشاء الصورة الآن</span>
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </section>

        {generatedImage && (
          <section className="w-full max-w-2xl mt-8 flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <img src={generatedImage} alt="Generated" className="rounded-xl w-full max-w-lg" />
            </div>
            <button
              onClick={handleDownloadImage}
              className="mt-4 flex items-center justify-center gap-2 p-3 bg-white text-purple-800 rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-md"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>تحميل الصورة</span>
            </button>
          </section>
        )}

        <section className="w-full max-w-5xl mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">جرّب هذه النماذج</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleGalleryClick(item.prompt)}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-center text-xs">{item.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full bg-white/30 text-center p-4 mt-8">
        <p className="text-purple-800/70 font-poppins text-sm">
          Developed by MOHANNAD — TEL: 963998171954
        </p>
      </footer>
    </div>
  );
};

export default App;
