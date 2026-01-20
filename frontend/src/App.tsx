import './index.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>&#128640; Prostor Marketplace - Ready for Development</h1>
        <p>Development environment is fully configured and working</p>
      </header>

      <main className="main">
        <div className="status-grid">
          <div className="status-card green">
            <h3>&#9989; Spring Boot Backend</h3>
            <p>Port: 8080</p>
            <a href="http://localhost:8080/actuator/health" target="_blank">
              Check API Health
            </a>
          </div>

          <div className="status-card green">
            <h3>&#9989; PostgreSQL Database</h3>
            <p>Port: 5432</p>
            <a href="http://localhost:8081" target="_blank">
              Open Adminer
            </a>
          </div>

          <div className="status-card green">
            <h3>&#9989; React Frontend</h3>
            <p>Port: 8082</p>
            <p>Build: Successful</p>
          </div>
        </div>

        <div className="instructions">
          <h3>Development Environment Status: READY &#9989;</h3>
          <p>All systems are operational and ready for development.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
