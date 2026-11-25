/* Lokale Canvas-Wortwolke für Offlinebetrieb; keine CDN-Abhängigkeiten. */
(function (global) {
  'use strict';
  const COLORS = ['#8294ff', '#85e3af', '#efd18b', '#a3eaff', '#c3b6ff', '#ff9ca9'];

  function hashWord(word) {
    let hash = 2166136261;
    for (let i = 0; i < word.length; i++) {
      hash ^= word.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function intersects(box, boxes) {
    return boxes.some(other =>
      box.x < other.x + other.w && box.x + box.w > other.x &&
      box.y < other.y + other.h && box.y + box.h > other.y
    );
  }

  function WordCloud(target, options) {
    if (!target || !options || !Array.isArray(options.list)) return;
    let canvas = target.querySelector('canvas.wordcloud-canvas');
    if (!canvas) {
      target.replaceChildren();
      canvas = document.createElement('canvas');
      canvas.className = 'wordcloud-canvas';
      canvas.setAttribute('aria-label', 'Wortwolke der häufigsten Begriffe');
      canvas.setAttribute('role', 'img');
      canvas.style.cssText = 'display:block;width:100%;height:100%;border-radius:inherit;';
      target.appendChild(canvas);
    }

    const width = Math.max(1, target.clientWidth);
    const height = Math.max(1, target.clientHeight);
    const dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Maximal 65 Begriffe rendern; Textstatistiken und Top-Wörter bleiben unverändert.
    const entries = options.list
      .filter(item => Array.isArray(item) && typeof item[0] === 'string' && Number(item[1]) > 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 65);
    const placed = [];
    const density = Math.max(0.56, Math.min(1, width / 520));
    const font = options.fontFamily || 'Segoe UI, sans-serif';

    for (let index = 0; index < entries.length; index++) {
      const [word, rawWeight] = entries[index];
      const hash = hashWord(word);
      const weight = Number(rawWeight);
      const maxWeight = Number(options.maxWeight);
      let size = (maxWeight > 0 ? 12 + 39 * Math.sqrt(weight / maxWeight) : Math.min(51, 11 + weight * 1.55)) * density;
      size = Math.max(10, size);
      const vertical = index > 2 && hash % 9 === 0;
      let placedWord = false;

      for (let scale = 0; scale < 5 && !placedWord; scale++) {
        const currentSize = size * Math.pow(0.82, scale);
        ctx.font = `600 ${currentSize}px ${font}`;
        const textWidth = ctx.measureText(word).width;
        const textHeight = currentSize * 1.14;
        const boxWidth = vertical ? textHeight : textWidth;
        const boxHeight = vertical ? textWidth : textHeight;
        if (boxWidth > width - 12 || boxHeight > height - 12) continue;

        for (let step = 0; step < 460; step++) {
          const angle = step * 2.399963 + (hash % 360) * Math.PI / 180;
          const radius = Math.sqrt(step / 459);
          const centerX = width / 2 + Math.cos(angle) * radius * (width / 2 - 6);
          const centerY = height / 2 + Math.sin(angle) * radius * (height / 2 - 6);
          const candidate = {
            x: centerX - boxWidth / 2 - 3,
            y: centerY - boxHeight / 2 - 2,
            w: boxWidth + 6,
            h: boxHeight + 4
          };
          if (candidate.x < 4 || candidate.y < 4 ||
              candidate.x + candidate.w > width - 4 ||
              candidate.y + candidate.h > height - 4 ||
              intersects(candidate, placed)) continue;

          ctx.save();
          ctx.translate(centerX, centerY);
          if (vertical) ctx.rotate(-Math.PI / 2);
          ctx.font = `600 ${currentSize}px ${font}`;
          ctx.fillStyle = COLORS[hash % COLORS.length];
          ctx.shadowColor = COLORS[hash % COLORS.length];
          ctx.shadowBlur = 0;
          ctx.fillText(word, 0, 0);
          ctx.restore();
          placed.push(candidate);
          placedWord = true;
          break;
        }
      }
    }
  }

  global.WordCloud = WordCloud;
})(window);
