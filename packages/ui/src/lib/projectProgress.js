const STORAGE_KEY = "investbridgeProjectProgress";

const MILESTONES = [25, 50, 75, 100];

function readProgressStore() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function getFallbackProgress(id) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return 0;
  return Math.min(75, Math.max(0, ((numericId * 17) % 4) * 25));
}

export function getProjectProgress(project) {
  const stored = readProgressStore()[project.id];
  const value = stored?.progress ?? project.progress ?? project.progress_percentage;
  const progress = Number(value);
  return Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : getFallbackProgress(project.id);
}

export function getProjectPaymentState(project) {
  const stored = readProgressStore()[project.id];
  return {
    progress: getProjectProgress(project),
    paidMilestones: stored?.paidMilestones || [],
  };
}

export function getNextMilestone(progress) {
  return MILESTONES.find((milestone) => milestone > progress) || null;
}

export function saveProjectProgress(projectId, progress, paidMilestones = []) {
  const store = readProgressStore();
  store[projectId] = { progress, paidMilestones, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("project-progress-changed", { detail: { projectId } }));
}

export function getMilestoneAmount(project, milestone) {
  const goal = Number.parseFloat(String(project.funding_goal || project.goal || "0").replace(/[^0-9.]/g, "")) || 0;
  return goal ? goal * (milestone / 100) : 0;
}
