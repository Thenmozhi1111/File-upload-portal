import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">

      <nav className="navbar">
        <h2>📁 Drive Portal</h2>

        <div>
          <Link to="/login">
            <button className="nav-btn">Login</button>
          </Link>

          <Link to="/register">
            <button className="nav-btn register">
              Register
            </button>
          </Link>
        </div>
      </nav>

      <section className="hero">

        <div className="hero-content">
          <h1>
            Secure Cloud Storage
            For Your Documents
          </h1><br></br>

          <p className="para">
            Upload, organize, search and
            manage files with ease.
          </p><br></br>

          <div className="hero-buttons">

            <Link to="/login">
              <button className="primary">
                Get Started
              </button>
            </Link>

            <Link to="/register">
              <button className="secondary">
                Create Account
              </button>
            </Link>

          </div>

        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            alt="cloud"
          />
        </div>

      </section>

      <section className="features">

        <div className="card">
          📁
          <h3>Folder Management</h3>
          <p>Organize files efficiently</p>
        </div>

        <div className="card">
          ☁️
          <h3>Cloud Storage</h3>
          <p>Access anywhere anytime</p>
        </div>

        <div className="card">
          🔒
          <h3>Secure Access</h3>
          <p>JWT protected system</p>
        </div>

      </section>

    </div>
  );
}


export default Home;