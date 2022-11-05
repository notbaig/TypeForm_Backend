const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(3000, () => console.log(`Server running on port ${PORT}...`));