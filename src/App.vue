<template>
  <!-- Login Form (shown when not authenticated) -->
  <div v-if="!isAuthenticated" class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" type="text" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <div v-if="loginError" class="error">{{ loginError }}</div>
  </div>

  <!-- Todo App (shown when authenticated) -->
  <div v-else class="todo-container">
    <div class="header-with-logout">
      <h1 class="todo-title">To-Do List</h1>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>

    <!-- Search -->
    <div class="todo-search-row">
      <input
        type="search"
        v-model="searchInput"
        @input="search = searchInput"
        placeholder="Search here..."
        class="todo-search-input"
        style="width: 100%; padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc; margin-left: 70px; margin-right: 10px;"
      />
      <button
        type="button"
        @click="search = searchInput"
        class="todo-search-button"
        style="color: #fff; border: none; border-radius: 2px; padding: 8px 16px; font-size: 25px; cursor: pointer;"
      >
        🔍
      </button>
    </div>

    <!-- Filter -->
    <div class="todo-filters">
      <button @click="setFilter('all')" :style="filterStyle('all')">All</button>
      <button @click="setFilter('pending')" :style="filterStyle('pending')">Incomplete</button>
      <button @click="setFilter('completed')" :style="filterStyle('completed')">Completed</button>
    </div>

    <!-- Add Todo -->
    <div class="todo-add-row">
      <input
        v-model="text"
        placeholder="Add a to-do"
        class="todo-add-input"
      />
      <button @click="handleAdd" class="todo-add-btn">ADD Todo</button>
    </div>

    <!-- Todo List -->
    <ul class="todo-list">
      <li
        v-for="todo in currentTodos"
        :key="todo.id"
        @click="handleTodoClick(todo)"
        style="display: flex; cursor: pointer; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #ccc;"
      >
        <label style="display: flex; align-items: center; gap: 8px;">
          <input
            type="checkbox"
            :checked="todo.completed"
            @change.stop="handleToggle(todo.id)"
          />
          <span>{{ todo.title }}</span>
        </label>
        <button
          class="delete-btn"
          @click.stop="handleDelete(todo.id)"
          style="color: red;"
        >
          🗑
        </button>
      </li>
    </ul>

    <!-- Pagination -->
    <div class="todo-pagination" style="margin: 16px;">
      <button @click="page--" :disabled="page === 1">Previous</button>
      <button
        v-for="idx in totalPages"
        :key="idx"
        @click="page = idx"
        :style="{
          fontWeight: page === idx ? 'bold' : 'normal',
          background: page === idx ? '#ddd' : '#1976d2',
          color: 'white',
          border: '4px solid #ccc',
          borderRadius: '4px',
          padding: '10px 20px'
        }"
      >
        {{ idx }}
      </button>
      <button @click="page++" :disabled="page === totalPages">Next</button>
      <span>page {{ page }} of {{ totalPages }}</span>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal && selectedTodo"
      role="dialog"
      aria-modal="true"
      class="modal-overlay"
      @click="showModal = false"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <button class="modal-close" @click="showModal = false">&times;</button>
        <h2 id="modal-title">Todo Details</h2>

        <template v-if="isEditing">
          <input v-model="editTitle" style="width: 98%; margin-bottom: 12px;" />
          <div style="display: flex; gap: 8px;">
            <button @click="handleSave" style="background: #006400; color: #fff; width: 50%; border: none; border-radius: 4px; padding: 6px 16px; cursor: pointer;">Save Changes</button>
            <button @click="handleCancel" style="background: #ff0000; color: #fff; width: 50%; border: none; border-radius: 4px; padding: 6px 16px; cursor: pointer;">Cancel</button>
          </div>
        </template>

        <template v-else>
          <p><strong>Title:</strong> {{ selectedTodo.title }}</p>
          <p><strong>Status:</strong> {{ selectedTodo.completed ? "✅ Completed" : "❌ Not completed" }}</p>
          <p><strong>Todo ID:</strong> {{ selectedTodo.id }}</p>
          <p><strong>User ID:</strong> {{ selectedTodo.userId }}</p>
          <div style="display: flex; gap: 8px;">
            <button @click="handleEdit" style="background: #0000ff; color: #fff; width: 50%; border: none; border-radius: 4px; padding: 6px 16px; cursor: pointer;">Edit</button>
            <button @click="handleDelete(selectedTodo.id)" style="background: #ff0000; color: #fff; width: 50%; border: none; border-radius: 4px; padding: 6px 16px; cursor: pointer;">🗑</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

// Authentication state
const username = ref("");
const password = ref("");
const isAuthenticated = ref(false);
const loginError = ref("");

// Todo app state
const todos = ref<Todo[]>([]);
const text = ref("");
const page = ref(1);
const selectedTodo = ref<Todo | null>(null);
const showModal = ref(false);
const isEditing = ref(false);
const editTitle = ref("");
const filter = ref<"all" | "completed" | "pending">("all");
const searchInput = ref("");
const search = ref("");

// Authentication methods
const login = () => {
  if (username.value === "Idowu" && password.value === "Olatomiwa") {
    isAuthenticated.value = true;
    loginError.value = "";
    fetchTodos(); // Load todos after successful login
  } else {
    loginError.value = "Invalid credentials. Try: Idowu/Olatomiwa";
  }
};

const logout = () => {
  isAuthenticated.value = false;
  username.value = "";
  password.value = "";
  todos.value = [];
};

// Fetch todos
const fetchTodos = async () => {
  const res = await axios.get("https://jsonplaceholder.typicode.com/todos");
  todos.value = res.data;
};

// Only fetch todos if authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    fetchTodos();
  }
});

// Computed filtered todos
const filteredTodos = computed(() => {
  let result = [...todos.value];
  if (filter.value === "completed") {
    result = result.filter((t) => t.completed);
  } else if (filter.value === "pending") {
    result = result.filter((t) => !t.completed);
  }
  if (search.value.trim()) {
    result = result.filter((t) =>
      t.title.toLowerCase().includes(search.value.toLowerCase())
    );
  }
  return result;
});

// Pagination
const itemsPerPage = 10;
const totalPages = computed(() =>
  Math.ceil(filteredTodos.value.length / itemsPerPage)
);
const currentTodos = computed(() => {
  const startIdx = (page.value - 1) * itemsPerPage;
  return filteredTodos.value.slice(startIdx, startIdx + itemsPerPage);
});

// Handlers
const handleAdd = () => {
  if (!text.value.trim()) return;
  todos.value.push({
    userId: 1,
    id: Date.now(),
    title: text.value,
    completed: false,
  });
  text.value = "";
};
const handleToggle = (id: number) => {
  todos.value = todos.value.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
};
const handleDelete = (id: number) => {
  todos.value = todos.value.filter((t) => t.id !== id);
  showModal.value = false;
};
const handleTodoClick = (todo: Todo) => {
  selectedTodo.value = todo;
  showModal.value = true;
};
const handleEdit = () => {
  if (!selectedTodo.value) return;
  isEditing.value = true;
  editTitle.value = selectedTodo.value.title;
};
const handleCancel = () => {
  isEditing.value = false;
  editTitle.value = "";
};
const handleSave = () => {
  if (!selectedTodo.value) return;
  todos.value = todos.value.map((t) =>
    t.id === selectedTodo.value!.id ? { ...t, title: editTitle.value } : t
  );
  selectedTodo.value = { ...selectedTodo.value, title: editTitle.value };
  isEditing.value = false;
};
const setFilter = (f: "all" | "completed" | "pending") => {
  filter.value = f;
  page.value = 1;
};

// Dynamic styles for filters
const filterStyle = (type: "all" | "completed" | "pending") => {
  return {
    fontWeight: filter.value === type ? "bold" : "normal",
    background: filter.value === type ? "#1976d2" : "#eee",
    color: filter.value === type ? "#fff" : "#333",
    margin: "0 8px",
    border: "none",
    borderRadius: "4px",
    padding: "12px 16px",
    cursor: "pointer",
  };
};
</script>

