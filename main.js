// ==========================
// ANALYZE FORM SUBMISSION
// ==========================
const analyzeForm = document.getElementById("analyze-form");
const resultDiv = document.getElementById("result");

if (analyzeForm && resultDiv) {
    analyzeForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const symbolInput = document.getElementById("symbol");
        const symbol = symbolInput?.value.trim().toUpperCase();

        if (!symbol) {
            resultDiv.innerHTML = `<div class="alert alert-warning text-center">Please enter a stock symbol.</div>`;
            return;
        }

        // Show progress bar
        resultDiv.innerHTML = `
            <div class="progress" role="progressbar" aria-label="Loading" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                <div id="myProgress" class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width: 0%"></div>
            </div>
        `;
        loadBar();

        try {
            const response = await fetch("https://fawa.onrender.com/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symbol })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Server error");
            }

            renderTable(data.output, data.title, symbol);

        } catch (error) {
            console.error(error);
            resultDiv.innerHTML = `<div class="alert alert-danger text-center">An error occurred: ${error.message}</div>`;
        }
    });
}

// ==========================
// CONTACT FORM SUBMISSION
// ==========================
const contactForm = document.getElementById("contactForm");
const alertPlaceholder = document.getElementById("alert-placeholder");

if (contactForm && alertPlaceholder) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const message = document.getElementById("message")?.value.trim();

        try {
            const response = await fetch("https://fawa.onrender.com/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, email, message })
            });

            const data = await response.json();

            if (response.ok) {
                alertPlaceholder.innerHTML = `<div class="alert alert-success">${data.success}</div>`;
                contactForm.reset();
            } else {
                alertPlaceholder.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            }

        } catch (err) {
            alertPlaceholder.innerHTML = `<div class="alert alert-danger">Failed to send message. Try again later.</div>`;
        }
    });
}

// ==========================
// SLIDE TEXT ANIMATION
// ==========================
const slideTexts = document.querySelectorAll(".slide-text");

if (slideTexts.length > 0) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    slideTexts.forEach(p => observer.observe(p));
}

// ==========================
// UTILITY FUNCTIONS
// ==========================
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

function loadBar() {
    let progress = 0;
    const progressBar = document.getElementById("myProgress");
    if (!progressBar) return;

    const interval = setInterval(() => {
        if (progress >= 100) {
            clearInterval(interval);
        } else {
            progress += 1;
            progressBar.style.width = progress + "%";
            progressBar.setAttribute("aria-valuenow", progress);
        }
    }, 100);
}

function closeDisclaimer() {
    const disclaimer = document.getElementById("disclaimer");
    if (disclaimer) disclaimer.style.display = "none";
}
