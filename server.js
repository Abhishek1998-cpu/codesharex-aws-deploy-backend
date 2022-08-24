const ACTIONS = require("./Actions.js");
const express = require("express");
const App = express();
const http = require("http").createServer(App);
const mongoose = require("mongoose");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const { executeJs } = require("./executeJs");
const { executeC } = require("./executeC");
const { executeJava } = require("./executeJava");
const Job = require("./models/Job");
let cors = require("cors");

const io = require("socket.io")(http, {
  cors: {
    origins: ["http://ec2-54-159-198-233.compute-1.amazonaws.com:5000/"],
  },
});

const DB =
  "mongodb+srv://Abhishek:000@cluster0.dg7dbtp.mongodb.net/codesharex?retryWrites=true&w=majority";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Successfull");
  })
  .catch((err) => {
    console.log("Connection Unsuccessful: " + err);
  });

App.use(express.urlencoded({ extended: true }));
App.use(express.json());
App.use(cors());

const userSocketMap = {};
function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        userName: userSocketMap[socketId],
      };
    }
  );
}

App.get("/", (req, res) => {
  res.send("<h2>Welcome to the Live Code Share</h2>");
});

App.get("/status", async (req, res) => {
  const jobId = req.query.id;
  if (jobId === undefined) {
    return res
      .status(400)
      .json({ success: false, error: "Missing Id Query Params " });
  }
  try {
    const job = await Job.findById(jobId);
    if (job === undefined) {
      return res.status(404).json({ success: false, error: "Invalid Job Id" });
    }
    return res.status(200).json({ success: true, job });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, error: JSON.stringify(error) });
  }
});

App.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  console.log(language);
  console.log(code);
  if (code === undefined) {
    return res
      .status(400)
      .json({ success: false, error: "Empty! Code not found" });
  }
  let job;
  try {
    const filePath = await generateFile(language, code);
    console.log("New 1 = " + filePath);
    job = await new Job({ language, filePath }).save();
    console.log("Hi hello");
    const jobId = job["_id"];
    res.status(201).json({ success: true, jobId });
    let output;
    job["startedAt"] = new Date();
    try {
      if (language === "py") {
        output = await executePy(filePath);
      } else if (language === "js") {
        console.log("Execute Js");
        output = await executeJs(filePath);
      } else if (language === "c") {
        output = await executeC(filePath);
      } else if (language === "java") {
        output = await executeJava(filePath);
      } else {
        output = await executeCpp(filePath);
      }
      job["completedAt"] = new Date();
      job["status"] = "success";
      job["output"] = output;
      await job.save();
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = JSON.stringify(err);
    await job.save();
  }
});

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {
    userSocketMap[socket.id] = userName;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        userName,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ code, socketId }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        userName: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
  console.log(`Listening on the port ${PORT}`);
});
