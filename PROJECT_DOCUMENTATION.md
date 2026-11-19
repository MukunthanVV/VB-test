# VB Associates Web Platform — Developer & System Handover Documentation

**Last Verified & Updated**: November 19, 2026  
**Primary Custom Domain**: [https://vbassociates.bond](https://vbassociates.bond)  
**Firebase Fallback Domain**: [https://vbassociate-34c7a.web.app](https://vbassociate-34c7a.web.app)  
**Source Repository**: [https://github.com/MukunthanVV/VB-test](https://github.com/MukunthanVV/VB-test) (Branch: `main`)

---

## 1. Quick Start for New Developers

To get the project running locally within 2 minutes:

```bash
# 1. Clone repository
git clone https://github.com/MukunthanVV/VB-test.git
cd VB-test

# 2. Install dependencies (Node 20+ recommended)
npm install

# 3. Start local development server
npm run dev
# Server boots at http://localhost:5173

# 4. Type check and production build
npm run build
# Runs `tsc -b && vite build`, outputs to `dist/`

# 5. Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 2. Important Dates, Expiries & Renewal Checklist

| Service | Provider | Identifier / Record | Key Date | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Domain Registration** | Hostinger | `vbassociates.bond` | **November 18, 2027** *(Expiry)* | **Renew annual registration** before Nov 18, 2027 via [Hostinger Control Panel](https://www.hostinger.com/). |
| **Domain Creation Date** | Hostinger | `vbassociates.bond` | November 18, 2026 | Initial registration date. |
| **SSL / TLS Certificate** | Google Trust Services (GTS WR3) | `CN=vbassociates.bond` | Auto-renews every 90 days (Current: Feb 17, 2027) | **Fully automated** by Firebase Hosting as long as DNS points to Firebase IP (`199.36.158.100`). |
| **Firestore Database** | Google Cloud / Firebase | `vbassociate-34c7a` | Ongoing (Spark / Blaze Plan) | Monitor monthly read/write quotas on [Firebase Console](https://console.firebase.google.com/project/vbassociate-34c7a/overview). |
| **Media Hosting** | Cloudinary | Cloud: `dgssrfsli` | Free Tier (Active) | Monitor monthly bandwidth & credit usage on [Cloudinary Dashboard](https://cloudinary.com/). |

---

## 3. Cloud Services & Critical Credentials

### A. Firebase Project
- **Project ID**: `vbassociate-34c7a`
- **Project Number**: `27398532865`
- **Web App ID**: `1:27398532865:web:3501cc45f5217b3d90b500`
- **Storage Bucket**: `vbassociate-34c7a.firebasestorage.app`
- **Web API Key**: `AIzaSyBxJ-TD4z6tyBNYmlYiqBQAzCC_Hmw3rsQ`
- **Firebase Config File**: `src/firebase.ts`
- **Authorized OAuth Domains**:
  - `localhost`
  - `vbassociates.bond`
  - `vbassociate-34c7a.web.app`
  - `vbassociate-34c7a.firebaseapp.com`

### B. Cloudinary Media Storage
- **Cloud Name**: `dgssrfsli`
- **Unsigned Upload Preset**: `vbassociate`
- **Upload Endpoint**: `https://api.cloudinary.com/v1_1/dgssrfsli/image/upload`
- **Pre-upload Compression**: Uses `browser-image-compression` (< 1MB per image, max 1920px width) before sending to Cloudinary to save bandwidth and storage.
- **Component**: `src/components/admin/ItemEditorModal.tsx`

---

## 4. Admin Access & Authentication

The administrative portal runs via Google Sign-In (`signInWithPopup`). The client does **not** need a separate username/password or manual pre-registration in Firebase Auth; logging in with their Google account auto-provisions their credentials.

### Authorized Admin Emails
Admin emails are defined in `src/contexts/AuthContext.tsx`:
```typescript
const ADMIN_EMAILS = [
  'tharunkarthikav21@gmail.com',
  'vickybond123@gmail.com',
];
```

### How to Access Admin Mode:
1. Open the website: `https://vbassociates.bond/admin`
2. Click **Sign in with Google** and choose either `tharunkarthikav21@gmail.com` or `vickybond123@gmail.com`.
3. Once logged in:
   - Edit, Add, and Delete buttons appear directly on the website sections.
   - An **ADMIN** link appears in the main navigation.
   - Any edits or image uploads save directly to Firestore and Cloudinary in real time.

---

## 5. Technology Stack & Key Libraries

| Layer | Tool / Library | Version | Description |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^19.2.6` | Client-side UI library |
| **Bundler & Tooling** | Vite | `^8.0.12` | Lightning-fast development & production tree-shaking |
| **Language** | TypeScript | `~6.0.2` | Strict type checking across components and models |
| **Styling** | Tailwind CSS | `^4.3.1` | Tailwind v4 with `@tailwindcss/postcss` |
| **Routing** | React Router DOM | `^7.18.1` | Standard clean URLs (`BrowserRouter`) with SPA redirect rules |
| **Motion & FX** | Framer Motion | `^12.40.0` | Scroll-triggered animations, page transitions, and modals |
| **Canvas / 3D** | Three.js & Fiber | `^0.184.0` / `^9.6.1` | Topographical animated background mesh (`AnimatedTopo.tsx`) |
| **Icons** | Lucide React | `^1.16.0` | Minimal, high-resolution SVG icon set |
| **Database** | Firebase Firestore | `^12.16.0` | Real-time NoSQL cloud database |
| **Media Optimizer** | Browser Image Compression | `^2.0.2` | Automatic image downscaling and compression before upload |

---

## 6. Architecture & Special Implementations

### 1. Zero-Flicker Instant Caching (`localStorage`)
To eliminate the split-second blank state or outdated content flash on page refresh:
- Components initialize their local React state from `localStorage.getItem("cache_<section>")`.
- Fallbacks in source files are kept in sync with production content.
- Firestore real-time listeners (`onSnapshot`) quietly update both the UI state and `localStorage` as soon as network updates arrive.
- **Cache Keys**: `cache_hero`, `cache_about`, `cache_mindset`, `cache_disciplines`, `cache_services`, `cache_projects`, `cache_testimonials`, `cache_journals`.

### 2. Clean Routing & Legacy Hash Redirection
- Switched from `HashRouter` (`/#/`) to modern `BrowserRouter` for clean, professional URLs:
  - `https://vbassociates.bond/`
  - `https://vbassociates.bond/admin`
  - `https://vbassociates.bond/division/:id`
- An automatic redirector (`LegacyHashRedirector` in `src/App.tsx`) handles any old bookmarks or shared links containing `/#/` and rewrites them cleanly without breaking.
- Firebase Hosting is configured in `firebase.json` with SPA rewrite `{"source": "**", "destination": "/index.html"}`.

### 3. Responsive Header & Breakpoints
- Breakpoint for the full desktop menu is set to `lg` (1024px+).
- On screens under 1024px (tablets, foldables, phones), an optimized slide-down drawer with outside-click and escape listeners prevents menu collisions and overlaps.

---

## 7. Firestore Collections & Schema Guide

| Collection | Document ID | Purpose & Key Fields |
| :--- | :--- | :--- |
| `hero` | `main` | `title`, `subtitle`, `btn1_text`, `btn2_text` |
| `about` | `main` | `title_p1`, `title_italic`, `title_p2`, `desc_1`, `desc_2`, `stat1_num`, `stat1_label`, `stat2_num`, `stat2_label` |
| `mindset` | `main` | `title`, `image[]`, `val1_title` – `val4_desc`, `quoteText` |
| `disciplines` | `main` | `title`, `description`, `image[]`, `trait1_title` – `trait3_desc` |
| `services` | Auto ID | `number`, `category`, `title`, `description`, `images[]`, `deleted: boolean` |
| `projects` | Auto ID | `title`, `desc`, `year`, `divisionId`, `isFeatured`, `images[]`, `deleted: boolean` |
| `testimonials` | Auto ID | `name`, `title`, `division`, `quote`, `image` |
| `journals` | Auto ID / `j1` | `title`, `category`, `date`, `content` |
| `contact` | `info` | `address`, `email`, `phoneDisplay`, `whatsappPhone`, social links |
| `division_pages`| `${pageId}_hero`| Background video/image URL and header text for specific division subpages |

---

## 8. Git Repository & Deployment Workflow

### Git Branching
- Default working and production branch is `main`.
- Remote: `https://github.com/MukunthanVV/VB-test.git`

### Deployment Steps:
1. Make code edits and verify with `npm run build`.
2. Commit changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. Deploy frontend to live site:
   ```bash
   firebase deploy --only hosting
   ```
