# Deploying to Vercel - Step by Step Guide

This guide provides detailed instructions for deploying your 3D Human Pose Estimation application to Vercel.

## Option 1: Deploy from GitHub (Recommended)

This is the easiest method and allows for automatic updates when you push changes to your repository.

### Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your code is already pushed to GitHub at https://github.com/rahmivinnn/mediapipetest

### Steps

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com) and sign in or create an account

2. **Create a New Project**:
   - Click on "Add New..." and select "Project"

3. **Import Your GitHub Repository**:
   - Connect your GitHub account if prompted
   - Find and select the "rahmivinnn/mediapipetest" repository
   - If you don't see it, click on "Adjust GitHub App Permissions" and add the repository

4. **Configure Project Settings**:
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as `./ (recommended)`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Environment Variables**: None needed

5. **Deploy**:
   - Click the "Deploy" button
   - Wait for the deployment to complete (usually takes less than a minute)

6. **Access Your Deployed Application**:
   - Once deployment is complete, Vercel will provide a URL (e.g., https://mediapipetest.vercel.app)
   - Click on the URL to visit your deployed application
   - Share this URL with your client

## Option 2: Deploy Using Vercel CLI

If you prefer using the command line or can't access GitHub directly.

### Prerequisites

1. Node.js and npm installed on your computer
   - Download from [nodejs.org](https://nodejs.org/)
2. Vercel CLI installed
   - Will be installed automatically by the deployment script

### Steps

1. **Run the Deployment Script**:
   - Open a command prompt or PowerShell window
   - Navigate to your project directory:
     ```
     cd "C:\Users\Lenovo\Downloads\Mediapipe Pose\3D-HPE-MediaPipe-Pose"
     ```
   - Run the deployment script:
     ```
     .\deploy-to-vercel.bat
     ```

2. **Follow the Prompts**:
   - If you're not logged in to Vercel, the script will guide you through the login process
   - You'll be asked to confirm deployment settings
   - Accept the default options by pressing Enter

3. **Wait for Deployment**:
   - The script will upload your files and deploy your application
   - This usually takes less than a minute

4. **Access Your Deployed Application**:
   - Once deployment is complete, the script will display a URL
   - Visit this URL to see your deployed application
   - Share this URL with your client

## Updating Your Deployment

### If You Deployed from GitHub (Option 1)

Any changes you push to your GitHub repository will automatically trigger a new deployment on Vercel.

1. Make changes to your code
2. Commit and push to GitHub:
   ```
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Vercel will automatically detect the changes and deploy the updated version

### If You Deployed Using Vercel CLI (Option 2)

Run the deployment script again after making changes:

```
.\deploy-to-vercel.bat
```

## Custom Domain (Optional)

If you want to use a custom domain instead of the Vercel-provided URL:

1. Go to your project on the Vercel dashboard
2. Click on "Settings" and then "Domains"
3. Add your custom domain and follow the instructions to configure DNS settings

## Troubleshooting

- **Deployment fails**: Check that all files are correctly referenced in your HTML
- **Application doesn't work**: Open browser developer tools (F12) to check for errors
- **Can't log in to Vercel**: Make sure you're using the correct email address

For more help, visit [Vercel Documentation](https://vercel.com/docs)
