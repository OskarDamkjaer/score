const express = require('express');
const path = require("path")
const promisify = require("util").promisify;
const sqlite3 = require("sqlite3").verbose();
const EventEmitter = require("events");
const {
    json
} = require("body-parser");

const app = express();
app.use(json())
const stream = new EventEmitter();
const db = new sqlite3.Database("./bongs.db", err => {
    if (err) {
        console.error(err.message);
    }
});
db.all = promisify(db.all);
db.run = promisify(db.run);

const getBongs = () => db.all("SELECT * FROM bongs;", []);
// yes this is sqlinjectable
const inc = (name) => db.run(`update bongs set count=count+1 where name="${name}"`);
const dec = (name) => db.run(`update bongs set count=count-1 where name="${name}"`);

const secret = "abc"

app.put('/api/inc', async(req, res) => {
    await inc(req.body.name)
    giveList()
    res.end()
})

app.put('/api/dec', async(req, res) => {
    await dec(req.body.name)
    giveList()
    res.end()
})


app.get('/event-stream', (req, res) => {
    // SSE Setup
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    res.write('\n');

    function onPush(event, data) {
        res.write(`data: ${data} \n\n`);
    }

    stream.on("push", onPush);

    req.on("close", function() {
        stream.removeListener("push", onPush);
    });

    giveList()
});

const giveList = async() => {
    const data = await getBongs()
    stream.emit("push", "list", JSON.stringify(data))
}

app.use(express.static(path.join(__dirname, "front_end/public")));
app.get("*", (req, res) => res.sendFile(path.join(`${__dirname}/front_end/public/index.html`)));

app.listen(3000);