import { useState } from "react";
import { MessageCircleMore, Send, Sparkles, X } from "lucide-react";

const starterMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Hi! I’m InvestBridge AI. I can help you explore startups, investor opportunities, or get quick answers about the platform.",
  },
];

function getBotReply(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes("startup") || normalized.includes("founder")) {
    return "You can browse curated startup listings, review funding goals, and connect with the right investors from the main dashboard.";
  }

  if (normalized.includes("invest")) {
    return "Investors can discover vetted deals, filter by sector and stage, and track round progress in real time.";
  }

  if (normalized.includes("login") || normalized.includes("register")) {
    return "You can sign in or create an account from the navigation bar to access personalized features.";
  }

  return "I can help with startup discovery, investor workflows, and platform guidance. Ask me anything about InvestBridge.";
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(starterMessages);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: trimmed },
    ]);
    setInput("");

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: getBotReply(trimmed) },
      ]);
    }, 350);
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
        <div className="fixed bottom-24 right-5 z-[60] flex w-[min(92vw,24rem)] flex-col overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-950">
          <div className="flex items-center justify-between border-b border-ink-100 bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-white">
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

          <div className="flex h-80 flex-col gap-3 overflow-y-auto bg-ink-50/80 px-4 py-3 dark:bg-ink-900/70">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.sender === "user"
                    ? "ml-auto bg-brand-600 text-white"
                    : "bg-white text-ink-700 shadow-sm dark:bg-ink-800 dark:text-ink-100"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-ink-100 bg-white p-3 dark:border-ink-800 dark:bg-ink-950">
            <label className="sr-only" htmlFor="chatbot-input">
              Type your message
            </label>
            <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-2 dark:border-ink-700 dark:bg-ink-900">
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
