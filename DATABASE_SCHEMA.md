\# Database Schema – ServiceHub



\## 1. Users Collection

\- userId (string)

\- name (string)

\- email (string)

\- role (user/provider)

\- createdAt (timestamp)



\## 2. Providers Collection

\- providerId (string)

\- name (string)

\- category (plumber, electrician, etc.)

\- rating (number)

\- availability (boolean)



\## 3. Bookings Collection

\- bookingId (string)

\- userId (string)

\- providerId (string)

\- status (pending/accepted/completed)

\- date (timestamp)



\## Relationships

\- User → Booking (1:N)

\- Provider → Booking (1:N)



\## Notes

Firestore is used for real-time updates and scalability.

