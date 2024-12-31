# SymbiEat Management

Admin dashboard for managing the SymbiEat college food ordering system.

## Features

- 📊 Real-time Order Management
- 📦 Inventory Control
- 🔔 Order Notifications
- 📈 Sales Analytics
- 👥 Staff Management
- 📱 Responsive Design

## Tech Stack

### Frontend
- HTML5
- CSS3 (Custom CSS with Variables)
- JavaScript (ES6+)
- Font Awesome Icons
- Responsive Design
- CSS Animations
- Local Storage for State Management

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Mongoose (ODM)
- Passport Authentication
- RESTful API Architecture

## Project Structure

```
SYMBIEAT-MANAGEMENT/          # Root folder of the project
├── models/                   # Contains database schema and logic files
│   ├── inventory.js          # Manages inventory-related database operations
│   ├── orders.js             # Handles order-related database operations
│   ├── reservations.js       # Manages reservation data and operations
│   ├── staffuser.js          # Manages staff user-related data
│   └── users.js              # Handles general user-related data and authentication
├── node_modules/             # Contains all npm packages and dependencies (auto-generated)
├── public/                   # Publicly accessible assets (static files)
│   ├── images/               # Folder for image assets
│   │   ├── default-avatar.svg # Default avatar image
│   │   └── food.jpg          # Example food image
│   ├── js/                   # JavaScript files for the client side
│   │   └── dashboard.js      # Dashboard-related client-side scripts
│   └── styles/               # CSS files for styling
│       ├── auth.css          # Styles for authentication pages (login/signup)
│       ├── dashboard.css     # Styles specific to the dashboard
│       ├── login.css         # Login page-specific styles
│       ├── profile.css       # Styles for the user profile page
│       └── style.css         # Global styles for the application
├── views/                    # Contains template files (EJS templates for rendering HTML)
│   ├── home.ejs              # Homepage template
│   ├── login.ejs             # Login page template
│   ├── profile.ejs           # Profile page template
│   └── signup.ejs            # Signup page template
├── .gitignore                # Specifies files and directories to be ignored by Git
├── index.js                  # Main entry point of the application
├── LICENSE                   # License information for the project
├── package-lock.json         # Automatically generated file to lock dependencies versions
├── package.json              # Configuration file for npm (project metadata and dependencies)
└── README.md                 # Documentation and instructions for the project

```

## Features in Detail

### Order Management
- Real-time order tracking
- Accept/reject orders
- Order status updates
- Order history

### Inventory Control
- Stock management
- Low stock alerts
- Add/update menu items
- Price management

### Staff Management
- Staff profiles
- Orders & Revenue tracking

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/sayantann7/symbieat-management.git
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Start the development server:
   ```bash
   npx nodemon index.js
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Sayantan Nandi**  
First Year CSE Student