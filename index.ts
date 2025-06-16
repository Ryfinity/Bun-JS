const express = require("express");
const asnRoutes = require("./src/routes/asnRoutes");

const app = express();
app.use(express.json());

app.get("/", (req: any, res: any) => { res.send("Welcome to BUN JS!") });
app.use("/api", [asnRoutes]);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port http://127.0.0.1:${process.env.PORT}...`)
})