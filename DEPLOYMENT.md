# LoanHub v7 - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone or extract the project
cd loan-app-v7

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

---

## 📁 Project Structure

```
loan-app-v7/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Charts.jsx
│   │   ├── Navigation.jsx
│   │   ├── Sidebar.jsx
│   │   ├── NotificationSystem.jsx
│   │   └── ... (14 more components)
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── LenderDashboard.jsx
│   │   ├── BorrowerDashboard.jsx
│   │   ├── AnalystDashboard.jsx
│   │   └── ... (4 more pages)
│   ├── styles/           # Style files
│   ├── utils/            # Utility functions
│   │   ├── StorageManager.js
│   │   ├── SessionManager.js
│   │   ├── ValidationUtils.js
│   │   └── FormatterUtils.js
│   ├── App.jsx           # Root component
│   ├── App.css           # App styles
│   ├── index.css         # Global styles
│   └── main.jsx          # Entry point
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies
├── README.md             # Quick start guide
├── FEATURES.md           # Feature documentation
├── DEPLOYMENT.md         # This file
└── TESTING.md            # Testing guide
```

---

## 🎯 First-Time Setup

### 1. Create Admin Account
- Click "Admin Login" button on login page
- Click "Create Admin Account"
- Fill in details (email, password, etc.)
- Submit to create your admin account

### 2. Test with Demo Users
Default demo users (already in system):
```
Lender:    lender@loanhub.com / lender123
Borrower:  borrower@loanhub.com / borrower123
Analyst:   analyst@loanhub.com / analyst123
```

### 3. Add Custom Users
1. Login as Admin
2. Go to "Users" tab
3. Click "Add User"
4. Fill in details and submit
5. User can now login with created credentials

---

## 🛠️ Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

Output will be in the `dist/` folder.

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Select "Vite" as framework
4. Deploy with one click

### Option 2: Netlify
1. Push code to GitHub
2. Connect GitHub repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy

### Option 3: Traditional Hosting
1. Run `npm run build`
2. Upload `dist/` folder to web server
3. Configure server for SPA routing (redirect 404s to index.html)

### Option 4: Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine
RUN npm install -g serve
COPY --from=0 /app/dist /app
EXPOSE 3000
CMD ["serve", "-s", "/app", "-l", "3000"]
```

Build and run:
```bash
docker build -t loanhub .
docker run -p 3000:3000 loanhub
```

---

## 📊 Environment Configuration

Create `.env.local` for custom settings:

```env
VITE_API_URL=https://api.example.com
VITE_SESSION_TIMEOUT=900000
VITE_APP_NAME=LoanHub
VITE_LOGO_URL=https://example.com/logo.png
VITE_SUPPORT_EMAIL=support@loanhub.com
VITE_PHONE=+91-XXXX-XXXX-XXX
```

---

## 🔒 Security Best Practices

### Password Security
- Minimum 8 characters
- Mix of uppercase and lowercase
- Include numbers and special characters
- Validated before storing

### Data Protection
- Never store passwords in plain text
- Use localStorage for non-sensitive data
- Implement HTTPS in production
- Regular backups of user data

### Session Management
- 15-minute inactivity timeout
- Automatic logout on session expiry
- Activity tracking for security
- Session validation on each action

### API Security (When Implemented)
- Use HTTPS only
- Implement JWT authentication
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Password reset functionality
- [ ] Session timeout
- [ ] Logout clears data

**Loan Management**
- [ ] Create loan application
- [ ] View loan details
- [ ] Update loan status
- [ ] Delete loan
- [ ] Search loans
- [ ] Filter loans
- [ ] Export loan data

**User Management (Admin)**
- [ ] Create user
- [ ] Edit user
- [ ] Suspend user
- [ ] Restore user
- [ ] Delete user
- [ ] View user details

**Notifications**
- [ ] Receive notification
- [ ] Mark as read
- [ ] Delete notification
- [ ] View notification history

**Dark Mode**
- [ ] Toggle dark mode
- [ ] Preference saved
- [ ] Apply on reload

**Responsive Design**
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768-1024px)
- [ ] Desktop view (> 1024px)

---

## 🐛 Debugging

### Enable Debug Mode
Add to browser console:
```javascript
localStorage.setItem('debugMode', 'true')
```

### View Application State
```javascript
console.log(localStorage.getItem('loans'))
console.log(localStorage.getItem('currentUser'))
console.log(localStorage.getItem('registeredUsers'))
```

### Clear All Data
```javascript
localStorage.clear()
location.reload()
```

---

## 📈 Performance Optimization

### Recommended Optimizations
1. **Code Splitting**
   - Lazy load dashboard components
   - Route-based code splitting

2. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Compress images

3. **Caching Strategy**
   - Service Worker for offline support
   - Cache API responses
   - localStorage for user data

4. **Bundle Size**
   - Current: ~200KB (gzipped)
   - Monitor with webpack-bundle-analyzer
   - Tree-shake unused code

---

## 🆘 Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Data Not Persisting
1. Check localStorage is enabled
2. Clear cache and reload
3. Check browser storage quota
4. Verify localStorage is not full

### Login Issues
1. Clear cookies: DevTools → Application → Cookies
2. Check password strength requirements
3. Verify user exists in system
4. Check session timeout settings

### UI Issues
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear cache: DevTools → Application → Cache Storage
3. Check browser compatibility
4. Update browser to latest version

---

## 📞 Support & Resources

### Getting Help
- Check FEATURES.md for feature documentation
- Review TESTING.md for test scenarios
- Check console for error messages
- Enable debug mode for detailed logs

### Common Errors

**"localStorage is not defined"**
- Usually means private/incognito mode
- Ask user to use normal browsing mode

**"Session expired"**
- Expected after 15 minutes of inactivity
- User needs to login again

**"Invalid data"**
- Corrupted localStorage
- Clear data and start fresh

---

## 🔄 Updates & Maintenance

### Version Updates
1. Backup current data
2. Pull latest code
3. Run `npm install` if dependencies changed
4. Test thoroughly
5. Deploy to production

### Database Maintenance
1. Regular backups (daily recommended)
2. Clear old notifications (> 30 days)
3. Archive completed loans
4. Monitor storage usage

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] All features tested
- [ ] Performance optimized
- [ ] Security audit passed
- [ ] Backup created
- [ ] HTTPS enabled
- [ ] SEO tags added
- [ ] Analytics configured
- [ ] Error monitoring set up

---

## 📅 Maintenance Schedule

**Daily**
- Monitor error logs
- Check system health
- Verify backups

**Weekly**
- Review user feedback
- Check performance metrics
- Security audit

**Monthly**
- Update dependencies
- Optimize performance
- Plan improvements

---

Last Updated: v7.0.0
