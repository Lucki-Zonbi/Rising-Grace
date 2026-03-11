/* =====================================
   AUTH GUARD – PROTECT PAGES
===================================== */

function checkAuth() {

    const token = localStorage.getItem("token");

    if (!token) {

        alert("You must log in to access this page.");

        window.location.href = "auth/login.html";

    }

}
