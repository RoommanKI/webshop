function showProfileIcon() {
    const headerButtons = document.querySelector('.header-buttons');
    if (headerButtons) {
        headerButtons.innerHTML = `
            <div class="profile-container" style="position: relative;">
                <i class="fas fa-user-circle profile-icon" id="profileIcon"></i>
                <div id="profileMenu" class="profile-menu" style="display: none; position: absolute; top: 40px; right: 0; background: white; border: 1px solid #ccc; border-radius: 4px; padding: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <a href="profile.html" style="display: block; padding: 5px;">Profil</a>
                    <a href="#" style="display: block; padding: 5px;">Bestellungen</a>
                    <a href="#" id="logoutLink" style="display: block; padding: 5px;">Logout</a>
                </div>
            </div>
        `;
        
        // Attach event listener to the profile icon to toggle the menu
        const profileIcon = document.getElementById('profileIcon');
        const profileMenu = document.getElementById('profileMenu');
        profileIcon.addEventListener('click', function () {
            profileMenu.style.display = (profileMenu.style.display === 'none') ? 'block' : 'none';
        });

        // Add logout functionality
        document.getElementById('logoutLink').addEventListener('click', function () {
            localStorage.removeItem('loggedIn');
            location.reload(); // Reload to show the login/register buttons
        });
    }
}

// Kategorien anzeigen/verstecken
function showCategory(category) {
    // Alle Kategorien verstecken
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => cat.style.display = 'none');

    // Die ausgewählte Kategorie anzeigen
    document.getElementById(category).style.display = 'flex';
}

// Warenkorb Icon Klickbar machen
document.getElementById('cart-icon').addEventListener('click', function() {
    toggleCart(); // Show or hide the cart popup
});

// Warenkorb-Logik
let cart = [];

// Warenkorb-Popup ein-/ausblenden
function toggleCart() {
    const cartPopup = document.getElementById('cart-popup');
    cartPopup.style.display = (cartPopup.style.display === 'none' || cartPopup.style.display === '') ? 'block' : 'none';
}

// Produkt zum Warenkorb hinzufügen
function addToCart(productName, quantityId, price) {
    const quantity = parseInt(document.getElementById(quantityId).value);
    if (quantity > 0) {
        const item = cart.find(item => item.product === productName);
        if (item) {
            item.quantity += quantity;
        } else {
            cart.push({ product: productName, quantity, price });
        }
        updateCart();  // Warenkorb aktualisieren
        alert(`${quantity}x ${productName} wurde dem Warenkorb hinzugefügt!`);
    } else {
        alert("Bitte eine gültige Anzahl eingeben.");
    }
}

// Warenkorb-Inhalt und Zähler aktualisieren
function updateCart() {
    const cartContent = document.getElementById('cart-content');
    const cartCount = document.getElementById('cart-count');
    cartCount.innerHTML = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        cartContent.innerHTML = '<p>Ihr Warenkorb ist leer.</p>';
        return;
    }

    let cartHTML = '<ul>';
    cart.forEach(item => {
        cartHTML += `<li>${item.quantity}x ${item.product} - ${item.price.toFixed(2)}€</li>`;
    });
    cartHTML += '</ul>';
    cartContent.innerHTML = cartHTML;
}

// Bestellung abschließen
function finalizeOrder() {
    if (cart.length === 0) {
        alert('Ihr Warenkorb ist leer.');
        return;
    }

    // Bestellübersicht aufrufen
    let orderSummary = 'Bestellung:\n';
    cart.forEach(item => {
        orderSummary += `${item.quantity}x ${item.product} - ${item.price.toFixed(2)}€\n`;
    });
    alert(`Ihre Bestellung:\n${orderSummary}`);

    // Warenkorb zurücksetzen
    cart = [];
    updateCart();
    toggleCart();  // Warenkorb-Popup schließen
    // Weiterleitung zur Bestellübersichtsseite
    window.location.href = 'order-summary.html';
}

// Supabase SDK and Scripts
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Initialization
const supabaseUrl = 'https://vaugbzzhenbkmcuuoeai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdWdienpoZW5ia21jdXVvZWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5MTgwODcsImV4cCI6MjA0NDQ5NDA4N30.BAKeLpt5GTm4eu9yQYCoNHL3pDVjk3q5aibIP5bkVIE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Registration Logic
document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorMessage = document.getElementById('register-error');

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            errorMessage.textContent = `Registrierung fehlgeschlagen: ${error.message}`;
        } else {
            alert('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails.');
        }
    } catch (err) {
        errorMessage.textContent = `Fehler: ${err.message}`;
    }
});

// Login Logic
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent page reload

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginErrorMessage = document.getElementById('login-error');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            loginErrorMessage.textContent = `Anmeldung fehlgeschlagen: ${error.message}`;
        } else {
            localStorage.setItem('userEmail', email);  // Store email in localStorage
            alert('Anmeldung erfolgreich!');
            localStorage.setItem('loggedIn', 'true');  // Store login state
            showProfileIcon();  // Display the profile icon

            // Close the login modal
            document.getElementById('loginModal').style.display = 'none';
            // Automatically reload the page after login
            location.reload();
        }
    } catch (err) {
        loginErrorMessage.textContent = `Fehler: ${err.message}`;
    }
});

// Kategorie-basierte Produkte anzeigen
async function showCategory(category) {
    const products = await fetchProductsByCategory(category); // Produkte nach Kategorie abrufen
    displayProducts(products); // Produkte anzeigen
}

// Event-Listener für Kategorie-Links hinzufügen
document.addEventListener('DOMContentLoaded', () => {
    const categoryLinks = document.querySelectorAll('nav a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Verhindert das Standardverhalten (Seiten-Reload)
            const category = link.getAttribute('data-category'); // Kategorie aus dem Daten-Attribut
            showCategory(category); // Kategorie anzeigen
        });
    });

    // Nachricht anzeigen, wenn keine Kategorie ausgewählt ist
    const container = document.getElementById('products-container');
    container.innerHTML = '<p>Bitte wählen Sie eine Kategorie aus der Navigation.</p>';
});

// Function to fetch products by category
async function fetchProductsByCategory(category) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category); // Fetch products by category

    if (error) {
        console.error('Error fetching products:', error);
        return []; // Return an empty array in case of an error
    }

    return data; // Return the fetched data
}

// Produkte in HTML anzeigen
function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // Alte Inhalte löschen

    if (products.length === 0) {
        container.innerHTML = '<p>Keine Produkte gefunden.</p>';
        return;
    }

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.innerHTML = `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px;">
                <h2>${product.name}</h2>
                <img src="${product.image_url}" alt="${product.name}" style="max-width: 100%; max-height: 300px;">
                <p><strong>Preis:</strong> $${product.price}</p>
                <p><strong>Beschreibung:</strong> ${product.description}</p>
            </div>
        `; // Closing the template literal properly
        container.appendChild(productElement); // Append product to container
    });
} // Closing the displayProducts function properly

// Modal Script Logic
const registerModal = document.getElementById("registerModal");
const loginModal = document.getElementById("loginModal");

// Get buttons and close elements
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const closeRegister = document.getElementById("closeRegister");
const closeLogin = document.getElementById("closeLogin");

// Show registration modal
registerBtn.onclick = function() {
    registerModal.style.display = "flex";
};

// Show login modal
loginBtn.onclick = function() {
    loginModal.style.display = "flex";
};

// Close registration modal
closeRegister.onclick = function() {
    registerModal.style.display = "none";
};

// Close login modal
closeLogin.onclick = function() {
    loginModal.style.display = "none";
};

// Close modal if user clicks outside the modal content
window.onclick = function(event) {
    if (event.target == registerModal) {
        registerModal.style.display = "none";
    }
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const profileIcon = document.getElementById('profileIcon');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutOption = document.getElementById('profile-logout');

    // Toggle dropdown visibility
    profileIcon.addEventListener('click', function () {
        profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Logout option click
    logoutOption.addEventListener('click', function () {
        localStorage.removeItem('loggedIn');
        location.reload();  // Reload the page to reflect logged-out state
    });

    // Close the dropdown if clicking outside
    window.addEventListener('click', function (event) {
        if (!profileIcon.contains(event.target) && !profileDropdown.contains(event.target)) {
            profileDropdown.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const loggedIn = localStorage.getItem('loggedIn');
    const headerButtons = document.querySelector('.header-buttons');
    const prices = document.querySelectorAll('.price');
    const quantities = document.querySelectorAll('.quantity');
    const cartButtons = document.querySelectorAll('.btn');

    if (loggedIn === 'true') {
        showProfileIcon(); // Call showProfileIcon to ensure the profile icon appears after login

        // Show prices, quantities, and buttons if logged in
        prices.forEach(function(price) {
            price.classList.remove('hidden');
        });
        quantities.forEach(function(quantity) {
            quantity.classList.remove('hidden');
        });
        cartButtons.forEach(function(button) {
            button.classList.remove('hidden');
        });
    } else {
        headerButtons.style.display = 'flex';

        // Hide prices, quantities, and buttons if not logged in
        prices.forEach(function(price) {
            price.classList.add('hidden');
        });
        quantities.forEach(function(quantity) {
            quantity.classList.add('hidden');
        });
        cartButtons.forEach(function(button) {
            button.classList.add('hidden');
        });
    }
});