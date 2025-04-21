import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import _OrdersPage from "./pages/_OrdersPage"   ;
//github = :(
;

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem" }}>
        <Link to="/">Home</Link> | <Link to="/admin">Admin</Link> | <Link to="/orders">Orders</Link>
      </nav>
 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/orders" element={<OrdersPage />} /> {/* ✅ NEW! */}
        <Route path="*" element={<p>404 – Page Not Found</p>} />
      </Routes>
    </Router>   
  );
}
