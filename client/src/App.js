import React, { useState, useEffect } from "react";
import "./App.css";

const HOUR_START = 6;
const HOUR_END = 19;
const DAYS = [" Po", " Út", " St", " Čt", " Pá", " So", " Ne"];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date) {
  if (!date || isNaN(new Date(date).getTime())) return "";
  return new Date(date).toISOString().split("T")[0];
}

function getWeekRange(monday) {
  if (!monday || isNaN(new Date(monday).getTime())) return "";
  const start = new Date(monday);
  if (isNaN(start.getTime())) return "";
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  return `${start.getDate()}. ${start.getMonth() + 1}. – ${end.getDate()}. ${end.getMonth() + 1}. ${end.getFullYear()}`;
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
    // Oprava: porovnávej pouze YYYY-MM-DD část z r.date
    return reservations.find((r) => r.date && r.date.slice(0, 10) === dateStr && r.hour === hour);
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
      setLoading(true);
      fetch("/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, date: dateStr, hour }),
      })
        .then((r) => {
          if (!r.ok) return r.json().then(err => { throw new Error(err.error || "Chyba při vytváření rezervace"); });
          return r.json();
        })
        .then(() => {
          setModal(null);
          fetch(`/reservations?week=${formatDate(weekMonday)}`)
            .then((r) => r.json())
            .then((data) => setReservations(data));
        })
        .catch((e) => {
          console.error(e);
          alert(e.message || "Nepodařilo se vytvořit rezervaci.");
        })
        .finally(() => setLoading(false));
    };
    if (client) {
      createReservation(client.id);
    } else {
      fetch("/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      })
        .then(async (r) => {
          if (!r.ok) {
            const data = await r.json();
            if (data && data.error && data.error.includes("existuje")) {
              alert("Klient už existuje.");
              return;
            }
            throw new Error("Chyba při vytváření klienta");
          }
          return r.json();
        })
        .then((newClient) => {
          if (!newClient) return;
          setClientForm({ firstName: "", lastName: "" });
          setClients((prev) => [...prev, newClient]);
        })
        .finally(() => setLoading(false));
    }
  }

  function handleDeleteReservation(reservationId) {
    setLoading(true);
    fetch(`/reservations/${reservationId}`, {
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
      fetch(`/clients/${selectedClientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: clientForm.firstName,
          lastName: clientForm.lastName,
        }),
      })
        .then(async (r) => {
          if (!r.ok) {
            const data = await r.json();
            if (data && data.error && data.error.includes("existuje")) {
              alert("Klient už existuje.");
              setLoading(false);
              return;
            }
            throw new Error("Chyba při úpravě klienta");
          }
          return r.json();
        })
        .then((updated) => {
          if (!updated) return;
          setEditMode(false);
          setClientForm({ firstName: "", lastName: "" });
          fetch("/clients")
            .then((r) => r.json())
            .then((data) => setClients(data));
        })
        .finally(() => setLoading(false));
    } else {
      fetch("/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: clientForm.firstName, lastName: clientForm.lastName }),
      })
        .then(async (r) => {
          if (!r.ok) {
            const data = await r.json();
            if (data && data.error && data.error.includes("existuje")) {
              alert("Klient už existuje.");
              return;
            }
            throw new Error("Chyba při vytváření klienta");
          }
          return r.json();
        })
        .then((newClient) => {
          if (!newClient) return;
          setClientForm({ firstName: "", lastName: "" });
          setClients((prev) => [...prev, newClient]);
        })
        .finally(() => setLoading(false));
    }
  }

  function handleDeleteClient() {
    // Zkontroluj, zda má klient aktivní rezervace
    const hasReservation = reservations.some(r => r.clientId === selectedClientId);
    if (hasReservation) {
      alert("Nelze smazat, dokud má klient aktivní rezervace.");
      setModal(null);
      return;
    }
    setLoading(true);
    fetch(`/clients/${selectedClientId}`, {
      method: "DELETE"
    })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json();
          if (data && data.error && data.error.includes("Nelze smazat klienta")) {
            setModal({ type: "client-delete-error" });
          }
        } else {
          setClients((prev) => prev.filter((c) => c.id !== selectedClientId));
          setSelectedClientId((prev) => {
            const remaining = clients.filter((c) => c.id !== prev);
            return remaining.length > 0 ? remaining[0].id : null;
          });
          setModal(null);
        }
      })
      .finally(() => setLoading(false));
  }
  // --- Render ---
  // Zachovej stránku klientů i po refreshi, ale pouze pokud uživatel někdy stránku změnil
  useEffect(() => {
    const lastScreen = window.localStorage.getItem("bookeeapp_screen");
    if (lastScreen === "clients") setScreen("clients");
  }, []);
  useEffect(() => {
    window.localStorage.setItem("bookeeapp_screen", screen);
  }, [screen]);

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
        <button onClick={() => { console.log('WEEK PICKER BUTTON CLICK'); setShowWeekPicker(true); }}>
          {getWeekRange(weekMonday) || "výběr týdne"}
        </button>
        {showWeekPicker && (
          <div className="modal">
            <div className="modal-content">
              <input
                type="date"
                value={formatDate(weekMonday)}
                onChange={(e) => {
                  console.log('DATE PICKER INPUT CHANGE', e.target.value);
                  setWeekMonday(getMonday(new Date(e.target.value)));
                  setShowWeekPicker(false);
                }}
              />
              <button onClick={() => { console.log('WEEK PICKER MODAL CLOSE'); setShowWeekPicker(false); }}>Zpět</button>
            </div>
          </div>
        )}
      </div>
      <div className="calendar">
        {/* Nový řádek s hodinami */}
        <div className="calendar-row">
          <div className="calendar-day-label hour-label">hod.</div>
          {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, h) => (
            <div
              key={h}
              className="calendar-hour-btn hour-label-cell"
              style={{ pointerEvents: 'none', background: '#f7f7f7', color: '#1976d2', fontWeight: 500 }}
            >
              {HOUR_START + h}.
            </div>
          ))}
        </div>
        {/* Původní hlavička s hodinami a dny v týdnu smažeme, zůstane jen řádek s dny */}
        {DAYS.map((day, dayIdx) => (
          <div className="calendar-row" key={dayIdx}>
            <div className="calendar-day-label">{day}</div>
            {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, h) => {
              const hour = HOUR_START + h;
              const reserved = isReserved(dayIdx, hour);
              let client = null;
              if (reserved) {
                client = clients.find(c => c.id === reserved.clientId);
              }
              return (
                <button
                  key={hour}
                  className={
                    "calendar-hour-btn" +
                    (reserved ? " reserved blue" : " free")
                  }
                  onClick={() => handleHourClick(dayIdx, hour)}
                  title={reserved && client ? `${client.firstName} ${client.lastName}` : undefined}
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
            {(() => {
              const reservation = modal.data.reservation;
              const client = clients.find(c => c.id === reservation.clientId);
              return (
                <>
                  <p style={{ fontWeight: 500, marginBottom: 8 }}>
                    rezervace: {client ? `${client.firstName} ${client.lastName}` : ""}
                  </p>
                </>
              );
            })()}
            <button
              onClick={() => {
                handleDeleteReservation(modal.data.reservation.id);
              }}
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
