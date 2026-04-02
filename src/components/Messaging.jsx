import { useState, useEffect } from 'react'
import { Send, MessageSquare, User } from 'lucide-react'
import '../styles/Messaging.css'

export function LoanMessaging({ loanId, currentUserId, currentUserRole, lenderName, borrowerName }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`loan-messages-${loanId}`)
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [loanId])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      loanId,
      senderId: currentUserId,
      senderRole: currentUserRole,
      senderName: currentUserRole === 'lender' ? lenderName : borrowerName,
      text: newMessage,
      timestamp: new Date(),
      read: false
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    localStorage.setItem(`loan-messages-${loanId}`, JSON.stringify(updatedMessages))
    setNewMessage('')
  }

  const getRoleColor = (role) => {
    return role === 'lender' ? '#3182ce' : '#38a169'
  }

  return (
    <div className="loan-messaging-container">
      <div className="messaging-header">
        <MessageSquare size={22} />
        <h3>Loan Discussion</h3>
      </div>

      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <MessageSquare size={48} opacity={0.3} />
            <p>No messages yet. Start a conversation with the {currentUserRole === 'lender' ? 'borrower' : 'lender'}.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message-bubble ${msg.senderRole === 'lender' ? 'lender-msg' : 'borrower-msg'}`}
            >
              <div className="message-header">
                <div className="sender-info">
                  <User size={16} color={getRoleColor(msg.senderRole)} />
                  <span className="sender-name">{msg.senderName}</span>
                  <span className="sender-role">{msg.senderRole.toUpperCase()}</span>
                </div>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="message-text">{msg.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message... (Ask for details, request extension, etc.)"
          rows={3}
          className="message-input"
        />
        <button 
          type="submit" 
          className="btn btn-primary send-button"
          disabled={!newMessage.trim()}
        >
          <Send size={18} />
          Send Message
        </button>
      </form>
    </div>
  )
}

export default LoanMessaging
