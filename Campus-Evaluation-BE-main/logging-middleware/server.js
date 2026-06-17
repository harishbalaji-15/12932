const express = require("express");

const Log = require("./logger");

const app = express();

app.use(express.json());

app.post("/log", async (req, res) => {

    try {

        const {
            stack,
            level,
            package: pkg,
            message
        } = req.body;

        const response = await Log(
            stack,
            level,
            pkg,
            message
        );

        res.status(200).json(response);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});

app.listen(3000);