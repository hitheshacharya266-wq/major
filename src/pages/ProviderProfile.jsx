import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProviderProfile, getProviderReviews, getProviderStats } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES, formatCurrency } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import ProviderAvatar from '../components/ProviderAvatar';

const ProviderProfile = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('11:30 AM');

  useEffect(() => {
    let isMounted = true;

    const fetchProviderData = async () => {
        try {
            const data = await getProviderProfile(id);
            if (!data) {
                if (isMounted) {
                    setProvider(null);
                    setLoading(false);
                }
                return;
            }

            let revs = [];
            let st = { completedJobsCount: 0, rating: null, ratingCount: 0 };

            try {
                revs = await getProviderReviews(id);
            } catch (revErr) {
                console.warn('Error loading provider reviews:', revErr);
            }

            try {
                // Do not query protected bookings for public visitors
                st = await getProviderStats(id, false);
            } catch (stErr) {
                console.warn('Error loading provider stats:', stErr);
            }

            if (isMounted) {
                setProvider({
                    ...data,
                    id: data.uid || data.id,
                    rating: st.rating ?? data.rating ?? null,
                    ratingCount: st.ratingCount ?? data.ratingCount ?? (revs ? revs.length : 0),
                    completedJobsCount: data.completedJobsCount ?? data.completedJobs ?? st.completedJobsCount ?? 0
                });
                setReviews(revs || []);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error loading provider profile:', err);
            if (isMounted) {
                setProvider(null);
                setLoading(false);
            }
        }
    };
    fetchProviderData();
    return () => {
        isMounted = false;
    };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><LoadingSpinner text="Loading verified provider profile..." /></div>;
  
  if (!provider) return <PageTransition><div className="min-h-screen flex flex-col bg-background"><main className="max-w-container-max mx-auto px-lg py-24 flex-1 text-center space-y-4"><span className="material-symbols-outlined text-4xl text-primary mx-auto" data-icon="error">error</span><h1 className="font-headline-lg text-headline-lg text-on-surface">Provider Profile Not Found</h1><Link to="/search" className="inline-flex px-lg py-3 rounded-xl bg-primary text-white font-label-md">Browse verified providers</Link></main><Footer /></div></PageTransition>;

  const category = SERVICE_CATEGORIES.find(item => String(item.id).toLowerCase() === String(provider.category || '').toLowerCase());
  
  let parsedSkills = [];
  if (Array.isArray(provider.skills)) {
      parsedSkills = provider.skills;
  } else if (typeof provider.skills === 'string' && provider.skills.trim()) {
      parsedSkills = provider.skills.split(',').map(s => s.trim());
  }
  
  const price = provider.price;
  
  const displayRating = provider.rating && provider.ratingCount > 0 ? provider.rating : null;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <main className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-6 lg:gap-10 w-full min-w-0">
          {/* Left Content Area */}
          <div className="flex-1 space-y-8 min-w-0 w-full">
            {/* Hero / Profile Header */}
            <section className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/20 shadow-sm w-full min-w-0">
              <div className="relative shrink-0">
                <ProviderAvatar 
                    name={provider.name} 
                    gender={provider.gender} 
                    category={provider.category} 
                    photoURL={provider.photoURL || provider.image} 
                    className="!w-32 !h-32 md:!w-40 md:!h-40 !rounded-xl overflow-hidden border-4 border-white shadow-md !text-5xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-label-sm text-label-sm">Verified</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 min-w-0 w-full flex flex-col items-center md:items-start text-center md:text-left">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface break-words">{provider.name} - {category?.label || provider.category || 'Service Professional'}</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">Expert {category?.label || provider.category || 'Local'} Solutions in {provider.location || 'your area'} & surrounding regions</p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-md py-1 bg-surface-container rounded-full flex items-center gap-2 border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary text-[18px]">shield_person</span>
                    <span className="font-label-md text-label-md">Police Verified</span>
                  </span>
                  <span className="px-md py-1 bg-surface-container rounded-full flex items-center gap-2 border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary text-[18px]">security</span>
                    <span className="font-label-md text-label-md">Insured</span>
                  </span>
                  <span className="px-md py-1 bg-surface-container rounded-full flex items-center gap-2 border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
                    <span className="font-label-md text-label-md">Community Hero</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/20 flex-wrap justify-center md:justify-start w-full">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-headline-md text-headline-md">{displayRating ? displayRating : 'New'}</span>
                  </div>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">({provider.ratingCount || reviews.length} Reviews)</span>
                  <span className="hidden sm:block h-4 w-[1px] bg-outline-variant/50 mx-md"></span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">{provider.experienceYears || '3+'} Years Experience</span>
                </div>
              </div>
            </section>

            {/* About Me */}
            <section className="space-y-4 w-full min-w-0">
              <h2 className="font-headline-md text-headline-md text-on-surface">About Me</h2>
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 w-full min-w-0 break-words">
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{provider.description || 'Experienced local professional providing reliable home services.'}</p>
              </div>
            </section>

            {/* Service Portfolio */}
            <section className="space-y-4 w-full min-w-0">
              <div className="flex justify-between items-end">
                <h2 className="font-headline-md text-headline-md text-on-surface">Service Portfolio</h2>
                <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                {/* Visual UI styling preserved. Not real data images as none are stored in schema, keeping the layout valid. */}
                <div className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer bg-surface-container border border-outline-variant/30">
                  <div className="w-full h-full bg-surface-variant flex flex-col items-center justify-center text-outline-variant transition-transform duration-500 group-hover:scale-110">
                    <span className="material-symbols-outlined text-4xl mb-2">home_repair_service</span>
                    <span className="font-label-sm">Portfolio Image</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-label-md">Past Work</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer bg-surface-container border border-outline-variant/30">
                  <div className="w-full h-full bg-surface-variant flex flex-col items-center justify-center text-outline-variant transition-transform duration-500 group-hover:scale-110">
                    <span className="material-symbols-outlined text-4xl mb-2">build</span>
                    <span className="font-label-sm">Portfolio Image</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-label-md">Professional Service</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer bg-surface-container border border-outline-variant/30">
                  <div className="w-full h-full bg-surface-variant flex flex-col items-center justify-center text-outline-variant transition-transform duration-500 group-hover:scale-110">
                    <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                    <span className="font-label-sm">Portfolio Image</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-label-md">Verified Results</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing Table */}
            <section className="space-y-4 w-full min-w-0">
              <h2 className="font-headline-md text-headline-md text-on-surface">Pricing Guide</h2>
              <div className="overflow-x-auto border border-outline-variant/20 rounded-xl bg-surface-container-lowest shadow-sm w-full min-w-0">
                <table className="w-full border-collapse text-left min-w-[500px]">
                  <thead className="bg-surface-container text-on-surface-variant font-label-md text-label-md">
                    <tr>
                      <th className="p-lg">Service Category</th>
                      <th className="p-lg">Base Price</th>
                      <th className="p-lg">Estimated Time</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface">
                    {parsedSkills.length > 0 ? (
                        parsedSkills.slice(0, 3).map((skill, index) => (
                          <tr key={index} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                            <td className="p-lg flex items-center gap-md">
                              <span className="material-symbols-outlined text-primary">{index === 0 ? 'bolt' : index === 1 ? 'light_group' : 'construction'}</span>
                              {skill}
                            </td>
                            <td className="p-lg font-bold">{price ? formatCurrency(index ? price + index * 300 : price) : 'Varies by request'}</td>
                            <td className="p-lg text-on-surface-variant">{index === 0 ? '45 - 60 mins' : index === 1 ? '1 - 2 hours' : '4 - 6 hours'}</td>
                          </tr>
                        ))
                    ) : (
                        <tr className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                            <td className="p-lg flex items-center gap-md">
                              <span className="material-symbols-outlined text-primary">construction</span>
                              General Service
                            </td>
                            <td className="p-lg font-bold">{price ? formatCurrency(price) : 'Price not available'}</td>
                            <td className="p-lg text-on-surface-variant">1 - 2 hours</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Reviews */}
            <section className="space-y-4 w-full min-w-0">
              <h2 className="font-headline-md text-headline-md text-on-surface">Verified Reviews</h2>
              <div className="space-y-4 w-full min-w-0">
                {reviews.length > 0 ? (
                    reviews.map((review, i) => (
                      <div key={i} className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-lg rounded-xl flex gap-md items-start shadow-sm transition-all hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center font-bold text-primary shrink-0">
                          {review.customerName?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0 w-full">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <h4 className="font-label-md text-label-md">{review.customerName || 'Verified Customer'}</h4>
                            <div className="flex text-secondary scale-75 origin-right">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: star <= (review.rating || 5) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                              ))}
                            </div>
                          </div>
                          <p className="font-body-md text-body-md italic text-on-surface">"{review.comment}"</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant pt-xs">
                              {review.createdAt ? (typeof review.createdAt.toDate === 'function' ? review.createdAt.toDate().toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()) : 'Recent'} • Verified Booking
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                    <div className="bg-surface-container-low p-xl rounded-xl border border-outline-variant/10 text-center space-y-2">
                        <span className="material-symbols-outlined text-4xl text-outline-variant">chat_bubble</span>
                        <h3 className="font-headline-md text-on-surface">No Reviews Yet</h3>
                        <p className="font-body-sm text-on-surface-variant">This provider is new or hasn't received any reviews.</p>
                    </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Booking Widget */}
          <aside className="w-full lg:w-[380px] shrink-0 space-y-6">
            <div className="lg:sticky lg:top-24 bg-white/80 backdrop-blur-md p-xl rounded-xl border border-primary/20 shadow-xl space-y-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">Instant Booking</h3>
                <div className="px-2 py-1 bg-secondary-container/30 text-secondary font-label-sm text-label-sm rounded-lg flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  Available Now
                </div>
              </div>
              
              <div className="space-y-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Select Service Type</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-md py-lg font-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                    <option>{parsedSkills[0] || 'Minor Repair'} {price ? `(${formatCurrency(price)})` : ''}</option>
                    {parsedSkills[1] && <option>{parsedSkills[1]} {price ? `(${formatCurrency(price + 300)})` : ''}</option>}
                    <option>Custom Request</option>
                  </select>
                </div>
                
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Preferred Date</label>
                  <div className="flex gap-sm overflow-x-auto pb-sm [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full cursor-grab active:cursor-grabbing">
                    {['TODAY 24', 'MON 25', 'TUE 26', 'WED 27'].map((dateStr, index) => {
                        const [dayStr, dateNum] = dateStr.split(' ');
                        return (
                            <button key={dateStr} className={`flex-shrink-0 px-md py-md rounded-xl border ${index === 0 ? 'border-primary bg-primary text-white' : 'border-outline-variant/30 hover:border-primary text-on-surface bg-transparent'} text-center min-w-[70px] transition-all`}>
                                <p className="text-xs uppercase">{dayStr}</p>
                                <p className="font-bold">{dateNum}</p>
                            </button>
                        );
                    })}
                  </div>
                </div>
                
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Select Time Slot</label>
                  <div className="grid grid-cols-2 gap-sm">
                    {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-md border rounded-lg font-label-md transition-all ${selectedSlot === slot ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-outline-variant/30 hover:border-primary bg-transparent text-on-surface'}`}>{slot}</button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-lg border-t border-outline-variant/20 space-y-md">
                <div className="flex justify-between font-label-md">
                  <span className="text-on-surface-variant">Consultation Fee</span>
                  <span>₹99</span>
                </div>
                <div className="flex justify-between font-headline-md">
                  <span>Total Due</span>
                  <span className="text-primary">{price ? formatCurrency(price + 99) : 'TBD'}</span>
                </div>
                <Link to={`/checkout/${provider.id}`} className="w-full py-xl bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-headline-md shadow-lg transform active:scale-95 transition-all duration-200 flex justify-center items-center">
                  Book Appointment
                </Link>
              </div>
              
              <div className="bg-surface-container-high/50 p-md rounded-xl flex items-center gap-md">
                <span className="material-symbols-outlined text-secondary">lock</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Your booking is protected by ServiceHub Guarantee.</p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </PageTransition>
  );
};

export default ProviderProfile;
