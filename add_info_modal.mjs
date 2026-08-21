import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Info and X to imports
code = code.replace(/PenTool,\n\} from 'lucide-react';/, 'PenTool,\n  Info,\n  X,\n} from \'lucide-react\';');

// 2. Add translations to 'en'
code = code.replace(/finished: "Finished! Analyze Next Page"\n  \},/g, 'finished: "Finished! Analyze Next Page",\n    infoTitle: "How to use Little Dragon",\n    infoP1: "📚 **Class Prep:** Quickly analyze new texts before your lesson.",\n    infoP2: "📖 **Read Faster:** Scan book pages to instantly decode complex grammar.",\n    infoP3: "🎬 **Watch Movies:** Snap photos of subtitles while watching Chinese media.",\n    infoP4: "🌍 **Dual Learning:** Passively pick up English nuances alongside Chinese.",\n    infoClose: "Got it"\n  },');

// 3. Add translations to 'ua'
code = code.replace(/finished: "Готово! Наступна сторінка"\n  \}/g, 'finished: "Готово! Наступна сторінка",\n    infoTitle: "Як використовувати додаток",\n    infoP1: "📚 **Підготовка до уроку:** Швидко аналізуйте нові тексти перед заняттям.",\n    infoP2: "📖 **Читайте швидше:** Скануйте сторінки книг для розбору складної граматики.",\n    infoP3: "🎬 **Перегляд фільмів:** Фотографуйте субтитри під час перегляду китайських фільмів.",\n    infoP4: "🌍 **Подвійне навчання:** Покращуйте англійську паралельно з вивченням китайської.",\n    infoClose: "Зрозуміло"\n  }');

// 4. Update CameraCaptureView to include state and modal
// First, find the CameraCaptureView definition to add useState
code = code.replace(/function CameraCaptureView\(\{ onCapture, language, setLanguage \}: \{ onCapture: \(img: string\) => void, language: Language, setLanguage: \(lang: Language\) => void \}\) \{/, 'function CameraCaptureView({ onCapture, language, setLanguage }: { onCapture: (img: string) => void, language: Language, setLanguage: (lang: Language) => void }) {\n  const [showInfo, setShowInfo] = useState(false);');

// Second, add the Info button next to the language button.
code = code.replace(/<button\s*onClick=\{loadSampleChineseText\}\s*className="flex items-center gap-1\.5 px-3 py-1\.5 rounded-full bg-zinc-800\/80 hover:bg-zinc-700\/80 text-zinc-300 border border-zinc-700\/50 text-\[10px\] font-medium backdrop-blur-md transition active:scale-95 cursor-pointer shadow-md"\s*title="Load a sample Chinese practice text"\s*>\s*<span>\{t\[language\]\.trySample\}<\/span>\s*<\/button>/, '<button\n            onClick={() => setShowInfo(true)}\n            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/50 transition active:scale-95 cursor-pointer shadow-md"\n            title="App Information"\n          >\n            <Info className="w-4 h-4" />\n          </button>\n          <button\n            onClick={loadSampleChineseText}\n            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/50 text-[10px] font-medium backdrop-blur-md transition active:scale-95 cursor-pointer shadow-md"\n            title="Load a sample Chinese practice text"\n          >\n            <span>{t[language].trySample}</span>\n          </button>');

// Third, append the modal to the very end of CameraCaptureView's return statement.
const modalHTML = `
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
      )}`;

// We need to insert this right before the last closing </div> of CameraCaptureView return.
// Let's first locate the end of CameraCaptureView.
// It ends with:
//         <div className="w-full max-w-xs aspect-square border-2 border-dashed border-zinc-700/50 rounded-2xl flex flex-col items-center justify-center gap-4 bg-zinc-900/50 hover:bg-zinc-800/50 transition cursor-pointer group shadow-inner" onClick={() => fileInputRef.current?.click()}>
//           ...
//         </div>
//       </div>
//     </div>
//   );
// }

code = code.replace(/<\/div>\n    <\/div>\n  \);\n\}/g, `      ${modalHTML}\n    </div>\n    </div>\n  );\n}`);

fs.writeFileSync('src/App.tsx', code);
console.log('Added Info Modal to CameraCaptureView.');
