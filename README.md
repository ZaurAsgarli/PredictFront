# PredictHub - Community Prediction Market

A modern, responsive Next.js frontend for a community prediction market platform where users can predict outcomes of events and earn rewards.

## 🚀 Features

- **Event Browsing**: Explore upcoming events across various categories
- **Smart Predictions**: Make predictions with confidence levels and stakes
- **Leaderboard**: Compete with other users and track your ranking
- **User Profiles**: View detailed statistics and prediction history
- **Real-time Updates**: Track predictions and event outcomes
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode Support**: Automatic dark/light theme switching

## 🛠 Tech Stack

- **Framework**: Next.js 14
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Django backend API running (see Backend Setup section)

## 🏃‍♂️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Replace `http://localhost:8000/api` with your Django backend API URL.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── pages/
│   ├── _app.js              # Next.js app wrapper with router
│   └── _document.js         # HTML document structure
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx       # Main layout with navbar and footer
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── Footer.jsx       # Footer component
│   │   ├── EventCard.jsx    # Event display card
│   │   ├── PredictionForm.jsx    # Prediction submission form
│   │   ├── PredictionCard.jsx    # Prediction display card
│   │   └── LeaderboardTable.jsx  # Leaderboard table
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Landing page
│   │   ├── Events.jsx       # Events listing page
│   │   ├── EventDetail.jsx  # Single event detail page
│   │   ├── Predictions.jsx  # User predictions page
│   │   ├── Profile.jsx      # User profile page
│   │   ├── Leaderboard.jsx  # Global leaderboard page
│   │   ├── Login.jsx        # Login page
│   │   └── Signup.jsx       # Signup page
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios instance and interceptors
│   │   ├── auth.js          # Authentication services
│   │   ├── events.js        # Events API calls
│   │   ├── predictions.js   # Predictions API calls
│   │   └── leaderboard.js   # Leaderboard API calls
│   ├── routes.jsx           # React Router configuration
│   └── styles/
│       └── globals.css      # Global styles and Tailwind imports
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## 🔌 Backend Integration

This frontend expects a Django REST API with the following endpoints:

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User registration

### Events
- `GET /api/events/` - Get all events (supports filtering)
- `GET /api/events/:id/` - Get event details
- `GET /api/events/categories/` - Get event categories

### Predictions
- `POST /api/predictions/` - Create a prediction
- `GET /api/predictions/user/:userId/` - Get user's predictions
- `GET /api/predictions/event/:eventId/` - Get event predictions
- `PUT /api/predictions/:id/` - Update a prediction
- `DELETE /api/predictions/:id/` - Delete a prediction
- `GET /api/predictions/stats/:userId/` - Get user statistics

### Leaderboard
- `GET /api/leaderboard/` - Get global leaderboard
- `GET /api/leaderboard/weekly/` - Get weekly leaderboard
- `GET /api/leaderboard/monthly/` - Get monthly leaderboard
- `GET /api/leaderboard/user/:userId/` - Get user rank

## 📝 Expected Data Models

### Event Object
```json
{
  "id": 1,
  "title": "Event Title",
  "description": "Event description",
  "category": "Sports",
  "status": "active",
  "image": "https://example.com/image.jpg",
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-12-31T23:59:59Z",
  "participants_count": 100,
  "total_predictions": 250,
  "options": [
    {
      "id": 1,
      "name": "Option A",
      "current_odds": "2.5"
    }
  ]
}
```

### Prediction Object
```json
{
  "id": 1,
  "event": 1,
  "event_title": "Event Title",
  "outcome": 1,
  "outcome_name": "Option A",
  "confidence": 75,
  "stake": 50,
  "notes": "My reasoning...",
  "status": "pending",
  "reward": 125,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### User Object
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "joined_date": "2025-01-01T00:00:00Z"
}
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the primary color scheme:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Branding
- Update the logo and app name in `src/components/Navbar.jsx`
- Modify the hero section in `src/pages/Home.jsx`
- Change footer content in `src/components/Footer.jsx`

## 🔐 Authentication

The app uses JWT token-based authentication:
- Tokens are stored in `localStorage`
- Axios interceptors automatically attach tokens to requests
- Users are redirected to login on 401 responses

## 🚧 Future Enhancements

- [ ] Real-time notifications
- [ ] Social sharing features
- [ ] Advanced filtering and search
- [ ] Achievement system
- [ ] User avatars and profiles
- [ ] Activity timeline
- [ ] Prediction analytics dashboard
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@predicthub.com or open an issue in the repository.

---

Built with ❤️ using Next.js and React

