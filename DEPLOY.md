# ShopEase Deployment Guide

Congratulations on perfecting your modern ShopEase E-Commerce platform! To launch this into production so anybody can visit via the internet, follow this pipeline to upload your monolithic stack.

## Architecture
You have built a **Monolithic Sandbox Architecture**:
- Both your React Frontend and your Express Backend are structurally intertwined. 
- The backend serves the compiled UI natively over Port 5000 while handling all the Secure Auth endpoints securely.

## Step 1: Provisioning a MongoDB Instance
You are currently running `127.0.0.1` locally. On a cloud host, you need a networked database.
1. Sign up for **MongoDB Atlas** (Free Tier).
2. Create an App Service Cluster.
3. Whitelist Network IP to `0.0.0.0/0` (Allow all access).
4. Save the generated Connection String URI (`mongodb+srv://...`).

## Step 2: Preparing Keys
Copy properties from `backend/.env.example` and prepare your real secret keys:
1. Obtain your **Stripe Secret Key** from your Stripe Developer Dashboard (`sk_test_...` or `sk_live_...`).
2. Have your Production MongoDB Connection String URL ready.

## Step 3: Deploying on Render (PaaS)
Render.com cleanly supports this deployment pattern natively.
1. Create a "Web Service" mapped to your `FINAL PROJECT` repository root.
2. Select the `Node` Environment.
3. Configure **Build Command**: 
   `cd backend && npm install && cd ../simpleapp && npm install && npm run build`
4. Configure **Start Command**:
   `cd backend && node server.js`
5. Map your **Environment Variables** securely inside Render interface:
   - `STRIPE_SECRET_KEY`: *value*
   - `MONGODB_URI`: *value*
   - `ENCRYPTION_KEY`: *Any secure 32 byte randomized string*

## Step 4: Verification 
Once Render successfully builds the assets, access your fresh URL! 
> Note: Your first user registration with your default email will be securely routed via the endpoint to automatically assign the remote `isAdmin=true` MongoDB attribute!
