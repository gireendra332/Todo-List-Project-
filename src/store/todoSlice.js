import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_BASE_URL = "http://localhost:4000";

// ASYNC THUNKS FOR API CALLS 

// Fetch all todos from backend
export const fetchTodos = createAsyncThunk(
    'todos/fetchTodos',
    async (userId, { rejectWithValue }) => {
        try {
            if (!userId) {
                throw new Error("User ID is required");
            }
            const response = await fetch(`${API_BASE_URL}/todos/${userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todos");
            }
            const data = await response.json();

            // Transform backend data to match frontend structure
            const formattedTodos = data.map(todo => ({
                id: todo.id,
                text: todo.itemDescription,
                done: todo.completed === 1 || todo.completed === true,
                edit: todo.edit === 1 || todo.edit === true
            }));

            return formattedTodos;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Add new todo to backend
export const addTodoAsync = createAsyncThunk(
    'todos/addTodo',
    async ({ taskText, userId }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemDescription: taskText.trim(),
                    complete: false,
                    userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add todo");
            }

            const result = await response.json();
            console.log("Todo added successfully with ID:", result.id);

            return {
                id: result.id,
                text: taskText.trim(),
                done: false,
                edit: true
            };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Delete todo from backend
export const deleteTodoAsync = createAsyncThunk(
    'todos/deleteTodo',
    async (todoId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete todo");
            }

            console.log("Todo deleted successfully");
            return todoId;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Update todo in backend
export const updateTodoAsync = createAsyncThunk(
    'todos/updateTodo',
    async ({ id, text, done }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: text.trim(),
                    edit: true,
                    done
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update todo");
            }

            console.log("Todo updated successfully");
            return { id, text: text.trim(), done };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Toggle done status
export const toggleDoneAsync = createAsyncThunk(
    'todos/toggleDone',
    async ({ id, currentTodo }, { rejectWithValue }) => {
        try {
            const newDoneStatus = !currentTodo.done;
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: currentTodo.text,
                    edit: currentTodo.edit,
                    done: newDoneStatus
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to toggle todo");
            }

            console.log("Todo status toggled successfully");
            return { id, done: newDoneStatus };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

//  REDUX SLICE

const initialState = {
    todos: [],
    loading: false,
    error: null
}

const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        // Local action to enter edit mode without API call
        startEdit: (state, action) => {
            const id = action.payload;
            state.todos = state.todos.map(t => ({
                ...t,
                edit: t.id === id ? false : true
            }));
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch todos handlers
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.loading = false;
                state.todos = action.payload;
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Add todo handlers
        builder
            .addCase(addTodoAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(addTodoAsync.fulfilled, (state, action) => {
                state.todos.unshift(action.payload);
            })
            .addCase(addTodoAsync.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Delete todo handlers
        builder
            .addCase(deleteTodoAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteTodoAsync.fulfilled, (state, action) => {
                state.todos = state.todos.filter(t => t.id !== action.payload);
            })
            .addCase(deleteTodoAsync.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Update todo handlers
        builder
            .addCase(updateTodoAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(updateTodoAsync.fulfilled, (state, action) => {
                const { id, text, done } = action.payload;
                const todo = state.todos.find(t => t.id === id);
                if (todo) {
                    todo.text = text;
                    todo.edit = true;
                    todo.done = done;
                }
            })
            .addCase(updateTodoAsync.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Toggle done handlers
        builder
            .addCase(toggleDoneAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(toggleDoneAsync.fulfilled, (state, action) => {
                const { id, done } = action.payload;
                const todo = state.todos.find(t => t.id === id);
                if (todo) {
                    todo.done = done;
                }
            })
            .addCase(toggleDoneAsync.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
})

export const { startEdit, clearError } = todoSlice.actions

export default todoSlice.reducer
