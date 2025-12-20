# StudyBuddy AI Automation - Deployment Guide

## STEP 6 - DEPLOY

### Prerequisites

Before deploying, ensure you have:

1. **Environment Variables Set Up**
   - `GCP_PROJECT_ID` - Your Google Cloud Project ID
   - `GCP_REGION` - Your GCP region (e.g., us-central1)
   - `OPENAI_API_KEY` - Your OpenAI API key for Whisper

2. **Dependencies Installed**
   ```bash
   npm install openai
   npm install @google-cloud/vertexai
   npm install firebase-functions
   npm install firebase-admin
   ```

### Deployment Steps

#### 1. Commit All Changes

```bash
git add .
git commit -m "Add AI automation features: auto-summary, quiz generation, voice input, and recommendations"
```

#### 2. Push to GitHub

```bash
git push origin main
```

#### 3. Deploy Firebase Functions

Navigate to your functions directory and deploy:

```bash
cd functions
firebase deploy --only functions
```

Or deploy specific function:

```bash
firebase deploy --only functions:autoSummary
```

#### 4. Deploy to Vercel

The Next.js API routes will be automatically deployed when you push to GitHub if you have Vercel connected to your repository.

Alternatively, deploy manually:

```bash
vercel --prod
```

#### 5. Configure Environment Variables in Vercel

Go to your Vercel project settings and add:
- `GCP_PROJECT_ID`
- `GCP_REGION`
- `OPENAI_API_KEY`

#### 6. Configure Firestore Indexes

If needed, create indexes for the quizzes collection:

```bash
firebase deploy --only firestore:indexes
```

### Verification Checklist

After deployment, verify:

- [ ] Firebase Functions deployed successfully
- [ ] Vercel deployment completed
- [ ] Environment variables configured
- [ ] Test auto-summary generation by creating a lesson
- [ ] Test quiz generation endpoint
- [ ] Test voice transcription endpoint
- [ ] Test recommendation logic
- [ ] Check Firestore for quiz results storage

### SUCCESS CONDITIONS

✓ **Lessons auto-generate summaries**
  - When a lesson document is created in Firestore with a transcript field, a summary is automatically generated and added to the document

✓ **Quizzes auto-generate**
  - POST request to `/api/quiz` with transcript generates 5 multiple choice questions

✓ **Progress saved**
  - Quiz results are saved to Firestore `quizzes` collection with uid, lessonId, score, and createdAt

✓ **Recommendations shown**
  - `getRecommendation(score)` function returns appropriate guidance based on quiz performance

✓ **Voice input converts to text**
  - POST request to `/api/voice` with audio file returns transcribed text

### Troubleshooting

**Firebase Functions not triggering:**
- Check Firebase console for function logs
- Verify Firestore trigger path matches your collection structure
- Ensure Firebase Admin is initialized

**API routes returning errors:**
- Check Vercel function logs
- Verify environment variables are set correctly
- Ensure all dependencies are installed

**Vertex AI errors:**
- Verify GCP project has Vertex AI API enabled
- Check service account permissions
- Ensure region is supported for Gemini models

**Whisper API errors:**
- Verify OpenAI API key is valid
- Check audio file format (supported: mp3, mp4, mpeg, mpga, m4a, wav, webm)
- Ensure file size is under 25MB

### Monitoring

- **Firebase Console**: Monitor function executions and errors
- **Vercel Dashboard**: Check API route performance and logs
- **Firestore Console**: Verify data is being written correctly

### Next Steps

Once deployed and verified, consider:
- Admin analytics dashboard
- Cost controls and usage monitoring
- Agentic MCP workflows
- Personal study plans
- Retention nudges

---

## This is **real SaaS behavior**, not a demo.

Your system now:
- Automatically generates summaries from lesson transcripts
- Creates quizzes on demand
- Tracks user progress
- Provides intelligent recommendations
- Supports voice input

The system feels **alive** and adapts to user behavior.
