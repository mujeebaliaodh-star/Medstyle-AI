import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Brain, 
  Settings, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  PlayCircle, 
  CheckCircle, 
  BookOpen, 
  FileUp, 
  Camera, 
  AlertTriangle, 
  Loader2, 
  ArrowUpRight, 
  Zap, 
  Sparkles, 
  X,
  Plus,
  Trash2,
  Download,
  Copy,
  History as HistoryIcon,
  Moon,
  Sun,
  Languages,
  Maximize2,
  RefreshCw,
  Info,
  Mail,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ReactMarkdown from 'react-markdown';
import { MCQ } from './types';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Medstyle-ai Custom Icon (Pure SVG)
const MedStyleIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Stylized Pulse Line */}
    <motion.path 
      d="M2 12H5L7 8L10 16L12 12H14" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    {/* Neural Nodes / Binary Grid */}
    <motion.circle 
      cx="17" cy="12" r="1.5" fill="currentColor"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    />
    <motion.circle 
      cx="21" cy="9" r="1.5" fill="currentColor"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    />
    <motion.circle 
      cx="21" cy="15" r="1.5" fill="currentColor"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.4, duration: 0.5 }}
    />
    {/* Connecting lines */}
    <motion.path 
      d="M14 12L17 12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeDasharray="2 1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ delay: 1.1 }}
    />
    <motion.path 
      d="M17 12L21 9" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeDasharray="2 1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ delay: 1.3 }}
    />
    <motion.path 
      d="M17 12L21 15" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeDasharray="2 1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ delay: 1.5 }}
    />
  </svg>
);

const DEFAULT_SUBJECTS = [
  { id: 'anatomy', name: 'Human Anatomy', icon: BookOpen, color: 'bg-emerald-500' },
  { id: 'pathology', name: 'Pathology', icon: Zap, color: 'bg-rose-500' },
  { id: 'pharmacology', name: 'Pharmacology', icon: Sparkles, color: 'bg-blue-500' },
  { id: 'physiology', name: 'Physiology', icon: Brain, color: 'bg-violet-500' },
];

const SplashScreen = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
    transition={{ duration: 0.8, ease: "circOut" }}
    className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex flex-col items-center justify-center overflow-hidden"
  >
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#004A99]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
    </div>

    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "backOut" }}
      className="relative z-10 flex flex-col items-center"
    >
      <div className="relative mb-10 brand-pulse">
        <MedStyleIcon size={120} className="text-[#004A99] dark:text-[#38BDF8]" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black text-[#004A99] dark:text-[#38BDF8] tracking-tight mb-2">
          Medstyle<span className="text-slate-900 dark:text-white">-ai</span>
        </h1>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-slate-100 dark:bg-slate-800" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
            Senior Edition • v3.0
          </p>
          <div className="h-px w-8 bg-slate-100 dark:bg-slate-800" />
        </div>
      </motion.div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 1 }}
      className="absolute bottom-12 flex flex-col items-center gap-4"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="h-1.5 w-1.5 bg-[#004A99] rounded-full"
          />
        ))}
      </div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        Syncing Medical Protocol
      </span>
    </motion.div>
  </motion.div>
);

export default function App() {
  // App State
  const [viewMode, setViewMode] = useState<'auto' | 'mobile' | 'desktop'>('auto');
  const [userApiKey, setUserApiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('medstyle_api_key') || '';
  });
  
  const [pdfWorkerReady, setPdfWorkerReady] = useState(false);

  useEffect(() => {
    // Verify PDF Worker
    const checkWorker = async () => {
      try {
        const response = await fetch(pdfjs.GlobalWorkerOptions.workerSrc);
        if (response.ok) setPdfWorkerReady(true);
      } catch (e) {
        console.error("PDF Worker load failed:", e);
        setPdfWorkerReady(false);
      }
    };
    checkWorker();
  }, []);

  const effectiveKey = useMemo(() => {
    // Priority: User's manual key > Platform injected KEY > Vite build key
    const procKey = (typeof process !== 'undefined' && process.env) ? process.env.GEMINI_API_KEY : '';
    const viteKey = import.meta.env.VITE_GOOGLE_API_KEY;
    
    return userApiKey || procKey || viteKey || "";
  }, [userApiKey]);

  const ai = useMemo(() => {
    return new GoogleGenAI({ apiKey: effectiveKey || "MISSING_KEY" }); 
  }, [effectiveKey]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [currentView, setCurrentView] = useState(0); // 0: Setup, 1: Practice, 2: Finalize
  const [appMode, setAppMode] = useState<'grid' | 'generator'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // PWA State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install banner after some time or interaction if not already standalone
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setTimeout(() => setShowInstallBanner(true), 5000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // Content State
  const [selectedSubject, setSelectedSubject] = useState<any>(DEFAULT_SUBJECTS[0]);
  const [lectureContent, setLectureContent] = useState('');
  const [focusStyle, setFocusStyle] = useState('');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileTarget, setFileTarget] = useState<'lecture' | 'style'>('lecture');
  const [error, setError] = useState<string | null>(null);
  
  // Advanced Reconstruct State
  const [reconstructedText, setReconstructedText] = useState('');
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [summaryDepth, setSummaryDepth] = useState('Comprehensive');
  const [outputLanguage, setOutputLanguage] = useState('English');
  const [customInstructions, setCustomInstructions] = useState('');

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Load Subject Data
  useEffect(() => {
    if (typeof window === 'undefined' || !selectedSubject) return;
    
    const id = selectedSubject.id;
    const lecture = localStorage.getItem(`medstyle_${id}_lecture`) || '';
    const style = localStorage.getItem(`medstyle_${id}_style`) || '';
    const storedMcqs = JSON.parse(localStorage.getItem(`medstyle_${id}_mcqs`) || '[]');
    const storedRecon = localStorage.getItem(`medstyle_${id}_reconstructed`) || '';
    const storedNum = parseInt(localStorage.getItem(`medstyle_${id}_numQuestions`) || '10');
    const storedDepth = localStorage.getItem(`medstyle_${id}_summaryDepth`) || 'Comprehensive';
    const storedLang = localStorage.getItem(`medstyle_${id}_outputLanguage`) || 'English';
    const storedInst = localStorage.getItem(`medstyle_${id}_customInstructions`) || '';
    
    setLectureContent(lecture);
    setFocusStyle(style);
    setMcqs(storedMcqs);
    setReconstructedText(storedRecon);
    setNumQuestions(storedNum);
    setSummaryDepth(storedDepth);
    setOutputLanguage(storedLang);
    setCustomInstructions(storedInst);
    
    // Clear transient UI state
    setRevealedRationales({});
    setSelectedAnswers({});
    setError(null);
  }, [selectedSubject]);

  // Auto-Save Subject Data
  useEffect(() => {
    if (typeof window === 'undefined' || !selectedSubject) return;
    
    const id = selectedSubject.id;
    localStorage.setItem(`medstyle_${id}_lecture`, lectureContent);
    localStorage.setItem(`medstyle_${id}_style`, focusStyle);
    localStorage.setItem(`medstyle_${id}_mcqs`, JSON.stringify(mcqs));
    localStorage.setItem(`medstyle_${id}_reconstructed`, reconstructedText);
    localStorage.setItem(`medstyle_${id}_numQuestions`, numQuestions.toString());
    localStorage.setItem(`medstyle_${id}_summaryDepth`, summaryDepth);
    localStorage.setItem(`medstyle_${id}_outputLanguage`, outputLanguage);
    localStorage.setItem(`medstyle_${id}_customInstructions`, customInstructions);
  }, [lectureContent, focusStyle, mcqs, reconstructedText, numQuestions, summaryDepth, outputLanguage, customInstructions, selectedSubject]);

  const clearCurrentSubjectData = () => {
    if (!confirm(`Are you sure you want to clear all data for ${selectedSubject.name}?`)) return;
    
    setLectureContent('');
    setFocusStyle('');
    setMcqs([]);
    setReconstructedText('');
    setNumQuestions(10);
    setSummaryDepth('Comprehensive');
    setOutputLanguage('English');
    setCustomInstructions('');
    setRevealedRationales({});
    setSelectedAnswers({});
    
    const id = selectedSubject.id;
    localStorage.removeItem(`medstyle_${id}_lecture`);
    localStorage.removeItem(`medstyle_${id}_style`);
    localStorage.removeItem(`medstyle_${id}_mcqs`);
    localStorage.removeItem(`medstyle_${id}_reconstructed`);
    localStorage.removeItem(`medstyle_${id}_numQuestions`);
    localStorage.removeItem(`medstyle_${id}_summaryDepth`);
    localStorage.removeItem(`medstyle_${id}_outputLanguage`);
    localStorage.removeItem(`medstyle_${id}_customInstructions`);
  };

  // UI State
  const [revealedRationales, setRevealedRationales] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<any[]>(() => 
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('medstyle_history') || '[]') : []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        if (fileTarget === 'lecture') setLectureContent(prev => prev + (prev ? '\n\n' : '') + text);
        else setFocusStyle(prev => prev + (prev ? '\n\n' : '') + text);
      } else if (file.type.startsWith('image/')) {
        const text = await extractTextFromImage(file);
        if (fileTarget === 'lecture') setLectureContent(prev => prev + (prev ? '\n\n' : '') + text);
        else setFocusStyle(prev => prev + (prev ? '\n\n' : '') + text);
      } else {
        throw new Error("Unsupported file type. Please use PDF or Images.");
      }
    } catch (err: any) {
      setError("File processing failed: " + err.message);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText.trim();
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    const effectiveKey = import.meta.env.VITE_GOOGLE_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || userApiKey;
    if (!effectiveKey) {
      throw new Error("AI Key Required: Please provide your Gemini API Key in Settings to enable image text extraction.");
    }

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

    const base64Data = await base64Promise;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: "Extract all text from this medical lecture image, slide, or screenshot clearly. Maintain structure where possible. Return only the extracted text." }
        ]
      }]
    });
    return response.text;
  };

  const triggerFileUpload = (target: 'lecture' | 'style') => {
    setFileTarget(target);
    fileInputRef.current?.click();
  };

  // Theme Sync
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle MCQ Generation
  const generateMCQs = async () => {
    if (!isOnline) {
      setError("OFFLINE_MODE");
      return;
    }

    if (!effectiveKey) {
      setError("AI Engine Authorization Required: Please configure your Gemini API Key in System Settings to activate the Neuro-Academic Engine.");
      return;
    }

    if (!lectureContent.trim()) {
      setError("Please provide lecture content first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setMcqs([]);
    setRevealedRationales({});
    setSelectedAnswers({});

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: "user",
          parts: [{
            text: `Execute the "Neuro-Academic" Professor Mimicry Protocol to generate ${numQuestions} MCQs.

[CORE MISSION]
You are not a generic AI. You are a Senior Medical Board Examiner. Your task is to perform a Cognitive Audit of the professor's sample questions to reverse-engineer their "Testing Philosophy," then apply that exact philosophy to the new lecture.

[PHASE 1: THE COGNITIVE AUDIT - DECONSTRUCTING THE DOCTOR]
Analyze STYLE REFERENCE for Psychological Intent (not content). Identify:
- Complexity Level: Does the doctor prefer direct recall, 2-step reasoning, or clinical case scenarios (Vignettes)?
- The "Trap" Signature: Does the doctor focus on "Distractor Mimicry" (putting two very similar drugs/syndromes together)?
- Clinical Emphasis: Does the doctor test "What is it?" (Diagnosis) or "What do you do next?" (Management) or "Why does it happen?" (Pathophysiology)?
- Semantic Bias: Look for specific phrasing styles like "Double Negatives", "Clinical Vignettes", or "Direct Absolute Facts".
- Priority Mapping: Does the doctor ignore the "basics" and focus only on the "Exceptions" and "Contraindications"?

[PHASE 2: THE DATA ISOLATION (THE FIREWALL)]
- Fact Source: Use PRIMARY SOURCE (${lectureContent}) ONLY.
- Style Source: Use STYLE REFERENCE (${focusStyle || "Standard Board Style"}) ONLY.
- STRICT RULE: If a fact from the STYLE REFERENCE is not in the PRIMARY SOURCE, it is FORBIDDEN to use it. If you add outside info, the generation is a failure.

[PHASE 3: HIGH-FIDELITY SYNTHESIS]
Create new MCQs from PRIMARY SOURCE by asking yourself: "If I were this specific doctor, which sentence in this new lecture would I use to trip up a student?"
1. Find a high-yield medical point in the lecture.
2. Apply the "Complexity Level" and "Trap Signature" identified in Phase 1.
3. Draft the question using the exact linguistic tone, structure, and complexity found in the doctor's samples.

[PHASE 4: SURGICAL PRECISION OUTPUT]
- Language: Maintain the medical terminology level (Latin/English/Arabic) exactly as the doctor uses it.
- No Emojis. No Fluff.
            
            Return exactly ${numQuestions} MCQs in raw JSON format matching this schema:
            {
              "mcqs": [
                {
                  "id": "string",
                  "question": "string",
                  "options": ["string", "string", "string", "string"],
                  "answer": "A, B, C, or D",
                  "explanation": "string",
                  "distractor_explanations": ["explanation for option A", "explanation for option B", "explanation for option C", "explanation for option D"]
                }
              ]
            }
            Ensure the JSON is raw and valid.`
          }]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mcqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    distractor_explanations: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["id", "question", "options", "answer", "explanation", "distractor_explanations"]
                }
              }
            },
            required: ["mcqs"]
          }
        }
      });

      const data = JSON.parse(response.text);
      if (data.mcqs && data.mcqs.length > 0) {
        setMcqs(data.mcqs);
        // Save to history
        const newHistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          subject: selectedSubject.name,
          lectureSnippet: lectureContent.slice(0, 100) + "...",
          mcqs: data.mcqs
        };
        setHistory(prev => {
          const updated = [newHistoryItem, ...prev].slice(0, 20);
          localStorage.setItem('medstyle_history', JSON.stringify(updated));
          return updated;
        });
        setCurrentView(1);
      } else {
        throw new Error("The clinical engine returned an empty response. Please check your source material.");
      }
    } catch (err: any) {
      console.error("MCQ Generation error:", err);
      setError(`Consultation Failed: ${err.message || 'Key unauthorized or network latency.'}\n\nPlease verify your Gemini API key in Settings.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Revert: Professional PDF Template Re-implementation
  const downloadPDF = () => {
    if (mcqs.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    const addText = (text: string, x: number, y: number, size: number, style = "normal") => {
      doc.setFontSize(size);
      doc.setFont("helvetica", style);
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, x, y);
      return y + (lines.length * size * 0.4) + 2; 
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(26, 115, 232);
    doc.text("MedStyle AI", margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`SUBJECT: ${selectedSubject.name.toUpperCase()}`, margin, yPos);
    yPos += 5;
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);

    // Questions
    mcqs.forEach((mcq, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(`QUESTION ${index + 1}`, margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      yPos = addText(mcq.question, margin, yPos, 12, "bold");
      yPos += 3;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      mcq.options.forEach((opt, optIndex) => {
        const label = `${String.fromCharCode(65 + optIndex)}) ${opt}`;
        yPos = addText(label, margin + 5, yPos, 11);
      });

      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 115, 232);
      doc.text(`Correct Answer: ${mcq.answer}`, margin, yPos);
      yPos += 7;

      doc.setFont("helvetica", "italic");
      doc.setTextColor(71, 85, 105);
      yPos = addText(`Rationale: ${mcq.explanation}`, margin, yPos, 9);
      
      yPos += 10;
      if (index < mcqs.length - 1) {
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
      }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`MedStyle AI Assessment Engine | Page ${i} of ${totalPages}`, pageWidth / 2, 285, { align: 'center' });
    }

    doc.save(`MedStyle_Assessment_${selectedSubject.id}_${Date.now()}.pdf`);
  };

  const handleManualReconstruct = async () => {
    if (!isOnline) {
      setError("OFFLINE_MODE");
      return;
    }

    if (!effectiveKey) {
      setError("AI Engine Authorization Required: Please configure your Gemini API Key in System Settings to activate the Smart Reconstruction engine.");
      return;
    }

    if (!lectureContent.trim()) {
        setError("Please provide lecture content first.");
        return;
    }
    setIsReconstructing(true);
    setError(null);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{
                role: "user",
                parts: [{
                    text: `Analyze this medical lecture and provide a ${summaryDepth} reconstruction in ${outputLanguage}.
                    
                    LECTURE:
                    ${lectureContent}
                    
                    INSTRUCTIONS:
                    ${customInstructions || "Summarize key points and use bold for important terms."}
                    
                    Format high-yield exam targets with [EXAM_TARGET], mnemonics with [MNEMONIC], and clinical notes with [NOTE].`
                }]
            }]
        });
        setReconstructedText(response.text || '');
        setCurrentView(2);
    } catch (err: any) {
        console.error("Reconstruction error:", err);
        setError(`Reconstruction failed: ${err.message || 'Check your API Key and network.'}`);
    } finally {
        setIsReconstructing(false);
    }
  };

  return (
    <div className={`min-h-screen w-full bg-[var(--bg-secondary)] dark:bg-[var(--bg-primary)] transition-colors duration-300 ${viewMode === 'mobile' ? 'flex items-center justify-center p-2' : ''}`}>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className={`flex flex-col w-full h-full min-h-screen ${viewMode === 'mobile' ? 'max-w-[420px] shadow-2xl rounded-[24px] overflow-hidden border-4 border-slate-900/10 dark:border-white/10' : ''}`}
          >
            {/* Navigation Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--bg-primary)] dark:bg-[var(--bg-secondary)] border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 transition-transform duration-500 hover:rotate-6">
                      <MedStyleIcon size={32} className="text-[#004A99] dark:text-[#38BDF8]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#004A99] dark:text-blue-400 leading-none">Medstyle</h2>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">AI Assessor</p>
                    </div>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Selected Specialty</p>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${selectedSubject.color}`}>
                        <selectedSubject.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{selectedSubject.name}</p>
                        <p className="text-[10px] text-slate-500">Board Compliant</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setCurrentView(3); setAppMode('generator'); setIsSidebarOpen(false); }}
                    className="flex w-full items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200 font-bold text-sm transition-colors"
                  >
                    <HistoryIcon className="h-5 w-5" /> View History
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 !my-2" />

                  <button 
                    onClick={() => { setShowAbout(true); setIsSidebarOpen(false); }}
                    className="flex w-full items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-[#004A99] dark:text-[#38BDF8] font-bold text-sm transition-colors"
                  >
                    <Info className="h-5 w-5" /> About Medstyle-ai
                  </button>
                </nav>

                <div className="mt-auto space-y-3">
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm"
                  >
                    <Settings className="h-4 w-4" /> System Settings
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-[280px]' : ''} ${showAbout ? 'blur-sm pointer-events-none' : ''}`}>
          
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Menu className="h-6 w-6 dark:text-white" />
            </button>
            <div className="flex items-center gap-2">
              <MedStyleIcon size={28} className="text-[#004A99] dark:text-[#38BDF8]" />
              <span className="font-bold text-[#004A99] dark:text-blue-400">Medstyle-ai</span>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Settings className="h-5 w-5 dark:text-white" />
            </button>
          </header>

          <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
            
            {appMode === 'grid' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight dark:text-white">Clinical Intelligence</h1>
                  <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Select Medical Specialty to Begin</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {DEFAULT_SUBJECTS.map((subject) => (
                    <button 
                      key={subject.id}
                      onClick={() => { setSelectedSubject(subject); setAppMode('generator'); }}
                      className="group p-6 md:p-10 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col items-center gap-4"
                    >
                      <div className={`h-16 w-16 md:h-20 md:w-20 rounded-3xl flex items-center justify-center text-white shadow-xl ${subject.color} group-hover:scale-110 transition-transform`}>
                        <subject.icon className="h-8 w-8 md:h-10 md:w-10" />
                      </div>
                      <span className="font-bold dark:text-[#FFFFFF] text-sm md:text-base uppercase tracking-tight">{subject.name}</span>
                    </button>
                  ))}
                  <button className="p-6 md:p-10 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all">
                    <Plus className="h-10 w-10" />
                    <span className="font-bold uppercase tracking-widest text-xs">New Spec</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Stepper Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-4">
                     <button onClick={() => setAppMode('grid')} className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50">
                        <ChevronLeft className="h-5 w-5" />
                     </button>
                     <div>
                        <h2 className="text-2xl font-bold dark:text-white">{selectedSubject.name}</h2>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Board Assessment Engine</p>
                     </div>
                   </div>

                   <nav className="flex items-center justify-center gap-8 md:gap-16 w-full">
                      {[
                        { id: 0, label: '01 SETUP', icon: FileText },
                        { id: 1, label: '02 PRACTICE', icon: PlayCircle },
                        { id: 2, label: '03 FINALIZE', icon: CheckCircle },
                        { id: 3, label: '04 HISTORY', icon: HistoryIcon }
                      ].map((step) => (
                        <button 
                          key={step.id} 
                          onClick={() => setCurrentView(step.id)}
                          className={`group flex flex-col items-center gap-2 transition-all duration-300 ${currentView === step.id ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                             <step.icon className={`h-4 w-4 md:h-5 md:w-5 stroke-[1.5px] ${currentView === step.id ? 'text-blue-600' : 'text-slate-500'}`} />
                             <span className="text-[10px] md:text-xs font-black uppercase tracking-[1.2px]">{step.label}</span>
                          </div>
                          {currentView === step.id && <motion.div layoutId="nav-underline" className="h-0.5 w-full bg-blue-600 rounded-full" />}
                          {currentView !== step.id && <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-slate-300 rounded-full" />}
                        </button>
                      ))}
                   </nav>
                </div>

                {/* View Slider */}
                <div className="relative overflow-hidden w-full">
                  <motion.div 
                    animate={{ x: `-${currentView * 100}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="flex w-full cursor-default"
                  >
                    
                    {/* VIEW 1: SETUP */}
                    <div className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="polished-card p-8 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                               <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                               <h3 className="font-bold text-lg dark:text-white leading-none">Primary Source</h3>
                               <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[2px] mt-1">Foundation for Facts Only</p>
                            </div>
                          </div>
                          <textarea 
                            value={lectureContent}
                            onChange={(e) => setLectureContent(e.target.value)}
                            placeholder="Paste the ONLY foundation for facts here..."
                            className="w-full h-64 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border-none text-sm font-medium focus:ring-4 focus:ring-blue-500/10 resize-none outline-none dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                          <div className="grid grid-cols-2 gap-3">
                             <button 
                               onClick={() => triggerFileUpload('lecture')}
                               disabled={isProcessingFile}
                               className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 text-xs font-bold uppercase tracking-widest hover:bg-blue-100 disabled:opacity-50"
                             >
                                {isProcessingFile && fileTarget === 'lecture' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} 
                                Import PDF
                             </button>
                             <button 
                               onClick={() => triggerFileUpload('lecture')}
                               disabled={isProcessingFile}
                               className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 disabled:opacity-50"
                             >
                                <Camera className="h-4 w-4" /> Scan Image
                             </button>
                          </div>
                        </div>

                        <div className="polished-card p-8 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
                               <Zap className="h-6 w-6" />
                            </div>
                            <div>
                               <h3 className="font-bold text-lg dark:text-white leading-none">Testing Philosophy</h3>
                               <p className="text-[10px] font-bold text-purple-500 uppercase tracking-[2px] mt-1">Professor Logic Reference</p>
                            </div>
                          </div>
                          <textarea 
                            value={focusStyle}
                            onChange={(e) => setFocusStyle(e.target.value)}
                            placeholder="Paste the foundation for phrasing/structure (Ghost Template)..."
                            className="w-full h-64 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border-none text-sm font-medium focus:ring-4 focus:ring-blue-500/10 resize-none outline-none dark:text-white"
                          />
                          <div className="grid grid-cols-2 gap-3">
                             <button 
                               onClick={() => triggerFileUpload('style')}
                               disabled={isProcessingFile}
                               className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 text-xs font-bold uppercase tracking-widest hover:bg-blue-100 disabled:opacity-50"
                             >
                                {isProcessingFile && fileTarget === 'style' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} 
                                Import Style PDF
                             </button>
                             <button 
                               onClick={() => triggerFileUpload('style')}
                               disabled={isProcessingFile}
                               className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 disabled:opacity-50"
                             >
                                <Camera className="h-4 w-4" /> Scan Source
                             </button>
                          </div>
                        </div>
                      </div>
                      
                          <div className="mt-12 flex items-center justify-between">
                             <button 
                               onClick={clearCurrentSubjectData}
                               className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-red-100 dark:border-red-900/20 hover:bg-red-100 transition-colors"
                             >
                                <Trash2 className="h-4 w-4" /> Reset Subject Data
                             </button>
                             <button 
                               onClick={() => setCurrentView(1)}
                               className="flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl"
                             >
                               Continue to Practice <ChevronRight className="h-4 w-4" />
                             </button>
                          </div>
                    </div>

                    {/* VIEW 2: PRACTICE (MCQ Engine) */}
                    <div className="w-full flex-shrink-0">
                      <div className="space-y-8">
                        <div className="polished-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                               <RefreshCw className={`h-7 w-7 ${isGenerating ? 'animate-spin' : ''}`} />
                            </div>
                            <div>
                               <h3 className="text-xl font-bold dark:text-white uppercase tracking-tight">Neuro-Academic Engine</h3>
                               <div className="flex items-center gap-2">
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Board Examiner Active</p>
                                 <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/40 text-[8px] text-rose-600 font-black rounded-full border border-rose-100 dark:border-rose-800 uppercase tracking-tighter animate-pulse">
                                    <Zap className="h-2 w-2" /> Protocol v3.0
                                 </span>
                               </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 w-full md:w-auto">
                             <div className="flex-1 md:w-48 text-center space-y-1">
                                <span className="text-2xl font-black text-blue-600">{numQuestions}</span>
                                <input 
                                  type="range" min="1" max="200" 
                                  value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                  className="smartphone-slider"
                                  style={{ '--range-percent': `${((numQuestions - 1) / (200 - 1)) * 100}%` } as React.CSSProperties}
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Qs</p>
                             </div>
                             <button 
                               onClick={generateMCQs}
                               disabled={isGenerating || !lectureContent}
                               className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center gap-2"
                             >
                               {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Engine"}
                             </button>
                          </div>
                        </div>

                        {/* Restored Error Display in View 2 */}
                        <AnimatePresence>
                          {error && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className={`p-6 ${error === "OFFLINE_MODE" ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'} border rounded-3xl flex items-start gap-4 mb-6`}>
                                <div className={`h-10 w-10 ${error === "OFFLINE_MODE" ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'} rounded-xl flex items-center justify-center shrink-0`}>
                                  {error === "OFFLINE_MODE" ? <AlertTriangle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className={`text-sm font-bold ${error === "OFFLINE_MODE" ? 'text-amber-900 dark:text-amber-400' : 'text-red-900 dark:text-red-400'} uppercase tracking-widest`}>
                                      {error === "OFFLINE_MODE" ? "Offline Mode" : "Engine Fault"}
                                    </h4>
                                    <button onClick={() => setError(null)} className={`p-1 ${error === "OFFLINE_MODE" ? 'hover:bg-amber-100' : 'hover:bg-red-100'} rounded-lg`}>
                                      <X className="h-4 w-4 text-slate-400" />
                                    </button>
                                  </div>
                                  <p className={`text-xs ${error === "OFFLINE_MODE" ? 'text-amber-700 dark:text-amber-300/80' : 'text-red-700 dark:text-red-300/80'} mb-4`}>
                                    {error === "OFFLINE_MODE" 
                                      ? "AI generation requires an active internet connection. Your Clinical History and content remain accessible offline." 
                                      : error}
                                  </p>
                                  {error !== "OFFLINE_MODE" && (
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={generateMCQs}
                                        className="px-4 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95"
                                      >
                                        Retry Generation
                                      </button>
                                      {error.includes("API Key") && (
                                        <button 
                                          onClick={() => {
                                            setError(null);
                                            setShowSettings(true);
                                          }}
                                          className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all active:scale-95"
                                        >
                                          <Settings className="h-3 w-3" /> Fix in Settings
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Install Banner */}
                        <AnimatePresence>
                          {showInstallBanner && deferredPrompt && (
                            <motion.div 
                              initial={{ opacity: 0, y: -50 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -50 }}
                              className="mb-8"
                            >
                              <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 pl-2">
                                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Download className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">Mobile Access</p>
                                    <p className="text-xs font-bold text-white">Install Medstyle-ai App</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setShowInstallBanner(false)}
                                    className="px-4 py-2 text-white/70 text-[10px] font-bold uppercase tracking-widest"
                                  >
                                    Later
                                  </button>
                                  <button 
                                    onClick={handleInstallClick}
                                    className="px-6 py-2 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl"
                                  >
                                    Install Now
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* MCQ List */}
                        {mcqs.length > 0 && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                               <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight">Active Assessment</h3>
                               <button 
                                 onClick={() => {
                                   const text = mcqs.map((q, i) => `${i+1}. ${q.question}\n${q.options.map((o, j) => `   ${String.fromCharCode(65+j)}) ${o}`).join('\n')}\nCorrect: ${q.answer}\n`).join('\n---\n');
                                   navigator.clipboard.writeText(text);
                                 }}
                                 className="flex items-center gap-2 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                               >
                                  <Copy className="h-3 w-3" /> Copy Text
                               </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                               {mcqs.map((mcq, idx) => (
                                 <div key={mcq.id || idx} className="polished-card p-6 md:p-8 relative">
                                    <span className="absolute top-4 right-6 text-2xl font-black text-slate-100 dark:text-slate-800/40 italic">{idx + 1}</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg mb-6 leading-relaxed pr-12">{mcq.question}</h4>
                                    
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                      {mcq.options.map((option, optIdx) => {
                                        const letter = String.fromCharCode(65 + optIdx);
                                        const isSelected = selectedAnswers[mcq.id || idx] === optIdx;
                                        const isCorrect = mcq.answer === letter || mcq.answer.includes(letter);
                                        const showFeedback = selectedAnswers[mcq.id || idx] !== undefined;

                                        let buttonClass = 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800 dark:text-slate-300 hover:border-slate-200';
                                        let badgeClass = 'border-slate-200 dark:border-slate-700';

                                        if (showFeedback) {
                                          if (isCorrect) {
                                            buttonClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200';
                                            badgeClass = 'bg-emerald-600 border-emerald-600 text-white';
                                          } else if (isSelected) {
                                            buttonClass = 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-200';
                                            badgeClass = 'bg-red-600 border-red-600 text-white';
                                          }
                                        } else if (isSelected) {
                                          buttonClass = 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200';
                                          badgeClass = 'bg-blue-600 border-blue-600 text-white';
                                        }

                                        return (
                                          <button 
                                            key={optIdx}
                                            disabled={showFeedback}
                                            onClick={() => setSelectedAnswers(prev => ({...prev, [mcq.id || idx]: optIdx}))}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left text-sm font-medium ${buttonClass}`}
                                          >
                                            <div className={`h-6 w-6 rounded-lg flex items-center justify-center border font-black text-xs shrink-0 ${badgeClass}`}>
                                              {letter}
                                            </div>
                                            <div className="flex flex-col">
                                              <span>{option}</span>
                                              {showFeedback && (isSelected || isCorrect) && mcq.distractor_explanations?.[optIdx] && (
                                                <span className={`mt-2 text-[10px] font-bold leading-tight ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                                  {isCorrect ? 'Correct. ' : 'Incorrect. '}
                                                  {mcq.distractor_explanations[optIdx]}
                                                </span>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    <button 
                                      onClick={() => setRevealedRationales(prev => ({...prev, [mcq.id || idx]: !prev[mcq.id || idx]}))}
                                      className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-75 transition-opacity"
                                    >
                                      {revealedRationales[mcq.id || idx] ? "Hide Logic" : "Reveal Rationale"}
                                    </button>

                                    <AnimatePresence>
                                      {revealedRationales[mcq.id || idx] && (
                                        <motion.div 
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="mt-4 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                                            <p className="text-sm dark:text-slate-300 leading-relaxed font-medium mb-3">{mcq.explanation}</p>
                                            <div className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                                              Correct Value: <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">{mcq.answer}</span>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                 </div>
                               ))}
                            </div>

                            {/* REVERT: Restored PDF Download Button Placement at bottom of View 2 */}
                            <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                               <button 
                                 onClick={downloadPDF}
                                 className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[20px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
                               >
                                  <Download className="h-5 w-5" /> Download Questions PDF
                               </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-12 flex justify-end">
                         <button 
                           onClick={() => setCurrentView(2)}
                           className="flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl"
                         >
                           Finalize Assessment <ChevronRight className="h-4 w-4" />
                         </button>
                      </div>
                    </div>

                    {/* VIEW 3: FINALIZE (Reconstruction Engine) */}
                    <div className="w-full flex-shrink-0">
                      <div className="space-y-8">
                        <div className="polished-card p-8 space-y-8">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="h-14 w-14 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
                                    <HistoryIcon className={`h-7 w-7 ${isReconstructing ? 'animate-spin' : ''}`} />
                                 </div>
                                 <div>
                                    <h3 className="text-xl font-bold dark:text-white">Smart Reconstruction</h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Advanced Extraction</p>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Detail Level</label>
                                 <div className="flex gap-2">
                                    {['Compact', 'Comprehensive', 'Detailed'].map((depth) => (
                                      <button 
                                        key={depth}
                                        onClick={() => setSummaryDepth(depth)}
                                        className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${summaryDepth === depth ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-300'}`}
                                      >
                                        {depth}
                                      </button>
                                    ))}
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Output Audio</label>
                                 <div className="flex gap-2">
                                    {['English', 'Spanish', 'Arabic'].map((lang) => (
                                      <button 
                                        key={lang}
                                        onClick={() => setOutputLanguage(lang)}
                                        className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${outputLanguage === lang ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-300'}`}
                                      >
                                        {lang}
                                      </button>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                               <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] ml-1">Reconstruction Logic</label>
                               <textarea 
                                  value={customInstructions}
                                  onChange={(e) => setCustomInstructions(e.target.value)}
                                  placeholder="E.g. Identify all pathophysiology mechanisms and create specific mnemonics..."
                                  className="w-full h-32 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border-none text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 resize-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                               />
                           </div>

                           <button 
                             onClick={handleManualReconstruct}
                             disabled={isReconstructing || !lectureContent}
                             className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] font-bold text-sm uppercase tracking-widest shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
                           >
                             {isReconstructing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ArrowUpRight className="h-5 w-5" /> Execute Reconstruction</>}
                           </button>
                        </div>

                        {reconstructedText && (
                          <div className="polished-card p-10 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 animate-in fade-in zoom-in-95 duration-500">
                             <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Clinical Reconstruction</h2>
                                <button className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400 hover:text-blue-600 transition-colors">
                                   <Download className="h-5 w-5" />
                                </button>
                             </div>
                             
                             <div className="prose prose-slate dark:prose-invert max-w-none prose-p:text-sm prose-p:leading-relaxed prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-black">
                                <ReactMarkdown
                                  components={{
                                    p: ({children}) => {
                                      const text = String(children);
                                      if (text.includes('[EXAM_TARGET]')) {
                                        return (
                                          <div className="my-6 p-6 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-2xl">
                                             <span className="inline-block bg-red-500 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded mb-2 uppercase">Exam Focus</span>
                                             <p className="m-0 font-medium text-slate-800 dark:text-slate-200">{text.replace(/\[\/?EXAM_TARGET\]/g, '')}</p>
                                          </div>
                                        );
                                      }
                                      if (text.includes('[MNEMONIC]')) {
                                        return (
                                          <div className="my-6 p-6 bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-500 rounded-r-2xl">
                                             <span className="inline-block bg-purple-500 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded mb-2 uppercase">Memory Key</span>
                                             <p className="m-0 font-medium italic text-slate-800 dark:text-slate-200">{text.replace(/\[\/?MNEMONIC\]/g, '')}</p>
                                          </div>
                                        );
                                      }
                                      if (text.includes('[NOTE]')) {
                                        return (
                                          <div className="my-6 p-6 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-2xl">
                                             <span className="inline-block bg-blue-500 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded mb-2 uppercase">Clinical Note</span>
                                             <p className="m-0 font-medium text-slate-800 dark:text-slate-200">{text.replace(/\[\/?NOTE\]/g, '')}</p>
                                          </div>
                                        );
                                      }
                                      return <p className="mb-4">{children}</p>
                                    }
                                  }}
                                >
                                  {reconstructedText}
                                </ReactMarkdown>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>

            <div className="w-full flex-shrink-0 px-1">
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                          <div>
                            <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Clinical History</h2>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                              {showAllHistory ? "Showing All Subjects" : `History for ${selectedSubject.name}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setShowAllHistory(!showAllHistory)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                showAllHistory 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {showAllHistory ? "Filter by Subject" : "Show All Subjects"}
                            </button>
                            {history.length > 0 && (
                              <button 
                                onClick={() => {
                                  if (showAllHistory) {
                                    if(confirm("Are you sure you want to PERMANENTLY purge your ENTIRE clinical history across all subjects?")) {
                                      setHistory([]);
                                      localStorage.setItem('medstyle_history', '[]');
                                    }
                                  } else {
                                    if(confirm(`Purge history for ${selectedSubject.name} only?`)) {
                                      const updatedHistory = history.filter(h => h.subject !== selectedSubject.name);
                                      setHistory(updatedHistory);
                                      localStorage.setItem('medstyle_history', JSON.stringify(updatedHistory));
                                    }
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/20 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" /> {showAllHistory ? "Purge Global History" : "Clear Subject"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {(() => {
                            const filteredHistory = showAllHistory 
                              ? history 
                              : history.filter(h => h.subject === selectedSubject.name);

                            if (filteredHistory.length === 0) {
                              return (
                                <div className="polished-card p-20 flex flex-col items-center justify-center text-center">
                                  <HistoryIcon className="h-16 w-16 mb-4 text-slate-200" />
                                  <h3 className="text-sm font-black dark:text-white uppercase tracking-widest mb-2">
                                    {showAllHistory ? "No Assessment Records Found" : "Subject History Empty"}
                                  </h3>
                                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                                    {showAllHistory 
                                      ? "Switch to Setup to generate your first assessment." 
                                      : `No previous assessments found for ${selectedSubject.name}. Start a new session to build your history.`}
                                  </p>
                                </div>
                              );
                            }

                            return filteredHistory.map((record) => (
                              <motion.div 
                                key={record.id}
                                whileHover={{ x: 5 }}
                                className="polished-card p-6 flex flex-col md:flex-row items-center gap-6 group cursor-pointer hover:border-blue-500/30 transition-all"
                                onClick={() => {
                                  const matchingSubject = DEFAULT_SUBJECTS.find(s => s.name === record.subject);
                                  if (matchingSubject) setSelectedSubject(matchingSubject);
                                  setMcqs(record.mcqs);
                                  setCurrentView(1); // Jump to Practice
                                }}
                              >
                                <div className="flex-shrink-0 text-center md:text-left min-w-[100px]">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(record.timestamp).toLocaleDateString()}</p>
                                   <p className="text-2xl font-black text-blue-600 leading-none">{record.mcqs.length} <span className="text-[10px] uppercase opacity-50">Qs</span></p>
                                </div>
                                <div className="flex-1 min-w-0">
                                   <h4 className="text-sm font-black dark:text-white uppercase tracking-tight truncate">{record.subject}</h4>
                                   <p className="text-xs text-slate-500 line-clamp-1 italic opacity-70 mt-1">"{record.lectureSnippet}"</p>
                                </div>
                                <div className="flex items-center gap-3">
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       const updatedHistory = history.filter(h => h.id !== record.id);
                                       setHistory(updatedHistory);
                                       localStorage.setItem('medstyle_history', JSON.stringify(updatedHistory));
                                     }}
                                     className="p-3 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                   >
                                      <Trash2 className="h-4 w-4" />
                                   </button>
                                   <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                      <PlayCircle className="h-5 w-5" />
                                   </div>
                                </div>
                              </motion.div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            <footer className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
                MedStyle AI Assessment Framework • Systems Online
              </p>
            </footer>
          </div>
        </main>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="application/pdf,image/*" 
          className="hidden" 
        />

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 p-10 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                          <Settings className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold dark:text-white">Preferences</h2>
                    </div>
                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="h-5 w-5 dark:text-white" />
                    </button>
                </div>

                <div className="space-y-8 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interface Theme</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setTheme('light')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-blue-600 bg-blue-50/50 text-blue-900' : 'border-slate-50 dark:border-slate-800 text-slate-400'}`}
                          >
                              <Sun className="h-5 w-5" /> Light Mode
                          </button>
                          <button 
                            onClick={() => setTheme('dark')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-blue-600 bg-blue-900/20 text-white' : 'border-slate-50 dark:border-slate-800 text-slate-400'}`}
                          >
                              <Moon className="h-5 w-5" /> Night Shift
                          </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Viewport Architecture</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['auto', 'mobile', 'desktop'].map((mode: any) => (
                            <button 
                              key={mode} 
                              onClick={() => setViewMode(mode)}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all capitalize text-[10px] font-bold ${viewMode === mode ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-slate-50 dark:border-slate-800 text-slate-400'}`}
                            >
                                {mode === 'auto' ? <RefreshCw className="h-5 w-5" /> : mode === 'mobile' ? <ArrowUpRight className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                                {mode}
                            </button>
                          ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block ml-1">Gemini Engine Key</label>
                        <div className="relative">
                          <input 
                            type="password"
                            value={userApiKey}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUserApiKey(val);
                              localStorage.setItem('medstyle_api_key', val);
                            }}
                            placeholder="Enter API Key (AIGza...)"
                            className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 rounded-[18px] outline-none text-sm dark:text-white transition-all pr-12 ${
                              effectiveKey ? 'border-emerald-500/30' : 'border-red-500/30'
                            }`}
                          />
                          <div className={`absolute right-5 top-1/2 -translate-y-1/2 ${effectiveKey ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {effectiveKey ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          </div>
                        </div>
                        <div className="px-1 space-y-1">
                          <p className="text-[9px] text-slate-400 font-medium leading-normal italic">Key is stored locally on this device only. Required for Neuro-Academic Engine activation.</p>
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-500 font-bold hover:underline flex items-center gap-1">
                            Get your free API key at Google AI Studio <ArrowUpRight className="h-2 w-2" />
                          </a>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Diagnostics</label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">AI Engine Status</span>
                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full ${effectiveKey ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${effectiveKey ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {effectiveKey ? "Authenticated" : "Unauthorized"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">PDF Worker Interface</span>
                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full ${pdfWorkerReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${pdfWorkerReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {pdfWorkerReady ? "Operational" : "Link Failure"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Protocol Version</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">v3.0.0-PRO</span>
                            </div>
                        </div>
                        {!effectiveKey && (
                          <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20 flex gap-3">
                             <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                             <p className="text-[9px] text-rose-700 dark:text-rose-400 font-medium leading-relaxed">
                               The engine is currently offline. Standalone browsers (Chrome) require an active API Key. Please provide one above.
                             </p>
                          </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] dark:bg-[var(--bg-primary)] rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          {theme === 'light' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-blue-400" />}
                          <span className="text-[10px] font-bold dark:text-white tracking-widest uppercase">System Theme</span>
                        </div>
                        <button 
                          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                          className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-[10px] font-bold uppercase tracking-widest dark:text-white border border-slate-100 dark:border-slate-800"
                        >
                          Switch to {theme === 'light' ? 'Dark' : 'Light'}
                        </button>
                      </div>

                      <button 
                        onClick={clearCurrentSubjectData}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" /> Clear Current Subject Data
                      </button>
                    </div>
                </div>

                <div className="mt-10">
                    <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-blue-600 text-white rounded-[18px] font-bold text-sm uppercase tracking-widest shadow-xl">Apply Changes</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* About Modal */}
        <AnimatePresence>
          {showAbout && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAbout(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
              >
                <div className="absolute top-6 right-6 z-10">
                  <button 
                    onClick={() => setShowAbout(false)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-8 pt-12 flex flex-col items-center text-center">
                  <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 mb-6 transition-transform duration-500 hover:rotate-6">
                    <MedStyleIcon size={64} className="text-[#004A99] dark:text-[#38BDF8]" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-[#004A99] dark:text-[#38BDF8] tracking-tight mb-1">Medstyle<span className="text-slate-900 dark:text-white">-ai</span></h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Senior Edition • v1.0.0</p>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-[280px] mb-8">
                    An intelligent AI assistant for medical students, specialized in Pathology, Physiology, and more.
                  </p>

                  <div className="w-full space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Lead Developer</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">Mujeeb</p>
                    </div>

                    <a 
                      href="mailto:Mujeebaliaodh@gmail.com"
                      className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Contact Email</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">Mujeebaliaodh@gmail.com</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-blue-300 group-hover:text-blue-600 transition-colors" />
                    </a>
                  </div>

                  <button 
                    onClick={() => window.location.href = 'mailto:Mujeebaliaodh@gmail.com'}
                    className="w-full mt-6 py-4 bg-[#004A99] dark:bg-blue-600 text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Contact Support
                  </button>

                  <div className="mt-8 flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Made with</span>
                    <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">for Medical Students</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    )}
  </AnimatePresence>
</div>
);
}
