import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const useNavigate_ = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            useNavigate_('/'); // Go to home or dashboard
        } catch (err) {
            console.error(err);
            setError('Failed to log in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold text-primary-600">Welcome Back</CardTitle>
                    <p className="text-gray-500">Sign in to access your account</p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full" isLoading={loading}>
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
