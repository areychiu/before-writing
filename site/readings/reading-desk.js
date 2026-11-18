(() => {
  const openHash = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    const guide = target.matches('.guide') ? target : target.closest('.guide');
    if (guide) {
      guide.open = true;
      requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
    }
  };
  window.addEventListener('hashchange', openHash);
  openHash();
  document.querySelectorAll('[data-close-guide]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const guide = document.getElementById(button.dataset.closeGuide);
      if (!guide) return;
      guide.open = false;
      const summary = guide.querySelector(':scope > summary');
      summary.focus({preventScroll: true});
      summary.scrollIntoView({block: 'start'});
      history.replaceState(null, '', '#guides');
    });
  });
  const dialog = document.getElementById('poster-dialog');
  const opener = document.querySelector('[data-open-poster]');
  if (dialog && opener) {
    const image = dialog.querySelector('.poster-scroll img');
    const title = dialog.querySelector('#poster-dialog-title');
    const poster = {src: image.getAttribute('src'), alt: image.alt, width: image.width, height: image.height, title: title.textContent};
    let activeOpener;
    const showImage = (source, trigger) => {
      activeOpener = trigger;
      image.src = source.src;
      image.alt = source.alt;
      image.width = source.width;
      image.height = source.height;
      title.textContent = source.title;
      dialog.style.setProperty('--reading-image-width', `${source.width}px`);
      const scroll = dialog.querySelector('.poster-scroll');
      scroll.scrollTop = 0;
      scroll.scrollLeft = 0;
      dialog.showModal();
    };
    opener.hidden = false;
    opener.addEventListener('click', () => showImage(poster, opener));
    document.querySelectorAll('[data-open-reading-image]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const figureImage = link.closest('figure').querySelector('img');
        showImage({src: link.href, alt: figureImage.alt, width: Number(link.dataset.imageWidth), height: Number(link.dataset.imageHeight), title: link.dataset.imageTitle}, link);
      });
    });
    dialog.querySelector('[data-close-poster]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => activeOpener?.focus({preventScroll: true}));
  }
})();
