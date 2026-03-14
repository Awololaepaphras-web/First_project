
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, GraduationCap, LogOut, Shield, 
  Database, Zap, Activity, ChevronDown, 
  BookOpen, Compass, PlusCircle, Wallet, MessageSquare,
  Search, Bell, User, MoreHorizontal, Home, Tv, Library, Star,
  Sun, Moon, Megaphone, ListChecks, AtSign, Swords, Video, BarChart2,
  Award, Camera, DollarSign
} from 'lucide-react';
import StudyTimer from './StudyTimer';
import { Notification, User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType | null;
  onLogout: () => void;
  notifications?: Notification[];
  onSelectTrend: (trend: string | null) => void;
  appLogo?: string;
  onSaveConfig?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, notifications = [], onSelectTrend, appLogo, onSaveConfig }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password';

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-6 h-6" /> },
    { name: 'Explore', path: '/universities', icon: <Compass className="w-6 h-6" /> },
    { name: 'Feeds', path: '/community', icon: <Tv className="w-6 h-6" /> },
    { name: 'Tasks', path: '/tasks', icon: <ListChecks className="w-6 h-6" /> },
    ...(user?.isPremium ? [{ name: 'Messages', path: '/messages', icon: <MessageSquare className="w-6 h-6" /> }] : []),
    { name: 'Memory Bank', path: '/memory-bank', icon: <Library className="w-6 h-6" /> },
    { name: 'Proph TV', path: '/video-hub', icon: <Video className="w-6 h-6" /> },
    { name: 'Wallet', path: '/withdraw', icon: <Wallet className="w-6 h-6" /> },
    { name: 'Advertise', path: '/advertise', icon: <Megaphone className="w-6 h-6" /> },
    { name: 'Monetization', path: '/monetization', icon: <DollarSign className="w-6 h-6" /> },
  ];

  if (user) {
    navItems.push({ name: 'Premium', path: '/premium', icon: <Award className="w-6 h-6 text-yellow-500" /> });
  }

  const isAdminPage = location.pathname === '/admin';
  if (isAdminPage) {
    return <div className="min-h-screen bg-brand-black text-white selection:bg-brand-proph/30">{children}</div>;
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-brand-black text-white selection:bg-brand-proph/30">
        <main>{children}</main>
      </div>
    );
  }

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-brand-black text-white selection:bg-brand-proph/30">
        <header className="fixed top-0 left-0 right-0 bg-brand-black/90 backdrop-blur-xl z-[100] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group" title="Return Home">
              <div className="bg-brand-proph p-2 rounded-xl group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(0,186,124,0.3)] flex items-center justify-center overflow-hidden">
                {appLogo ? (
                  <img src={appLogo} alt="App Logo" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                ) : (
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                )}
              </div>
              <span className="text-lg sm:text-2xl font-black italic tracking-tighter uppercase">PROPH</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {user && (
                <>
                  <Link to="/universities" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted hover:text-white transition-all">Repositories</Link>
                  <Link to="/community" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted hover:text-white transition-all">Social Grid</Link>
                  <Link to="/premium" className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 hover:text-yellow-400 transition-all">Premium</Link>
                </>
              )}
              {user ? (
                <Link to="/dashboard" className="bg-white text-black px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-proph transition-all active:scale-95 shadow-lg" title="Go to Dashboard">Console</Link>
              ) : (
                <Link to="/login" className="bg-brand-proph text-black px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg" title="Login">Sync Node</Link>
              )}
            </nav>
            {user && (
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-brand-muted" title="Mobile Menu">
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black text-black dark:text-white flex flex-col lg:flex-row transition-colors selection:bg-brand-proph/30 overflow-x-hidden">
      {user && (
        <aside className="hidden lg:flex sticky top-0 h-screen w-[88px] xl:w-[275px] flex-col items-center xl:items-start px-3 py-4 border-r border-brand-border dark:border-brand-border z-50 bg-white dark:bg-brand-black">
            <Link to="/" className="p-4 mb-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group" title="Return Home">
              <div className="bg-brand-proph p-2.5 rounded-xl shadow-lg group-hover:rotate-6 transition-transform flex items-center justify-center overflow-hidden">
                {appLogo ? (
                  <img src={appLogo} alt="App Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <GraduationCap className="w-8 h-8 text-black" />
                )}
              </div>
            </Link>
            <nav className="flex-grow space-y-1 w-full overflow-y-auto no-scrollbar pb-10">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.name}
                  className={`flex items-center gap-4 p-3.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all w-fit xl:w-full ${
                    location.pathname === item.path ? 'font-black bg-black/5 dark:bg-white/5 text-brand-proph' : 'font-normal text-brand-muted dark:text-gray-400'
                  }`}
                >
                  {item.icon}
                  <span className="hidden xl:block text-xl italic font-bold tracking-tight">{item.name}</span>
                </Link>
              ))}
              <button onClick={() => navigate('/upload')} className="mt-8 w-full bg-brand-proph text-black h-[56px] rounded-full font-black text-lg shadow-xl shadow-brand-proph/20 hover:brightness-110 transition-all flex items-center justify-center xl:px-8 active:scale-95" title="Archive Contribution">
                <PlusCircle className="xl:hidden w-8 h-8" />
                <span className="hidden xl:block uppercase tracking-widest text-sm font-black">Archive Intel</span>
              </button>
              <button onClick={onLogout} className="mt-4 w-full flex items-center gap-4 p-3.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group" title="Logout">
                <LogOut className="w-6 h-6" />
                <span className="hidden xl:block text-xl italic font-bold tracking-tight">Logout</span>
              </button>
            </nav>
            <div className="mt-auto w-full relative">
              <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center justify-between xl:gap-3 p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all" title="User Menu">
                <div className="w-12 h-12 bg-brand-border dark:bg-brand-card rounded-full overflow-hidden flex items-center justify-center font-black text-xl text-brand-muted border border-brand-border shadow-inner flex-shrink-0">
                  {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
                <div className="hidden xl:block flex-grow min-w-0">
                  <p className="font-black text-sm truncate uppercase italic tracking-tighter">{user.name}</p>
                  <p className="text-brand-proph text-[10px] font-black uppercase tracking-widest truncate">@{user.nickname}</p>
                </div>
                < MoreHorizontal className="hidden xl:block w-5 h-5 text-brand-muted" />
              </div>
              {isProfileOpen && (
                <div className="absolute bottom-full left-0 w-64 mb-4 bg-white dark:bg-brand-card border border-brand-border rounded-[2rem] shadow-2xl p-4 animate-in slide-in-from-bottom-2 z-[60]">
                  <div className="px-4 py-3 border-b border-brand-border/50 mb-2">
                      <p className="text-[10px] font-black uppercase text-brand-muted mb-1 italic">Authenticated node</p>
                      <p className="font-black text-sm italic">{user.name}</p>
                      <p className="text-xs text-brand-proph font-black">@{user.nickname}</p>
                  </div>
                  <button onClick={() => { setIsProfileOpen(false); navigate('/settings'); }} className="w-full text-left p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3" title="Settings">
                    <User className="w-4 h-4" /> Identity Settings
                  </button>
                  <button onClick={() => { setIsProfileOpen(false); navigate('/income-analysis'); }} className="w-full text-left p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3" title="Performance">
                    <BarChart2 className="w-4 h-4 text-brand-primary" /> Performance Analysis
                  </button>
                  <button onClick={() => { setIsProfileOpen(false); navigate('/monetization'); }} className="w-full text-left p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3" title="Monetization">
                    <DollarSign className="w-4 h-4 text-brand-proph" /> Revenue Syndicate
                  </button>
                  <div className="h-px bg-brand-border my-2 opacity-50" />
                  <button onClick={onLogout} className="w-full text-left p-4 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-3" title="Logout">
                    <LogOut className="w-4 h-4" /> De-Link Node
                  </button>
                </div>
              )}
            </div>
        </aside>
      )}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 lg:h-20 sticky top-0 bg-white/80 dark:bg-brand-black/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 z-40 border-b border-brand-border">
          <div className="flex items-center gap-3">
            {user && (
              <div className="lg:hidden relative">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 bg-brand-proph/10 text-brand-proph rounded-xl"
                  title="Navigation Matrix"
                >
                  <Database className="w-5 h-5" />
                </button>
                {isMobileMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-brand-card border border-brand-border rounded-[2rem] shadow-2xl p-4 animate-in slide-in-from-top-2 z-[60]">
                    <div className="space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                            location.pathname === item.path ? 'bg-brand-proph/10 text-brand-proph font-black' : 'text-brand-muted'
                          }`}
                        >
                          {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                          <span className="text-sm font-black uppercase tracking-widest italic">{item.name}</span>
                        </Link>
                      ))}
                      <div className="h-px bg-brand-border my-2 opacity-50" />
                      <Link
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-2xl text-brand-muted hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-widest italic">Settings</span>
                      </Link>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-widest italic text-left">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter truncate">
               {location.pathname === '/community' ? 'Social Stream' : 
                location.pathname.split('/')[1]?.replace('-', ' ').toUpperCase() || 'VAULT CORE'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             {user && !user.isPremium && (
               <Link to="/premium" className="hidden sm:flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-yellow-500/20">
                 <Award className="w-4 h-4" /> Go Premium
               </Link>
             )}
             <button onClick={() => setIsDark(!isDark)} className="p-2.5 bg-black/5 dark:bg-white/5 rounded-full text-brand-muted hover:text-white transition-all" title="Toggle Mode">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             {user && (
               <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 sm:p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full relative" title="Notifications">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-brand-black" />}
              </button>
             )}
          </div>
        </header>
        <main className="flex-grow pb-24 lg:pb-0 overflow-y-auto custom-scrollbar min-h-[100dvh]">{children}</main>
      </div>
      {user && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-brand-black/95 backdrop-blur-xl border-t border-brand-border z-50 flex items-center h-16 sm:h-20 px-4 overflow-x-auto no-scrollbar gap-2 pb-[env(safe-area-inset-bottom,0px)]">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.path} to={item.path} className={`p-3 rounded-2xl transition-all flex-shrink-0 flex items-center gap-2 ${location.pathname === item.path ? 'text-brand-proph bg-brand-proph/10' : 'text-brand-muted hover:text-gray-900'}`} title={item.name}>
              {React.cloneElement(item.icon as React.ReactElement, { className: 'w-6 h-6' })}
              {location.pathname === item.path && <span className="text-[10px] font-black uppercase tracking-widest italic">{item.name}</span>}
            </Link>
          ))}
          
          {/* Admin Controlled Logo */}
          <div className="flex-shrink-0 px-2">
            <div className="w-10 h-10 rounded-xl bg-brand-proph/10 flex items-center justify-center overflow-hidden border border-brand-proph/20">
              {appLogo ? (
                <img src={appLogo} alt="App Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Database className="w-5 h-5 text-brand-proph" />
              )}
            </div>
          </div>

          {navItems.slice(4).map((item) => (
            <Link key={item.path} to={item.path} className={`p-3 rounded-2xl transition-all flex-shrink-0 flex items-center gap-2 ${location.pathname === item.path ? 'text-brand-proph bg-brand-proph/10' : 'text-brand-muted hover:text-gray-900'}`} title={item.name}>
              {React.cloneElement(item.icon as React.ReactElement, { className: 'w-6 h-6' })}
              {location.pathname === item.path && <span className="text-[10px] font-black uppercase tracking-widest italic">{item.name}</span>}
            </Link>
          ))}
        </nav>
      )}
      {user && <StudyTimer />}
      {user && (user.role === 'admin' || user.role === 'sub-admin') && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-[100]">
          {onSaveConfig && (
            <button 
              onClick={onSaveConfig}
              className="p-4 bg-green-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group relative"
              title="Save System Config"
            >
              <Database className="w-8 h-8" />
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Sync System
              </span>
            </button>
          )}
          <button 
            onClick={() => navigate('/admin')}
            className="p-4 bg-red-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group relative"
            title="Admin Dashboard"
          >
            <Shield className="w-8 h-8" />
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Admin Console
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;
