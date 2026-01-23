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
    contactForm.addEventListener("submit", async function(e) {
        e.preventDefault(); // prevent normal form submission

        const title = document.getElementById("title").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        alertPlaceholder.innerHTML = ""; // clear previous alerts

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
            alertPlaceholder.innerHTML = `<div class="alert alert-danger">Something went wrong. Try again later.</div>`;
            console.error(err);
        }
    });
}

/* const contactForm = document.getElementById("contactForm");
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
} */

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

// ==========================
// Run Monte Carlo Risk Sim
// ==========================
async function runSimulation() {
    const fileInput = document.getElementById("csvFile");
    const errorDiv = document.getElementById("error");
    const resultsDiv = document.getElementById("results");
    const plotImg = document.getElementById("plot");

    errorDiv.textContent = "";
    plotImg.src = "";

    if (!fileInput.files.length) {
        errorDiv.textContent = "Please upload a CSV file.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    // Insert progress bar dynamically (same pattern as your working form)
    resultsDiv.innerHTML = `
        <h3>RESULT</h3>
        <div class="progress" role="progressbar" aria-label="Loading"
             aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            <div id="myProgress"
                 class="progress-bar progress-bar-striped progress-bar-animated bg-success"
                 style="width: 0%">
            </div>
        </div>
    `;

    // Start animation AFTER element exists
    loadBar();

    try {
        const response = await fetch("https://fawa.onrender.com/api/montecarlo", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Replace progress bar with result image
        resultsDiv.innerHTML = `
            <h3>RESULT</h3>
            <img id="plot" class="img-fluid mt-3"
                 src="data:image/png;base64,${data.plot}">
        `;

    } catch (err) {
        errorDiv.textContent = err.message;
        resultsDiv.innerHTML = "";
    }
}
let preview;

document.querySelectorAll(".card img").forEach(img => {
  img.addEventListener("mouseenter", e => {
    preview = document.createElement("div");
    preview.className = "image-preview";
    preview.innerHTML = `<img src="${img.src}" alt="">`;
    document.body.appendChild(preview);

    preview.style.opacity = "1";
    preview.style.transform = "scale(1)";
  });

  img.addEventListener("mousemove", e => {
    if (!preview) return;
    preview.style.top = e.clientY + 20 + "px";
    preview.style.left = e.clientX + 20 + "px";
  });

  img.addEventListener("mouseleave", () => {
    if (preview) {
      preview.remove();
      preview = null;
    }
  });
});
// ==========================
// MAP OF EXPERIENCES
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    const map = L.map("world-map", {
        scrollWheelZoom: false,
        worldCopyJump: true,
        attributionControl: false
    }).setView([20, 0], 2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO"
    }).addTo(map);

    // Cities you’ve been to
    const cities = [
        { project: "QatarGas LNG Expansion Project", name: "Ras Laffan, Qatar", lat: 25.9191, lng: 51.6081 },
        { project: "AES Maritza East Thermal Power Plant", name: "Galabovo, Bulgaria", lat: 42.1366, lng: 25.8536 },
        { project: "Ahselkent Residence Project", name: "Almaty, Kazakhstan", lat: 43.2220, lng: 76.8512 },
        { project: "Temiz Sehir Waste-to-Energy Project", name: "Baku, Azerbaijan", lat: 40.4093, lng: 49.8671 },
        { project: "Sibur Polymer", name: "Tobolsk, Russia", lat: 58.1998, lng: 68.2533 },
        { project: "Rusvinyl PVC Project", name: "Nizhny Novgorod, Russia", lat: 56.2965, lng: 43.9361 },
        { project: "Lukoil VGO Project", name: "Volgograd, Russia", lat: 48.7080, lng: 44.5133 },
        { project: "NLMK SGOK Pelletizing Plant", name: "Stary Oskol, Russia", lat: 51.2966, lng: 37.8416 },
        { project: "SOCAR Star Aegean Refinery", name: "Izmir, Turkey", lat: 38.4237, lng: 27.1428 },
        { project: "Gazprom Amur Gas Processing Plant", name: "Svobodny, Russia", lat: 51.3759, lng: 128.1353 },
        { project: "Novatek Arctic LNG GBS Project Management", name: "Moscow, Russia", lat: 55.7558, lng: 37.6173 },
        { project: "Novatek Arctic LNG GBS Project", name: "Murmansk, Russia", lat: 68.9585, lng: 33.0827 },
        { project: "Yeniköy Kemerköy Thermal Power Plant Rehabilitation", name: "Muğla, Turkey", lat: 37.2153, lng: 28.3636 }
    ];

    cities.forEach(city => {
        L.circleMarker([city.lat, city.lng], {
            radius: 6,
            fillColor: "#d4af37",
            color: "#000",
            weight: 1,
            fillOpacity: 0.9
        })
        .addTo(map)
        .bindTooltip(
            `<strong>${city.project}</strong><br>${city.name}`,
            {
                permanent: false,
                direction: "top",
                offset: [0, -6],
                opacity: 0.95
            }
        );
    });

    const bounds = cities.map(c => [c.lat, c.lng]);
    map.fitBounds(bounds, { padding: [40, 40] })

    // 🔍 Zoom on mouse over
    map.on("mouseover", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());

});

// ==========================
// ACCEPT TERMS AND PRIVACY
// ==========================
let targetUrl = null;
const modal = new bootstrap.Modal(document.getElementById("termsModal"));
const termsBox = document.getElementById("termsBox");
const modalContent = document.getElementById("modalContent");
const checkbox = document.getElementById("acceptTerms");
const acceptBtn = document.getElementById("acceptBtn");

// Load both Terms and Privacy into modal
async function loadTermsAndPrivacy() {
  try {
    const terms = await fetch("/terms.html").then(r => r.text());
    const privacy = await fetch("/privacy.html").then(r => r.text());

    modalContent.innerHTML = `
      <h3>Terms of Service</h3>
      ${terms}
      <hr>
      <h3>Privacy Policy</h3>
      ${privacy}
    `;
  } catch (err) {
    modalContent.innerHTML = "<p>Failed to load policies. Please try again later.</p>";
    console.error(err);
  }
}

// Show modal when clicking Learn More links if consent not given
document.querySelectorAll(".learn-more").forEach(link => {
  link.addEventListener("click", function(e) {
    if (!localStorage.getItem("termsAccepted")) {
      e.preventDefault();
      targetUrl = this.href;
      modal.show();
    }
  });
});

// Load policies when modal is shown
document.getElementById("termsModal").addEventListener("show.bs.modal", loadTermsAndPrivacy);

// Enable checkbox only when scrolled to bottom
termsBox.addEventListener("scroll", () => {
  const isBottom = termsBox.scrollTop + termsBox.clientHeight >= termsBox.scrollHeight - 5;
  if (isBottom) checkbox.disabled = false;
});

// Enable Accept button when checkbox checked
checkbox.addEventListener("change", () => {
  acceptBtn.disabled = !checkbox.checked;
});

// Send consent to backend and continue
acceptBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/accept-terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    localStorage.setItem("termsAccepted", "true");
    localStorage.setItem("policyVersion", "1.0");

    modal.hide();
    window.location.href = targetUrl;
  } catch (err) {
    alert("Failed to save consent. Please try again.");
    console.error(err);
  }
});

