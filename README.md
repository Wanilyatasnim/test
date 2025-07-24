# Student Management System

A modern, responsive admin website for managing students with database connectivity. Built with Node.js, Express, SQLite, and a beautiful frontend interface.

## Features

### 🎯 Core Functionality
- **Complete CRUD Operations**: Create, Read, Update, Delete students
- **Real-time Search**: Search students by name, email, ID, or course
- **Dashboard Statistics**: View total, active, inactive students and courses
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### 📊 Database Features
- **SQLite Database**: Lightweight, serverless database
- **Automatic Setup**: Database and tables created automatically
- **Sample Data**: Pre-populated with sample students for testing
- **Data Validation**: Server-side validation for all inputs

### 🎨 Modern UI/UX
- **Beautiful Interface**: Modern gradient design with glassmorphism effects
- **Interactive Elements**: Smooth animations and hover effects
- **Modal Dialogs**: Clean forms for adding/editing students
- **Toast Notifications**: User-friendly success/error messages
- **Loading States**: Visual feedback during operations

### 🔍 Advanced Features
- **Status Management**: Track student status (Active, Inactive, Suspended, Graduated)
- **Date Formatting**: Automatic date formatting and validation
- **Form Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error handling and user feedback

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Icons**: Font Awesome 6
- **Styling**: Modern CSS with gradients and animations

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd student-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
student-management-system/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── students.db            # SQLite database (auto-created)
├── public/                # Static files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
└── README.md              # This file
```

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/search/:term` - Search students

### Statistics
- `GET /api/stats` - Get dashboard statistics

## Database Schema

### Students Table
```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  course TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Guide

### Adding a Student
1. Click the "Add Student" button in the header
2. Fill in the required fields (marked with *)
3. Click "Save Student"

### Editing a Student
1. Find the student in the table
2. Click the "Edit" button in the Actions column
3. Modify the information
4. Click "Update Student"

### Deleting a Student
1. Find the student in the table
2. Click the "Delete" button in the Actions column
3. Confirm the deletion in the popup

### Searching Students
1. Type in the search box at the top
2. Results will filter automatically as you type
3. Search works across name, email, ID, and course fields

## Customization

### Adding New Fields
1. Update the database schema in `server.js`
2. Add the field to the HTML form in `index.html`
3. Update the API endpoints to handle the new field
4. Modify the frontend JavaScript to include the field

### Styling Changes
- Modify `public/styles.css` for visual changes
- The design uses CSS custom properties for easy theming
- Responsive breakpoints are defined for mobile optimization

### Database Changes
- The SQLite database file (`students.db`) is created automatically
- To reset the database, simply delete the file and restart the server
- For production, consider using PostgreSQL or MySQL

## Production Deployment

### Environment Variables
```bash
PORT=3000                    # Server port
NODE_ENV=production         # Environment
```

### Deployment Steps
1. Set up your production server
2. Install Node.js and npm
3. Clone the repository
4. Run `npm install --production`
5. Set environment variables
6. Start with `npm start` or use PM2 for process management

### Security Considerations
- Add authentication for production use
- Implement rate limiting
- Use HTTPS in production
- Validate and sanitize all inputs
- Consider using environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
- Check the issues section
- Review the code documentation
- Contact the development team

