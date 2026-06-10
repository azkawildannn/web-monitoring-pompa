const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const mqtt = require("mqtt");
const aesjs = require("aes-js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("public"));

app.use(express.json());

app.post("/control", (req, res) => {

  const command = req.body.command;

  console.log("COMMAND:", command);

  mqttClient.publish(
    "azkawildan/pompa/control",
    command
  );

  res.json({
    success: true
  });
});

const aesKey =
aesjs.utils.utf8.toBytes("1234567890123456");

const mqttClient = mqtt.connect(
  "wss://754a593d901647a48754d5445da47a7e.s1.eu.hivemq.cloud:8884/mqtt",
  {
    username: "azkawildan",
    password: "Azkawildan2004",
    reconnectPeriod: 5000
  }
);

mqttClient.on("connect", () => {

  console.log("MQTT CONNECTED");

  mqttClient.subscribe(
    "azkawildan/pompa/data"
  );
});

function decryptAES(hexString)
{
  try
  {
    const encryptedBytes =
      aesjs.utils.hex.toBytes(hexString);

    const aesEcb =
      new aesjs.ModeOfOperation.ecb(aesKey);

    const decryptedBytes =
      aesEcb.decrypt(encryptedBytes);

    const decryptedText =
      aesjs.utils.utf8.fromBytes(
        decryptedBytes
      ).trim();

    return decryptedText;
  }
  catch(err)
  {
    console.log("DECRYPT ERROR:", err);
    return null;
  }
}

mqttClient.on("message", (topic, message) => {

  const encrypted =
    message.toString();

  console.log("ENCRYPTED:");
  console.log(encrypted);

  const decrypted =
    decryptAES(encrypted);

  console.log("DECRYPTED:");
  console.log(decrypted);

  if(!decrypted) return;

  try
  {
    const data =
      JSON.parse(decrypted);

    io.emit(
      "mqttData",
      data
    );
  }
  catch(err)
  {
    console.log(
      "JSON ERROR:",
      err
    );
  }
});

io.on("connection", () => {

  console.log("WEB CONNECTED");

  io.emit(
    "mqttStatus",
    "Connected"
  );
});

server.listen(3000, () => {

  console.log(
    "SERVER RUNNING: http://localhost:3000"
  );
});