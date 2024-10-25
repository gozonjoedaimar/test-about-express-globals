const cron = require('node-cron')
const express = require('express')
const app = express()

let tasks = {}

function toPrimitive(timeout) {
	return timeout[Symbol.toPrimitive]?.();
}

function createTaskId() {
	const timeout = setTimeout(() => true, 0);
	const id = toPrimitive(timeout);
	clearTimeout(timeout);
	return id;
}

function registerTask(task, uid) {
	const id = uid || createTaskId();
	tasks[id] = task;
	return id;
}

function destroyTask(id) {
	if (tasks[id]) {
		tasks[id]?.destroy();
		delete tasks[id];
	}
}

app.get('/', function(req, res) {
	res.send('Hello World')
	let task_key = null;
	// execute cron every 12 secs
	const task = cron.schedule('*/5 * * * * *', () => {
		console.log('running a task every 5 seconds')
		console.log('task_key', task_key);
	})

	task_key = registerTask(task);
	console.log('started task_key', task_key);

	setTimeout(() => {
		// destroy the task after 15 secs
		destroyTask(task_key);
		console.log('task destroyed');
	}, 15_000);
})

// start checker 
setInterval(() => {
	// list keys
	console.log('tasks', Object.keys(tasks));
}, 1_000);

const port = process.env.PORT || 3100
app.listen(port)
console.log('Server is running on port ' + port)
