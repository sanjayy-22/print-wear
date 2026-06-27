# PrintWear — Virtual Polo Try-On Studio

PrintWear is a premium virtual try-on application that allows users to customize polo shirts (color, texture, and custom logo branding) and virtually try them on using WaveSpeed AI.

---

## Key Features

1. **Premium Knit Garment Selection**: 
   - Choose from high-quality, pre-textured knit polo shirts (Sand Beige, Navy Blue, and Olive Green).
   - Dynamic fabric texture overlay adjustments (Piquet mesh, Heather weave, or None).
   - Support for custom garment image uploads.

2. **Intuitive Logo Customization (Step 1)**:
   - Upload any custom branding logo (Default is the pre-configured Sairam Institutions logo).
   - Drag to position, scale, rotate, fade, and select mix-blend profiles (like `Multiply` to naturally match fabric shadows and texture).

3. **Seamless AI Try-On Flow (Step 2)**:
   - Upload your own portrait/upper-body photo.
   - Triggers the **WaveSpeed AI Clothes Changer** (`openai/gpt-image-2/edit`) model to realistically fit the customized shirt on your body shape, matching posture and room lighting.

4. **In-App Developer Key Settings**:
   - Save your private `WAVESPEED_API_KEY` directly inside the app using the Settings gear icon in the top header.
   - Your key is cached securely in your browser's local storage (`localStorage`) and never leaked to public commits.

5. **Blob-Based Downloads**:
   - Resolves browser CORS issues by downloading the final try-on output as a local blob, enabling safe, offline mockup sharing.

---

## Project Structure

- `server.ts` — Local Express server communicating with the official WaveSpeed AI SDK client.
- `src/App.tsx` — Main application logic, including canvas compositing, layout tracking, settings configuration, and API caller.
- `src/components/` — Modular React UI controls (Garment selectors, Logo adjustment utilities, Canvas compiler).
- `assets/` — Premium photorealistic polo shirt templates and default Sairam Institutions logo.

---

## How to Run Locally

### Prerequisites
- **Node.js** installed on your system.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment variables (Optional)
Create a `.env` file in the root directory and append your WaveSpeed API Key:
```env
WAVESPEED_API_KEY=your_wavespeed_api_key_here
```
*(Alternatively, you can skip this step and paste your API key directly inside the App settings panel in the UI).*

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start designing.
