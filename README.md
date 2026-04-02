# LoanHub — Professional v7

A production-grade loan management platform for India, built with React + Vite.

## What's New in v7

### 🚀 Performance & Optimization
- **Lazy component loading** for faster initial page load
- **Optimized localStorage** caching with proper data validation
- **Image lazy loading** for dashboard assets
- **Memoized components** to prevent unnecessary re-renders
- **Improved dark mode** with instant application on load

### 🎨 UI/UX Enhancements
- **Smooth page transitions** with fade-in animations
- **Enhanced mobile responsiveness** with adaptive layouts
- **Improved form validation** with inline error messages
- **Better accessibility** with ARIA labels and semantic HTML
- **Loading skeletons** for data-heavy components

### 🔧 New Features
- **Advanced loan filtering** by status, amount range, date range
- **Bulk operations** for admin loan management
- **Automated email/SMS notifications** (WhatsApp integration ready)
- **Loan foreclosure calculator** with prepayment options
- **Credit score simulator** for borrower eligibility
- **Real-time dashboard updates** without page refresh

### 📊 Enhanced Analytics
- **Portfolio diversification** charts
- **Repayment health** indicators
- **NPA trend analysis** with predictions
- **Custom report generation** (PDF/Excel export)
- **Performance metrics** dashboard for analysts

### 🔒 Security Improvements
- **Password strength validation** with requirements checklist
- **Session timeout** for inactive users (15 min default)
- **Audit logging** for admin actions
- **Role-based access control** (RBAC) enforcement
- **Data encryption** for sensitive fields

## What's New in v5 (Previous)

### 🔐 Auth & Security
- **Password strength meter** on registration (Weak / Fair / Good / Strong with color bars)
- **SSL & trust badges** on login page (256-bit SSL, RBI Compliant, ISO 27001, KYC Verified)
- **RBI NBFC disclaimer** with registration number N-05.01234

### 🪪 KYC & Compliance
- **KYC status banner** in Borrower Dashboard (Verified / Incomplete with document checklist)
- **Document upload cards** in Profile tab (PAN, Aadhaar, Income Proof, Bank Statement)
- **Loan eligibility calculator** auto-shown when applying (estimates max amount from annual income)
- **EMI due-date reminder banner** (7-day warning strip above stats)

### 📊 Analytics & Reporting
- **NPA Rate widget** in Admin Dashboard (with color-coded progress bar)
- **Total Disbursed & Collections** summary cards
- **Loan Approval Rate** metric
- **Activity Log** — recent loans & payment events with timestamps
- **Repayment Health by Borrower** bar chart in Lender Dashboard
- **Portfolio Diversification** — breakdown by loan status with visual bars

### 📝 Documents & E-Sign
- **E-Sign flow** on Loan Agreements — OTP sent to registered phone, verified before signing
- **Foreclosure Calculator** — shows outstanding principal, 2% penalty, and total closure cost
- **WhatsApp share** button on EMI Schedule (pre-formatted message with next EMI due date)

### 🌐 Landing Page
- **Trust logos row** — RBI, SSL, ISO 27001, UPI, KYC/AML, CIBIL
- **FAQ accordion** — 5 common questions with smooth expand/collapse
- **RBI registration** in footer brand area

## Getting Started

```bash
npm install
npm run dev
```

## Demo Credentials
| Role     | Email                     | Password    |
|----------|---------------------------|-------------|
| Lender   | lender@loanhub.com        | lender123   |
| Borrower | borrower@loanhub.com      | borrower123 |
| Analyst  | analyst@loanhub.com       | analyst123  |
| Admin    | Use "Admin Login" button   | (register)  |

## Tech Stack
- React 18 + Vite
- React Router DOM
- Lucide React icons
- Recharts for analytics
- LocalStorage for persistence
