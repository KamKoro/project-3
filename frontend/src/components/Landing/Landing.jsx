const Landing = () => {
  return (
    <main className="landing-page">
      <div className="landing-card">
        <h1>Welcome!</h1>
        <p>
          You are on the landing page for visitors.
        </p>
        <p>
          <a href="/sign-up" className="btn">Sign up now</a> 
          <span className="or"> or </span>
          <a href="/sign-in" className="btn-outline">Sign in</a> 
          to see your super secret dashboard!
        </p>
      </div>
    </main>
  );
};

export default Landing;
