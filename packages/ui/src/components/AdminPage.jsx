import { useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Check,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

export default function AdminPage({ navigate }) {
  const [users, setUsers] = useState([
    { id: 1, name: "Amina Rahman", email: "amina.rahman@invest.com", role: "Investor" },
    { id: 2, name: "John Doe", email: "john.doe@angel.co", role: "Investor" },
    { id: 3, name: "Sarah Chen", email: "sarah.chen@capital.io", role: "Investor" },
    { id: 4, name: "Carlos Gomez", email: "carlos@greenfarms.org", role: "Entrepreneur" },
    { id: 5, name: "Fatima Al-Fayed", email: "fatima@agri-bridge.com", role: "Entrepreneur" },
    { id: 6, name: "Elena Petrova", email: "elena.petrova@expertnetwork.org", role: "Entrepreneur" },
    { id: 7, name: "Kenji Sato", email: "sato@organic-consulting.jp", role: "Entrepreneur" },
  ]);

  const [projects, setProjects] = useState([
    { id: 1, name: "EcoAgro Vertical Farm", founder: "Carlos Gomez", status: "Active", fundingGoal: "$500,000" },
    { id: 2, name: "HydroGrow Smart Seeds", founder: "Fatima Al-Fayed", status: "Active", fundingGoal: "$250,000" },
    { id: 3, name: "SunSoil Organic Orchards", founder: "David Miller", status: "Active", fundingGoal: "$1,200,000" },
  ]);

  const [complaints, setComplaints] = useState([
    { id: 1, reporter: "Amina Rahman", subject: "Spam behavior", detail: "Received unsolicited promotional messages from a project founder.", status: "Pending" },
    { id: 2, reporter: "Carlos Gomez", subject: "Incorrect project stats", detail: "The system is displaying incorrect historical yield stats on my profile.", status: "Pending" },
    { id: 3, reporter: "Elena Petrova", subject: "Expert verification delay", detail: "My operator credentials have been pending verification for over a week.", status: "Resolved" },
  ]);

  const [activeTab, setActiveTab] = useState("users"); // "users", "projects", "complaints"
  const [roleFilter, setRoleFilter] = useState("All"); // "All", "Investor", "Entrepreneur"

  const pendingComplaintsCount = complaints.filter((c) => c.status === "Pending").length;

  return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,97,255,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] dark:bg-gradient-to-br dark:from-ink-950 dark:to-ink-900 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[32px] border border-brand-100 bg-white/80 p-8 shadow-lift backdrop-blur sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Admin control center
              </span>
              <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Welcome back, your platform is looking strong.
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-ink-600">
                Review users, monitor activity, and keep the InvestBridge experience polished for every investor and founder.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("home")}
                className="btn-ghost"
              >
                Back to site
              </button>
              <button
                type="button"
                onClick={() => navigate("home")}
                className="btn-primary"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Total users</p>
                <p className="text-2xl font-bold text-ink-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Active projects</p>
                <p className="text-2xl font-bold text-ink-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-purple-100 p-3 text-purple-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Payments</p>
                <p className="text-2xl font-bold text-ink-900">41</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Complaints</p>
                <p className="text-2xl font-bold text-ink-900">{pendingComplaintsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="card p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-ink-100 pb-6">
            <div>
              <p className="text-sm font-semibold text-brand-700">Your Tasks</p>
              <h2 className="mt-1 text-xl font-semibold text-ink-900">
                Manage Platform Records
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === "users"
                    ? "bg-brand-600 text-white shadow-soft dark:shadow-glow"
                    : "bg-ink-50 text-ink-600 hover:bg-ink-100 dark:hover:shadow-glow"
                }`}
              >
                Users ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === "projects"
                    ? "bg-brand-600 text-white shadow-soft dark:shadow-glow"
                    : "bg-ink-50 text-ink-600 hover:bg-ink-100 dark:hover:shadow-glow"
                }`}
              >
                Projects ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("complaints")}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === "complaints"
                    ? "bg-brand-600 text-white shadow-soft dark:shadow-glow"
                    : "bg-ink-50 text-ink-600 hover:bg-ink-100 dark:hover:shadow-glow"
                }`}
              >
                Complaints ({pendingComplaintsCount} pending)
              </button>
            </div>
          </div>

          <div className="mt-6">
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-ink-100/50 pb-4">
                  {["All", "Investor", "Entrepreneur"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRoleFilter(role)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        roleFilter === role
                          ? "bg-brand-100 text-brand-700 dark:shadow-glow"
                          : "text-ink-500 hover:bg-ink-50 dark:hover:shadow-glow"
                      }`}
                    >
                      {role === "All" ? "All Roles" : `${role}s`}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wider text-ink-400">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-50 text-sm">
                      {users
                        .filter((u) => roleFilter === "All" || u.role === roleFilter)
                        .map((user) => (
                          <tr key={user.id} className="hover:bg-ink-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-ink-900">{user.name}</td>
                            <td className="py-3.5 px-4 text-ink-500">{user.email}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === "Investor"
                                  ? "bg-blue-100 text-blue-800"
                                  : user.role === "Entrepreneur"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setUsers((current) => current.filter((u) => u.id !== user.id))}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      {users.filter((u) => roleFilter === "All" || u.role === roleFilter).length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-ink-400">
                            No users found in this category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wider text-ink-400">
                      <th className="py-3 px-4">Project Name</th>
                      <th className="py-3 px-4">Founder</th>
                      <th className="py-3 px-4">Funding Goal</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50 text-sm">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-ink-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-ink-900">{project.name}</td>
                        <td className="py-3.5 px-4 text-ink-500">{project.founder}</td>
                        <td className="py-3.5 px-4 font-medium text-ink-900">{project.fundingGoal}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {project.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setProjects((current) => current.filter((p) => p.id !== project.id))}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-ink-400">
                          No active projects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "complaints" && (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="rounded-2xl border border-ink-100 bg-ink-50/50 p-5 transition-all hover:border-ink-200 dark:border-ink-800 dark:bg-ink-900 dark:hover:border-ink-700 dark:hover:bg-white/10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-ink-900">{complaint.subject}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            complaint.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {complaint.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-400">Reported by: <span className="font-semibold">{complaint.reporter}</span></p>
                        <p className="mt-2 text-sm text-ink-600 leading-relaxed">{complaint.detail}</p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-start">
                        {complaint.status === "Pending" && (
                          <button
                            type="button"
                            onClick={() => setComplaints((current) =>
                              current.map((c) => (c.id === complaint.id ? { ...c, status: "Resolved" } : c))
                            )}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Resolve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setComplaints((current) => current.filter((c) => c.id !== complaint.id))}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {complaints.length === 0 && (
                  <p className="py-8 text-center text-ink-400">
                    No complaints on file.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
