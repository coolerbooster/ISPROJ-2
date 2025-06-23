# Admin Dashboard Documentation

## Overview
This is a Next.js-based admin dashboard following the MVC (Model-View-Controller) architecture. The dashboard provides real-time statistics, user management, and data visualization.

## Project Structure
```
src/
├── models/
│   └── UserModel.js       # Handles user data and authentication
├── controllers/
│   └── AuthController.js  # Manages authentication logic
├── pages/
│   ├── _app.js           # Global app configuration
│   ├── index.js          # Login page
│   └── dashboard.js      # Main dashboard
└── styles/
    └── globals.css       # Global styles
```

## Key Features

### Authentication
- Located in `src/controllers/AuthController.js`
- Currently using hardcoded credentials (for demo purposes)
- Credentials: username: `admin`, password: `admin123`
- TODO: Implement proper authentication system

### Dashboard Components

#### 1. Statistics Cards
```javascript
// Located in dashboard.js
// Each card follows this structure:
<div className="stat-card" style={{ borderTop: '4px solid #COLOR' }}>
    <h3>Metric Name</h3>
    <p className="stat-number">Value</p>
</div>
```
- Color-coded for different metrics
- Real-time updates can be implemented using WebSocket
- Currently using static data

#### 2. Charts
Using `recharts` library for visualization:
- Bar Chart: New user signups (7-day trend)
- Line Chart: User retention rate
- Pie Chart: User distribution

```javascript
// Sample data structure for charts
const signupData = [
    { name: 'Day 1', users: 15 },
    // ... more data points
];
```

#### 3. User Table
- Sortable columns (TODO)
- Expandable rows (TODO)
- Pagination (TODO)

## Styling Guide
- Color Scheme:
  - Primary Blue: #1a73e8
  - Success Green: #4CAF50
  - Warning Orange: #FF9800
  - Premium Gold: #FFC107
  - Background: #f0f2f5

- Component Spacing:
  - Cards: 20px gap
  - Sections: 30px margin-bottom
  - Internal padding: 20px

## Future Improvements
1. Data Management
   - Implement real database connection
   - Add data caching layer
   - Set up real-time updates

2. Authentication
   - Add JWT authentication
   - Implement role-based access control
   - Add session management

3. User Interface
   - Add loading states
   - Implement error boundaries
   - Add responsive design for mobile
   - Add dark mode support

4. Features to Add
   - User management CRUD operations
   - Export data functionality
   - Advanced filtering
   - Activity logs
   - System notifications

## Development Guidelines

### Adding New Features
1. Follow MVC pattern:
   - Add data models in `models/`
   - Add business logic in `controllers/`
   - Add UI components in `pages/` or `components/`

2. Styling:
   - Use CSS modules for component-specific styles
   - Add global styles to `globals.css`
   - Follow BEM naming convention

### Best Practices
1. State Management:
   ```javascript
   // Use hooks for state management
   const [data, setData] = useState(initialData);
   ```

2. Error Handling:
   ```javascript
   try {
       // API calls or data operations
   } catch (error) {
       console.error('Operation failed:', error);
       // Show user-friendly error message
   }
   ```

3. Performance:
   - Implement pagination for large datasets
   - Use React.memo() for expensive components
   - Optimize chart re-renders

## API Integration (TODO)
```javascript
// Example API endpoint structure
const API_ENDPOINTS = {
    users: '/api/users',
    stats: '/api/statistics',
    auth: '/api/auth'
};
```

## Testing (TODO)
- Add unit tests for controllers
- Add integration tests for API endpoints
- Add E2E tests for critical user flows

## Deployment
Currently running on development server:
```bash
npm run dev
# Access at http://localhost:3000
```

For production:
```bash
npm run build
npm start
```

## Maintenance
- Regular dependency updates
- Performance monitoring
- Error logging
- Database backups (when implemented)

## Support
For questions or issues:
1. Check existing documentation
2. Review code comments
3. Contact the development team

Remember to update this documentation as new features are added or modified. 