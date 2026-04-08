import { useEffect, useState } from "react";
import { fetchJson } from "../lib/api.js";

function useAuth() {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loadAuthState = async () => {
    try {
      setError("");
      const [nextUsers, nextCurrentUser] = await Promise.all([
        fetchJson("/api/users"),
        fetchJson("/api/me")
      ]);
      setUsers(nextUsers);
      setCurrentUser(nextCurrentUser);
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  const login = async (userId) => {
    const user = await fetchJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await fetchJson("/api/auth/logout", {
      method: "POST"
    });
    setCurrentUser(null);
  };

  return {
    currentUser,
    users,
    error,
    login,
    logout,
    reloadAuth: loadAuthState
  };
}

export default useAuth;
