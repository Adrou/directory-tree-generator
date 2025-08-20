// Unified app.js with simple i18n (en/es)
(function(){
  const LANG = (window.APP_LANG || document.documentElement.lang || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';

  const I18N = {
    en: {
      selected_prefix: 'Selected: ',
      none: '(none)',
      root: '(root)',
      folder: 'folder',
      file: 'file',
      expand_collapse: 'Expand/Collapse',
      item: 'Item',
      drag_to_move: 'Drag to move',
      add_subfolder: '↳ Subfolder',
      add_subfolder_title: 'Add subfolder',
      add_file: '📄 File',
      add_file_title: 'Add file',
      delete: '🗑️',
      delete_title: 'Delete',
      alert_select_delete: 'Select an item to delete.',
      root_drop_text: 'Drag & drop here to move to TOP-LEVEL',
      example_root1: 'Root1',
      example_d2: 'D2',
      example_downloads: 'Downloads',
      example_d1: 'D1',
      example_photos: 'Photos',
      example_documents: 'Documents',
      example_readme: 'readme.txt',
      example_note: 'note.txt',
      example_example: 'example.txt',
      example_photo1: 'photo1.jpg',
      example_photo2: 'photo2.jpg',
      new_folder: 'new_folder',
      new_subfolder: 'subfolder',
      new_file: 'new_file.txt',
      emoji_placeholder: '😀'
    },
    es: {
      selected_prefix: 'Seleccionado: ',
      none: '(ninguno)',
      root: '(raíz)',
      folder: 'carpeta',
      file: 'archivo',
      expand_collapse: 'Expandir/contraer',
      item: 'Elemento',
      drag_to_move: 'Arrastrar para mover',
      add_subfolder: '↳ Subcarpeta',
      add_subfolder_title: 'Agregar subcarpeta',
      add_file: '📄 Archivo',
      add_file_title: 'Agregar archivo',
      delete: '🗑️',
      delete_title: 'Eliminar',
      alert_select_delete: 'Selecciona un elemento para eliminar.',
      root_drop_text: 'Arrastra y suelta aquí para mover a PRINCIPAL',
      example_root1: 'Raiz1',
      example_d2: 'D2',
      example_downloads: 'Descargas',
      example_d1: 'D1',
      example_photos: 'Fotos',
      example_documents: 'Documentos',
      example_readme: 'nuevo_archivo.txt',
      example_note: 'nota.txt',
      example_example: 'ejemplo.txt',
      example_photo1: 'foto1.jpg',
      example_photo2: 'foto2.jpg',
      new_folder: 'nueva_carpeta',
      new_subfolder: 'subcarpeta',
      new_file: 'nuevo_archivo.txt',
      emoji_placeholder: '😀'
    }
  };
  const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;

  // Virtual root (not rendered; holds top-level items)
  let tree = {
    id: idgen(),
    type: 'folder',
    name: '(virtual-root)',
    emoji: '',
    collapsed: false,
    children: []
  };
  let selectedId = tree.id;

  // Utils
  function idgen(){ return 'n_' + Math.random().toString(36).slice(2,9); }
  function findNodeAndParent(id, node = tree, parent = null) {
    if (node.id === id) return { node, parent };
    if (node.type === 'folder' && node.children) {
      for (const ch of node.children) {
        const res = findNodeAndParent(id, ch, node);
        if (res) return res;
      }
    }
    return null;
  }
  function forEachNode(fn, node = tree) {
    fn(node);
    if (node.type === 'folder' && node.children) node.children.forEach(c => forEachNode(fn, c));
  }
  function collapseAll(v){ forEachNode(n => { if (n.type==='folder') n.collapsed = v; }); render(); }

  // Render
  const treeContainer = document.getElementById('treeContainer');
  const selectedInfo = document.getElementById('selectedInfo');

  function render() {
    treeContainer.innerHTML = '';
    const topList = document.createElement('div');
    topList.className = 'children';
    // Allow dropping here to move at top-level
    topList.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
    topList.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const draggedId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/x-node-id');
      if (!draggedId) return;
      const from = findNodeAndParent(draggedId);
      if (!from || from.node.id === tree.id) return;
      removeFromParent(from.node, from.parent);
      tree.children = tree.children || [];
      tree.children.push(from.node);
      render();
    });

    (tree.children || []).forEach(ch => topList.appendChild(renderItem(ch)));
    treeContainer.appendChild(topList);

    const sel = findNodeAndParent(selectedId);
    selectedInfo.textContent = t('selected_prefix') + (sel ? describe(sel.node) : t('none'));
    regenerateOutput();
  }

  function describe(n){
    return `${n.emoji || ''} ${n.name} — ${n.type==='folder' ? (LANG==='es'? 'Carpeta':'Folder') : (LANG==='es'? 'Archivo':'File')}`;
  }

  function renderItem(node) {
    const wrapper = document.createElement('div');
    wrapper.className = 'item';
    wrapper.dataset.id = node.id;

    // Selection on wrapper click (ignore inputs/buttons)
    wrapper.addEventListener('click', (e) => {
      if (e.target.closest('input,select,button,textarea')) return;
      selectedId = node.id;
      render();
    });

    // Drag start allowed from header/handle, not from inputs
    wrapper.draggable = true;
    wrapper.addEventListener('dragstart', (e) => {
      const isFromInput = !!e.target.closest('input,select,textarea');
      const isFromButton = !!e.target.closest('button');
      const isFromHandle = !!e.target.closest('.drag-handle');
      const isFromHeader = !!e.target.closest('.item-header');
      if (isFromInput || (isFromButton && !isFromHandle) || !isFromHeader) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', node.id);
      try { e.dataTransfer.setData('application/x-node-id', node.id); } catch {}
      setTimeout(() => wrapper.classList.add('drag-ghost'), 0);
    });
    wrapper.addEventListener('dragend', () => {
      wrapper.classList.remove('drag-ghost');
      wrapper.classList.remove('drop-target','insert-before','insert-after');
    });

    // Header
    const header = document.createElement('div');
    header.className = 'item-header';

    // Toggle
    const toggle = document.createElement('button');
    toggle.className = 'btn btn-sm btn-outline-light toggle-btn';
    toggle.textContent = node.type === 'folder' ? (node.collapsed ? '▶' : '▼') : '•';
    toggle.title = node.type === 'folder' ? t('expand_collapse') : t('item');
    toggle.disabled = node.type !== 'folder';
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (node.type === 'folder') {
        node.collapsed = !node.collapsed;
        render();
      }
    });

    // Type badge
    const badge = document.createElement('span');
    badge.className = 'badge type-badge';
    badge.textContent = node.type === 'folder' ? t('folder') : t('file');

    // Emoji
    const emoji = document.createElement('input');
    emoji.className = 'form-control form-control-sm emoji-input monospace';
    emoji.placeholder = t('emoji_placeholder');
    emoji.value = node.emoji || '';
    emoji.addEventListener('focus', () => { selectedId = node.id; selectedInfo.textContent = t('selected_prefix') + describe(node); });
    emoji.addEventListener('input', () => {
      node.emoji = emoji.value;
      regenerateOutput();
    });

    // Name
    const name = document.createElement('input');
    name.className = 'name-input monospace';
    name.value = node.name;
    name.addEventListener('focus', () => { selectedId = node.id; selectedInfo.textContent = t('selected_prefix') + describe(node); });
    name.addEventListener('input', () => {
      node.name = name.value || (node.type === 'folder' ? t('folder') : t('file'));
      regenerateOutput();
    });

    // Drag handle
    const dragHandle = document.createElement('button');
    dragHandle.className = 'btn btn-sm btn-outline-light drag-handle';
    dragHandle.title = t('drag_to_move');
    dragHandle.textContent = '⇕';
    dragHandle.draggable = true;
    dragHandle.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', node.id);
      try { e.dataTransfer.setData('application/x-node-id', node.id); } catch {}
      requestAnimationFrame(() => wrapper.classList.add('drag-ghost'));
    });
    dragHandle.addEventListener('dragend', (e) => {
      e.stopPropagation();
      wrapper.classList.remove('drag-ghost');
      wrapper.classList.remove('drop-target','insert-before','insert-after');
    });

    // Quick controls
    const controls = document.createElement('div');
    controls.className = 'controls';
    if (node.type === 'folder') {
      const addSub = document.createElement('button');
      addSub.className = 'btn btn-soft btn-sm';
      addSub.textContent = t('add_subfolder');
      addSub.title = t('add_subfolder_title');
      addSub.addEventListener('click', (e) => {
        e.stopPropagation();
        node.children.push({
          id: idgen(), type: 'folder', name: t('new_subfolder'), emoji: '📂', collapsed: false, children: []
        });
        node.collapsed = false;
        render();
      });
      const addFile = document.createElement('button');
      addFile.className = 'btn btn-soft btn-sm';
      addFile.textContent = t('add_file');
      addFile.title = t('add_file_title');
      addFile.addEventListener('click', (e) => {
        e.stopPropagation();
        node.children.push({ id: idgen(), type: 'file', name: t('new_file'), emoji: '📄' });
        node.collapsed = false;
        render();
      });
      controls.appendChild(addSub);
      controls.appendChild(addFile);
    }

    // Delete
    const del = document.createElement('button');
    del.className = 'btn btn-outline-danger btn-sm';
    del.textContent = t('delete');
    del.title = t('delete_title');
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      const fp = findNodeAndParent(node.id);
      if (!fp) return;
      if (!fp.parent) return;
      const i = fp.parent.children.findIndex(c => c.id === node.id);
      if (i >= 0) fp.parent.children.splice(i,1);
      selectedId = fp.parent.id || tree.id;
      render();
    });

    header.appendChild(toggle);
    header.appendChild(badge);
    header.appendChild(emoji);
    header.appendChild(name);
    header.appendChild(dragHandle);
    header.appendChild(controls);
    header.appendChild(del);

    // DnD handlers (wrapper and children delegate to same handlers)
    const onDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const host = wrapper;
      const rect = host.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const h = rect.height;
      const before = offsetY < h * 0.25;
      const after  = offsetY > h * 0.75;
      host.classList.add('drop-target');
      host.classList.toggle('insert-before', before);
      host.classList.toggle('insert-after', after);
    };

    const onDragLeave = (e) => {
      e.stopPropagation();
      const host = wrapper;
      host.classList.remove('drop-target','insert-before','insert-after');
    };

    const onDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const host = wrapper;
      host.classList.remove('drop-target','insert-before','insert-after');

      const draggedId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/x-node-id');
      if (!draggedId || draggedId === node.id) return;

      const from = findNodeAndParent(draggedId);
      if (!from) return;

      // Prevent dropping a node into its own descendant
      if (isAncestorOf(draggedId, node.id)) return;

      // Compute drop zone
      const rect = host.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const h = rect.height;
      const before = offsetY < h * 0.25;
      const after  = offsetY > h * 0.75;
      const middle = !before && !after;

      if (middle && node.type === 'folder') {
        if (!node.children) node.children = [];
        removeFromParent(from.node, from.parent);
        node.children.push(from.node);
        node.collapsed = false;
        render();
        return;
      }

      // Reorder relative to target in the same parent (or virtual root for top-level)
      const toInfo = findNodeAndParent(node.id);
      const toParent = toInfo.parent || tree;
      removeFromParent(from.node, from.parent);
      const idx = toParent.children.findIndex(c => c.id === node.id);
      const insertIndex = before ? idx : (after ? idx + 1 : idx);
      toParent.children.splice(insertIndex, 0, from.node);
      render();
    };

    // Apply DnD handlers
    wrapper.addEventListener('dragover', onDragOver);
    wrapper.addEventListener('dragleave', onDragLeave);
    wrapper.addEventListener('drop', onDrop);

    // Also delegate from the header and inputs so dropping "over the name" works
    header.addEventListener('dragover', onDragOver);
    header.addEventListener('dragleave', onDragLeave);
    header.addEventListener('drop', onDrop);

    emoji.addEventListener('dragover', onDragOver);
    emoji.addEventListener('dragleave', onDragLeave);
    emoji.addEventListener('drop', onDrop);

    name.addEventListener('dragover', onDragOver);
    name.addEventListener('dragleave', onDragLeave);
    name.addEventListener('drop', onDrop);

    wrapper.appendChild(header);

    // Children
    if (node.type === 'folder' && node.children && !node.collapsed) {
      const children = document.createElement('div');
      children.className = 'children';
      children.addEventListener('dragover', onDragOver);
      children.addEventListener('dragleave', onDragLeave);
      children.addEventListener('drop', onDrop);
      node.children.forEach(ch => children.appendChild(renderItem(ch)));
      wrapper.appendChild(children);
    }

    return wrapper;
  }

  function isAncestorOf(ancestorId, nodeId){
    const f = findNodeAndParent(nodeId);
    if (!f) return false;
    let cur = f.parent;
    while (cur) {
      if (cur.id === ancestorId) return true;
      const up = findNodeAndParent(cur.id);
      cur = up ? up.parent : null;
    }
    return false;
  }

  function removeFromParent(node, parent){
    if (!parent || !parent.children) return;
    const i = parent.children.findIndex(c => c.id === node.id);
    if (i >= 0) parent.children.splice(i,1);
  }

  // Top buttons: ALWAYS create at top-level (virtual root)
  document.getElementById('btnAddFolder')?.addEventListener('click', () => {
    tree.children = tree.children || [];
    tree.children.push({ id: idgen(), type: 'folder', name: t('new_folder'), emoji: '📂', collapsed: false, children: [] });
    render();
  });
  document.getElementById('btnAddSubfolder')?.addEventListener('click', () => {
    tree.children = tree.children || [];
    tree.children.push({ id: idgen(), type: 'folder', name: t('new_subfolder'), emoji: '📂', collapsed: false, children: [] });
    render();
  });
  document.getElementById('btnAddFile')?.addEventListener('click', () => {
    tree.children = tree.children || [];
    tree.children.push({ id: idgen(), type: 'file', name: t('new_file'), emoji: '📄' });
    render();
  });

  document.getElementById('btnDelete')?.addEventListener('click', () => {
    if (selectedId === tree.id) return alert(t('alert_select_delete'));
    const fp = findNodeAndParent(selectedId);
    if (!fp) return;
    removeFromParent(fp.node, fp.parent || tree);
    selectedId = fp.parent?.id || tree.id;
    render();
  });
  document.getElementById('btnExpandAll')?.addEventListener('click', () => collapseAll(false));
  document.getElementById('btnCollapseAll')?.addEventListener('click', () => collapseAll(true));

  document.getElementById('btnSetEmoji')?.addEventListener('click', () => {
    const sel = findNodeAndParent(selectedId)?.node;
    if (!sel) return;
    const quick = document.getElementById('quickEmoji').value;
    if (!quick) return;
    sel.emoji = quick;
    render();
  });

  document.getElementById('btnCopy')?.addEventListener('click', async () => {
    const ta = document.getElementById('output');
    ta.select();
    try { await navigator.clipboard.writeText(ta.value); }
    catch { document.execCommand('copy'); }
  });

  document.getElementById('btnRegenerate')?.addEventListener('click', regenerateOutput);
  document.getElementById('showEmojis')?.addEventListener('change', regenerateOutput);
  document.getElementById('btnClear')?.addEventListener('click', () => {
    if (!confirm(LANG==='es' ? '¿Limpiar todo y empezar desde cero?' : 'Clear everything and start over?')) return;
    tree = { id: idgen(), type: 'folder', name: '(virtual-root)', emoji: '', collapsed: false, children: [] };
    selectedId = tree.id;
    render();
  });

  document.getElementById('btnExample')?.addEventListener('click', () => {
    tree = {
      id: idgen(),
      type: 'folder',
      name: '(virtual-root)',
      emoji: '',
      collapsed: false,
      children: [
        { id: idgen(), type: 'folder', name: t('example_root1'), emoji: '📂', collapsed: false, children: [
            { id: idgen(), type: 'file', name: t('example_readme'), emoji: '📄' },
            { id: idgen(), type: 'folder', name: t('example_d2'), emoji: '📂', collapsed: false, children: [
                { id: idgen(), type: 'file', name: t('example_note'), emoji: '📄' },
            ]},
            { id: idgen(), type: 'folder', name: t('example_downloads'), emoji: '📂', collapsed: false, children: [
                { id: idgen(), type: 'folder', name: t('example_d1'), emoji: '📂', collapsed: false, children: [
                    { id: idgen(), type: 'file', name: t('example_example'), emoji: '📄' },
                ]},
            ]},
            { id: idgen(), type: 'folder', name: t('example_photos'), emoji: '📂', collapsed: false, children: [
                { id: idgen(), type: 'file', name: t('example_photo2'), emoji: '🖼️' },
                { id: idgen(), type: 'file', name: t('example_photo1'), emoji: '🖼️' },
            ]},
            { id: idgen(), type: 'folder', name: t('example_documents'), emoji: '📂', collapsed: false, children: [] },
        ]},
        // Add another top-level folder with the 📂 button
      ]
    };
    selectedId = tree.id;
    render();
  });

  // Output as tree text: each top-level printed like a root
  function generateTreeText(showEmojis = true) {
    const lines = [];
    function printRoot(n) {
      let label = n.name;
      if (n.type === 'folder' && !label.endsWith('/')) label += '/';
      label = showEmojis ? `${n.emoji ? n.emoji + ' ' : ''}${label}` : label;
      lines.push(label);
    }
    function walk(node, prefix = '', isLast = true) {
      const tee = isLast ? '└── ' : '├── ';
      let label = node.name;
      if (node.type === 'folder' && !label.endsWith('/')) label += '/';
      label = showEmojis ? `${node.emoji ? node.emoji + ' ' : ''}${label}` : label;
      lines.push(prefix + tee + label);
      if (node.type === 'folder' && node.children && node.children.length) {
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        node.children.forEach((child, idx) => {
          const last = idx === node.children.length - 1;
          walk(child, nextPrefix, last);
        });
      }
    }
    const roots = tree.children || [];
    roots.forEach((r) => {
      printRoot(r);
      if (r.type === 'folder' && r.children && r.children.length) {
        r.children.forEach((child, cidx) => {
          const last = cidx === r.children.length - 1;
          walk(child, '', last);
        });
      }
    });
    return lines.join('\n');
  }

  function regenerateOutput(){
    const show = document.getElementById('showEmojis').checked;

    // Explicit zone to move to TOP-LEVEL
    const rootDrop = document.getElementById('rootDropZone');
    if (rootDrop) {
      rootDrop.style.display = 'block';
      rootDrop.textContent = t('root_drop_text');
      rootDrop.onDragOverHandler ||= ((e) => { e.preventDefault(); e.stopPropagation(); rootDrop.classList.add('drop-target'); });
      rootDrop.onDragLeaveHandler ||= ((e) => { e.stopPropagation(); rootDrop.classList.remove('drop-target'); });
      rootDrop.onDropHandler ||= ((e) => {
        e.preventDefault();
        e.stopPropagation();
        rootDrop.classList.remove('drop-target');
        const draggedId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/x-node-id');
        if (!draggedId) return;
        const from = findNodeAndParent(draggedId);
        if (!from || from.node.id === tree.id) return;
        removeFromParent(from.node, from.parent);
        tree.children = tree.children || [];
        tree.children.push(from.node);
        render();
      });
      rootDrop.addEventListener('dragover', rootDrop.onDragOverHandler);
      rootDrop.addEventListener('dragleave', rootDrop.onDragLeaveHandler);
      rootDrop.addEventListener('drop', rootDrop.onDropHandler);
    }

    const out = document.getElementById('output');
    if (out) out.value = generateTreeText(show);
  }

  // Init
  render();
})();