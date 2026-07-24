const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Client HTTP minimal, sans dépendance externe (axios non nécessaire pour ce volume d'appels).
 * Centralise : préfixe d'URL, en-têtes JSON, en-tête Authorization, et l'extraction des erreurs
 * renvoyées par le backend (toujours au format { error: "message" }).
 */
async function apiFetch(path, { method = "GET", body, token, signal } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkError) {
    // Pas de connexion, ou serveur injoignable — cas fréquent vu le contexte de connectivité
    throw new Error("Connexion impossible. Vérifiez votre connexion internet.");
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || "Une erreur est survenue.");
  }

  return data;
}

export default apiFetch;
