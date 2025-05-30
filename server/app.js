const express = require("express");
const clientController = require("./controller/clientController");
const reservationController = require("./controller/reservationController");

const app = express();
app.use(express.json());

// RESTful endpoints for frontend compatibility
app.use("/clients", clientController); // správná cesta pro frontend
app.use("/reservations", reservationController); // správná cesta pro frontend

// Legacy endpoints (ponecháno pro zpětnou kompatibilitu)
app.use("/client", clientController);
app.use("/reservation", reservationController);

// pro moji kontrolu
app.get('/', (req, res) => {
  res.send('Server běží');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));