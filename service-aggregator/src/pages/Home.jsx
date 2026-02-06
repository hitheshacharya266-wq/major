import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Search, Wrench, Zap, Truck, ShoppingBag } from 'lucide-react';

export default function Home() {
    const categories = [
        { name: 'Plumbing', icon: Wrench, color: 'text-blue-500' },
        { name: 'Electrical', icon: Zap, color: 'text-yellow-500' },
        { name: 'Moving', icon: Truck, color: 'text-green-500' },
        { name: 'Cleaning', icon: ShoppingBag, color: 'text-pink-500' },
    ];

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 pt-10 pb-6">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                    Find Trusted Local <span className="text-primary-600">Experts</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    From plumbing to cleaning, find the right professional for your needs in minutes. Verified pros, transparent pricing.
                </p>

                <div className="max-w-md mx-auto relative flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="What service do you need?"
                        className="w-full pl-10 pr-4 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-lg transition-shadow bg-white"
                    />
                    <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6">
                        Search
                    </Button>
                </div>
            </section>

            {/* Categories */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Popular Services</h2>
                    <Link to="/services" className="text-primary-600 font-medium hover:text-primary-700">View all</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Card key={cat.name} className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow bg-white/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                                <div className={`p-4 rounded-full bg-gray-50 ${cat.color} bg-opacity-10`}>
                                    <cat.icon className={`h-8 w-8 ${cat.color}`} />
                                </div>
                                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA for Providers */}
            <section className="bg-primary-700 rounded-3xl p-8 md:p-12 text-white text-center md:text-left md:flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <h2 className="text-3xl font-bold">Are you a Service Professional?</h2>
                    <p className="text-primary-100 text-lg">
                        Join our network of expert professionals and grow your business. Get matched with customers looking for your skills.
                    </p>
                    <Link to="/register?role=provider">
                        <Button variant="secondary" size="lg" className="mt-4">
                            Join as a Professional
                        </Button>
                    </Link>
                </div>
                <div className="hidden md:block">
                    {/* Abstract shape or img could go here */}
                    <div className="bg-white/10 p-4 rounded-full backdrop-blur-md">
                        <Wrench className="h-24 w-24 text-white/80" />
                    </div>
                </div>
            </section>
        </div>
    );
}
