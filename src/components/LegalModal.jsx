import { RECHTSTEXTE } from '../content/site.js'
import { Modal } from './ui/Modal.jsx'

export function LegalModal({ openId, onClose }) {
  const inhalt = openId ? RECHTSTEXTE[openId] : null

  return (
    <Modal
      open={Boolean(inhalt)}
      onClose={onClose}
      size="md"
      title={inhalt?.titel ?? ''}
      subtitle="Beta-Demo – Platzhalterinhalte ohne rechtliche Wirkung."
    >
      <div className="space-y-4 px-5 py-6 sm:px-7">
        {inhalt?.absaetze.map((absatz) => (
          <p key={absatz} className="text-[0.9375rem] leading-relaxed prose-muted">
            {absatz}
          </p>
        ))}
      </div>
    </Modal>
  )
}
