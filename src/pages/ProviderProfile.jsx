import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProviderProfile, getProviderReviews, getProviderStats } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES, formatCurrency } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import ProviderAvatar from '../components/ProviderAvatar';
import PortfolioGalleryModal from '../components/PortfolioGalleryModal';

const ProviderProfile = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('11:30 AM');
  const [selectedDate, setSelectedDate] = useState('TODAY 24');
  const [selectedService, setSelectedService] = useState('main');
  const [galleryOpen, setGalleryOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background w-full">
        <LoadingSpinner text="Loading verified provider profile..." />
      </div>
    );
  }
  
  if (!provider) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-background w-full max-w-full overflow-x-hidden">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex-1 text-center space-y-4 w-full max-w-full">
            <span className="material-symbols-outlined text-4xl text-primary mx-auto" data-icon="error">error</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-on-surface">Provider Profile Not Found</h1>
            <p className="text-xs sm:text-sm md:text-base text-on-surface-variant max-w-md mx-auto">
              We couldn't find the provider you're looking for. They may have updated their profile or is no longer listed.
            </p>
            <div>
              <Link to="/search" className="inline-flex px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-primary hover:bg-[#005655] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm">
                Browse verified providers
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

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
      <div className="min-h-screen flex flex-col bg-background text-on-surface w-full max-w-full overflow-x-hidden">
        <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 w-full max-w-full min-w-0 flex-1">
          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10 w-full max-w-full min-w-0">
            {/* Left Content Area */}
            <div className="flex-1 w-full max-w-full min-w-0 space-y-6 sm:space-y-8">
              {/* Hero / Profile Header */}
              <section className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7 w-full max-w-full min-w-0">
                <div className="relative shrink-0">
                  <ProviderAvatar 
                      name={provider.name} 
                      gender={provider.gender} 
                      category={provider.category} 
                      photoURL={provider.photoURL || provider.image} 
                      size="2xl"
                      className="!w-24 !h-24 sm:!w-32 sm:!h-32 md:!w-40 md:!h-40 !rounded-2xl overflow-hidden border-3 sm:border-4 border-white shadow-md !text-4xl sm:!text-5xl"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 bg-secondary-container text-on-secondary-container px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shadow-xs text-[11px] sm:text-xs font-bold">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span>Verified</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3 min-w-0 w-full max-w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-full max-w-full min-w-0">
                    <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-on-surface leading-snug break-words max-w-full [overflow-wrap:anywhere]">
                      {provider.name} – {category?.label || provider.category || 'Service Professional'}
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-base text-on-surface-variant mt-1 sm:mt-1.5 leading-relaxed break-words max-w-full [overflow-wrap:anywhere]">
                      Expert {category?.label || provider.category || 'Local'} Solutions in {provider.location || 'your area'} &amp; surrounding regions
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start w-full max-w-full">
                    <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-surface-container/70 rounded-full flex items-center gap-1.5 border border-outline-variant/30 text-[11px] sm:text-xs font-semibold text-on-surface max-w-full">
                      <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px] shrink-0">shield_person</span>
                      <span>Police Verified</span>
                    </span>
                    <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-surface-container/70 rounded-full flex items-center gap-1.5 border border-outline-variant/30 text-[11px] sm:text-xs font-semibold text-on-surface max-w-full">
                      <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px] shrink-0">security</span>
                      <span>Insured</span>
                    </span>
                    <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-surface-container/70 rounded-full flex items-center gap-1.5 border border-outline-variant/30 text-[11px] sm:text-xs font-semibold text-on-surface max-w-full">
                      <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px] shrink-0">workspace_premium</span>
                      <span>Community Hero</span>
                    </span>
                    {provider.phone && (
                      <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-surface-container/70 rounded-full flex items-center gap-1.5 border border-outline-variant/30 text-[11px] sm:text-xs font-semibold text-on-surface max-w-full">
                        <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px] shrink-0">phone</span>
                        <span className="truncate">{provider.phone}</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2.5 sm:gap-4 pt-3 sm:pt-3.5 border-t border-outline-variant/20 flex-wrap justify-center sm:justify-start w-full max-w-full text-xs sm:text-sm">
                    <div className="flex items-center gap-1 text-secondary">
                      <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-lg sm:text-xl text-on-surface">{displayRating ? (typeof displayRating === 'number' ? displayRating.toFixed(1) : displayRating) : 'New'}</span>
                    </div>
                    <span className="text-on-surface-variant font-medium">({provider.ratingCount || reviews.length} Reviews)</span>
                    <span className="hidden sm:inline-block h-3.5 w-px bg-outline-variant/50"></span>
                    <span className="text-on-surface-variant font-medium">{provider.experienceYears || '3+'} Years Experience</span>
                    {provider.completedJobsCount > 0 && (
                      <>
                        <span className="hidden sm:inline-block h-3.5 w-px bg-outline-variant/50"></span>
                        <span className="text-on-surface-variant font-medium">{provider.completedJobsCount} Jobs Completed</span>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* About Me */}
              <section className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-on-surface tracking-tight">About Me</h2>
                <div className="bg-surface-container-low/70 p-4 sm:p-6 lg:p-7 rounded-2xl border border-outline-variant/20 shadow-xs w-full max-w-full min-w-0 break-words">
                  <p className="text-xs sm:text-sm lg:text-base text-on-surface-variant leading-relaxed break-words [overflow-wrap:anywhere]">
                    {provider.description || 'Experienced local professional providing reliable home services in the region with verified background and certified expertise.'}
                  </p>
                </div>
              </section>

              {/* Service Portfolio */}
              {(() => {
                const portfolioImages = Array.isArray(provider?.portfolio) ? provider.portfolio : [];
                return (
                  <section className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-on-surface tracking-tight">Service Portfolio</h2>
                      {portfolioImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setGalleryOpen(true)}
                          className="text-primary font-semibold text-xs sm:text-sm hover:underline cursor-pointer"
                        >
                          View All ({portfolioImages.length})
                        </button>
                      )}
                    </div>

                    {portfolioImages.length === 0 ? (
                      <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-2 w-full max-w-full">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mx-auto text-primary/70">
                          <span className="material-symbols-outlined text-xl">photo_library</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-on-surface">No Portfolio Images Yet</h3>
                        <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium max-w-md mx-auto leading-relaxed">
                          {provider.name} has not uploaded project photos yet. Check their customer reviews below or book a consultation.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full max-w-full">
                        {portfolioImages.slice(0, 6).map((imgItem, idx) => {
                          const url = typeof imgItem === 'object' ? imgItem.url : imgItem;
                          const title = typeof imgItem === 'object' ? imgItem.title || imgItem.name : `Work Photo ${idx + 1}`;
                          return (
                            <div
                              key={idx}
                              onClick={() => setGalleryOpen(true)}
                              className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-square cursor-pointer bg-surface-container border border-outline-variant/30 shadow-xs w-full max-w-full"
                              title="Click to view in gallery"
                            >
                              <img
                                src={url}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5 sm:p-4 lg:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-white font-semibold text-xs sm:text-sm truncate">{title}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })()}

              {/* Pricing Guide */}
              <section className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-on-surface tracking-tight">Pricing Guide</h2>
                <div className="rounded-2xl border border-outline-variant/20 bg-white shadow-xs overflow-hidden w-full max-w-full min-w-0">
                  <div className="overflow-x-auto w-full max-w-full [overscroll-behavior-x:contain]">
                    <table className="w-full border-collapse text-left min-w-[340px] sm:min-w-[480px]">
                      <thead className="bg-surface-container/70 text-on-surface-variant text-[11px] sm:text-xs font-semibold uppercase tracking-wider border-b border-outline-variant/20">
                        <tr>
                          <th className="px-3.5 sm:px-6 py-3 sm:py-4">Service Category</th>
                          <th className="px-3.5 sm:px-6 py-3 sm:py-4">Base Price</th>
                          <th className="px-3.5 sm:px-6 py-3 sm:py-4">Estimated Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/15 text-xs sm:text-sm lg:text-base text-on-surface">
                        {parsedSkills.length > 0 ? (
                            parsedSkills.slice(0, 3).map((skill, index) => (
                              <tr key={index} className="hover:bg-surface-container-low/50 transition-colors">
                                <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 flex items-center gap-2.5 sm:gap-3 font-medium">
                                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl shrink-0">
                                    {index === 0 ? 'bolt' : index === 1 ? 'light_group' : 'construction'}
                                  </span>
                                  <span className="truncate">{skill}</span>
                                </td>
                                <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 font-bold text-on-surface whitespace-nowrap">
                                  {price ? formatCurrency(index ? price + index * 300 : price) : 'Varies by request'}
                                </td>
                                <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-on-surface-variant whitespace-nowrap">
                                  {index === 0 ? '45 - 60 mins' : index === 1 ? '1 - 2 hours' : '4 - 6 hours'}
                                </td>
                              </tr>
                            ))
                        ) : (
                            <tr className="hover:bg-surface-container-low/50 transition-colors">
                              <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 flex items-center gap-2.5 sm:gap-3 font-medium">
                                <span className="material-symbols-outlined text-primary text-lg sm:text-xl shrink-0">construction</span>
                                <span>General Service</span>
                              </td>
                              <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 font-bold text-on-surface whitespace-nowrap">
                                {price ? formatCurrency(price) : 'Price not available'}
                              </td>
                              <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-on-surface-variant whitespace-nowrap">1 - 2 hours</td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Verified Reviews */}
              <section className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-on-surface tracking-tight">Verified Reviews</h2>
                <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0">
                  {reviews.length > 0 ? (
                      reviews.map((review, i) => (
                        <div key={i} className="bg-white/90 backdrop-blur-md border border-outline-variant/30 p-4 sm:p-5 lg:p-6 rounded-2xl flex gap-3 sm:gap-4 items-start shadow-xs hover:shadow-md transition-all w-full max-w-full min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-primary-container/20 flex items-center justify-center font-bold text-primary shrink-0 text-xs sm:text-sm lg:text-base">
                            {review.customerName?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0 w-full max-w-full">
                            <div className="flex justify-between items-center flex-wrap gap-1.5 sm:gap-2">
                              <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-on-surface truncate">{review.customerName || 'Verified Customer'}</h4>
                              <div className="flex text-secondary items-center shrink-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} className="material-symbols-outlined text-base sm:text-lg lg:text-xl" style={{ fontVariationSettings: star <= (review.rating || 5) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm lg:text-base italic text-on-surface/90 leading-relaxed break-words [overflow-wrap:anywhere]">"{review.comment}"</p>
                            <p className="text-[11px] sm:text-xs text-on-surface-variant pt-1 flex items-center gap-1 sm:gap-1.5 font-medium flex-wrap">
                                <span>{review.createdAt ? (typeof review.createdAt.toDate === 'function' ? review.createdAt.toDate().toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()) : 'Recent'}</span>
                                <span>•</span>
                                <span className="text-secondary font-semibold">Verified Booking</span>
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                      <div className="bg-surface-container-low/60 p-6 sm:p-8 lg:p-10 rounded-2xl border border-outline-variant/20 text-center space-y-2 sm:space-y-2.5 w-full max-w-full min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline-variant">
                            <span className="material-symbols-outlined text-xl sm:text-2xl">chat_bubble</span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base lg:text-lg text-on-surface">No Reviews Yet</h3>
                          <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto">This provider is new or hasn't received any customer reviews yet.</p>
                      </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Booking Widget */}
            <aside className="w-full lg:w-[400px] shrink-0 max-w-full min-w-0">
              <div className="lg:sticky lg:top-24 bg-white/95 backdrop-blur-md p-4 sm:p-6 lg:p-7 rounded-2xl border border-primary/20 shadow-xl space-y-4 sm:space-y-5 w-full max-w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-on-surface">Instant Booking</h3>
                  <div className="px-2.5 py-1 bg-secondary-container/30 text-secondary text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-2xs shrink-0">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    <span>Available Now</span>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <div className="space-y-1 sm:space-y-1.5 w-full max-w-full">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Select Service Type</label>
                    <select 
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full bg-surface-container-low/80 border border-outline-variant/40 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none cursor-pointer"
                    >
                      <option value="main">{parsedSkills[0] || 'General Repair'} {price ? `(${formatCurrency(price)})` : ''}</option>
                      {parsedSkills[1] && <option value="skill1">{parsedSkills[1]} {price ? `(${formatCurrency(price + 300)})` : ''}</option>}
                      <option value="custom">Custom Request</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-1.5 w-full max-w-full">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Preferred Date</label>
                    <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 w-full max-w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {['TODAY 24', 'MON 25', 'TUE 26', 'WED 27'].map((dateStr) => {
                          const [dayStr, dateNum] = dateStr.split(' ');
                          const isSelected = selectedDate === dateStr;
                          return (
                              <button 
                                key={dateStr} 
                                type="button"
                                onClick={() => setSelectedDate(dateStr)}
                                className={`flex-1 min-w-[64px] sm:min-w-[72px] px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'border-primary bg-primary text-white shadow-sm' 
                                    : 'border-outline-variant/30 hover:border-primary text-on-surface bg-surface-container-lowest/50'
                                }`}
                              >
                                  <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/90' : 'text-on-surface-variant'}`}>{dayStr}</p>
                                  <p className="text-sm sm:text-base font-black leading-tight mt-0.5">{dateNum}</p>
                              </button>
                          );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-1.5 w-full max-w-full">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Select Time Slot</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-full">
                      {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(slot => (
                        <button 
                          key={slot} 
                          type="button"
                          onClick={() => setSelectedSlot(slot)} 
                          className={`py-2 sm:py-2.5 px-2 sm:px-3 border rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center truncate ${
                            selectedSlot === slot 
                              ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs' 
                              : 'border-outline-variant/30 hover:border-primary bg-surface-container-lowest/50 text-on-surface'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3.5 sm:pt-4 border-t border-outline-variant/20 space-y-2.5 sm:space-y-3 w-full max-w-full">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-medium gap-2">
                    <span className="text-on-surface-variant">Consultation Fee</span>
                    <span className="font-bold text-on-surface shrink-0">₹99</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 gap-2">
                    <span className="text-sm sm:text-base lg:text-lg font-bold text-on-surface">Total Due</span>
                    <span className="text-xl sm:text-2xl font-black text-primary shrink-0">{price ? formatCurrency(price + 99) : 'TBD'}</span>
                  </div>
                  <Link 
                    to={`/checkout/${provider.id}`} 
                    className="w-full py-3 sm:py-3.5 lg:py-4 px-4 sm:px-6 bg-primary hover:bg-[#005655] text-white rounded-xl font-bold text-sm sm:text-base lg:text-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex justify-center items-center text-center cursor-pointer"
                  >
                    Book Appointment
                  </Link>
                </div>
                
                <div className="bg-surface-container-high/40 p-3 sm:p-3.5 rounded-xl flex items-center gap-2.5 sm:gap-3 border border-outline-variant/20 w-full max-w-full">
                  <span className="material-symbols-outlined text-secondary text-lg sm:text-xl shrink-0">lock</span>
                  <p className="text-[11px] sm:text-xs text-on-surface-variant leading-snug">Your booking is protected by ServiceHub Guarantee.</p>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Full Portfolio Gallery Lightbox Modal */}
        <PortfolioGalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          images={Array.isArray(provider?.portfolio) ? provider.portfolio : []}
          providerName={provider.name}
        />

        <Footer />
      </div>
    </PageTransition>
  );
};

export default ProviderProfile;


