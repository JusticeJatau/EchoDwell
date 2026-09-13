import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo.jsx";
import { useAuthStore } from "../store/authStore.js";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  return <div className="app-shell"><header className="topbar"><Link to="/"><Logo/></Link><nav className={open ? "nav open" : "nav"}>
    <NavLink to="/properties">Find a home</NavLink><NavLink to="/how-it-works">How it works</NavLink>
    {user && <NavLink to={user.role === "platform_admin" ? "/admin" : user.role === "seeker" ? "/account" : "/dashboard"}>Dashboard</NavLink>}
    {user ? <button className="nav-button" onClick={logout}>Sign out</button> : <><NavLink to="/login">Sign in</NavLink><Link className="button small" to="/register">List a property</Link></>}
  </nav><button className="menu-button" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></header><main><Outlet/></main>
  <footer><Logo/><p>Trusted rental discovery and property management by Echo8V.</p><span>© {new Date().getFullYear()} EchoDwell</span></footer></div>;
}
