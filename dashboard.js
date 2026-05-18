if (!getToken()) {
  window.location.href = "login.html";
}

async function loadMenu() {
  const token = getToken();

  try {
    const res = await fetch("http://localhost:5000/api/menu", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    const container = document.getElementById("menuList");

    container.innerHTML = data.map(item => `
      <div class="menu-item">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <p>${item.price} kr</p>
        <button onclick="deleteItem('${item._id}')">Ta bort</button>
      </div>
    `).join("");

  } catch (err) {
    console.error("Kunde inte hämta meny:", err);
  }
}

loadMenu();