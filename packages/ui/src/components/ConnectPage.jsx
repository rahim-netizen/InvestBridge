import {
  ArrowLeft,
  ArrowUpRight,
  MessageCircle,
  Send,
  Sparkles,
  Users,
  Pin,
  Paperclip,
  CheckCircle2,
  Clock,
  Filter,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import PageBackground from "./PageBackground.jsx";

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return JSON.parse(
      localStorage.getItem("investbridgeSessionUser") || "null",
    );
  } catch {
    return null;
  }
};

const getStoredThreads = () => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem("investbridgeThreads") || "[]");
  } catch {
    return [];
  }
};

const saveThreads = (threads) => {
  localStorage.setItem("investbridgeThreads", JSON.stringify(threads));
};

const initialThreads = [
  {
    id: 1,
    title: "NovaVet AI · Series A discussion",
    participants: ["Amara Okafor", "Daniel Reyes"],
    updatedAt: "2 min ago",
    unread: 3,
    messages: [
      {
        id: 1,
        sender: "Amara Okafor",
        text: "We've uploaded the latest traction update and deck.",
        time: "10:32 AM",
        self: false,
      },
      {
        id: 2,
        sender: "You",
        text: "Great. Please add the revenue summary and a Q&A note.",
        time: "10:35 AM",
        self: true,
      },
      {
        id: 3,
        sender: "Daniel Reyes",
        text: "Shared note: diligence call scheduled for Thursday at 2 PM.",
        time: "10:40 AM",
        self: false,
      },
    ],
  },
  {
    id: 2,
    title: "Lumen Grid · Seed round follow-up",
    participants: ["Mei Lin Tan"],
    updatedAt: "1 hr ago",
    unread: 1,
    messages: [
      {
        id: 1,
        sender: "Mei Lin Tan",
        text: "The solar microgrid data room is now live. Let me know if you need access.",
        time: "9:15 AM",
        self: false,
      },
      {
        id: 2,
        sender: "You",
        text: "Thanks! I'll review the deck and get back to you by EOD.",
        time: "9:20 AM",
        self: true,
      },
    ],
  },
  {
    id: 3,
    title: "Cartful · Pre-seed introduction",
    participants: ["Alex Kim"],
    updatedAt: "3 hrs ago",
    unread: 0,
    messages: [
      {
        id: 1,
        sender: "Alex Kim",
        text: "Headless checkout that turns every link into a storefront — very interesting.",
        time: "Yesterday",
        self: false,
      },
    ],
  },
];

export default function ConnectPage({ navigate }) {
  const [user] = useState(() => getStoredUser());
  const [threads, setThreads] = useState(() => getStoredThreads());
  const [activeThread, setActiveThread] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("list");

  useEffect(() => {
    const stored = getStoredThreads();
    if (stored.length > 0) {
      setThreads(stored);
    }
  }, []);

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.participants.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !activeThread) return;

    const newMessage = {
      id: Date.now(),
      sender: user?.name || user?.email || "You",
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      self: true,
    };

    const updatedThreads = threads.map((t) =>
      t.id === activeThread.id
        ? { ...t, messages: [...t.messages, newMessage], updatedAt: "Just now" }
        : t,
    );

    setThreads(updatedThreads);
    saveThreads(updatedThreads);
    setMessageInput("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const openThread = (thread) => {
    setActiveThread(thread);
    setView("chat");
  };

  const backToList = () => {
    setView("list");
    setActiveThread(null);
  };

  const inputWrapperClassName =
    "surface-rim flex items-center gap-3 rounded-2xl px-4 py-3";
  const inputClassName =
    "w-full rounded-2xl border border-white/20 bg-white/35 px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 backdrop-blur-sm dark:border-white/10 dark:bg-ink-950/35 dark:text-ink-50 dark:placeholder:text-ink-500";

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <PageBackground />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-[-5rem] top-24 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute right-[-4rem] bottom-10 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          {view === "chat" && (
            <button
              type="button"
              onClick={backToList}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/30 bg-white/50 text-ink-600 transition hover:bg-white/80 dark:border-white/10 dark:bg-ink-950/40 dark:text-ink-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <span className="eyebrow">
              <MessageCircle className="h-3.5 w-3.5" />
              {view === "chat" ? activeThread?.title : "Connect and grow"}
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">
              {view === "chat"
                ? "Conversation"
                : "Keep the conversation moving in one place."}
            </h1>
          </div>
        </div>

        {view === "list" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <div className="glass-panel-strong holo-card rounded-[2rem] p-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                />
              </div>

              <div className="space-y-3">
                {filteredThreads.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-500 dark:text-ink-400">
                    No conversations found. Start a new thread from an opportunity.
                  </p>
                ) : (
                  filteredThreads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => openThread(thread)}
                      className="w-full text-left rounded-2xl border border-white/20 bg-white/50 p-4 transition hover:bg-white/80 dark:border-white/10 dark:bg-ink-950/45 dark:hover:bg-ink-950/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                            {thread.title}
                          </p>
                          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                            {thread.participants.join(", ")}
                          </p>
                        </div>
                        {thread.unread > 0 && (
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white shrink-0">
                            {thread.unread}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-ink-400 dark:text-ink-500">
                        <Clock className="h-3 w-3" />
                        {thread.updatedAt}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel-strong holo-card rounded-[2rem] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600/90 text-white shadow-soft backdrop-blur-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                    Quick actions
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    Start a new conversation
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    const newThread = {
                      id: Date.now(),
                      title: "New opportunity discussion",
                      participants: ["You"],
                      updatedAt: "Just now",
                      unread: 0,
                      messages: [
                        {
                          id: 1,
                          sender: "System",
                          text: "New thread created. Start the conversation!",
                          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          self: false,
                        },
                      ],
                    };
                    const updated = [newThread, ...threads];
                    setThreads(updated);
                    saveThreads(updated);
                    openThread(newThread);
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-100/50 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-300"
                >
                  <MessageCircle className="h-5 w-5" />
                  New thread
                </button>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-400/10 dark:text-brand-200">
                    <MessageCircle className="h-5 w-5" />
                    <p className="mt-2 font-semibold">Threads</p>
                    <p className="mt-1 text-xs leading-relaxed">
                      Keep every conversation tied to a deal.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-400/10 dark:text-brand-200">
                    <Pin className="h-5 w-5" />
                    <p className="mt-2 font-semibold">Pinned</p>
                    <p className="mt-1 text-xs leading-relaxed">
                      Pin reminders, context, and file references.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-400/10 dark:text-brand-200">
                    <Paperclip className="h-5 w-5" />
                    <p className="mt-2 font-semibold">Files</p>
                    <p className="mt-1 text-xs leading-relaxed">
                      Share decks and updates without leaving the chat.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/20 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/45">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  Workspace features
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink-600 dark:text-ink-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    Conversation threads tied to each opportunity
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    Quick reactions, notes, and follow-ups
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    A simple system UI that keeps growth moving
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <div className="glass-panel-strong holo-card rounded-[2rem] p-6 flex flex-col" style={{ maxHeight: "70vh" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                    {activeThread?.title}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    {activeThread?.participants.join(", ")}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Users className="h-3 w-3 inline mr-1" />
                  {activeThread?.participants.length} online
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {activeThread?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-soft ${
                      msg.self
                        ? "ml-auto bg-brand-600 text-white"
                        : "bg-white/70 text-ink-700 border border-white/20 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/55 dark:text-ink-200"
                    }`}
                  >
                    <p className="font-semibold text-xs mb-1 opacity-70">
                      {msg.sender}
                    </p>
                    <p>{msg.text}</p>
                    <p className="mt-1 text-xs opacity-50">{msg.time}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className={inputWrapperClassName}>
                  <Paperclip className="h-4 w-4 text-ink-400 shrink-0" />
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="glass-panel-strong holo-card rounded-[2rem] p-6">
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                Thread actions
              </p>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 rounded-2xl border border-white/20 bg-white/50 p-3 text-sm text-ink-700 transition hover:bg-white/80 dark:border-white/10 dark:bg-ink-950/45 dark:text-ink-200"
                >
                  <Pin className="h-4 w-4 text-brand-600" />
                  Pin this thread
                </button>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 rounded-2xl border border-white/20 bg-white/50 p-3 text-sm text-ink-700 transition hover:bg-white/80 dark:border-white/10 dark:bg-ink-950/45 dark:text-ink-200"
                >
                  <Paperclip className="h-4 w-4 text-brand-600" />
                  Attach file
                </button>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 rounded-2xl border border-white/20 bg-white/50 p-3 text-sm text-ink-700 transition hover:bg-white/80 dark:border-white/10 dark:bg-ink-950/45 dark:text-ink-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                  Mark as resolved
                </button>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 rounded-2xl border border-white/20 bg-white/50 p-3 text-sm text-ink-700 transition hover:bg-white/80 dark:border-white/10 dark:bg-ink-950/45 dark:text-ink-200"
                >
                  <Clock className="h-4 w-4 text-brand-600" />
                  Schedule follow-up
                </button>
              </div>

              <div className="mt-6 rounded-3xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-400/10 dark:text-brand-200">
                <p className="font-semibold">Response time target</p>
                <p className="mt-1">Less than 24 hours for all threads.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}