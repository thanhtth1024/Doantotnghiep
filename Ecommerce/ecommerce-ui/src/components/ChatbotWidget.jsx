import { useEffect, useRef, useState } from 'react';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/auth';
import { rasaService } from '../services/rasaService';

const ChatbotWidget = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', sender: 'bot', text: 'Xin chào! Tôi có thể giúp bạn tìm sản phẩm, kiểm tra đơn hàng hoặc giải đáp về giao hàng.' },
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (user?.role === 'admin') return null;

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || sending) return;

    const userMessage = { id: `${Date.now()}-user`, sender: 'user', text };
    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setSending(true);

    try {
      const replies = await rasaService.sendMessage(
        user ? `user-${user.id}` : 'guest-session',
        text,
        { user_id: user?.id || null, access_token: token || null, authenticated: isAuthenticated },
      );
      const botMessages = (Array.isArray(replies) ? replies : [])
        .filter((reply) => reply.text)
        .map((reply, index) => ({ id: `${Date.now()}-bot-${index}`, sender: 'bot', text: reply.text }));
      setMessages((current) => [...current, ...(botMessages.length ? botMessages : [{ id: `${Date.now()}-empty`, sender: 'bot', text: 'Tôi chưa có câu trả lời phù hợp. Bạn thử diễn đạt theo cách khác nhé.' }])]);
    } catch (error) {
      console.error('Rasa chatbot error:', error);
      setMessages((current) => [...current, { id: `${Date.now()}-error`, sender: 'bot', text: 'Chatbot đang tạm ngắt kết nối. Bạn vẫn có thể tiếp tục mua hàng bình thường.' }]);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) {
    return <button type="button" onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-cyan-300 shadow-xl ring-4 ring-white transition hover:scale-105 hover:bg-cyan-700 hover:text-white" title="Mở trợ lý AI" aria-label="Mở trợ lý AI"><ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7" /></button>;
  }

  return <aside className="fixed bottom-5 right-5 z-50 flex h-[min(620px,calc(100vh-40px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
    <header className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-slate-950"><ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" /></span><div><p className="font-semibold">Trợ lý mua sắm AI</p><p className="text-xs text-cyan-200">Đang hỗ trợ bạn</p></div></div><button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white" title="Thu gọn chatbot" aria-label="Thu gọn chatbot"><XMarkIcon className="h-5 w-5" /></button></header>
    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">{messages.map((item) => <div key={item.id} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${item.sender === 'user' ? 'rounded-br-sm bg-cyan-600 text-white' : 'rounded-bl-sm bg-white text-slate-700 shadow-sm'}`}>{item.text}</div></div>)}{sending && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">Đang trả lời...</div></div>}<div ref={messagesEndRef} /></div>
    <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 bg-white p-3"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Hỏi về sản phẩm, đơn hàng..." className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" aria-label="Tin nhắn chatbot" /><button disabled={sending || !message.trim()} type="submit" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50" title="Gửi tin nhắn" aria-label="Gửi tin nhắn"><PaperAirplaneIcon className="h-5 w-5" /></button></form>
  </aside>;
};

export default ChatbotWidget;
