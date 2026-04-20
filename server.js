import "dotenv/config";
import express from "express";
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import indexRouter from "./src/routes/index.routes.js";
import { getUserSession } from "./src/middlewares/checkAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, "src", "views");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(getUserSession); 

app.set("views", viewsPath);
app.set("view engine", "njk");
app.engine("njk", nunjucks.render);

const env = nunjucks.configure(viewsPath, {
  express: app,
  autoescape: true,
  noCache: true,
});

app.use(indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
