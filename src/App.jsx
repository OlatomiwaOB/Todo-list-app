import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import "./App.css";
import { FaTrash, FaSearch } from "react-icons/fa";
const fetchTodos = async () => {
  const res = await axios.get("https://jsonplaceholder.typicode.com/todos");
  return res.data;
};

const addTodo = async (newTode) => {
  const res = await axios.post(
    "https://jsonplaceholder.typicode.com/todos",
    newTode
  );
  return res.data;
};
// Error component
function CrashComponent() {
  throw new Error("Test error for ErrorBoundary!");
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

// Notfound component
function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

function MainApp() {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [crash, setCrash] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Handler for clicking a Todo
  const handleTodoClick = (todo) => {
    setSelectedTodo(todo);
    setShowModal(true);
  };

  const handleToggle = (todoId) => {
    queryClient.setQueryData(["todos"], (olaData = []) =>
      olaData.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const handleAdd = () => {
    if (!text.trim()) return;

    const newTodo = {
      userId: 1,
      id: Date.now(),
      title: text,
      completed: false,
    };
    queryClient.setQueryData(["todos"], (oldData = []) => [
      ...oldData,
      newTodo,
    ]);
    setText("");
  };

  // Edit and Delete Handlers
  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(selectedTodo.title);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle("");
  };

  const handleSave = () => {
    queryClient.setQueryData(["todos"], (olaData = []) =>
      olaData.map((todo) =>
        todo.id === selectedTodo.id ? { ...todo, title: editTitle } : todo
      )
    );
    setSelectedTodo({ ...selectedTodo, title: editTitle });
    setIsEditing(false);
  };

  const handleDelete = (todoId) => {
    queryClient.setQueryData(["todos"], (oldData) =>
      oldData.filter((todo) => todo.id !== todoId)
    );
    setShowModal(false);
  };
  // filter todo
  let filteredTodos = todos;
  if (filter === "completed")
    filteredTodos = todos.filter((todo) => todo.completed);
  if (filter === "pending")
    filteredTodos = todos.filter((todo) => !todo.completed);

  // Add this for search
  if (search.trim()) {
    filteredTodos = filteredTodos.filter((todo) =>
      todo.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  // pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const currentTodos = filteredTodos.slice(startIdx, startIdx + itemsPerPage);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="todo-container">
      <h1 className="todo-title">To-Do List</h1>
      <div className="todo-search-row">
        <input
          type="Search"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setSearch(e.target.value);
          }}
          placeholder="Search here..."
          className="todo-search-input"
          style={{
            width: "100%",
            padding: "8px  12px",
            // alignItems: "center",
            borderRadius: 4,
            border: "1px solid #ccc",
            marginLeft: 70,
            marginRight: 10,
          }}
        />
        <button
          type="button"
          onClick={() => {
            console.log("Search clicked:", searchInput);
            setSearch(searchInput);
          }}
          className="todo-search-button"
          style={{
            // background: "#fff",
            color: "#fff",
            border: "none",
            borderRadius: 2,
            padding: "8px 16px",
            fontSize: 25,
            cursor: "pointer",
          }}
          aria-label="Search"
        >
          <FaSearch />
        </button>
      </div>

      {crash && <CrashComponent />}
      {/* filter buttons */}
      {/* <div style={{ marginBottom: 16 }}> */}
      <div className="todo-filters">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          style={{
            fontWeight: filter === "all" ? "bold" : "normal",
            background: filter === "all" ? "#1976d2" : "#eee",
            color: filter === "all" ? "#fff" : "#333",
            marginRight: 8,
            border: "none",
            borderRadius: 4,
            padding: "12px 16px",
            cursor: "pointer",
          }}
        >
          All
        </button>
        <button
          onClick={() => {
            setFilter("pending");
            setPage(1);
          }}
          style={{
            fontWeight: filter === "pending" ? "bold" : "normal",
            background: filter === "pending" ? "#1976d2" : "#eee",
            color: filter === "pending" ? "#fff" : "#333",
            marginLeft: 8,
            border: "none",
            borderRadius: 4,
            padding: "12px 16px",
            cursor: "pointer",
          }}
        >
          Incomplete
        </button>
        <button
          onClick={() => {
            setFilter("completed");
            setPage(1);
          }}
          style={{
            fontWeight: filter === "completed" ? "bold" : "normal",
            background: filter === "completed" ? "#1976d2" : "#eee",
            color: filter === "completed" ? "#fff" : "#333",
            marginLeft: 8,
            border: "none",
            borderRadius: 4,
            padding: "12px 16px",
            cursor: "pointer",
          }}
        >
          Completed
        </button>
      </div>
      <div className="todo-add-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a to-do"
          className="todo-add-input"
        />
        <button onClick={handleAdd} className="todo-add-btn">
          ADD Todo
        </button>
      </div>
      <ul className="todo-list">
        {currentTodos.map((todo) => (
          <li
            key={todo.id}
            onClick={() => handleTodoClick(todo)}
            style={{
              display: "flex",
              cursor: "pointer",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              borderBottom: "1px solid #ccc",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
                className={`todo-item${todo.completed ? " completed" : " "}`}
              />
              <span> {todo.title}</span>
            </label>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(todo.id);
              }}
              style={{ color: "red" }}
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
      <div className="todo-pagination" style={{ margin: 16 }}>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="todo-page-bth"
        >
          previous
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx + 1}
            onClick={() => setPage(idx + 1)}
            style={{
              fontWeight: page === idx + 1 ? "bold" : "normal",
              background: page === idx + 1 ? "#ddd" : "#1976d2",
              color: "white",
              border: "4px solid #ccc",
              borderRadius: 4,
              padding: "10px 20px",
            }}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="todo-page-bth"
        >
          Next
        </button>
        <span className="todo-page-info">
          page {page} of {totalPages}
        </span>
      </div>
      {showModal && selectedTodo && (
        // ...modal code...
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 8,
              minWidth: 300,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => setShowModal(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "transparent",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2 id="modal-title">Todo Details</h2>
            {isEditing ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: "98%", marginBottom: 12 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleSave}
                    style={{
                      background: "#006400",
                      color: "#ffffff",
                      width: "50%",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: "#ff0000",
                      color: "#ffffff",
                      width: "50%",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>Title:</strong> {selectedTodo.title}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedTodo.completed ? "✅ Completed" : "❌ Not completed"}
                </p>
                <p>
                  <strong>Todo ID:</strong> {selectedTodo.id}
                </p>
                <p>
                  <strong>User ID:</strong> {selectedTodo.userId}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleEdit}
                    style={{
                      background: "#0000ff",
                      color: "#ffffff",
                      width: "50%",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedTodo.id)}
                    style={{
                      background: "#ff0000",
                      color: "#ffffff",
                      width: "50%",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
