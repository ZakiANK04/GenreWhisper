# GenreWhisper

<div align="center">

### Unveiling Hidden Genres from the Whispers of Readers

An NLP + full-stack project that asks whether **reader reviews alone** can recover a book's genre, and whether review language exposes **hidden sentiment bias across genres**.

</div>

---

## Why This Project Exists

Most book classification systems trust publisher metadata and storefront categories. GenreWhisper takes a harder and more interesting question:

> If we ignore the official label and listen only to what readers write, can we still recover the book's genre?

This project treats reviews as semantic evidence:
- signals of tone,
- signals of theme,
- signals of world-building,
- signals of reader expectation,
- and signals of how different genres are emotionally judged.

The result is a project with two parts:
- a research notebook that builds and evaluates the NLP pipeline,
- a cinematic website that turns the pipeline into an interactive product.

---

## Project Structure

```text
Book genre classifier project/
|-- GenreWhisper.ipynb
|-- generate_notebook.py
|-- GenreWhisper_Technical_Brief.pdf
|-- presentation_prompt.txt
|-- genre-whisper-web/
|   |-- src/app/
|   |-- src/components/
|   |-- src/lib/
|   |-- scripts/
|   `-- README.md
`-- implementation_plan.md
```

---

## Research Question

**Can reader reviews alone predict a book's genre/category? And do review sentiments reveal hidden genre biases?**

This is the organizing idea behind the entire system:
- the notebook,
- the model export,
- the website UX,
- and the presentation narrative.

---

## Technical Stack

### NLP / Modeling

- `spaCy`
- `FastText`
- `scikit-learn`
- `ONNX`
- `onnxruntime`
- `pandas`
- `numpy`
- `matplotlib`
- `plotly`

### Website / Product Layer

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `GSAP`
- `Three.js`
- `@react-three/fiber`
- `@react-three/drei`
- `lucide-react`

### Runtime Architecture

- Next.js UI for the interactive product
- Next.js API routes for request handling
- Python 3.12 worker process for real inference
- `genrewhisper_fasttext.bin` for document vectorization
- `genre_pipeline.onnx` for the final classifier

---

## How The NLP Pipeline Works

### 1. Dataset

GenreWhisper uses the **Amazon Books Reviews** dataset from Kaggle.

Files used:
- `books_data.csv`
- `Books_rating.csv`

Exact fields used:

From `books_data.csv`
- `Title`
- `description`
- `authors`
- `categories`

From `Books_rating.csv`
- `Title`
- `review/text`
- `review/summary`
- `review/score`

### 2. Merge Strategy

The pipeline normalizes `Title`, extracts a primary genre from `categories`, and merges the review table with the book metadata table.

### 3. Preprocessing

Review text is processed with `spaCy` using:
- tokenization
- lemmatization
- stop-word removal
- punctuation removal

### 4. Embeddings

A custom **100-dimensional FastText model** is trained on the cleaned review corpus.

Each review is converted into a document vector by averaging its token vectors.

### 5. Classifier

The final genre classifier is:
- `LogisticRegression`
- with `class_weight="balanced"`

This is deliberate. Genre distributions are skewed, and balanced class weights keep smaller categories from being ignored.

### 6. Evaluation

The notebook reports:
- Precision (macro)
- Recall (macro)
- F1 (macro)
- Precision (weighted)
- Recall (weighted)
- F1 (weighted)
- confusion matrix

Accuracy alone would be weak here. Macro metrics matter because this is an imbalanced multi-class problem.

---

## What The Website Does

The website is not just a front-end wrapper. It is the product layer of the project.

### Main sections

- **Home**
  A cinematic landing page with a floating 3D book and a gold-lit vintage-library visual language.

- **Predict**
  Paste a review and run real genre prediction through the exported model pipeline.

- **Upload**
  Upload `.txt`, `.csv`, `.json`, or `.pdf` files. The app extracts text and runs real genre inference on the extracted content.

- **Insights**
  Presents the project's key analytical findings in a product-facing layout.

- **About**
  Ties the notebook, model, and presentation together.

---

## Current Inference Architecture

This is the most important technical detail in the repo.

### Real inference is working

The app now uses the actual exported model path:

1. the browser sends review text or uploaded file content to a Next.js API route,
2. the API route calls a persistent Python 3.12 worker,
3. the worker:
   - preprocesses text with `spaCy`,
   - vectorizes it with `genrewhisper_fasttext.bin`,
   - runs `genre_pipeline.onnx`,
   - returns top predictions and confidence scores.

### Why inference is server-side

The FastText model is currently very large:

- `genrewhisper_fasttext.bin` is roughly **810 MB**

That makes browser-only inference impractical. The current architecture is therefore correct for local execution and serious testing, but it is **not directly deployable to Vercel as-is**.

---

## Vercel Reality Check

The current repo contains two deployment stories:

### What Vercel can host cleanly

Vercel can host:
- the website shell,
- the static pages,
- the animated UX,
- the research/presentation layer.

### What Vercel cannot host cleanly in the current architecture

The current real inference path depends on:
- Python 3.12,
- a local worker process,
- an 810 MB FastText model,
- model artifacts outside the normal lightweight serverless pattern.

That means:
- the **website UI** can be deployed,
- the **full real inference backend** should be hosted elsewhere unless the model pipeline is redesigned.

### Best deployment options

If you want the full real model online, the better approach is:
- Vercel for the front-end,
- separate Python backend on Railway / Render / Fly.io / VPS,
- or re-export a much smaller browser/serverless-friendly text pipeline.

---

## Running The Project Locally

### Website

From the web app folder:

```powershell
cd "C:\Users\zzaou\Documents\COIL\Book genre classifier project\genre-whisper-web"
npm install
npm run build -- --webpack
npm run start -- --hostname 127.0.0.1 --port 3005
```

Then open:

```text
http://127.0.0.1:3005
```

### Python requirement for real inference

The live inference path expects Python 3.12 here:

```text
C:\Users\zzaou\AppData\Local\Programs\Python\Python312\python.exe
```

If your Python path is different, set:

```powershell
$env:GENREWHISPER_PYTHON="C:\path\to\python312\python.exe"
```

before starting the app.

---

## Required Local Model Files

These files are intentionally ignored by Git because they are large or environment-specific:

- `genrewhisper_fasttext.bin`
- `genre_pipeline.onnx`
- `genre_classifier.onnx`
- `genre_scaler.onnx`
- `genre_labels.json`
- `genrewhisper_metadata.json`

Without them, the UI still builds, but real inference will not work.

---

## Notebook Assets

This repo also contains the notebook and presentation assets:

- `GenreWhisper.ipynb`
- `GenreWhisper_Technical_Brief.pdf`
- `GenreWhisper_Technical_Brief.md`
- `presentation_prompt.txt`

These support:
- the module submission,
- the YouTube presentation,
- NotebookLM / AI slide generation,
- reproducibility of the research story.

---

## Design Language

GenreWhisper was intentionally not designed like a generic AI dashboard.

The visual direction is:
- vintage library
- leather and parchment textures
- antique gold accents
- editorial typography
- cinematic transitions
- a floating open-book hero

This visual identity is part of the project itself, not decoration layered on top of it.

---

## What Is Deployable Right Now

### Ready

- notebook
- website UI
- local real inference
- upload analysis for text / CSV / JSON / PDF
- project presentation assets

### Not ready for direct Vercel-only hosting

- full real inference with the current 810 MB FastText model and Python worker

---

## Recommended GitHub Strategy

Use GitHub for:
- source code,
- notebook,
- documentation,
- screenshots,
- deployment instructions,
- lightweight metadata files.

Do **not** commit:
- raw Kaggle datasets,
- `.next`,
- `node_modules`,
- the large FastText binary,
- large generated local artifacts.

This repo is already configured for that through the root `.gitignore`.

---

## Final Summary

GenreWhisper is strongest when understood as a combination of:

- applied NLP research,
- honest genre classification,
- bias-aware analysis,
- full-stack product thinking,
- and deliberate visual storytelling.

It is not just trying to classify books.

It is trying to show that **reader language itself becomes a map of genre identity**.
