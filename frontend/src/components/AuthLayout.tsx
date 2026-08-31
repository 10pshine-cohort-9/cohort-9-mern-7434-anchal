interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  error: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const AuthLayout = ({ eyebrow, title, error, children, footer }: AuthLayoutProps) => {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">N</div>
        <div className="auth-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        {error && <div className="error-message">{error}</div>}
        {children}
        <p className="auth-footer">{footer}</p>
      </section>
    </main>
  );
};

export default AuthLayout;