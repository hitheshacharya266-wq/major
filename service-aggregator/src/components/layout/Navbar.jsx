import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';

// Preliminary Navbar - will connect to AuthContext later
export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const user = null; // TODO: Get from AuthContext

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: 'Services', path: '/services' },
        { name: 'Become a Pro', path: '/register?role=provider' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-primary-600">ServiceConnect</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <Link to="/dashboard">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <User className="h-4 w-4" /> Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-2">
                            <Link to="/login" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Log in</Button>
                            </Link>
                            <Link to="/register" onClick={() => setIsOpen(false)}>
                                <Button className="w-full">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
