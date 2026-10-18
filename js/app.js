
function setupRing() {
  if (cleanupRing) {
    cleanupRing();
    cleanupRing = null;
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  const scene = document.querySelector('.ring-scene');
  const ring = scene && scene.querySelector('.archive-ring');

  if (!scene || !ring) return;

  const cards = Array.from(ring.children);
  const count = cards.length;

  if (!count) return;

  let rotation = 0;
  let targetRotation = 0;
  let velocity = 0;
  let dragging = false;
  let moved = false;
  let startX = 0;
  let lastX = 0;
  let pointerId = null;
  let lastMouseX = null;
  let suppressClick = false;
  let suppressTimer = null;
  let destroyed = false;

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw() {
    ring.style.transform =
      'rotateX(-7deg) rotateY(' + rotation + 'deg)';

    cards.forEach(function (card, index) {
      const angle =
        (index * 360 / count + rotation) * Math.PI / 180;

      card.style.zIndex = String(
        Math.round((Math.cos(angle) + 1) * 1000)
      );
    });
  }

  function arrange() {
    const mobile = window.innerWidth <= 560;
    const cardWidth = mobile ? 132 : 170;

    let radius;

    if (count === 1) {
      radius = 0;
    } else if (count === 2) {
      radius = cardWidth * 0.58;
    } else {
      const naturalRadius =
        cardWidth / (2 * Math.tan(Math.PI / count));

      const minimumRadius = mobile ? 105 : 130;
      const maximumRadius = mobile ? 220 : 260;

      radius = Math.max(
        minimumRadius,
        Math.min(maximumRadius, naturalRadius * 0.58)
      );
    }

    cards.forEach(function (card, index) {
      card.style.transform =
        'translate(-50%, -50%) rotateY(' +
        (index * 360 / count) +
        'deg) translateZ(' + radius + 'px)';
    });

    draw();
  }

  function animate() {
    if (destroyed) return;

    if (reduceMotion) {
      rotation = targetRotation;
      velocity = 0;
      draw();
      return;
    }

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(tick);
    }
  }

  function tick() {
    animationFrame = 0;

    if (destroyed) return;

    const difference = targetRotation - rotation;

    velocity += difference * 0.075;
    velocity *= 0.78;
    rotation += velocity;

    if (
      Math.abs(difference) < 0.025 &&
      Math.abs(velocity) < 0.025
    ) {
      rotation = targetRotation;
      velocity = 0;
      draw();
      return;
    }

    draw();
    animationFrame = requestAnimationFrame(tick);
  }

  function onPointerMove(event) {
    if (event.pointerType === 'mouse') {
      if (dragging || window.innerWidth <= 560) return;

      if (lastMouseX === null) {
        lastMouseX = event.clientX;
        return;
      }

      const delta = event.clientX - lastMouseX;
      lastMouseX = event.clientX;

      if (Math.abs(delta) < 90) {
        targetRotation += delta * 0.42;
        animate();
      }

      return;
    }

    if (!dragging || event.pointerId !== pointerId) return;

    const delta = event.clientX - lastX;

    if (Math.abs(event.clientX - startX) > 6) {
      moved = true;
    }

    if (moved) {
      targetRotation += delta * 0.5;
      animate();
    }

    lastX = event.clientX;
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse') return;
    if (event.button !== undefined && event.button !== 0) return;

    dragging = true;
    moved = false;
    startX = lastX = event.clientX;
    pointerId = event.pointerId;

    scene.classList.add('is-dragging');

    if (scene.setPointerCapture) {
      try {
        scene.setPointerCapture(pointerId);
      } catch (error) {}
    }
  }

  function onPointerUp(event) {
    if (!dragging) return;

    if (event.pointerId != null && event.pointerId !== pointerId) {
      return;
    }

    dragging = false;
    scene.classList.remove('is-dragging');

    if (moved) {
      suppressClick = true;
      clearTimeout(suppressTimer);

      suppressTimer = setTimeout(function () {
        suppressClick = false;
        suppressTimer = null;
      }, 250);
    }

    pointerId = null;
    lastMouseX = null;
  }

  function onClick(event) {
    const card = event.target.closest &&
      event.target.closest('a.ring-card');

    if (!card || !suppressClick) return;

    event.preventDefault();
    event.stopPropagation();

    suppressClick = false;
    clearTimeout(suppressTimer);
    suppressTimer = null;
  }

  function onPointerLeave() {
    lastMouseX = null;
  }

  function onResize() {
    lastMouseX = null;
    arrange();
  }

  scene.addEventListener('pointermove', onPointerMove);
  scene.addEventListener('pointerleave', onPointerLeave);
  scene.addEventListener('pointerdown', onPointerDown);
  scene.addEventListener('pointerup', onPointerUp);
  scene.addEventListener('pointercancel', onPointerUp);
  scene.addEventListener('click', onClick, true);
  window.addEventListener('resize', onResize);

  arrange();

  cleanupRing = function () {
    destroyed = true;

    scene.removeEventListener('pointermove', onPointerMove);
    scene.removeEventListener('pointerleave', onPointerLeave);
    scene.removeEventListener('pointerdown', onPointerDown);
    scene.removeEventListener('pointerup', onPointerUp);
    scene.removeEventListener('pointercancel', onPointerUp);
    scene.removeEventListener('click', onClick, true);
    window.removeEventListener('resize', onResize);

    clearTimeout(suppressTimer);

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  };
}
