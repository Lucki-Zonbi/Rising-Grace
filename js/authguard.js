/* =====================================
   AUTH GUARD – PROTECT PAGES
===================================== */

function checkAuth() {

    const token = localStorage.getItem("token");

    // Check for preview mode (URL or localStorage)
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get("preview") === "true";
    const previewMode = localStorage.getItem("previewMode") === "true";

    // 🚫 Block access ONLY if:
    // - No token
    // - Not in preview mode
    if (!token && !isPreview && !previewMode) {

        alert("You must log in to access this page.");

        window.location.href = "auth/login.html";

    }

    // 🔥 OPTIONAL: Show preview mode banner
    if (isPreview || previewMode) {

        const existingBanner = document.getElementById("previewBanner");

        if (!existingBanner) {
            const banner = document.createElement("div");
            banner.id = "previewBanner";
            banner.innerText = "ADMIN PREVIEW MODE";
            banner.style = `
                position: fixed;
                top: 0;
                width: 100%;
                background: red;
                color: white;
                text-align: center;
                padding: 6px;
                font-weight: bold;
                z-index: 9999;
            `;
            document.body.appendChild(banner);
        }

    }

}
