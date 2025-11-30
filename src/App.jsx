import { useState } from "react";
import Todo from "./ToDoList/Todo";
import TodoRedux from "./ToDoRedux/TodoRedux";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" or "signup"
  // Change "redux" to "local" to switch components
  // const [componentType, setComponentType] = useState("redux");

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>
    );
  }

  // If user is not logged in, show auth pages
  if (!user) {
    return (
      <>
        {authView === "login" ? (
          <Login onSwitchToSignup={() => setAuthView("signup")} />
        ) : (
          <Signup onSwitchToLogin={() => setAuthView("login")} />
        )}
      </>
    );
  }

  // If user is logged in, show todo app
  return (
    <div>
      {/* Toggle buttons to switch between implementations */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {/* <button
          onClick={() => setComponentType("local")}
          style={{
            padding: "10px 20px",
            backgroundColor: componentType === "local" ? "#4CAF50" : "#ddd",
            color: componentType === "local" ? "white" : "black",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📝 Todo (Local State)
        </button> */}
        {/* <button
          onClick={() => setComponentType("redux")}
          style={{
            padding: "10px 20px",
            backgroundColor: componentType === "redux" ? "#2196F3" : "#ddd",
            color: componentType === "redux" ? "white" : "black",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Todo List using Redux
        </button> */}
      </div>

      {/* Render the selected component */}
      {/* {componentType === "local" ? <Todo /> : <TodoRedux /> */}
      <TodoRedux />
    </div>
  );
}

export default App;
