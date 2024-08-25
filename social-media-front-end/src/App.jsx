import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./services/user";
import Home from "./routes/home";
import NavBar from "./components/navbar";
import NotFound from "./routes/notfound";
import Logout from "./routes/logout";
import Profile from "./routes/profile";
import SignInForm from "./routes/signinForm";
import SignUpForm from "./routes/signUpForm";
import Chat from "./routes/chat";

function App() {
  const [user, setUser] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const user = getCurrentUser();
    setUser(user || {});
    setLoaded(true);
  }, []);

  function authMiddleware(Component) {
    return user._id ? Component : <Navigate to="/signin" replace />;
  }

  return (
    loaded && (
      <>
        <NavBar user={user} />
        <main>
          <Routes>
            <Route
              path="/chat/:_id"
              element={authMiddleware(<Chat user={user} />)}
            />
            <Route
              path="/profile/:_id"
              element={authMiddleware(<Profile currentUser={user} />)}
            />
            <Route path="/signout" element={authMiddleware(<Logout />)} />
            <Route
              path="/main"
              element={authMiddleware(<Home user={user} />)}
            />
            <Route
              path="/"
              element={authMiddleware(<Navigate to="/main" replace />)}
            />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/signin" element={<SignInForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </>
    )
  );
}

export default App;
