import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [
        {
            task: {
                type: String,
                required: true
            },
            completed: {
                type: Boolean,
                default: false
            }
        }
    ]
}, { timestamps: true });

// Virtuals for taskCount and completedCount
TodoSchema.virtual('taskCount').get(function () {
    return this.tasks.length;
});

TodoSchema.virtual('completedCount').get(function () {
    return this.tasks.filter(task => task.completed).length;
});

TodoSchema.set('toJSON', { virtuals: true });
TodoSchema.set('toObject', { virtuals: true });

const Todo = mongoose.model("Todo", TodoSchema);

export default Todo;