import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Menu, X, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../Common/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isTeam, isHost } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    // Navigate to root/landing page after logout
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-github-light-gray dark:border-gray-800 bg-navara-navy/80 dark:bg-navara-navy/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Logo - Left Aligned */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="h-8 w-8 text-navara-blue" />
            </motion.div>
            <span className="text-xl font-bold text-white">
              Leaderboard
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center">
            {isAuthenticated && (
              <>
                {isTeam && (
                  <Link
                    to={`/team/${user.leaderboardId}`}
                    className={`text-sm font-medium transition-colors ${
                      isActive(`/team/${user.leaderboardId}`)
                        ? 'text-navara-blue'
                        : 'text-white hover:text-navara-blue'
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                {isHost && (
                  <Link
                    to={`/host/${user.leaderboardId}`}
                    className={`text-sm font-medium transition-colors ${
                      isActive(`/host/${user.leaderboardId}`)
                        ? 'text-navara-blue'
                        : 'text-white hover:text-navara-blue'
                    }`}
                  >
                    Host Dashboard
                  </Link>
                )}
                {user.leaderboardId && (
                  <Link
                    to={`/leaderboard/${user.leaderboardId}`}
                    className={`text-sm font-medium transition-colors ${
                      isActive(`/leaderboard/${user.leaderboardId}`)
                        ? 'text-navara-blue'
                        : 'text-white hover:text-navara-blue'
                    }`}
                  >
                    Public Board
                  </Link>
                )}
                {user.leaderboardId && (
                  <Link
                    to={`/resources/${user.leaderboardId}`}
                    className={`text-sm font-medium transition-colors ${
                      isActive(`/resources/${user.leaderboardId}`)
                        ? 'text-navara-blue'
                        : 'text-white hover:text-navara-blue'
                    }`}
                  >
                    Learning Resources
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-white" />
              ) : (
                <Sun className="h-4 w-4 text-white" />
              )}
            </Button>

            {/* User Info & Logout */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-github-dark-gray rounded-full">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-sm text-white">
                    {isTeam ? user.teamName : 'Host'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2"
                >
                  <LogOut className="h-4 w-4 text-white" />
                </Button>
              </div>
            ) : (
              <Link to="/">
                <Button size="sm" variant="primary">Get Started</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-github-light-gray dark:border-gray-800 py-4"
          >
            <div className="flex flex-col space-y-4">
              {isAuthenticated && (
                <>
                  {isTeam && (
                    <Link
                      to={`/team/${user.leaderboardId}`}
                      className="text-white hover:text-navara-blue font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {isHost && (
                    <Link
                      to={`/host/${user.leaderboardId}`}
                      className="text-white hover:text-navara-blue font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Host Dashboard
                    </Link>
                  )}
                  {user.leaderboardId && (
                    <Link
                      to={`/leaderboard/${user.leaderboardId}`}
                      className="text-white hover:text-navara-blue font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Public Board
                    </Link>
                  )}
                  {user.leaderboardId && (
                    <Link
                      to={`/resources/${user.leaderboardId}`}
                      className="text-white hover:text-navara-blue font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Learning Resources
                    </Link>
                  )}
                </>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-github-light-gray dark:border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center space-x-2"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4 text-white" />
                      <span className="text-white">Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 text-white" />
                      <span className="text-white">Light Mode</span>
                    </>
                  )}
                </Button>

                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;