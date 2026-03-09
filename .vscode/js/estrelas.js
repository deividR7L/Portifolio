(function initStarsBackground() {
  const canvas = document.getElementById('stars-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0;
  let h = 0;
  let frameId = null;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }

  resize();
  window.addEventListener('resize', resize);

  const fixedStars = Array.from({ length: reduceMotion ? 45 : 80 }, function () {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.5,
      alpha: 0.5 + Math.random() * 0.5,
      twinkle: Math.random() * 0.05 + 0.01,
    };
  });

  function drawFixedStar(star) {
    ctx.save();
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }

  function updateFixedStar(star) {
    star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
    if (star.alpha > 1) star.alpha = 1;
    if (star.alpha < 0.3) star.alpha = 0.3;
  }

  function randomMeteor() {
    return {
      x: Math.random() * w,
      y: Math.random() * h * 0.5,
      len: 120 + Math.random() * 80,
      speed: 6 + Math.random() * 6,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.7 + Math.random() * 0.3,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.1,
      tail: [],
    };
  }

  const meteors = reduceMotion ? [] : Array.from({ length: 6 }, randomMeteor);

  function drawMeteor(meteor) {
    for (let i = 0; i < meteor.tail.length; i += 1) {
      const tailPoint = meteor.tail[i];
      ctx.save();
      ctx.globalAlpha = tailPoint.alpha * 0.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = meteor.size * (1 - i / meteor.tail.length);
      ctx.beginPath();
      ctx.moveTo(tailPoint.x, tailPoint.y);
      ctx.lineTo(
        tailPoint.x + Math.cos(meteor.angle) * meteor.len,
        tailPoint.y + Math.sin(meteor.angle) * meteor.len
      );
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = meteor.alpha;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = meteor.size;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(meteor.x, meteor.y);
    ctx.lineTo(
      meteor.x + Math.cos(meteor.angle) * meteor.len,
      meteor.y + Math.sin(meteor.angle) * meteor.len
    );
    ctx.stroke();
    ctx.restore();
  }

  function updateMeteor(meteor) {
    meteor.x += Math.cos(meteor.angle) * meteor.speed;
    meteor.y += Math.sin(meteor.angle) * meteor.speed;
    meteor.tail.unshift({ x: meteor.x, y: meteor.y, alpha: meteor.alpha });
    if (meteor.tail.length > 20) meteor.tail.pop();

    if (meteor.x > w || meteor.y > h) {
      Object.assign(meteor, randomMeteor());
      meteor.x = Math.random() * w;
      meteor.y = -20;
      meteor.tail = [];
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, w, h);

    for (const star of fixedStars) {
      drawFixedStar(star);
      if (!reduceMotion) {
        updateFixedStar(star);
      }
    }

    for (const meteor of meteors) {
      drawMeteor(meteor);
      updateMeteor(meteor);
    }
  }

  function animate() {
    drawFrame();
    frameId = window.requestAnimationFrame(animate);
  }

  if (reduceMotion) {
    drawFrame();
    return;
  }

  animate();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
      return;
    }

    if (!frameId) {
      animate();
    }
  });
})();
