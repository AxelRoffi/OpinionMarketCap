import React, { useState } from 'react';
import Link from 'next/link';
import { ConnectWallet } from '@thirdweb-dev/react';
import { Bell, Moon, Sun, Menu, X, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '../components/ui/dialog'; // Update this import path based on your file structure

const NavigationBar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Trending', href: '/trending' },
    { name: 'New', href: '/new' },
    { name: 'Categories', href: '/categories' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, this would toggle a class on the root element
  };

  return (
    <nav className="border-b border-gray-200 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center">
          <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">OpinionMarketCap</span>
              </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Create Opinion Button */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="hidden md:flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Opinion
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Opinion</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <p>Opinion creation form will go here</p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Notifications */}
            <button className="p-2 rounded-md text-gray-600 hover:text-blue-600 dark:text-gray-300">
              <Bell className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 dark:text-gray-300"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wallet Connection */}
            <div className="hidden md:block">
              <ConnectWallet theme="light" />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300"
              >
                {item.name}
              </a>
            ))}
            <div className="mt-4 px-3">
              <ConnectWallet theme="light" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="mt-4 w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Create Opinion
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Opinion</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <p>Opinion creation form will go here</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;