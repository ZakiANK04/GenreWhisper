# GenreWhisper: Final Project Submission Guide

Everything is successfully generated and ready! Here is your step-by-step submission guide:

## 1. Google Colab Notebook & Video Presentation
Your fully documented, TED-style narrative notebook has been generated locally in your main workspace folder as `GenreWhisper.ipynb`.

1. **Upload to Google Colab**: Go to [Colab](https://colab.research.google.com/), click **File -> Upload Notebook**, and select the `GenreWhisper.ipynb` file from this directory.
2. **Review & Run**: Read through the stunning EDA, spaCy preprocessing, and model training. Before running, make sure to upload the massive Kaggle dataset (`books_data.csv` and `Books_rating.csv`) directly into the Colab session files, or mount your Google Drive if they are large.
3. **The Slides**: Scroll to the very bottom to find your 4 TED-style markdown slides.
4. **The Video**: Record a max 5-minute Loom/Zoom or direct screencast walking through the slides, showing the Colab execution (Plotly charts!), and finally opening the Next.js web app locally. Upload to YouTube as 'Unlisted'.

## 2. Deploying GenreWhisper to Vercel
Your magnificent Next.js 14 Web Application resides in the `genre-whisper-web` folder. 
It uses Next.js App Router, Three.js for a jaw-dropping floating book hero, GSAP for cinematic scroll transitions, and ONNX Runtime logic.

### To Run Locally:
Open a terminal in the folder:
```bash
cd genre-whisper-web
npm run dev
```
Open `http://localhost:3000` to dive into the magical tome.

### To Deploy (1-click Vercel):
1. Create a new repository on your GitHub and push the `genre-whisper-web` code.
2. Log in to [Vercel.com](https://vercel.com).
3. Click "Add New Project" and import your GitHub repository.
4. Framework Preset will auto-detect Next.js.
5. In Environment Variables, you can safely add a placeholder `NEXT_PUBLIC_ONNX_MODEL_URL=https://huggingface.co/your-username/model-repo/resolve/main/logreg_genre.onnx` if you decide to upload the `.onnx` weights exported from the Colab.
6. Click **Deploy**. Vercel will build your site in under 2 minutes.

## 3. Submitting to the Module
Ensure you provide your instructor with:
- The YouTube Unlisted Link.
- The link to your deployed Vercel application.
- The link to your Google Colab (Ensure sharing permissions are set to "Anyone with the link can view").
