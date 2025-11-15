# 🌟 Trip Budget Tracker 🛤️💰

A modern, collaborative expense tracking application for group trips with **Google OAuth authentication** and **real-time Firebase backend**. Track expenses, manage budgets, and generate detailed trip reports effortlessly!

https://github.com/user-attachments/assets/198df506-37c1-4295-8f7f-b7991206c715

## ✨ Features

### 🔐 Authentication & User Management
- **Google OAuth Sign-In** - Secure, one-click authentication
- **User Profiles** - Automatic profile creation with Google account info
- **Role-Based Access** - Admin and member roles with appropriate permissions

### 👥 Multi-Group Support
- **Create Trip Groups** - Set trip name and total budget
- **Invite Code System** - Join groups using unique invite codes
- **Personal Dashboard** - View all your groups in one place
- **Group Management** - Admins can manage members and delete groups

### 💰 Expense Tracking
- **Add Expenses** - Track who paid, amount, category, description, and date
- **Edit/Delete** - Full CRUD operations on your own expenses
- **Category System** - Predefined categories (Food, Taxi, Hotels, etc.)
- **Real-Time Updates** - See expenses as they're added

### 🔍 Advanced Filtering
- **Smart Search** - Filter by description, category, or member name
- **Date Range** - Filter expenses by date
- **Amount Range** - Filter by expense amount
- **Multi-Select Filters** - Category and member filters
- **Custom Filters** - Save your favorite filter combinations

### 📊 Statistics & Reports
- **Budget Progress** - Visual progress bars for budget tracking
- **Category Breakdown** - See spending by category
- **Member Stats** - Track each member's contributions
- **Trip Log Export** - Generate beautiful HTML reports with all trip data

### 🎨 Modern UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Tailwind CSS** - Beautiful, modern styling
- **Smooth Animations** - Polished user experience
- **Dark Mode Ready** - Easy to add dark mode support

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore + Authentication)
- **Authentication**: Google OAuth via Firebase Auth
- **Icons**: Lucide React
- **Package Manager**: pnpm
- **Security**: Firestore Security Rules

## 🚀 Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide!

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Google account
- Firebase account (free tier works great!)

## 📥 Installation

### Option 1: Quick Setup (Recommended)

Follow the [QUICKSTART.md](./QUICKSTART.md) guide for a streamlined setup process!

### Option 2: Detailed Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/trip-budget-tracker.git
   cd trip-budget-tracker
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up Firebase:**

   Follow the comprehensive [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) guide which covers:
   - Creating a Firebase project
   - Enabling Google OAuth
   - Setting up Firestore database
   - Configuring security rules
   - Getting your credentials

4. **Configure environment variables:**

   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Edit .env and add your Firebase credentials
   ```

   Your `.env` should look like:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. **Deploy Firestore security rules:**

   ```bash
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

6. **Start the development server:**

   ```bash
   pnpm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser!

## 🧑‍💻 Usage

### 🔐 Authentication

1. Click **"Sign in with Google"**
2. Select your Google account
3. Grant permissions
4. You're in! Your profile is automatically created

### 👥 Creating a Group

1. Click **"Create Group"** on your dashboard
2. Enter trip name (e.g., "Europe Trip 2025")
3. Set total budget (e.g., $5000)
4. Get your unique **invite code**
5. Share the code with trip members!

### 🤝 Joining a Group

1. Click **"Join Group"** on your dashboard
2. Enter the invite code
3. You're now a member!

### 💸 Adding Expenses

1. Select a group from your dashboard
2. Click **"Add Expense"**
3. Fill in details:
   - Amount
   - Description
   - Category
   - Date
4. Click **"Add"**

### 🔍 Filtering Expenses

- **Search** by description or member name
- **Filter by category** (Food, Taxi, Hotels, etc.)
- **Filter by member** to see who spent what
- **Date range** for specific time periods
- **Amount range** for expense size
- **Save custom filters** for quick access

### 📊 Viewing Statistics

- See total spent vs. budget
- View spending by category
- Track each member's contributions
- Monitor budget progress in real-time

### 📄 Generating Reports

1. Select a group
2. Click **"Generate Report"**
3. Download beautiful HTML trip log with:
   - Complete expense list
   - Category breakdown
   - Member statistics
   - Budget summary

### 🗑️ Managing Groups

**As Admin (creator):**
- Delete group (auto-generates trip log first)
- View all members
- Manage group settings

**As Member:**
- Add/edit/delete your own expenses
- View group expenses
- Leave group (coming soon)

## 📂 Project Structure

```
/src
├── App.jsx               # Main application component
├── main.jsx              # Application entry point
/public                   # Static assets
.env                      # Environment variables
```

## 🌍 Deployment

To deploy this project:

1. Set up a hosting service (e.g., Vercel, Netlify).
2. Configure environment variables in your hosting platform.
3. Deploy using the platform's instructions.

### Recommended deployment command:
```bash
npm run build && npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Maintainer: **Arpan Patra**  
Project Link: [Trip Budget Tracker Repository](https://trip-budget.vercel.app/)
