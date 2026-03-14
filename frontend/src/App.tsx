import { useState } from 'react';
import './index.css';
import Sklad from "./manager/sklad";
import Manager from "./manager/manager_mainpage";

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'sklad' | 'manager'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab('sklad'); // Переход на страницу склада после авторизации
  };

  return (
    <div className="app">
      <nav className="top-nav">
        <a
          href="#"
          className={activeTab === 'home' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('home');
          }}
        >
          Home
        </a>
        <a
          href="#"
          className={activeTab === 'sklad' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('sklad');
          }}
        >
          Sklad
        </a>
        <a
          href="#"
          className={activeTab === 'manager' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('manager');
          }}
        >
          Manager
        </a>
      </nav>

      <main className="main">
        {activeTab === 'home' && (
          <>
            <div className="status-grid">
              <div className="status-card green">
                <h3>✅ Spring Boot Backend</h3>
                <p>Port: 8080</p>
                <a href="http://localhost:8080/actuator/health" target="_blank" rel="noreferrer">
                  Check API Health
                </a>
              </div>

              <div className="status-card green">
                <h3>✅ PostgreSQL Database</h3>
                <p>Port: 5432</p>
                <a href="http://localhost:8081" target="_blank" rel="noreferrer">
                  Open Adminer
                </a>
              </div>

              <div className="status-card green">
                <h3>✅ React Frontend</h3>
                <p>Port: 8082</p>
                <p>Build: Successful</p>
              </div>
            </div>

            <div className="instructions">
              <h3>Development Environment Status: READY ✅</h3>
              <p>All systems are operational and ready for development.</p>
            </div>
          </>
        )}

        {activeTab === 'sklad' && <Sklad />}
        {activeTab === 'manager' && <Manager onLogin={handleLoginSuccess} />}
      </main>
    </div>
  );
}

export default App;