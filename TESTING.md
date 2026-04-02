# LoanHub v7 - Testing Guide

## 📋 Test Scenarios & Checklists

---

## 1. Authentication Testing

### Test Case 1.1: Login with Valid Credentials
**Precondition**: App is loaded
**Steps**:
1. Navigate to login page
2. Enter email: `lender@loanhub.com`
3. Enter password: `lender123`
4. Click "Login"

**Expected Result**:
- ✅ User logged in successfully
- ✅ Redirected to lender dashboard
- ✅ Navigation shows user name
- ✅ Session stored in localStorage

### Test Case 1.2: Login with Invalid Email
**Steps**:
1. Enter email: `invalid@test.com`
2. Enter password: `lender123`
3. Click "Login"

**Expected Result**:
- ✅ Error message displayed
- ✅ Remains on login page
- ✅ No session created

### Test Case 1.3: Login with Invalid Password
**Steps**:
1. Enter email: `lender@loanhub.com`
2. Enter password: `wrongpassword`
3. Click "Login"

**Expected Result**:
- ✅ Error message displayed
- ✅ Remains on login page
- ✅ No session created

### Test Case 1.4: Password Strength Validation
**Steps**:
1. Navigate to registration
2. Try passwords: `123` → `pass123` → `Pass123` → `Pass123!`

**Expected Result**:
- ✅ Weak: `123` (red indicator)
- ✅ Fair: `pass123` (orange indicator)
- ✅ Good: `Pass123` (blue indicator)
- ✅ Strong: `Pass123!` (green indicator)

### Test Case 1.5: Session Timeout
**Steps**:
1. Login successfully
2. Wait 15 minutes without any activity
3. Try to perform an action

**Expected Result**:
- ✅ Session expires automatically
- ✅ Redirected to login page
- ✅ Notification of session expiry shown

### Test Case 1.6: Logout
**Steps**:
1. Login as any user
2. Click user profile dropdown
3. Click "Logout"

**Expected Result**:
- ✅ User logged out
- ✅ Redirected to login page
- ✅ localStorage cleared
- ✅ Cannot access protected pages

---

## 2. Loan Application Testing

### Test Case 2.1: Create Loan Application (Borrower)
**Precondition**: Logged in as borrower
**Steps**:
1. Navigate to "Apply for Loan"
2. Fill in:
   - Amount: `500000`
   - Interest Rate: `10`
   - Term: `60`
   - Purpose: `Home improvement`
3. Click "Submit"

**Expected Result**:
- ✅ Loan created with status "pending"
- ✅ Notification sent to lenders
- ✅ Confirmation message displayed
- ✅ Loan appears in "My Loans" list

### Test Case 2.2: EMI Calculation
**Precondition**: Loan application form open
**Steps**:
1. Enter Amount: `500000`
2. Enter Rate: `10%`
3. Enter Term: `60 months`

**Expected Result**:
- ✅ EMI auto-calculated
- ✅ EMI = ~10,607 (approximately)
- ✅ Total interest displayed
- ✅ Total amount shown

### Test Case 2.3: Apply Loan with Invalid Data
**Steps**:
1. Try to submit with:
   - Amount: `5000` (below minimum)
   - Or Rate: `50%` (above maximum)
   - Or Term: `2` (below minimum)
2. Click Submit

**Expected Result**:
- ✅ Validation error shown
- ✅ Form not submitted
- ✅ Error messages are clear

### Test Case 2.4: Accept Loan (Lender)
**Precondition**: Logged in as lender, pending loans exist
**Steps**:
1. Navigate to Notifications
2. Find loan application
3. Click "Accept Loan"

**Expected Result**:
- ✅ Loan status changed to "active"
- ✅ Notification sent to borrower
- ✅ Loan appears in lender's portfolio

### Test Case 2.5: Decline Loan
**Precondition**: Logged in as lender
**Steps**:
1. Navigate to Notifications
2. Find loan application
3. Click "Decline Loan"

**Expected Result**:
- ✅ Lender marked as declined
- ✅ If all lenders decline, status = "declined"
- ✅ Borrower notified

---

## 3. Payment Testing

### Test Case 3.1: Make EMI Payment
**Precondition**: Logged in as borrower, active loan exists
**Steps**:
1. Click loan from dashboard
2. Click "Make Payment"
3. Enter amount (EMI amount or custom)
4. Click "Pay"

**Expected Result**:
- ✅ Transaction created
- ✅ Transaction appears in history
- ✅ Remaining balance updated
- ✅ Lender notified

### Test Case 3.2: Overpay/Prepayment
**Precondition**: Active loan with balance
**Steps**:
1. Go to loan payment
2. Enter amount > EMI
3. Click "Pay"

**Expected Result**:
- ✅ Payment accepted
- ✅ Extra amount reduces principal
- ✅ Next EMI calculation updated
- ✅ Foreclosure option available

### Test Case 3.3: View Payment History
**Precondition**: Loan with payments made
**Steps**:
1. Open loan details
2. Scroll to "Payment History"

**Expected Result**:
- ✅ All payments listed with dates
- ✅ Amount shown for each
- ✅ Payment method shown
- ✅ Status shown (completed/pending)

### Test Case 3.4: Generate Receipt
**Precondition**: Payment made
**Steps**:
1. Open loan
2. Go to Payment History
3. Click "Download Receipt"

**Expected Result**:
- ✅ PDF receipt generated
- ✅ Receipt contains loan and payment details
- ✅ Receipt downloads successfully

---

## 4. Admin User Management Testing

### Test Case 4.1: Create New User (Admin)
**Precondition**: Logged in as admin
**Steps**:
1. Go to Users tab
2. Click "Add User"
3. Fill details (name, email, role, password)
4. Click "Create User"

**Expected Result**:
- ✅ User created successfully
- ✅ User appears in list
- ✅ User can login with credentials
- ✅ User has correct role

### Test Case 4.2: Edit User
**Steps**:
1. Click user from list
2. Edit details (name, phone, etc.)
3. Click "Save"

**Expected Result**:
- ✅ User details updated
- ✅ Changes reflected immediately
- ✅ User notified of changes

### Test Case 4.3: Suspend User
**Steps**:
1. Open user details
2. Click "Suspend User"
3. Enter reason

**Expected Result**:
- ✅ User status = "suspended"
- ✅ User cannot login
- ✅ All sessions cleared
- ✅ User notified

### Test Case 4.4: Restore User
**Steps**:
1. Open suspended user
2. Click "Restore User"

**Expected Result**:
- ✅ User status = "active"
- ✅ User can login again
- ✅ Access restored

### Test Case 4.5: Delete User
**Steps**:
1. Open user details
2. Click "Delete User"
3. Confirm deletion

**Expected Result**:
- ✅ User deleted
- ✅ User cannot login
- ✅ User removed from list
- ✅ Audit log entry created

---

## 5. Notification Testing

### Test Case 5.1: Receive Loan Application Notification (Lender)
**Precondition**: Borrower applied for loan
**Steps**:
1. Login as lender
2. Check notification bell

**Expected Result**:
- ✅ Notification appears
- ✅ Shows loan details
- ✅ Unread indicator visible
- ✅ Clickable to view details

### Test Case 5.2: Mark Notification as Read
**Steps**:
1. Click on notification
2. View details
3. Notification mark as read

**Expected Result**:
- ✅ Notification marked read
- ✅ Visual indicator removed
- ✅ Appears in history

### Test Case 5.3: Notification Bell Counter
**Steps**:
1. Have multiple unread notifications
2. Check notification bell

**Expected Result**:
- ✅ Badge shows correct count
- ✅ Count updates when notification marked read
- ✅ Disappears when all read

---

## 6. Dark Mode Testing

### Test Case 6.1: Toggle Dark Mode
**Steps**:
1. Find theme toggle in navigation
2. Click to enable dark mode
3. Check colors

**Expected Result**:
- ✅ All components switch to dark theme
- ✅ Text readable on dark background
- ✅ Proper contrast maintained
- ✅ Preference saved

### Test Case 6.2: Dark Mode Persistence
**Steps**:
1. Enable dark mode
2. Refresh page
3. Check if dark mode still enabled

**Expected Result**:
- ✅ Dark mode persists after reload
- ✅ No flash of light theme
- ✅ Applied immediately on load

---

## 7. Responsive Design Testing

### Test Case 7.1: Mobile View (< 768px)
**Steps**:
1. Open DevTools
2. Set viewport to 375px width
3. Test all pages

**Expected Result**:
- ✅ Layout adapts properly
- ✅ Bottom navigation visible
- ✅ Sidebar hidden/menu accessible
- ✅ All buttons accessible
- ✅ Forms readable
- ✅ No horizontal scroll

### Test Case 7.2: Tablet View (768px - 1024px)
**Steps**:
1. Set viewport to 800px width
2. Navigate through app

**Expected Result**:
- ✅ Sidebar visible/toggleable
- ✅ Two-column layout where applicable
- ✅ Tables responsive
- ✅ All features accessible

### Test Case 7.3: Desktop View (> 1024px)
**Steps**:
1. Open on full desktop
2. Test all features

**Expected Result**:
- ✅ Full layout visible
- ✅ Sidebar always visible
- ✅ Optimal spacing
- ✅ All features accessible

---

## 8. Data Export Testing

### Test Case 8.1: Export Loans to CSV
**Precondition**: Admin dashboard
**Steps**:
1. Go to Loans tab
2. Click "Export to CSV"

**Expected Result**:
- ✅ CSV file downloads
- ✅ Contains all loan data
- ✅ Proper formatting
- ✅ All columns included

### Test Case 8.2: Export to PDF
**Precondition**: Loan details page
**Steps**:
1. Click "Download as PDF"

**Expected Result**:
- ✅ PDF generated
- ✅ Professional formatting
- ✅ All data included
- ✅ Readable on all devices

---

## 9. Browser Compatibility Testing

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | ✅ | Full support |
| Firefox | Latest | ✅ | Full support |
| Safari | Latest | ✅ | Full support |
| Edge | Latest | ✅ | Full support |
| IE 11 | - | ❌ | Not supported |

---

## 10. Performance Testing

### Test Case 10.1: Initial Load Time
**Steps**:
1. Open app in incognito mode
2. Measure time to first render
3. Measure time to interactive

**Expected Result**:
- ✅ First render: < 3 seconds
- ✅ Time to interactive: < 5 seconds

### Test Case 10.2: Dashboard Load
**Steps**:
1. Navigate to dashboard
2. Measure time to display all data

**Expected Result**:
- ✅ Dashboard loads in < 2 seconds
- ✅ Smooth scrolling
- ✅ Responsive interactions

### Test Case 10.3: Large Dataset Handling
**Steps**:
1. Create 100+ loans
2. Navigate to loan list
3. Search and filter

**Expected Result**:
- ✅ Pagination works
- ✅ Search responsive
- ✅ Filter fast
- ✅ No lag

---

## 11. Security Testing

### Test Case 11.1: XSS Prevention
**Steps**:
1. Try to inject script in forms
2. Enter: `<script>alert('xss')</script>`

**Expected Result**:
- ✅ Script not executed
- ✅ Input sanitized
- ✅ Displayed as text

### Test Case 11.2: SQLi Prevention (if DB connected)
**Steps**:
1. Try SQL injection in search
2. Enter: `'; DROP TABLE loans; --`

**Expected Result**:
- ✅ Command not executed
- ✅ Treated as search string
- ✅ No error

### Test Case 11.3: CSRF Protection
**Steps**:
1. Perform important action
2. Verify token/session check

**Expected Result**:
- ✅ Action requires valid session
- ✅ Invalid session rejected
- ✅ Cross-site requests blocked

---

## 12. Data Validation Testing

### Test Case 12.1: Email Validation
**Steps**:
1. Try invalid emails: `test`, `test@`, `@test.com`
2. Try valid: `test@example.com`

**Expected Result**:
- ✅ Invalid rejected with error
- ✅ Valid accepted

### Test Case 12.2: Phone Number Validation
**Steps**:
1. Try invalid: `123`, `12345678`, `abc1234567`
2. Try valid: `9876543210`

**Expected Result**:
- ✅ Invalid rejected
- ✅ Valid accepted
- ✅ Formatted properly

### Test Case 12.3: Amount Validation
**Steps**:
1. Try: `-1000`, `0`, `99999999999`
2. Try valid: `500000`

**Expected Result**:
- ✅ Invalid amounts rejected
- ✅ Valid amounts accepted
- ✅ Error messages clear

---

## 🧪 Automated Testing (Jest/Testing Library)

```javascript
// Example test
describe('Login Component', () => {
  test('should show error with invalid email', () => {
    render(<Login />)
    const input = screen.getByPlaceholderText('Email')
    const button = screen.getByRole('button', { name: /login/i })
    
    fireEvent.change(input, { target: { value: 'invalid' } })
    fireEvent.click(button)
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })
})
```

---

## 📊 Test Coverage Goals

- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

---

## 🐛 Bug Report Template

```markdown
**Title**: [Short description]

**Severity**: Critical/High/Medium/Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:


**Actual Result**:


**Environment**:
- Browser: 
- OS: 
- Version: 

**Screenshots**: [If applicable]

**Additional Notes**:
```

---

**Last Updated**: v7.0.0
