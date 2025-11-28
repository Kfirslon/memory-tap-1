# Memory Tap Setup Guide

This guide will walk you through setting up Memory Tap from scratch, including all required API keys and configuration.

---

## 🔑 Required API Keys & Credentials

You'll need the following credentials to run Memory Tap:

### 1. ✅ Supabase (Already Configured)
- **Supabase URL**: `https://gfxhvxepxcyfrefzlvvc.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (provided)
- ✅ Status: **You already have these!**

### 2. ⚠️ Groq API Key (REQUIRED - Need to Get)
- **What it's for**: AI transcription (Whisper) and intelligence (Llama 3)
- **Cost**: FREE tier available
- **Where to get it**: [console.groq.com](https://console.groq.com)

#### How to Get Groq API Key:
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account (use Google or email)
3. Once logged in, click on **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Give it a name like "Memory Tap"
6. Copy the API key (starts with `gsk_...`)
7. ⚠️ **Save it immediately** - you won't be able to see it again!

### 3. ⏳ Google OAuth (Optional - Configure Later)
- **What it's for**: "Sign in with Google" button
- **Status**: Not required initially (app works with email/password)
- **Setup instructions**: See "Google OAuth Setup" section below

---

## 📦 Installation Steps

### Step 1: Install Dependencies

Open your terminal in the memory-tap directory and run:

```bash
npm install
```

This will install all required packages including Next.js, Supabase, Groq SDK, etc.

### Step 2: Configure Environment Variables

The `.env.local` file has already been created with your Supabase credentials. You need to add your Groq API key:

1. Open `.env.local` file
2. Replace `your-groq-api-key-here` with your actual Groq API key

Your `.env.local` should look like:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gfxhvxepxcyfrefzlvvc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeGh2eGVweGN5ZnJlZnpsdnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMDQ1MjQsImV4cCI6MjA3OTg4MDUyNH0.CQRccCFcS-hnt_U-K8wEMriaaPGGspZie72T7fN52G0

# Groq AI Configuration
GROQ_API_KEY=gsk_your_actual_key_here

# Optional: Google OAuth (configure later)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
# GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 3: Set Up Supabase Database

1. Go to your Supabase Dashboard: [https://gfxhvxepxcyfrefzlvvc.supabase.co](https://supabase.com/dashboard/project/gfxhvxepxcyfrefzlvvc)

2. Navigate to **SQL Editor** (in the left sidebar)

3. Click **"New Query"**

4. Copy and paste the SQL from `supabase/schema.sql` (we'll create this file)

5. Click **"Run"** to execute the schema

This creates:
- `memories` table with all required columns
- Row Level Security (RLS) policies for user isolation
- Proper indexes for performance

### Step 4: Configure Supabase Storage

1. In Supabase Dashboard, go to **Storage** (left sidebar)

2. Click **"Create a new bucket"**

3. Configure the bucket:
   - **Name**: `memories`
   - **Public**: ❌ No (keep private)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `audio/webm`, `audio/mp4`, `audio/mpeg`

4. Click **"Create bucket"**

5. Go to bucket **Policies** and add:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload audio"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to read their own audio
   CREATE POLICY "Users can read own audio"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### Step 5: Run the Application

Start the development server:

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 🔒 Google OAuth Setup (Optional)

Google OAuth allows users to sign in with "Sign in with Google". This is optional - the app works fine with email/password authentication.

### Prerequisites
- A Google Cloud account (free)

### Steps:

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name it "Memory Tap" and click **Create**

#### 2. Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Fill in:
   - **App name**: Memory Tap
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**
5. Skip "Scopes" (click **Save and Continue**)
6. Add test users (your email) if in testing mode
7. Click **Save and Continue**

#### 3. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
3. Application type: **Web application**
4. Name: **Memory Tap Web Client**
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - Your production URL (e.g., `https://memory-tap.vercel.app`)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://gfxhvxepxcyfrefzlvvc.supabase.co/auth/v1/callback` (Supabase callback)
   - Your production callback URL
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

#### 4. Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click the toggle to enable it
4. Paste:
   - **Client ID**: from Google Cloud Console
   - **Client Secret**: from Google Cloud Console
5. Click **Save**

#### 5. Update Environment Variables

Add to your `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

#### 6. Test Google Sign-In

1. Restart your dev server (`npm run dev`)
2. Go to the login page
3. Click **"Sign in with Google"**
4. Authorize the app
5. You should be redirected back and logged in!

---

## 🧪 Testing Your Setup

### Test 1: Authentication
1. Open app at `http://localhost:3000`
2. Sign up with email/password
3. Verify you can log in

### Test 2: Audio Recording
1. Click the record button
2. Speak a test phrase (e.g., "Buy milk tomorrow at 3pm")
3. Stop recording
4. Verify it processes and appears as a memory

### Test 3: AI Processing
1. Check that the memory has:
   - ✅ Transcription (what you said)
   - ✅ Summary (concise version)
   - ✅ Category (task, reminder, idea, or note)
   - ✅ Title (short, catchy)

### Test 4: Database
1. Go to Supabase Dashboard → **Table Editor**
2. Open the `memories` table
3. Verify your memory is saved with all fields

---

## 📝 Summary of Required Passwords/Keys

| Service | What you need | Where to get it | Status |
|---------|--------------|-----------------|---------|
| **Supabase** | URL + Anon Key | Supabase Dashboard | ✅ Already provided |
| **Groq** | API Key | [console.groq.com](https://console.groq.com) | ⚠️ **Need to get** |
| **Google OAuth** | Client ID + Secret | Google Cloud Console | ⏳ Optional (configure later) |

---

## 🚨 Troubleshooting

### Error: "API Key is missing"
- Make sure `.env.local` has `GROQ_API_KEY` set
- Restart the dev server after adding the key

### Error: "Supabase connection failed"
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Verify your Supabase project is active

### Google sign-in doesn't work
- Make sure redirect URIs are correctly configured in Google Cloud Console
- Verify Google provider is enabled in Supabase
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is in `.env.local`

### Audio recording fails
- Grant microphone permissions in your browser
- Try a different browser (Chrome/Edge work best)
- Check browser console for errors

---

## 🎉 You're Ready!

Once you have:
- ✅ Installed dependencies (`npm install`)
- ✅ Added Groq API key to `.env.local`
- ✅ Set up database schema in Supabase
- ✅ Configured storage bucket
- ✅ Started dev server (`npm run dev`)

You should be able to use Memory Tap! Google OAuth can be configured anytime later.
