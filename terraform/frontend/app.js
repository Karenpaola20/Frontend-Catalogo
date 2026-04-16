const API = "https://kv7fxejugl.execute-api.us-east-1.amazonaws.com/dev";

async function loadCatalog() {
  const res = await fetch(`${API}/catalog`);
  const data = await res.json();

  const container = document.getElementById("catalog");
  container.innerHTML = "";

  data.forEach(service => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${service.servicio}</h3>
      <p><strong>Plan:</strong> ${service.plan}</p>
      <p><strong>Proveedor:</strong> ${service.proveedor}</p>
      <p>Precio: $${service.precio_mensual}</p>
      <button onclick='pay(${JSON.stringify(service)})'>Pagar</button>
    `;

    container.appendChild(div);
  });
}

loadCatalog();


async function pay(service) {
  const res = await fetch(`${API}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cardId: "001fbd3f-2091-4e48-9f78-9c0010c44d8d", // tu card
      service
    })
  });

  const data = await res.json();

  const traceId = data.traceId;

  document.getElementById("status").innerText = "Iniciando pago...";

  pollStatus(traceId);
}

function pollStatus(traceId) {
  const interval = setInterval(async () => {
    const res = await fetch(`${API}/payment/${traceId}`);
    const data = await res.json();

    document.getElementById("status").innerText = data.status;

    if (data.status === "FINISH" || data.status === "FAILED") {
      clearInterval(interval);
    }

  }, 3000);
}

async function uploadCSV() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Selecciona un archivo CSV");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function () {
    const base64 = reader.result.split(",")[1];

    await fetch(`${API}/catalog/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file: base64
      })
    });

    alert("Catálogo actualizado");

    loadCatalog();
  };

  reader.readAsDataURL(file);
}