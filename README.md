# 🌟Trip Budget Tracker 🛤️💰
A collaborative budgeting application for group trips that helps track expenses and manage shared budgets in real-time.

https://github.com/user-attachments/assets/198df506-37c1-4295-8f7f-b7991206c715

## ✨ Features

- **🔒 User Authentication**:
  - Secure login with different roles (Admin, User, Viewer)
- **💵 Budget Management**:
  - Set personal budgets
  - Track expenses against budget
  - View remaining balance
- **📝 Expense Tracking**:
  - Add/edit expenses with categories
  - View personal and group expenses
  - Filter and sort expenses
- **👥 Group Features**:
  - View all members' budgets and spending
  - See combined remaining budget
- **📊 Data Visualization**:
  - Spending by category charts
  - Budget progress bars
- **📂 Data Export**:
  - Export expense data to CSV

## 🛠️ Technologies Used

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Custom role-based system
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify (recommended)

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Environment variables (see setup below)

### 📥 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/trip-budget-tracker.git
   cd trip-budget-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_ADMIN_USER=admin@example.com
   VITE_ADMIN_PASS=admin_password
   VITE_USER1=user1@example.com
   VITE_USER1_PASS=user1_password
   VITE_USER2=user2@example.com
   VITE_USER2_PASS=user2_password
   VITE_VIEWER_USER=viewer@example.com
   VITE_VIEWER_PASS=viewer_password
   ```

4. Set up your Supabase database:
   Create a table named `user_budgets` with the following schema:
   ```sql
   CREATE TABLE user_budgets (
     user_name TEXT PRIMARY KEY,
     data JSONB NOT NULL
   );
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🧑‍💻 Usage

### 🔑 Login:

- Enter your name and password.
- Different roles have different permissions:
  - **Admin**: Full access
  - **User**: Can manage own budget and expenses
  - **Viewer**: Read-only access

### 💰 Set Budget:

- After login, set your initial budget (can only be set once).

### ✍️ Add Expenses:

- Click "Add New Expense."
- Enter amount, description, and category.
- View your remaining budget update in real-time.

### 📋 View Group Activity:

- Toggle "Show All Users" to see everyone's budgets and expenses.
- Use filters to view specific categories, date ranges, or users.

### 📤 Export Data:

- Click the download icon to export filtered expense data to CSV.

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
