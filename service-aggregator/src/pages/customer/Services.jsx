import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { MapPin, Star, Filter } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { BookingModal } from '../../components/ui/BookingModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock Data
const MOCK_PROVIDERS = [
    { id: 1, name: "Rajesh Kumar", service: "Plumber", location: "Andheri, Mumbai", rating: 4.8, reviews: 120, rate: "₹500/hr" },
    { id: 2, name: "Suresh Electric", service: "Electrician", location: "Bandra, Mumbai", rating: 4.5, reviews: 85, rate: "₹400/hr" },
    { id: 3, name: "Quick Movers", service: "Moving", location: "Thane", rating: 4.2, reviews: 40, rate: "₹1500/trip" },
    { id: 4, name: "Anita Cleaning", service: "Cleaning", location: "Powai, Mumbai", rating: 4.9, reviews: 210, rate: "₹600/hr" },
    { id: 5, name: "Vikram Repairs", service: "Plumber", location: "Dadar, Mumbai", rating: 4.0, reviews: 30, rate: "₹450/hr" },
];

export default function Services() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedService, setSelectedService] = useState("All");
    const [selectedProvider, setSelectedProvider] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const filteredProviders = MOCK_PROVIDERS.filter(provider => {
        const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = selectedService === "All" || provider.service === selectedService;
        return matchesSearch && matchesService;
    });

    const services = ["All", "Plumber", "Electrician", "Moving", "Cleaning"];

    const handleBookClick = (provider) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedProvider(provider);
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Find a Service Provider</h1>
                    <p className="text-gray-500">Book trusted professionals near you.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                </div>
            </div>

            <Card className="p-4 bg-white/60 backdrop-blur-sm sticky top-20 z-10 transition-all">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <Input
                        placeholder="Search by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {services.map(s => (
                            <Button
                                key={s}
                                variant={selectedService === s ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedService(s)}
                                className="whitespace-nowrap rounded-full"
                            >
                                {s}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                    <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                                {provider.name[0]}
                            </div>
                            <div>
                                <CardTitle className="text-lg">{provider.name}</CardTitle>
                                <p className="text-sm text-gray-500">{provider.service}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="text-sm">{provider.location}</span>
                            </div>
                            <div className="flex items-center text-yellow-500">
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                <span className="font-medium text-gray-900 mr-1">{provider.rating}</span>
                                <span className="text-gray-400 text-sm">({provider.reviews} reviews)</span>
                            </div>
                            <div className="text-lg font-semibold text-primary-600">
                                {provider.rate}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleBookClick(provider)}>Book Now</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {selectedProvider && (
                <BookingModal
                    provider={selectedProvider}
                    onClose={() => setSelectedProvider(null)}
                    onSuccess={() => {
                        alert("Booking requested successfully!");
                        setSelectedProvider(null);
                        navigate('/dashboard');
                    }}
                />
            )}
        </div>
    );
}
