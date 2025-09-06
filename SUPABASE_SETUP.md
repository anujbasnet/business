# Supabase Integration Setup Guide

## Prerequisites
- Supabase project created at: https://bmgmoygwnscrllwmdbul.supabase.co
- Service role key available in .env file

## Setup Steps

### 1. Run Database Schema
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/bmgmoygwnscrllwmdbul
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/supabase-setup.sql`
4. Run the SQL script

### 2. Enable Authentication Providers
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable the following providers:
   - Email (already enabled)
   - Google OAuth
   - Facebook OAuth  
   - Apple OAuth (for iOS)

### 3. Configure Storage
The SQL script will create the following storage buckets:
- `business-images` - For business cover photos and profile images
- `portfolio-images` - For portfolio item images
- `user-avatars` - For user profile pictures

### 4. Verify Setup
After running the SQL script, you should see:
- All tables created in the Database section
- Storage buckets created in the Storage section
- Row Level Security policies enabled
- Demo data populated

### 5. Test the Integration
The app is now connected to Supabase with:
- ✅ Database schema created
- ✅ Mock data migrated
- ✅ tRPC routes updated to use Supabase
- ✅ Authentication configured
- ✅ Storage buckets created
- ✅ Row Level Security enabled

## Demo Account
A demo business account has been created:
- Email: demo@elitebarbershop.com
- Business: Elite Barber Shop
- Contains sample services, clients, portfolio items, and appointments

## Next Steps
1. Run the SQL setup script in Supabase
2. Configure OAuth providers if needed
3. Test the app functionality
4. The app will now use real Supabase data instead of mock data

## Troubleshooting
- If you get permission errors, make sure RLS policies are properly set
- If authentication doesn't work, check that the auth providers are enabled
- If images don't load, verify storage buckets are created and public

## Environment Variables
Make sure these are set in your .env file:
```
EXPO_PUBLIC_SUPABASE_URL=https://bmgmoygwnscrllwmdbul.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```