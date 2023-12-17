const http = require("http");
const mysql = require("mysql");
const url = require("url");
const qs = require("querystring");
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;

const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
});

dbConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname;

  if (req.method === "POST") {
    if (path === "/signin") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const userData = qs.parse(body);
        const { username, password } = userData;
        // Check credentials in the database
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        dbConnection.query(query, (err, result) => {
          if (err) {
            console.error("Error executing query:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
          } else {
            if (result.length > 0) {
              res.writeHead(200, { "Content-Type": "text/html" });
              res.end("<h1>Welcome, " + username + "!</h1>");
            } else {
              res.writeHead(401, { "Content-Type": "text/plain" });
              res.end("Invalid credentials");
            }
          }
        });
      });
    } else if (path === "/signup") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const userData = qs.parse(body);
        const { username, password } = userData;
        // Insert new user credentials into the database
        const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
        dbConnection.query(query, (err) => {
          if (err) {
            console.error("Error executing query:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error signing up");
          } else {
            res.writeHead(302, { Location: "/index.html" });
            res.end();
          }
        });
      });
    }
  } else {
    // Serve the HTML file
    fs.readFile("./index.html", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error loading file");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
