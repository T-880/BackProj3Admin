document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = e.target[0].value;
  const password = e.target[1].value;

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
      saveToken(data.token);
      window.location.href = "dashboard.html";
    } else {
      alert("Fel användarnamn eller lösenord");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Serverfel vid inloggning");
  }
  });