import React, { useState, useEffect } from "react";
import "./App.css";

const HOUR_START = 6;
const HOUR_END = 19;
const DAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getWeekRange(monday) {
  const end = new Date(monday);
  end.setDate(monday.getDate() + 4);
  return `${monday.getDate()}. ${monday.getMonth() + 1}. – ${end.getDate()}. ${end.getMonth() + 1}.`;
}

function App() {
  const [screen, setScreen] = useState("dashboard");
  const [weekMonday, setWeekMonday] = useState(getMonday(new Date()));
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientForm, setClientForm] = useState({ firstName: "", lastName: "" });
  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/reservations?week=${formatDate(weekMonday)}`)
      .then((r) => r.json())
      .then((data) => setReservations(data));
  }, [weekMonday]);

  useEffect(() => {
    fetch("/clients")
      .then((r) => r.json())
      .then((data) => setClients(data));
  }, []);

  function isReserved(dayIdx, hour) {
    const date = new Date(weekMonday);
    date.setDate(date.getDate() + dayIdx);
    const dateStr = formatDate(date);
    return reservations.find((r) => r.date === dateStr && r.hour === hour);
  }

  function handleHourClick(dayIdx, hour) {
    setClientForm({ firstName: "", lastName: "" });
    const reserved = isReserved(dayIdx, hour);
    if (reserved) {
      setModal({ type: "reservation-view", data: { reservation: reserved } });
    } else {
      setModal({ type: "reservation-create", data: { dayIdx, hour } });
    }
  }

  function handleCreateReservation(firstName, lastName, dayIdx, hour) {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Vyplňte jméno i příjmení.");
      return;
    }

    setLoading(true);
    let client = clients.find(
      (c) => c.firstName === firstName && c.lastName === lastName
    );
    const date = new Date(weekMonday);
    date.setDate(date.getDate() + dayIdx);
    const dateStr = formatDate(date);
    const createReservation = (clientId) => {
      fetch("/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, date: dateStr, hour }),
      })
        .then((r) => r.json())
        .then(() => {
          fetch(`/reservations?week=${formatDate(weekMonday)}`)
            .then((r) => r.json())
            .then((data) => {
              setReservations(data);
              setModal(null);
              setLoading(false);
            });
        });
    };
    if (client) {
      createReservation(client.id);
    } else {
      fetch("/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("Chyba při vytváření klienta");
          return r.json();
        })
        .then((newClient) => {
          setClients((prev) => [...prev, newClient]);
          createReservation(newClient.id);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
          alert("Nepodařilo se vytvořit klienta.");
        });
    }
  }

  function handleDeleteReservation(reservationId) {
    setLoading(true);
    fetch(`http://localhost:3000/reservations/${reservationId}`, {
      method: "DELETE"
    })
      .then((r) => r.json())
      .then(() => {
        setModal(null);
        setLoading(false);
        fetch(`/reservations?week=${formatDate(weekMonday)}`)
          .then((r) => r.json())
          .then((data) => setReservations(data));
      });
  }

  useEffect(() => {
    if (clients.length > 0 && selectedClientId === null) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  function handleSelectClient(id) {
    setSelectedClientId(id);
    setEditMode(false);
    setClientForm({ firstName: "", lastName: "" });
  }

  function handleEditClient() {
    const client = clients.find((c) => c.id === selectedClientId);
    if (client) {
      setEditMode(true);
      setClientForm({ firstName: client.firstName, lastName: client.lastName });
    }
  }

  function handleSaveClient() {
    setLoading(true);
    if (editMode) {
      fetch(`http://localhost:3000/clients/${selectedClientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: clientForm.firstName,
          lastName: clientForm.lastName,
        }),
      })
        .then((r) => r.json())
        .then(() => {
          setEditMode(false);
          setClientForm({ firstName: "", lastName: "" });
          fetch("http://localhost:3000/clients")
            .then((r) => r.json())
            .then((data) => setClients(data));
        })
        .finally(() => setLoading(false));
    } else {
      fetch("http://localhost:3000/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: clientForm.firstName, lastName: clientForm.lastName }),
      })
        .then((r) => r.json())
        .then((newClient) => {
          setClientForm({ firstName: "", lastName: "" });
          setClients((prev) => [...prev, newClient]);
        })
        .finally(() => setLoading(false));
    }
  }

  function handleDeleteClient() {
    setLoading(true);
    fetch(`http://localhost:3000/clients/${selectedClientId}`, {
      method: "DELETE"
    })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json();
          if (data && data.error && data.error.includes("Nelze smazat klienta")) {
            setModal({ type: "client-delete-error" });
          }
        } else {
          setSelectedClientId(null);
          setModal(null);
          fetch("http://localhost:3000/clients")
            .then((r) => r.json())
            .then((data) => setClients(data));
        }
      })
      .finally(() => setLoading(false));
  }
  // --- Render ---
  if (screen === "clients") {
    return (
      <div className="mobile-container">
        <div className="header">
          <span className="app-title clickable" onClick={() => setScreen("dashboard")}>BookeeApp</span>
        </div>
        <div className="header-sub">
          <span className="page-title">Klienti</span>
          <span className="close-btn" onClick={() => setScreen("dashboard")}>×</span>
        </div>
        <div className="client-list">
          {clients.map((c, i) => (
            <div
              key={c.id}
              className={
                "client-row" +
                (selectedClientId === null && i === 0
                  ? " selected"
                  : selectedClientId === c.id
                  ? " selected"
                  : "")
              }
              onClick={() => handleSelectClient(c.id)}
            >
              {c.firstName} {c.lastName}
            </div>
          ))}
        </div>
        <div className="client-actions">
          <button
            disabled={
              !selectedClientId || clients.length === 0 || loading
            }
            onClick={editMode ? handleSaveClient : handleEditClient}
          >
            {editMode ? "Uložit změny" : "Upravit klienta"}
          </button>
          <button
            disabled={
              !selectedClientId || clients.length === 0 || loading
            }
            onClick={() => setModal({ type: "client-delete-confirm" })}
          >
            Smazat klienta
          </button>
        </div>
        <div className="client-form">
          <input
            placeholder="Jméno"
            value={clientForm.firstName}
            onChange={(e) =>
              setClientForm({ ...clientForm, firstName: e.target.value })
            }
          />
          <input
            placeholder="Příjmení"
            value={clientForm.lastName}
            onChange={(e) =>
              setClientForm({ ...clientForm, lastName: e.target.value })
            }
          />
          <button onClick={() => { setEditMode(false); handleSaveClient(); }} disabled={loading}>
            Uložit klienta
          </button>
        </div>
        {modal?.type === "client-delete-confirm" && (
          <div className="modal">
            <div className="modal-content">
              <p>Smazat tohoto klienta?</p>
              <button onClick={handleDeleteClient} disabled={loading}>
                Smazat
              </button>
              <button onClick={() => setModal(null)}>Zpět</button>
            </div>
          </div>
        )}
        {modal?.type === "client-delete-error" && (
          <div className="modal">
            <div className="modal-content">
              <p>Nelze smazat klienta, dokud má aktivní rezervace.</p>
              <button onClick={() => setModal(null)}>Zpět</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Dashboard ---
  return (
    <div className="mobile-container">
      <div className="header">
        <span
          className="app-title clickable"
          onClick={() => setScreen("dashboard")}
        >
          BookeeApp
        </span>
      </div>
      <div className="header-sub">
        <span className="page-title">Rezervace</span>
        <span
          className="clients-btn clickable right"
          onClick={() => setScreen("clients")}
        >
          Klienti
        </span>
      </div>
      <div className="week-picker">
        <button onClick={() => setShowWeekPicker(true)}>
          {getWeekRange(weekMonday)}
        </button>
        {showWeekPicker && (
          <div className="modal">
            <div className="modal-content">
              <input
                type="date"
                value={formatDate(weekMonday)}
                onChange={(e) => {
                  setWeekMonday(getMonday(new Date(e.target.value)));
                  setShowWeekPicker(false);
                }}
              />
              <button onClick={() => setShowWeekPicker(false)}>Zpět</button>
            </div>
          </div>
        )}
      </div>
      <div className="calendar">
        <div className="calendar-header">
          <div className="calendar-day-label small">hodina</div>
          {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, h) => (
            <div key={h} className="calendar-hour-label small">
              {HOUR_START + h}
            </div>
          ))}
        </div>
        {DAYS.map((day, dayIdx) => (
          <div className="calendar-row" key={dayIdx}>
            <div className="calendar-day-label">{day}</div>
            {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, h) => {
              const hour = HOUR_START + h;
              const reserved = isReserved(dayIdx, hour);
              return (
                <button
                  key={hour}
                  className={
                    "calendar-hour-btn" +
                    (reserved ? " reserved blue" : " free")
                  }
                  onClick={() => handleHourClick(dayIdx, hour)}
                >
                  {reserved ? "•" : ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {modal?.type === "reservation-create" && (
        <div className="modal">
          <div className="modal-content">
            <p className="modal-title">Zvolte klienta</p>
            <div className="client-list modal-list">
              {clients.map((c, i) => (
                <div
                  key={c.id}
                  className={
                    "client-row" +
                    (clientForm.firstName === c.firstName && clientForm.lastName === c.lastName ? " selected" : "")
                  }
                  onClick={() => setClientForm({ firstName: c.firstName, lastName: c.lastName })}
                >
                  {c.firstName} {c.lastName}
                </div>
              ))}
            </div>
            <div className="modal-subtitle">Zadání nového klienta</div>
            <input
              placeholder="Jméno"
              value={clientForm.firstName}
              onChange={(e) =>
                setClientForm({ ...clientForm, firstName: e.target.value })
              }
            />
            <input
              placeholder="Příjmení"
              value={clientForm.lastName}
              onChange={(e) =>
                setClientForm({ ...clientForm, lastName: e.target.value })
              }
            />
            <button
              onClick={() => {
                handleCreateReservation(
                  clientForm.firstName,
                  clientForm.lastName,
                  modal.data.dayIdx,
                  modal.data.hour
                );
              }}
              disabled={loading}
            >
              Uložit rezervaci
            </button>
            <button onClick={() => setModal(null)}>Zpět</button>
          </div>
        </div>
      )}
      {modal?.type === "reservation-view" && (
        <div className="modal">
          <div className="modal-content">
            <p>Rezervace existuje</p>
            <button
              onClick={() => handleDeleteReservation(modal.data.reservation.id)}
              disabled={loading}
            >
              Smazat
            </button>
            <button onClick={() => setModal(null)}>Zpět</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
