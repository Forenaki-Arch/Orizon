# 🌐 Orizon

> Real-time location sharing with your circle.

Add people by scanning their QR code, see where they are on the map, and control your visibility with one tap. Built as a mobile-first PWA — installable on iOS and Android with no app store required.

![PWA](https://img.shields.io/badge/PWA-ready-3b82f6?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-backend-3ecf8e?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)

---

## ✨ Features

- 📍 **Live GPS tracking** — real-time position updates via `watchPosition` with high accuracy
- 📷 **QR code pairing** — add contacts by scanning their code, no usernames or phone numbers needed
- 👁️ **Instant visibility toggle** — turn your dot on/off with one tap, friends see it change immediately
- 🗺️ **Realtime map** — contact markers update live via Supabase WebSocket channels
- 📏 **Distance display** — see how far each contact is from your current position
- 🔒 **Privacy by design** — Row Level Security ensures your location is only visible to accepted connections when you choose
- 📱 **PWA** — installable on iOS (Safari) and Android (Chrome), works partially offline
- ⚡ **Zero build step** — plain HTML/CSS/JS, no bundler required

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Map | Leaflet.js + OpenStreetMap |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| Realtime | Supabase Channels (WebSocket) |
| QR Generate | QRCode.js |
| QR Scan | jsQR |
| Hosting | Vercel |
| PWA | Service Worker + Web App Manifest |

---

## 📁 Project Structure

```
orizon/
├── Public/
│   ├── index.html        # Full application (single file)
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service Worker (offline support)
├── vercel.json           # Vercel deployment config
└── README.md
```

---

## 🗄️ Database Schema

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | References `auth.users` |
| `display_name` | text | User's visible name |
| `email` | text | User email |
| `created_at` | timestamptz | Account creation time |

### `locations`
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid | Primary key, references `auth.users` |
| `lat` | float8 | Latitude |
| `lng` | float8 | Longitude |
| `is_visible` | boolean | Whether position is shared |
| `last_seen` | timestamptz | Last GPS update (auto-updated) |

### `connections`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_a` | uuid | Initiating user |
| `user_b` | uuid | Receiving user |
| `status` | text | `pending` or `accepted` |
| `created_at` | timestamptz | Connection creation time |

---

## 🔐 Security

Row Level Security is enforced at the database level:

- **Locations** are readable by another user only if `is_visible = true` **and** an accepted connection exists between the two users
- **Connections** are visible only to the two users involved
- **Profiles** are readable by any authenticated user
- The `anon` key used in the frontend is safe to expose — it cannot bypass RLS policies

---

## 📲 PWA Installation

**iOS** — Open in Safari → Share button → "Add to Home Screen"

**Android** — Open in Chrome → Menu (⋮) → "Install app"

---

## 🔗 How QR Pairing Works

1. User A opens the QR modal and displays their code
2. User B scans it using the in-app camera scanner
3. A confirmation modal appears for User B
4. On acceptance, a connection record is written to the `connections` table
5. Both users can now see each other's location (when visible) ✅

The QR payload is a base64-encoded JSON token containing the user ID, display name, and a timestamp. It does not contain any authentication credentials.

---

## 📄 License

MIT — free to use, modify, and distribute.
