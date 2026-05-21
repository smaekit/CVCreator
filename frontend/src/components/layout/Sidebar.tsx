import { NavLink, useNavigate } from 'react-router-dom'
import { FileText, UserCircle, LogOut, FileCheck2, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

function getUserEmail(): string {
  const token = localStorage.getItem('token')
  if (!token) return ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return (payload.sub as string) || (payload.email as string) || ''
  } catch {
    return ''
  }
}

function getUserInitials(email: string): string {
  if (!email) return '?'
  return email.slice(0, 2).toUpperCase()
}

const navItems = [
  { to: '/', label: 'My CVs', icon: FileText, end: true },
  { to: '/profile', label: 'Profile', icon: UserCircle, end: false },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-teal-600/20 text-teal-400 border-l-2 border-teal-400 pl-[calc(0.75rem-2px)]'
                : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100 border-l-2 border-transparent pl-[calc(0.75rem-2px)]'
            }`
          }
        >
          <Icon size={16} className="shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const email = getUserEmail()
  const initials = getUserInitials(email)

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--sidebar)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700">
        <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center shrink-0">
          <FileCheck2 size={14} className="text-white" />
        </div>
        <span className="font-semibold text-slate-100 tracking-tight">CVCreator</span>
      </div>

      {/* Nav */}
      <div className="flex-1 py-4 overflow-y-auto">
        <NavItems onNavigate={onNavigate} />
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-700">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md">
          <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <span className="flex-1 text-xs text-slate-400 truncate">{email || 'Account'}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            onClick={handleLogout}
            className="h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-700 shrink-0"
          >
            <LogOut size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen border-r border-slate-700 sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile — Sheet drawer */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="h-9 w-9 bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60 border-slate-700" style={{ background: 'var(--sidebar)' }}>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
