# Garissa County Projects Dashboard 🌍

A comprehensive, public-facing, multilingual web dashboard for tracking, viewing, and providing feedback on development projects across Garissa County, Kenya.

## 🎉 Live Dashboard

**🌐 Access the Dashboard**: https://jmsmuigai.github.io/GARISSA-PROJECTS-MONITORING-DASHBOARD/dashboard.html

## ✨ Key Features

### 🌍 Multi-Language Support
- **English** (EN) - Default
- **Swahili** (SW) - Kiswahili
- **Somali** (SO) - Soomaali
- Seamless language switching with persistent preferences
- Full translations for all UI elements

### 🗺️ Interactive Geographic Visualization
- **Satellite Basemap** (Esri World Imagery) - Loads instantly
- **Street Map** option available
- Color-coded project markers:
  - 🟢 Green: Completed projects
  - 🟡 Yellow: Ongoing projects
  - 🔴 Red: Stalled projects
  - 🟣 Purple (Pulsing): Garissa Town projects
- Automatic geocoding from location data
- UTM coordinate support
- Click markers for project details

### 🔍 Advanced Filtering & Search
- **Text Search**: Search by project name, description, or location
- **Status Filter**: Completed, Ongoing, Stalled
- **Sub-County Filter**: All 11 sub-counties
- **Ward Filter**: Filter by specific ward
- **Department Filter**: Filter by implementing department
- **Budget Range Filter**: Under 1M, 1M-5M, 5M-10M, 10M-50M, Above 50M
- **Year Filter**: Filter by project year
- **Source of Funds Filter**: Filter by funding organization
- **Search Button**: Prominent search button for easy filtering
- **View Filtered Projects**: Auto-enable button when filters are active
- **Active Filter Badges**: Visual display of applied filters

### 📊 Comprehensive Analytics
- **Projects by Status**: Doughnut chart showing distribution
- **Projects by Department**: Horizontal bar chart
- **Budget Distribution**: Pie chart by budget ranges
- **Projects by Sub-County**: Bar chart showing geographic distribution
- Interactive charts with hover details
- Real-time updates based on filters

### 📄 Interactive Report Viewing
- **No Downloads Required**: View reports directly in panel
- **Summary Report**: Complete project overview
- **Completed Projects Report**: All finished projects
- **Ongoing Projects Report**: Active projects status
- **Stalled Projects Report**: Projects requiring attention
- **Budget Analysis Report**: Financial overview
- **Location Report**: Geographic distribution analysis
- Reports show in beautiful modal panels
- Filter reports within the viewing panel

### 💬 Per-Project Feedback System
- **Send Feedback**: Button on every project card
- **Feedback Count**: Shows number of feedbacks per project
- **View All Feedback**: See all submitted feedbacks
- **Feedback Storage**: Saved in browser localStorage
- **Email Integration**: Opens email client to send to feedback@garissa.go.ke
- **Feedback Display**: View all feedbacks with project names, dates, and messages

### 🎨 Modern Design & User Experience
- **3D Logo Animation**: Floating and rotating Garissa County logo
- **Gradient Headers**: Beautiful red-to-green gradients
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Transitions**: Professional animations throughout
- **Color-Coded Status**: Easy visual identification
- **Citizen Narrations**: Helpful instructions and welcome messages
- **Clean UI**: Modern, professional appearance

### 📈 Project Management
- **Project Grouping**: Automatically grouped by status
- **List View**: All projects displayed in organized cards
- **Map View**: Geographic visualization
- **Project Details**: Full information on each project
- **Export Options**: Excel and PDF export (still available)

### ⚡ Performance & Reliability
- **Fast Loading**: Map loads instantly, data loads with timeout
- **Fallback Data**: Sample projects if Google Sheets unavailable
- **Auto-Fix Data**: Automatic correction of data issues
- **Error Handling**: Graceful error handling throughout
- **Optimized**: Lightweight and fast performance

## 🚀 Quick Start

### Access the Dashboard
Simply visit: https://jmsmuigai.github.io/GARISSA-PROJECTS-MONITORING-DASHBOARD/dashboard.html

### No Setup Required!
- **Public Access**: No login required
- **Automatic Data Loading**: Loads from Google Sheets automatically
- **Instant Map**: Satellite view loads immediately

### Data Source
- Primary: Google Sheets (public CSV export)
- Fallback: Sample data if Google Sheets unavailable
- Real-time: Updates when Google Sheets are updated

## 📱 Features for Citizens

### For Citizens
1. **View Projects**: See all county development projects
2. **Search & Filter**: Find specific projects easily
3. **Map View**: See where projects are located
4. **Provide Feedback**: Share thoughts on any project
5. **Language Options**: View in English, Swahili, or Somali
6. **Reports**: View detailed project reports

### For County Officials
1. **Project Monitoring**: Track all county projects
2. **Analytics**: Understand project distribution
3. **Feedback Collection**: Receive citizen feedback
4. **Reports**: Generate and view project reports
5. **Export**: Export data for analysis

## 🗺️ Garissa County Coverage

### 11 Sub-Counties
1. Garissa Township (County Headquarters)
2. Balambala
3. Lagdera
4. Dadaab
5. Fafi
6. Ijara
7. Hulugho
8. Sankuri
9. Masalani
10. Bura East
11. Bura West

### Departments
- Water and Sanitation
- Education
- Health
- Agriculture
- Infrastructure
- Environment
- Youth and Sports
- Trade and Industry
- Social Services
- County Executive

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet.js with Esri World Imagery
- **Charts**: Chart.js
- **Icons**: Lucide Icons
- **Data Export**: SheetJS (XLSX)
- **Storage**: localStorage (for feedback)

## 📊 Data Management

### Project Data Structure
- Project Name
- Description
- Status (Completed, Ongoing, Stalled)
- Department
- Sub-County
- Ward
- Budget (KSh)
- Expenditure (KSh)
- Source of Funds
- Start Date
- Completion Date
- Location
- Coordinates (auto-generated)

### Auto-Fix Features
- Missing project names → Auto-generated
- Invalid status → Normalized
- Negative budgets → Corrected
- Expenditure exceeds budget → Auto-limited
- Missing departments → Default assigned
- Invalid coordinates → Auto-geocoded
- Coordinates out of range → Validated and corrected

## 🌐 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch and root folder
4. Dashboard available at: `https://[username].github.io/[repository]/dashboard.html`

### Manual Deployment
1. Upload all files to web server
2. Ensure proper file permissions
3. Access via web browser

## 📧 Contact & Feedback

- **Feedback Email**: feedback@garissa.go.ke
- **Dashboard**: Use "Send Feedback" button in header
- **Per-Project Feedback**: Click feedback button on any project card

## 📚 Documentation

- **User Manual**: See `USER_MANUAL.md` for detailed instructions
- **Deployment Guide**: See `START_HERE.md`
- **System Documentation**: See `SYSTEM_DOCUMENTATION.md`

## 🎯 Usage Examples

### Finding a Project
1. Use search box or filters
2. Click "Search" button
3. View filtered results in List View or Map View

### Viewing Reports
1. Click "Reports" tab
2. Click on any report card
3. View report in modal panel
4. Use filters within report if needed

### Providing Feedback
1. Find a project
2. Click "Send Feedback" button on project card
3. Fill in name, email, and message
4. Submit (opens email client)

### Switching Languages
1. Click language buttons (EN/SW/SO) in header
2. Entire dashboard translates instantly
3. Preference is saved for future visits

## ✅ Features Status

- ✅ Multi-language support (EN/SW/SO)
- ✅ Interactive report viewing
- ✅ Per-project feedback system
- ✅ Search button and filtered views
- ✅ Enhanced analytics
- ✅ 3D logo animations
- ✅ Citizen narrations
- ✅ Satellite basemap
- ✅ Auto-fix data validation
- ✅ Performance optimization
- ✅ Responsive design
- ✅ Feedback count display

## 🔄 Recent Updates

### Version 2.1.0 (Latest)
- Added multi-language support (English, Swahili, Somali)
- Interactive report viewing panels
- Per-project feedback system
- Enhanced search and filtering
- 3D logo animations
- Citizen narrations and instructions
- Improved analytics
- Better error handling
- Performance optimizations

### Version 2.0.0
- Removed login requirement (public access)
- Google Sheets integration
- Enhanced filtering system
- Improved map visualization
- Report generation

## 📝 License

This project is developed for Garissa County Government.

## 🙏 Acknowledgments

- Garissa County Government
- All citizens providing feedback
- Open-source libraries and tools

---

**🌍 Making County Projects Transparent and Accessible to All Citizens**

**Last Updated**: January 2025  
**Version**: 2.1.0  
**Status**: ✅ Fully Operational
