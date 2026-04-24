import "dotenv/config";
import express from "express";
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import indexRouter from "./src/routes/index.routes.js";
import { getUserSession } from "./src/middlewares/checkAuth.js";
import { dateFilter } from "./src/config/filters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, "src", "views");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
// Para parsing no forms POST! (Essencial para o criar post)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

env.addFilter("date", dateFilter);

// Adiciona um filtro para converter "newlines" em <br> para textos de textarea
env.addFilter("nl2br", function (str) {
  if (!str) return "";
  return env.getFilter("safe")(str.replace(/\n/g, "<br>"));
});

app.use(indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
