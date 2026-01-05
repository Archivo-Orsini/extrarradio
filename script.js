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

  div.innerHTML = `
    <img src="${element.src}" alt="${element.name}" title="${element.name}">
  `;

  div.addEventListener("dragstart", handleDragStart);
  galleryGrid.appendChild(div);
});

// Variables para el drag and drop
let draggedData = null;

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

// Variables globales para controlar qué elemento se está manipulando
let currentDraggingElement = null;
let currentResizingElement = null;

// WeakMap para almacenar datos específicos de cada elemento
const elementData = new WeakMap();

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
    <button class="delete-btn" data-element-id="${element.id}">×</button>
    <div class="resize-handle"></div>
  `;

  dropZone.appendChild(element);
  
  // Inicializar datos del elemento
  elementData.set(element, {
    currentX: 0,
    currentY: 0,
    initialX: 0,
    initialY: 0,
    touchStartTime: 0,
    hasMoved: false,
    touchElement: null
  });
  
  // Añadir eventos táctiles al botón delete
  const deleteBtn = element.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteElement(element.id);
  });
  deleteBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteElement(element.id);
  });
  
  makeDraggable(element);
  makeResizable(element);
  makeResizableByHandle(element);
}

function makeDraggable(element) {
  const data = elementData.get(element);

  // MOUSE (desktop)
  element.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("delete-btn")) return;
    if (e.target.classList.contains("resize-handle")) return;

    currentDraggingElement = element;
    
    // Remover selected de todos los elementos
    document.querySelectorAll('.dropped-element').forEach(el => {
      if (el !== element) {
        el.classList.remove('selected');
      }
    });
    
    element.classList.add("selected");

    const rect = element.getBoundingClientRect();
    const parentRect = dropZone.getBoundingClientRect();

    data.initialX = rect.left - parentRect.left;
    data.initialY = rect.top - parentRect.top;
    data.currentX = e.clientX;
    data.currentY = e.clientY;

    e.preventDefault();
  });

  // TOUCH (móvil)
  element.addEventListener("touchstart", (e) => {
    // SI HAY UN GHOST ACTIVO, IGNORAR ESTE TOUCHSTART
    if (touchGhost) {
      return;
    }
    
    if (e.target.classList.contains("delete-btn")) return;
    if (e.target.classList.contains("resize-handle")) return;

    // Guardar tiempo y establecer datos iniciales
    data.touchStartTime = Date.now();
    data.hasMoved = false;
    
    const touch = e.touches[0];
    const rect = element.getBoundingClientRect();
    const parentRect = dropZone.getBoundingClientRect();

    data.initialX = rect.left - parentRect.left;
    data.initialY = rect.top - parentRect.top;
    data.currentX = touch.clientX;
    data.currentY = touch.clientY;
    
    // Marcar este elemento como el candidato a ser arrastrado
    data.touchElement = element;

    e.preventDefault();
  }, { passive: false });
}

// Event listeners globales para mouse y touch
document.addEventListener("mousemove", (e) => {
  if (!currentDraggingElement) return;
  
  const data = elementData.get(currentDraggingElement);
  const dx = e.clientX - data.currentX;
  const dy = e.clientY - data.currentY;

  currentDraggingElement.style.left = data.initialX + dx + "px";
  currentDraggingElement.style.top = data.initialY + dy + "px";
});

document.addEventListener("touchmove", (e) => {
  if (!e.touches[0]) return;
  
  if (touchGhost) {
    return;
  }
  
  const touch = e.touches[0];
  
  if (currentDraggingElement) {
    const data = elementData.get(currentDraggingElement);
    const dx = touch.clientX - data.currentX;
    const dy = touch.clientY - data.currentY;

    currentDraggingElement.style.left = data.initialX + dx + "px";
    currentDraggingElement.style.top = data.initialY + dy + "px";
    
    e.preventDefault(); 
    return;
  }
  
  const droppedElements = dropZone.querySelectorAll('.dropped-element');
  for (let elem of droppedElements) {
    const data = elementData.get(elem);
    if (data && data.touchElement === elem && !currentDraggingElement) {
      const dx = touch.clientX - data.currentX;
      const dy = touch.clientY - data.currentY;

      // Si se movió más de 5px, empezar el drag
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        data.hasMoved = true;
        currentDraggingElement = elem;
        
        // Remover selected de otros elementos
        document.querySelectorAll('.dropped-element').forEach(el => {
          if (el !== elem) {
            el.classList.remove('selected');
          }
        });
        elem.classList.add('selected');
        
        elem.style.left = data.initialX + dx + "px";
        elem.style.top = data.initialY + dy + "px";
        
        e.preventDefault(); // SOLO prevenir cuando empieza el drag
        return;
      }
    }
  }

  // NO prevenir por defecto si no hay drag - permite scroll
}, { passive: false });

document.addEventListener("mouseup", () => {
  if (currentDraggingElement) {
    currentDraggingElement = null;
  }
});

document.addEventListener("touchend", (e) => {
  // Limpiar todos los touchElement
  const droppedElements = dropZone.querySelectorAll('.dropped-element');
  for (let elem of droppedElements) {
    const data = elementData.get(elem);
    if (data && data.touchElement) {
      const touchDuration = Date.now() - data.touchStartTime;
      
      // Si fue un tap en este elemento (sin movimiento y rápido)
      if (data.touchElement === elem && !data.hasMoved && touchDuration < 300) {
        // Toggle: si ya está selected, quitarlo; si no, ponerlo
        if (elem.classList.contains('selected')) {
          elem.classList.remove('selected');
        } else {
          document.querySelectorAll('.dropped-element').forEach(el => {
            el.classList.remove('selected');
          });
          elem.classList.add('selected');
        }
      }
      
      data.touchElement = null;
      data.hasMoved = false;
    }
  }
  
  if (currentDraggingElement) {
    const data = elementData.get(currentDraggingElement);
    
    if (data && data.hasMoved) {
      // Si fue un drag, mantener selected
      document.querySelectorAll('.dropped-element').forEach(el => {
        if (el !== currentDraggingElement) {
          el.classList.remove('selected');
        }
      });
      currentDraggingElement.classList.add('selected');
    }
    
    if (data) {
      data.hasMoved = false;
    }
    currentDraggingElement = null;
  }
});

// Hacer elemento redimensionable con rueda
function makeResizable(element) {
  element.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const currentWidth = element.offsetWidth;
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

  let startX, startY, startWidth, startHeight;

  // MOUSE (desktop)
  handle.addEventListener("mousedown", (e) => {
    currentResizingElement = element;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = element.offsetWidth;
    startHeight = element.offsetHeight;

    element.classList.add("selected");
    e.stopPropagation();
    e.preventDefault();
  });

  // TOUCH (móvil)
  handle.addEventListener("touchstart", (e) => {
    currentResizingElement = element;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startWidth = element.offsetWidth;
    startHeight = element.offsetHeight;

    element.classList.add("selected");
    e.stopPropagation();
    e.preventDefault();
  }, { passive: false });

  document.addEventListener("mousemove", (e) => {
    if (currentResizingElement !== element) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const delta = Math.max(deltaX, deltaY);
    const newSize = Math.max(30, Math.min(800, startWidth + delta));

    element.style.width = newSize + "px";
    element.style.height = newSize + "px";
  });

  document.addEventListener("touchmove", (e) => {
    if (currentResizingElement !== element) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    const delta = Math.max(deltaX, deltaY);
    const newSize = Math.max(30, Math.min(800, startWidth + delta));

    element.style.width = newSize + "px";
    element.style.height = newSize + "px";

    e.preventDefault();
  }, { passive: false });

  document.addEventListener("mouseup", () => {
    if (currentResizingElement === element) {
      currentResizingElement = null;
      element.classList.remove("selected");
    }
  });

  document.addEventListener("touchend", () => {
    if (currentResizingElement === element) {
      currentResizingElement = null;
      element.classList.remove("selected");
    }
  });
}

// Eliminar elemento
function deleteElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    elementData.delete(element);
    element.remove();
  }
}

// Descargar composición
downloadBtn.addEventListener("click", async () => {
  try {
    const deleteButtons = dropZone.querySelectorAll(".delete-btn");
    const resizeHandles = dropZone.querySelectorAll(".resize-handle");

    deleteButtons.forEach((btn) => (btn.style.display = "none"));
    resizeHandles.forEach((handle) => (handle.style.display = "none"));

    const canvas = await html2canvas(dropZone, {
      backgroundColor: "#faf8f5",
      scale: 2,
      logging: false,
      useCORS: true,
    });

    deleteButtons.forEach((btn) => (btn.style.display = ""));
    resizeHandles.forEach((handle) => (handle.style.display = ""));

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `extrarradio-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error("Error al generar la imagen:", error);
    alert("Hubo un error al generar la imagen. Por favor, inténtalo de nuevo.");
  }
});

// Funciones para el menú
const showMenu = () => {
  const menu = document.querySelector(".hidden-menu");
  const article = document.querySelector(".article");
  const tab = document.querySelector(".article-tab");

  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "flex";
    if (article) article.style.display = "none";
    if (tab) tab.style.display = "none";
  } else {
    menu.style.display = "none";
  }
};

const showInfo = () => {
  const article = document.querySelector(".article");
  const menu = document.querySelector(".hidden-menu");
  const tab = document.querySelector(".article-tab");

  if (article && (article.style.display === "none" || article.style.display === "")) {
    article.style.display = "block";
    menu.style.display = "none";
    if (tab) tab.style.display = "none";
  } else if (article) {
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

// ==== SOPORTE TÁCTIL PARA MÓVIL - GALERÍA ====
elements.forEach((element, index) => {
  const div = galleryGrid.children[index];
  
  div.addEventListener('touchstart', handleTouchStart, { passive: false });
  div.addEventListener('touchmove', handleTouchMove, { passive: false });
  div.addEventListener('touchend', handleTouchEnd, { passive: false });
});

let touchDragData = null;
let touchGhost = null;

function handleTouchStart(e) {
  e.preventDefault();
  
  touchDragData = {
    name: e.currentTarget.dataset.elementName,
    src: e.currentTarget.dataset.elementSrc,
  };
  
  touchGhost = document.createElement('div');
  touchGhost.style.position = 'fixed';
  touchGhost.style.pointerEvents = 'none';
  touchGhost.style.zIndex = '10000';
  touchGhost.style.width = '80px';
  touchGhost.style.height = '80px';
  touchGhost.style.opacity = '0.7';
  touchGhost.innerHTML = `<img src="${touchDragData.src}" style="width:100%; height:100%; object-fit:contain;">`;
  
  document.body.appendChild(touchGhost);
  
  const touch = e.touches[0];
  touchGhost.style.left = (touch.clientX - 40) + 'px';
  touchGhost.style.top = (touch.clientY - 40) + 'px';
}

function handleTouchMove(e) {
  e.preventDefault();
  
  if (!touchGhost) return;
  
  const touch = e.touches[0];
  touchGhost.style.left = (touch.clientX - 40) + 'px';
  touchGhost.style.top = (touch.clientY - 40) + 'px';
  
  const dropRect = dropZone.getBoundingClientRect();
  if (
    touch.clientX >= dropRect.left &&
    touch.clientX <= dropRect.right &&
    touch.clientY >= dropRect.top &&
    touch.clientY <= dropRect.bottom
  ) {
    dropZone.classList.add('drag-over');
  } else {
    dropZone.classList.remove('drag-over');
  }
}

function handleTouchEnd(e) {
  e.preventDefault();
  
  if (touchGhost) {
    touchGhost.remove();
    touchGhost = null;
  }
  
  dropZone.classList.remove('drag-over');
  
  if (!touchDragData) return;
  
  const touch = e.changedTouches[0];
  const dropRect = dropZone.getBoundingClientRect();
  
  if (
    touch.clientX >= dropRect.left &&
    touch.clientX <= dropRect.right &&
    touch.clientY >= dropRect.top &&
    touch.clientY <= dropRect.bottom
  ) {
    const x = touch.clientX - dropRect.left - 60;
    const y = touch.clientY - dropRect.top - 60;
    createDroppedElement(touchDragData, x, y);
  }
  
  touchDragData = null;
}

dropZone.addEventListener('touchstart', (e) => {
  if (e.target === dropZone) {
    document.querySelectorAll('.dropped-element').forEach(el => {
      el.classList.remove('selected');
    });
  }
});