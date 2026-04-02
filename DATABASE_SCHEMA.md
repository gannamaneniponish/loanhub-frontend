# LoanHub v7 - Database Schema Guide

## 📊 Overview

This guide provides database schema designs for implementing LoanHub with a backend database.

---

## 🗄️ Database Choice Recommendations

### PostgreSQL (Recommended)
- **Best for**: Structured, relational data
- **Benefits**: ACID compliance, JSON support, security, scalability
- **Use case**: Production systems, financial data

### MongoDB
- **Best for**: Flexible, schema-less data
- **Benefits**: Horizontal scaling, document-oriented
- **Use case**: High-volume, flexible data structures

---

## 📋 Table Schemas (PostgreSQL)

### 1. Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15) UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'lender', 'borrower', 'analyst')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  kyc_status VARCHAR(50) DEFAULT 'incomplete' CHECK (kyc_status IN ('incomplete', 'pending', 'verified')),
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### 2. Loans Table

```sql
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  borrower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  term_months INTEGER NOT NULL,
  purpose VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'active', 'completed', 'declined', 'overdue', 'closed')
  ),
  approval_date TIMESTAMP,
  disbursal_date TIMESTAMP,
  maturity_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  emi_amount DECIMAL(10, 2),
  total_interest DECIMAL(15, 2),
  total_amount_due DECIMAL(15, 2),
  documents JSONB DEFAULT '{}',
  
  FOREIGN KEY (borrower_id) REFERENCES users(id),
  FOREIGN KEY (lender_id) REFERENCES users(id)
);

CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_lender ON loans(lender_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_created_at ON loans(created_at);
```

### 3. EMI Schedule Table

```sql
CREATE TABLE emi_schedules (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date TIMESTAMP NOT NULL,
  emi_amount DECIMAL(10, 2) NOT NULL,
  principal_amount DECIMAL(10, 2) NOT NULL,
  interest_amount DECIMAL(10, 2) NOT NULL,
  outstanding_balance DECIMAL(15, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'partially_paid', 'overdue', 'waived')
  ),
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  paid_date TIMESTAMP,
  days_overdue INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(loan_id, installment_number),
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);

CREATE INDEX idx_emi_loan_id ON emi_schedules(loan_id);
CREATE INDEX idx_emi_due_date ON emi_schedules(due_date);
CREATE INDEX idx_emi_status ON emi_schedules(payment_status);
```

### 4. Transactions Table

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  emi_schedule_id INTEGER REFERENCES emi_schedules(id) ON DELETE SET NULL,
  borrower_id INTEGER NOT NULL REFERENCES users(id),
  lender_id INTEGER REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (
    transaction_type IN ('payment', 'refund', 'late_charge', 'interest_accrual')
  ),
  payment_method VARCHAR(50) CHECK (
    payment_method IN ('bank_transfer', 'upi', 'card', 'cheque', 'neft', 'rtgs')
  ),
  status VARCHAR(50) DEFAULT 'completed' CHECK (
    status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')
  ),
  reference_number VARCHAR(255) UNIQUE,
  payment_gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (loan_id) REFERENCES loans(id),
  FOREIGN KEY (emi_schedule_id) REFERENCES emi_schedules(id),
  FOREIGN KEY (borrower_id) REFERENCES users(id),
  FOREIGN KEY (lender_id) REFERENCES users(id)
);

CREATE INDEX idx_transactions_loan ON transactions(loan_id);
CREATE INDEX idx_transactions_borrower ON transactions(borrower_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
```

### 5. Notifications Table

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (
    notification_type IN (
      'loan_application', 'loan_approved', 'loan_declined',
      'payment_reminder', 'payment_received', 'payment_overdue',
      'emi_due', 'loan_completed', 'user_created',
      'account_suspended', 'document_required'
    )
  ),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### 6. Documents Table

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (
    document_type IN ('pan', 'aadhaar', 'income_proof', 'bank_statement', 'loan_agreement')
  ),
  file_url VARCHAR(255) NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'verified', 'rejected', 'expired')
  ),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  verification_notes TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, document_type)
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
```

### 7. Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success' CHECK (
    status IN ('success', 'failure')
  ),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

### 8. Credit Scores Table

```sql
CREATE TABLE credit_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 300 AND score <= 900),
  grade VARCHAR(10),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  on_time_payments INTEGER DEFAULT 0,
  total_payments INTEGER DEFAULT 0,
  credit_utilization DECIMAL(5, 2) DEFAULT 0,
  account_age_months INTEGER DEFAULT 0,
  inquiries_6_months INTEGER DEFAULT 0,
  default_probability DECIMAL(5, 4) DEFAULT 0,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_credit_scores_user ON credit_scores(user_id);
CREATE INDEX idx_credit_scores_score ON credit_scores(score);
```

### 9. User Preferences Table

```sql
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_loan_application BOOLEAN DEFAULT TRUE,
  email_payment_reminder BOOLEAN DEFAULT TRUE,
  email_loan_approval BOOLEAN DEFAULT TRUE,
  email_payment_confirmation BOOLEAN DEFAULT TRUE,
  sms_payment_reminder BOOLEAN DEFAULT TRUE,
  sms_payment_overdue BOOLEAN DEFAULT TRUE,
  sms_loan_approval BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,
  notification_frequency VARCHAR(50) DEFAULT 'realtime' CHECK (
    notification_frequency IN ('realtime', 'daily', 'weekly')
  ),
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔑 Key Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_loans_status_created ON loans(status, created_at);
CREATE INDEX idx_transactions_loan_created ON transactions(loan_id, created_at);
CREATE INDEX idx_emi_loan_status_date ON emi_schedules(loan_id, payment_status, due_date);
CREATE INDEX idx_users_role_status ON users(role, status);
```

---

## 🔗 Relationships Diagram

```
Users (1) ──┬─> (Many) Loans (borrower)
            ├─> (Many) Loans (lender)
            ├─> (Many) Transactions
            ├─> (Many) Notifications
            ├─> (Many) Documents
            ├─> (1) CreditScores
            └─> (1) NotificationPreferences

Loans (1) ──┬─> (Many) EMISchedules
            ├─> (Many) Transactions
            └─> (Many) AuditLogs

EMISchedules (1) ──> (Many) Transactions
```

---

## 📝 MongoDB Schema (Alternative)

### Users Collection

```javascript
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password_hash', 'name', 'role'],
      properties: {
        _id: { bsonType: 'objectId' },
        email: { bsonType: 'string' },
        password_hash: { bsonType: 'string' },
        name: { bsonType: 'string' },
        phone: { bsonType: 'string' },
        role: { enum: ['admin', 'lender', 'borrower', 'analyst'] },
        status: { enum: ['active', 'suspended', 'inactive'] },
        kyc_status: { enum: ['incomplete', 'pending', 'verified'] },
        profile_image_url: { bsonType: 'string' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
})

db.users.createIndex({ email: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ status: 1 })
```

### Loans Collection

```javascript
db.createCollection('loans', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['borrower_id', 'amount', 'interest_rate', 'term_months'],
      properties: {
        _id: { bsonType: 'objectId' },
        borrower_id: { bsonType: 'objectId' },
        lender_id: { bsonType: 'objectId' },
        amount: { bsonType: 'decimal' },
        interest_rate: { bsonType: 'decimal' },
        term_months: { bsonType: 'int' },
        purpose: { bsonType: 'string' },
        status: { enum: ['pending', 'approved', 'active', 'completed', 'declined', 'overdue'] },
        emi_schedule: { bsonType: 'array' },
        transactions: { bsonType: 'array' },
        created_at: { bsonType: 'date' }
      }
    }
  }
})

db.loans.createIndex({ borrower_id: 1 })
db.loans.createIndex({ status: 1 })
db.loans.createIndex({ created_at: 1 })
```

---

## 🔐 Security Considerations

### Password Storage
```sql
-- Never store plain passwords
-- Use bcrypt or Argon2 for hashing

-- Example with bcrypt:
UPDATE users 
SET password_hash = bcrypt(password, 12)
WHERE id = $1;
```

### Data Encryption
```sql
-- Encrypt sensitive fields
ALTER TABLE users ADD COLUMN phone_encrypted TEXT;

-- Use pgcrypto extension for PostgreSQL
CREATE EXTENSION pgcrypto;

INSERT INTO users (phone_encrypted)
VALUES (pgp_sym_encrypt('+91-9876543210', 'encryption_key'));
```

### SQL Injection Prevention
```javascript
// Use prepared statements
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// Never concatenate user input directly
// NEVER: `SELECT * FROM users WHERE email = '${email}'`
```

---

## 📊 Backup & Recovery

```bash
# PostgreSQL backup
pg_dump -U postgres loanhub_db > backup.sql

# Restore from backup
psql -U postgres loanhub_db < backup.sql

# MongoDB backup
mongodump --db loanhub --out /backup/

# MongoDB restore
mongorestore --db loanhub /backup/loanhub/
```

---

## 🧪 Sample Data

```sql
-- Insert sample users
INSERT INTO users (email, password_hash, name, phone, role, status, kyc_status)
VALUES 
('admin@loanhub.com', 'hashed_pwd', 'Admin User', '9000000001', 'admin', 'active', 'verified'),
('lender@loanhub.com', 'hashed_pwd', 'John Lender', '9000000002', 'lender', 'active', 'verified'),
('borrower@loanhub.com', 'hashed_pwd', 'Jane Borrower', '9000000003', 'borrower', 'active', 'incomplete');

-- Insert sample loan
INSERT INTO loans (borrower_id, lender_id, amount, interest_rate, term_months, purpose, status, emi_amount)
VALUES (3, 2, 500000, 10, 60, 'Home improvement', 'active', 10607);
```

---

## ✅ Database Optimization Tips

1. **Indexing**: Create indexes on frequently queried fields
2. **Partitioning**: Partition large tables by date or status
3. **Normalization**: Avoid data redundancy
4. **Query Optimization**: Use EXPLAIN ANALYZE to optimize queries
5. **Caching**: Implement Redis for frequently accessed data
6. **Connection Pooling**: Use connection pooling to manage resources
7. **Regular Maintenance**: VACUUM and ANALYZE tables regularly

---

## 📈 Scaling Strategies

- **Vertical Scaling**: Increase server resources
- **Horizontal Scaling**: Use database replication and sharding
- **Read Replicas**: Separate read and write operations
- **Caching Layer**: Implement Redis or Memcached
- **CDN**: Serve static assets from CDN
- **Microservices**: Split into separate services

---

**Last Updated**: April 1, 2024
**Version**: 7.0.0
