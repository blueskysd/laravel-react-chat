# Chat App Prototype

A lightweight Laravel + React (Inertia) prototype demonstrating **1-to-1 messaging**, **basic moderation**, and **polling** for near-real-time updates.  
Designed as a proof of concept for modern, compliant, user-to-user communication.

---

## ✨ Features

- **1:1 Messaging**
  - Authenticated users can exchange direct messages.
  - Messages are grouped by date with timestamps and read receipts.

- **Message Moderation**
  - Users can **report** inappropriate messages (flag icon).
  - Reported messages display a “pending moderation” notice.
  - Deleted messages are replaced with placeholder text.

- **Idempotent Message Sends**
  - Each message includes a unique `Idempotency-Key` header to prevent duplicates and handle retries safely.

- **Polling**
  - The UI polls `/api/chat/{user}/messages` every 10 seconds for updates.
  - Automatically scrolls to the newest message and refreshes after sends.

- **UI Details**
  - Sender and receiver bubbles aligned left/right.
  - Hover actions (Flag / Delete) with invisible spacers to maintain alignment.
  - TailwindCSS styling, Heroicons, and smooth scroll behavior.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend | Laravel 11 |
| Frontend | React + TypeScript (Inertia.js) |
| Styling | TailwindCSS |
| Icons | Heroicons React |
| Auth | Laravel Breeze |
| Database | SQLite / MySQL (configurable) |

---

## ⚙️ Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/jennyharle/laravel-react-chat.git
   cd mht-chat
