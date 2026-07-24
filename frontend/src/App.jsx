import { useAuth } from "./hooks/useAuth";
import LoginScreen from "./screens/citizen/LoginScreen";

/**
 * Point d'entrée minimal : tant que les autres écrans (Accueil, etc.) ne sont
 * pas construits dans une prochaine discussion, on affiche un espace réservé
 * une fois authentifié, pour pouvoir déjà tester le flux de connexion de bout en bout.
 */
export default function App() {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen onAuthenticated={login} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-hysacam-paper px-6">
      <p className="font-display text-[15px] text-hysacam-ink">
        Connecté en tant que <span className="font-bold">{user?.name || user?.phone}</span>
      </p>
      <p className="font-mono text-[11px] text-gray-500">
        (Écran Accueil à construire dans une prochaine discussion)
      </p>
      <button
        onClick={logout}
        className="rounded-xl px-4 py-2 text-[12px] font-display font-bold border border-hysacam-line"
      >
        Se déconnecter
      </button>
    </div>
  );
}
