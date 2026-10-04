document.addEventListener('DOMContentLoaded', () => {
  // Add class to boxes in sections 2, 3 and 4
  const selectors = ['#page-originals label', '#page-anime label', '#page-golds label'];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(lbl => lbl.classList.add('modal-de-contenido'));
  });

  // Click handler: lazy-load modal HTML from /modals/modal-<id>.html
  document.addEventListener('click', async (e) => {
    const label = e.target.closest('label.modal-de-contenido');
    if (!label) return;
    e.preventDefault();

    // Extract numeric id from alt attribute, fallback to filename if needed
    const img = label.querySelector('img');
    if (!img) return;
    
    let id;
    const alt = img.getAttribute('alt') || '';
    const altMatch = alt.match(/(\d+)/);
    if (altMatch) {
      id = altMatch[1];
    } else {
      const src = img.getAttribute('src') || '';
      const m = src.match(/(\d+)\.[a-zA-Z]{2,4}$/);
      if (!m) return;
      id = m[1];
    }
    const modalId = 'modal-' + id;

    // If already injected, open it
    let existing = document.getElementById(modalId);
    if (existing) {
      existing.classList.add('open');
      existing.setAttribute('aria-hidden', 'false');
      return;
    }

    // Fetch modal file
    try {
      const res = await fetch(`modals/${modalId}.html`);
      if (!res.ok) throw new Error('No encontrado: ' + res.status);
      const html = await res.text();
      const container = document.getElementById('external-modals') || document.body;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html.trim();
      // Ensure modal has id
      const modalEl = wrapper.firstElementChild;
      if (!modalEl) return;
      modalEl.id = modalId;
      modalEl.classList.add('modal-overlay');
      container.appendChild(modalEl);

      // Small delay to allow CSS transitions
      requestAnimationFrame(() => {
        modalEl.classList.add('open');
        modalEl.setAttribute('aria-hidden', 'false');
      });

      // Close handlers (overlay click or .modal-close)
      modalEl.addEventListener('click', (evt) => {
        if (evt.target === modalEl || evt.target.closest('.modal-close')) {
          modalEl.classList.remove('open');
          modalEl.setAttribute('aria-hidden', 'true');
        }
      });

    } catch (err) {
      console.error('Error cargando modal', err);
    }
  });
});
