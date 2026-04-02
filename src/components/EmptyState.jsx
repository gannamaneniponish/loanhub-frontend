import { Briefcase, ClipboardList, Mail, Users, Search, Bell, BarChart3 } from 'lucide-react'
import './EmptyState.css'

const presets = {
  loans:         { icon: Briefcase,     title: 'No loans yet',       desc: 'Apply for your first loan to get started on your financial journey.' },
  transactions:  { icon: ClipboardList, title: 'No transactions',    desc: 'Your payment history will appear here once you make your first payment.' },
  requests:      { icon: Mail,          title: 'No loan requests',   desc: 'New loan applications from borrowers will appear here.' },
  users:         { icon: Users,         title: 'No users found',     desc: 'No users match your search criteria. Try adjusting your filters.' },
  search:        { icon: Search,        title: 'No results found',   desc: 'Try a different search term or clear your filters to see all items.' },
  notifications: { icon: Bell,          title: 'All caught up!',     desc: 'You have no new notifications. Check back later.' },
  reports:       { icon: BarChart3,     title: 'No data available',  desc: 'Reports will generate once there is enough data in the system.' },
}

export default function EmptyState({ type = 'loans', title, desc, ctaLabel, onCta, icon: CustomIcon }) {
  const preset = presets[type] || presets.loans
  const displayTitle = title || preset.title
  const displayDesc  = desc  || preset.desc
  const Icon = CustomIcon || preset.icon

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={36} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">{displayTitle}</h3>
      <p className="empty-state-desc">{displayDesc}</p>
      {ctaLabel && onCta && (
        <button className="empty-state-cta" onClick={onCta}>
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
