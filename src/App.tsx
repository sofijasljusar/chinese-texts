import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Upload,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Undo2,
  Check,
  Copy,
  BookOpen,
  RefreshCw,
  Eye,
  ChevronLeft,
  PenTool,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Step = 'CAMERA' | 'HIGHLIGHT' | 'STUDY';

type HighlightColor = 'vocab' | 'grammar';

const COLOR_CONFIG = {
  vocab: {
    name: 'Vocabulary',
    label: 'New Words',
    hex: 'rgba(249, 115, 22, 0.45)', // Coral Orange
    border: 'rgb(249, 115, 22)',
    badgeBg: 'bg-orange-500/10 text-orange-700 border-orange-200',
    indicator: 'bg-orange-500',
  },
  grammar: {
    name: 'Grammar',
    label: 'Grammar / Structure',
    hex: 'rgba(59, 130, 246, 0.45)', // Sky / Azure Blue
    border: 'rgb(59, 130, 246)',
    badgeBg: 'bg-blue-500/10 text-blue-700 border-blue-200',
    indicator: 'bg-blue-500',
  },
};

export default function App() {
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
        body: JSON.stringify({ image: annotatedDataUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to analyze image. Please try again.');
      }
      setAnalysisResult(data.result || 'No analysis available.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Couldn't generate message, please try again soon.");
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
    <main className="w-full min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start sm:p-4 selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-md min-h-[100dvh] sm:min-h-[850px] sm:max-h-[920px] bg-zinc-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border border-zinc-800">
        {step === 'CAMERA' && (
          <CameraCaptureView onCapture={handleImageCaptured} />
        )}

        {step === 'HIGHLIGHT' && capturedImage && (
          <HighlighterView
            rawImage={capturedImage}
            onCancel={() => setStep('CAMERA')}
            onAnalyze={handleStartAnalysis}
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
          />
        )}
      </div>
    </main>
  );
}

/* =========================================================================
   1. CAMERA & CAPTURE VIEW
   ========================================================================= */
function CameraCaptureView({ onCapture }: { onCapture: (img: string) => void }) {
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
    <div className="flex-1 flex flex-col h-full bg-black relative">
      {/* Top App Header */}
      <header className="absolute top-0 inset-x-0 px-5 pb-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] z-20 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-sm">
            汉
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">Chinese Study</h1>
            <p className="text-[11px] text-zinc-400">Snap text to highlight & analyze</p>
          </div>
        </div>

        <button
          onClick={loadSampleChineseText}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium backdrop-blur-sm transition active:scale-95 cursor-pointer"
          title="Load a sample Chinese practice text"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Try Sample</span>
        </button>
      </header>

      {/* Main Upload area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center justify-center text-center p-8 text-zinc-400 max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5 text-zinc-400 shadow-inner relative">
            <Camera className="w-10 h-10 text-orange-500/80" />
          </div>

          <h3 className="text-zinc-100 font-semibold text-lg mb-2">Scan Chinese Text</h3>
          <p className="text-xs text-zinc-400 max-w-[280px] mb-6 leading-relaxed">
            Upload an existing image from your device to begin analysis.
          </p>

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
              className="w-full px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium flex items-center justify-center gap-2 border border-zinc-700 active:scale-95 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-zinc-400" />
              <span>Choose Photo</span>
            </button>
          </div>
        </div>
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
}: {
  rawImage: string;
  onCancel: () => void;
  onAnalyze: (annotatedImage: string) => void;
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
      <header className="px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md flex items-center justify-between z-10">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Retake
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold text-zinc-200">Highlight Text</p>
          <p className="text-[10px] text-zinc-400">Mark words or grammar</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
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
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-102 ring-2 ring-orange-400/40'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-orange-400 border border-white/60"></span>
          <span>New Words</span>
        </button>

        <button
          onClick={() => setActiveColor('grammar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeColor === 'grammar'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-102 ring-2 ring-blue-400/40'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-blue-400 border border-white/60"></span>
          <span>Grammar & Order</span>
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
          <div className="absolute bottom-4 inset-x-6 py-2 px-3 rounded-xl bg-zinc-900/90 border border-zinc-700 backdrop-blur-md text-center text-xs text-zinc-300 pointer-events-none">
            👉 Drag your finger over words or phrases to highlight them
          </div>
        )}
      </div>

      {/* Bottom Submit Action */}
      <footer className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center gap-3">
        <button
          onClick={handleFinish}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-orange-500/20 active:scale-98 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze Highlights with AI</span>
          <ArrowRight className="w-4 h-4 ml-1" />
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
}: {
  markdownText: string;
  isLoading: boolean;
  error: string | null;
  copied: boolean;
  onCopy: () => void;
  onEndLearning: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white text-zinc-900 overflow-hidden font-sans">
      {/* Top Clean Header */}
      <header className="px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] border-b border-zinc-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Study Notes</h2>
            <p className="text-[11px] text-zinc-500">Copy to your copybook</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && markdownText && (
            <button
              onClick={onCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition active:scale-95"
              title="Copy notes"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onEndLearning}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs transition active:scale-95"
          >
            End Learning
          </button>
        </div>
      </header>

      {/* Main Content Area (Crisp White Screen for Easy Reading & Note Copying) */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-3 border-zinc-200 border-t-orange-500 animate-spin" />
            <div>
              <p className="font-semibold text-zinc-800 text-base">Analyzing Highlights...</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                Checking Pinyin, Chengyu origins, formality & grammar structure.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm space-y-2">
            <p className="font-bold text-red-900">Analysis Error</p>
            <p className="text-xs leading-relaxed">{error}</p>
            <button
              onClick={onEndLearning}
              className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
            >
              Back to Camera
            </button>
          </div>
        ) : (
          <div className="study-markdown-container space-y-4 text-zinc-800 text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-base font-bold text-zinc-900 mt-6 mb-3 pb-2 border-b border-zinc-200 flex items-center gap-2"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-sm font-bold text-zinc-800 mt-4 mb-2"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="space-y-2.5 my-3 pl-4 list-disc marker:text-orange-500" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="space-y-2.5 my-3 pl-4 list-decimal marker:text-zinc-500" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-zinc-700 leading-relaxed text-sm" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-zinc-900" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-zinc-700 text-sm leading-relaxed mb-3" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-6 border-zinc-200" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="p-3 my-3 bg-zinc-50 border-l-4 border-orange-400 rounded-r-xl text-xs text-zinc-600 italic"
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
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-20">
          <div className="pointer-events-auto">
            <button
              onClick={onEndLearning}
              className="w-full py-3.5 bg-zinc-900 hover:bg-black text-white font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl transition active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-zinc-400" />
              <span>Finished! Take Next Photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
