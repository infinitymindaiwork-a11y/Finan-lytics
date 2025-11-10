<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1f3GcxVoivheRgN622DKbkqyi9ad29OQW

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure environment variables in [.env.local](.env.local):
   - `GEMINI_API_KEY`: Your Gemini API key
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
3. Run the app:
   `npm run dev`

## Supabase Configuration

To enable Google authentication:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add the following URLs to **Redirect URLs**:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `http://localhost:3002`
   - Your production URL (if deployed)

