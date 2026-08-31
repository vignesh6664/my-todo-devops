import express from "express";
import todos from "./todos";

const SERVER_PORT = 8080;

async function main() {
  const app = express();
  
  // SIMULATED BAD DEPLOYMENT: Code compiles fine, but crashes at runtime!
  if (process.env.NODE_ENV !== "test") {
      console.error("FATAL: Unhandled Database Timeout Exception");
      process.exit(1);
  }

  app.use(express.json());

  app.use("/todos", todos);

  app.listen(SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${SERVER_PORT}`);
  });
}

main();
