/* Textanalyse aus der bisherigen Einzel-App; rein lokale Auswertung. */
(function (global) {
  'use strict';

  const STOPWORDS = new Set([
    'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'eines', 'einem', 'einen',
    'und', 'oder', 'aber', 'doch', 'sondern', 'denn', 'nun', 'so', 'wie', 'als', 'da', 'dort',
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'mich', 'dich', 'sich', 'uns', 'euch',
    'in', 'im', 'an', 'am', 'auf', 'mit', 'von', 'vom', 'bei', 'aus', 'nach', 'zu', 'zum', 'zur',
    'über', 'unter', 'durch', 'für', 'gegen', 'ohne', 'um', 'sind', 'ist', 'war', 'wird', 'werden',
    'hat', 'haben', 'hatte', 'hatten', 'kann', 'können', 'muss', 'müssen', 'soll', 'sollen', 'will',
    'wollen', 'darf', 'dürfen', 'mag', 'mögen', 'nicht', 'kein', 'keine', 'keinen', 'keinem', 'keiner',
    'auch', 'nur', 'noch', 'schon', 'sehr', 'mehr', 'weniger', 'viel', 'wenig', 'alle', 'alles',
    'man', 'wer', 'was', 'wann', 'wo', 'warum', 'wieso', 'weshalb', 'welche', 'welcher', 'welches',
    'dieser', 'diese', 'dieses', 'jener', 'jene', 'jenes', 'solcher', 'solche', 'solches'
  ]);

  function analyze(text) {
    const letterMatches = text.match(/\p{L}+/gu) || [];
    const words = letterMatches.map(word => word.toLowerCase());
    const wordCount = words.length;
    const sentences = text.split(/[.!?…]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    let totalWordLength = 0, totalSyllables = 0, longWords = 0, longest = '';
    const lengthMap = new Map(), freqMap = new Map();
    for (let i = 0; i < wordCount; i++) {
      const word = words[i];
      totalWordLength += word.length;
      totalSyllables += (word.match(/[aeiouäöüy]+/gi) || ['']).length;
      if (word.length > 6) longWords++;
      if (letterMatches[i].length > longest.length) longest = letterMatches[i];
      lengthMap.set(word.length, (lengthMap.get(word.length) || 0) + 1);
      freqMap.set(word, (freqMap.get(word) || 0) + 1);
    }
    const avgWordLen = wordCount ? totalWordLength / wordCount : 0;
    const avgSentLen = sentenceCount ? wordCount / sentenceCount : 0;
    const avgSyllables = wordCount ? totalSyllables / wordCount : 0;
    const longWordPercent = wordCount ? longWords / wordCount * 100 : 0;
    const longSentences = sentences.filter(s => (s.match(/\p{L}+/gu) || []).length > 12).length;
    const slPercent = sentenceCount ? longSentences / sentenceCount * 100 : 0;
    const hasScore = wordCount > 0 && sentenceCount > 0;
    // Kompatibilität mit der übernommenen App: beide bisherigen Näherungsformeln
    // bleiben unverändert; sie entsprechen nicht den Standardformeln.
    const flesch = hasScore ? 180 - avgSentLen * 58.5 - avgSyllables * 0.5 : null;
    const wiener = hasScore ? 0.1935 * avgSentLen + 0.1672 * avgSyllables + 0.1297 * longWordPercent - 0.0327 * slPercent - 0.875 : null;
    return {
      totalChars: text.length,
      charsNoSpaces: text.replace(/\s/g, '').length,
      wordsWhitespace: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      wordCount, sentenceCount, paragraphCount,
      flesch, wiener, avgWordLen, avgSentLen, longWordPercent,
      uniqueCount: freqMap.size, ttr: wordCount ? freqMap.size / wordCount : 0,
      longest,
      distribution: Array.from(lengthMap.entries()).sort((a, b) => a[0] - b[0]),
      frequencies: Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]),
      reading200: wordCount / 200 * 60,
      reading250: wordCount / 250 * 60,
      speaking130: wordCount / 130 * 60
    };
  }

  function frequencies(result, hideStopwords) {
    return hideStopwords ? result.frequencies.filter(([word]) => !STOPWORDS.has(word)) : result.frequencies;
  }

  // Key, label, displayed decimals or special format, optional explanation.
  const GROUPS = [
    {title: 'Basis', rows: [
      ['totalChars', 'Zeichen (mit Leerzeichen)', 0],
      ['charsNoSpaces', 'Zeichen (ohne Leerzeichen)', 0],
      ['wordsWhitespace', 'Wörter (Whitespace)', 0],
      ['wordCount', 'Wörter (Regex \\p{L}+)', 0, 'Zusammenhängende Unicode-Buchstaben; Zahlen zählen hier nicht als Wörter.'],
      ['sentenceCount', 'Sätze (Satzzeichen)', 0],
      ['paragraphCount', 'Absätze (Leerzeilen)', 0]
    ]},
    {title: 'Lesbarkeit', rows: [
      ['flesch', 'Flesch (Amstad, Altformel)', 1, 'Bisherige Näherungsformel der Einzel-App; kein standardkonformer Amstad-Wert.'],
      ['wiener', 'Wiener Sachtextformel (Altformel)', 1, 'Bisherige Näherungsformel der Einzel-App; kein standardkonformer WSTF-Wert.'],
      ['avgWordLen', 'Ø Wortlänge (Zeichen)', 2],
      ['avgSentLen', 'Ø Satzlänge (Wörter)', 2],
      ['longWordPercent', 'Anteil langer Wörter (>6 Zeichen)', 'percent']
    ]},
    {title: 'Wortschatz', rows: [
      ['uniqueCount', 'Unique Words', 0, 'Anzahl unterschiedlicher Wörter ohne Berücksichtigung der Groß-/Kleinschreibung.'],
      ['ttr', 'Type-Token-Ratio', 3, 'Verhältnis unterschiedlicher Wörter zur Gesamtwortzahl (0–1).'],
      ['longest', 'Längstes Wort', 'text']
    ]},
    {title: 'Zeit & Wolke', rows: [
      ['reading200', 'Lesezeit (200 W/min)', 'time'],
      ['reading250', 'Lesezeit (250 W/min)', 'time'],
      ['speaking130', 'Sprechzeit (130 W/min)', 'time']
    ]}
  ];
  const formats = [0, 1, 2, 3].map(d => new Intl.NumberFormat('de-DE', {minimumFractionDigits:d, maximumFractionDigits:d}));
  function time(seconds) {
    const rounded = Math.round(Math.abs(seconds));
    return rounded >= 60 ? `${Math.floor(rounded / 60)} min ${rounded % 60} s` : `${rounded} s`;
  }
  function format(value, kind, delta = false) {
    if (value === null || value === undefined || value === '') return '—';
    if (kind === 'text') return value;
    const digits = kind === 'percent' ? 1 : kind === 'time' ? 0 : kind;
    // Normalize rounding and prevent a negative zero in comparisons.
    const scale = 10 ** digits;
    const rounded = Math.round((Math.abs(value) + Number.EPSILON) * scale) / scale;
    const sign = rounded === 0 ? '' : value < 0 ? '−' : delta ? '+' : '';
    const formatted = kind === 'time' ? time(rounded) : formats[digits].format(rounded);
    return sign + formatted + (kind === 'percent' ? (delta ? ' PP' : ' %') : '');
  }
  function difference(oldValue, newValue, kind) {
    if (kind === 'text' || oldValue === null || newValue === null) return '—';
    // Use the same precision as the displayed source values.
    const digits = kind === 'percent' ? 1 : kind === 'time' ? 0 : kind;
    const scale = 10 ** digits;
    const round = v => Math.sign(v) * Math.round((Math.abs(v) + Number.EPSILON) * scale);
    return format((round(newValue) - round(oldValue)) / scale, kind, true);
  }
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function tableFor(group, oldResult, newResult) {
    const table = node('table', 'analysis-table');
    table.setAttribute('aria-label', group.title + ': Vergleich Original und neue Version');
    const thead = node('thead');
    const header = node('tr');
    for (const [label, cls] of [['Kennzahl', ''], ['Original (Alt)', 'analysis-old'], ['Neue Version (Neu)', 'analysis-new'], ['Δ Neu − Alt', 'analysis-delta']]) {
      const th = node('th', cls, label);
      th.scope = 'col';
      header.append(th);
    }
    thead.append(header);
    const tbody = node('tbody');
    for (const [key, label, kind, hint] of group.rows) {
      const tr = node('tr');
      const th = node('th', '', label);
      th.scope = 'row';
      if (hint) th.title = hint;
      tr.append(th);
      for (const result of [oldResult, newResult]) {
        const td = node('td', kind === 'text' ? 'analysis-word-value' : 'analysis-number', format(result[key], kind));
        if (kind === 'percent') {
          const meter = node('div', 'analysis-meter');
          meter.setAttribute('aria-hidden', 'true');
          const fill = node('span');
          fill.style.width = result[key] + '%';
          meter.append(fill);
          td.append(meter);
        }
        tr.append(td);
      }
      tr.append(node('td', 'analysis-number analysis-delta', difference(oldResult[key], newResult[key], kind)));
      tbody.append(tr);
    }
    table.append(thead, tbody);
    return table;
  }
  function sidePair(title, renderSide) {
    const section = node('div', 'analysis-extra');
    section.append(node('h4', '', title));
    const pair = node('div', 'analysis-pair');
    for (let i = 0; i < 2; i++) {
      const side = node('div', 'analysis-side');
      side.append(node('div', 'analysis-side-label ' + (i ? 'analysis-new' : 'analysis-old'), i ? 'Neue Version (Neu)' : 'Original (Alt)'));
      side.append(renderSide(i));
      pair.append(side);
    }
    section.append(pair);
    return section;
  }
  function lengthDistribution(result) {
    if (!result.distribution.length) return node('p', 'analysis-muted', 'Keine Wörter');
    const list = node('div', 'analysis-chips');
    for (const [length, count] of result.distribution) {
      const chip = node('span', 'analysis-chip', `${length}: ${formats[0].format(count)}`);
      chip.title = `${formats[0].format(count)} Wörter mit ${length} Zeichen`;
      list.append(chip);
    }
    return list;
  }
  function topWords(freq) {
    if (!freq.length) return node('p', 'analysis-muted', 'Keine Wörter (ggf. alle gefiltert)');
    const list = node('div', 'analysis-chips');
    for (const [word, count] of freq.slice(0, 12)) {
      const chip = node('span', 'analysis-chip', `${word} (${formats[0].format(count)})`);
      list.append(chip);
    }
    return list;
  }
  class Comparison {
    constructor(root, filter) {
      this.root = root;
      this.filter = filter;
      this.snapshot = null;
      this.clouds = [];
      this.frame = 0;
      this.observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.scheduleClouds()) : null;
      if (!this.observer) global.addEventListener('resize', () => this.scheduleClouds());
    }
    clear() {
      this.snapshot = null;
      this.clouds = [];
      if (this.observer) this.observer.disconnect();
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = 0;
      const empty = node('div', 'empty');
      empty.append(node('strong', '', 'Noch keine Analyse'), node('p', '', 'Füge oben Text ein und vergleiche die Versionen. Hier erscheinen die Kennzahlen beider Texte.'));
      this.root.replaceChildren(empty);
    }
    update(oldText, newText) {
      if (this.snapshot && this.snapshot.oldText === oldText && this.snapshot.newText === newText) {
        if (this.snapshot.hideStopwords !== this.filter.checked) this.render();
        else this.scheduleClouds();
        return;
      }
      this.snapshot = {oldText, newText, results:[analyze(oldText), analyze(newText)], hideStopwords: this.filter.checked};
      this.render();
    }
    render() {
      if (!this.snapshot) return;
      if (this.observer) this.observer.disconnect();
      this.snapshot.hideStopwords = this.filter.checked;
      const results = this.snapshot.results;
      const freq = results.map(r => frequencies(r, this.filter.checked));
      this.clouds = [];
      const maxCount = Math.max(1, ...freq.map(list => list.length ? list[0][1] : 0));
      const grid = node('div', 'analysis-grid');
      for (let i = 0; i < GROUPS.length; i++) {
        const group = GROUPS[i];
        const panel = node('section', 'analysis-panel' + (i >= 2 ? ' analysis-wide' : ''));
        panel.append(node('h3', '', group.title), tableFor(group, results[0], results[1]));
        if (i === 1) panel.append(node('p', 'analysis-note', 'Lesbarkeitsformeln unverändert aus der bisherigen Textanalyse übernommen (nicht standardkonform). PP = Prozentpunkte.'));
        if (i === 2) {
          panel.append(sidePair('Wortlängen-Verteilung (Länge: Anzahl)', index => lengthDistribution(results[index])), sidePair('Häufigste Wörter (Top 12)', index => topWords(freq[index])));
        }
        if (i === 3) {
          panel.append(sidePair('Wortwolke', index => {
            const box = node('div', 'analysis-cloud');
            if (!freq[index].length) box.append(node('p', 'analysis-muted', 'Keine Wörter für die Wortwolke'));
            else this.clouds.push({box, list:freq[index].slice(0,65), maxCount, width:0, height:0});
            return box;
          }));
          panel.append(node('p', 'analysis-note', 'Bis zu 65 Begriffe pro Wolke; gemeinsame Häufigkeitsskala. Die Wortgröße kann für die Platzierung verkleinert werden. Zeitangaben sind Schätzwerte.'));
        }
        grid.append(panel);
      }
      this.root.replaceChildren(grid);
      if (this.observer) for (const cloud of this.clouds) this.observer.observe(cloud.box);
      this.scheduleClouds();
    }
    scheduleClouds() {
      if (this.frame) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        for (const cloud of this.clouds) {
          const width = cloud.box.clientWidth, height = cloud.box.clientHeight;
          if (!width || !height || (width === cloud.width && height === cloud.height)) continue;
          cloud.width = width;
          cloud.height = height;
          try {
            if (typeof global.WordCloud !== 'function') throw new Error('Wortwolke nicht geladen');
            global.WordCloud(cloud.box, {list: cloud.list, maxWeight: cloud.maxCount, fontFamily:'system-ui, sans-serif'});
          } catch (error) {
            cloud.box.replaceChildren(node('p', 'analysis-muted', 'Wortwolke nicht verfügbar'));
            console.warn('Wortwolke:', error);
          }
        }
      });
    }
    copyText() {
      if (!this.snapshot) return '';
      const [oldResult, newResult] = this.snapshot.results;
      const filtered = [oldResult, newResult].map(result => frequencies(result, this.snapshot.hideStopwords));
      const out = ['HTML Diff – Textanalyse', 'Stoppwörter: ' + (this.snapshot.hideStopwords ? 'ausgeblendet' : 'sichtbar'), ''];
      for (const group of GROUPS) {
        out.push(group.title, 'Kennzahl\tOriginal (Alt)\tNeue Version (Neu)\tΔ Neu − Alt');
        for (const [key, label, kind] of group.rows) {
          out.push([label, format(oldResult[key], kind), format(newResult[key], kind), difference(oldResult[key], newResult[key], kind)].join('\t'));
        }
        if (group.title === 'Wortschatz') {
          const distribution = result => result.distribution.map(([length, count]) => `${length}:${count}`).join('  ') || '—';
          out.push(['Wortlängen-Verteilung', distribution(oldResult), distribution(newResult), '—'].join('\t'));
          out.push(['Top 12', ...filtered.map(freq => freq.slice(0,12).map(([word,count]) => `${word} (${count})`).join(', ') || '—'), '—'].join('\t'));
        }
        out.push('');
      }
      out.push('Lesbarkeit: bisherige, nicht standardkonforme Formeln. PP = Prozentpunkte.');
      return out.join('\n');
    }
  }
  global.TextAnalysis = {analyze, frequencies, Comparison};
})(typeof window !== 'undefined' ? window : globalThis);
