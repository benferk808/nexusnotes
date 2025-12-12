import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, X } from 'lucide-react';
import { Note, Category } from '../types';

interface QuickRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  activeCategory: Category;
}

export const QuickRecorder: React.FC<QuickRecorderProps> = ({ isOpen, onClose, onSave, activeCategory }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
        startRecording();
    } else {
        stopAll();
    }
    return () => stopAll();
  }, [isOpen]);

  const stopAll = () => {
     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
     }
     if (timerRef.current) clearInterval(timerRef.current);
     setIsRecording(false);
     setElapsedTime(0);
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Timer
        setElapsedTime(0);
        timerRef.current = window.setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        // Audio Recording
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Audio = reader.result as string;
                saveAudioNote(base64Audio);
            };
            reader.readAsDataURL(blob);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (e) {
        console.error("Mic error", e);
        alert("No se pudo acceder al micrófono.");
        onClose();
    }
  };

  const saveAudioNote = (audioBase64: string) => {
      // Create the note immediately with just the audio
      const dateStr = new Date().toLocaleString();
      const newNote: Note = {
          id: crypto.randomUUID(),
          category: activeCategory,
          subcategory: 'Nota de Voz',
          title: `Audio ${dateStr}`,
          content: '', // Empty content, user can transcribe later
          items: [],
          attachments: [{
              id: crypto.randomUUID(),
              type: 'audio',
              data: audioBase64,
              mimeType: 'audio/webm',
              createdAt: new Date().toISOString()
          }],
          isPinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
      onSave(newNote);
      onClose();
  };

  const handleStop = () => {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
        <h2 className="text-white text-3xl font-bold mb-12 animate-pulse tabular-nums">
            {new Date(elapsedTime * 1000).toISOString().substr(14, 5)}
        </h2>

        {/* Big Stop Button */}
        <button 
            onClick={handleStop}
            className="w-40 h-40 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.6)] active:scale-95 transition-transform"
        >
            <Square size={64} fill="currentColor" className="text-white" />
        </button>
        
        <p className="text-gray-400 mt-12 text-center text-xl">
            Grabando Audio...
        </p>

        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-4 text-gray-400 hover:text-white"
        >
            <X size={32} />
        </button>
    </div>
  );
};
