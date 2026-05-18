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

                <button onclick="editItem(
                    '${item._id}',
                    '${item.title}',
                    '${item.description}',
                    ${item.price}
                )">
                    Redigera
                </button>

                <button onclick="deleteItem('${item._id}')">Ta bort
                </button>
            </div>
        `).join("");

    } catch (err) {
        console.error("Kunde inte hämta meny:", err);
    }
}
// Delete
async function deleteItem(id) {
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