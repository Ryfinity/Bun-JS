const express = require("express");
const asnRoutes = require("./src/routes/asnRoutes");
const Scheduler = require("./src/services/Scheduler");

const app = express();
app.use(express.json());

const events = new Scheduler();
events.scdrr(true, 20000, "scDrrQueue");
events.rcrsum(true, 20000, "rcrSumQueue");
events.vdrdata(true, 20000, "vdrQueue");
events.posum(true, 20000, "poSumQueue");

app.get("/", (req: any, res: any) => { res.send("Welcome to BUN JS!") });
app.use("/api", [asnRoutes]);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port http://127.0.0.1:${process.env.PORT}...`)
})