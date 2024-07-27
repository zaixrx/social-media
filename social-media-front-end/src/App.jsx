import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./routes/home";
import NavBar from "./components/navbar";
import LoginForm from "./routes/loginForm";
import RegisterForm from "./routes/registerForm";
import NotFound from "./routes/notfound";
import Logout from "./routes/logout";
import Profile from "./routes/profile";
import { getCurrentUser } from "./services/user";
import TestForm from "./routes/testForm";

function App() {
  const [user, setUser] = useState({});

  useEffect(() => {
    (async () => {
      const user = getCurrentUser();

      setUser(user || {});
    })();
  }, []);

  function authMiddleware(Component) {
    return user._id ? Component : <LoginForm />;
  }

  return (
    <>
      <NavBar user={user} />
      <main>
        <Routes>
          <Route path="/testForm" element={<TestForm />} />
          <Route
            path="/profile/:_id"
            element={authMiddleware(<Profile currentUser={user} />)}
          />
          <Route path="/signout" element={authMiddleware(<Logout />)} />
          <Route path="/main" element={authMiddleware(<Home user={user} />)} />
          <Route
            path="/"
            element={authMiddleware(<Navigate to="/main" replace />)}
          />
          <Route path="/signup" element={<RegisterForm />} />
          <Route path="/signin" element={<LoginForm />} />
          <Route path="/notfound" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
