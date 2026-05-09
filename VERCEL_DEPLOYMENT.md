# Vercel Deployment Guide

## Required Environment Variables

Vercel dashboard mein yeh environment variables add karo:

### 1. MongoDB
```
MONGODB_URI=mongodb+srv://anmolpanchal0207:Anmol%402548@cluster1.orkidfi.mongodb.net/solar-management?retryWrites=true&w=majority&appName=Cluster1
```

### 2. NextAuth
```
NEXTAUTH_URL=https://solar-management-zeta.vercel.app
NEXTAUTH_SECRET=tTLvlYF4PZSRaoWFLlq/vwDeCiJigPE817TT+ASI/7Q=
```

### 3. Cloudinary
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyjxnbfpx
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Deployment Steps

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: solar-management
3. Go to Settings > Environment Variables
4. Add all variables above
5. Redeploy from Deployments tab

## Build Settings
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 18.x or higher

## Common Issues

### ERR_FAILED
- Check if all environment variables are set
- Verify MongoDB connection string
- Check Vercel deployment logs

### Build Errors
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies are in package.json

### Runtime Errors
- Check Vercel Function Logs
- Verify MongoDB connection
- Check NextAuth configuration
