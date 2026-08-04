import { useState } from "react";
import { MessageCircleMore, Send, Sparkles, X } from "lucide-react";

const starterMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Hi! I’m InvestBridge AI. I can help you explore startups, investor opportunities, or get quick answers about the platform.",
  },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function getBotReply(message) {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  if (response.ok && data.reply) {
    return data.reply;
  }

  return null;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(starterMessages);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: trimmed },
    ]);
    setInput("");

    const reply = await getBotReply(trimmed);

    if (reply) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: reply },
      ]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-2xl transition hover:scale-105 hover:bg-brand-700"
        aria-label="Open AI assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircleMore className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-[60] flex w-[min(92vw,24rem)] flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-ink-950/80">
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-brand-600/90 to-brand-700/90 px-4 py-3 text-white backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">InvestBridge AI</p>
                <p className="text-xs text-brand-50">Always here to help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/90 transition hover:bg-white/20"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-80 flex-col gap-3 overflow-y-auto bg-white/30 px-4 py-3 backdrop-blur-md dark:bg-ink-900/40">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.sender === "user"
                    ? "ml-auto bg-brand-600 text-white"
                    : "bg-white/70 text-ink-700 shadow-sm backdrop-blur-md dark:bg-ink-800/70 dark:text-ink-100"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/70">
            <label className="sr-only" htmlFor="chatbot-input">
              Type your message
            </label>
            <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-ink-900/50">
              <input
                id="chatbot-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about startups or investing"
                className="w-full border-0 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-100"
              />
              <button
                type="submit"
                className="rounded-full bg-brand-600 p-2 text-white transition hover:bg-brand-700"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
