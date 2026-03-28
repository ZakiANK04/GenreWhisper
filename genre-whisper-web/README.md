# GenreWhisper Web

This folder contains the interactive website for GenreWhisper.

It is built with:
- Next.js
- TypeScript
- Tailwind CSS
- GSAP
- Three.js
- React Three Fiber

The app includes:
- a cinematic homepage,
- review-based genre prediction,
- upload-based file analysis,
- insights and about pages,
- a server-backed real inference path using Python 3.12 + FastText + ONNX.

For the complete technical overview, project purpose, architecture, and deployment notes, read the root project README:

- [../README.md](../README.md)

## Local Run

```powershell
npm install
npm run build -- --webpack
npm run start -- --hostname 127.0.0.1 --port 3005
```

Then open:

```text
http://127.0.0.1:3005
```
