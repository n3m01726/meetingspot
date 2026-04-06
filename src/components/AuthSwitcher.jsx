function AuthSwitcher({ currentUser, users, onLogin, onLogout }) {
  return (
    <div className="audience-filters" aria-label="Session utilisateur">
      <select
        className="intent-visibility-select"
        value={currentUser?.id || ""}
        onChange={(event) => {
          const userId = Number.parseInt(event.target.value, 10);
          if (userId > 0) {
            onLogin(userId);
          }
        }}
      >
        <option value="">Choisir un profil</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} • {user.circle}
          </option>
        ))}
      </select>
      {currentUser ? (
        <button className="ghost-button strong" type="button" onClick={onLogout}>
          Se déconnecter
        </button>
      ) : null}
    </div>
  );
}

export default AuthSwitcher;
