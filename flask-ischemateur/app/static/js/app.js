(function () {
  const state = {
    bootstrap: null,
    currentSchematicId: null,
    currentTab: "analysis",
    selectedComponentId: null,
    highlightedPathIds: [],
    image: null,
    viewer: {
      zoom: 1,
      panX: 0,
      panY: 0,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      fittedFor: null,
    },
    drawMode: false,
    drawStart: null,
    currentRect: null,
    templateRects: [],
    libraryDialogMode: "create",
  };

  const els = {
    emptyState: document.getElementById("emptyState"),
    mainContent: document.getElementById("mainContent"),
    librarySelect: document.getElementById("librarySelect"),
    demoBtn: document.getElementById("demoBtn"),
    uploadBtn: document.getElementById("uploadBtn"),
    emptyUploadBtn: document.getElementById("emptyUploadBtn"),
    emptyDemoBtn: document.getElementById("emptyDemoBtn"),
    analyzeBtn: document.getElementById("analyzeBtn"),
    drawBtn: document.getElementById("drawBtn"),
    drawTypeSelect: document.getElementById("drawTypeSelect"),
    saveMatchesBtn: document.getElementById("saveMatchesBtn"),
    clearRectsBtn: document.getElementById("clearRectsBtn"),
    resetBtn: document.getElementById("resetBtn"),
    schematicFileInput: document.getElementById("schematicFileInput"),
    libraryFileInput: document.getElementById("libraryFileInput"),
    thresholdRange: document.getElementById("thresholdRange"),
    thresholdLabel: document.getElementById("thresholdLabel"),
    exportSchematicBtn: document.getElementById("exportSchematicBtn"),
    exportCatalogBtn: document.getElementById("exportCatalogBtn"),
    viewerCanvas: document.getElementById("viewerCanvas"),
    viewerWrap: document.getElementById("viewerWrap"),
    dragOverlay: document.getElementById("dragOverlay"),
    componentList: document.getElementById("componentList"),
    componentCountBadge: document.getElementById("componentCountBadge"),
    componentFilterLabel: document.getElementById("componentFilterLabel"),
    statsGrid: document.getElementById("statsGrid"),
    schematicTitle: document.getElementById("schematicTitle"),
    schematicMeta: document.getElementById("schematicMeta"),
    catalogTableWrap: document.getElementById("catalogTableWrap"),
    pathsList: document.getElementById("pathsList"),
    componentEditorForm: document.getElementById("componentEditorForm"),
    componentName: document.getElementById("componentName"),
    componentType: document.getElementById("componentType"),
    componentVoltage: document.getElementById("componentVoltage"),
    componentRating: document.getElementById("componentRating"),
    componentManufacturer: document.getElementById("componentManufacturer"),
    toggleBreakerBtn: document.getElementById("toggleBreakerBtn"),
    zoomInBtn: document.getElementById("zoomInBtn"),
    zoomOutBtn: document.getElementById("zoomOutBtn"),
    resetViewBtn: document.getElementById("resetViewBtn"),
    newLibraryBtn: document.getElementById("newLibraryBtn"),
    editLibraryBtn: document.getElementById("editLibraryBtn"),
    importLibraryBtn: document.getElementById("importLibraryBtn"),
    exportLibraryBtn: document.getElementById("exportLibraryBtn"),
    deleteLibraryBtn: document.getElementById("deleteLibraryBtn"),
    libraryDialog: document.getElementById("libraryDialog"),
    libraryDialogTitle: document.getElementById("libraryDialogTitle"),
    libraryForm: document.getElementById("libraryForm"),
    libraryName: document.getElementById("libraryName"),
    libraryDescription: document.getElementById("libraryDescription"),
    libraryAuthor: document.getElementById("libraryAuthor"),
    libraryTags: document.getElementById("libraryTags"),
    mainTabbar: document.getElementById("mainTabbar"),
    analysisTabBtn: document.getElementById("analysisTabBtn"),
    catalogTabBtn: document.getElementById("catalogTabBtn"),
    pathsTabBtn: document.getElementById("pathsTabBtn"),
    analysisLayout: document.getElementById("analysisLayout"),
    libraryEntries: document.getElementById("libraryEntries"),
    libraryCountBadge: document.getElementById("libraryCountBadge"),
    toastRegion: document.getElementById("toastRegion"),
    tabs: Array.from(document.querySelectorAll(".tab")),
    panels: Array.from(document.querySelectorAll(".panel")),
  };

  function init() {
    bindEvents();
    refreshBootstrap();
  }

  function bindEvents() {
    els.demoBtn.addEventListener("click", loadDemo);
    els.emptyDemoBtn.addEventListener("click", loadDemo);
    els.uploadBtn.addEventListener("click", () => els.schematicFileInput.click());
    els.emptyUploadBtn.addEventListener("click", () => els.schematicFileInput.click());
    els.importLibraryBtn.addEventListener("click", () => els.libraryFileInput.click());
    els.schematicFileInput.addEventListener("change", uploadSchematic);
    els.libraryFileInput.addEventListener("change", importLibrary);
    els.analyzeBtn.addEventListener("click", runAnalysis);
    els.drawBtn.addEventListener("click", toggleDrawMode);
    els.clearRectsBtn.addEventListener("click", clearTemplateRects);
    els.saveMatchesBtn.addEventListener("click", saveMatchesToLibrary);
    els.resetBtn.addEventListener("click", resetData);
    els.exportSchematicBtn.addEventListener("click", exportSchematic);
    els.exportCatalogBtn.addEventListener("click", exportCatalog);
    els.librarySelect.addEventListener("change", activateLibrary);
    els.thresholdRange.addEventListener("input", handleThresholdChange);
    els.componentEditorForm.addEventListener("submit", saveComponent);
    els.toggleBreakerBtn.addEventListener("click", toggleBreakerState);
    els.zoomInBtn.addEventListener("click", () => zoomCanvas(1.15));
    els.zoomOutBtn.addEventListener("click", () => zoomCanvas(1 / 1.15));
    els.resetViewBtn.addEventListener("click", resetViewerFit);
    els.newLibraryBtn.addEventListener("click", () => openLibraryDialog("create"));
    els.editLibraryBtn.addEventListener("click", () => openLibraryDialog("edit"));
    els.deleteLibraryBtn.addEventListener("click", deleteActiveLibrary);
    els.exportLibraryBtn.addEventListener("click", exportLibrary);
    els.libraryForm.addEventListener("submit", submitLibraryDialog);
    els.tabs.forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));
    document.querySelectorAll("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => document.getElementById(button.dataset.closeDialog).close());
    });

    bindViewerCanvas();
    bindDragDrop();
    window.addEventListener("resize", resetViewerFit);
  }

  async function refreshBootstrap() {
    const data = await fetchJSON("/api/bootstrap");
    state.bootstrap = data;
    if (!state.currentSchematicId || !data.schematics.some((item) => item.id === state.currentSchematicId)) {
      state.currentSchematicId = data.schematics.length ? data.schematics[data.schematics.length - 1].id : null;
    }
    if (state.bootstrap.settings && typeof state.bootstrap.settings.confidenceThreshold === "number") {
      els.thresholdRange.value = String(state.bootstrap.settings.confidenceThreshold);
    }
    if (currentSchematic()) {
      await ensureImageLoaded();
    } else {
      state.image = null;
    }
    render();
  }

  async function fetchJSON(url, options) {
    const response = await fetch(url, options);
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Erreur serveur");
    }
    return payload;
  }

  async function loadDemo() {
    try {
      await fetchJSON("/api/demo", { method: "POST" });
      toast("Exemple chargé avec succès.", "success");
      await refreshBootstrap();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function uploadSchematic(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const body = new FormData();
    body.append("file", file);
    try {
      await fetchJSON("/api/upload", { method: "POST", body });
      toast("Schéma téléversé.", "success");
      await refreshBootstrap();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      event.target.value = "";
    }
  }

  async function importLibrary(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const body = new FormData();
    body.append("file", file);
    try {
      await fetchJSON("/api/libraries/import", { method: "POST", body });
      toast("Bibliothèque importée.", "success");
      await refreshBootstrap();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      event.target.value = "";
    }
  }

  async function activateLibrary() {
    try {
      await fetchJSON("/api/libraries/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryId: els.librarySelect.value }),
      });
      await refreshBootstrap();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  function handleThresholdChange() {
    if (!state.bootstrap) {
      return;
    }
    state.bootstrap.settings.confidenceThreshold = Number(els.thresholdRange.value);
    render();
  }

  async function saveComponent(event) {
    event.preventDefault();
    const component = selectedComponent();
    if (!component) {
      toast("Sélectionnez un composant.", "error");
      return;
    }
    try {
      await fetchJSON(`/api/components/${state.currentSchematicId}/${component.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: els.componentName.value,
          type: els.componentType.value,
          voltage: els.componentVoltage.value,
          rating: els.componentRating.value,
          manufacturer: els.componentManufacturer.value,
        }),
      });
      toast("Composant mis à jour.", "success");
      await refreshBootstrap();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function toggleBreakerState() {
    const component = selectedComponent();
    if (!component || component.type !== "breaker") {
      return;
    }
    try {
      await fetchJSON(`/api/components/${state.currentSchematicId}/${component.id}/toggle-breaker`, {
        method: "POST",
      });
      await refreshBootstrap();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  function exportSchematic() {
    if (!currentSchematic()) {
      return;
    }
    window.location.href = `/api/export/schematic/${state.currentSchematicId}.csv`;
  }

  function exportCatalog() {
    window.location.href = "/api/export/catalog.csv";
  }

  function exportLibrary() {
    const library = activeLibrary();
    if (!library) {
      return;
    }
    const format = window.prompt("Format d'export: json, csv ou xml", "json");
    if (!format) {
      return;
    }
    window.location.href = `/api/libraries/${library.id}/export/${format.toLowerCase()}`;
  }

  async function resetData() {
    const answer = window.prompt("Réinitialiser quoi ? all, schematics ou library", "schematics");
    if (!answer) {
      return;
    }
    try {
      await fetchJSON("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: answer, activeLibraryId: activeLibrary() ? activeLibrary().id : null }),
      });
      state.selectedComponentId = null;
      state.highlightedPathIds = [];
      toast("Réinitialisation terminée.", "success");
      await refreshBootstrap();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  function openLibraryDialog(mode) {
    const library = activeLibrary();
    if (mode === "edit" && (!library || library.isDefault)) {
      toast("La bibliothèque par défaut ne se modifie pas ici.", "error");
      return;
    }
    state.libraryDialogMode = mode;
    els.libraryDialogTitle.textContent = mode === "create" ? "Nouvelle bibliothèque" : "Modifier la bibliothèque";
    els.libraryName.value = mode === "edit" && library ? library.name : "";
    els.libraryDescription.value = mode === "edit" && library ? library.description || "" : "";
    els.libraryAuthor.value = mode === "edit" && library ? library.author || "" : "";
    els.libraryTags.value = mode === "edit" && library ? (library.tags || []).join(", ") : "";
    els.libraryDialog.showModal();
  }

  async function submitLibraryDialog(event) {
    event.preventDefault();
    const payload = {
      name: els.libraryName.value.trim(),
      description: els.libraryDescription.value.trim(),
      author: els.libraryAuthor.value.trim(),
      tags: els.libraryTags.value.split(",").map((item) => item.trim()).filter(Boolean),
    };
    if (!payload.name) {
      toast("Le nom est requis.", "error");
      return;
    }
    try {
      if (state.libraryDialogMode === "create") {
        await fetchJSON("/api/libraries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJSON(`/api/libraries/${activeLibrary().id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      els.libraryDialog.close();
      await refreshBootstrap();
      toast("Bibliothèque enregistrée.", "success");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function deleteActiveLibrary() {
    const library = activeLibrary();
    if (!library || library.isDefault) {
      toast("Impossible de supprimer la bibliothèque par défaut.", "error");
      return;
    }
    if (!window.confirm(`Supprimer la bibliothèque ${library.name} ?`)) {
      return;
    }
    try {
      await fetchJSON(`/api/libraries/${library.id}`, { method: "DELETE" });
      await refreshBootstrap();
      toast("Bibliothèque supprimée.", "success");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  function toggleDrawMode() {
    state.drawMode = !state.drawMode;
    state.drawStart = null;
    state.currentRect = null;
    render();
  }

  function clearTemplateRects() {
    state.templateRects = [];
    state.currentRect = null;
    state.drawStart = null;
    render();
  }

  async function runAnalysis() {
    if (!currentSchematic()) {
      toast("Chargez un schéma.", "error");
      return;
    }
    const lib = activeLibrary();
    if (!lib) {
      toast("Sélectionnez une bibliothèque.", "error");
      return;
    }
    const body = {
      schematicId: state.currentSchematicId,
      libraryId: lib.id,
      threshold: Number(els.thresholdRange.value),
    };
    if (state.templateRects.length && state.image) {
      body.templateRects = state.templateRects.map((r) => ({
        rect: {
          x: (r.x / state.image.width) * 100,
          y: (r.y / state.image.height) * 100,
          width: (r.width / state.image.width) * 100,
          height: (r.height / state.image.height) * 100,
        },
        type: r.type,
      }));
    }
    if (!body.templateRects && !lib.componentCount) {
      toast("Dessinez un rectangle sur le schéma ou utilisez une bibliothèque avec des templates.", "error");
      return;
    }
    try {
      toast("Analyse en cours...", "info");
      const payload = await fetchJSON("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      state.bootstrap = payload.state;
      await ensureImageLoaded();
      render();
      toast(`Analyse terminée: ${payload.schematic.components.length} composants trouvés.`, "success");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function saveMatchesToLibrary() {
    const lib = activeLibrary();
    if (!lib || lib.isDefault) {
      toast("Sélectionnez une bibliothèque personnalisée.", "error");
      return;
    }
    if (!state.templateRects.length || !state.image) {
      toast("Dessinez au moins un rectangle à sauvegarder.", "error");
      return;
    }
    const annotations = state.templateRects.map((r) => ({
      id: `annotation-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      correctType: r.type,
      boundingBox: {
        x: (r.x / state.image.width) * 100,
        y: (r.y / state.image.height) * 100,
        width: (r.width / state.image.width) * 100,
        height: (r.height / state.image.height) * 100,
      },
    }));
    try {
      await fetchJSON(`/api/libraries/${lib.id}/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schematicId: state.currentSchematicId,
          annotations: annotations,
        }),
      });
      state.templateRects = [];
      state.currentRect = null;
      state.drawStart = null;
      toast(`${annotations.length} template(s) sauvegardé(s).`, "success");
      await refreshBootstrap();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function deleteAnnotation(libraryId, annotationId) {
    try {
      await fetchJSON(`/api/libraries/${libraryId}/annotations/${annotationId}`, { method: "DELETE" });
      await refreshBootstrap();
      toast("Template supprimé.", "success");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  function switchTab(tabName) {
    state.currentTab = tabName;
    renderTabs();
  }

  function render() {
    renderLibraryBar();
    renderTabs();
    renderShell();
    renderStats();
    renderComponentList();
    renderEditor();
    renderCatalog();
    renderPaths();
    renderLibraryEntries();
    renderViewerCanvas();
  }

  function renderShell() {
    const schematic = currentSchematic();
    const hasSchematic = Boolean(schematic);
    const lib = activeLibrary();
    els.emptyState.classList.toggle("hidden", hasSchematic);
    els.mainContent.classList.toggle("hidden", !hasSchematic);
    els.analyzeBtn.disabled = !hasSchematic || !lib || (!state.templateRects.length && !lib.componentCount);
    els.drawBtn.classList.toggle("active", state.drawMode);
    els.drawBtn.disabled = !hasSchematic;
    els.saveMatchesBtn.classList.toggle("hidden", !state.templateRects.length || !lib || lib.isDefault);
    els.clearRectsBtn.classList.toggle("hidden", !state.templateRects.length);
    els.exportSchematicBtn.disabled = !hasSchematic;
    els.exportCatalogBtn.disabled = !state.bootstrap || !(state.bootstrap.catalog || []).length;
    els.thresholdLabel.textContent = `${els.thresholdRange.value}%`;
    els.mainTabbar.classList.toggle("hidden", !hasSchematic);
    if (schematic) {
      els.schematicTitle.textContent = schematic.name;
      els.schematicMeta.textContent = `${filteredComponents().length} composants affichés`;
    }
  }

  function renderLibraryBar() {
    const libraries = state.bootstrap ? state.bootstrap.libraries : [];
    els.librarySelect.innerHTML = libraries.map((library) => {
      const suffix = library.isDefault ? " (défaut)" : ` (${library.componentCount})`;
      return `<option value="${library.id}">${library.name}${suffix}</option>`;
    }).join("");
    if (state.bootstrap && state.bootstrap.activeLibraryId) {
      els.librarySelect.value = state.bootstrap.activeLibraryId;
    }
  }

  function renderTabs() {
    els.tabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === state.currentTab));
    els.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === state.currentTab));
  }

  function renderStats() {
    const components = filteredComponents();
    const byType = new Map();
    components.forEach((component) => {
      byType.set(component.type, (byType.get(component.type) || 0) + 1);
    });
    els.componentCountBadge.textContent = `${components.length} composant${components.length > 1 ? "s" : ""}`;
    els.componentFilterLabel.textContent = `${components.length} / ${currentSchematic() ? currentSchematic().components.length : 0}`;
    els.statsGrid.innerHTML = Array.from(byType.entries()).map(([type, count]) => `
      <article class="stat-tile">
        <strong>${count}</strong>
        <span>${type}</span>
      </article>
    `).join("") || `<p class="muted">Aucune statistique disponible.</p>`;
  }

  function renderComponentList() {
    const components = filteredComponents();
    if (!components.length) {
      els.componentList.innerHTML = `<p class="muted">Aucun composant disponible.</p>`;
      return;
    }
    els.componentList.innerHTML = components.map((component) => {
      const active = component.id === state.selectedComponentId ? "active" : "";
      const stateLabel = component.breakerState ? ` · ${component.breakerState}` : "";
      return `
        <article class="component-item ${active}">
          <header>
            <div>
              <strong>${escapeHtml(component.name || component.type)}</strong>
              <p class="muted">${escapeHtml(component.type)}${stateLabel}</p>
            </div>
            <span class="badge">${Math.round(component.confidence || 0)}%</span>
          </header>
          <button class="secondary small" data-component-id="${component.id}">Sélectionner</button>
        </article>
      `;
    }).join("");
    els.componentList.querySelectorAll("[data-component-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedComponentId = button.dataset.componentId;
        state.highlightedPathIds = [];
        render();
      });
    });
  }

  function renderEditor() {
    const component = selectedComponent();
    const fields = [els.componentName, els.componentType, els.componentVoltage, els.componentRating, els.componentManufacturer];
    if (!component) {
      fields.forEach((field) => field.value = "");
      els.toggleBreakerBtn.classList.add("hidden");
      return;
    }
    els.componentName.value = component.name || "";
    els.componentType.value = component.type || "unknown";
    els.componentVoltage.value = component.voltage || "";
    els.componentRating.value = component.rating || "";
    els.componentManufacturer.value = component.manufacturer || "";
    els.toggleBreakerBtn.classList.toggle("hidden", component.type !== "breaker");
  }

  function renderCatalog() {
    const catalog = state.bootstrap ? state.bootstrap.catalog || [] : [];
    if (!catalog.length) {
      els.catalogTableWrap.innerHTML = `<p class="muted">Le catalogue se remplit après analyse.</p>`;
      return;
    }
    els.catalogTableWrap.innerHTML = `
      <table>
        <thead>
          <tr><th>Type</th><th>Nombre</th><th>Dernière mise à jour</th></tr>
        </thead>
        <tbody>
          ${catalog.map((entry) => `
            <tr>
              <td>${escapeHtml(entry.type)}</td>
              <td>${entry.count}</td>
              <td>${new Date(entry.lastUpdated || Date.now()).toLocaleString("fr-FR")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  function renderPaths() {
    const paths = currentSchematic() ? currentSchematic().paths || [] : [];
    if (!paths.length) {
      els.pathsList.innerHTML = `<p class="muted">Aucun chemin identifié.</p>`;
      return;
    }
    els.pathsList.innerHTML = paths.map((path) => {
      const active = arraysEqual(path.components, state.highlightedPathIds) ? "active" : "";
      return `
        <article class="path-item ${active}">
          <header>
            <div>
              <strong>${escapeHtml(path.description)}</strong>
              <p class="muted">${escapeHtml(path.voltage || "")}</p>
            </div>
            <span class="badge">${path.components.length} étapes</span>
          </header>
          <p class="muted">${escapeHtml(path.components.join(" → "))}</p>
          <button class="secondary small" data-path-id="${path.id}">Mettre en évidence</button>
        </article>
      `;
    }).join("");
    els.pathsList.querySelectorAll("[data-path-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const path = currentSchematic().paths.find((item) => item.id === button.dataset.pathId);
        state.highlightedPathIds = path ? path.components.slice() : [];
        state.currentTab = "analysis";
        render();
      });
    });
  }

  async function ensureImageLoaded() {
    const schematic = currentSchematic();
    if (!schematic) {
      return;
    }
    if (state.image && state.image.src === schematic.imageUrl) {
      return;
    }
    state.image = await loadImage(schematic.imageUrl);
    resetViewerFit();
  }

  function bindViewerCanvas() {
    const canvas = els.viewerCanvas;
    canvas.addEventListener("wheel", (event) => {
      if (!state.image) {
        return;
      }
      event.preventDefault();
      const factor = event.deltaY > 0 ? 0.92 : 1.08;
      zoomCanvas(factor, event.offsetX, event.offsetY);
    });
    canvas.addEventListener("mousedown", (event) => {
      if (state.drawMode && state.image) {
        const point = canvasToImage(event.offsetX, event.offsetY);
        state.drawStart = { x: point.x, y: point.y };
        state.currentRect = null;
        return;
      }
      state.viewer.dragging = true;
      state.viewer.dragStartX = event.clientX - state.viewer.panX;
      state.viewer.dragStartY = event.clientY - state.viewer.panY;
    });
    canvas.addEventListener("mousemove", (event) => {
      if (state.drawStart) {
        const point = canvasToImage(event.offsetX, event.offsetY);
        state.currentRect = {
          x: Math.min(point.x, state.drawStart.x),
          y: Math.min(point.y, state.drawStart.y),
          width: Math.abs(point.x - state.drawStart.x),
          height: Math.abs(point.y - state.drawStart.y),
        };
        renderViewerCanvas();
        return;
      }
      if (!state.viewer.dragging) {
        return;
      }
      state.viewer.panX = event.clientX - state.viewer.dragStartX;
      state.viewer.panY = event.clientY - state.viewer.dragStartY;
      renderViewerCanvas();
    });
    window.addEventListener("mouseup", () => {
      if (state.drawStart) {
        state.drawStart = null;
        if (state.currentRect && state.currentRect.width > 10 && state.currentRect.height > 10) {
          state.templateRects.push({
            x: state.currentRect.x,
            y: state.currentRect.y,
            width: state.currentRect.width,
            height: state.currentRect.height,
            type: els.drawTypeSelect.value,
          });
          state.currentRect = null;
          render();
        } else {
          state.currentRect = null;
          renderViewerCanvas();
        }
        return;
      }
      state.viewer.dragging = false;
    });
    canvas.addEventListener("click", (event) => {
      if (!state.image || state.drawMode) {
        return;
      }
      const point = canvasToImage(event.offsetX, event.offsetY);
      const component = filteredComponents().find((item) => pointInComponent(point.x, point.y, item));
      if (component) {
        state.selectedComponentId = component.id;
      } else {
        state.selectedComponentId = null;
      }
      render();
    });
  }

  function renderViewerCanvas() {
    const canvas = els.viewerCanvas;
    const width = els.viewerWrap.clientWidth;
    const height = els.viewerWrap.clientHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.cursor = state.drawMode ? "crosshair" : "grab";
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    if (!state.image) {
      return;
    }
    ctx.save();
    ctx.translate(state.viewer.panX, state.viewer.panY);
    ctx.scale(state.viewer.zoom, state.viewer.zoom);
    ctx.drawImage(state.image, 0, 0);
    filteredComponents().forEach((component, index) => drawComponent(ctx, component, index));
    const z = state.viewer.zoom;
    state.templateRects.forEach((r, i) => {
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2 / z;
      ctx.setLineDash([]);
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      ctx.fillStyle = "rgba(37, 99, 235, 0.10)";
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.fillStyle = "#2563eb";
      const lbl = `${i + 1} · ${r.type}`;
      ctx.font = `bold ${12 / z}px Consolas, monospace`;
      const lw = ctx.measureText(lbl).width + 12 / z;
      ctx.fillRect(r.x, r.y - 20 / z, lw, 18 / z);
      ctx.fillStyle = "white";
      ctx.fillText(lbl, r.x + 6 / z, r.y - 6 / z);
    });
    if (state.currentRect) {
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2 / z;
      ctx.setLineDash([8 / z, 4 / z]);
      ctx.strokeRect(state.currentRect.x, state.currentRect.y, state.currentRect.width, state.currentRect.height);
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function drawComponent(ctx, component, index) {
    const image = state.image;
    const box = component.boundingBox;
    const x = (box.x / 100) * image.width;
    const y = (box.y / 100) * image.height;
    const w = (box.width / 100) * image.width;
    const h = (box.height / 100) * image.height;
    const active = component.id === state.selectedComponentId;
    const z = state.viewer.zoom;

    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = (active ? 3 : 2) / z;
    ctx.setLineDash([]);
    if (active) {
      ctx.fillStyle = "rgba(220, 38, 38, 0.12)";
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeRect(x, y, w, h);

    const label = `${index + 1} \u00b7 ${component.name || component.type}`;
    ctx.font = `${12 / z}px Consolas, monospace`;
    const labelWidth = ctx.measureText(label).width + 12 / z;
    const labelHeight = 18 / z;
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x, y - labelHeight - 2 / z, labelWidth, labelHeight);
    ctx.fillStyle = "white";
    ctx.fillText(label, x + 6 / z, y - 6 / z);
  }

  function renderLibraryEntries() {
    const lib = activeLibrary();
    const annotations = lib && !lib.isDefault ? lib.annotations || [] : [];
    els.libraryCountBadge.textContent = `${annotations.length} template${annotations.length !== 1 ? "s" : ""}`;
    if (!annotations.length) {
      els.libraryEntries.innerHTML = `<p class="muted">Bibliothèque vide. Dessinez un rectangle et sauvegardez-le.</p>`;
      return;
    }
    els.libraryEntries.innerHTML = annotations.map((ann, i) => `
      <article class="component-item">
        <header>
          <div>
            <strong>#${i + 1} · ${escapeHtml(ann.correctType)}</strong>
            <p class="muted">x ${ann.boundingBox.x.toFixed(1)}% · y ${ann.boundingBox.y.toFixed(1)}%</p>
          </div>
        </header>
        <button class="danger-outline small" data-delete-annotation="${ann.id}">Supprimer</button>
      </article>
    `).join("");
    els.libraryEntries.querySelectorAll("[data-delete-annotation]").forEach((btn) => {
      btn.addEventListener("click", () => deleteAnnotation(lib.id, btn.dataset.deleteAnnotation));
    });
  }

  function bindDragDrop() {
    ["dragenter", "dragover"].forEach((eventName) => {
      window.addEventListener(eventName, (event) => {
        event.preventDefault();
        els.dragOverlay.classList.remove("hidden");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      window.addEventListener(eventName, (event) => {
        event.preventDefault();
        if (eventName !== "drop") {
          els.dragOverlay.classList.add("hidden");
          return;
        }
        els.dragOverlay.classList.add("hidden");
        const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
        if (!file) {
          return;
        }
        const body = new FormData();
        body.append("file", file);
        fetchJSON("/api/upload", { method: "POST", body })
          .then(() => refreshBootstrap())
          .then(() => toast("Schéma téléversé par glisser-déposer.", "success"))
          .catch((error) => toast(error.message, "error"));
      });
    });
  }

  function zoomCanvas(factor, focusX, focusY) {
    if (!state.image) {
      return;
    }
    const canvas = els.viewerCanvas;
    const targetX = typeof focusX === "number" ? focusX : canvas.width / 2;
    const targetY = typeof focusY === "number" ? focusY : canvas.height / 2;
    const nextZoom = clamp(state.viewer.zoom * factor, 0.25, 6);
    const imageX = (targetX - state.viewer.panX) / state.viewer.zoom;
    const imageY = (targetY - state.viewer.panY) / state.viewer.zoom;
    state.viewer.zoom = nextZoom;
    state.viewer.panX = targetX - imageX * nextZoom;
    state.viewer.panY = targetY - imageY * nextZoom;
    renderViewerCanvas();
  }

  function resetViewerFit() {
    if (!state.image || !els.viewerWrap.clientWidth || !els.viewerWrap.clientHeight) {
      return;
    }
    const scale = Math.min(els.viewerWrap.clientWidth / state.image.width, els.viewerWrap.clientHeight / state.image.height) * 0.94;
    state.viewer.zoom = scale;
    state.viewer.panX = (els.viewerWrap.clientWidth - state.image.width * scale) / 2;
    state.viewer.panY = (els.viewerWrap.clientHeight - state.image.height * scale) / 2;
    renderViewerCanvas();
  }

  function currentSchematic() {
    return state.bootstrap ? state.bootstrap.schematics.find((item) => item.id === state.currentSchematicId) : null;
  }

  function activeLibrary() {
    return state.bootstrap ? state.bootstrap.libraries.find((item) => item.id === state.bootstrap.activeLibraryId) : null;
  }

  function filteredComponents() {
    const schematic = currentSchematic();
    if (!schematic) {
      return [];
    }
    const threshold = Number(els.thresholdRange.value || 85);
    return (schematic.components || []).filter((component) => component.metadata && component.metadata.userAnnotated === "true" ? true : (component.confidence || 0) >= threshold);
  }

  function selectedComponent() {
    return filteredComponents().find((item) => item.id === state.selectedComponentId) || null;
  }

  function canvasToImage(x, y) {
    return {
      x: (x - state.viewer.panX) / state.viewer.zoom,
      y: (y - state.viewer.panY) / state.viewer.zoom,
    };
  }

  function pointInComponent(x, y, component) {
    const box = component.boundingBox;
    const px = (box.x / 100) * state.image.width;
    const py = (box.y / 100) * state.image.height;
    const pw = (box.width / 100) * state.image.width;
    const ph = (box.height / 100) * state.image.height;
    return x >= px && x <= px + pw && y >= py && y <= py + ph;
  }

  function percentToCanvasBox(box, width, height) {
    return {
      x: (box.x / 100) * width,
      y: (box.y / 100) * height,
      width: (box.width / 100) * width,
      height: (box.height / 100) * height,
    };
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Impossible de charger l'image"));
      image.src = src;
    });
  }

  function colorForType(type) {
    const colors = {
      breaker: "#b42318",
      transformer: "#2563eb",
      "bus-bar": "#c0841a",
      switch: "#4f46e5",
      fuse: "#dc2626",
      relay: "#10b981",
      meter: "#0891b2",
      capacitor: "#7c3aed",
      inductor: "#8b5cf6",
      generator: "#ca8a04",
      motor: "#0f766e",
      load: "#475569",
      unknown: "#6b7280",
    };
    return colors[type] || colors.unknown;
  }

  function alpha(hex, value) {
    const normalized = hex.replace("#", "");
    const chunks = normalized.length === 3 ? normalized.split("").map((part) => part + part) : [normalized.slice(0, 2), normalized.slice(2, 4), normalized.slice(4, 6)];
    const [r, g, b] = chunks.map((part) => parseInt(part, 16));
    return `rgba(${r}, ${g}, ${b}, ${value})`;
  }

  function toast(message, type) {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.textContent = message;
    els.toastRegion.appendChild(node);
    window.setTimeout(() => node.remove(), 3200);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function arraysEqual(first, second) {
    if (first.length !== second.length) {
      return false;
    }
    return first.every((item, index) => item === second[index]);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  init();
})();
