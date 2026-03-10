'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { 
  Brain, 
  PenTool, 
  Search, 
  Star, 
  Plus, 
  Trash2, 
  Copy, 
  Check,
  Loader2,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  FileText,
  History,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ContentType = 'note' | 'blog' | 'review' | 'search';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: { uri: string; title: string }[];
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  type: ContentType;
  timestamp: number;
}

export default function Dashboard() {
  const [activeType, setActiveType] = useState<ContentType>('search');
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [chatTitleEditValue, setChatTitleEditValue] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    const saved = localStorage.getItem('omninote_chats');
    if (saved) {
      setChats(JSON.parse(saved));
    }
  }, []);

  const saveChats = (newChats: Chat[]) => {
    localStorage.setItem('omninote_chats', JSON.stringify(newChats));
    setChats(newChats);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages, isGenerating]);

  const createNewChat = (type: ContentType = 'search') => {
    const newChat: Chat = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Chat',
      messages: [],
      type,
      timestamp: Date.now(),
    };
    saveChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setActiveType(type);
  };

  const handleSend = async (overrideInput?: string, isEdit: boolean = false) => {
    const messageText = overrideInput || input;
    if (!messageText.trim()) return;

    let currentChatId = activeChatId;
    let currentChats = [...chats];

    if (!currentChatId) {
      const newChat: Chat = {
        id: Math.random().toString(36).substr(2, 9),
        title: messageText.substring(0, 30),
        messages: [],
        type: activeType,
        timestamp: Date.now(),
      };
      currentChats = [newChat, ...currentChats];
      currentChatId = newChat.id;
      setActiveChatId(currentChatId);
    }

    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    const updatedChats = currentChats.map(c => {
      if (c.id === currentChatId) {
        const newMessages = isEdit 
          ? c.messages.slice(0, c.messages.findIndex(m => m.id === editingMessageId)).concat(userMsg)
          : [...c.messages, userMsg];
        
        return { 
          ...c, 
          messages: newMessages,
          title: c.messages.length === 0 ? messageText.substring(0, 30) : c.title
        };
      }
      return c;
    });

    saveChats(updatedChats);
    setInput('');
    setEditingMessageId(null);
    setIsGenerating(true);
    setError(null);

    try {
      await generateResponse(currentChatId, messageText, updatedChats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateResponse = async (chatId: string, promptText: string, currentChats: Chat[]) => {
    const chat = currentChats.find(c => c.id === chatId);
    if (!chat) return;

    let systemInstruction = "You are a professional AI assistant.";
    if (chat.type === 'note') systemInstruction = "Expert note-taker. Structured Markdown.";
    if (chat.type === 'blog') systemInstruction = "Professional blog writer. Catchy titles, SEO-friendly. Markdown.";
    if (chat.type === 'review') systemInstruction = "Critical product reviewer. Pros/Cons/Verdict. Markdown.";
    if (chat.type === 'search') systemInstruction = "You are a highly capable knowledge assistant. Your goal is to provide the most relevant and comprehensive information to the user's query. Use Google Search to find direct answers and in-depth details. Synthesize multiple sources into a cohesive, professional response. Prioritize accuracy, clarity, and directness. If a direct answer exists, provide it prominently. Use Markdown for formatting.";

    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: promptText,
      config: {
        systemInstruction,
        tools: chat.type === 'search' ? [{ googleSearch: {} }] : undefined,
      },
    });

    const response = await model;
    const text = response.text;
    
    if (!text) throw new Error('Failed to generate response.');

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const extractedSources = chunks?.map((c: any) => c.web).filter(Boolean) || [];

    const assistantMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
      sources: extractedSources
    };

    const finalChats = currentChats.map(c => {
      if (c.id === chatId) {
        return { ...c, messages: [...c.messages, assistantMsg] };
      }
      return c;
    });

    saveChats(finalChats);
  };

  const deleteChat = (id: string) => {
    const filtered = chats.filter(c => c.id !== id);
    saveChats(filtered);
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditValue(msg.content);
  };

  const startEditingChatTitle = (chat: Chat) => {
    setEditingChatId(chat.id);
    setChatTitleEditValue(chat.title);
  };

  const saveChatTitle = (id: string) => {
    if (!chatTitleEditValue.trim()) {
      setEditingChatId(null);
      return;
    }
    const updatedChats = chats.map(c => 
      c.id === id ? { ...c, title: chatTitleEditValue.trim() } : c
    );
    saveChats(updatedChats);
    setEditingChatId(null);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="bg-[#f9f9f9] border-r border-black/5 flex flex-col h-full overflow-hidden shrink-0"
      >
        <div className="p-4 flex items-center justify-between">
          <button 
            onClick={() => createNewChat(activeType)}
            className="flex-grow flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors text-sm font-medium"
          >
            <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            New Chat
          </button>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-black/5 rounded-lg ml-2">
            <X size={18} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto px-2 py-4 space-y-1">
          {chats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={cn(
                "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-sm",
                activeChatId === chat.id ? "bg-black/5 font-medium" : "hover:bg-black/5 text-slate-600"
              )}
            >
              {editingChatId === chat.id ? (
                <input
                  autoFocus
                  value={chatTitleEditValue}
                  onChange={(e) => setChatTitleEditValue(e.target.value)}
                  onBlur={() => saveChatTitle(chat.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveChatTitle(chat.id);
                    if (e.key === 'Escape') setEditingChatId(null);
                  }}
                  className="bg-white border border-black/10 rounded px-1 w-full focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className="truncate flex-grow"
                  onClick={(e) => {
                    if (activeChatId === chat.id) {
                      e.stopPropagation();
                      startEditingChatTitle(chat);
                    }
                  }}
                >
                  {chat.title}
                </span>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500 hover:text-white transition-all ml-2 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-full overflow-hidden relative bg-white">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-black/5">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <select 
                value={activeType}
                onChange={(e) => setActiveType(e.target.value as ContentType)}
                className="bg-transparent font-display font-bold text-sm focus:outline-none cursor-pointer hover:bg-black/5 px-2 py-1 rounded-md transition-colors"
              >
                <option value="search">Search Engine</option>
                <option value="note">Note Taker</option>
                <option value="blog">Blog Writer</option>
                <option value="review">Product Reviewer</option>
              </select>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-8">
            {(!activeChat || activeChat.messages.length === 0) && !isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="text-white w-8 h-8" />
                </div>
                <h1 className="text-2xl font-display font-bold">How can I help you today?</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  <button 
                    onClick={() => setInput("Explain quantum computing in simple terms")}
                    className="p-4 rounded-xl border border-black/5 hover:bg-black/5 text-left text-sm transition-all"
                  >
                    &quot;Explain quantum computing in simple terms&quot;
                  </button>
                  <button 
                    onClick={() => setInput("Write a blog post about the future of AI")}
                    className="p-4 rounded-xl border border-black/5 hover:bg-black/5 text-left text-sm transition-all"
                  >
                    &quot;Write a blog post about the future of AI&quot;
                  </button>
                </div>
              </div>
            )}

            {activeChat?.messages.map((msg) => (
              <div 
                key={msg.id}
                className={cn(
                  "flex gap-4 group",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="text-white w-4 h-4" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[85%] space-y-2",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-[#f4f4f4] text-slate-900" 
                      : "bg-white text-slate-800"
                  )}>
                    {editingMessageId === msg.id ? (
                      <div className="space-y-3 min-w-[300px]">
                        <textarea 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[60px]"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 rounded-md hover:bg-black/5 text-xs font-medium">Cancel</button>
                          <button onClick={() => handleSend(editValue, true)} className="px-3 py-1 rounded-md bg-black text-white text-xs font-medium">Save & Submit</button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm prose-slate max-w-none">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                    <button 
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1.5 hover:bg-black/5 rounded-md text-slate-400 hover:text-black transition-all"
                    >
                      {copiedId === msg.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    {msg.role === 'user' && (
                      <button 
                        onClick={() => startEditing(msg)}
                        className="p-1.5 hover:bg-black/5 rounded-md text-slate-400 hover:text-black transition-all"
                      >
                        <PenTool size={14} />
                      </button>
                    )}
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((s, i) => (
                          <a 
                            key={i} 
                            href={s.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink size={10} /> {s.title || 'Source'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-[10px] font-bold text-indigo-600">ME</span>
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                  <Sparkles className="text-white w-4 h-4" />
                </div>
                <div className="space-y-2 flex-grow">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 shrink-0 bg-white">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-end gap-2 bg-[#f4f4f4] rounded-2xl p-2 focus-within:ring-1 focus-within:ring-black/10 transition-all">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message OmniNote..."
                className="flex-grow bg-transparent border-none focus:outline-none px-3 py-2 text-sm resize-none max-h-40 min-h-[44px]"
                rows={1}
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating}
                className="p-2 rounded-xl bg-black text-white disabled:bg-slate-300 transition-all shrink-0"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              OmniNote can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function TypeButton({ active, onClick, icon, label, color }: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  color: 'indigo' | 'emerald' | 'amber' | 'slate'
}) {
  const colorClasses = {
    indigo: active ? "bg-indigo-600 text-white border-indigo-600" : "hover:border-indigo-200 text-indigo-600",
    emerald: active ? "bg-emerald-600 text-white border-emerald-600" : "hover:border-emerald-200 text-emerald-600",
    amber: active ? "bg-amber-500 text-white border-amber-500" : "hover:border-amber-200 text-amber-500",
    slate: active ? "bg-slate-600 text-white border-slate-600" : "hover:border-slate-200 text-slate-600",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3",
        active ? "shadow-lg scale-105" : "bg-white border-black/5 shadow-sm",
        colorClasses[color]
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center",
        active ? "bg-white/20" : "bg-slate-50"
      )}>
        {icon}
      </div>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}
