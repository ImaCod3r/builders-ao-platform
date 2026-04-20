import express from "express";
import nunjucks from "nunjucks";
const app = express();

nunjucks.configure("views", {
    express: app,
    autoescape: true,
    noCache: true,
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})