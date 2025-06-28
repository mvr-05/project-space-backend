const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Store io instance globally in app
app.set('io', io);
// Connect MongoDB Atlas
mongoose.connect(process.env.MONGO_URI,{ 
  tls: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Connection error:", err));

// Routes
const authRoutes = require("./routes/auth");
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const courseQuizRoutes = require('./routes/course&quiz');
const uploads = require('./routes/upload');

app.use("/api/auth", authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/course&quiz', courseQuizRoutes);
app.use('/api/uploads', uploads);

// Socket connection logging
io.on('connection', socket => {
  console.log('Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
