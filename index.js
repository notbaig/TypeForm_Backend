const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
server.listen(5000, () => console.log(`Server running on port ${PORT}...`));