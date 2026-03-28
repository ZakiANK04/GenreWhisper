# GenreWhisper Technical Brief

## 1. Project Overview

**GenreWhisper** is an NLP Foundations final project that asks a simple but strong research question:

**Can reader reviews alone predict a book's genre/category? And do review sentiments reveal hidden genre biases?**

The project combines two outputs:

1. A notebook-based NLP pipeline built around the Amazon Books Reviews dataset.
2. A Next.js website that presents the project as an interactive literary-tech experience.

The project is intentionally designed as both a research artifact and a product artifact. The notebook handles data exploration, preprocessing, modeling, evaluation, and export. The website turns the project into a public-facing experience with a cinematic, book-inspired interface.

## 2. Why This Project Matters

Most book classification systems rely on publisher metadata, store taxonomy, or manually assigned labels. GenreWhisper explores a more interesting idea: reviews may reveal a book's "felt" genre more honestly than metadata does.

If review language alone can predict genre with useful accuracy, then reviews become a powerful signal for:

- catalog cleanup,
- recommendation systems,
- audience segmentation,
- discovering misclassified books,
- understanding how readers emotionally frame different genres.

The project also goes one step further by examining whether some genres attract more polarized language or systematically different sentiment profiles.

## 3. Dataset

The project uses the **Amazon Books Reviews** dataset from Kaggle.

Files:

- `books_data.csv`
- `Books_rating.csv`

Exact columns used in the project:

From `books_data.csv`:
- `Title`
- `description`
- `authors`
- `categories`

From `Books_rating.csv`:
- `Title`
- `review/text`
- `review/summary`
- `review/score`

The join key is `Title`, normalized for safer matching.

## 4. Research Workflow

The notebook follows a full NLP pipeline aligned with the module brief.

### 4.1 Data Loading and Merge

The project loads the exact required columns from both CSVs, normalizes titles, extracts a primary genre from `categories`, and merges the review data with the book metadata.

This creates a working dataset where each row links:

- book identity,
- book genre,
- reader review text,
- review summary,
- numerical review score.

### 4.2 Practical Modeling Subset

Because the original dataset is extremely large, the notebook creates a practical modeling subset:

- keep the most frequent genres,
- require a minimum number of reviews per genre,
- cap the maximum number of reviews per genre.

This keeps the notebook runnable in both Google Colab and local Jupyter while preserving a meaningful class-imbalance problem.

## 5. Exploratory Data Analysis

The EDA section is not decorative. It supports the research question directly.

Main analyses include:

- genre distribution,
- review-length distribution,
- average review score per genre,
- standard deviation of review scores per genre,
- word cloud from the largest genre.

These visuals help establish:

- which genres dominate the dataset,
- whether review length varies by category,
- whether some genres have more polarized or consistently positive reviews,
- what lexical texture exists before modeling.

This is where the "hidden genre bias" question starts to become visible.

## 6. Text Preprocessing with spaCy

The project uses **spaCy** for text preprocessing.

Required preprocessing steps:

- tokenization,
- lemmatization,
- stop-word removal,
- punctuation removal.

Only the review text is used as the predictive language source. This is important because the core claim of the project is that **reader reviews alone** can contain enough semantic information to predict genre.

The preprocessing decisions are designed to reduce noise while retaining genre-carrying signals such as thematic words, emotional vocabulary, and world-building language.

## 7. FastText Embeddings

After preprocessing, the notebook trains a custom **FastText 100-dimensional model** on the cleaned review corpus.

FastText was chosen because:

- it is lightweight,
- it handles noisy and imperfect text well,
- it captures subword information,
- it is practical for a deployment-oriented student project.

Each cleaned review is converted into a single document vector by averaging the FastText word vectors for the tokens in that review.

This produces a dense semantic representation for each review that can be fed into a classical classifier.

## 8. Classification Model

The model used for genre prediction is **Logistic Regression** with:

- `class_weight="balanced"`

This choice matters because the genre distribution is not uniform. Some genres are overrepresented, while others have much less coverage.

Using class weights makes the model more honest and aligned with the module's requirement to address class imbalance rather than ignore it.

The training flow is:

1. split the data into train and test sets using stratification,
2. scale the FastText vectors,
3. train Logistic Regression,
4. evaluate on held-out test data.

## 9. Evaluation

The project explicitly does not rely on accuracy alone.

Reported metrics include:

- Precision (macro)
- Recall (macro)
- F1 (macro)
- Precision (weighted)
- Recall (weighted)
- F1 (weighted)
- full classification report
- confusion matrix

This matches the course requirement to explain why these metrics matter.

Why these metrics are appropriate:

- **Macro metrics** show whether minority genres are being handled fairly.
- **Weighted metrics** show overall performance while accounting for class size.
- **Confusion matrix** reveals which genres the model mixes up and where the taxonomy overlaps.

This is especially important in a multi-class genre problem, where "close" genres can still be meaningfully different.

## 10. Insights and Business Value

The notebook includes a dedicated insight section that goes beyond metric reporting.

Key forms of insight:

- identifying genres with the highest average review score,
- detecting genres with the highest review-score variance,
- examining which genres attract longer reviews,
- extracting common terms from the strongest genre clusters.

These insights can support:

- publishers checking audience alignment,
- retailers detecting potential metadata misclassification,
- recommendation systems improving category relevance,
- authors understanding how readers linguistically frame genre experience.

In other words, the project is not only predictive. It is interpretive.

## 11. Hidden Genre Bias

One of the most interesting parts of GenreWhisper is the second half of the research question: sentiment bias.

The project investigates whether some genres are systematically associated with:

- higher average review scores,
- more polarized scoring behavior,
- longer or more emotionally detailed reviews.

This matters because genres are not judged neutrally by readers. Some are over-broadened, some are dismissed, and some create stronger emotional extremes.

Examples of the kind of patterns the project is designed to surface:

- "Fiction" behaving like a broad catch-all bucket,
- politically charged categories showing stronger sentiment variance,
- world-building-heavy genres attracting longer reviews and richer vocabulary.

## 12. Limitations and Ethics

The project includes limitations and ethical reflection explicitly.

Main limitations:

- the dataset reflects Amazon behavior, not universal reading culture,
- joining on title can introduce ambiguity,
- the modeling subset is practical rather than exhaustive,
- averaged FastText embeddings are efficient but simpler than transformer representations.

Ethical considerations:

- automated genre labeling can reinforce commercial taxonomy bias,
- review language can reflect cultural and platform bias,
- recommendation logic can over-compress cross-genre works into rigid labels,
- human oversight remains important for nuanced literary classification.

## 13. Deployment and Export

GenreWhisper is not just a notebook. It has a deployment-oriented output.

The notebook exports:

- `genre_pipeline.onnx`
- `genre_classifier.onnx`
- `genre_scaler.onnx`
- `genrewhisper_fasttext.bin`
- `genre_labels.json`
- `genrewhisper_metadata.json`

The ONNX export is intended for use in the website layer so the project can move beyond static analysis and toward interactive inference.

## 14. Website Architecture

The project includes a website in the `genre-whisper-web` folder.

Main stack:

- Next.js
- TypeScript
- Tailwind CSS
- GSAP
- Three.js / React Three Fiber / Drei
- ONNX Runtime-oriented workflow

Key pages and components:

- landing page with a floating 3D book hero,
- prediction page for review-based genre inference,
- upload page for user-submitted files,
- insights page for visual patterns,
- about page linking the research and presentation,
- animated sidebar navigation.

## 15. Intended Visual Identity

The website's visual language is essential to understanding how the project should be presented.

It is not a generic AI dashboard.

Its design language is:

- vintage library,
- leather-bound book aesthetics,
- parchment textures,
- antique gold accents,
- cinematic GSAP motion,
- magical particles and 3D book imagery.

Representative aesthetic cues in the codebase:

- deep brown / near-black background,
- parchment-colored text,
- gold gradient headline treatment,
- page-curl effects,
- floating open book with internal golden light,
- phrases like "Whisper to the Model" and "Consulting the Oracle."

This means the slide deck should feel literary, premium, and slightly mythical rather than corporate or minimal-tech.

## 16. How the Presentation Should Be Told

The module instructions emphasize TED-style storytelling.

That means the presentation should not feel like:

- a lab report,
- a list of preprocessing steps,
- a generic accuracy summary.

It should feel like:

- a story with a hook,
- a clean explanation of the technical method,
- a reveal of what the model discovered,
- a clear "so what" for publishers, retailers, or readers,
- an honest limitation or ethical caution,
- a memorable final takeaway.

The best presentation structure for this project is:

1. Hook: reviews as whispers of a book's true identity.
2. Data and method: how those whispers were cleaned and modeled.
3. Results: what the classifier could infer from reviews alone.
4. Bias and insight: what genre sentiment patterns reveal.
5. Product and future: why the notebook plus website matters.

## 17. Recommended Slide Tone

If this brief is used inside NotebookLM or another AI slide generator, the output should aim for:

- sophisticated,
- cinematic,
- elegant,
- bookish,
- visually unique,
- technically credible,
- low text density,
- one core idea per slide.

Avoid:

- default business templates,
- bright corporate blues,
- robotic AI imagery,
- overloaded bullet lists,
- generic startup-dashboard aesthetics.

## 18. Final Takeaway

GenreWhisper is strongest when framed as a fusion of:

- literary interpretation,
- applied NLP,
- honest model evaluation,
- creative technical storytelling.

The central message is:

**Reader reviews are not just reactions. They are signals of genre identity, audience expectation, and hidden bias.**

That is the insight the presentation should make memorable.
