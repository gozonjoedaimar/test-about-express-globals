const cron = require('node-cron')
const express = require('express')
const app = express()

// tasks store
globalThis.tasks = {}

// convert timeout to primitive (integer)
function toPrimitive(timeout) {
	return timeout[Symbol.toPrimitive]?.();
}

// create task id
function createTaskId() {
	const timeout = setTimeout(() => true, 0);
	const id = toPrimitive(timeout);
	clearTimeout(timeout);
	return id;
}

// register task to global tasks
function registerTask(task, uid) {
	const id = uid || createTaskId();
	tasks[id] = task;
	return id;
}

// destroy task from global tasks
function destroyTask(id) {
	if (tasks[id]) {
		tasks[id]?.destroy();
		delete tasks[id];
	}
}

// page route (index)
app.get('/', function(req, res) {
	res.send('Hello World')

	// task key
	let task_key = null;

	// execute cron every 5 secs
	const task = cron.schedule('*/5 * * * * *', () => {
		console.log('running a task every 5 seconds', task_key)
	})

	// register task and get id
	task_key = registerTask(task);
	console.log('started task_key', task_key);

	setTimeout(() => {
		// destroy the task after 15 secs
		destroyTask(task_key);
		console.log('task destroyed', task_key);
	}, 15_000);
})

// start checker 
setInterval(() => {
	// list keys
	console.log('tasks', Object.keys(tasks));
}, 1_000);

// start server
const port = process.env.PORT || 3100
app.listen(port)
console.log('Server is running on port ' + port)
