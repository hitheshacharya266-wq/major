import { useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (isAuthPage) {
        return (
            <footer className="py-3 border-t border-outline-variant/20 bg-surface text-on-surface-variant mt-auto w-full">
                <div className="max-w-container-max mx-auto px-4 sm:px-8 flex justify-between items-center text-xs">
                    <p className="text-on-surface-variant">© 2024 ServiceHub. All rights reserved.</p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-white border-t border-outline-variant/30 py-4 sm:py-5 mt-auto w-full">
            <div className="max-w-container-max mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                {/* Brand & Short Tagline */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                    <span className="font-black text-lg text-primary tracking-tight">ServiceHub</span>
                    <span className="hidden sm:inline text-outline-variant/60">•</span>
                    <p className="text-xs text-on-surface-variant font-medium">
                        Connecting households with reliable local service professionals.
                    </p>
                </div>

                {/* Social Icons & Copyright */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex gap-2">
                        <a className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-on-surface-variant" href="#" title="Global">
                            <span className="material-symbols-outlined text-[16px]">language</span>
                        </a>
                        <a className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-on-surface-variant" href="#" title="Community">
                            <span className="material-symbols-outlined text-[16px]">public</span>
                        </a>
                    </div>
                    <span className="text-[11px] font-semibold text-on-surface-variant/80">
                        © 2024 ServiceHub. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
