'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Mic, Volume2, Globe, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [language, setLanguage] = useState<string>('English');
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload from file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger browser speech-to-text for voice query
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'Hindi' ? 'hi-IN' : language === 'Telugu' ? 'te-IN' : language === 'Tamil' ? 'ta-IN' : 'en-US';
    recognition.onresult = (event: any) => {
      setQuery(event.results[0][0].transcript);
    };
    recognition.start();
  };

  // Trigger browser text-to-speech for read-aloud
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'Hindi' ? 'hi-IN' : language === 'Telugu' ? 'te-IN' : language === 'Tamil' ? 'ta-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported.');
    }
  };

  // Call the backend API
  const handleSubmit = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);

    try {
      const base64Data = selectedImage.split(',')[1];
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          prompt: query,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      // Clean up markdown block formatting if present in JSON response
      let cleanText = data.result.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanText);
      setAnalysisResult(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              🧭 GuideEase
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Point at any queue, noticeboard, or form to get clear actions in your language.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
            <Globe className="w-4 h-4 text-slate-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">1. Capture Notice or Queue Display</h2>
          
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedImage ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-64 bg-black flex justify-center">
              <img src={selectedImage} alt="Uploaded preview" className="object-contain max-h-64" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-lg backdrop-blur-sm"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50/50"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Click to upload photo or take picture</p>
              <p className="text-xs text-slate-400 mt-1">Supports hospital boards, token screens, forms</p>
            </div>
          )}

          {/* Optional Voice/Text Query */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">2. What do you need help with? (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., I need to see a skin doctor, where do I go?"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              <button
                onClick={handleVoiceInput}
                title="Speak query"
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded-xl transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedImage || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
          >
            {loading ? 'Analyzing Situation...' : 'Explain What To Do Next'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Results Action Card */}
        {analysisResult && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Situation Breakdown & Next Steps</h3>
              <button
                onClick={() => speakText(`${analysisResult.situationSummary}. Required documents: ${analysisResult.requiredDocuments.join(', ')}. Next steps: ${analysisResult.nextSteps.join('. ')}`)}
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Volume2 className="w-4 h-4" /> Listen
              </button>
            </div>

            {/* Situation Summary */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">What is happening</span>
              <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm leading-relaxed">
                {analysisResult.situationSummary}
              </p>
            </div>

            {/* Required Documents */}
            {analysisResult.requiredDocuments?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Documents / Items</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysisResult.requiredDocuments.map((doc: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 bg-amber-50/60 border border-amber-100/60 p-2.5 rounded-xl text-sm text-amber-900">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Action Journey</span>
              <div className="space-y-2">
                {analysisResult.nextSteps.map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 bg-blue-50/50 border border-blue-100/50 p-3.5 rounded-xl text-sm text-blue-900">
                    <div className="bg-blue-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Disclaimer: Verify critical instructions and counter numbers with staff on-site.</span>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}