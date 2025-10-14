# Garissa County Project Monitoring Dashboard

A comprehensive, GIS-enabled web application for tracking, managing, and analyzing development projects across Garissa County, Kenya.

## 🌟 Features

### Core Functionality
- **Real-time Dashboard**: Live statistics and project overview
- **Interactive GIS Mapping**: Visual project locations with Leaflet.js
- **Project Management**: Add, edit, delete, and track projects
- **Bulk Data Upload**: CSV import for multiple projects
- **User Management**: Role-based access control
- **AI-Powered Reports**: Intelligent insights using Google Gemini Pro
- **Advanced Analytics**: Budget analysis and timeline tracking

### Authentication Options
- **Gmail OAuth**: Sign in with Google accounts
- **UPN Login**: Unique Personal Number authentication
- **Default Admin**: UPN: 123456789, Password: Admin.123!

### Garissa County Integration
- **Complete Sub-county Data**: All 11 sub-counties with wards
- **Geographical Coordinates**: Accurate location data
- **County Branding**: Garissa County logo integration
- **Department Structure**: 10 official county departments

## 🚀 Quick Start

### 1. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Create Firestore database
4. Update `firebase-config.js` with your project credentials

### 2. Gemini AI Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `firebase-config.js` with your Gemini API key

### 3. Deploy
1. Upload all files to your web server
2. Configure Firebase Hosting (optional)
3. Set up your first admin user

## 📁 File Structure

```
Dashboard/
├── index.html              # Main application file
├── styles.css              # Custom styling
├── firebase-config.js      # Firebase configuration
├── app.js                  # Main application logic
├── auth-handlers.js        # Authentication functions
├── project-handlers.js     # Project management
├── utils.js                # Utility functions
├── projects_template.csv   # Bulk upload template
├── Garissa_logo.png        # County logo
└── README.md               # This file
```

## 🏗️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: Google Firebase
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Maps**: Leaflet.js
- **Charts**: Chart.js
- **Icons**: Lucide Icons
- **AI**: Google Gemini Pro

## 👥 User Roles

### Super Admin
- Full system access
- User management
- All project access
- System configuration

### Department Admin
- Department-specific projects
- Project CRUD operations
- Reports and analytics
- Limited user management

## 📊 Data Model

### Projects Collection
```javascript
{
  name: "Project Name",
  description: "Project Description",
  subCounty: "Sub-county Name",
  ward: "Ward Name",
  location: GeoPoint(lat, lng),
  department: "Department Name",
  status: "Ongoing|Completed|Stalled|Planning",
  startDate: "YYYY-MM-DD",
  expectedCompletionDate: "YYYY-MM-DD",
  budget: 1000000,
  expenditure: 250000,
  sourceOfFunds: "Funding Source",
  createdAt: "ISO Date",
  createdBy: "user@email.com",
  lastUpdated: "ISO Date",
  updatedBy: "user@email.com",
  projectId: "PRJ-xxxxx"
}
```

### Users Collection
```javascript
{
  email: "user@email.com",
  upn: "123456789",
  department: "Department Name",
  role: "admin|superadmin",
  createdAt: "ISO Date",
  createdBy: "admin@email.com"
}
```

## 🗺️ Garissa County Data

### Sub-counties (11)
- Garissa Township
- Balambala
- Lagdera
- Dadaab
- Fafi
- Ijara
- Hulugho
- Sankuri
- Masalani
- Bura East
- Bura West

### Departments (10)
1. Education, ICT & Libraries
2. Culture, Gender, PWDs, Social Services, Youth & Sports
3. Finance, Revenue and Economic Planning
4. Agriculture, Livestock & Pastoral Economy
5. Water, Environment, Climate change & Natural Resources
6. County Affairs, Public Service & Administration
7. Trade, Investment & Enterprise Development
8. Roads, Transport, Housing & Public Works
9. Lands, Physical Planning & Urban Development
10. Health and Sanitation

## 🔧 Configuration

### Firebase Configuration
Update `firebase-config.js`:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Gemini API Configuration
```javascript
const apiKey = "your-gemini-api-key";
```

## 📈 Usage Examples

### Adding a New Project
1. Navigate to Projects section
2. Click "Add New Project"
3. Fill in all required fields
4. Select sub-county and ward (coordinates auto-fill)
5. Save project

### Bulk Upload
1. Download `projects_template.csv`
2. Fill in project data
3. Upload via "Bulk Upload" button
4. Confirm upload

### AI Reports
1. Go to AI Reports section
2. Enter your query (e.g., "Show me all stalled projects")
3. Click "Generate AI Report"
4. View intelligent insights

## 🔒 Security

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }
    
    match /projects/{projectId} {
      allow read: if request.auth != null && 
                  (getUserRole() == 'superadmin' || getUserDepartment() == resource.data.department);
      allow write: if request.auth != null &&
                    (getUserRole() == 'superadmin' || getUserDepartment() == request.resource.data.department);
    }
  }
}
```

## 🚀 Deployment

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Manual Deployment
1. Upload all files to web server
2. Ensure HTTPS is enabled
3. Configure CORS if needed
4. Set up domain and SSL

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: jmsmuigai@gmail.com
- Documentation: See SYSTEM_DOCUMENTATION.md
- User Guide: See USER_MANUAL.md

## 🔄 Updates

### Version 1.0.0
- Initial release
- Core functionality
- Gmail and UPN authentication
- GIS mapping
- AI reporting
- Bulk upload
- User management

---

**Built with ❤️ for Garissa County Government**
