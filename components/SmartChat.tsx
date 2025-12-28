
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { chatWithDocumentStream, extractDocumentText } from '../services/gemini';
import { ChatMessage, FileData } from '../types';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';
import mammoth from 'mammoth';

const SmartChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<FileData | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (force = false) => {
    if (scrollAreaRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = scrollAreaRef.current;
      const isAtBottom = scrollHeight - clientHeight <= scrollTop + 100;
      if (force || isAtBottom) {
        scrollAreaRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, loading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setAnalyzing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        let extractedText = "";
        try {
          if (uploadedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const arrayBuffer = await uploadedFile.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
          } else if (uploadedFile.type === "text/plain") {
            extractedText = atob(base64);
          }
          const summary = await extractDocumentText(base64, uploadedFile.type, extractedText || undefined);
          setFile({
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            content: base64,
            textContent: extractedText || summary
          });
          setMessages([{
            id: 'welcome',
            role: 'model',
            text: `✨ "${uploadedFile.name}" tizimga muvaffaqiyatli yuklandi.\n\nUshbu hujjat bo'yicha savollaringizni kutaman.`,
            timestamp: new Date()
          }]);
        } catch (error) {
          console.error("Analysis error:", error);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleSendText = async (presetText?: string) => {
    const messageToSend = presetText || input;
    if (!messageToSend.trim() || !file) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: messageToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!presetText) setInput('');
    setLoading(true);
    setStreamingText('');
    try {
      const isWordOrTxt = file.type.includes('word') || file.type.includes('text');
      const response = await chatWithDocumentStream(
        file.content, file.type, messageToSend, isWordOrTxt ? file.textContent : undefined,
        (chunk) => setStreamingText(chunk)
      );
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: response || "Xatolik yuz berdi.", timestamp: new Date() }]);
      setStreamingText('');
    } catch (error) {
      setMessages(prev => [...prev, { id: 'error', role: 'model', text: "Texnik xatolik yuz berdi.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
      scrollToBottom(true);
    }
  };

  const toggleLive = async () => isLive ? stopLiveSession() : await startLiveSession();

  const stopLiveSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsLive(false);
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startLiveSession = async () => {
    if (!file) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onerror: () => setIsLive(false),
          onclose: () => setIsLive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `Siz professional AI-siz. Matn:\n${file.textContent}`,
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsLive(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] md:h-[82vh] bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative isolate transition-colors duration-500">
      
      {/* Header */}
      <header className="flex-shrink-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-50 dark:border-slate-800 px-6 py-4 md:px-10 md:py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl transition-all duration-500 ${isLive ? 'bg-rose-500 text-white' : 'bg-slate-900 dark:bg-indigo-600 text-white'}`}>
            {isLive ? '🎙️' : '🤖'}
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg md:text-xl tracking-tight leading-none">Smart Chat</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {file ? file.name : 'Waiting for file'}
            </p>
          </div>
        </div>
        {file && (
           <button onClick={() => { setFile(null); setMessages([]); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
           </button>
        )}
      </header>

      {/* Messages */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 space-y-8 bg-[#FAFAFA]/50 dark:bg-slate-950/20 custom-scrollbar"
      >
        {!file && !analyzing ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
             <div className="w-32 h-32 md:w-44 md:h-44 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl flex items-center justify-center text-6xl md:text-8xl mb-8 animate-bounce-slow">📄</div>
             <h4 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Hujjat yuklang</h4>
             <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 font-medium">PDF yoki Word yuklang va tahlilni boshlang.</p>
             <label className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 transition-all cursor-pointer">
                HUJJAT TANLASH
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" />
             </label>
          </div>
        ) : analyzing ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Tizim o'qimoqda...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full pb-24">
            {messages.length < 2 && (
              <div className="flex flex-wrap gap-2 justify-center mb-12">
                {['Hujjat mazmuni 📑', 'Muhim nuqtalar 🎯', 'Xulosa ber 💎'].map(t => (
                  <button key={t} onClick={() => handleSendText(t)} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-600 dark:hover:border-indigo-400 transition-all">
                    {t}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] md:max-w-[75%] rounded-[28px] p-5 md:p-7 shadow-sm transition-all ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'
                }`}>
                  <p className="text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {streamingText && (
              <div className="flex justify-start mb-8">
                <div className="max-w-[90%] md:max-w-[75%] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-[28px] rounded-bl-none border border-slate-100 dark:border-slate-700 p-5 md:p-7 shadow-sm">
                  <p className="text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap">{streamingText}</p>
                  <span className="inline-block w-1.5 h-5 bg-indigo-600 ml-1 animate-pulse align-middle"></span>
                </div>
              </div>
            )}

            {loading && !streamingText && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-full flex gap-2 border border-slate-50 dark:border-slate-700 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      {file && !analyzing && (
        <div className="flex-shrink-0 p-4 md:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-50 dark:border-slate-800">
          <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-5">
            <button
              onClick={toggleLive}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all ${
                isLive ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-2xl">{isLive ? '⏹️' : '🎙️'}</span>
            </button>
            
            <div className="flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                disabled={loading || isLive}
                placeholder={isLive ? "Listening..." : "Write message..."}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:bg-white dark:focus:bg-slate-700 transition-all font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={() => handleSendText()}
              disabled={loading || !input.trim() || isLive}
              className="bg-indigo-600 text-white w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 transition-all active:scale-90"
            >
              <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EEF2F6; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
        @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default SmartChat;
