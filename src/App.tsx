import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Status from "./pages/Status";
import About from "./pages/About";
import './App.css';
function App() {
  return (
    <BrowserRouter>
      <h1>Home Server Control Page</h1>
      <nav>
        <Link to="/">Status</Link> | <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Status />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;