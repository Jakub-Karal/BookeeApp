import React from "react";

function ClientList({ clients, selectedClientId, onSelectClient }) {
  return (
    <div className="client-list">
      {clients.map((client, index) => (
        <div
          key={client.id}
          className={
            "client-row" +
            (selectedClientId === null && index === 0
              ? " selected"
              : selectedClientId === client.id
              ? " selected"
              : "")
          }
          onClick={() => onSelectClient(client.id)}
        >
          {client.firstName} {client.lastName}
        </div>
      ))}
    </div>
  );
}

export default ClientList;
