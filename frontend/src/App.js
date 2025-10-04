import "./App.css";
import LoginRegister from "./components/Auth/LoginRegister";
import Dashboard from "./Dashboard";
import { isAuthenticated, getUserRole } from "./utils/auth";
import { useState } from "react";
import Admin from "./components/admin/Admin";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AllUsers from "./components/admin/AllUsers";
import ManagePost from "./components/admin/ManagePost";
import Feed from "./components/user/Feed";
import CreatePost from "./components/user/CreatePost";
import Profile from "./components/user/Profile";
import PostDetail from "./components/user/PostDetails";
import Chat from "./components/user/chat/Chat";
import ChatBox from "./components/user/chat/ChatBox";

function App() {
  const [auth, setAuth] = useState(isAuthenticated);
  const role = getUserRole();
  console.log();

  return (
    <div className="App">
      <Router>
        <Routes>
          {!auth ? (
            <Route
              path="*"
              element={<LoginRegister onAuthSuccess={() => setAuth(true)} />}
            />
          ) : role == "admin" ? (
            <>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/all-users" element={<AllUsers />} />
              <Route path="/admin/manage-posts" element={<ManagePost />} />
              <Route path="/admin/profile/:id" element={<Profile />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </>
          ) : (
            <>
              <Route path="/feed" element={<Feed />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route
                path="/chatbox/chat/:sender_id/:receiver_id"
                element={<Chat />}
              />
              <Route path="/chatbox" element={<ChatBox />} />
              <Route path="*" element={<Navigate to="/feed" />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
