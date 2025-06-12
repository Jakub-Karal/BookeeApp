import React from "react";

function Modal({ type, loading, onDelete, onClose }) {
  if (type === "client-delete-confirm") {
    return (
      <div className="modal">
        <div className="modal-content">
          <p>Smazat tohoto klienta?</p>
          <button onClick={onDelete} disabled={loading}>
            Smazat
          </button>
          <button onClick={onClose}>Zpět</button>
        </div>
      </div>
    );
  }

  if (type === "client-delete-error") {
    return (
      <div className="modal">
        <div className="modal-content">
          <p>Nelze smazat klienta, dokud má aktivní rezervace.</p>
          <button onClick={onClose}>Zpět</button>
        </div>
      </div>
    );
  }

  return null;
}

export default Modal;
