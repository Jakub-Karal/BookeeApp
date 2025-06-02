const express = require("express");
const clientController = require("./controller/clientController");
const reservationController = require("./controller/reservationController");
const listEndpoints = require("express-list-endpoints");

const app = express();

// Middleware – Logování všech požadavků včetně těla
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url, req.headers, req.body);
  next();
});

// Middleware – Logování všech požadavků do konzole
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// RESTful endpointy pro frontend kompatibilitu
app.use("/clients", clientController);
app.use("/reservations", reservationController);

// Legacy endpointy
app.use("/client", clientController);
app.use("/reservation", reservationController);

// Testovací endpoint
app.get('/', (req, res) => {
  res.send('Server běží');
});

// Vypiš seznam endpointů
console.log(listEndpoints(app));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
