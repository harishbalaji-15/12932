require("dotenv").config();

const axios = require("axios");

const VALID_STACKS = [
    "backend",
    "frontend"
];

const VALID_LEVELS = [
    "debug",
    "info",
    "warn",
    "error",
    "fatal"
];

const VALID_PACKAGES = {
    backend: [
        "cache",
        "controller",
        "cron_job",
        "db",
        "domain",
        "handler",
        "repository",
        "route",
        "service"
    ],
    frontend: [
        "api",
        "component",
        "hook",
        "page",
        "state",
        "style"
    ]
};

async function Log(stack, level, pkg, message) {

    if (!VALID_STACKS.includes(stack)) {
        throw new Error("Invalid Stack");
    }

    if (!VALID_LEVELS.includes(level)) {
        throw new Error("Invalid Level");
    }

    if (!VALID_PACKAGES[stack].includes(pkg)) {
        throw new Error("Invalid Package");
    }

    try {

        const response = await axios.post(
            process.env.LOG_URL,
            {
                stack,
                level,
                package: pkg,
                message
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${process.env.ACCESS_TOKEN}`
                }
            }
        );

        return response.data;

    } catch (error) {

        console.log("Logging Failed");

        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        return null;
    }
}

module.exports = Log;