// wp
const WHATSAPP_NUMBER = "5492323521229"; 

// --- BASE DE DATOS DE SERVICIOS ---
const SERVICIOS = [
    { 
        id: "srv_limpieza", nombre: "Limpieza Física Profunda", categoria: "Mantenimiento", 
        desc: "Desarme completo, limpieza de polvo y gestión de cables.", 
        precio: 30000, icon: "hardware-chip-outline" 
    },
    { 
        id: "srv_formateo", nombre: "Formateo + Instalación de OS", categoria: "Software", 
        desc: "Instalación limpia de Windows, drivers actualizados y programas básicos (Office, navegadores).", 
        precio: 17000, icon: "logo-windows" 
    },
    { 
        id: "srv_optimiza", nombre: "Optimización Gaming/Edición", categoria: "Software", 
        desc: "Ajuste de Windows para sacar el máximo rendimiento, reducir latencia (input lag) y mejorar FPS.", 
        precio: 15000, icon: "game-controller-outline" 
    },
    { 
        id: "srv_armado", nombre: "Armado de PC (Ensamblaje)", categoria: "Hardware", 
        desc: "Armado profesional de tu computadora desde cero con las piezas que nos traigas.", 
        precio: 55000, icon: "construct-outline" 
    },
    { 
        id: "srv_asesoramiento", nombre: "Asesoramiento para PC a Medida", categoria: "Asesoramiento", 
        desc: "Te ayudamos a elegir los componentes ideales según tu presupuesto y lo que quieras jugar o trabajar, para que no gastes de más.", 
        precio: 13000, icon: "bulb-outline" 
    }
];

// Variables de Estado
let cart = JSON.parse(localStorage.getItem("techsai_cart") || "{}");
let selectedCategory = null;
let shippingMethod = "taller";

// Elementos del DOM
const gallery = document.getElementById("gallery");
const themeToggle = document.getElementById("themeToggle");
const cartModal = document.getElementById("cartModal");
const diagnosticModal = document.getElementById("diagnosticModal");

// Variables para el Diagnóstico
let diagResultServiceId = null;

function init() {
    renderCategories();
    renderGallery();
    updateCartUI();
    setupEventListeners();
    setupTheme();
}

function renderGallery() {
    gallery.innerHTML = "";
    const filtered = SERVICIOS.filter(s => selectedCategory === null || s.categoria === selectedCategory);

    filtered.forEach((s, index) => {
        // Inyectamos el logo justo antes del último servicio (índice 4)
        // Solo lo mostramos en la vista principal ("Todos los Servicios")
        if (selectedCategory === null && index === 4) {
            const logoCard = document.createElement("div");
            // Le pasamos la clase "card" para que tenga la animación hover, 
            // y "logo-card" para el fondo claro y el cursor no clickeable.
            logoCard.className = "card logo-card";
            logoCard.innerHTML = `<img src="Imges/FixerSai.png" alt="Tech Sai Logo">`;
            gallery.appendChild(logoCard);
        }

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="srv-icon"><ion-icon name="${s.icon}"></ion-icon></div>
            <div class="srv-title">${s.nombre}</div>
            <div class="srv-desc">${s.desc}</div>
            <div class="srv-price">$${s.precio.toLocaleString()}</div>
            <button class="add-btn" onclick="addToCart('${s.id}', event)">Agregar al Carrito</button>
        `;
        gallery.appendChild(card);
    });
}

function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    const cats = [...new Set(SERVICIOS.map(s => s.categoria))].sort();
    
    container.innerHTML = "";
    
    const createPill = (label, value) => {
        const btn = document.createElement("div");
        btn.className = `category-pill ${selectedCategory === value ? 'active' : ''}`;
        btn.textContent = label;
        btn.onclick = () => { selectedCategory = value; renderCategories(); renderGallery(); };
        container.appendChild(btn);
    };

    createPill("Todos los Servicios", null);
    cats.forEach(c => createPill(c, c));
}

function addToCart(serviceId, event = null) {
    const service = SERVICIOS.find(s => s.id === serviceId);
    if (cart[serviceId]) {
        cart[serviceId].qty++;
    } else {
        cart[serviceId] = { ...service, qty: 1 };
    }
    localStorage.setItem("techsai_cart", JSON.stringify(cart));
    updateCartUI();
    
    // Feedback visual rápido del botón carrito en la barra superior
    const btn = document.getElementById("cartBtn");
    btn.style.transform = "scale(1.1)";
    setTimeout(() => btn.style.transform = "scale(1)", 200);

    // NUEVO: Feedback flotante "+1" en la posición del mouse
    if (event) {
        const feedback = document.createElement("div");
        feedback.className = "floating-feedback";
        feedback.textContent = "+1";
        
        // Posicionar exactamente donde está el cursor
        feedback.style.left = `${event.clientX}px`;
        feedback.style.top = `${event.clientY}px`;
        
        document.body.appendChild(feedback);
        
        // Eliminar el elemento del HTML después de 800ms (lo que dura la animación)
        setTimeout(() => feedback.remove(), 800);
    }
}

window.changeQty = (key, delta) => {
    cart[key].qty += delta;
    if (cart[key].qty <= 0) delete cart[key];
    localStorage.setItem("techsai_cart", JSON.stringify(cart));
    updateCartUI();
};

window.removeFromCart = (key) => {
    delete cart[key];
    localStorage.setItem("techsai_cart", JSON.stringify(cart));
    updateCartUI();
};

function updateCartUI() {
    const items = Object.values(cart);
    const count = items.reduce((acc, item) => acc + item.qty, 0);
    document.getElementById("cartCount").textContent = count;
    
    const container = document.getElementById("cartItems");
    container.innerHTML = "";
    
    let subtotal = 0;
    let cantidadServicios = 0;

    items.forEach(item => {
        let totalItem = item.precio * item.qty;
        subtotal += totalItem;
        cantidadServicios += item.qty;

        const div = document.createElement("div");
        div.style.display = "flex"; div.style.justifyContent = "space-between"; div.style.alignItems = "center";
        div.style.padding = "10px 0"; div.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        
        div.innerHTML = `
            <div style="display:flex; flex-direction:column; flex:1;">
                <span style="font-weight:bold;">${item.nombre}</span>
                <span style="font-size:0.85rem; color:var(--muted); margin-bottom: 5px;">$${item.precio.toLocaleString()} c/u</span>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
                    <span style="font-weight:bold; width: 20px; text-align: center;">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-weight:bold; color:var(--neon);">$${totalItem.toLocaleString()}</span>
                <button onclick="removeFromCart('${item.id}')" style="background:transparent; color:tomato; border:none; cursor:pointer; font-weight:bold; font-size:1.2rem;">X</button>
            </div>
        `;
        container.appendChild(div);
    });

    const summary = document.getElementById("cartSummary");
    if (items.length === 0) {
        summary.innerHTML = "Total: $0";
    } else {
        // Descuento del 10% si lleva 2 o más servicios
        let descuento = 0;
        if (cantidadServicios >= 2) {
            descuento = subtotal * 0.10;
        }
        let totalFinal = subtotal - descuento;

        let textoTotal = `Subtotal: $${subtotal.toLocaleString()}`;
        if (descuento > 0) textoTotal += `<br><span style="color:var(--neon);">Descuento Combo (10%): -$${descuento.toLocaleString()}</span>`;
        textoTotal += `<br><strong style="color:var(--neon); font-size:1.4rem;">Total Estimado: $${totalFinal.toLocaleString()}</strong>`;
        summary.innerHTML = textoTotal;
    }
}

function setupEventListeners() {
    // Modal Carrito
    document.getElementById("cartBtn").onclick = () => cartModal.classList.remove("hidden");
    document.getElementById("closeCart").onclick = () => cartModal.classList.add("hidden");
    document.getElementById("clearCart").onclick = () => {
        cart = {}; localStorage.setItem("techsai_cart", "{}"); updateCartUI();
    };

    // Modal Diagnóstico
    document.getElementById("startDiagnosticBtn").onclick = () => {
        resetDiagnostic();
        diagnosticModal.classList.remove("hidden");
    };
    document.getElementById("closeDiagnostic").onclick = () => diagnosticModal.classList.add("hidden");
    
    // Lógica del Asistente
    document.querySelectorAll('#diagStep1 .diag-btn').forEach(btn => {
        btn.onclick = () => {
            document.getElementById("diagStep1").classList.add("hidden");
            document.getElementById("diagStep2").classList.remove("hidden");
        };
    });

    document.querySelectorAll('#diagStep2 .diag-btn').forEach(btn => {
        btn.onclick = (e) => {
            const issue = e.target.dataset.issue;
            document.getElementById("diagStep2").classList.add("hidden");
            
            // Lógica simple de recomendación
            if(issue === 'lenta') diagResultServiceId = 'srv_formateo';
            else if(issue === 'calienta') diagResultServiceId = 'srv_limpieza';
            else if(issue === 'armado') diagResultServiceId = 'srv_asesoramiento';
            else diagResultServiceId = 'srv_asesoramiento';

            const recomended = SERVICIOS.find(s => s.id === diagResultServiceId);
            document.getElementById("recommendedService").innerHTML = `
                <ion-icon name="${recomended.icon}" style="font-size:24px; vertical-align:middle;"></ion-icon> 
                ${recomended.nombre} - $${recomended.precio.toLocaleString()}
            `;
            
            document.getElementById("diagResult").classList.remove("hidden");
        };
    });

    // Pasa el evento "e" al botón del modal de diagnóstico también
    document.getElementById("addRecommendedBtn").onclick = (e) => {
        if(diagResultServiceId) addToCart(diagResultServiceId, e);
        diagnosticModal.classList.add("hidden");
        cartModal.classList.remove("hidden"); // Le abre el carrito
    };

    document.getElementById("resetDiagBtn").onclick = resetDiagnostic;

    // Checkout WhatsApp
    document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        radio.addEventListener('change', (e) => shippingMethod = e.target.value);
    });

    document.getElementById("checkoutBtn").onclick = () => {
        const items = Object.values(cart);
        if(items.length === 0){ alert("El carrito está vacío."); return; }
        
        let subtotal = 0;
        let cantidadServicios = 0;
        let msgList = [];

        items.forEach(i => {
            let sub = i.precio * i.qty;
            subtotal += sub;
            cantidadServicios += i.qty;
            msgList.push(`- ${i.nombre} (x${i.qty}) = $${sub.toLocaleString()}`);
        });

        let descuento = (cantidadServicios >= 2) ? subtotal * 0.10 : 0;
        let totalFinal = subtotal - descuento;
        let modStr = shippingMethod.toUpperCase();

        let message = `¡Hola Tech Sai! Necesito los siguientes servicios:\n\n${msgList.join("\n")}\n\n`;
        if (descuento > 0) message += `🔥 Descuento Combo: -$${descuento.toLocaleString()}\n`;
        message += `📍 *Modalidad:* ${modStr}\n💰 *Total Estimado:* $${totalFinal.toLocaleString()}`;
        
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };
}

function resetDiagnostic() {
    document.getElementById("diagStep1").classList.remove("hidden");
    document.getElementById("diagStep2").classList.add("hidden");
    document.getElementById("diagResult").classList.add("hidden");
    diagResultServiceId = null;
}

function setupTheme() {
    if (localStorage.getItem("theme") === "active") { document.body.classList.add("active"); }
    themeToggle.onclick = () => {
        const isDark = document.body.classList.toggle("active");
        localStorage.setItem("theme", isDark ? "active" : "light");
    };
}

init();