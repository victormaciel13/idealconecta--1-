import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="app-right">
        <Topbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
