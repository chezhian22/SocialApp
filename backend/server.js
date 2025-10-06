const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const initDatabase = require("./init-db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://52.90.158.202:3000", // your React frontend
    methods: ["GET", "POST"],
  },
});
const PORT = 5001;
const SECRET_Key = "i_am_hero";

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "semma@2004",
  database: process.env.DB_NAME || "socialapp",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Post_images/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use("/Post_images", express.static(path.join(__dirname, "Post_images")));

// Initialize database and tables on startup
(async () => {
  try {
    await initDatabase();
    console.log("Database initialization complete");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
})();

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

app.post("/messages", (req, res) => {
  console.log(req.body);
  const { sender_id, receiver_id, message } = req.body;
  const sql =
    "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
  db.query(sql, [sender_id, receiver_id, message], (err) => {
    if (err) {
      console.error("Error saving message:", err);
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: "Message saved" });
  });
});

app.get("/messages/:user1/:user2", (req, res) => {
  const { user1, user2 } = req.params;
  const sql = `
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp ASC`;
  db.query(sql, [user1, user2, user2, user1], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ error: err.message });
    }
    res.send(results);
  });
});

// ✅ Socket.IO logic
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join", (userId) => {
    console.log(`User ${userId} joined their room`);
    socket.join(userId.toString()); // join user to their room
  });

  socket.on("sendMessage", (data) => {
    const { sender_id, receiver_id, message } = data;
    console.log(`Message from ${sender_id} to ${receiver_id}: ${message}`);
    console.log(`Emitting to room: ${receiver_id.toString()}`);
    io.to(receiver_id.toString()).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.post("/api/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  const updated_date = new Date().toISOString().slice(0, 19).replace("T", " ");
  // if(userExists) return res.status(400).json({msg:'User already exists'});
  const [rows] = await db
    .promise()
    .query("select * from users where email=?", [email]);
  if (rows.length > 0) return res.status(400).json("user already exists");
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
  // users.push({username:username,password:hashedPassword,role:role});
  try {
    await db
      .promise()
      .query(
        "insert into users(username,email,password,role,updated_date) values(?,?,?,?,?)",
        [username, email, hashedPassword, role, updated_date]
      );
    res.json({ msg: "registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db
    .promise()
    .query("select * from users where email=?", [email]);
  if (rows.length <= 0) return res.status(400).json({ msg: "user not exist" });
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid credentials" });
  const token = jwt.sign(
    {
      user_id: user.id,
      username: user.email,
      // password: user.password,
      role: user.role,
    },
    SECRET_Key,
    { expiresIn: "1h" }
  );
  res.json({ token });
});

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET_Key);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

app.post(
  "/api/create-post",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    const user_id = req.user.user_id;
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;
    try {
      await db
        .promise()
        .query(
          "Insert into posts(user_id,title,content,image_url) values(?,?,?,?)",
          [user_id, title, content, image]
        );
      res.json({ msg: "post created successfully" });
    } catch (err) {
      res.status(500).json({ msg: "server error" });
    }
  }
);

app.get("/api/feeds", verifyToken, async (req, res) => {
  try {
    const feeds = await db
      .promise()
      .query(
        "SELECT posts.id,posts.title,posts.content,posts.image_url,posts.created_at,users.username,COUNT(likes.id) AS like_count FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN likes ON likes.post_id = posts.id GROUP BY posts.id, posts.title, posts.content, posts.created_at, users.username ORDER BY posts.created_at DESC"
      );
    res.json(feeds[0]);
  } catch (err) {
    res.status(500).json({ msg: "server error" });
  }
});

app.get("/api/search-posts", verifyToken, async (req, res) => {
  const { q } = req.query;
  try {
    const [result] = await db
      .promise()
      .query("select * from posts where title like ? or content like ?", [
        `%${q}%`,
        `%${q}%`,
      ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "server error" });
  }
});

app.get("/api/user-profile/:id", verifyToken, async (req, res) => {
  const user_id = req.params.id;
  try {
    const [user] = await db
      .promise()
      .query("select * from users where id=?", [user_id]);
    if (user.length == 0) {
      return res.status(404).json({ msg: "user not found" });
    }
    const user_posts = await db
      .promise()
      .query("select * from posts where user_id=?", [user_id]);
    res.json({ user_detail: user[0], user_posts: user_posts[0] });
  } catch (err) {
    res.status(500).json({ msg: "server error" });
  }
});

app.delete("/api/delete-post/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.promise().query("delete from posts where id=?", [id]);
    res.json({ msg: "post deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "server error" });
  }
});

app.get("/api/users", verifyToken, async (req, res) => {
  // const role = req.user.role;
  // if(role=='admin'){
  const [result] = await db
    .promise()
    .query("select * from users where role=?", ["user"]);
  return res.json(result);
  // }else{
  // res.json({msg:"access denied"});
  // }
});

app.get("/api/search-users/:search", verifyToken, async (req, res) => {
  const search = req.params.search;
  try {
    const [result] = await db
      .promise()
      .query("select * from users where username like ? or email like ?", [
        `%${search}%`,
        `%${search}%`,
      ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "server error" });
  }
});

app.delete("/api/delete-user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.promise().query("delete from users where id=?", [id]);
    res.json({ msg: "user deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "server error" });
  }
});

app.post("/api/like/:id", verifyToken, async (req, res) => {
  const post_id = req.params.id;
  const user_id = req.user.user_id;
  try {
    const [result] = await db
      .promise()
      .query("select * from likes where user_id=? and post_id=?", [
        user_id,
        post_id,
      ]);
    if (result.length > 0) {
      await db
        .promise()
        .query("delete from likes where user_id=? and post_id=?", [
          user_id,
          post_id,
        ]);
    } else {
      await db
        .promise()
        .query("insert into likes(user_id,post_id) values(?,?)", [
          user_id,
          post_id,
        ]);
    }
  } catch (err) {
    res.json({ msg: "server error" });
  }
});

app.get("/api/feed/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db
      .promise()
      .query(
        "SELECT posts.id,posts.user_id,posts.title,posts.content,posts.created_at,posts.image_url,users.username,COUNT(likes.id) AS like_count FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN likes ON likes.post_id = posts.id where posts.id=? GROUP BY posts.id, posts.title, posts.content, posts.created_at, users.username",
        [id]
      );
    res.json(result[0]);
  } catch (err) {
    res.json({ msg: "server error" });
  }
});

app.post("/api/post-comment/:id", verifyToken, async (req, res) => {
  const post_id = req.params.id;
  const user_id = req.user.user_id;
  const { content } = req.body;
  // console.log(content,post_id,user_id)
  try {
    await db
      .promise()
      .query("insert into comments(user_id,post_id,content) values(?,?,?)", [
        user_id,
        post_id,
        content,
      ]);
    res.json({ msg: "comment posted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "server error" });
  }
});

app.get("/api/comments/:id", verifyToken, async (req, res) => {
  const post_id = req.params.id;
  try {
    const results = await db
      .promise()
      .query(
        "select comments.*,users.username from comments join users on comments.user_id = users.id where post_id=?",
        [post_id]
      );
    res.json(results[0]);
    // console.log(results[0])
  } catch (err) {
    res.status(500).json({ msg: "server error" });
  }
});

app.post(
  "/api/initiate-connection/:id/:user_id",
  verifyToken,
  async (req, res) => {
    const receiver_id = req.params.id;
    const requester_id = req.params.user_id;
    console.log(receiver_id);
    console.log(requester_id);
    try {
      await db
        .promise()
        .query(
          "insert into connections(requester_id,receiver_id,status) values(?,?,?)",
          [requester_id, receiver_id, "Pending"]
        );
      res.json("Connection initiated");
    } catch (err) {
      console.log(err);
      res.json("server error");
    }
  }
);

app.get("/api/connections/:user_id", verifyToken, async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [friends] = await db
      .promise()
      .query(
        "select u.id as friend_id,u.username from connections c join users u on u.id = case when requester_id=? then receiver_id else requester_id end where c.status='accepted' and (? in (requester_id,receiver_id))",
        [user_id, user_id]
      );
    res.json(friends);
    //   console.log(friends)
  } catch (err) {
    res.json("retrival error");
    console.log(err);
  }
});

app.get("/api/friend-requests/:user_id", verifyToken, async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [requests] = await db
      .promise()
      .query(
        "select c.id as connection_id,u.id,u.username from connections c join users u on c.requester_id = u.id where c.receiver_id =? and c.status='Pending'",
        [user_id]
      );
    res.json(requests);
  } catch (err) {
    console.log(err);
  }
});

app.put("/api/handle-request/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid staus" });
  }
  console.log(id + " " + status);
  try {
    await db
      .promise()
      .query("UPDATE connections SET status = ? WHERE id = ?", [status, id]);
    res.json({ success: true, message: `Friend request ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to request" });
  }
});

server.listen(PORT, '0.0.0.0', () =>
  console.log(`Backend running with Socket.IO on http://0.0.0.0:${PORT}`)
);

