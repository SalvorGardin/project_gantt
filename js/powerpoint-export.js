/* Native PowerPoint objects; no dependency on the visible Gantt DOM. */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const WIDTH = 13.333333;
  const LEFT = 0.45, LABEL_WIDTH = 3.85, CHART_X = 4.6, CHART_WIDTH = 8.28;
  const BOTTOM = 6.95, FONT = 17, LINE = 0.29;
  const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  function day(value) {
    const parsed = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== value) {
      throw new Error('Некорректная дата для PowerPoint: ' + value);
    }
    return +parsed / DAY;
  }

  function wrap(text, width, font, measure) {
    const lines = [];
    for (const paragraph of String(text).split(/\r?\n/)) {
      let line = '';
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (line && measure(line + ' ' + word, font) <= width * 72) {
          line += ' ' + word;
          continue;
        }
        if (line) lines.push(line);
        line = '';
        for (const char of word) {
          if (line && measure(line + char, font) > width * 72) {
            lines.push(line);
            line = '';
          }
          line += char;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  function calendar(rows, overview) {
    if (!rows.length) return null;
    const start = Math.min(...rows.map(row => row.start));
    const end = Math.max(...rows.map(row => row.end));
    const first = new Date(start * DAY), last = new Date((end - 1) * DAY);
    const months = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth() + 1;
    const unit = overview ? (months <= 12 ? 'month' : 'quarter') : (end - start <= 70 ? 'week' : 'month');
    let from, until, step;
    if (unit === 'week') {
      from = start - (first.getUTCDay() + 6) % 7;
      until = from + Math.ceil((end - from) / 7) * 7;
      step = 7;
    } else {
      step = unit === 'quarter' ? 3 : 1;
      from = Date.UTC(first.getUTCFullYear(), Math.floor(first.getUTCMonth() / step) * step, 1) / DAY;
      until = Date.UTC(last.getUTCFullYear(), Math.floor(last.getUTCMonth() / step) * step + step, 1) / DAY;
    }
    const ticks = [];
    for (let at = from; at < until;) {
      const date = new Date(at * DAY);
      const next = unit === 'week' ? at + 7 : Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + step, 1) / DAY;
      ticks.push({ start: at, end: next, date });
      at = next;
    }
    // Keep scale labels readable even for a project spanning many years.
    const stride = ticks.length <= 12 ? 1 : Math.ceil(ticks.length / 10);
    const cells = [];
    for (let i = 0; i < ticks.length; i += stride) {
      const { date, start } = ticks[i];
      const label = unit === 'week'
        ? `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}\n${date.getUTCFullYear()}`
        : unit === 'quarter' ? `Q${Math.floor(date.getUTCMonth() / 3) + 1}\n${date.getUTCFullYear()}`
          : `${MONTHS[date.getUTCMonth()]}\n${date.getUTCFullYear()}`;
      const final = ticks[Math.min(i + stride, ticks.length) - 1];
      let caption = label;
      if (stride > 1 && final.start !== start) {
        const period = d => unit === 'quarter' ? `Q${Math.floor(d.getUTCMonth() / 3) + 1}` : MONTHS[d.getUTCMonth()];
        const year = date.getUTCFullYear(), lastYear = final.date.getUTCFullYear();
        caption = `${period(date)}–${period(final.date)}\n${year === lastYear ? year : year + '–' + lastYear}`;
      }
      cells.push({ start, end: final.end, label: caption });
    }
    return { start: from, end: until, unit, cells };
  }

  function plan(name, spec, measure) {
    const byParent = new Map();
    for (const item of spec.items) {
      const parent = item.parent_id == null ? '' : String(item.parent_id);
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent).push(item);
    }
    for (const children of byParent.values()) children.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const rows = [], groups = [], visited = new Set();
    const stack = [...(byParent.get('') || [])].reverse().map(item => ({ item, depth: 0, group: null }));
    while (stack.length) {
      const { item, depth, group } = stack.pop();
      if (visited.has(String(item.id))) throw new Error('Повтор элемента в дереве проекта');
      visited.add(String(item.id));
      const start = day(item.start_date);
      const end = item.type === 'milestone' ? start + 1 : Math.max(start + 1, day(item.end_date));
      const row = { id: item.id, title: item.title, type: item.type, color: item.color || '#3b82f6', start, end, depth, group };
      rows.push(row);
      const owner = group || (item.type === 'group' ? row : null);
      if (item.type === 'group' && !group) groups.push(row);
      for (const child of [...(byParent.get(String(item.id)) || [])].reverse()) {
        stack.push({ item: child, depth: depth + 1, group: owner });
      }
    }
    if (visited.size !== spec.items.length) throw new Error('Некорректная иерархия проекта');
    const sections = [{ title: name || 'Проект', subtitle: 'Обзор', rows: rows.filter(row => !row.group || row.type === 'milestone'), range: rows, overview: true }];
    for (const group of groups) {
      const children = rows.filter(row => row === group || row.group === group);
      sections.push({ title: group.title, subtitle: 'Детализация группы', rows: children, range: children, depth: group.depth });
    }
    const slides = [];
    for (const section of sections) {
      const titleLines = wrap(section.title, WIDTH - LEFT * 2, 28, measure);
      const titleHeight = Math.max(0.46, titleLines.length * 0.43);
      const top = 0.4 + titleHeight + 0.85;
      if (top > 4) throw new Error('Слишком длинное название проекта или группы для заголовка PowerPoint. Сократите его.');
      const scale = calendar(section.range, section.overview);
      const pages = [];
      let page = { rows: [], height: 0 };
      const available = BOTTOM - top;
      for (const row of section.rows) {
        const indent = Math.min(0.6, Math.max(0, row.depth - (section.depth || 0)) * 0.16);
        const lines = wrap(row.title, LABEL_WIDTH - indent - 0.1, FONT, measure);
        while (lines.length) {
          const capacity = Math.floor((available - page.height - 0.16) / LINE);
          if (capacity < 1 || available - page.height < 0.48) {
            pages.push(page);
            page = { rows: [], height: 0 };
            continue;
          }
          // Move a normal row intact; split only a label longer than an entire slide.
          if (lines.length > capacity && page.rows.length) {
            pages.push(page);
            page = { rows: [], height: 0 };
            continue;
          }
          const part = lines.splice(0, capacity);
          const height = Math.max(0.48, part.length * LINE + 0.16);
          page.rows.push({ ...row, text: part.join('\n'), indent, y: top + page.height, height });
          page.height += height;
        }
      }
      if (page.rows.length || !pages.length) pages.push(page);
      pages.forEach((page, index) => slides.push({ ...page, title: titleLines.join('\n'), titleHeight, top,
        subtitle: section.subtitle + (pages.length > 1 ? ` · ${index + 1}/${pages.length}` : ''), scale }));
    }
    return slides;
  }

  async function create(PptxGenJS, name, spec, theme) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const measure = (text, font) => {
      context.font = `bold ${font}pt Arial`;
      return context.measureText(text).width * 72 / 96;
    };
    const slides = plan(name, spec, measure);
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'GanttFlow';
    pptx.subject = 'Диаграмма Ганта';
    pptx.title = name;
    pptx.lang = 'ru-RU';
    pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial', lang: 'ru-RU' };
    const colors = theme === 'dark'
      ? { bg: '161B22', text: 'F0F3F6', muted: 'B8C4D0', grid: '465260' }
      : { bg: 'FFFFFF', text: '182230', muted: '526173', grid: 'D4DCE5' };
    slides.forEach((layout, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: colors.bg };
      const text = (value, x, y, w, h, extra = {}) => slide.addText(value, {
        x, y, w, h, fontFace: 'Arial', fontSize: FONT, color: colors.text,
        margin: 0, breakLine: false, paraSpaceAfterPt: 0, valign: 'mid', ...extra
      });
      const line = (x, y, w, h) => slide.addShape(pptx.ShapeType.line, {
        x, y, w, h, line: { color: colors.grid, width: 0.6 }
      });
      text(layout.title, LEFT, 0.3, WIDTH - LEFT * 2, layout.titleHeight, { fontSize: 28, bold: true });
      text(layout.subtitle, LEFT, 0.35 + layout.titleHeight, 9, 0.3, { fontSize: 13, color: colors.muted });
      text(`${index + 1} / ${slides.length}`, WIDTH - 1.5, 7.13, 1, 0.2, { fontSize: 10, align: 'right', color: colors.muted });
      if (!layout.scale) {
        text('В проекте пока нет элементов', LEFT, layout.top, 10, 0.5);
        return;
      }
      const { scale } = layout;
      const x = value => CHART_X + (value - scale.start) / (scale.end - scale.start) * CHART_WIDTH;
      for (const cell of scale.cells) {
        const start = x(cell.start), width = x(cell.end) - start;
        text(cell.label, start, layout.top - 0.56, width, 0.48, { fontSize: 12, align: 'center', color: colors.muted });
        line(start, layout.top, 0, layout.height);
      }
      line(CHART_X + CHART_WIDTH, layout.top, 0, layout.height);
      line(LEFT, layout.top, WIDTH - LEFT * 2, 0);
      for (const row of layout.rows) {
        text(row.text, LEFT + row.indent, row.y + 0.06, LABEL_WIDTH - row.indent, row.height - 0.12, {
          bold: row.type === 'group', lineSpacingMultiple: 1.0
        });
        const color = /^#[\da-f]{6}$/i.test(row.color) ? row.color.slice(1) : '3B82F6';
        const center = row.y + row.height / 2;
        if (row.type === 'milestone') {
          const size = 0.19;
          const at = Math.min(CHART_X + CHART_WIDTH - size / 2, Math.max(CHART_X + size / 2, x(row.start)));
          slide.addShape(pptx.ShapeType.diamond, { x: at - size / 2, y: center - size / 2, w: size, h: size,
            fill: { color }, line: { color: colors.text, width: 0.6 } });
        } else {
          const at = x(row.start), height = row.type === 'group' ? 0.18 : 0.25;
          const width = Math.min(CHART_X + CHART_WIDTH - at, Math.max(0.035, x(row.end) - at));
          slide.addShape(pptx.ShapeType.rect, { x: at, y: center - height / 2, w: width, h: height,
            fill: { color }, line: { color: colors.text, width: 0.4 } });
        }
        line(LEFT, row.y + row.height, WIDTH - LEFT * 2, 0);
      }
    });
    return pptx.write({ outputType: 'blob', compression: true });
  }

  const api = { plan, create };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GanttPowerPoint = api;
})(typeof window === 'object' ? window : globalThis);
