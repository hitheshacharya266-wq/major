/**
 * Realistic Mock Data for ServiceHub Admin Dashboard Preview Mode
 *
 * Used exclusively when an unauthenticated visitor or non-admin reviews the
 * Admin Dashboard design without requiring live Firebase authentication or
 * exposing any real customer or provider records.
 */

export const SAMPLE_ADMIN_DATA = {
    stats: {
        totalUsers: 248,
        activeProviders: 38,
        pendingVerifications: 5,
        totalBookings: 194,
        totalRevenue: 345000,
        openReports: 3,
        resolvedReports: 17,
        totalReviews: 112,
        averageRating: 4.8,
        systemHealth: '100% Operational'
    },

    providers: [
        {
            id: 'prov_1',
            name: 'Ramesh Electrical Works',
            email: 'ramesh.elec@servicehub.in',
            phone: '+91 98450 12345',
            category: 'Electrician',
            rating: 4.9,
            reviewCount: 42,
            city: 'Mangaluru',
            location: 'Kadri, Mangaluru',
            experience: 12,
            priceStarting: 299,
            verified: true,
            verificationStatus: 'verified',
            status: 'active',
            bio: 'Master electrician certified for commercial and residential electrical installations, wiring upgrades, and emergency repairs.',
            portfolio: [
                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80'
            ],
            joinedAt: '2025-08-14'
        },
        {
            id: 'prov_2',
            name: 'Suresh Plumbing Solutions',
            email: 'suresh.plumb@servicehub.in',
            phone: '+91 98860 98765',
            category: 'Plumber',
            rating: 4.6,
            reviewCount: 18,
            city: 'Udupi',
            location: 'Manipal, Udupi',
            experience: 8,
            priceStarting: 249,
            verified: false,
            verificationStatus: 'pending',
            status: 'active',
            bio: 'Rapid-response plumber specialized in concealed pipe leak detection, bathroom fixtures, and solar heater repairs.',
            portfolio: [
                'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'
            ],
            joinedAt: '2026-09-02'
        },
        {
            id: 'prov_3',
            name: 'Coastal Sparkle Deep Cleaning',
            email: 'sparkle.clean@servicehub.in',
            phone: '+91 97410 54321',
            category: 'Cleaning',
            rating: 4.8,
            reviewCount: 31,
            city: 'Mangaluru',
            location: 'Bejai, Mangaluru',
            experience: 6,
            priceStarting: 799,
            verified: true,
            verificationStatus: 'verified',
            status: 'active',
            bio: 'Eco-friendly residential & commercial deep cleaning, sofa shampooing, and kitchen sanitation services.',
            portfolio: [
                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
            ],
            joinedAt: '2025-11-20'
        },
        {
            id: 'prov_4',
            name: 'Cool Breeze HVAC & Refrigeration',
            email: 'coolbreeze.ac@servicehub.in',
            phone: '+91 94480 33221',
            category: 'AC Repair',
            rating: 4.7,
            reviewCount: 24,
            city: 'Hassan',
            location: 'BM Road, Hassan',
            experience: 10,
            priceStarting: 499,
            verified: true,
            verificationStatus: 'verified',
            status: 'active',
            bio: 'Expert split & inverter AC jet servicing, compressor diagnostics, and Freon gas charging specialists.',
            portfolio: [
                'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80'
            ],
            joinedAt: '2026-01-15'
        },
        {
            id: 'prov_5',
            name: 'Vibrant Walls & Texture Painting',
            email: 'vibrantwalls@servicehub.in',
            phone: '+91 96110 77889',
            category: 'Painter',
            rating: 4.2,
            reviewCount: 15,
            city: 'Mangaluru',
            location: 'Kankanady, Mangaluru',
            experience: 7,
            priceStarting: 1200,
            verified: true,
            verificationStatus: 'verified',
            status: 'suspended',
            suspensionReason: 'Customer contract billing dispute under administrative review.',
            suspensionDate: '2026-10-22',
            bio: 'Interior and exterior emulsion painting, stencil designs, and waterproof wall coatings.',
            portfolio: [],
            joinedAt: '2025-06-10'
        },
        {
            id: 'prov_6',
            name: 'WoodCraft Furniture & Repairs',
            email: 'woodcraft.udupi@servicehub.in',
            phone: '+91 99000 44556',
            category: 'Carpenter',
            rating: 5.0,
            reviewCount: 9,
            city: 'Udupi',
            location: 'Kadiyali, Udupi',
            experience: 15,
            priceStarting: 349,
            verified: false,
            verificationStatus: 'pending',
            status: 'active',
            bio: 'Custom modular woodwork, door lock installation, hinge repairs, and wooden polish restorations.',
            portfolio: [
                'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80'
            ],
            joinedAt: '2026-10-05'
        }
    ],

    users: [
        {
            id: 'cust_1',
            fullName: 'Priya Sharma',
            email: 'priya.sharma@example.com',
            phone: '+91 99801 23456',
            city: 'Mangaluru',
            role: 'user',
            status: 'active',
            bookingsCount: 5,
            createdAt: '2025-09-10'
        },
        {
            id: 'cust_2',
            fullName: 'Rahul Rao',
            email: 'rahul.rao@example.com',
            phone: '+91 98450 67890',
            city: 'Udupi',
            role: 'user',
            status: 'active',
            bookingsCount: 2,
            createdAt: '2025-12-04'
        },
        {
            id: 'cust_3',
            fullName: 'Ananya Hegde',
            email: 'ananya.h@example.com',
            phone: '+91 97410 99887',
            city: 'Mangaluru',
            role: 'user',
            status: 'active',
            bookingsCount: 8,
            createdAt: '2025-07-22'
        },
        {
            id: 'cust_4',
            fullName: 'Karthik Bhat',
            email: 'karthik.bhat@example.com',
            phone: '+91 94480 11223',
            city: 'Hassan',
            role: 'user',
            status: 'active',
            bookingsCount: 1,
            createdAt: '2026-03-18'
        },
        {
            id: 'cust_5',
            fullName: 'Vikram Shenoy',
            email: 'vikram.s@example.com',
            phone: '+91 96110 55443',
            city: 'Mangaluru',
            role: 'user',
            status: 'restricted',
            restrictionReason: 'Repeated frivolous cancellations and abusive provider feedback',
            bookingsCount: 0,
            createdAt: '2026-05-30'
        }
    ],

    bookings: [
        {
            id: 'BK-8901',
            userName: 'Priya Sharma',
            userEmail: 'priya.sharma@example.com',
            userPhone: '+91 99801 23456',
            providerName: 'Ramesh Electrical Works',
            providerId: 'prov_1',
            category: 'Electrician',
            service: 'Full Home Electrical Wiring Inspection',
            date: '2026-10-24',
            time: '10:30 AM',
            totalAmount: 1850,
            status: 'confirmed',
            address: 'Flat 402, Kadri Heights, Mangaluru'
        },
        {
            id: 'BK-8902',
            userName: 'Rahul Rao',
            userEmail: 'rahul.rao@example.com',
            userPhone: '+91 98450 67890',
            providerName: 'Coastal Sparkle Deep Cleaning',
            providerId: 'prov_3',
            category: 'Cleaning',
            service: '3BHK Premium Deep Cleaning Package',
            date: '2026-10-25',
            time: '09:00 AM',
            totalAmount: 4200,
            status: 'pending',
            address: 'Laxmindra Nagar, Manipal, Udupi'
        },
        {
            id: 'BK-8903',
            userName: 'Ananya Hegde',
            userEmail: 'ananya.h@example.com',
            userPhone: '+91 97410 99887',
            providerName: 'Cool Breeze HVAC & Refrigeration',
            providerId: 'prov_4',
            category: 'AC Repair',
            service: 'Split AC Foam Wash & Pressure Gas Recharge',
            date: '2026-10-22',
            time: '02:00 PM',
            totalAmount: 2400,
            status: 'completed',
            address: 'Near BM Road circle, Hassan'
        },
        {
            id: 'BK-8904',
            userName: 'Karthik Bhat',
            userEmail: 'karthik.bhat@example.com',
            userPhone: '+91 94480 11223',
            providerName: 'Suresh Plumbing Solutions',
            providerId: 'prov_2',
            category: 'Plumber',
            service: 'Emergency Bathroom Concealed Pipe Repair',
            date: '2026-10-23',
            time: '11:00 AM',
            totalAmount: 1200,
            status: 'flagged',
            flagReason: 'Discrepancy reported regarding initial estimate vs billed amount',
            address: 'Shanthi Nagar, Hassan'
        }
    ],

    reports: [
        {
            id: 'REP-101',
            type: 'Service Quality Dispute',
            reporterName: 'Vikram Shenoy',
            reporterEmail: 'vikram.s@example.com',
            targetName: 'Vibrant Walls & Texture Painting',
            targetId: 'prov_5',
            reason: 'Incomplete primer coat on exterior wall after full contract payment was demanded.',
            status: 'open',
            priority: 'high',
            createdAt: '2026-10-22T10:15:00Z'
        },
        {
            id: 'REP-102',
            type: 'Delayed Arrival',
            reporterName: 'Ananya Hegde',
            reporterEmail: 'ananya.h@example.com',
            targetName: 'Cool Breeze HVAC & Refrigeration',
            targetId: 'prov_4',
            reason: 'Technician arrived 45 minutes past the booked slot without advance notification.',
            status: 'resolved',
            priority: 'low',
            resolutionNotes: 'Provider reprimanded and issued an apology; customer issued a 15% discount voucher.',
            createdAt: '2026-10-20T14:30:00Z'
        },
        {
            id: 'REP-103',
            type: 'Billing Discrepancy',
            reporterName: 'Karthik Bhat',
            reporterEmail: 'karthik.bhat@example.com',
            targetName: 'Suresh Plumbing Solutions',
            targetId: 'prov_2',
            reason: 'Plumbing materials were invoiced 40% above retail MRP.',
            status: 'under_review',
            priority: 'medium',
            createdAt: '2026-10-23T08:45:00Z'
        }
    ],

    reviews: [
        {
            id: 'REV-501',
            userName: 'Priya Sharma',
            providerName: 'Ramesh Electrical Works',
            providerId: 'prov_1',
            rating: 5,
            comment: 'Outstanding electrician! Fixed our tripped breaker and replaced the faulty MCB neatly within an hour.',
            createdAt: '2026-10-21T16:20:00Z',
            moderated: false
        },
        {
            id: 'REV-502',
            userName: 'Rahul Rao',
            providerName: 'Coastal Sparkle Deep Cleaning',
            providerId: 'prov_3',
            rating: 4,
            comment: 'Punctual and very thorough. The kitchen tiles and kitchen chimney look pristine.',
            createdAt: '2026-10-19T11:10:00Z',
            moderated: false
        },
        {
            id: 'REV-503',
            userName: 'Flagged Account',
            providerName: 'WoodCraft Furniture & Repairs',
            providerId: 'prov_6',
            rating: 1,
            comment: 'Abusive language and defamatory insults submitted anonymously.',
            createdAt: '2026-10-22T09:40:00Z',
            moderated: true,
            moderationReason: 'Violates platform anti-harassment community guidelines'
        }
    ],

    auditLogs: [
        {
            id: 'LOG-901',
            action: 'VERIFY_PROVIDER',
            details: 'Approved trade verification for Coastal Sparkle Deep Cleaning after background check',
            actorEmail: 'admin@servicehub.in',
            actorUid: 'adm_sys',
            timestamp: '2026-10-23T11:20:00Z'
        },
        {
            id: 'LOG-902',
            action: 'SUSPEND_PROVIDER',
            details: 'Temporarily suspended Vibrant Walls & Texture Painting pending dispute investigation',
            actorEmail: 'admin@servicehub.in',
            actorUid: 'adm_sys',
            timestamp: '2026-10-22T16:45:00Z'
        },
        {
            id: 'LOG-903',
            action: 'UPDATE_SETTINGS',
            details: 'Added Hassan to regional operating coverage and enabled automated email receipts',
            actorEmail: 'admin@servicehub.in',
            actorUid: 'adm_sys',
            timestamp: '2026-10-21T09:15:00Z'
        }
    ],

    platformConfig: {
        supportedCities: ['Mangaluru', 'Hassan', 'Udupi'],
        announcement: 'ServiceHub Regional Quality Assurance drive is active across coastal Karnataka.',
        maintenanceMode: false,
        commissionRate: 10,
        autoVerifyProviders: false
    }
};
