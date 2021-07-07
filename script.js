// ATDAPI id: 112

const checkStatus = (response) => {
  if (response.ok) {
    //.ok returns true if resposne status is 200-299
    return response;
  }
  throw new Error("Request was either a 404 or 500");
};

const json = (response) => response.json();

class ToDoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new_task: "",
      tasks: [],
      filter: "all",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.toggleComplete = this.toggleComplete.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
  }

  componentDidMount() {
    this.fetchTasks(); //get tasks on mount
  }

  fetchTasks() {
    fetch("https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=108")
      .then(checkStatus)
      .then(json)
      .then((response) => {
        console.log(response);
        this.setState({ tasks: response.tasks });
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  handleChange(event) {
    this.setState({ new_task: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    //make a new task
    let { new_task } = this.state; //destructuring
    new_task = new_task.trim();
    if (!new_task) {
      return; //early return
    }

    fetch("https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=108", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: {
          content: new_task,
        },
      }),
    })
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.setState({ new_task: "" });
        this.fetchTasks();
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  deleteTask(id) {
    if (!id) {
      return; //if no id, then early return
    }

    fetch(
      `https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}?api_key=108`,
      {
        method: "DELETE",
        mode: "cors",
      }
    )
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.fetchTasks(); //fetch tasks after delete
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  toggleComplete(id, completed) {
    if (!id) {
      return;
    }
    const newState = completed ? "active" : "complete";

    fetch(
      `https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}/mark_${newState}?api_key=108`,
      {
        method: "PUT",
        mode: "cors",
      }
    )
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.fetchTasks();
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  toggleFilter(e) {
    console.log(e.target.name);
    this.setState({
      filter: e.target.name,
    });
  }

  render() {
    const { new_task, tasks, filter } = this.state;

    return (
      <div className="container-fluid pt-3 my-3">
        <h1 className="mb-3 text-center">To Do List</h1>
        <div className="row col-xs-12 col-sm-8 mx-auto text-center my-2 px-2 row-wrapper">
          <div className="col my-2">
            <label className="mx-2">
              <input
                type="checkbox"
                name="all"
                checked={filter === "all"}
                onChange={this.toggleFilter}
              />{" "}
              All
            </label>
            <label className="mx-2">
              <input
                type="checkbox"
                name="active"
                checked={filter === "active"}
                onChange={this.toggleFilter}
              />{" "}
              Active
            </label>
            <label className="mx-2">
              <input
                type="checkbox"
                name="completed"
                checked={filter === "completed"}
                onChange={this.toggleFilter}
              />{" "}
              Completed
            </label>
            <form onSubmit={this.handleSubmit} className="form-inline my-4">
              <input
                type="text"
                className="form-control mr-sm-2 mb-2"
                placeholder="new task"
                value={new_task}
                onChange={this.handleChange}
              />
              <button type="submit" className="btn btn-primary mb-2">
                Submit
              </button>
            </form>
          </div>
        </div>
        <div className="row col-xs-12 col-sm-8 mx-auto wrapper-two">
          <div className="col">
            <ul className="list-group list-group-flush my-2">
              {tasks.length > 0 ? (
                tasks
                  .filter((task) => {
                    if (filter === "all") {
                      return true;
                    } else if (filter === "active") {
                      return !task.completed;
                    } else {
                      return task.completed;
                    }
                  })
                  .map((task) => {
                    return (
                      <Task
                        key={task.id}
                        task={task}
                        onDelete={this.deleteTask}
                        onComplete={this.toggleComplete}
                      />
                    );
                  })
              ) : (
                <h3 className="text-center my-2">No tasks here</h3>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

class Task extends React.Component {
  render() {
    const { task, onDelete, onComplete } = this.props;
    const { id, content, completed } = task;

    return (
      <li className="list-group-item">
        <input
          className="form-check-input rounded-circle me-1 mt-2"
          type="checkbox"
          onChange={() => onComplete(id, completed)}
          checked={completed}
        />
        <label className="form-check-label pt-2">{content}</label>
        <button
          className="btn btn-sm remove-item border"
          onClick={() => onDelete(id)}
        >
          Delete
        </button>
      </li>
    );
  }
}

ReactDOM.render(<ToDoList />, document.getElementById("root"));
