import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { User, Briefcase } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('customer'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'provider') {
            setRole('provider');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setError('');
        setLoading(true);

        try {
            await signup(email, password, role, name);
            navigate('/'); // Or to a generic "Dashboard"
        } catch (err) {
            console.error(err);
            setError('Failed to create account. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold text-primary-600">Create Account</CardTitle>
                    <p className="text-gray-500">Join ServiceConnect today</p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Role Selection Tabs */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div
                            onClick={() => setRole('customer')}
                            className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center justify-center transition-all ${role === 'customer' ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <User className="h-6 w-6 mb-2" />
                            <span className="font-medium text-sm">Customer</span>
                        </div>
                        <div
                            onClick={() => setRole('provider')}
                            className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center justify-center transition-all ${role === 'provider' ? 'border-secondary-500 bg-secondary-50 text-secondary-700 ring-1 ring-secondary-500' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Briefcase className="h-6 w-6 mb-2" />
                            <span className="font-medium text-sm">Service Provider</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="John Doe"
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />

                        <Button type="submit" className={`w-full ${role === 'provider' ? 'bg-secondary-500 hover:bg-secondary-600' : ''}`} isLoading={loading}>
                            Register as {role === 'provider' ? 'Professional' : 'Customer'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
