import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Folder from "./pages/Folder";

function App() {
  return ( 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/:userId" element={<Dashboard />} />
        <Route path="/folder/:id" element={<Folder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
