
    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("analyze-form");
        const resultDiv = document.getElementById("result");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const symbol = document.getElementById("symbol").value.trim().toUpperCase();
            if (!symbol) {
                resultDiv.innerHTML = `<div class="alert alert-warning text-center">Please enter a stock symbol.</div>`;
                return;
            }

            resultDiv.innerHTML = `<p class="text-muted text-center">Loading...</p>`;

            try {
                const response = await fetch("https://fawa.onrender.com/api/process", { // http://127.0.0.1:5000/api/process
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ symbol })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Server error");
                }

                // Render the table
                renderTable(data.output, data.title, symbol);

            } catch (error) {
                console.error(error);
                resultDiv.innerHTML = `<div class="alert alert-danger text-center">An error occurred: ${error.message}</div>`;
            }
        });
    });

    // Function to render results in a Bootstrap table
    function renderTable(summary, title, symbol) {
        const resultDiv = document.getElementById("result");

        if (!summary || Object.keys(summary).length === 0) {
            resultDiv.innerHTML = `<div class="alert alert-warning text-center">No data available for ${symbol}.</div>`;
            return;
        }

        let html = `
            <h4 class="mt-3 mb-3 text-center">${title} (${symbol})</h4>
            <table class="table table-dark table-hover">
                <thead>
                    <tr>
                        <th>RATIO</th>
                        <th>VALUE</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const [key, value] of Object.entries(summary)) {
            html += `
                <tr>
                    <td>${key.replace(/_/g, " ").toUpperCase()}</td>
                    <td>${value}</td>
                </tr>
            `;
        }

        html += `</tbody></table>`;
        resultDiv.innerHTML = html;
    }