import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProviderProfile, saveProviderProfile } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import ProviderAvatar from '../components/ProviderAvatar';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { User, Wrench, MapPin, DollarSign, Award, FileText, Phone, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

const ProviderSetup = () => {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: currentUser?.displayName || userProfile?.fullName || '',
        gender: 'male', // Explicit default selection: 'male' | 'female'
        category: 'carpenter',
        experienceYears: '3',
        price: '399',
        location: 'Mangaluru',
        description: '',
        skills: 'Furniture Assembly, Door Fitting, Cabinet Repair',
        phone: '',
        photoURL: currentUser?.photoURL || ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        let isMounted = true;
        const loadExistingProfile = async () => {
            if (!currentUser) return;
            try {
                const existing = await getProviderProfile(currentUser.uid);
                if (isMounted && existing) {
                    setFormData(prev => ({
                        ...prev,
                        name: existing.name || existing.fullName || prev.name,
                        gender: existing.gender || 'male',
                        category: existing.category || prev.category,
                        experienceYears: existing.experienceYears || prev.experienceYears,
                        price: existing.price !== undefined && existing.price !== null ? String(existing.price) : prev.price,
                        location: existing.location || prev.location,
                        description: existing.description || prev.description,
                        skills: Array.isArray(existing.skills) ? existing.skills.join(', ') : (existing.skills || prev.skills),
                        phone: existing.phone || prev.phone,
                        photoURL: existing.photoURL || existing.image || prev.photoURL
                    }));
                }
            } catch (err) {
                console.error('Error fetching existing provider profile:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadExistingProfile();
        return () => { isMounted = false; };
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        // 1. Strict Name Validation: Required, Min 2 chars, Max 50 chars, Only letters/spaces/dots/hyphens
        const trimmedName = formData.name.trim();
        const nameRegex = /^[A-Za-z\s.\-']+$/;
        if (!trimmedName) {
            newErrors.name = 'Full name is required';
        } else if (trimmedName.length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        } else if (trimmedName.length > 50) {
            newErrors.name = 'Name cannot exceed 50 characters';
        } else if (!nameRegex.test(trimmedName)) {
            newErrors.name = 'Name can only contain letters, spaces, dots, or hyphens';
        }

        // 2. Gender Selection Validation
        if (!formData.gender) {
            newErrors.gender = 'Please select your gender';
        }

        // 3. Category Validation
        if (!formData.category) {
            newErrors.category = 'Please select a service category';
        }

        // 4. Price Validation: Positive Number
        if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
            newErrors.price = 'Please enter a valid price (e.g. 399)';
        }

        // 5. Location Validation
        if (!formData.location.trim()) {
            newErrors.location = 'Service area/city is required';
        }

        // 6. Description Validation: Min 10 characters
        if (!formData.description.trim() || formData.description.trim().length < 10) {
            newErrors.description = 'Please describe your services (minimum 10 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please correct the highlighted fields');
            return;
        }

        setSubmitting(true);
        try {
            const numericPrice = formData.price ? Number(formData.price) : null;

            const profileToSave = {
                ...formData,
                gender: formData.gender, // Explicit gender persisted to Firestore
                price: numericPrice,
                photoURL: formData.photoURL || '',
                image: formData.photoURL || ''
            };

            await saveProviderProfile(currentUser.uid, profileToSave);
            toast.success('Provider profile completed successfully! 🎉');
            navigate('/provider-dashboard');
        } catch (err) {
            console.error('Error saving provider profile:', err);
            toast.error(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <LoadingSpinner text="Loading provider setup..." />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-sans text-on-surface">
                <main className="flex-1 w-full max-w-container-max mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col items-center justify-center">
                    {/* Centered Form Wrapper Card */}
                    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-outline-variant/40 shadow-xl space-y-6 sm:space-y-8">
                        
                        {/* Centered Header & Step Badge */}
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs border border-primary/20">
                                <Wrench className="w-6 h-6" />
                            </div>
                            <span className="inline-block px-3.5 py-1 bg-surface-container text-primary text-xs font-extrabold rounded-full border border-outline-variant/30">
                                Step 1 of 1
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                                Complete Your Provider Profile
                            </h1>
                            <p className="text-xs sm:text-sm text-on-surface-variant font-medium max-w-md mx-auto leading-relaxed">
                                Set up your official ServiceHub professional profile. This information will be visible to potential customers looking for local service experts.
                            </p>
                        </div>

                        {/* Setup Form */}
                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                            
                            {/* Live Avatar Preview Badge */}
                            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-4">
                                <ProviderAvatar
                                    name={formData.name || 'Provider'}
                                    gender={formData.gender}
                                    category={formData.category}
                                    photoURL={formData.photoURL}
                                    size="lg"
                                    showCategoryBadge
                                />
                                <div className="space-y-0.5 text-left">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                        <Sparkles className="w-3.5 h-3.5" /> ServiceHub Professional Character Avatar
                                    </div>
                                    <p className="text-xs text-on-surface font-extrabold truncate max-w-[200px] sm:max-w-[300px]">
                                        {formData.name.trim() || 'Your Name Here'}
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant font-medium capitalize">
                                        Gender: <span className="font-bold text-on-surface">{formData.gender}</span> • Category: <span className="font-bold text-on-surface">{formData.category}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Full Name Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" /> Full Name / Business Name <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Dhyan Poojar / Hithesh Acharya"
                                    className={`w-full h-12 px-4 rounded-xl border ${errors.name ? 'border-error bg-error/5 text-error' : 'border-outline-variant/60'} focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs sm:text-sm font-semibold transition-all`}
                                />
                                {errors.name && <p className="text-error text-xs font-bold pt-0.5">⚠️ {errors.name}</p>}
                            </div>

                            {/* Gender Selection (Explicit Male / Female Radio Selection) */}
                            <div className="space-y-1.5">
                                <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary" /> Gender <span className="text-error">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`flex items-center justify-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${formData.gender === 'male' ? 'border-primary bg-primary/10 text-primary font-black shadow-xs' : 'border-outline-variant/60 bg-white text-on-surface-variant font-semibold hover:border-primary/50'}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-primary cursor-pointer"
                                        />
                                        <span className="text-xs sm:text-sm">Male</span>
                                    </label>
                                    <label className={`flex items-center justify-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${formData.gender === 'female' ? 'border-primary bg-primary/10 text-primary font-black shadow-xs' : 'border-outline-variant/60 bg-white text-on-surface-variant font-semibold hover:border-primary/50'}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-primary cursor-pointer"
                                        />
                                        <span className="text-xs sm:text-sm">Female</span>
                                    </label>
                                </div>
                                {errors.gender && <p className="text-error text-xs font-bold pt-0.5">⚠️ {errors.gender}</p>}
                            </div>

                            {/* Service Category & Years of Experience Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-primary" /> Service Category <span className="text-error">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs sm:text-sm font-semibold bg-white capitalize transition-all cursor-pointer"
                                    >
                                        {SERVICE_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-error text-xs font-bold pt-0.5">⚠️ {errors.category}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                        <Award className="w-4 h-4 text-primary" /> Years of Experience
                                    </label>
                                    <input
                                        type="text"
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleChange}
                                        placeholder="e.g. 3"
                                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs sm:text-sm font-semibold transition-all"
                                    />
                                </div>
                            </div>

                            {/* Base Service Charge (₹) & Primary Service Area Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary" /> Base Service Charge (₹) <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="e.g. 399"
                                        className={`w-full h-12 px-4 rounded-xl border ${errors.price ? 'border-error bg-error/5 text-error' : 'border-outline-variant/60'} focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs sm:text-sm font-semibold transition-all`}
                                    />
                                    {errors.price && <p className="text-error text-xs font-bold pt-0.5">⚠️ {errors.price}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" /> Primary Service Area / City <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Mangaluru"
                                        className={`w-full h-12 px-4 rounded-xl border ${errors.location ? 'border-error bg-error/5 text-error' : 'border-outline-variant/60'} focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs sm:text-sm font-semibold transition-all`}
                                    />
                                    {errors.location && <p className="text-error text-xs font-bold pt-0.5">⚠️ {errors.location}</p>}
                                </div>
                            </div>

                            {/* About / Professional Summary */}
                            <div className="space-y-1.5">
                                <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" /> About / Professional Summary <span className="text-error">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your experience, specialization, and services provided..."
                                    className={`w-full p-4 rounded-xl border ${errors.description ? 'border-error bg-error/5 text-error' : 'border-outline-variant/60'} focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs sm:text-sm font-medium leading-relaxed transition-all`}
                                />
                                {errors.description && <p className="text-error text-xs font-bold pt-0.5">⚠️ {errors.description}</p>}
                            </div>

                            {/* Skills & Contact Phone Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-primary" /> Skills / Services Offered
                                    </label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        placeholder="e.g. Furniture Assembly, Door Fitting"
                                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs sm:text-sm font-semibold transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" /> Contact Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. +91 98765 43210"
                                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs sm:text-sm font-semibold transition-all"
                                    />
                                </div>
                            </div>

                            {/* Submit Button (Full Width, Centered, Prominent) */}
                            <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-13 bg-primary text-on-primary rounded-xl font-black text-xs sm:text-sm hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? 'Saving Profile...' : (
                                        <>
                                            <span>Complete Profile</span> <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center justify-center gap-1.5 text-center text-[11px] sm:text-xs font-semibold text-on-surface-variant/80">
                                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>Your information is secure and will only be used to connect you with customers.</span>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default ProviderSetup;
