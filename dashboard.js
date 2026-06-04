// Kontrollerar om användaren är inloggad, annars skickas till login-sidan
if (!getToken()) {
    window.location.href = "login.html";
}

let userRole = null;

// Körs när sidan laddats klart
window.addEventListener("DOMContentLoaded", () => {

    // Hämtar JWT-token och extraherar användarroll
    const token = getToken();
    const payload = JSON.parse(atob(token.split(".")[1]));
    userRole = payload.role;

    // Döljer admin-del om användaren inte är chef
    const userSection = document.getElementById("userSection");
    if (userRole !== "chef") {
        userSection.style.display = "none";
    }

    // Laddar meny vid start
    loadMenu();

    // Laddar användare om användaren är chef
    if (userRole === "chef") {
        loadUsers();
    }

    const form = document.getElementById("createForm");

    // Skapa nytt menyobjekt
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!["chef", "admin"].includes(userRole)) {
            alert("Du har inte behörighet att skapa menyobjekt");
            return;
        }

        const token = getToken();

        // Skapar nytt menyobjekt från formulärdata
        const newItem = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            price: document.getElementById("price").value,
            imageUrl: document.getElementById("imageUrl").value,
            category: document.getElementById("category").value
        };

        // Bekräftelse innan objekt skapas
        const confirmMessage = `
Är du säker på att du vill lägga till denna artikel på menyn?

Namn: ${newItem.title}
Beskrivning: ${newItem.description}
Pris: ${newItem.price} kr

OK = Lägg till
Avbryt = Avbryt
        `;

        const confirmed = confirm(confirmMessage);
        if (!confirmed) return;

        try {
            const res = await fetch("http://localhost:5000/api/menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(newItem)
            });

            if (!res.ok) throw new Error("Kunde inte skapa objekt");

            form.reset();
            loadMenu();

        } catch (err) {
            console.error("CREATE error:", err);
        }
    });

    const userForm = document.getElementById("createUserForm");

    // Skapa ny användare (endast chef)
    if (userForm) {
        userForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (userRole !== "chef") {
                alert("Endast chef kan skapa användare");
                return;
            }

            const token = getToken();

            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Validerar att lösenord matchar
            if (password !== confirmPassword) {
                alert("Lösenorden matchar inte");
                return;
            }

            // Skapar användarobjekt
            const newUser = {
                username: document.getElementById("username").value,
                fullName: document.getElementById("fullName").value,
                phone: document.getElementById("phone").value,
                password: password,
                role: document.getElementById("role").value
            };

            try {
                const res = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    },
                    body: JSON.stringify(newUser)
                });

                if (!res.ok) {
                    throw new Error("Kunde inte skapa användare");
                }

                alert("Användare skapad!");
                userForm.reset();

                loadUsers();

            } catch (err) {
                console.error("USER CREATE error:", err);
            }
        });
    }
});

// Hämtar och visar meny från API
async function loadMenu() {

    const token = getToken();

    try {
        const res = await fetch("http://localhost:5000/api/menu", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

        const pizzaContainer = document.getElementById("pizzaList");
        const drinkContainer = document.getElementById("drinkList");

        const pizzas = data.filter(item => item.category === "pizza");
        const drinks = data.filter(item => item.category === "drink");

        // Renderar menyobjekt till HTML
        function renderItems(items) {
            return items.map(item => `

        <div class="menu-item">
            <h3>${item.title}</h3>

            <p><strong>Kategori:</strong> ${item.category}</p>

            <p>${item.description}</p>

            <p>${item.price} kr</p>

            ${item.imageUrl
                    ? `<img src="http://localhost:5000/${item.imageUrl}" alt="${item.title}">`
                    : ""
                }

            <p>${item.monthly_special ? "⭐ MÅNADENS PIZZA" : ""}</p>

            <button onclick="editItem(
                '${item._id}',
                '${item.title}',
                '${item.description}',
                ${item.price}
            )">
                Redigera
            </button>

            <button onclick="toggleMonthlySpecial(
                '${item._id}',
                ${item.monthly_special}
            )">
                ${item.monthly_special
                    ? "Ta bort Månadens Pizza"
                    : "Sätt som Månadens Pizza"}
            </button>

            <button class="delete-btn" onclick="deleteItem('${item._id}')">
                Ta bort
            </button>

        </div>

    `).join("");
        }

        pizzaContainer.innerHTML = renderItems(pizzas);
        drinkContainer.innerHTML = renderItems(drinks);

    } catch (err) {
        console.error("Kunde inte hämta meny:", err);
    }
}

// Raderar menyobjekt
async function deleteItem(id) {
    
    const confirmed = confirm("Är du säker på att du vill ta bort denna artikel från menyn?");
    if (!confirmed) return;

    const token = getToken();

    await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    loadMenu();
}

// Redigerar menyobjekt
async function editItem(id, title, description, price) {

    if (!["chef", "admin"].includes(userRole)) {
        alert("Ingen behörighet");
        return;
    }

    const newTitle = prompt("Titel:", title);
    const newDescription = prompt("Beskrivning:", description);
    const newPrice = prompt("Pris:", price);

    const token = getToken();

    await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            title: newTitle,
            description: newDescription,
            price: Number(newPrice)
        })
    });

    loadMenu();
}

// Växlar "månadens special"
async function toggleMonthlySpecial(id, currentValue) {

    if (!["chef", "admin"].includes(userRole)) {
        alert("Ingen behörighet");
        return;
    }

    const token = getToken();

    await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            monthly_special: !currentValue
        })
    });

    loadMenu();
}

// Laddar användare från API
async function loadUsers() {

    const token = getToken();

    try {

        const res = await fetch("http://localhost:5000/api/auth/users", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const users = await res.json();

        const usersContainer = document.getElementById("usersList");

        usersContainer.innerHTML = `
            <h2>Aktiva användare</h2>

            ${users.map(user => `
                <div class="menu-item">

            <p><strong>${user.username}</strong></p>
            <p>Namn: ${user.fullName}</p>
            <p>Tel. nummer: ${user.phone}</p>
            <p>Roll: ${user.role}</p>

                    <button
                        class="delete-btn"
                        onclick="deleteUser('${user._id}')"
                    >
                        Ta bort användare
                    </button>

                </div>
            `).join("")}
        `;

    } catch (err) {

        console.error("USER LOAD error:", err);
    }
}

// Raderar användare
async function deleteUser(id) {

    if (userRole !== "chef") {
        return;
    }

    const confirmed = confirm(
        "Är du säker på att du vill ta bort användaren?"
    );

    if (!confirmed) return;

    const token = getToken();

    try {

        const res = await fetch(
            `http://localhost:5000/api/auth/users/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        if (!res.ok) {
            throw new Error("Kunde inte ta bort användare");
        }

        loadUsers();

    } catch (err) {

        console.error("DELETE USER error:", err);
    }
}