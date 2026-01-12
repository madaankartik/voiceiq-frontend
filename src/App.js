import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import CallDetail from './pages/CallDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { LogOut } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogoutClick = () => {
    toast((t) => (
      <div className="space-y-3">
        <p className="font-semibold">Confirm Logout</p>
        <p className="text-sm">Are you sure you want to logout?</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.dismiss(t.id);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              toast.dismiss(t.id);
              logout();
              navigate('/login');
              toast.success('Logged out successfully!');
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        minWidth: '300px',
      },
    });
  };

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            VoiceIQ
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'}
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/upload">
              <Button 
                variant={location.pathname === '/upload' ? 'default' : 'ghost'}
              >
                Upload Call
              </Button>
            </Link>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/call/:id"
        element={
          <ProtectedRoute>
            <CallDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <AppRoutes />
          </main>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
