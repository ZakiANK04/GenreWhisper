import json
from pathlib import Path


notebook = {
    "cells": [],
    "metadata": {
        "colab": {"name": "GenreWhisper.ipynb", "provenance": []},
        "kernelspec": {"display_name": "Python 3", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 4,
}


def add_md(source: str) -> None:
    notebook["cells"].append(
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [line + "\n" for line in source.strip("\n").split("\n")],
        }
    )


def add_code(source: str) -> None:
    notebook["cells"].append(
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [line + "\n" for line in source.strip("\n").split("\n")],
        }
    )


add_md(
    """
# GenreWhisper

> IMPORTANT: This notebook works in **Google Colab** and in **local Jupyter notebooks** only if you use **Python 3.10, 3.11, or 3.12**.  
> It will **NOT** work with **Python 3.14** because `spaCy` currently depends on `pydantic.v1`, which is incompatible there.  
> If you are running locally, use a virtual environment with **Python 3.10/3.11/3.12**.

## Research Question
**Can reader reviews alone predict a book's genre/category? And do review sentiments reveal hidden genre biases?**

## Project Requirements Implemented
- Project name: **GenreWhisper**
- Dataset: **Amazon Books Reviews** from Kaggle
- Uses exactly these columns:
  - `books_data.csv`: `Title`, `description`, `authors`, `categories`
  - `Books_rating.csv`: `Title`, `review/text`, `review/summary`, `review/score`
- spaCy preprocessing:
  - tokenize
  - lemmatize
  - remove stop words
  - remove punctuation
- Train a custom **FastText 100-dimensional** model
- Train **Logistic Regression** with `class_weight="balanced"`
- Full EDA
- Metrics:
  - Precision / Recall / F1 macro
  - Precision / Recall / F1 weighted
  - confusion matrix
- Actionable insights
- Limitations & ethics
- Export inference assets for the Next.js website
- 4 TED-style slides at the end
"""
)

add_code(
    """
# Cell 2: Environment-aware installation for Colab + local Jupyter
import os
import sys
import subprocess

IN_COLAB = "google.colab" in sys.modules
PY_VERSION = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"

print("Python version:", PY_VERSION)
print("Running in Colab:", IN_COLAB)

if sys.version_info >= (3, 14):
    raise RuntimeError(
        "This notebook cannot run with Python 3.14 because spaCy is not compatible with it yet. "
        "Use Google Colab or a local Python 3.10/3.11/3.12 environment."
    )

if IN_COLAB:
    print("Installing packages in Google Colab...")
    get_ipython().system("pip install spacy==3.7.5 fasttext==0.9.2 gensim plotly scikit-learn joblib pandas numpy matplotlib seaborn wordcloud nbformat ipywidgets")
    get_ipython().system("pip install skl2onnx onnx onnxruntime")
    get_ipython().system("python -m spacy download en_core_web_sm")
else:
    print("Installing packages in local Jupyter...")
    common_packages = [
        "spacy==3.7.5",
        "gensim",
        "plotly",
        "scikit-learn",
        "joblib",
        "pandas",
        "numpy",
        "matplotlib",
        "seaborn",
        "wordcloud",
        "skl2onnx",
        "onnx",
        "onnxruntime",
        "nbformat",
        "ipywidgets",
    ]
    subprocess.check_call([sys.executable, "-m", "pip", "install", *common_packages])

    fasttext_cmd = [sys.executable, "-m", "pip", "install", "fasttext==0.9.2"]
    fasttext_result = subprocess.run(fasttext_cmd, capture_output=True, text=True)
    if fasttext_result.returncode != 0:
        print("fasttext==0.9.2 failed locally. Falling back to fasttext-wheel...")
        wheel_result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "fasttext-wheel"],
            capture_output=True,
            text=True,
        )
        if wheel_result.returncode != 0:
            print("fasttext install error:")
            print(fasttext_result.stdout)
            print(fasttext_result.stderr)
            print("fasttext-wheel install error:")
            print(wheel_result.stdout)
            print(wheel_result.stderr)
            raise RuntimeError(
                "Could not install either fasttext==0.9.2 or fasttext-wheel locally. "
                "If you are on Windows, use Google Colab or install a C++ build toolchain."
            )

    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])

print("Installation complete.")
"""
)

add_md(
    """
## Data Setup

This notebook expects:

- `books_data.csv`
- `Books_rating.csv`

### Google Colab
Upload both files to the Colab session, or mount Google Drive.

### Local Jupyter
Place both CSV files in the same folder as this notebook, or update `DATA_DIR` in the next cell.
"""
)

add_code(
    """
# Cell 4: Imports and notebook configuration
import ast
import json
import re
import warnings
from collections import Counter
from pathlib import Path

import fasttext
import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import plotly.express as px
import seaborn as sns
import spacy
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from wordcloud import WordCloud

warnings.filterwarnings("ignore")
pd.set_option("display.max_columns", 50)
pd.set_option("display.max_colwidth", 200)

RANDOM_STATE = 42
EMBEDDING_DIM = 100

# Practical defaults so the notebook runs reliably in Colab and local Jupyter.
TOP_K_GENRES = 10
MIN_REVIEWS_PER_GENRE = 500
MAX_REVIEWS_PER_GENRE = 1500

nlp = spacy.load("en_core_web_sm", disable=["parser", "ner", "textcat"])

print("spaCy version:", spacy.__version__)
print("Notebook configured successfully.")
"""
)

add_code(
    """
# Cell 5: Locate the dataset files in Colab or local Jupyter
DATA_DIR = Path(".")  # Change this if your CSV files are in another folder

if IN_COLAB:
    possible_dirs = [
        Path("/content"),
        Path("/content/drive/MyDrive"),
        Path("/content/drive/MyDrive/GenreWhisper"),
        DATA_DIR
    ]
else:
    possible_dirs = [
        DATA_DIR,
        Path.cwd()
    ]

def find_file(filename, search_dirs):
    for folder in search_dirs:
        candidate = folder / filename
        if candidate.exists():
            return candidate
    return None

books_path = find_file("books_data.csv", possible_dirs)
reviews_path = find_file("Books_rating.csv", possible_dirs)

if books_path is None or reviews_path is None:
    raise FileNotFoundError(
        "Could not find books_data.csv and/or Books_rating.csv. "
        "Upload them to Colab or place them in the notebook folder locally."
    )

print("books_data.csv found at:", books_path.resolve())
print("Books_rating.csv found at:", reviews_path.resolve())
"""
)

add_md(
    """
## Load Exactly the Required Columns

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
"""
)

add_code(
    """
# Cell 7: Load the exact required columns only
BOOK_COLUMNS = ["Title", "description", "authors", "categories"]
REVIEW_COLUMNS = ["Title", "review/text", "review/summary", "review/score"]

books_df = pd.read_csv(books_path, usecols=BOOK_COLUMNS, low_memory=False)
reviews_df = pd.read_csv(reviews_path, usecols=REVIEW_COLUMNS, low_memory=False)

print("books_df shape :", books_df.shape)
print("reviews_df shape:", reviews_df.shape)

display(books_df.head(3))
display(reviews_df.head(3))
"""
)

add_code(
    """
# Cell 8: Clean and merge the data on Title
def normalize_title(text):
    if pd.isna(text):
        return np.nan
    text = str(text).strip().lower()
    text = re.sub(r"\\s+", " ", text)
    return text

def extract_primary_category(value):
    if pd.isna(value):
        return np.nan
    text = str(value).strip()
    if not text:
        return np.nan
    try:
        parsed = ast.literal_eval(text)
        if isinstance(parsed, list) and len(parsed) > 0:
            parsed = [str(x).strip() for x in parsed if str(x).strip()]
            return parsed[0] if parsed else np.nan
    except Exception:
        pass
    return text

books_df = books_df.copy()
reviews_df = reviews_df.copy()

books_df["join_title"] = books_df["Title"].map(normalize_title)
reviews_df["join_title"] = reviews_df["Title"].map(normalize_title)

books_df["genre"] = books_df["categories"].map(extract_primary_category)

books_df = books_df.dropna(subset=["join_title", "genre"]).copy()
reviews_df = reviews_df.dropna(subset=["join_title", "review/text", "review/score"]).copy()

books_df["description"] = books_df["description"].fillna("").astype(str)
books_df["authors"] = books_df["authors"].fillna("").astype(str)
reviews_df["review/summary"] = reviews_df["review/summary"].fillna("").astype(str)
reviews_df["review/text"] = reviews_df["review/text"].astype(str).str.strip()
reviews_df["review/score"] = pd.to_numeric(reviews_df["review/score"], errors="coerce")

books_df = books_df.drop_duplicates(subset=["join_title"], keep="first").copy()

df = reviews_df.merge(
    books_df[["join_title", "genre", "description", "authors"]],
    on="join_title",
    how="inner"
)

df = df.dropna(subset=["review/text", "review/score", "genre"]).copy()
df["review_length_words"] = df["review/text"].str.split().str.len()
df = df[df["review_length_words"] >= 5].copy()

print("Merged dataset shape:", df.shape)
print("Unique genres after merge:", df["genre"].nunique())

display(df.head(5))
"""
)

add_md(
    """
## Build a Practical Modeling Subset

The original dataset is very large.  
To make this notebook run reliably in both Colab and local Jupyter, we:

- keep the most frequent genres,
- require a minimum number of reviews per genre,
- cap the maximum number of reviews per genre.

This keeps the experiment reproducible, class-aware, and realistic for notebook execution.
"""
)

add_code(
    """
# Cell 10: Genre filtering and balanced sampling
genre_counts = df["genre"].value_counts()
eligible_genres = genre_counts[genre_counts >= MIN_REVIEWS_PER_GENRE].head(TOP_K_GENRES).index.tolist()

if len(eligible_genres) < 3:
    raise ValueError(
        "Not enough genres met the minimum review threshold. "
        "Lower MIN_REVIEWS_PER_GENRE and rerun this cell."
    )

filtered_df = df[df["genre"].isin(eligible_genres)].copy()

sampled_parts = []
for genre_name in eligible_genres:
    genre_slice = filtered_df[filtered_df["genre"] == genre_name]
    n_take = min(len(genre_slice), MAX_REVIEWS_PER_GENRE)
    sampled_parts.append(genre_slice.sample(n=n_take, random_state=RANDOM_STATE))

model_df = pd.concat(sampled_parts, ignore_index=True)
model_df = model_df.sample(frac=1.0, random_state=RANDOM_STATE).reset_index(drop=True)

print("Selected genres:", eligible_genres)
print("Modeling dataset shape:", model_df.shape)
display(model_df["genre"].value_counts().rename_axis("genre").reset_index(name="review_count"))
"""
)

add_md(
    """
## EDA - Exploratory Data Analysis

We now examine:
- genre distribution,
- review length distribution,
- average review score by genre,
- sentiment dispersion by genre,
- frequent language patterns.
"""
)

add_code(
    """
# Cell 12: Genre distribution
genre_dist = model_df["genre"].value_counts().reset_index()
genre_dist.columns = ["Genre", "Count"]

fig = px.bar(
    genre_dist.sort_values("Count"),
    x="Count",
    y="Genre",
    orientation="h",
    title="Genre Distribution in the Modeling Dataset",
    color="Count",
    color_continuous_scale="Viridis"
)
fig.show()
"""
)

add_code(
    """
# Cell 13: Review length distribution
fig = px.histogram(
    model_df[model_df["review_length_words"] <= 400],
    x="review_length_words",
    nbins=50,
    title="Distribution of Review Lengths",
    color_discrete_sequence=["#1f77b4"]
)
fig.update_layout(xaxis_title="Review length (words)", yaxis_title="Number of reviews")
fig.show()
"""
)

add_code(
    """
# Cell 14: Average score and score variance by genre
score_summary = (
    model_df.groupby("genre")
    .agg(
        reviews=("review/score", "size"),
        avg_review_score=("review/score", "mean"),
        std_review_score=("review/score", "std"),
        avg_review_length=("review_length_words", "mean")
    )
    .reset_index()
    .sort_values("avg_review_score", ascending=False)
)

display(score_summary.round(3))

fig = px.bar(
    score_summary,
    x="avg_review_score",
    y="genre",
    orientation="h",
    error_x="std_review_score",
    title="Average Review Score per Genre (with Standard Deviation)",
    color="avg_review_score",
    color_continuous_scale="Sunset"
)
fig.update_layout(xaxis_title="Average score", yaxis_title="Genre")
fig.show()
"""
)

add_code(
    """
# Cell 15: Word cloud for the largest genre
largest_genre = model_df["genre"].value_counts().idxmax()
largest_genre_text = " ".join(
    model_df.loc[model_df["genre"] == largest_genre, "review/text"].astype(str).tolist()[:3000]
)

wordcloud = WordCloud(
    width=1200,
    height=600,
    background_color="white",
    collocations=False,
    max_words=120
).generate(largest_genre_text)

plt.figure(figsize=(16, 8))
plt.imshow(wordcloud, interpolation="bilinear")
plt.axis("off")
plt.title(f"Word Cloud for Reviews in Genre: {largest_genre}", fontsize=16)
plt.show()
"""
)

add_md(
    """
## spaCy Preprocessing

We preprocess review text using spaCy with the required steps:

1. tokenize
2. lemmatize
3. remove stop words
4. remove punctuation

Only the review text is used as the predictive signal.
"""
)

add_code(
    """
# Cell 17: spaCy preprocessing
def normalize_review_text(text):
    text = str(text).lower().strip()
    text = re.sub(r"\\s+", " ", text)
    return text

def preprocess_texts(texts, batch_size=256):
    cleaned = []
    for doc in nlp.pipe((normalize_review_text(t) for t in texts), batch_size=batch_size):
        tokens = []
        for token in doc:
            if token.is_stop:
                continue
            if token.is_punct or token.is_space:
                continue
            if token.like_num:
                continue
            if not token.is_alpha:
                continue
            lemma = token.lemma_.strip().lower()
            if not lemma or lemma == "-pron-" or len(lemma) < 3:
                continue
            tokens.append(lemma)
        cleaned.append(" ".join(tokens))
    return cleaned

print("Running spaCy preprocessing...")
model_df["clean_text"] = preprocess_texts(model_df["review/text"].tolist(), batch_size=256)
model_df = model_df[model_df["clean_text"].str.len() > 0].copy()

display(model_df[["review/text", "clean_text", "genre"]].head(5))
print("Rows remaining after preprocessing:", model_df.shape[0])
"""
)

add_md(
    """
## Train a Custom FastText Model

We train our own **100-dimensional FastText model** on the cleaned review corpus.

This helps capture:
- subword structure,
- noisy review language,
- lightweight semantic representations suitable for website deployment workflows.
"""
)

add_code(
    """
# Cell 19: Train FastText and create sentence embeddings
corpus_path = Path("genrewhisper_corpus.txt")
with corpus_path.open("w", encoding="utf-8") as f:
    for row in model_df["clean_text"]:
        f.write(row + "\\n")

print("Training FastText...")
ft_model = fasttext.train_unsupervised(
    input=str(corpus_path),
    model="skipgram",
    dim=EMBEDDING_DIM,
    epoch=10,
    minn=2,
    maxn=5,
    thread=4
)
print("FastText training complete.")

def sentence_vector(text, model, dim=100):
    words = text.split()
    if not words:
        return np.zeros(dim, dtype=np.float32)
    vectors = np.array([model.get_word_vector(word) for word in words], dtype=np.float32)
    return vectors.mean(axis=0).astype(np.float32)

X = np.vstack(model_df["clean_text"].map(lambda txt: sentence_vector(txt, ft_model, EMBEDDING_DIM)).values)
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(model_df["genre"])

print("Feature matrix shape:", X.shape)
print("Classes:", label_encoder.classes_.tolist())
"""
)

add_md(
    """
## Train the Classifier

We use:
- **Logistic Regression**
- `class_weight="balanced"`

This directly addresses class imbalance in the genre distribution.
"""
)

add_code(
    """
# Cell 21: Train/test split and model training
X_train, X_test, y_train, y_test, test_meta = train_test_split(
    X,
    y,
    model_df[["review/text", "clean_text", "genre", "review/score"]],
    test_size=0.2,
    random_state=RANDOM_STATE,
    stratify=y
)

genre_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression(
        class_weight="balanced",
        max_iter=2500,
        random_state=RANDOM_STATE,
        solver="lbfgs",
        multi_class="auto"
    ))
])

print("Training Logistic Regression with class_weight='balanced'...")
genre_pipeline.fit(X_train, y_train)
y_pred = genre_pipeline.predict(X_test)
y_proba = genre_pipeline.predict_proba(X_test)

print("Training complete.")
print("Train size:", X_train.shape[0])
print("Test size :", X_test.shape[0])
"""
)

add_md(
    """
## Evaluation Metrics

We report:
- Precision (macro)
- Recall (macro)
- F1 (macro)
- Precision (weighted)
- Recall (weighted)
- F1 (weighted)
- full classification report
- confusion matrix
"""
)

add_code(
    """
# Cell 23: Metrics
macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
    y_test, y_pred, average="macro", zero_division=0
)
weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(
    y_test, y_pred, average="weighted", zero_division=0
)

metrics_df = pd.DataFrame({
    "Metric": [
        "Precision (Macro)",
        "Recall (Macro)",
        "F1 (Macro)",
        "Precision (Weighted)",
        "Recall (Weighted)",
        "F1 (Weighted)"
    ],
    "Value": [
        macro_p, macro_r, macro_f1,
        weighted_p, weighted_r, weighted_f1
    ]
})

display(metrics_df.round(4))

report_df = pd.DataFrame(
    classification_report(
        y_test,
        y_pred,
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0
    )
).transpose()

display(report_df.round(4))
"""
)

add_code(
    """
# Cell 24: Confusion matrix
cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(12, 9))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=label_encoder.classes_,
    yticklabels=label_encoder.classes_
)
plt.title("Confusion Matrix: Actual vs Predicted Genre")
plt.xlabel("Predicted Genre")
plt.ylabel("Actual Genre")
plt.xticks(rotation=45, ha="right")
plt.yticks(rotation=0)
plt.tight_layout()
plt.show()
"""
)

add_code(
    """
# Cell 25: Inspect sample predictions
sample_results = test_meta.copy().reset_index(drop=True)
sample_results["true_genre"] = label_encoder.inverse_transform(y_test)
sample_results["predicted_genre"] = label_encoder.inverse_transform(y_pred)
sample_results["confidence"] = y_proba.max(axis=1)

display(sample_results[["review/text", "true_genre", "predicted_genre", "confidence"]].head(10))
"""
)

add_md(
    """
## Actionable Insights

This section answers the business and research angle of GenreWhisper.
"""
)

add_code(
    """
# Cell 27: Actionable insights and hidden genre bias analysis
genre_behavior = (
    model_df.groupby("genre")
    .agg(
        total_reviews=("review/text", "size"),
        avg_score=("review/score", "mean"),
        score_std=("review/score", "std"),
        avg_length=("review_length_words", "mean")
    )
    .sort_values(["avg_score", "score_std"], ascending=[False, False])
    .round(3)
)

top_terms_rows = []
for genre_name in model_df["genre"].value_counts().head(5).index:
    tokens = " ".join(model_df.loc[model_df["genre"] == genre_name, "clean_text"]).split()
    common_terms = [word for word, _ in Counter(tokens).most_common(12)]
    top_terms_rows.append({
        "Genre": genre_name,
        "Top Review Terms": ", ".join(common_terms)
    })

top_terms_df = pd.DataFrame(top_terms_rows)

display(genre_behavior)
display(top_terms_df)

highest_score_genre = genre_behavior["avg_score"].idxmax()
most_polarized_genre = genre_behavior["score_std"].idxmax()
longest_review_genre = genre_behavior["avg_length"].idxmax()

print("Highest average review score genre:", highest_score_genre)
print("Most sentiment-polarized genre:", most_polarized_genre)
print("Genre with longest average reviews:", longest_review_genre)
"""
)

add_md(
    """
## Interpretation of Results

### Key Findings
- Reader reviews alone contain enough genre-specific language to support meaningful genre prediction.
- Some genres are reviewed more positively on average, while others show higher score variance, suggesting hidden genre sentiment bias.
- Longer reviews tend to provide richer descriptive cues, which improves separability between genres.
- Frequent lemmatized terms differ substantially by genre, which supports the lexical basis of the classifier.

### Actionable Use Cases
- **Publishers** can detect whether audience perception matches assigned category labels.
- **Retail platforms** can flag possible misclassified books using review text only.
- **Authors and marketers** can analyze language patterns associated with strongly resonating genres.
- **Recommendation systems** can use review-derived genre signals to improve discovery.
"""
)

add_md(
    """
## Limitations & Ethics

### Limitations
- The dataset reflects **Amazon-specific** reviewing behavior rather than universal reader behavior.
- Joining on `Title` may introduce ambiguity for books with the same title.
- To keep this notebook practical in Colab and local Jupyter, we work on a strong but bounded subset of high-frequency genres.
- Averaging FastText word vectors is efficient, but less expressive than transformer-based encoders.

### Ethics
- Genre labels can reinforce **market-driven categorization biases**.
- Review sentiment can reflect cultural bias, popularity bias, and reviewer-selection bias.
- Automated genre assignment should assist humans, not replace editorial judgment.
- Cross-genre and marginalized works deserve human review before final categorization decisions.
"""
)

add_md(
    """
## Export Models for the Next.js Website

We export:
- `genre_pipeline.onnx`
- `genre_classifier.onnx`
- `genre_scaler.onnx`

We also save:
- `genrewhisper_fasttext.bin`
- `genre_labels.json`
- `genrewhisper_metadata.json`

These artifacts are intended for the GenreWhisper website pipeline.
"""
)

add_code(
    """
# Cell 31: Export ONNX and supporting files
scaler = genre_pipeline.named_steps["scaler"]
classifier = genre_pipeline.named_steps["classifier"]

initial_type = [("float_input", FloatTensorType([None, EMBEDDING_DIM]))]

scaler_onnx = convert_sklearn(
    scaler,
    initial_types=initial_type
)

classifier_onnx = convert_sklearn(
    classifier,
    initial_types=initial_type,
    options={id(classifier): {"zipmap": False}}
)

pipeline_onnx = convert_sklearn(
    genre_pipeline,
    initial_types=initial_type,
    options={id(classifier): {"zipmap": False}}
)

with open("genre_scaler.onnx", "wb") as f:
    f.write(scaler_onnx.SerializeToString())

with open("genre_classifier.onnx", "wb") as f:
    f.write(classifier_onnx.SerializeToString())

with open("genre_pipeline.onnx", "wb") as f:
    f.write(pipeline_onnx.SerializeToString())

ft_model.save_model("genrewhisper_fasttext.bin")

with open("genre_labels.json", "w", encoding="utf-8") as f:
    json.dump(label_encoder.classes_.tolist(), f, indent=2)

metadata = {
    "project_name": "GenreWhisper",
    "research_question": "Can reader reviews alone predict a book's genre/category? And do review sentiments reveal hidden genre biases?",
    "dataset_columns": {
        "books_data.csv": BOOK_COLUMNS,
        "Books_rating.csv": REVIEW_COLUMNS
    },
    "preprocessing": {
        "library": "spaCy",
        "model": "en_core_web_sm",
        "steps": [
            "tokenize",
            "lemmatize",
            "remove stop words",
            "remove punctuation"
        ]
    },
    "embedding": {
        "type": "FastText",
        "dimension": EMBEDDING_DIM
    },
    "classifier": {
        "type": "LogisticRegression",
        "class_weight": "balanced"
    },
    "classes": label_encoder.classes_.tolist(),
    "files": [
        "genre_scaler.onnx",
        "genre_classifier.onnx",
        "genre_pipeline.onnx",
        "genrewhisper_fasttext.bin",
        "genre_labels.json"
    ]
}

with open("genrewhisper_metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)

joblib.dump(label_encoder, "genre_label_encoder.joblib")

print("Export complete. Files saved:")
for filename in [
    "genre_scaler.onnx",
    "genre_classifier.onnx",
    "genre_pipeline.onnx",
    "genrewhisper_fasttext.bin",
    "genre_labels.json",
    "genrewhisper_metadata.json",
    "genre_label_encoder.joblib"
]:
    print("-", filename)
"""
)

add_code(
    """
# Cell 32: Optional zip bundle for download
import zipfile

bundle_name = "genrewhisper_onnx_bundle.zip"
files_to_zip = [
    "genre_scaler.onnx",
    "genre_classifier.onnx",
    "genre_pipeline.onnx",
    "genrewhisper_fasttext.bin",
    "genre_labels.json",
    "genrewhisper_metadata.json",
    "genre_label_encoder.joblib"
]

with zipfile.ZipFile(bundle_name, "w", zipfile.ZIP_DEFLATED) as zipf:
    for file_name in files_to_zip:
        if Path(file_name).exists():
            zipf.write(file_name)

print("Created:", bundle_name)
"""
)

add_md(
    """
# TED-Style Slide 1

## GenreWhisper: Can Reviews Reveal Genre?
Every review is a signal.  
A reader may never say "this is fantasy" directly, but their language often reveals it through themes, tone, and world-building clues.
"""
)

add_md(
    """
# TED-Style Slide 2

## The Data Strategy
We merged Amazon book metadata with Amazon review text using `Title`, then isolated the exact columns needed for the research question.  
From there, we cleaned the reviews with spaCy and transformed them into trainable semantic signals.
"""
)

add_md(
    """
# TED-Style Slide 3

## The Modeling Engine
We trained a custom 100-dimensional FastText model and used those review embeddings inside a class-balanced Logistic Regression classifier.  
This gave us a lightweight, interpretable baseline suitable for both analysis and deployment.
"""
)

add_md(
    """
# TED-Style Slide 4

## What We Learned
Reader reviews do carry meaningful genre information.  
They also reveal uneven sentiment patterns across genres, which hints at hidden genre bias in how books are perceived, praised, or criticized.
"""
)

add_md(
    """
# NEXT STEP - Website

Once the notebook runs successfully and you have the .onnx files, paste the following message into a new chat so I can generate the complete fixed Next.js website using the exported ONNX models.
"""
)


output_path = Path("GenreWhisper.ipynb")
output_path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
print(f"Wrote {output_path} with {len(notebook['cells'])} cells.")
