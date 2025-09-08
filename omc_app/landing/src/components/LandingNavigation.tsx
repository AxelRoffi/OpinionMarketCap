"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, BookOpen, Target, Rocket, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Mission', href: '/mission', icon: Target },
    { name: 'How it Works', href: '/how-it-works', icon: BookOpen },
    { name: 'Tutorial', href: '/tutorial', icon: BookOpen },
  ]

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-md rounded-full border border-white/10 px-6 py-3">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105"
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
            className="text-white hover:bg-white/10"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 p-4"
            >
              <div className="space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/5"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                ))}
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="http://test.opinionmarketcap.xyz" target="_blank">
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch App
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  )
}