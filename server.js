import express from "express";
import nunjucks from "nunjucks";
const app = express();

nunjucks.configure("views", {
    express: app,
    autoescape: true,
    noCache: true,
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});