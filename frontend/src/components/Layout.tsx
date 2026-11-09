import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Activity, Bell, BookOpen, ChevronDown, CircleHelp, FileChartColumn, FolderGit2, History, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, X } from 'lucide-react'
import { clearSession, DEMO_MODE, getStoredUser } from '../lib/api'

const nav = [
  { label: 'WORKSPACE', items: [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/app/history', label: 'Analysis History', icon: History },
    { to: '/app/rules', label: 'Quality Rules', icon: ShieldCheck },
    { to: '/app/reports', label: 'Reports', icon: FileChartColumn },
  ]},
  { label: 'PREFERENCES', items: [
    { to: '/app/settings', label: 'Settings', icon: Settings },
    { to: '/app/docs', label: 'Documentation', icon: BookOpen },
  ]},
]
export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = getStoredUser()
  const displayName = user?.name || 'GateGuard user'
  const initials = displayName.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()
  const title = nav.flatMap(g => g.items).find(n => location.pathname.startsWith(n.to))?.label || 'Workspace'
  return <div className="app-shell">
    {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setOpen(false)}/>}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={21}/></div><span>Gate<span className="brand-accent">Guard</span></span><button className="mobile-close" onClick={() => setOpen(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">GG</div><div><b>Personal Workspace</b><small>{DEMO_MODE ? 'Demo mode' : 'Connected workspace'}</small></div><ChevronDown size={15}/></div>
      <nav className="side-nav">{nav.map(group => <div key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => { const Icon = item.icon; return <NavLink onClick={() => setOpen(false)} key={item.to} to={item.to} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{item.label}</span>{item.label === 'Projects' && <span className="nav-count">4</span>}</NavLink> })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Need a hand?</b><p>Explore the docs to get started with GateGuard.</p><NavLink to="/app/docs">Open documentation ↗</NavLink></div><div className="user-mini"><div className="avatar">{initials}</div><div><b>{displayName}</b><small>{user?.email || 'Signed in'}</small></div><button type="button" aria-label="Sign out" title="Sign out" onClick={() => { clearSession(); navigate('/auth/login', { replace: true }) }}><LogOut size={15}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="menu-toggle" onClick={() => setOpen(true)}><Menu size={20}/></button><div className="breadcrumb"><span>Workspace</span><b>/</b>{title}</div><div className="topbar-actions"><label className="top-search"><Search size={16}/><input placeholder="Search anything…"/><kbd>⌘ K</kbd></label><button className="icon-button" aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">{initials}</div></div></header>
      <div className="page-content"><Outlet/></div>
      <footer className="app-footer"><span>© 2026 GateGuard</span><span><Activity size={13}/> All systems operational · {DEMO_MODE ? 'Demo environment' : 'Connected API'}</span></footer>
    </main>
  </div>
}