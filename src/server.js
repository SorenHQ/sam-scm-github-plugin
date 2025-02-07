import dotenv from "dotenv";
import * as path from "path";

import app from "./app.js";

// Initialize dotenv at the root level
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
