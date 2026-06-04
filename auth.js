// Sparar JWT-token i localStorage efter inloggning
function saveToken(token) {
  localStorage.setItem("token", token);
}

// Hämtar lagrad JWT-token från localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Loggar ut användaren genom att ta bort token och skicka tillbaka till login-sidan
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}