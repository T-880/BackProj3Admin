if (!getToken()) {
    window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", () => {
    loadMenu();

    const form = document.getElementById("createForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = getToken();

        const newItem = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            price: document.getElementById("price").value,
            category: "pizza"
        };

        const confirmMessage = `
Är du säker på att du vill lägga till denna pizza på menyn, och att du stavat rätt på alla fält, samt satt korrekt pris?

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

            if (!res.ok) {
                throw new Error("Kunde inte skapa objekt");
            }

            form.reset();
            loadMenu();

        } catch (err) {
            console.error("CREATE error:", err);
        }
    });
});

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

                <p>
                ${item.monthly_special ? "⭐MÅNADENS PIZZA" : ""}
                </p>

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
  ${item.monthly_special ? "Ta bort Månadens Pizza" : "Sätt som Månadens Pizza"}
</button>

                <button class="delete-btn" onclick="deleteItem('${item._id}')">
                Ta bort
                </button>
            </div>
        `).join("");

    } catch (err) {
        console.error("Kunde inte hämta meny:", err);
    }
}
// Delete
async function deleteItem(id) {

    const confirmed = confirm("Är du säker på att du vill ta bort denna pizza från menyn?");

    if (!confirmed) return;

    const token = getToken();

    try {
        const res = await fetch(`http://localhost:5000/api/menu/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        if (!res.ok) {
            throw new Error("Kunde inte ta bort item");
        }

        loadMenu();

    } catch (err) {
        console.error("DELETE error:", err);
    }
}

// Edit
async function editItem(id, title, description, price) {

    const newTitle = prompt("Titel:", title);

    const newDescription = prompt("Beskrivning:", description);

    const newPrice = prompt("Pris:", price);

    if (!newTitle || !newDescription || !newPrice) {
        return;
    }

    const token = getToken();

    try {

        const res = await fetch(`http://localhost:5000/api/menu/${id}`, {
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

        if (!res.ok) {
            throw new Error("Kunde inte uppdatera");
        }

        loadMenu();

    } catch (err) {

        console.error("UPDATE error:", err);
    }
}

async function toggleMonthlySpecial(id, currentValue) {

    const token = getToken();

    try {

        if (currentValue) {

            await fetch(`http://localhost:5000/api/menu/${id}`, {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },

                body: JSON.stringify({
                    monthly_special: false
                })
            });

            loadMenu();
            return;
        }

        const menuRes = await fetch("http://localhost:5000/api/menu");

        const menuItems = await menuRes.json();

        for (const item of menuItems) {

            await fetch(`http://localhost:5000/api/menu/${item._id}`, {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },

                body: JSON.stringify({
                    monthly_special: false
                })
            });
        }

        await fetch(`http://localhost:5000/api/menu/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },

            body: JSON.stringify({
                monthly_special: true
            })
        });

        loadMenu();

    } catch (err) {

        console.error("SPECIAL error:", err);
    }
}