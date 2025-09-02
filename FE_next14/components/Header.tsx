'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Plus, BarChart3, User, Menu, X } from 'lucide-react';
import CreateOpinionModal from './CreateOpinionModal';

interface HeaderProps {
  onRefresh?: () => void;
}

const Header = ({ onRefresh }: HeaderProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  OpinionMarketCap
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink href="#" icon={BarChart3} active>
                  Markets
                </NavLink>
                <NavLink href="#" icon={User}>
                  Portfolio
                </NavLink>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Opinion
              </button>
              <ConnectButton />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ConnectButton />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavLink href="#" icon={BarChart3} active>
                Markets
              </MobileNavLink>
              <MobileNavLink href="#" icon={User}>
                Portfolio
              </MobileNavLink>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Opinion
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Create Opinion Modal */}
      {showCreateModal && (
        <CreateOpinionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh?.();
          }}
        />
      )}
    </>
  );
};

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  active?: boolean;
}

const NavLink = ({ href, icon: Icon, children, active = false }: NavLinkProps) => (
  <a
    href={href}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-4 h-4" />
    {children}
  </a>
);

const MobileNavLink = ({ href, icon: Icon, children, active = false }: NavLinkProps) => (
  <a
    href={href}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
      active
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    {children}
  </a>
);

export default Header;