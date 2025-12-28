
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';

const VoiceAI: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [modelResponse, setModelResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const toggleRecording = async () => {
    if (isRecording) {
      stopSession();
    } else {
      await startSession();
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsRecording(false);
  };

  const startSession = async () => {
    try {
      // Fix: Use process.env.API_KEY directly for initialization as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsRecording(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setModelResponse(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription('');
              setModelResponse('');
            }

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

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            setError("Xatolik yuz berdi. Iltimos, qaytadan urunib ko'ring.");
            setIsRecording(false);
          },
          onclose: () => setIsRecording(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'Siz PDF.uz AI-siz. Ovozli yordamchi kabi ishlang. Abdujabborov Doniyorbek tomonidan yaratilgansiz.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800">Ovozli Muloqot</h2>
        <p className="text-slate-500 max-w-md">PDF.uz AI bilan xuddi inson kabi gaplashing. Savollar bering yoki tushuntirish so'rang.</p>
      </div>

      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping scale-150"></div>
        )}
        <button
          onClick={toggleRecording}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center text-5xl transition-all shadow-xl ${
            isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-slate-400 border border-slate-100'
          }`}
        >
          {isRecording ? '🛑' : '🎙️'}
        </button>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {transcription && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 mb-1">SIZ:</p>
            <p className="text-slate-700">{transcription}</p>
          </div>
        )}
        {modelResponse && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 mb-1">PDF.uz AI:</p>
            <p className="text-slate-800 leading-relaxed italic">"{modelResponse}"</p>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-rose-600 text-sm text-center">
            {error}
          </div>
        )}
        {!isRecording && !modelResponse && !error && (
          <p className="text-center text-slate-400 text-sm">Gapirish uchun mikrofonga bosing</p>
        )}
      </div>
    </div>
  );
};

export default VoiceAI;
