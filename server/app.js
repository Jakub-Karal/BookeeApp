const express = require("express");
const clientController = require("./controller/clientController");
const reservationController = require("./controller/reservationController");

const app = express();
app.use(express.json());

app.use("/api/client", clientController);
app.use("/api/reservation", reservationController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));