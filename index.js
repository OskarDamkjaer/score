const express = require("express");
const path = require("path");
const promisify = require("util").promisify;
const sqlite3 = require("sqlite3").verbose();
const EventEmitter = require("events");
const { json } = require("body-parser");

const app = express();
app.use(json());
const stream = new EventEmitter();
const db = new sqlite3.Database("./egt.db", (err) => {
  if (err) {
    console.error(err.message);
  }
});
db.all = promisify(db.all);
db.run = promisify(db.run);

const getState = () => db.all("SELECT * FROM egt;", []);
// yes this is sqlinjectable
const addPoints = (name, points) =>
  db.run(`update egt set points=points+${points} where name="${name}"`);
const reset = (name) => db.run(`update egt set points=0 where name="${name}"`);

let state = { currentJudge: "" };

app.put("/api/setState", (req, res) => {
  state = req.body.state;
  giveList();
  res.end();
});
app.put("/api/addPoints", async (req, res) => {
  await addPoints(req.body.name, req.body.points);
  giveList();
  res.end();
});

app.put("/api/reset", async (req, res) => {
  await reset(req.body.name);
  giveList();
  res.end();
});

app.get("/event-stream", (req, res) => {
  // SSE Setup
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write("\n");

  function onPush(event, data) {
    res.write(`data: ${data} \n\n`);
  }

  stream.on("push", onPush);

  req.on("close", function () {
    stream.removeListener("push", onPush);
  });

  giveList();
});

const giveList = async () => {
  const list = await getState();
  stream.emit("push", "list", JSON.stringify({ list, state }));
};

app.use(express.static(path.join(__dirname, "front_end/public")));
app.get("*", (req, res) =>
  res.sendFile(path.join(`${__dirname}/front_end/public/index.html`))
);

app.listen(process.env.PORT || 3000);
