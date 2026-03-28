# Target: GenreWhisper NLP Final Project

## Goal Description
Build an end-to-end NLP Foundations Final Project named "GenreWhisper". The project comprises two major components:
1. **Google Colab Notebook**: A meticulously crafted data science pipeline that explores Amazon book reviews, preprocessing text using spaCy, modeling using FastText and Logistic Regression, handling class imbalance, and exporting an ONNX model.
2. **Next.js Website**: A beautifully designed, full-stack Next.js 14+ application that uses Tailwind, Three.js, and GSAP to provide an interactive, client-side inference experience matching the project's vintage book theme.

## Architecture and Components

### 1. Google Colab Notebook (`GenreWhisper.ipynb`)
- **Structure**: A standalone JSON Jupyter Notebook file.
- **Cells**:
  - **TED-Style Presentation**: Engaging markdown headers and hooks.
  - **EDA**: Visuals using Plotly to show genre distribution, review length, average score, and word clouds per genre.
  - **Preprocessing**: spaCy custom pipeline (tokenization, lemmatization, stop-word removal, etc.).
  - **Modeling**: Training FastText embeddings on the corpus, then applying Logistic Regression with balanced class weights.
  - **Evaluation**: Macro/weighted precision, recall, F1, and confusion matrix.
  - **Export**: Exporting the model using `skl2onnx` for the Next.js frontend.
  - **Slides**: 4 TED-style markdown slides at the end.

### 2. Next.js 14 Web Application
The application will be initialized in the workspace (`GenreWhisper-Web`).
- **Core Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **UI/UX**: `shadcn/ui`, `lucide-react`, `GSAP` 3 for animations, `Three.js` (r134+) for 3D elements.
- **Inference**: `@xenova/transformers` (ONNX Runtime Web) to run the exported ONNX model within the browser.
- **Key Pages/Components**:
  - `app/page.tsx`: Landing Page with 3D Hero.
  - `app/predict/page.tsx`: "Predict from Review" page containing the ONNX integration.
  - `app/upload/page.tsx`: "Upload a Book" drag-and-drop page using local storage.
  - `app/insights/page.tsx`: Insights Dashboard with static demo charts.
  - `app/about/page.tsx`: Links to Colab and Video Presentation.
  - `components/ThreeDBook.tsx`: The Three.js 3D floating open-book hero component.
  - `components/Sidebar.tsx`: GSAP-powered book-spine navigation.

## Verification Plan

### Automated/Local Tests
- **Colab Notebook**: 
  - The generated notebook will be structurally valid JSON. The code cells will be theoretically executable in Google Colab given the Amazon Reviews dataset.
- **Next.js Web App**:
  - `npm install` and `npm run build` must succeed.
  - Application must start correctly via `npm run dev`.

### Next Actions (Execution)
1. Write the `GenreWhisper.ipynb` JSON structure directly to the workspace.
2. Initialize and configure the Next.js project.
3. Scaffold and fill out the React components.
4. Notify the user of the final result with running instructions.
