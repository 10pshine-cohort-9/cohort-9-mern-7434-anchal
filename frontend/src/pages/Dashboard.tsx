import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-page">
      <div className="dashboard-card">
        <p className="eyebrow">Workspace</p>

        <h1>Welcome back{user?.name ? `, ${user.name}` : ''}.</h1>
        <button
          className="primary-button"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </main>
  );
};

export default Dashboard;