import React, { useState, useEffect } from "react";
import "../ToDoList/Todo.css";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";
import {
  fetchTodos,
  addTodoAsync,
  deleteTodoAsync,
  toggleDoneAsync,
  updateTodoAsync,
  startEdit,
  clearError,
} from "../store/todoSlice";

const TodoRedux = () => {
  const { user, logout } = useAuth();
  const todos = useSelector((state) => state.todos.todos);
  const loading = useSelector((state) => state.todos.loading);
  const error = useSelector((state) => state.todos.error);
  const dispatch = useDispatch();

  const [task, setTask] = useState("");
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (user && user.userId) {
      dispatch(fetchTodos(user.userId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  
  const addTheText = () => {
    if (!task || task.trim().length === 0) return;
    dispatch(addTodoAsync({ taskText: task.trim(), userId: user.userId }));
    setTask("");
  };

 
  const handleDelete = (id) => {
    dispatch(deleteTodoAsync(id));
  };


  const handleEdit = (id, text) => {
    setEditText(text);
    dispatch(startEdit(id));
  };

 
  const newEdit = (id) => {
    if (!editText || editText.trim().length === 0) return;

    const todoToUpdate = todos.find((t) => t.id === id);
    if (!todoToUpdate) return;

    dispatch(
      updateTodoAsync({
        id,
        text: editText.trim(),
        done: todoToUpdate.done,
      })
    );
    setEditText("");
  };

  
  const handleDone = (id) => {
    const todoToToggle = todos.find((t) => t.id === id);
    if (!todoToToggle) return;

    dispatch(toggleDoneAsync({ id, currentTodo: todoToToggle }));
  };

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
        <h1>Todo List</h1>
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
        <div style={{ color: "red", fontWeight: "bold" }}>
          Error: {error}
          <button
            onClick={() => dispatch(clearError())}
            style={{ marginLeft: "10px", padding: "5px 10px" }}
          >
            Dismiss
          </button>
        </div>
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
        {todos.map((t) => (
          <div className="each-task" key={t.id}>
            <button
              className={`btn-o1 done-btn`}
              onClick={() => handleDone(t.id)}
              title="Mark as done/undone"
            >
              done
            </button>

            {t.edit ? (
              <div className={`text-display ${t.done ? "undo" : "redo"}`}>
                {t.text}
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

            {t.edit ? (
              <button
                className="btn-o1 edit-btn"
                onClick={() => handleEdit(t.id, t.text)}
                title="Edit this task"
              >
                edit
              </button>
            ) : (
              <button
                className="btn-o1 edit-btn"
                onClick={() => newEdit(t.id)}
                title="Save changes"
              >
                Send
              </button>
            )}

            <button
              className="btn-o1 delete-btn"
              onClick={() => handleDelete(t.id)}
              title="Delete this task"
            >
              delete
            </button>
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

export default TodoRedux;
