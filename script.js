const galleryGrid = document.getElementById("galleryGrid");
const dropZone = document.getElementById("dropZone");
const downloadBtn = document.getElementById("downloadBtn");

// Datos de los elementos
const elements = [
  { id: 1, name: "Árbol verde 1", src: "/img/arboles-verdes.png" },
  { id: 2, name: "Árbol seco", src: "/img/arboles.png" },
  { id: 3, name: "Árbol verde 2", src: "/img/arbolito.png" },
  { id: 4, name: "Árbol amarillo", src: "/img/arbol-1.png" },
  { id: 5, name: "Ciprés", src: "/img/cipres.png" },
  { id: 6, name: "Nubes", src: "/img/nube.png" },
  { id: 7, name: "Nube", src: "/img/nube-2.png" },
  { id: 8, name: "Roca verde", src: "/img/roca-verde.png" },
  { id: 9, name: "Rocas", src: "/img/rocas.png" },
  { id: 10, name: "Ganado", src: "/img/rebano.png" },
  { id: 11, name: "Cometa", src: "/img/cometa.png" },
  { id: 12, name: "Piedras 1", src: "/img/pedrolo.png" },
  { id: 13, name: "Piedras 2", src: "/img/rocas-2.png" },
  { id: 14, name: "Vaca y cabra", src: "/img/animalitos.png" },
  { id: 15, name: "Perro", src: "/img/perrito.png" },
  { id: 16, name: "Globo", src: "/img/globo.png" },
  { id: 17, name: "Arco", src: "/img/puerta.png" },
  { id: 18, name: "Caballo", src: "/img/caballo.png" },
  { id: 19, name: "Grupo bailando", src: "/img/corro.png" },
  { id: 20, name: "Mujer con cesto", src: "/img/cesto.png" },
  { id: 21, name: "Carruaje", src: "/img/carro.png" },
  { id: 22, name: "Tronco 1", src: "/img/troncos.png" },
  { id: 23, name: "Músicos", src: "/img/guitarra.png" },
  { id: 24, name: "Casita", src: "/img/casita.png" },
  { id: 25, name: "Caballos con jinetes", src: "/img/diligencia.png" },
  { id: 26, name: "Edificio rosa", src: "/img/edificio.png" },
  { id: 27, name: "Familia viajando", src: "/img/grupo.png" },
  { id: 28, name: "Burro cargado", src: "/img/burrito.png" },
  { id: 29, name: "Mujer verde", src: "/img/pareja.png" },
  { id: 30, name: "Mujer trabajando", src: "/img/ocas.png" },
  { id: 31, name: "Estatua 1", src: "/img/diosa.png" },
  { id: 32, name: "Estatua ecuestre", src: "/img/estatua-2.png" },
  { id: 33, name: "Fuente", src: "/img/fuente.png" },
];
elements.forEach((element, index) => {
  const div = document.createElement("div");
  div.className = `grid-item item-${index + 1}`;
  div.draggable = true;
  div.dataset.elementId = element.id;
  div.dataset.elementName = element.name;
  div.dataset.elementSrc = element.src;

  // Mostrar la imagen con un título
  div.innerHTML = `
                <img src="${element.src}" alt="${element.name}" title="${element.name}">
            `;

  // Event listener para drag
  div.addEventListener("dragstart", handleDragStart);

  galleryGrid.appendChild(div);
});

// Variables para el drag and drop
let draggedData = null;

// Manejo del inicio del arrastre
function handleDragStart(e) {
  draggedData = {
    name: e.currentTarget.dataset.elementName,
    src: e.currentTarget.dataset.elementSrc,
  };
  e.dataTransfer.effectAllowed = "copy";
}

// Eventos del drop zone
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");

  if (!draggedData) return;

  const rect = dropZone.getBoundingClientRect();
  const x = e.clientX - rect.left - 50;
  const y = e.clientY - rect.top - 50;

  createDroppedElement(draggedData, x, y);
  draggedData = null;
});

// Crear elemento soltado en el canvas
let elementCounter = 0;
function createDroppedElement(data, x, y) {
  const element = document.createElement("div");
  element.className = "dropped-element";
  element.id = `dropped-${++elementCounter}`;
  element.style.left = x + "px";
  element.style.top = y + "px";
  element.style.width = "120px";
  element.style.height = "120px";

  element.innerHTML = `
                <img src="${data.src}" alt="${data.name}" style="width: 100%; height: 100%; object-fit: contain;">
                <button class="delete-btn" onclick="deleteElement('${element.id}')">×</button>
                <div class="resize-handle"></div>
            `;

  dropZone.appendChild(element);
  makeDraggable(element);
  makeResizable(element);
  makeResizableByHandle(element);
}

// Hacer elemento arrastrable dentro del canvas
function makeDraggable(element) {
  let isDragging = false;
  let currentX, currentY, initialX, initialY;

  element.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("delete-btn")) return;

    isDragging = true;
    element.classList.add("selected");

    const rect = element.getBoundingClientRect();
    const parentRect = dropZone.getBoundingClientRect();

    initialX = rect.left - parentRect.left;
    initialY = rect.top - parentRect.top;
    currentX = e.clientX;
    currentY = e.clientY;

    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - currentX;
    const dy = e.clientY - currentY;

    element.style.left = initialX + dx + "px";
    element.style.top = initialY + dy + "px";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      element.classList.remove("selected");
    }
  });
}

// Hacer elemento redimensionable
function makeResizable(element) {
  element.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const currentWidth = element.offsetWidth;
      const currentHeight = element.offsetHeight;
      const delta = e.deltaY > 0 ? -10 : 10;

      const newSize = Math.max(50, currentWidth + delta);
      element.style.width = newSize + "px";
      element.style.height = newSize + "px";
    }
  });
}

// Hacer elemento redimensionable arrastrando el handle
function makeResizableByHandle(element) {
  const handle = element.querySelector(".resize-handle");
  if (!handle) return;

  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  handle.addEventListener("mousedown", (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = element.offsetWidth;
    startHeight = element.offsetHeight;

    element.classList.add("selected");
    e.stopPropagation(); // Evitar que se active el drag
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Usar la mayor de las dos dimensiones para mantener proporción
    const delta = Math.max(deltaX, deltaY);
    const newSize = Math.max(30, Math.min(800, startWidth + delta));

    element.style.width = newSize + "px";
    element.style.height = newSize + "px";
  });

  document.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      element.classList.remove("selected");
    }
  });
}

// Redimensionar elemento con botones (mantenido para compatibilidad con rueda)
function resizeElement(elementId, delta) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const currentWidth = element.offsetWidth;
  const newSize = Math.max(30, Math.min(800, currentWidth + delta));
  element.style.width = newSize + "px";
  element.style.height = newSize + "px";
}

// Resetear tamaño del elemento al original
function resetElementSize(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const originalSize = element.dataset.originalSize || "120";
  element.style.width = originalSize + "px";
  element.style.height = originalSize + "px";
}

// Eliminar elemento
function deleteElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.remove();
  }
}


// Descargar composición
downloadBtn.addEventListener("click", async () => {
  try {
    const deleteButtons = dropZone.querySelectorAll(".delete-btn");
    const resizeHandles = dropZone.querySelectorAll(".resize-handle");

    // Ocultar controles
    deleteButtons.forEach((btn) => (btn.style.display = "none"));
    resizeHandles.forEach((handle) => (handle.style.display = "none"));

    const canvas = await html2canvas(dropZone, {
      backgroundColor: "#faf8f5",
      scale: 2,
      logging: false,
      useCORS: true,
    });

    // Restaurar controles
    deleteButtons.forEach((btn) => (btn.style.display = ""));
    resizeHandles.forEach((handle) => (handle.style.display = ""));

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `composicion-vintage-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error("Error al generar la imagen:", error);
    alert("Hubo un error al generar la imagen. Por favor, inténtalo de nuevo.");
  }
});

// Funciones para el menú y artículo
const showMenu = () => {
  const menu = document.querySelector(".hidden-menu");
  const article = document.querySelector(".article");
  const tab = document.querySelector(".article-tab");

  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "flex";
    article.style.display = "none";
    if (tab) tab.style.display = "none";
  } else {
    menu.style.display = "none";
  }
};

const showInfo = () => {
  const article = document.querySelector(".article");
  const menu = document.querySelector(".hidden-menu");
  const tab = document.querySelector(".article-tab");

  if (article.style.display === "none" || article.style.display === "") {
    article.style.display = "block";
    menu.style.display = "none";
    if (tab) tab.style.display = "none";
  } else {
    article.style.display = "none";
  }
};

const minimizeArticle = () => {
  const article = document.querySelector(".article");
  const tab = document.querySelector(".article-tab");
  
  if (article && tab) {
    article.style.display = "none";
    tab.style.display = "block";
  }
};

const restoreArticle = () => {
  const article = document.querySelector(".article");
  const tab = document.querySelector(".article-tab");
  
  if (article && tab) {
    article.style.display = "block";
    tab.style.display = "none";
  }
};