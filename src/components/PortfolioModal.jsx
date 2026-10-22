import PortfolioManager from './PortfolioManager';

const PortfolioModal = ({
    isOpen,
    onClose,
    providerId,
    portfolio = [],
    onPortfolioUpdated
}) => {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-outline-variant/30 my-auto"
            >
                <PortfolioManager
                    providerId={providerId}
                    initialPortfolio={portfolio}
                    onPortfolioUpdated={onPortfolioUpdated}
                    onClose={onClose}
                />
            </div>
        </div>
    );
};

export default PortfolioModal;
