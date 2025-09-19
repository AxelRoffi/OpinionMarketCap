"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Rocket, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'OMC', href: '/' },
    { name: 'Mission', href: '/mission' },
    { name: 'How it Works', href: '/how-it-works' },
    { name: 'Tutorial', href: '/tutorial' },
    { name: 'Influences', href: '/influences' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">OMC</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.slice(1).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              <Link href="http://test.opinionmarketcap.xyz" target="_blank">
                <Rocket className="w-4 h-4 mr-2" />
                Launch App
              </Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              {navigation.slice(1).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-600 hover:text-blue-600 transition-colors duration-200 py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button
                asChild
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Link href="http://test.opinionmarketcap.xyz" target="_blank">
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch App
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}