# Garissa County Project Monitoring Dashboard - User Manual

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Login and Authentication](#login-and-authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Project Management](#project-management)
5. [User Management](#user-management)
6. [AI Reports](#ai-reports)
7. [Analytics](#analytics)
8. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Valid email address or UPN (Unique Personal Number)

### First Time Setup
1. **Access the Dashboard**: Navigate to your dashboard URL
2. **Initial Login**: Use default admin credentials:
   - UPN: `123456789`
   - Password: `Admin.123!`
3. **Change Password**: Update your password after first login
4. **Create Users**: Add departmental admins through User Management

## 🔐 Login and Authentication

### Login Options

#### Option 1: Gmail Login
1. Click the **Gmail Login** tab
2. Click **"Continue with Google"**
3. Sign in with your Gmail account
4. Grant necessary permissions

#### Option 2: UPN Login
1. Click the **UPN Login** tab
2. Enter your 9-digit UPN number
3. Enter your password
4. Click **"Sign In with UPN"**

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Default Admin Credentials
- **UPN**: 123456789
- **Password**: Admin.123!
- **Role**: Super Admin
- **Department**: County Executive

## 📊 Dashboard Overview

The dashboard provides a real-time overview of all projects in Garissa County.

### Statistics Cards
- **Total Projects**: Number of all projects in the system
- **Completed**: Projects that have been finished
- **Ongoing**: Projects currently in progress
- **Stalled**: Projects that have been delayed or stopped

### Interactive Map
- **Project Locations**: Click on markers to see project details
- **Color Coding**:
  - 🟢 Green: Completed projects
  - 🟡 Yellow: Ongoing projects
  - 🔴 Red: Stalled projects
  - 🔵 Blue: Planning phase projects

### Department Chart
- Horizontal bar chart showing project distribution across departments
- Helps identify which departments have the most projects

## 📁 Project Management

### Adding a New Project

1. **Navigate to Projects**: Click "Projects" in the sidebar
2. **Click "Add New Project"**: Green button in top-right corner
3. **Fill in Project Details**:
   - **Project Name**: Descriptive title
   - **Description**: Detailed project description
   - **Sub-County**: Select from dropdown (coordinates auto-fill)
   - **Ward**: Select ward (coordinates auto-fill)
   - **Department**: Implementing department
   - **Status**: Current project status
   - **Dates**: Start and completion dates
   - **Budget**: Approved budget in KSh
   - **Expenditure**: Amount spent to date
   - **Source of Funds**: Funding organization

4. **Save Project**: Click "Save Project" button

### Editing a Project

1. **Find Project**: Use search or filters to locate project
2. **Click Edit Icon**: Pencil icon in Actions column
3. **Modify Information**: Update any fields as needed
4. **Save Changes**: Click "Save Project"

### Deleting a Project

1. **Find Project**: Use search or filters to locate project
2. **Click Delete Icon**: Trash icon in Actions column
3. **Confirm Deletion**: Click "OK" in confirmation dialog
4. **Project Removed**: Project is permanently deleted

### Bulk Upload

1. **Download Template**: Click "Bulk Upload" button
2. **Fill CSV File**: Use `projects_template.csv` as guide
3. **Upload File**: Select completed CSV file
4. **Confirm Upload**: Review project count and confirm
5. **Processing**: System processes projects in batches

### Project Search and Filtering

#### Search
- **Search Box**: Type project name or description keywords
- **Real-time Results**: Table updates as you type

#### Filters
- **Department Filter**: Show projects by specific department
- **Status Filter**: Show projects by status (Ongoing, Completed, Stalled)
- **Combined Filters**: Use multiple filters simultaneously

### Project Statuses

- **Planning**: Project in initial planning phase
- **Ongoing**: Project currently being implemented
- **Completed**: Project successfully finished
- **Stalled**: Project delayed or temporarily stopped
- **Suspended**: Project temporarily halted
- **Cancelled**: Project terminated

## 👥 User Management (Super Admin Only)

### Adding New Users

1. **Navigate to Users**: Click "User Management" in sidebar
2. **Click "Add New User"**: Green button in top-right
3. **Fill User Details**:
   - **Email**: Valid email address
   - **Password**: Temporary password (user should change)
   - **Department**: Assign to appropriate department
   - **Role**: Admin or Super Admin
4. **Save User**: Click "Save User"
5. **Create Auth Account**: Go to Firebase Console to create authentication account

### User Roles

#### Super Admin
- Full system access
- User management
- All project access
- System configuration

#### Admin
- Department-specific projects only
- Project management within department
- Reports and analytics
- Cannot manage users

### Deleting Users

1. **Find User**: Locate user in table
2. **Click Delete Icon**: Trash icon in Actions column
3. **Confirm Deletion**: Click "OK" in confirmation dialog
4. **Remove from Firebase**: Also delete from Firebase Authentication console

## 🤖 AI Reports

### Generating AI Reports

1. **Navigate to Reports**: Click "AI Reports" in sidebar
2. **Enter Your Query**: Type your question or request
3. **Click "Generate AI Report"**: System processes your request
4. **View Results**: AI-generated report appears below

### Example Queries

#### Project Analysis
- "Show me all stalled projects and suggest reasons why"
- "Which departments have the highest budget allocation?"
- "What projects are at risk of going over budget?"

#### Performance Insights
- "Analyze project completion rates by department"
- "Identify projects that are behind schedule"
- "Compare budget vs expenditure across all projects"

#### Strategic Planning
- "What are the main challenges facing project implementation?"
- "Recommend priority areas for future investment"
- "Analyze geographic distribution of projects"

### AI Report Features
- **Markdown Formatting**: Clear headings and bullet points
- **Actionable Insights**: Specific recommendations
- **Data-Driven**: Based on actual project data
- **Context-Aware**: Understands Garissa County context

## 📈 Analytics

### Budget Analysis
- **Doughnut Chart**: Budget distribution by project status
- **Visual Insights**: Easy identification of budget allocation patterns
- **Interactive**: Hover for detailed information

### Timeline Analysis
- **Line Chart**: Projects started by year
- **Trend Analysis**: Identify patterns in project initiation
- **Planning Tool**: Helps with future project planning

### Key Metrics
- **Total Budget**: Sum of all project budgets
- **Total Expenditure**: Sum of all project expenditures
- **Completion Rate**: Percentage of completed projects
- **Average Project Duration**: Typical project timeline

## 🗺️ Garissa County Geography

### Sub-counties (11 Total)
1. **Garissa Township**: County headquarters
2. **Balambala**: Northern sub-county
3. **Lagdera**: Central sub-county
4. **Dadaab**: Eastern sub-county
5. **Fafi**: Southeastern sub-county
6. **Ijara**: Southern sub-county
7. **Hulugho**: Southwestern sub-county
8. **Sankuri**: Western sub-county
9. **Masalani**: Central-eastern sub-county
10. **Bura East**: Eastern sub-county
11. **Bura West**: Eastern sub-county

### Wards per Sub-county
Each sub-county contains multiple wards. When selecting a sub-county, the ward dropdown automatically updates with relevant options.

### Coordinate System
- **Auto-fill Coordinates**: Selecting sub-county and ward automatically fills latitude and longitude
- **Manual Override**: You can manually adjust coordinates if needed
- **Map Integration**: Coordinates are used for map marker placement

## 🔧 Troubleshooting

### Common Issues

#### Login Problems
**Problem**: Cannot log in with UPN
**Solution**: 
- Ensure UPN is exactly 9 digits
- Check password is correct
- Contact administrator if account doesn't exist

**Problem**: Gmail login fails
**Solution**:
- Ensure pop-ups are enabled
- Check internet connection
- Try different browser

#### Project Issues
**Problem**: Project not appearing on map
**Solution**:
- Check latitude and longitude are entered
- Verify coordinates are valid (negative latitude for Kenya)
- Ensure project is saved successfully

**Problem**: CSV upload fails
**Solution**:
- Check CSV format matches template exactly
- Ensure all required fields are filled
- Verify file is not corrupted

#### Performance Issues
**Problem**: Dashboard loads slowly
**Solution**:
- Check internet connection
- Clear browser cache
- Try refreshing the page

### Browser Compatibility
- **Chrome**: Recommended for best performance
- **Firefox**: Full compatibility
- **Safari**: Full compatibility
- **Edge**: Full compatibility

### Data Limits
- **Projects per Upload**: Maximum 500 projects per CSV upload
- **File Size**: CSV files should be under 10MB
- **Map Markers**: System handles up to 1000 markers efficiently

### Security Best Practices
- **Change Default Password**: Update admin password immediately
- **Use Strong Passwords**: Follow password requirements
- **Logout When Done**: Always logout from shared computers
- **Report Issues**: Contact administrator for security concerns

## 📞 Support

### Getting Help
- **Email**: jmsmuigai@gmail.com
- **Documentation**: See README.md and SYSTEM_DOCUMENTATION.md
- **Admin Panel**: Contact your system administrator

### Feature Requests
- Submit feature requests through your administrator
- Include detailed description of desired functionality
- Provide use case examples

### Bug Reports
- Describe the issue in detail
- Include steps to reproduce
- Specify browser and operating system
- Provide screenshots if helpful

## 📚 Additional Resources

### Training Materials
- **Video Tutorials**: Available through your administrator
- **User Guides**: Department-specific guides available
- **Best Practices**: Document available for download

### Data Export
- **Project Reports**: Export project data to Excel/CSV
- **Custom Reports**: Request specific data exports
- **Backup Procedures**: Regular data backup procedures

### System Updates
- **Version History**: Track system improvements
- **Feature Updates**: New functionality announcements
- **Maintenance Schedule**: Planned system maintenance windows

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**For Garissa County Government Use**
