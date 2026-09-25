import {
  ArrowLeft,
  Image as ImageIcon,
  Info,
  MessageCircle,
  Paperclip,
  Phone,
  PlusCircle,
  Search,
  Send,
  Smile,
  ThumbsUp,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import { getChatMessages, sendChatMessage } from "../api/support";
import { searchUsers } from "../api/users";

const RECENT_KEY = "investbridgeRecentChats";

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("investbridgeSessionUser") || "null");
  } catch {
    return null;
  }
};

const getRecentChats = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRecentChats = (chats) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(chats));
  } catch {
    // Storage may be unavailable (private mode); recents are a convenience only.
  }
};

const displayName = (person) => person?.name || person?.email || "Unknown";

const initials = (name = "") =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

const AVATAR_GRADIENTS = [
  "from-emerald-400 to-teal-600",
  "from-amber-300 to-orange-500",
  "from-sky-400 to-indigo-600",
  "from-fuchsia-400 to-purple-600",
  "from-rose-400 to-red-600",
  "from-lime-300 to-emerald-600",
];

function Avatar({ person, size = "h-12 w-12", textSize = "text-sm", online = false }) {
  const name = displayName(person);
  const gradient = AVATAR_GRADIENTS[Number(person?.id || name.length) % AVATAR_GRADIENTS.length];
  return (
    <div className={`relative shrink-0 ${size}`}>
      <div
        className={`grid h-full w-full place-items-center rounded-full bg-gradient-to-br ${gradient} font-semibold text-white ${textSize}`}
      >
        {initials(name)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-ink-950 bg-emerald-400" />
      )}
    </div>
  );
}

const QUICK_EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🎉", "🔥", "💰", "📈", "🤝", "✅", "❤️"];

export default function ConnectPage({ navigate }) {
  const [user] = useState(() => getStoredUser());
  const [users, setUsers] = useState([]);
  const [recentChats, setRecentChats] = useState(() => getRecentChats());
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const chatHash = activeUser
    ? [Number(user?.id), Number(activeUser.id)].sort((a, b) => a - b).join("-")
    : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      searchUsers(searchQuery)
        .then((found) => {
          setUsers(found);
          setSearchError("");
        })
        .catch((error) => {
          setUsers([]);
          setSearchError(error.message);
        });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const updateRecent = (person, lastMessage) => {
    setRecentChats((current) => {
      const existing = current.find((chat) => chat.user.id === person.id);
      const entry = {
        user: { id: person.id, name: person.name, email: person.email, role: person.role },
        lastText: lastMessage ? lastMessage.text : existing?.lastText || "",
        lastSelf: lastMessage ? lastMessage.self : existing?.lastSelf || false,
        lastTime: lastMessage ? lastMessage.time : existing?.lastTime || "",
        updatedAt: lastMessage && lastMessage.id !== existing?.lastId ? Date.now() : existing?.updatedAt || Date.now(),
        lastId: lastMessage?.id ?? existing?.lastId,
      };
      if (
        existing &&
        existing.lastId === entry.lastId &&
        existing.lastText === entry.lastText
      ) {
        return current;
      }
      const next = [entry, ...current.filter((chat) => chat.user.id !== person.id)].sort(
        (a, b) => b.updatedAt - a.updatedAt,
      );
      saveRecentChats(next);
      return next;
    });
  };

  useEffect(() => {
    if (!chatHash || !activeUser) return undefined;

    let active = true;
    setLoadingMessages(true);
    const loadMessages = async () => {
      try {
        const data = await getChatMessages(chatHash);
        if (!active) return;
        const list = data.messages || [];
        setMessages(list);
        if (list.length > 0) updateRecent(activeUser, list[list.length - 1]);
      } catch {
        // Keep whatever is on screen if the API is briefly unavailable.
      } finally {
        if (active) setLoadingMessages(false);
      }
    };

    loadMessages();
    const timer = window.setInterval(loadMessages, 3000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHash]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, chatHash]);

  const openChat = (person) => {
    if (activeUser?.id === person.id) return;
    setMessages([]);
    setSendError("");
    setMessageInput("");
    setShowEmoji(false);
    setActiveUser(person);
    updateRecent(person, null);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeChat = () => {
    setActiveUser(null);
    setShowInfo(false);
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || !chatHash || sending) return;

    setSendError("");
    setSending(true);
    const optimistic = {
      id: `pending-${Date.now()}`,
      sender: "You",
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      self: true,
      pending: true,
    };
    setMessages((current) => [...current, optimistic]);
    setMessageInput("");
    setShowEmoji(false);

    try {
      await sendChatMessage(chatHash, trimmed);
      const data = await getChatMessages(chatHash);
      const list = data.messages || [];
      setMessages(list);
      if (list.length > 0) updateRecent(activeUser, list[list.length - 1]);
    } catch (error) {
      setMessages((current) => current.filter((msg) => msg.id !== optimistic.id));
      setMessageInput(trimmed);
      setSendError(error.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(messageInput);
    }
  };

  // Sidebar: recent conversations first, then everyone else matching the search.
  const sidebarItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const recentMatches = recentChats.filter((chat) =>
      `${chat.user.name || ""} ${chat.user.email || ""}`.toLowerCase().includes(q),
    );
    const recentIds = new Set(recentMatches.map((chat) => chat.user.id));
    const others = users.filter((person) => !recentIds.has(person.id));
    return { recent: recentMatches, others };
  }, [recentChats, users, searchQuery]);

  // Group consecutive messages from the same sender, Messenger-style.
  const groupedMessages = useMemo(
    () =>
      messages.map((msg, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        return {
          ...msg,
          isFirst: !prev || prev.self !== msg.self,
          isLast: !next || next.self !== msg.self,
        };
      }),
    [messages],
  );

  const bubbleRadius = (msg) => {
    if (msg.self) {
      return `rounded-[1.25rem] ${msg.isFirst ? "" : "rounded-tr-md"} ${msg.isLast ? "" : "rounded-br-md"}`;
    }
    return `rounded-[1.25rem] ${msg.isFirst ? "" : "rounded-tl-md"} ${msg.isLast ? "" : "rounded-bl-md"}`;
  };

  const isOnlyEmoji = (text) => /^(\p{Extended_Pictographic}|️|‍|\s){1,6}$/u.test(text);

  const renderListRow = (person, subtitle, key, time) => {
    const active = activeUser?.id === person.id;
    return (
      <button
        key={key}
        type="button"
        onClick={() => openChat(person)}
        className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition ${
          active ? "bg-brand-500/15" : "hover:bg-white/5"
        }`}
      >
        <Avatar person={person} online />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-ink-50">{displayName(person)}</p>
          <p className="flex items-center gap-1 truncate text-[13px] text-ink-400">
            <span className="truncate">{subtitle}</span>
            {time && (
              <>
                <span aria-hidden>·</span>
                <span className="shrink-0">{time}</span>
              </>
            )}
          </p>
        </div>
      </button>
    );
  };

  return (
    <section className="dark relative min-h-screen overflow-hidden px-2 pb-6 pt-24 sm:px-4 lg:px-6">
      <PageBackground image={false} gradient={AURORA_BG} />

      <div
        className="mx-auto flex max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-ink-950/70 shadow-2xl backdrop-blur-xl"
        style={{ height: "calc(100vh - 7.5rem)", minHeight: 520 }}
      >
        {/* ---------- Sidebar: chat list ---------- */}
        <aside
          className={`${
            activeUser ? "hidden md:flex" : "flex"
          } w-full flex-col border-r border-white/10 md:w-[340px] lg:w-[360px]`}
        >
          <div className="px-4 pb-2 pt-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold text-ink-50">Chats</h1>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-ink-100">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search people"
                className="w-full border-none bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-400"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-ink-400 hover:text-ink-100">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Active-now strip */}
          {users.length > 0 && !searchQuery && (
            <div className="flex gap-3 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
              {users.slice(0, 10).map((person) => (
                <button
                  key={`strip-${person.id}`}
                  type="button"
                  onClick={() => openChat(person)}
                  className="flex w-14 shrink-0 flex-col items-center gap-1"
                >
                  <Avatar person={person} size="h-12 w-12" online />
                  <span className="w-full truncate text-center text-[11px] text-ink-300">
                    {displayName(person).split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {sidebarItems.recent.length > 0 &&
              sidebarItems.recent.map((chat) =>
                renderListRow(
                  chat.user,
                  chat.lastText
                    ? `${chat.lastSelf ? "You: " : ""}${chat.lastText}`
                    : "Say hi 👋",
                  `recent-${chat.user.id}`,
                  chat.lastTime,
                ),
              )}

            {sidebarItems.others.length > 0 && (
              <>
                <p className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {searchQuery ? "People" : "Start a conversation"}
                </p>
                {sidebarItems.others.map((person) =>
                  renderListRow(person, person.email, `user-${person.id}`),
                )}
              </>
            )}

            {searchError && (
              <p className="px-3 py-6 text-center text-sm text-red-400">{searchError}</p>
            )}
            {!searchError &&
              sidebarItems.recent.length === 0 &&
              sidebarItems.others.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-ink-400">No people found.</p>
              )}
          </div>
        </aside>

        {/* ---------- Conversation ---------- */}
        <div className={`${activeUser ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
          {activeUser ? (
            <>
              <header className="flex items-center gap-3 border-b border-white/10 px-3 py-2.5 shadow-sm">
                <button
                  type="button"
                  onClick={closeChat}
                  className="grid h-9 w-9 place-items-center rounded-full text-brand-400 hover:bg-white/10 md:hidden"
                  aria-label="Back to chats"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar person={activeUser} size="h-10 w-10" online />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink-50">{displayName(activeUser)}</p>
                  <p className="text-xs text-ink-400">Active now</p>
                </div>
                <div className="flex items-center gap-1 text-brand-400">
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Call">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Video call">
                    <Video className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInfo((value) => !value)}
                    className={`grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 ${showInfo ? "bg-white/10" : ""}`}
                    aria-label="Conversation info"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
                {/* Intro card at the top of every thread */}
                <div className="mb-6 flex flex-col items-center pt-4 text-center">
                  <Avatar person={activeUser} size="h-20 w-20" textSize="text-2xl" />
                  <p className="mt-3 text-lg font-semibold text-ink-50">{displayName(activeUser)}</p>
                  <p className="text-sm text-ink-400">InvestBridge {activeUser.role || "member"}</p>
                  <p className="mt-1 text-xs text-ink-500">{activeUser.email}</p>
                </div>

                {loadingMessages && messages.length === 0 && (
                  <p className="text-center text-sm text-ink-500">Loading messages…</p>
                )}

                <AnimatePresence initial={false}>
                  {groupedMessages.map((msg) => {
                    const emojiOnly = isOnlyEmoji(msg.text);
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className={`flex items-end gap-2 ${msg.self ? "justify-end" : "justify-start"} ${
                          msg.isFirst ? "mt-3" : "mt-0.5"
                        }`}
                      >
                        {!msg.self && (
                          <div className="w-7 shrink-0">
                            {msg.isLast && <Avatar person={activeUser} size="h-7 w-7" textSize="text-[10px]" />}
                          </div>
                        )}
                        <div
                          title={msg.time}
                          className={`group relative max-w-[75%] whitespace-pre-wrap break-words ${
                            emojiOnly
                              ? "text-4xl leading-tight"
                              : `${bubbleRadius(msg)} px-3.5 py-2 text-[15px] leading-snug ${
                                  msg.self
                                    ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white"
                                    : "bg-white/10 text-ink-50"
                                }`
                          } ${msg.pending ? "opacity-60" : ""}`}
                        >
                          {msg.text}
                          <span
                            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[11px] text-ink-200 opacity-0 transition group-hover:opacity-100 ${
                              msg.self ? "right-full mr-2" : "left-full ml-2"
                            }`}
                          >
                            {msg.time}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {messages.length > 0 && messages[messages.length - 1].self && (
                  <p className="mt-1 text-right text-[11px] text-ink-500">
                    {messages[messages.length - 1].pending ? "Sending…" : "Sent"}
                  </p>
                )}
              </div>

              {sendError && <p className="px-4 pb-1 text-xs text-red-400">{sendError}</p>}

              {/* Composer */}
              <div className="relative flex items-end gap-1 px-2 pb-3 pt-1 sm:px-3">
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute bottom-full right-12 mb-2 grid grid-cols-6 gap-1 rounded-2xl border border-white/10 bg-ink-900 p-2 shadow-xl"
                    >
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setMessageInput((value) => value + emoji);
                            inputRef.current?.focus();
                          }}
                          className="grid h-9 w-9 place-items-center rounded-lg text-xl hover:bg-white/10"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center text-brand-400">
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="More">
                    <PlusCircle className="h-5 w-5" />
                  </button>
                  <button type="button" className="hidden h-9 w-9 place-items-center rounded-full hover:bg-white/10 sm:grid" aria-label="Photo">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button type="button" className="hidden h-9 w-9 place-items-center rounded-full hover:bg-white/10 sm:grid" aria-label="Attach">
                    <Paperclip className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex min-w-0 flex-1 items-end rounded-3xl bg-white/10 px-3.5 py-2 ring-brand-400/40 focus-within:ring-1">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Aa"
                    className="max-h-32 w-full resize-none border-none bg-transparent focus-visible:shadow-none text-[15px] text-ink-50 outline-none placeholder:text-ink-400"
                    style={{ fieldSizing: "content" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmoji((value) => !value)}
                    className="ml-2 text-brand-400 hover:text-brand-300"
                    aria-label="Emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => send(messageInput.trim() ? messageInput : "👍")}
                  disabled={sending}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-brand-400 transition hover:bg-white/10 disabled:opacity-40"
                  aria-label={messageInput.trim() ? "Send" : "Send a like"}
                >
                  {messageInput.trim() ? <Send className="h-5 w-5" /> : <ThumbsUp className="h-5 w-5" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
                <MessageCircle className="h-9 w-9" />
              </div>
              <p className="mt-4 text-xl font-semibold text-ink-50">Your messages</p>
              <p className="mt-1 max-w-sm text-sm text-ink-400">
                Pick someone from the list to start chatting with founders and investors.
              </p>
            </div>
          )}
        </div>

        {/* ---------- Info panel ---------- */}
        <AnimatePresence>
          {activeUser && showInfo && (
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2 }}
              className="hidden w-[300px] shrink-0 flex-col items-center border-l border-white/10 px-4 py-6 text-center xl:flex"
            >
              <Avatar person={activeUser} size="h-20 w-20" textSize="text-2xl" online />
              <p className="mt-3 text-lg font-semibold text-ink-50">{displayName(activeUser)}</p>
              <p className="text-xs text-ink-400">Active now</p>

              <div className="mt-5 grid w-full grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate?.("/profile")}
                  className="flex flex-col items-center gap-1 rounded-xl bg-white/5 py-3 text-xs text-ink-200 hover:bg-white/10"
                >
                  <Info className="h-5 w-5 text-brand-400" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="flex flex-col items-center gap-1 rounded-xl bg-white/5 py-3 text-xs text-ink-200 hover:bg-white/10"
                >
                  <X className="h-5 w-5 text-brand-400" />
                  Close
                </button>
              </div>

              <div className="mt-6 w-full space-y-3 text-left text-sm">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-500">Email</p>
                  <p className="mt-0.5 break-all text-ink-100">{activeUser.email}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-500">Role</p>
                  <p className="mt-0.5 capitalize text-ink-100">{activeUser.role || "Member"}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-500">Messages</p>
                  <p className="mt-0.5 text-ink-100">{messages.length}</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
