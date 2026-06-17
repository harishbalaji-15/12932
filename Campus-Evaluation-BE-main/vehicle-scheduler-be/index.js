require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

async function fetchDepots() {

    const response = await axios.get(
        process.env.DEPOTS_URL,
        {
            headers: {
                Authorization:
                    `Bearer ${process.env.ACCESS_TOKEN}`
            }
        }
    );

    return response.data.depots;
}

async function fetchVehicles() {

    const response = await axios.get(
        process.env.VEHICLES_URL,
        {
            headers: {
                Authorization:
                    `Bearer ${process.env.ACCESS_TOKEN}`
            }
        }
    );

    return response.data.vehicles;
}

function solveKnapsack(vehicles, capacity) {

    const n = vehicles.length;

    const dp = Array.from(
        { length: n + 1 },
        () => Array(capacity + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {

        const duration =
            vehicles[i - 1].Duration;

        const impact =
            vehicles[i - 1].Impact;

        for (let w = 0; w <= capacity; w++) {

            if (duration <= w) {

                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    impact +
                    dp[i - 1][w - duration]
                );

            } else {

                dp[i][w] =
                    dp[i - 1][w];
            }
        }
    }

    let selectedTasks = [];

    let w = capacity;

    for (let i = n; i > 0; i--) {

        if (
            dp[i][w] !==
            dp[i - 1][w]
        ) {

            selectedTasks.push(
                vehicles[i - 1]
            );

            w -=
                vehicles[i - 1]
                    .Duration;
        }
    }

    return {
        maxImpact:
            dp[n][capacity],
        selectedTasks
    };
}

app.get(
    "/schedule",
    async (req, res) => {

        try {

            const depots =
                await fetchDepots();

            const vehicles =
                await fetchVehicles();

            const results = [];

            for (const depot of depots) {

                const capacity =
                    depot.MechanicHours;

                const solution =
                    solveKnapsack(
                        vehicles,
                        capacity
                    );

                results.push({
                    depotId:
                        depot.ID,
                    mechanicHours:
                        capacity,
                    totalImpact:
                        solution.maxImpact,
                    selectedTasks:
                        solution.selectedTasks
                    .map(
                        task =>
                        task.TaskID
                    )
                });
            }

            return res.status(200)
                .json({
                    success: true,
                    results
                });

        } catch (error) {

            return res.status(500)
                .json({
                    success: false,
                    message:
                        error.message
                });
        }
    }
);

app.listen(3000, () => {

    console.log(
        "Server Running On Port 3000"
    );
});