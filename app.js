const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};
initializeDBAndServer();

// API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;

  if (status !== undefined) {
    if (status == "TO DO" || status == "IN PROGRESS" || status == "DONE") {
      const getDataQuery = `
        SELECT
            id, todo, priority, status, category,
            due_date as dueDate
        FROM
            todo
        WHERE
            status = '${status}';`;
      const getData = await db.all(getDataQuery);
      response.send(getData);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (priority == "HIGH" || priority == "MEDIUM" || priority == "LOW") {
      const getDataQuery = `
        SELECT
            id, todo, priority, status, category,
            due_date as dueDate
        FROM
            todo
        WHERE
            priority = '${priority}';`;
      const getData = await db.all(getDataQuery);
      response.send(getData);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (status !== undefined && priority !== undefined) {
    if (status == "TO DO" || status == "IN PROGRESS" || status == "DONE") {
      if (priority == "HIGH" || priority == "MEDIUM" || priority == "LOW") {
        const getDataQuery = `
            SELECT
                id, todo, priority, status, category,
                due_date as dueDate
            FROM
                todo
            WHERE
                status = '${status}' AND priority = '${priority}';`;
        const getData = await db.all(getDataQuery);
        response.send(getData);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (search_q !== undefined) {
    const getDataQuery = `
        SELECT
            id, todo, priority, status, category,
            due_date as dueDate
        FROM
            todo
        WHERE
            todo LIKE '%${search_q}%';`;
    const getData = await db.all(getDataQuery);
    response.send(getData);
  } else if (category !== undefined && status !== undefined) {
    if (category == "WORK" || category == "HOME" || category == "LEARNING") {
      if (status == "TO DO" || status == "IN PROGRESS" || status == "DONE") {
        const getDataQuery = `
            SELECT
                id, todo, priority, status, category,
                due_date as dueDate
            FROM
                todo
            WHERE
                status = '${status}' AND category = '${category}';`;
        const getData = await db.all(getDataQuery);
        response.send(getData);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (category !== undefined) {
    if (category == "WORK" || category == "HOME" || category == "LEARNING") {
      const getDataQuery = `
        SELECT
            id, todo, priority, status, category,
            due_date as dueDate
        FROM
            todo
        WHERE
            category = '${category}';`;
      const getData = await db.all(getDataQuery);
      response.send(getData);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (category !== undefined && priority !== undefined) {
    if (category == "WORK" || category == "HOME" || category == "LEARNING") {
      if (priority == "HIGH" || priority == "MEDIUM" || priority == "LOW") {
        const getDataQuery = `
            SELECT
                id, todo, priority, status, category,
                due_date as dueDate
            FROM
                todo
            WHERE
                priority = '${priority}' AND category = '${category}';`;
        const getData = await db.all(getDataQuery);
        response.send(getData);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getDataQuery = `
        SELECT
            id, todo, priority, status, category,
            due_date as dueDate
        FROM
            todo
        WHERE
            id = ${todoId};`;
  const getData = await db.get(getDataQuery);
  response.send(getData);
});

// API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const validDate = isValid(new Date(date));

  if (validDate === true) {
    const formatDate = format(new Date(date), "yyyy-MM-dd");
    const getDataQuery = `
        SELECT
            id, todo, priority, status, category,
            due_date as dueDate
        FROM
            todo
        WHERE
            due_date = '${formatDate}';`;
    const getData = await db.all(getDataQuery);
    response.send(getData);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (status == "TO DO" || status == "IN PROGRESS" || status == "DONE") {
    if (priority == "HIGH" || priority == "MEDIUM" || priority == "LOW") {
      if (category == "WORK" || category == "HOME" || category == "LEARNING") {
        const validDate = isValid(new Date(dueDate));

        if (validDate === true) {
          const formatDate = format(new Date(dueDate), "yyyy-MM-dd");

          const todoAddQuery = `
                INSERT INTO
                todo (id, todo, priority, status, category, due_date)
                VALUES 
                (
                    ${id}, '${todo}', '${priority}', '${status}', '${category}', '${formatDate}'
                );`;
          await db.run(todoAddQuery);
          response.send(`Todo Successfully Added`);
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status, category, dueDate } = request.body;

  if (status !== undefined) {
    if (status == "TO DO" || status == "IN PROGRESS" || status == "DONE") {
      const todoUpdateQuery = `
                UPDATE todo SET
                status = '${status}'
                WHERE id= ${todoId};`;
      await db.run(todoUpdateQuery);
      response.send(`Status Updated`);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (priority == "HIGH" || priority == "MEDIUM" || priority == "LOW") {
      const todoUpdateQuery = `
                UPDATE todo SET
                priority = '${priority}'
                WHERE id= ${todoId};`;
      await db.run(todoUpdateQuery);
      response.send(`Priority Updated`);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (todo !== undefined) {
    const todoUpdateQuery = `
      UPDATE todo SET
      todo = '${todo}'
      WHERE id= ${todoId};`;
    await db.run(todoUpdateQuery);
    response.send(`Todo Updated`);
  } else if (category !== undefined) {
    if (category == "WORK" || category == "HOME" || category == "LEARNING") {
      const todoUpdateQuery = `
                UPDATE todo SET
                category = '${category}'
                WHERE id= ${todoId};`;
      await db.run(todoUpdateQuery);
      response.send(`Category Updated`);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (dueDate !== undefined) {
    const validDate = isValid(new Date(dueDate));
    if (validDate === true) {
      const formatDate = format(new Date(dueDate), "yyyy-MM-dd");
      const todoUpdateQuery = `
            UPDATE todo SET
            due_date = '${formatDate}'
            WHERE id= ${todoId};`;
      await db.run(todoUpdateQuery);
      response.send(`Due Date Updated`);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send(`Todo Deleted`);
});

module.exports = app;
