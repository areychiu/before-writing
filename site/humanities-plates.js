const viewer = document.querySelector('#photo');
const viewerFrame = viewer.querySelector('.photo-viewer-image');
const viewerImage = viewerFrame.querySelector('img');
const zoom = viewer.querySelector('#photo-zoom');
const viewerDescription = viewer.querySelector('#photo-description');
let opener;
let readingPosition;
let detailCenter = { x: 0.5, y: 0.5 };

function resetMagnification() {
  delete viewerFrame.dataset.zoomed;
  viewerFrame.scrollTo(0, 0);
  zoom.textContent = '放大看細節';
  zoom.setAttribute('aria-pressed', 'false');
}

function showPlate(image, trigger) {
  if (viewer.open) return;
  readingPosition = {x: window.scrollX, y: window.scrollY};
  opener = trigger;
  const bounds = image.getBoundingClientRect();
  const cue = image.closest('figure').querySelector('.plate-cue');
  detailCenter = { x: 0.5, y: 0.5 };
  if (cue && bounds.width && bounds.height) {
    const frame = cue.getBoundingClientRect();
    detailCenter = {
      x: (frame.left + frame.width / 2 - bounds.left) / bounds.width,
      y: (frame.top + frame.height / 2 - bounds.top) / bounds.height,
    };
  }
  viewerImage.src = trigger.dataset.fullImage || image.currentSrc || image.src;
  viewerImage.alt = image.alt;
  viewerDescription.textContent = image.alt;
  resetMagnification();
  viewer.showModal();
  viewer.querySelector('#close').focus();
}

zoom.addEventListener('click', () => {
  if (viewerFrame.hasAttribute('data-zoomed')) {
    resetMagnification();
    zoom.focus();
    return;
  }
  viewerFrame.dataset.zoomed = '';
  zoom.textContent = '返回全圖';
  zoom.setAttribute('aria-pressed', 'true');
  viewerFrame.focus({ preventScroll: true });
  viewerFrame.scrollTo(
    viewerImage.clientWidth * detailCenter.x - viewerFrame.clientWidth / 2,
    viewerImage.clientHeight * detailCenter.y - viewerFrame.clientHeight / 2,
  );
});
viewer.querySelector('#close').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => {
  opener?.focus({preventScroll: true});
  if (readingPosition) window.scrollTo(readingPosition.x, readingPosition.y);
});

for (const image of document.querySelectorAll('main figure img, .journey-extension .opening figure img')) {
  if (image.closest('.plate-detail')) continue;
  const figure = image.closest('figure');
  const links = figure.querySelectorAll('[data-plate-open]');
  if (links.length) {
    for (const link of links) {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        showPlate(image, link);
      });
    }
    continue;
  }
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `放大照片：${image.alt}`);
  image.addEventListener('click', () => showPlate(image, image));
  image.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    showPlate(image, image);
  });
}

// Entry images can open the same viewer while their captions retain chapter links.
for (const link of document.querySelectorAll('[data-entry-plate-open]')) {
  const image = link.querySelector('img');
  if (!image) continue;
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showPlate(image, link);
  });
}

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-reading');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.3 });
  document.querySelectorAll('.photo-plate').forEach(figure => observer.observe(figure));
}
