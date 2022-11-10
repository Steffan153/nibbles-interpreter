const express = require("express");
const path = require("path");
const child_process = require("child_process");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/DejaVuSansMono.ttf", (_, res) => {
  res.sendFile(path.join(__dirname, "DejaVuSansMono.ttf"));
});

app.post("/run", (req, res) => {
  fs.writeFile("code.nbl", req.body.code, (err) => {
    if (err) {
      res.status(500).send("Writing code to file failed.");
      return;
    }
    const proc = child_process.spawn("./nibbles", [
      "code.nbl",
      ...req.body.inputs,
    ]);
    const timeout = setTimeout(() => proc.kill("SIGINT"), 10000);
    let out = "";
    let debug = "";
    let outExceeded = false,
      debugExceeded = false;
    proc.stdout.on("data", (chunk) => {
      out += chunk;
      if (out.length > 10000 && !outExceeded) {
        proc.kill("SIGINT");
        clearTimeout(timeout);
        debug += "\nSTDOUT exceeded 10KB, process was terminated.";
        outExceeded = true;
      }
    });
    proc.stderr.on("data", (chunk) => {
      debug += chunk;
      if (debug.length > 10000 && !debugExceeded) {
        proc.kill("SIGINT");
        clearTimeout(timeout);
        debug += "\nSTDERR exceeded 10KB, process was terminated.";
        debugExceeded = true;
      }
    });
    proc.on("close", () => {
      clearTimeout(timeout);
      res.send({ out, debug });
    });
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
