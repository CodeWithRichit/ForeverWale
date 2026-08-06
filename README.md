# ForeverWale — Premium Matrimonial Website

A fully static, responsive matrimonial website built with **only HTML5, CSS3, and vanilla JavaScript** — no frameworks, no backend. Designed in a Luxury Glassmorphism + Modern Minimal + Romantic style.

## Design System

| Token | Value |
|---|---|
| Background | `#FFF8FB`, `#FDFDFD`, `#F8F9FC` |
| Primary | `#E91E63` |
| Secondary | `#C084FC` |
| Accent | `#F8BBD0` |
| Success | `#22C55E` |
| Dark backgrounds | `#121212`, `#18181B`, `#202124` |
| Headings | Playfair Display |
| Body | Poppins |
| Buttons / Cards / Images radius | 12px / 20px / 18px |

Glass cards use `backdrop-filter: blur(18px)` with translucent backgrounds and soft borders/shadows. Every page supports **light and dark mode**, toggled from the navbar and remembered via `localStorage`.

## Folder Structure

```
ForeverWale/
├── assets/            images, icons, logo (placeholders)
├── index/              Home page
├── login/               Login page
├── signup/              Signup / registration
├── profiles/            Browse profiles
├── profile-details/     Single profile detail view
├── search/               Advanced search with filters
├── matches/              Compatibility matches
├── stories/               Success stories
├── about/                 About us
├── contact/               Contact form
└── README.md
```

Each page folder has its own `.html`, `.css`, and `.js` file — nothing is combined or shared as a physical file, though all pages follow the same design tokens and navbar/footer markup for consistency.

## Notes

- Profile photos use the free `pravatar.cc` placeholder image service — swap in real photos via `assets/images/`.
- All forms (`login`, `signup`, `search`, `contact`) run entirely client-side: they validate input and show a success message, with **no backend or data storage**. Connect them to a real API when ready.
- Search and Matches pages render sample data from an in-file JS array — replace with real API calls when a backend is added.
- Built to be responsive across Desktop, Laptop, Tablet, and Mobile using CSS Media Queries only.

## Running Locally

No build step needed — open `index/index.html` directly in a browser, or serve the folder with any static server:

```bash
npx serve ForeverWale
```
