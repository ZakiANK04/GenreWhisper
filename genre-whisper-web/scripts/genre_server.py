import json
import re
import sys
from pathlib import Path

import fasttext
import numpy as np
import onnxruntime as ort
import spacy


ROOT = Path(__file__).resolve().parents[2]
FASTTEXT_PATH = ROOT / "genrewhisper_fasttext.bin"
PIPELINE_PATH = ROOT / "genre_pipeline.onnx"
LABELS_PATH = ROOT / "genre_labels.json"

nlp = spacy.load("en_core_web_sm", disable=["parser", "ner", "textcat"])
ft_model = fasttext.load_model(str(FASTTEXT_PATH))
session = ort.InferenceSession(str(PIPELINE_PATH), providers=["CPUExecutionProvider"])
labels = json.loads(LABELS_PATH.read_text(encoding="utf-8"))

input_name = session.get_inputs()[0].name


def normalize_review_text(text: str) -> str:
    text = str(text).lower().strip()
    return re.sub(r"\s+", " ", text)


def preprocess_text(text: str):
    doc = nlp(normalize_review_text(text))
    tokens = []
    for token in doc:
        if token.is_stop or token.is_punct or token.is_space or token.like_num:
            continue
        if not token.is_alpha:
            continue
        lemma = token.lemma_.strip().lower()
        if not lemma or lemma == "-pron-" or len(lemma) < 3:
            continue
        tokens.append(lemma)
    return tokens


def sentence_vector(tokens):
    if not tokens:
        return np.zeros((1, 100), dtype=np.float32)
    vectors = np.array([ft_model.get_word_vector(word) for word in tokens], dtype=np.float32)
    return np.mean(vectors, axis=0, keepdims=True).astype(np.float32)


def predict(text: str):
    tokens = preprocess_text(text)
    vector = sentence_vector(tokens)
    label_idx, probabilities = session.run(None, {input_name: vector})
    probs = probabilities[0].tolist()

    ranked = sorted(
        [
            {"genre": labels[idx], "confidence": float(prob)}
            for idx, prob in enumerate(probs)
        ],
        key=lambda item: item["confidence"],
        reverse=True,
    )
    top3 = ranked[:3]
    predicted_genre = top3[0]["genre"]
    confidence = top3[0]["confidence"] * 100
    explanation_tokens = tokens[:8]

    return {
        "genre": predicted_genre,
        "confidence": confidence,
        "top3": [
            {
                "genre": item["genre"],
                "confidence": item["confidence"] * 100,
            }
            for item in top3
        ],
        "clean_tokens": explanation_tokens,
        "token_count": len(tokens),
    }


def main():
    print(json.dumps({"status": "ready"}), flush=True)
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            request = json.loads(raw)
            response = {"id": request.get("id")}
            response["result"] = predict(request.get("text", ""))
        except Exception as exc:
            response = {
                "id": request.get("id") if "request" in locals() else None,
                "error": str(exc),
            }
        print(json.dumps(response), flush=True)


if __name__ == "__main__":
    main()
