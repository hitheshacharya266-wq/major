import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Smart Local Service Aggregator. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
