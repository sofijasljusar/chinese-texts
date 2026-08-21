import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// HighlighterView Navbar
code = code.replace(/<ChevronLeft className="w-4 h-4" \/>\s*Retake/g, '<ChevronLeft className="w-4 h-4" />\n          {t[language].retake}');
code = code.replace(/<p className="text-\[13px\] font-serif font-semibold text-zinc-100 tracking-wide">Highlight Text<\/p>\s*<p className="text-\[10px\] text-zinc-400 font-light">Mark words or grammar<\/p>/, '<p className="text-[13px] font-serif font-semibold text-zinc-100 tracking-wide">{t[language].highlightTitle}</p>\n          <p className="text-[10px] text-zinc-400 font-light">{t[language].highlightDesc}</p>');
code = code.replace(/<span>Analyze Highlights<\/span>/g, '<span>{t[language].analyze}</span>');

// HighlighterView Drag Hint
code = code.replace(/Drag your finger over words or phrases to highlight them/g, '{t[language].dragHint}');
// Wait, there's another analyze button at the bottom of the highlight page, let's make sure it's handled:
code = code.replace(/<span className="font-serif font-semibold text-sm tracking-wide">Analyze Highlights<\/span>/g, '<span className="font-serif font-semibold text-sm tracking-wide">{t[language].analyze}</span>');


// StudyNotesView Navbar
code = code.replace(/<p className="text-\[13px\] font-serif font-semibold text-zinc-100 tracking-wide">Study Notes<\/p>\s*<p className="text-\[10px\] text-zinc-400 font-light">Copy to your copybook<\/p>/, '<p className="text-[13px] font-serif font-semibold text-zinc-100 tracking-wide">{t[language].studyNotes}</p>\n            <p className="text-[10px] text-zinc-400 font-light">{t[language].copybook}</p>');
code = code.replace(/\{copied \? 'Copied!' : 'Copy'\}/g, '{copied ? t[language].copied : t[language].copy}');
code = code.replace(/<span>End Learning<\/span>/g, '<span>{t[language].endLearning}</span>');


// StudyNotesView Loading State
// Note: It looks like the StudyNotesView loading state uses different colors now! Let's match the exact classes.
code = code.replace(/<p className="font-serif font-semibold text-\[#2d2424\] text-lg">Analyzing Highlights\.\.\.<\/p>\s*<p className="text-xs text-\[#5e4b4b\] mt-2 max-w-\[260px\] leading-relaxed">\s*Checking Pinyin, Chengyu origins, formality & grammar structure\.\s*<\/p>/, '<p className="font-serif font-semibold text-[#2d2424] text-lg">{t[language].analyzing}</p>\n              <p className="text-xs text-[#5e4b4b] mt-2 max-w-[260px] leading-relaxed">\n                {t[language].analyzingDesc}\n              </p>');

// Wait, the colors above seem to be from an older theme, let's verify if they match.
fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated for remaining translations.');
