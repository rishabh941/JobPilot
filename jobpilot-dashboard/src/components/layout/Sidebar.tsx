import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Search, Zap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <aside className="w-64 bg-sidebar/98 backdrop-blur-2xl border-r border-sidebar-border/40 flex flex-col shadow-2xl">
      <motion.div 
        className="p-6 border-b border-sidebar-border/40 bg-gradient-to-br from-sidebar via-sidebar to-primary/5 relative overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-transparent" />
        <div className="flex items-center gap-2.5 mb-1 relative z-10">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-xl border border-primary/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-primary-foreground font-bold text-xl">J</span>
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            JobPilot
          </h1>
        </div>
        <p className="text-sm text-sidebar-foreground/80 font-semibold ml-12 tracking-wide">Job Automation</p>
      </motion.div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-smooth relative overflow-hidden group',
                  'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground hover:shadow-lg hover:scale-[1.02] hover:border-primary/20',
                  'border border-transparent',
                  isActive
                    ? 'bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-xl shadow-primary/25 scale-[1.02] border-primary/30'
                    : 'text-sidebar-foreground/75 hover:text-sidebar-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <item.icon size={20} className={isActive ? 'drop-shadow-sm' : ''} strokeWidth={2.5} />
                  </motion.div>
                  <span className="font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>
      
      <motion.div 
        className="p-4 border-t border-sidebar-border/40 bg-gradient-to-br from-sidebar-accent/20 to-primary/5 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="text-xs text-sidebar-foreground/70 space-y-1">
          <p className="font-semibold tracking-wide">Version 1.0.0</p>
          <p className="text-sidebar-foreground/60">© 2025 JobPilot</p>
        </div>
      </motion.div>
    </aside>
  );
}