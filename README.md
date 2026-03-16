# 🍽 Ahmedabad Eats — Restaurant Recommendation System

Ahmedabad Eats is a web-based restaurant recommendation system designed as a college final year project. It uses a **Weighted Content-Based Filtering** algorithm to match user preferences (area, cuisine, budget, rating, diet, and time) against a dataset of **250+ realistic Ahmedabad restaurants** and returns the top 5 matches with explainable scores. Built with **React 18 + Vite** on the frontend and **Node.js/Express 4** on the backend, styled with **Tailwind CSS v3** and a custom Chromic Glass design system. No external APIs are required — the entire system runs locally.

---

## 📊 Algorithm Explanation

The recommendation engine uses Weighted Content-Based Filtering. Each restaurant is scored against user preferences across six dimensions:

```
┌──────────────────┬────────┬────────────────────────────────────────────┬──────────────────────────────────────────────────────┐
│ Component        │ Weight │ Scoring Logic                              │ Justification                                        │
├──────────────────┼────────┼────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ Cuisine Match    │ 0.30   │ Exact=1.0 │ Similar=0.7 │ None=0.0        │ Cuisine is the most explicitly stated preference     │
│ Rating Match     │ 0.20   │ score = rating/5.0 if ≥ min; penalised    │ High rating is a proxy for quality                   │
│ Area Match       │ 0.20   │ Exact=1.0 │ Adjacent=0.6 │ Zone=0.3       │ Distance is a hard constraint in Ahmedabad            │
│ Budget Match     │ 0.15   │ Exact=1.0 │ 1 tier off=0.5 │ 2 off=0.0   │ Budget is flexible — users tolerate ±1 tier           │
│ Diet Preference  │ 0.10   │ Match=1.0 │ Both=0.8 │ Mismatch=0.0      │ Veg/non-veg is a hard constraint for Gujarati users   │
│ Time Availability│ 0.05   │ Open=1.0 │ Closing=0.5 │ Closed=0.0      │ Most restaurants are open during common meal times    │
└──────────────────┴────────┴────────────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

**Final Score** = `Σ(weight_i × match_i) / Σ(weight_i) × 100`

---

## 📁 Dataset Description

The dataset consists of **250+ restaurant entries** stored in `restaurants.json`, designed to be synthetic but realistic for Ahmedabad.

### Field Glossary

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (`rest_001` format) |
| `name` | string | Restaurant name |
| `area` | string | One of 24 Ahmedabad localities |
| `cuisine` | string[] | Array of cuisine types (min 1) |
| `rating` | number | Star rating (3.0–5.0, one decimal) |
| `price_range` | string | `low`, `medium`, or `high` |
| `price_symbol` | string | `₹`, `₹₹`, or `₹₹₹` |
| `distance_km` | number | Distance from area centre |
| `veg_nonveg` | string | `veg`, `nonveg`, or `both` |
| `opening_time` | string | Opening time (HH:MM format) |
| `closing_time` | string | Closing time (HH:MM format) |
| `serves_breakfast` | boolean | Available for breakfast |
| `serves_lunch` | boolean | Available for lunch |
| `serves_dinner` | boolean | Available for dinner |
| `image_url` | string | Image path pattern |
| `tags` | string[] | Search tags |
| `phone` | string | Contact number |
| `short_description` | string | Brief description (max 120 chars) |

### Distribution Statistics
- **Total entries**: 250+
- **Areas covered**: 24 Ahmedabad localities
- **Cuisine types**: 15 (Gujarati, Punjabi, South Indian, Chinese, Italian, Mexican, Fast Food, Cafe, Mughlai, Continental, Rajasthani, Seafood, Pizza, Street Food, Bakery)
- **Price distribution**: ~30% Low, ~45% Medium, ~25% High
- **Diet distribution**: ~40% Veg, ~25% Non-Veg, ~35% Both

---

## ⚙️ Installation

### Prerequisites
- **Node.js** 20+ 
- **npm** 9+

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd ahmedabad-eats

# 2. Install root dependencies (workspaces + concurrently)
npm install

# 3. Install server dependencies
cd server && npm install && cd ..

# 4. Install client dependencies
cd client && npm install && cd ..
```

---

## 🚀 Running the Project

### Option 1: Single command (recommended)
```bash
npm run dev
```
This uses `concurrently` to start both the server and client simultaneously.

### Option 2: Separate terminals
```bash
# Terminal 1 — Backend API server (port 3001)
npm run dev:server

# Terminal 2 — Frontend dev server (port 5173)
npm run dev:client
```

Open **http://localhost:5173** in your browser.

---

## 🎓 Viva Explanation Points

1. **Algorithm Choice**: Content-based filtering was chosen because no user-item interaction matrix exists. Collaborative filtering requires historical user behaviour data, which is unavailable at launch — this is the classic cold-start problem.

2. **Weight Rationale**: Weights were determined by reasoning about Ahmedabad dining behaviour, not ML. Cuisine (0.30) is highest because it's the most explicitly stated preference. Time (0.05) is lowest because most restaurants overlap with common meal times.

3. **Cold Start Absence**: Content-based filtering avoids the cold start problem entirely — it needs only item features (restaurant attributes) and user preferences (filter inputs), both available from the first interaction.

4. **Normalisation**: The final score divides by the sum of weights (`Σ(weight_i)`), ensuring the output is always in [0, 100] regardless of which filters are active or omitted.

5. **AREA_ADJACENCY_MAP**: Built manually using geographic knowledge of Ahmedabad. Raw GPS coordinates wouldn't capture practical commute realities — two areas 3 km apart across the Sabarmati are less "adjacent" than two areas 4 km apart on the same road.

6. **Cuisine Similarity**: CUISINE_SIMILARITY_MAP assigns 0.7 (not 1.0) for related cuisines. Example: Punjabi ↔ Mughlai share tandoori cooking but differ in flavour profiles. This avoids penalising users who'd be satisfied with a related cuisine.

7. **No External APIs**: The system is fully local — no Zomato/Swiggy/Google APIs. This ensures: zero rate limits, no API keys, no internet dependency during a viva demonstration, and full control over the data.

8. **Dataset Design**: 250+ entries with realistic Ahmedabad names, distributed across 24 areas with controlled price/rating/diet distributions matching the city's demographics (high vegetarian proportion reflecting Jain/Gujarati culture).

9. **Scoring Formula**: `normalised_score = (Σ(weight_i × match_i) / Σ(weight_i)) × 100`. Each `match_i` ∈ [0, 1], so the final score ∈ [0, 100]. The formula is a weighted cosine-like similarity in a 6-dimensional preference space.

10. **Extension Path — Collaborative Filtering**: Once user interaction data is collected (clicks, favourites, repeat visits), a user-item interaction matrix can be built. Then hybrid filtering (content-based + collaborative) can be implemented using matrix factorisation, improving recommendations through behavioural patterns.

---

## 🔮 Future Improvements

- **Collaborative Filtering** — Once user interaction history is collected, implement hybrid collaborative + content-based filtering for improved personalisation.
- **Google Maps Integration** — Use the Google Maps Distance Matrix API for real distance calculations instead of the hand-built adjacency map.
- **Live Restaurant Data** — Integrate Zomato/Swiggy APIs for real-time restaurant information, menus, and reviews.
- **User Reviews & Ratings** — Allow users to submit their own ratings, building the feedback loop needed for collaborative filtering.
- **Personalisation via Implicit Feedback** — Track user interactions (clicks, time spent, repeated searches) to learn implicit preferences and improve recommendations over time.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS v3, CSS Custom Properties |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js 20, Express 4 |
| Data | Static JSON (250+ entries) |
| Algorithm | Weighted Content-Based Filtering |

---

*Ahmedabad Eats PRD v1.0 · Final Year Project · All rights reserved*
