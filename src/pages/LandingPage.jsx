import { useState } from 'react'
import { Shield, TrendingUp, Users, Clock, ChevronRight, Star, CheckCircle, ArrowRight, ChevronDown, LayoutDashboard, FileText, BarChart3, CreditCard, Settings, Lock, Award, Smartphone, Activity } from 'lucide-react'
import { LogoIcon, LogoBrand } from '../components/Logo'
import './LandingPage.css'

export default function LandingPage({ onGetStarted }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [openFaqIdx, setOpenFaqIdx] = useState(null)

  const faqs = [
    { q: 'Is LoanHub regulated by RBI?', a: 'Yes. LoanHub operates as an NBFC registered with the Reserve Bank of India (Reg. No. N-05.01234). All lending activities comply with RBI guidelines.' },
    { q: 'How is my data protected?', a: 'All data is encrypted using 256-bit SSL and stored securely. We comply with IT Act 2000 and do not sell your data to third parties.' },
    { q: 'How fast can I get a loan approved?', a: 'Most loan applications are reviewed within 24 hours. Once approved, funds are disbursed to your account within 1–2 business days.' },
    { q: 'What is the minimum and maximum loan amount?', a: 'Borrowers can apply for loans between ₹10,000 and ₹50,00,000, subject to KYC verification and credit assessment.' },
    { q: 'What happens if I miss an EMI payment?', a: 'A reminder notification is sent 7 days before each due date. Late payments attract penalty interest and may affect your credit score with CIBIL, Experian, and CRIF Highmark.' },
  ]

  const features = [
    { icon: <Shield size={26} />, title: 'Secure & Trusted', desc: 'Bank-grade security with end-to-end encryption for all your financial data.', color: '#1a73e8' },
    { icon: <TrendingUp size={26} />, title: 'Smart Analytics', desc: 'Real-time dashboards and AI-powered insights to make informed decisions.', color: '#34a853' },
    { icon: <Users size={26} />, title: 'Multi-Role Platform', desc: 'Tailored experiences for Admins, Lenders, Borrowers, and Analysts.', color: '#9c27b0' },
    { icon: <Clock size={26} />, title: 'Fast Processing', desc: 'Apply, review, and approve loans in minutes, not days.', color: '#ff6d00' },
  ]

  const stats = [
    { value: '₹50Cr+', label: 'Loans Disbursed' },
    { value: '2,500+', label: 'Active Users' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '4.9★', label: 'App Rating' },
  ]

  const testimonials = [
    { name: 'Priya Sharma', role: 'Small Business Owner', text: 'LoanHub helped me secure funding for my business in just 2 days. The process was incredibly smooth.', rating: 5 },
    { name: 'Rajesh Kumar', role: 'Individual Lender', text: 'The analytics dashboard gives me complete visibility into my loan portfolio. Excellent returns!', rating: 5 },
    { name: 'Anita Patel', role: 'Financial Analyst', text: 'The reporting tools save me hours of manual work every week. Highly recommend.', rating: 5 },
  ]

  const roles = [
    {
      icon: <LayoutDashboard size={22} />,
      role: 'Admin',
      color: '#7c3aed',
      bg: '#f5f3ff',
      features: ['User management', 'System overview', 'Full analytics access', 'Audit logs']
    },
    {
      icon: <CreditCard size={22} />,
      role: 'Lender',
      color: '#1a73e8',
      bg: '#e8f0fe',
      features: ['Loan approvals', 'Portfolio tracking', 'Borrower profiles', 'Revenue reports']
    },
    {
      icon: <FileText size={22} />,
      role: 'Borrower',
      color: '#0f9d58',
      bg: '#e6f4ea',
      features: ['Apply for loans', 'EMI tracking', 'Payment history', 'Loan documents']
    },
    {
      icon: <BarChart3 size={22} />,
      role: 'Analyst',
      color: '#f57c00',
      bg: '#fff3e0',
      features: ['Risk analysis', 'Market trends', 'Custom reports', 'Data export']
    },
  ]

  const trustBadges = [
    { icon: <Award size={22} />, label: 'RBI Registered', sub: 'N-05.01234' },
    { icon: <Lock size={22} />, label: '256-bit SSL', sub: 'Encrypted' },
    { icon: <Shield size={22} />, label: 'ISO 27001', sub: 'Certified' },
    { icon: <Smartphone size={22} />, label: 'UPI Enabled', sub: 'Fast Payments' },
    { icon: <CheckCircle size={22} />, label: 'KYC/AML', sub: 'Compliant' },
    { icon: <Activity size={22} />, label: 'CIBIL', sub: 'Integrated' },
  ]

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-nav">
          <div className="landing-logo">
            <LogoBrand size={30} textSize={20} />
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#stats">About</a>
            <a href="#testimonials">Reviews</a>
          </div>
          <button className="landing-cta-btn" onClick={onGetStarted}>
            Sign In <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge hero-animate-1">
          <Star size={14} fill="currentColor" /> Trusted by 2,500+ users across India
        </div>
        <h1 className="hero-title hero-animate-2">
          Smart Lending,<br />
          <span className="hero-gradient">Simplified.</span>
        </h1>
        <p className="hero-subtitle hero-animate-3">
          The all-in-one platform connecting lenders and borrowers with powerful analytics,
          automated EMI tracking, and real-time portfolio insights.
        </p>
        <div className="hero-actions hero-animate-4">
          <button className="btn-hero-primary" onClick={onGetStarted}>
            Get Started Free <ChevronRight size={18} />
          </button>
          <button className="btn-hero-secondary" onClick={onGetStarted}>
            View Demo
          </button>
        </div>
        <div className="hero-visual hero-animate-5">
          <div className="hero-card floating-card-1">
            <div className="mini-stat-icon" style={{ background: '#e8f5e9', color: '#34a853' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="mini-stat-value">₹12,40,000</div>
              <div className="mini-stat-label">Portfolio Value</div>
            </div>
          </div>
          <div className="hero-card floating-card-2">
            <div className="mini-stat-icon" style={{ background: '#e3f2fd', color: '#1a73e8' }}>
              <CheckCircle size={18} />
            </div>
            <div>
              <div className="mini-stat-value">Approved</div>
              <div className="mini-stat-label">Loan #2841</div>
            </div>
          </div>
          <div className="hero-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
              <span>LoanHub Dashboard</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-stat-row">
                <div className="mockup-stat">
                  <div className="mockup-stat-bar" style={{ width: '75%', background: '#1a73e8' }}></div>
                  <span>Active Loans</span>
                </div>
                <div className="mockup-stat">
                  <div className="mockup-stat-bar" style={{ width: '60%', background: '#34a853' }}></div>
                  <span>Repaid</span>
                </div>
                <div className="mockup-stat">
                  <div className="mockup-stat-bar" style={{ width: '30%', background: '#fbbc04' }}></div>
                  <span>Pending</span>
                </div>
              </div>
              <div className="mockup-table-preview">
                {[1,2,3].map(i => (
                  <div key={i} className="mockup-row">
                    <div className="mockup-avatar"></div>
                    <div className="mockup-lines">
                      <div className="mockup-line long"></div>
                      <div className="mockup-line short"></div>
                    </div>
                    <div className={`mockup-badge ${i === 1 ? 'active' : i === 2 ? 'pending' : 'done'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" id="stats">
        <div className="stats-container">
          {stats.map((s, i) => (
            <div key={i} className="landing-stat-item">
              <div className="landing-stat-value">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-label">Why LoanHub?</div>
          <h2 className="section-heading">Everything you need to manage lending</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className={`feature-card ${hoveredFeature === i ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="feature-icon" style={{ background: f.color + '18', color: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="roles-section">
        <div className="section-container">
          <div className="section-label">Roles & Access</div>
          <h2 className="section-heading">Designed for every stakeholder</h2>
          <div className="roles-grid">
            {roles.map((r, i) => (
              <div key={i} className="role-card" style={{ '--role-color': r.color, '--role-bg': r.bg }}>
                <div className="role-icon-wrap" style={{ background: r.bg, color: r.color }}>
                  {r.icon}
                </div>
                <div className="role-title" style={{ color: r.color }}>{r.role}</div>
                <ul className="role-features">
                  {r.features.map((f, j) => (
                    <li key={j}><CheckCircle size={13} style={{ color: r.color }} /> {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-container">
          <div className="section-label">Testimonials</div>
          <h2 className="section-heading">Loved by our users</h2>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#fbbc04" color="#fbbc04" />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section">
        <div className="section-container" style={{ textAlign: 'center' }}>
          <div className="trust-label">Trusted &amp; Compliant With</div>
          <div className="trust-grid">
            {trustBadges.map((t, i) => (
              <div key={i} className="trust-item">
                <div className="trust-icon">{t.icon}</div>
                <div className="trust-item-label">{t.label}</div>
                <div className="trust-item-sub">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-container">
          <div className="section-label">FAQ</div>
          <h2 className="section-heading">Frequently asked questions</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`faq-chevron ${openFaqIdx === i ? 'open' : ''}`} />
                </button>
                {openFaqIdx === i && (
                  <div className="faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to get started?</h2>
          <p>Join thousands of users managing their loans smarter with LoanHub.</p>
          <button className="btn-hero-primary" onClick={onGetStarted} style={{ margin: '0 auto' }}>
            Sign In to LoanHub <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <LogoBrand size={26} textSize={18} textColor="white" color="rgba(255,255,255,0.9)" />
            <p>Smart lending solutions for modern India.</p>
            <p style={{ fontSize: '11px', color: '#a0aec0', marginTop: '6px' }}>NBFC Reg. No. N-05.01234 | RBI Registered | ISO 27001 Certified</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#stats">About</a>
              <a href="#" aria-label="Security information">Security</a>
              <span className="footer-link-disabled">Pricing — Coming Soon</span>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <span className="footer-link-disabled">About Us</span>
              <span className="footer-link-disabled">Blog</span>
              <span className="footer-link-disabled">Careers</span>
              <a href="mailto:support@loanhub.in">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <span className="footer-link-disabled">Privacy Policy</span>
              <span className="footer-link-disabled">Terms of Service</span>
              <span className="footer-link-disabled">Cookie Policy</span>
              <span className="footer-link-disabled">Compliance</span>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <span className="footer-link-disabled">Help Center</span>
              <span className="footer-link-disabled">Documentation</span>
              <span className="footer-link-disabled">Status</span>
              <a href="mailto:support@loanhub.in">support@loanhub.in</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 LoanHub. All rights reserved.</span>
          <span>Made with ♥ in India</span>
        </div>
      </footer>
    </div>
  )
}
