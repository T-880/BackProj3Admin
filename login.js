// Hanterar inloggningsformulärets submit-event
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Hämtar användarnamn och lösenord från formuläret
  const username = e.target[0].value;
  const password = e.target[1].value;

  try {
    // Skickar inloggningsförfrågan till API:t
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    // Om inloggning lyckas sparas token och användaren skickas vidare
    if (data.token) {
      saveToken(data.token);
      window.location.href = "dashboard.html";
    } else {
      // Fel vid inloggning (fel användarnamn/lösenord)
      alert("Fel användarnamn eller lösenord");
    }

  } catch (err) {
    // Fel vid serverkommunikation
    console.error("Login error:", err);
    alert("Serverfel vid inloggning");
  }
});