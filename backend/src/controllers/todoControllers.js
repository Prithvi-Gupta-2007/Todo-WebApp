import Todo from "../models/Todo.js";

const getAllTodos = async (req, res) => {
    try {
        const todos = await Todo.find();
        res.status(200).json(todos);
    } catch (error) {
        console.error("Error fetching todos", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getTodoById = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json(todo);
    } catch (error) {
        console.error("Error fetching todo by id", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const createTodo = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const newTodo = new Todo({ title });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.error("Error creating todo", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// FIX: Added missing updateTodoTitle handler for PATCH /api/todos/:id
const updateTodoTitle = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json(todo);
    } catch (error) {
        console.error("Error updating todo title", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteTodo = async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json(deletedTodo);
    } catch (error) {
        console.error("Error deleting todo", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const createTask = async (req, res) => {
    try {
        const { task } = req.body;
        if (!task) {
            return res.status(400).json({ message: "Task text is required" });
        }

        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        todo.tasks.push({ task, completed: false });
        await todo.save();

        // FIX: Return the full todo so the frontend cache stays consistent
        res.status(201).json(todo);
    } catch (error) {
        console.error("Error creating task", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateTask = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        const task = todo.tasks.id(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.completed = !task.completed;
        await todo.save();

        // FIX: Return the full todo so the frontend cache stays consistent
        res.status(200).json(todo);
    } catch (error) {
        console.error("Error updating task", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteTask = async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { $pull: { tasks: { _id: req.params.taskId } } },
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json(todo);
    } catch (error) {
        console.error("Error deleting task", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { 
    getAllTodos, 
    getTodoById, 
    createTodo, 
    updateTodoTitle,  // FIX: export the new handler
    deleteTodo, 
    createTask, 
    updateTask, 
    deleteTask 
};