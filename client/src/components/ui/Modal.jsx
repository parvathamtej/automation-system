import { X } from 'lucide-react';
import { FocusView } from '../layout/Views';

export default function Modal({ title, children, onClose }) {
  return (
    <FocusView onClose={onClose}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Confirmation</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </FocusView>
  );
}

