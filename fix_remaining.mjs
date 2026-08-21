import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. StudyNotesView Navbar Text
code = code.replace(/<h2 className="text-\[15px\] font-serif font-bold text-\[#2d2424\] tracking-wide">Study Notes<\/h2>\s*<p className="text-\[11px\] text-\[#5e4b4b\] font-light">Copy to your copybook<\/p>/, '<h2 className="text-[15px] font-serif font-bold text-[#2d2424] tracking-wide">{t[language].studyNotes}</h2>\n            <p className="text-[11px] text-[#5e4b4b] font-light">{t[language].copybook}</p>');

// 2. StudyNotesView Copy Buttons
code = code.replace(/<span className="text-emerald-700 font-semibold">Copied!<\/span>/, '<span className="text-emerald-700 font-semibold">{t[language].copied}</span>');
code = code.replace(/<span className="text-red-900">Copy<\/span>/, '<span className="text-red-900">{t[language].copy}</span>');

// 3. End Learning Button in Header (if any) - no wait, let's search if End Learning is there
code = code.replace(/<span className="text-white">End Learning<\/span>/, '<span className="text-white">{t[language].endLearning}</span>');
code = code.replace(/<span>End Learning<\/span>/g, '<span>{t[language].endLearning}</span>');


// 4. StudyNotesView Bottom Actions
code = code.replace(/<button\s*onClick=\{onEndLearning\}\s*className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-red-900 hover:bg-red-950 text-white shadow-lg active:scale-95 transition"\s*>\s*<RefreshCw className="w-4 h-4 text-red-200" \/>\s*<span>Finished! Analyze Next Page<\/span>\s*<\/button>/, '<button\n            onClick={onEndLearning}\n            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-red-900 hover:bg-red-950 text-white shadow-lg active:scale-95 transition"\n          >\n            <RefreshCw className="w-4 h-4 text-red-200" />\n            <span>{t[language].finished}</span>\n          </button>');

// 5. StudyNotesView Error State
code = code.replace(/<p className="text-red-600 font-semibold mb-2">Analysis Error<\/p>\s*<p className="text-\[#5e4b4b\] text-sm mb-6 max-w-\[240px\]">\{error\}<\/p>\s*<button\s*onClick=\{onEndLearning\}\s*className="px-6 py-2\.5 rounded-full bg-red-900 text-white text-sm font-medium hover:bg-red-950 transition active:scale-95 shadow-md"\s*>\s*Back to Camera\s*<\/button>/, '<p className="text-red-600 font-semibold mb-2">{t[language].analysisError}</p>\n            <p className="text-[#5e4b4b] text-sm mb-6 max-w-[240px]">{error}</p>\n            <button\n              onClick={onEndLearning}\n              className="px-6 py-2.5 rounded-full bg-red-900 text-white text-sm font-medium hover:bg-red-950 transition active:scale-95 shadow-md"\n            >\n              {t[language].backToCamera}\n            </button>');

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated for StudyNotesView specific styles.');
