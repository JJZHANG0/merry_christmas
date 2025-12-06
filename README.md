<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Wuzs47v-CI5IDLZF4-PyKbC2aVfSQUIY

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup GitHub Pages

1. Go to your repository settings on GitHub: `https://github.com/JJZHANG0/merry_christmas/settings/pages`
2. Under "Source", select **"GitHub Actions"** as the source
3. The workflow will automatically build and deploy your app when you push to the `main` branch

### Environment Variables

If your app requires `GEMINI_API_KEY` for the build process:
1. Go to repository settings → Secrets and variables → Actions
2. Add a new repository secret named `GEMINI_API_KEY` with your API key value

### Access Your Deployed App

Once deployed, your app will be available at:
`https://jjzhang0.github.io/merry_christmas/`

The deployment workflow will run automatically on every push to the `main` branch.
