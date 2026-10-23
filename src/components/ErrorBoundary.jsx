import React from 'react';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an unhandled render error:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-surface p-4 text-on-surface">
                    <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-outline-variant/40 shadow-xl text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-xs">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-on-surface">Something went wrong</h2>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                            An unexpected interface error occurred while rendering this view.
                        </p>
                        {this.state.error?.message && (
                            <div className="bg-surface-container/50 p-3 rounded-xl text-[11px] font-mono text-on-surface-variant/80 text-left overflow-x-auto max-h-24">
                                {this.state.error.message}
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="inline-flex items-center justify-center gap-2 bg-[#004d4c] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#003837] transition-all shadow-md cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> Reload Page
                            </button>
                            <a
                                href="/admin-dashboard"
                                className="inline-flex items-center justify-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-outline-variant/30"
                            >
                                <Shield className="w-3.5 h-3.5 text-primary" /> Return to Admin Control Panel
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
