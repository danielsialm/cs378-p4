import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import './App.css';


function App() {
  return (
      <>
          <nav className="navbar bg-dark">
              <div className="container-fluid">
                  <span className="appName">
                      Weather</span>
              </div>
          </nav>
          <LoginButton />
          <LogoutButton />
      </>
  );
}

export default App;
