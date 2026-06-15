import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css"

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = async () => {
    console.log("Login button clicked");
    console.log(email,password);

  try {

    const res = await axios.post(
      "http://localhost:5000/login",
      {
        email,
        password
      }
    );

localStorage.setItem(
  "userId",
  res.data.id
);

localStorage.setItem(
  "role",
  res.data.role
);

localStorage.setItem(
  "username",
  res.data.username
);
  window.alert("login successful");
    navigate(`/dashboard/${res.data.id}`);

  } catch (error) {

  console.log(error);

  if (error.response) {

    console.log(error.response.data);

    alert(error.response.data.message);

  } else {

    alert("Login Failed");

  }

}

};

  return (
    <div className="container">
      <div className="card">

        <div className="logo">
          📁
        </div>

        <h1>Drive Portal</h1>

        <p className="subtitle">
          Secure file management & sharing
        </p>

        <div className="tabs">
          <button className="active">Sign in</button>
          <Link to="/register">
            <button>Sign Up</button>
          </Link>
        </div>
      <form>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          className="signin-btn"
          onClick={handleLogin}>
            Sign In
        </button>
        
      </form>
        

       </div>
    
    );
  </div>
  );
}

export default Login;