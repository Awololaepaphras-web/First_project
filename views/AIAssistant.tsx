
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Trash2, Paperclip, FileText, X, Wand2, Loader2 } from 'lucide-react';
import { getAIResponse, FileData } from '../src/services/geminiService';
import { AIMessage } from '../types';

const AIAssistant: React.FC = () => {
  /**
   * Changed state type to AIMessage to resolve Role property access errors.
   */
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'model', text: "Hello! I'm Proph AI. Upload your study handouts, notes, or past questions, and I can explain them or generate potential exam questions for you! What are we studying today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedFile({
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (customPrompt?: string) => {
    const prompt = customPrompt || input;
    if ((!prompt.trim() && !selectedFile) || isLoading) return;

    const userMessageText = selectedFile 
      ? `${prompt} [Attached File: ${fileName}]` 
      : prompt;

    /**
     * Fixed role assignment error by using AIMessage type.
     */
    const userMessage: AIMessage = { role: 'user', text: userMessageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responseText = await getAIResponse(messages, prompt || "Analyze this document.", selectedFile || undefined);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
    removeFile();
  };

  const generateExamQuestions = () => {
    if (!selectedFile) {
      alert("Please upload a document first so I can generate questions from it!");
      return;
    }
    handleSend("Based on this document, generate a set of potential exam questions. Include 5 Multiple Choice Questions (with answers at the end), 3 Short Answer questions, and 1 Essay question tailored for a Nigerian University exam.");
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: "Chat cleared. Upload a new document or ask me a question to continue." }]);
    removeFile();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="bg-white rounded-3xl shadow-2xl flex-grow overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-none">Proph AI Buddy</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ready for Analysis</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={generateExamQuestions}
              disabled={!selectedFile || isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedFile 
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Exam Questions</span>
            </button>
            <button onClick={clearChat} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Clear Chat">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-white">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-5 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-blue-50 text-blue-900 rounded-tr-none border border-blue-100' 
                  : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center">
                <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-gray-50 p-5 rounded-3xl rounded-tl-none border border-gray-100 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                  <span className="text-sm text-gray-500 font-medium">Analyzing document and thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50">
          {selectedFile && (
            <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-green-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{fileName}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Ready to analyze</p>
                </div>
              </div>
              <button onClick={removeFile} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-grow relative">
              <textarea
                rows={1}
                placeholder={selectedFile ? "Ask something about this file..." : "Type a question or upload a document..."}
                className="w-full pl-6 pr-14 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                title="Upload Document"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png,.txt"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && !selectedFile)}
              className="bg-green-600 text-white p-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Gemini 3 Flash • Multimodal Intelligence
            </p>
            <p className="text-[10px] text-gray-500 italic">
              Proph AI can read PDF, images of notes, and text files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
