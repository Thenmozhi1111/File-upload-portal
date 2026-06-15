import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleRegister = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5000/register",
      {
        username,
        email,
        password
      }
    );

    alert(response.data.message);

    navigate("/login");

  } catch (error) {
    alert("Registration Failed");
    console.log(error);
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
          <Link to="/login">
            <button className="actives">Sign in</button>
          </Link>
          <button className="active">Sign UP</button>
          
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
  type="text"
  placeholder="Enter name"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
  type="password"
  placeholder="Enter password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>
        </div>

        <button
  className="signin-btn"
  onClick={handleRegister}>
  Sign Up
</button>


      </div>
    
  );
   </div>
  );
}

export default Register;