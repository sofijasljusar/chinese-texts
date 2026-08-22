import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Upload,
  RotateCcw,
  ArrowRight,
  Undo2,
  Check,
  Copy,
  BookOpen,
  RefreshCw,
  Eye,
  ChevronLeft,
  PenTool,
  Info,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Step = 'CAMERA' | 'HIGHLIGHT' | 'STUDY';

type HighlightColor = 'vocab' | 'grammar';

const COLOR_CONFIG = {
  vocab: {
    name: 'Vocabulary',
    label: 'New Words',
    hex: 'rgba(245, 158, 11, 0.45)', // Imperial Gold / Amber
    border: 'rgb(245, 158, 11)',
    badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    indicator: 'bg-amber-500',
  },
  grammar: {
    name: 'Grammar',
    label: 'Grammar / Structure',
    hex: 'rgba(5, 150, 105, 0.45)', // Jade Green / Emerald
    border: 'rgb(5, 150, 105)',
    badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    indicator: 'bg-emerald-600',
  },
};


export type Language = 'en' | 'ua';

export const t = {
  en: {
    title: "Little Dragon",
    subtitle: "Snap text to highlight & analyze",
    trySample: "Try Sample",
    scanTitle: "Scan Chinese Text",
    scanDesc: "Upload an existing image from your device to begin analysis.",
    choosePhoto: "Choose Photo",
    retake: "Retake",
    highlightTitle: "Highlight Text",
    highlightDesc: "Mark words or grammar",
    newWords: "New Words",
    grammar: "Grammar",
    dragHint: "Drag your finger over words to highlight",
    analyze: "Analyze Highlights",
    studyNotes: "Study Notes",
    copybook: "Copy to your copybook",
    copy: "Copy",
    copied: "Copied!",
    endLearning: "End Learning",
    analyzing: "Analyzing Highlights...",
    analyzingDesc: "Checking Pinyin, Chengyu origins, formality & grammar structure.",
    analysisError: "Analysis Error",
    backToCamera: "Back to Camera",
    finished: "Finished! Analyze Next Page",
    infoTitle: "How to use Little Dragon",
    infoP1: "📜 **Prep for Class:** Quickly analyze new texts before learning them.",
    infoP2: "🏮 **Read Faster:** Scan book pages to instantly decode complex grammar.",
    infoP3: "🀄  **Watch Movies:** Snap photos of subtitles while watching Chinese media.",
    infoP4: "⛩️ **Dual Learning:** Passively pick up English nuances alongside Chinese.",
    infoClose: "Got it",
    errorAnalyze: "Unable to analyze image. Please try again.",
    errorGenerate: "Couldn't generate message, please try again soon.",
    errorNoAnalysis: "No analysis available."
  },
  ua: {
    title: "Маленький Дракон",
    subtitle: "Сфотографуйте текст для аналізу",
    trySample: "Зразок",
    scanTitle: "Сканувати текст",
    scanDesc: "Завантажте зображення з пристрою, щоб почати аналіз.",
    choosePhoto: "Вибрати фото",
    retake: "Перезняти",
    highlightTitle: "Виділіть текст",
    highlightDesc: "Позначте слова або граматику",
    newWords: "Нові слова",
    grammar: "Граматика",
    dragHint: "Проведіть пальцем по словах, щоб виділити",
    analyze: "Аналізувати виділене",
    studyNotes: "Навчальні нотатки",
    copybook: "Скопіюйте у свій зошит",
    copy: "Копіювати",
    copied: "Скопійовано!",
    endLearning: "Завершити",
    analyzing: "Аналізуємо виділене...",
    analyzingDesc: "Перевіряємо піньїнь, походження чен'юй, формальність та граматику.",
    analysisError: "Помилка аналізу",
    backToCamera: "Назад до камери",
    finished: "Готово! Наступна сторінка",
    infoTitle: "Як використовувати додаток",
    infoP1: "📜 **Готуйтесь до уроку:** Швидко аналізуйте нові тексти перед вивченням.",
    infoP2: "🏮 **Читайте книги:** Скануйте сторінки книг для розбору складної граматики.",
    infoP3: "🀄 **Переглядайте фільми:** Фотографуйте субтитри під час перегляду китайських фільмів.",
    infoP4: "⛩️ **Подвійне навчання:** Покращуйте англійську паралельно з вивченням китайської.",
    infoClose: "Зрозуміло",
    errorAnalyze: "Не вдалося проаналізувати зображення. Будь ласка, спробуйте ще раз.",
    errorGenerate: "Не вдалося згенерувати повідомлення, будь ласка, спробуйте пізніше.",
    errorNoAnalysis: "Аналіз недоступний."
  }
};

export default function App() {
  const [language, setLanguage] = useState<Language>('ua');
  const [step, setStep] = useState<Step>('CAMERA');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImageCaptured = (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setStep('HIGHLIGHT');
  };

  const handleStartAnalysis = async (annotatedDataUrl: string) => {
    setStep('STUDY');
    setIsLoading(true);
    setErrorMsg(null);
    setAnalysisResult('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: annotatedDataUrl, language }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Backend API Error:', data.error);
        throw new Error(t[language].errorAnalyze);
      }
      setAnalysisResult(data.result || t[language].errorNoAnalysis);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message === "Failed to fetch" ? t[language].errorGenerate : (err.message || t[language].errorGenerate));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndLearning = () => {
    setStep('CAMERA');
    setCapturedImage(null);
    setAnalysisResult('');
    setErrorMsg(null);
  };

  const handleCopyNotes = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="w-full min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start sm:p-4 selection:bg-red-800 selection:text-white font-sans">
      <div className="w-full max-w-md min-h-[100dvh] sm:min-h-[850px] sm:max-h-[920px] bg-zinc-950 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border border-zinc-800">
        {step === 'CAMERA' && (
          <CameraCaptureView onCapture={handleImageCaptured} language={language} setLanguage={setLanguage} />
        )}

        {step === 'HIGHLIGHT' && capturedImage && (
          <HighlighterView
            rawImage={capturedImage}
            onCancel={() => setStep('CAMERA')}
            onAnalyze={handleStartAnalysis}
            language={language}
          />
        )}

        {step === 'STUDY' && (
          <StudyNotesView
            markdownText={analysisResult}
            isLoading={isLoading}
            error={errorMsg}
            copied={copied}
            onCopy={handleCopyNotes}
            onEndLearning={handleEndLearning}
            language={language}
          />
        )}
      </div>
    </main>
  );
}

/* =========================================================================
   1. CAMERA & CAPTURE VIEW
   ========================================================================= */
function CameraCaptureView({ onCapture, language, setLanguage }: { onCapture: (img: string) => void, language: Language, setLanguage: (lang: Language) => void }) {
  const [showInfo, setShowInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadSampleChineseText = () => {
    // Render a high quality sample Chinese passage onto a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background paper texture
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines (like Chinese exercise copybook)
    ctx.strokeStyle = '#e9e1d5';
    ctx.lineWidth = 1;
    for (let y = 100; y < canvas.height - 100; y += 70) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(canvas.width - 80, y);
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('每日中文阅读 · 学习小记', 100, 160);

    // Paragraphs with Chengyu, grammar, vocab
    ctx.fillStyle = '#292524';
    ctx.font = '28px sans-serif';
    const lines = [
      '今天早上我早早地来到图书馆。',
      '为了提高我的中文水平，我必须持之以恒。',
      '老师常说：“塞翁失马，焉知非福。”',
      '哪怕遇到困难，我们也不应该轻易放弃。',
      '把这本书读完之后，我打算去拜访老朋友。',
      '只要每天坚持练习，不知不觉中就会有很大进步。',
      '中国文化博大精深，蕴含着古人的智慧。',
    ];

    let yPos = 250;
    lines.forEach((line) => {
      ctx.fillText(line, 100, yPos);
      yPos += 80;
    });

    // Decorative student stamp
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width - 240, canvas.height - 200, 140, 70);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('学而时习之', canvas.width - 230, canvas.height - 155);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCapture(dataUrl);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative">
      {/* Top App Header */}
      <header className="absolute top-0 inset-x-0 px-5 pb-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] z-20 flex items-center justify-between bg-gradient-to-b from-zinc-950/90 via-zinc-950/50 to-transparent backdrop-blur-[2px]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-red-800 border border-red-500/50 flex items-center justify-center text-amber-50 font-serif font-bold text-lg shadow-lg">
            龙
          </div>
          <div>
            <h1 className="text-[15px] font-serif font-semibold text-zinc-100 tracking-widest uppercase">{t[language].title}</h1>
            <p className="text-[11px] text-zinc-400 font-light tracking-wide">{t[language].subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/50 transition active:scale-95 cursor-pointer shadow-md"
            title="App Information"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={loadSampleChineseText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/50 text-[10px] font-medium backdrop-blur-md transition active:scale-95 cursor-pointer shadow-md"
            title="Load a sample Chinese practice text"
          >
            <span>{t[language].trySample}</span>
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ua' : 'en')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-amber-50/90 border border-zinc-700/50 text-[10px] font-bold backdrop-blur-md transition active:scale-95 cursor-pointer shadow-md"
            title="Switch Language"
          >
            {language === 'en' ? 'UA' : 'EN'}
          </button>
        </div>
      </header>

      {/* Main Upload area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Beautiful Chinese Painting Background (Guo Xi - Early Spring) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 pointer-events-none" 
          style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Guo_Xi_-_Early_Spring_%28large%29.jpg/960px-Guo_Xi_-_Early_Spring_%28large%29.jpg")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm relative z-10">
          <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl relative backdrop-blur-sm">
            <div className="absolute inset-2 rounded-full border border-zinc-800 border-dashed animate-[spin_60s_linear_infinite]"></div>
            <Camera className="w-10 h-10 text-zinc-600 drop-shadow-md" />
          </div>

          <h3 className="text-zinc-100 font-serif tracking-wide text-xl mb-3">{t[language].scanTitle}</h3>
          <p className="text-xs text-zinc-400 max-w-[260px] mb-8 leading-relaxed font-light">{t[language].scanDesc}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-6 py-3.5 rounded-xl bg-red-900 hover:bg-red-950 text-amber-50 text-base font-serif font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(100,10,10,0.2)] active:scale-95 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-200/60" />
              <span>{t[language].choosePhoto}</span>
            </button>
          </div>
        </div>
            
      {/* Information Modal */}
      {showInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInfo(false)} />
          <div className="relative bg-zinc-900 border border-zinc-700/50 shadow-2xl rounded-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-serif font-semibold text-zinc-100 mb-5 pr-8">
              {t[language].infoTitle}
            </h2>
            <div className="space-y-4">
              <div className="text-sm text-zinc-300 leading-relaxed"><ReactMarkdown>{t[language].infoP1}</ReactMarkdown></div>
              <div className="text-sm text-zinc-300 leading-relaxed"><ReactMarkdown>{t[language].infoP2}</ReactMarkdown></div>
              <div className="text-sm text-zinc-300 leading-relaxed"><ReactMarkdown>{t[language].infoP3}</ReactMarkdown></div>
              <div className="text-sm text-zinc-300 leading-relaxed"><ReactMarkdown>{t[language].infoP4}</ReactMarkdown></div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-amber-50 font-medium tracking-wide shadow-lg transition active:scale-95"
            >
              {t[language].infoClose}
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

/* =========================================================================
   2. HIGHLIGHT & ANNOTATION VIEW
   ========================================================================= */
interface Stroke {
  points: { x: number; y: number }[];
  color: HighlightColor;
  width: number;
}

function HighlighterView({
  rawImage,
  onCancel,
  onAnalyze,
  language,
}: {
  rawImage: string;
  onCancel: () => void;
  onAnalyze: (annotatedImage: string) => void;
  language: Language;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [activeColor, setActiveColor] = useState<HighlightColor>('vocab');
  const [brushSize, setBrushSize] = useState<number>(36);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasDim, setCanvasDim] = useState({ width: 300, height: 400 });

  // Load image onto canvas
  useEffect(() => {
    const img = new Image();
    img.src = rawImage;
    img.onload = () => {
      imageRef.current = img;
      if (!containerRef.current || !canvasRef.current) return;

      const container = containerRef.current;
      const cWidth = container.clientWidth;
      const cHeight = container.clientHeight;

      const scale = Math.min(cWidth / img.width, cHeight / img.height, 1);
      const displayW = Math.round(img.width * scale);
      const displayH = Math.round(img.height * scale);

      setCanvasDim({ width: displayW, height: displayH });

      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      redraw(strokes);
    };
  }, [rawImage]);

  // Redraw all strokes & image
  const redraw = useCallback(
    (strokeList: Stroke[]) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Render highlighter strokes with nice semi-transparent overlay
      strokeList.forEach((st) => {
        if (st.points.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(st.points[0].x, st.points[0].y);
        for (let i = 1; i < st.points.length; i++) {
          ctx.lineTo(st.points[i].x, st.points[i].y);
        }
        ctx.strokeStyle = COLOR_CONFIG[st.color].hex;
        ctx.lineWidth = st.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      });
    },
    []
  );

  useEffect(() => {
    redraw(strokes);
  }, [strokes, redraw]);

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords || !canvasRef.current) return;

    // Scale brush size to natural image resolution
    const actualBrushWidth = (brushSize / 400) * canvasRef.current.width;

    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [coords],
      color: activeColor,
      width: Math.max(actualBrushWidth, 20),
    };
    setStrokes((prev) => [...prev, newStroke]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updated = {
        ...last,
        points: [...last.points, coords],
      };
      return [...prev.slice(0, -1), updated];
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setStrokes([]);
  };

  const handleFinish = () => {
    if (!canvasRef.current) return;
    const annotatedData = canvasRef.current.toDataURL('image/jpeg', 0.88);
    onAnalyze(annotatedData);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 select-none">
      {/* Top Action Bar */}
      <header className="px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md flex items-center justify-between z-10">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-serif font-medium text-zinc-400 hover:text-zinc-100 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          {t[language].retake}
        </button>

        <div className="text-center">
          <p className="text-[13px] font-serif font-semibold text-zinc-100 tracking-wide">{t[language].highlightTitle}</p>
          <p className="text-[10px] text-zinc-400 font-light">{t[language].highlightDesc}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Undo stroke"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearAll}
            disabled={strokes.length === 0}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Clear all"
            aria-label="Clear all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Highlighter Color Switcher */}
      <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-center gap-3 z-10">
        <button
          onClick={() => setActiveColor('vocab')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeColor === 'vocab'
              ? 'bg-amber-600/20 text-amber-500 shadow-lg shadow-amber-900/20 scale-[1.02] ring-1 ring-amber-500/50'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-200/40"></span>
          <span>{t[language].newWords}</span>
        </button>

        <button
          onClick={() => setActiveColor('grammar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeColor === 'grammar'
              ? 'bg-emerald-600/20 text-emerald-500 shadow-lg shadow-emerald-900/20 scale-[1.02] ring-1 ring-emerald-500/50'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-200/40"></span>
          <span>{t[language].grammar}</span>
        </button>
      </div>

      {/* Interactive Drawing Canvas Stage */}
      <div
        ref={containerRef}
        className="flex-1 bg-zinc-950 flex items-center justify-center relative overflow-hidden touch-none p-2"
      >
        <canvas
          ref={canvasRef}
          style={{
            width: `${canvasDim.width}px`,
            height: `${canvasDim.height}px`,
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="rounded-xl shadow-2xl cursor-crosshair border border-zinc-800"
        />

        {strokes.length === 0 && (
          <div className="absolute bottom-6 inset-x-8 py-2.5 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md text-center text-[11px] font-light text-zinc-400 pointer-events-none shadow-xl">
            <span className="inline-block mr-1">🖌️</span> {t[language].dragHint}
          </div>
        )}
      </div>

      {/* Bottom Submit Action */}
      <footer className="p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] bg-zinc-900 border-t border-zinc-800 flex items-center gap-3">
        <button
          onClick={handleFinish}
          className="w-full py-4 bg-red-900 hover:bg-red-950 text-amber-50 font-serif tracking-wide rounded-2xl flex items-center justify-center gap-2 text-[15px] shadow-[0_8px_30px_rgba(100,10,10,0.2)] active:scale-[0.98] transition"
        >
          <span>{t[language].analyze}</span>
          <ArrowRight className="w-4 h-4 ml-1 text-amber-200/60" />
        </button>
      </footer>
    </div>
  );
}

/* =========================================================================
   3. STUDY NOTES & CLEAN MARKDOWN VIEW
   ========================================================================= */
function StudyNotesView({
  markdownText,
  isLoading,
  error,
  copied,
  onCopy,
  onEndLearning,
  language,
}: {
  markdownText: string;
  isLoading: boolean;
  error: string | null;
  copied: boolean;
  onCopy: () => void;
  onEndLearning: () => void;
  language: Language;
}) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcf9f2] text-[#2d2424] overflow-hidden font-sans">
      {/* Top Clean Header */}
      <header className="px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] border-b border-red-900/10 bg-[#fcf9f2]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shadow-sm shadow-red-900/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-900/5 border border-red-900/10 flex items-center justify-center text-red-800">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[15px] font-serif font-bold text-[#2d2424] tracking-wide">{t[language].studyNotes}</h2>
            <p className="text-[11px] text-[#5e4b4b] font-light">{t[language].copybook}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && markdownText && (
            <button
              onClick={onCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white hover:bg-red-50 text-[#5e4b4b] border border-red-900/10 transition shadow-sm active:scale-95"
              title="Copy notes"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{t[language].copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-red-800" />
                  <span className="text-red-900">{t[language].copy}</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={onEndLearning}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-red-800 hover:bg-red-700 text-amber-50 shadow-[0_2px_10px_rgba(153,27,27,0.2)] transition active:scale-95 tracking-wide"
          >
            {t[language].endLearning}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
            <div className="w-14 h-14 rounded-full border-4 border-red-900/10 border-t-red-700 animate-spin" />
            <div>
              <p className="font-serif font-semibold text-[#2d2424] text-lg">{t[language].analyzing}</p>
              <p className="text-xs text-[#5e4b4b] mt-2 max-w-[260px] leading-relaxed">
                {t[language].analyzingDesc}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm space-y-3 shadow-inner">
            <p className="font-bold font-serif text-red-900 text-lg">Analysis Error</p>
            <p className="text-xs leading-relaxed">{error}</p>
            <button
              onClick={onEndLearning}
              className="mt-4 px-5 py-2.5 rounded-xl bg-red-700 text-amber-50 text-xs font-semibold hover:bg-red-800 transition shadow-md"
            >
              Back to Camera
            </button>
          </div>
        ) : (
          <div className="study-markdown-container space-y-5 text-[#2d2424] text-[15px] leading-relaxed">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-lg font-serif font-bold text-red-900 mt-8 mb-4 pb-2 border-b border-red-900/10 flex items-center gap-2"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-base font-serif font-bold text-[#2d2424] mt-6 mb-3"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="space-y-3 my-4 pl-5 list-disc marker:text-red-700/60" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="space-y-3 my-4 pl-5 list-decimal marker:text-red-800 font-serif" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-[#3b2f2f] leading-relaxed pl-1" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-red-900" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-[#3b2f2f] leading-[1.8] mb-4" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-8 border-red-900/10" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="p-4 my-5 bg-red-900/[0.03] border-l-4 border-red-700 rounded-r-xl text-sm text-[#5e4b4b] italic font-serif leading-relaxed"
                    {...props}
                  />
                ),
              }}
            >
              {markdownText}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Floating Bottom "End Learning" Button */}
      {!isLoading && !error && (
        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2]/90 to-transparent pointer-events-none z-20">
          <div className="pointer-events-auto">
            <button
              onClick={onEndLearning}
              className="w-full py-4 bg-red-900 hover:bg-red-950 text-amber-50 font-serif font-medium tracking-wide rounded-2xl flex items-center justify-center gap-2 text-[15px] shadow-[0_8px_30px_rgba(100,10,10,0.2)] transition active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4 text-amber-200/60" />
              <span>{t[language].finished}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
