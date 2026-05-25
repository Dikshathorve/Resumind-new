import './ResumeCard.css'
import { FileEdit, MoreVertical, Download, Trash2, Copy } from 'lucide-react'
import { useState } from 'react'

export default function ResumeCard({ resume, onDelete, onDuplicate, onDownload, onEdit }) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return '01/01/2025'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric'
    })
  }

  return (
    <div className="resume-card" onClick={() => onEdit?.(resume._id, resume.name)}>
      <div className="resume-card-menu">
        <button
          className="resume-menu-btn"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          title="Resume menu"
          aria-label="Resume menu"
        >
          <MoreVertical size={20} />
        </button>
        {showMenu && (
          <div className="resume-dropdown-menu">
            <button
              className="resume-menu-item"
              onClick={(e) => {
                e.stopPropagation()
                onDownload?.(resume._id)
                setShowMenu(false)
              }}
            >
              <Download size={18} />
              Download
            </button>
            <button
              className="resume-menu-item delete"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(resume._id)
                setShowMenu(false)
              }}
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="resume-card-content">
        <div className="resume-icon">
          <FileEdit size={60} />
        </div>
        <h3 className="resume-name">{resume.name || 'My Resume'}</h3>
        <p className="resume-date">
          Updated on {formatDate(resume.updatedAt || resume.createdAt)}
        </p>
      </div>
    </div>
  )
}
