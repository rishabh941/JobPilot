import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Search, Zap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/scraper', icon: Search, label: 'Scraper' },
  { to: '/autoapply', icon: Zap, label: 'Auto Apply' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar border-r-2 border-sidebar-border flex flex-col shadow-lg">
      <div className="p-6 border-b-2 border-sidebar-border bg-gradient-to-br from-sidebar to-sidebar-accent/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-bold text-lg">J</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            JobPilot
          </h1>
        </div>
        <p className="text-sm text-sidebar-foreground/70 font-medium ml-10">Job Automation</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth relative overflow-hidden group',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-[1.02]',
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg scale-[1.02]'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              )
            }
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                )}
                <item.icon size={20} className={isActive ? 'drop-shadow-sm' : ''} />
                <span className="font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t-2 border-sidebar-border bg-sidebar-accent/30">
        <div className="text-xs text-sidebar-foreground/60 space-y-1">
          <p className="font-semibold">Version 1.0.0</p>
          <p>© 2025 JobPilot</p>
        </div>
      </div>
    </aside>
  );
}