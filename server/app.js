const express = require("express");
const clientController = require("./controller/clientController");
const reservationController = require("./controller/reservationController");
const path = require("path");

const app = express();


// Logování všech požadavků včetně těla
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url, req.headers, req.body);
  next();
});

// Logování všech požadavků do konzole
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// RESTful endpoints for frontend compatibility
app.use("/clients", clientController);
app.use("/reservations", reservationController);

// Legacy endpoints
app.use("/client", clientController);
app.use("/reservation", reservationController);

// Testovací endpoint
app.get('/', (req, res) => {
  res.send('Server běží');
});

// Obsluha statických souborů z frontendu
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
