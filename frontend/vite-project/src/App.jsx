import "./App.css";
import { useEffect, useId, useMemo, useState } from "react";
import { createTask, listTasks, updateTask } from "./api/tasks";

function App() {
  const inputId = useId();
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const trimmedTitle = useMemo(() => taskTitle.trim(), [taskTitle]);
  const canAddTask = trimmedTitle.length > 0;
  const trimmedEditingTitle = useMemo(
    () => editingTitle.trim(),
    [editingTitle],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await listTasks();
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
      const created = await createTask({ title: trimmedTitle });
      setTasks((prev) => [created, ...prev]);
      setTaskTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function markComplete(taskId) {
    try {
      setError("");
      const updated = await updateTask(taskId, { completed: true });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const completedCount = tasks.reduce(
    (acc, t) => acc + (t.completed ? 1 : 0),
    0,
  );

  function startEditing(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function saveEditing(task) {
    const nextTitle = trimmedEditingTitle;
    if (!nextTitle) return;
    if (nextTitle === task.title) {
      cancelEditing();
      return;
    }

    try {
      setError("");
      const updated = await updateTask(task.id, { title: nextTitle });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      cancelEditing();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

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
                  {editingId === task.id ? (
                    <div className="tm__editRow">
                      <input
                        className="tm__input tm__input--compact"
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  ) : (
                    <div
                      className={
                        task.completed
                          ? "tm__itemTitle is-done"
                          : "tm__itemTitle"
                      }
                    >
                      {task.title}
                    </div>
                  )}
                  <div className="tm__meta">
                    <span
                      className={
                        task.completed
                          ? "tm__status tm__status--completed"
                          : "tm__status tm__status--pending"
                      }
                    >
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="tm__actions">
                  {editingId === task.id ? (
                    <>
                      <button
                        className="tm__button"
                        type="button"
                        onClick={() => saveEditing(task)}
                        disabled={!trimmedEditingTitle}
                      >
                        Save
                      </button>
                      <button
                        className="tm__button tm__button--secondary"
                        type="button"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="tm__button tm__button--secondary"
                        type="button"
                        onClick={() => startEditing(task)}
                      >
                        Edit
                      </button>
                      {!task.completed ? (
                        <button
                          className="tm__button tm__button--secondary"
                          type="button"
                          onClick={() => markComplete(task.id)}
                        >
                          Mark Complete
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
