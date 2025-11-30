import React, { useState, useEffect } from "react";
import "./Todo.css";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:4000";

const Todo = () => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============= FETCH TODOS ON COMPONENT MOUNT =============
  useEffect(() => {
    if (user && user.userId) {
      fetchTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  // ============= FETCH USER'S TODOS FROM BACKEND =============
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/todos/${user.userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch todos from server");
      }

      const data = await response.json();

      // Transform backend data to match frontend structure
      const formattedTodos = data.map((todo) => ({
        id: todo.id,
        text: todo.itemDescription,
        done: todo.completed === 1 || todo.completed === true,
        edit: todo.edit === 1 || todo.edit === true,
      }));

      setTodos(formattedTodos);
      console.log("Todos loaded successfully:", formattedTodos);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching todos:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============= ADD NEW TODO TO BACKEND =============
  const addTheText = async () => {
    if (!task || task.trim().length === 0) return;

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemDescription: task.trim(),
          complete: false,
          userId: user.userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add todo");
      }

      console.log("Todo added successfully");
      // Refresh todos after adding
      await fetchTodos();
      setTask("");
    } catch (err) {
      setError(err.message);
      console.error("Error adding todo:", err);
    }
  };

  // ============= DELETE TODO FROM BACKEND =============
  const handleDelete = async (todoId) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete todo");
      }

      console.log("Todo deleted successfully");
      // Refresh todos after deletion
      await fetchTodos();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting todo:", err);
    }
  };

  // ============= ENTER EDIT MODE FOR A TODO =============
  const handleEdit = (todoId, text) => {
    // Put item into edit mode and populate editText with current text
    const updatedTodos = todos.map((item) =>
      item.id === todoId ? { ...item, edit: false } : { ...item, edit: true }
    );
    setEditText(text);
    setTodos(updatedTodos);
  };

  // ============= SAVE EDITED TODO TO BACKEND =============
  const newEdit = async (todoId) => {
    if (!editText || editText.trim().length === 0) return;

    const todoToUpdate = todos.find((t) => t.id === todoId);
    if (!todoToUpdate) return;

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editText.trim(),
          edit: true,
          done: todoToUpdate.done,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update todo");
      }

      console.log("Todo updated successfully");
      // Refresh todos after updating
      await fetchTodos();
      setEditText("");
    } catch (err) {
      setError(err.message);
      console.error("Error updating todo:", err);
    }
  };

  // ============= TOGGLE DONE STATUS OF TODO =============
  const handleDone = async (todoId) => {
    const todoToToggle = todos.find((t) => t.id === todoId);
    if (!todoToToggle) return;

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: todoToToggle.text,
          edit: todoToToggle.edit,
          done: !todoToToggle.done,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle todo");
      }

      console.log("Todo status toggled successfully");
      // Refresh todos after toggling
      await fetchTodos();
    } catch (err) {
      setError(err.message);
      console.error("Error toggling todo:", err);
    }
  };

 
  // const handleDelete = (idx) => {
  //   const copy = todo.filter((_, i) => {
  //     return i !== idx;
  //   });
  //   // const copy = [...todo];
  //   // copy.splice(idx,1)
  //   setTodo(copy);
  // };

  // const handleEdit = (idx) => {
  //   // put item into edit mode and populate editText with its value
  //   const newTodo = todo.map((item, i) => ({
  //     ...item,
  //     edit: i === idx ? false : true,
  //   }));
  //   setEditText(todo[idx]?.text || "");
  //   setTodo(newTodo);
  // };

  // const newEdit = (idx) => {
  //   // apply editText to item at idx and return to display mode
  //   const newTodo = todo.map((item, i) => {
  //     if (i === idx) {
  //       return { ...item, text: editText, edit: true };
  //     }
  //     return item;
  //   });
  //   setTodo(newTodo);
  //   setEditText("");
  // };

  // const handleDone = (idx) => {
  //   const newTodo = todo.map((each, i) => {
  //     if (idx === i) {
  //       return { ...each, done: !each.done };
  //     }
  //     return each;
  //   });

  //   setTodo(newTodo);
  // };

  return (
    <div className="mainDiv">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto 30px",
        }}
      >
        <h1>Todo</h1>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "0 0 10px 0", color: "#666" }}>
             {user?.email}
          </p>
          <button
            onClick={logout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ff6b6b",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Display loading state */}
      {loading && (
        <p style={{ color: "blue", fontWeight: "bold" }}>Loading todos...</p>
      )}

      {/* Display error messages */}
      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>Error: {error}</p>
      )}

      <div className="input-section">
        <input
          className="add-input"
          type="text"
          placeholder="Enter your Todo"
          onChange={(e) => setTask(e.target.value)}
          value={task}
        />
        <button className="btn add-btn" onClick={addTheText}>
          Add
        </button>
      </div>

      <div>
        {todos.map((todoItem) => (
          <div className="each-task" key={todoItem.id}>
            <button
              className={`btn-o1 done-btn`}
              onClick={() => handleDone(todoItem.id)}
              title="Mark as done/undone"
            >
              done
            </button>

            {todoItem.edit ? (
              <div
                className={`text-display ${todoItem.done ? "undo" : "redo"}`}
              >
                {todoItem.text}
              </div>
            ) : (
              <input
                type="text"
                className="input-edit"
                onChange={(e) => setEditText(e.target.value)}
                value={editText}
                placeholder="Edit your task..."
              />
            )}

            {todoItem.edit ? (
              <button
                className="btn-o1 edit-btn"
                onClick={() => handleEdit(todoItem.id, todoItem.text)}
                title="Edit this task"
              >
                edit
              </button>
            ) : (
              <button
                className="btn-o1 edit-btn"
                onClick={() => newEdit(todoItem.id)}
                title="Save changes"
              >
                Send
              </button>
            )}

            <button
              className="btn-o1 delete-btn"
              onClick={() => handleDelete(todoItem.id)}
              title="Delete this task"
            >
              delete
            </button>

            {/* Old contentEditable code - commented out */}
            {/* <div contentEditable={bool}>hello</div>
            <button onClick={()=>setBool(prev=>!prev)}>edit</button> */}
          </div>
        ))}
      </div>

      {/* Show message when no todos exist */}
      {todos.length === 0 && !loading && (
        <p style={{ marginTop: "20px", color: "#999", fontSize: "14px" }}>
          No todos yet. Add one to get started!
        </p>
      )}
    </div>
  );
};

export default Todo;
