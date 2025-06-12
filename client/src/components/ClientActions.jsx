import React from "react";

function ClientActions({ editMode, loading, onEditClient, onSaveClient, onDeleteClient }) {
  return (
    <div className="client-actions">
      <button
        disabled={loading}
        onClick={editMode ? onSaveClient : onEditClient}
      >
        {editMode ? "Uložit změny" : "Upravit klienta"}
      </button>
      <button
        disabled={loading}
        onClick={onDeleteClient}
      >
        Smazat klienta
      </button>
    </div>
  );
}

export default ClientActions;
