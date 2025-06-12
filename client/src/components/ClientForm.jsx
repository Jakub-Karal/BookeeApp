import React from "react";

function ClientForm({ clientForm, loading, onChange, onSave }) {
  return (
    <div className="client-form">
      <input
        placeholder="Jméno"
        value={clientForm.firstName}
        onChange={(e) => onChange({ ...clientForm, firstName: e.target.value })}
      />
      <input
        placeholder="Příjmení"
        value={clientForm.lastName}
        onChange={(e) => onChange({ ...clientForm, lastName: e.target.value })}
      />
      <button onClick={onSave} disabled={loading}>
        Uložit klienta
      </button>
    </div>
  );
}

export default ClientForm;
