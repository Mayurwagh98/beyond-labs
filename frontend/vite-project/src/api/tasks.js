async function request(path, options) {
  const res = await fetch(path, options);
  if (res.ok) {
    if (res.status === 204) return null;
    return await res.json();
  }

  const text = await res.text().catch(() => "");
  const message = text?.trim() || `Request failed (${res.status})`;
  throw new Error(message);
}

export function listTasks() {
  return request("/api/tasks");
}

export function createTask({ title }) {
  return request("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export function updateTask(id, patch) {
  return request(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

