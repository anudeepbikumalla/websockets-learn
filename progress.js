/**
 * progress.js — Lesson progress tracking with localStorage
 * Used by index.html (hub) and all learn*.html pages
 */
(function () {
  const STORAGE_KEY = 'ws_hub_progress';

  /** Get all completed lesson IDs as a Set */
  function getCompleted() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch { return new Set(); }
  }

  /** Mark a lesson as completed */
  function markComplete(lessonId) {
    const completed = getCompleted();
    completed.add(lessonId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    return completed;
  }

  /** Unmark a lesson */
  function markIncomplete(lessonId) {
    const completed = getCompleted();
    completed.delete(lessonId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    return completed;
  }

  /** Toggle completion status */
  function toggleComplete(lessonId) {
    const completed = getCompleted();
    if (completed.has(lessonId)) {
      return { completed: markIncomplete(lessonId), isComplete: false };
    } else {
      return { completed: markComplete(lessonId), isComplete: true };
    }
  }

  /** Get completion stats */
  function getStats(totalLessons = 28) {
    const completed = getCompleted();
    return {
      completed: completed.size,
      total: totalLessons,
      percent: Math.round((completed.size / totalLessons) * 100),
    };
  }

  // Expose globally
  window.WSProgress = { getCompleted, markComplete, markIncomplete, toggleComplete, getStats };
})();
