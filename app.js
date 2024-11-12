// Store all tasks in memory
let tasks = [];

// Enable adding tasks with Enter key
document.getElementById('taskTitle').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Create and add a new task to the list
function addTask() {
    const title = document.getElementById('taskTitle').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const dueTime = document.getElementById('taskDueTime').value;
    if (title.trim()) {
        // Create task object with unique ID and initial properties
        const task = {
            id: Date.now().toString(), // Use timestamp as unique ID
            title: title,
            status: 'new',
            subTasks: [],
            dueDate: dueDate,
            dueTime: dueTime
        };
        tasks.push(task);
        renderTasks();
        // Clear input fields after adding task
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskDueTime').value = '';
    }
}

// Add a subtask to an existing task
function addSubTask(taskId) {
    const subTaskTitle = prompt('Enter sub-task title:');
    if (subTaskTitle && subTaskTitle.trim()) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            // Create subtask with unique ID
            task.subTasks.push({
                id: Date.now().toString(),
                title: subTaskTitle,
                completed: false
            });
            renderTasks();
        }
    }
}

// Toggle subtask completion status and update parent task status
function toggleSubTask(taskId, subTaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const subTask = task.subTasks.find(st => st.id === subTaskId);
        if (subTask) {
            subTask.completed = !subTask.completed;
            // If all subtasks are completed, mark parent task as completed
            if (task.subTasks.every(st => st.completed)) {
                task.status = 'completed';
            } else if (task.status === 'completed') {
                task.status = 'inProgress';
            }
            renderTasks();
        }
    }
}

// Move task to 'In Progress' status
function startTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = 'inProgress';
        renderTasks();
    }
}

// Create confetti celebration effect
function celebrateCompletion() {
    // First burst of confetti from the center
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    // Side bursts after a small delay
    setTimeout(() => {
        // Left side burst
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        // Right side burst
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }, 250);
}

// Mark task as completed and trigger celebration
function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = 'completed';
        renderTasks();
        // Trigger celebration effects
        celebrateCompletion();
        
        // Show completion message with animation
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.textContent = '🎉 Task Completed!';
        document.body.appendChild(message);
        
        // Remove message after animation
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
}

// Remove task from the list
function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
}

// Calculate progress percentage for tasks with subtasks
function calculateProgress(subTasks) {
    if (subTasks.length === 0) return 0;
    const completedTasks = subTasks.filter(st => st.completed).length;
    return Math.round((completedTasks / subTasks.length) * 100);
}

// Check if task is overdue based on due date and time
function isOverdue(task) {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDateTime = new Date(task.dueDate + 'T' + (task.dueTime || '23:59:59'));
    return now > dueDateTime && task.status !== 'completed';
}

// Get appropriate CSS class based on task status
function getTaskStatusClass(task) {
    if (isOverdue(task)) return 'task-overdue';
    switch (task.status) {
        case 'new': return 'task-new';
        case 'inProgress': return 'task-in-progress';
        case 'completed': return 'task-completed';
        default: return '';
    }
}

// Render all tasks in their respective columns
function renderTasks() {
    const columns = {
        'new': document.getElementById('newTasks'),
        'inProgress': document.getElementById('inProgressTasks'),
        'completed': document.getElementById('completedTasks')
    };

    // Clear and repopulate each column
    for (const status in columns) {
        columns[status].innerHTML = '';
        const tasksInColumn = tasks.filter(t => t.status === status);
        tasksInColumn.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-card ${getTaskStatusClass(task)}`;
            // Generate task card HTML with all components
            taskElement.innerHTML = `
                <h3>${task.title}</h3>
                ${task.dueDate ? `<div class="due-date">Due: ${task.dueDate} ${task.dueTime ? `at ${task.dueTime}` : ''}</div>` : ''}
                ${isOverdue(task) ? '<div class="due-date" style="color: #e74c3c;">Overdue</div>' : ''}
                ${task.subTasks.length > 0 ? `
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${calculateProgress(task.subTasks)}%"></div>
                    </div>
                    <div>${calculateProgress(task.subTasks)}%</div>
                ` : ''}
                <div class="sub-tasks">
                    ${task.subTasks.map(st => `
                        <div class="sub-task">
                            <input type="checkbox" id="${st.id}" ${st.completed ? 'checked' : ''} onchange="toggleSubTask('${task.id}', '${st.id}')">
                            <label for="${st.id}" ${st.completed ? 'style="text-decoration: line-through;"' : ''}>${st.title}</label>
                        </div>
                    `).join('')}
                </div>
                <div class="task-actions">
                    ${status === 'new' ? `<button class="btn-start" onclick="startTask('${task.id}')">Start</button>` : ''}
                    ${status !== 'completed' && task.subTasks.length === 0 ? `<button class="btn-complete" onclick="completeTask('${task.id}')">Complete</button>` : ''}
                    ${status !== 'completed' ? `<button class="btn-add-subtask" onclick="addSubTask('${task.id}')">Add Sub-task</button>` : ''}
                    <button class="btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
                </div>
            `;
            columns[status].appendChild(taskElement);
        });
    }
}

// Initial render of tasks
renderTasks();

// Check for overdue tasks every minute
setInterval(() => {
    let tasksUpdated = false;
    tasks.forEach(task => {
        if (isOverdue(task) && task.status !== 'completed') {
            tasksUpdated = true;
        }
    });
    if (tasksUpdated) {
        renderTasks();
    }
}, 60000);