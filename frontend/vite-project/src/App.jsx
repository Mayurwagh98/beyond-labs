import "./App.css";
import { useEffect, useId, useMemo, useState } from "react";

function App() {
  const inputId = useId();
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const trimmedTitle = useMemo(() => taskTitle.trim(), [taskTitle]);
  const canAddTask = trimmedTitle.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error(`Failed to load tasks (${res.status})`);
        const data = await res.json();
        if (!cancelled) setTasks(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddTask(e) {
    e.preventDefault();
    if (!canAddTask) return;

    try {
      setError("");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to add task (${res.status})`);
      }
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      setTaskTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function markComplete(taskId) {
    try {
      setError("");
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to update task (${res.status})`);
      }
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const completedCount = tasks.reduce(
    (acc, t) => acc + (t.status === "completed" ? 1 : 0),
    0,
  );

  return (
    <div className="tm">
      <header className="tm__header">
        <h1 className="tm__title">Task Manager</h1>
        <p className="tm__subtitle">
          {tasks.length === 0
            ? "Add your first task below."
            : `${completedCount}/${tasks.length} completed`}
        </p>
      </header>

      <section className="tm__card" aria-label="Task input">
        <form className="tm__form" onSubmit={handleAddTask}>
          <label className="tm__label" htmlFor={inputId}>
            Task Title
          </label>
          <div className="tm__row">
            <input
              id={inputId}
              className="tm__input"
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Finish assignment"
              autoComplete="off"
            />
            <button className="tm__button" type="submit" disabled={!canAddTask}>
              Add Task
            </button>
          </div>
          <p className="tm__hint">Task Title is required.</p>
        </form>
      </section>

      <section className="tm__card" aria-label="Task list">
        <div className="tm__listHeader">
          <h2 className="tm__h2">Task List</h2>
          <span className="tm__count">{tasks.length} total</span>
        </div>

        {error ? <div className="tm__error">{error}</div> : null}

        {loading ? (
          <div className="tm__empty">Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="tm__empty">No tasks yet.</div>
        ) : (
          <ul className="tm__list">
            {tasks.map((task) => (
              <li key={task.id} className="tm__item">
                <div className="tm__itemMain">
                  <div
                    className={
                      task.status === "completed"
                        ? "tm__itemTitle is-done"
                        : "tm__itemTitle"
                    }
                  >
                    {task.title}
                  </div>
                  <div className="tm__meta">
                    <span
                      className={
                        task.status === "completed"
                          ? "tm__status tm__status--completed"
                          : "tm__status tm__status--pending"
                      }
                    >
                      {task.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                {task.status === "pending" ? (
                  <button
                    className="tm__button tm__button--secondary"
                    type="button"
                    onClick={() => markComplete(task.id)}
                  >
                    Mark Complete
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
