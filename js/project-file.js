/* JSON v1 boundary. No DOM or DHTMLX dependency. */
(function (root) {
  'use strict';

  function prepare(data) {
    const fail = (field, reason) => { throw new Error(`${field}: ${reason}`); };
    const object = (value, field) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field, 'ожидается объект');
    };
    const text = (value, field, fallback = '') => {
      if (value === undefined) return fallback;
      if (typeof value !== 'string') fail(field, 'ожидается строка');
      return value;
    };
    const id = (value, field) => {
      if (!(typeof value === 'string' && value.trim()) &&
          !(typeof value === 'number' && Number.isSafeInteger(value))) fail(field, 'некорректный идентификатор');
      const result = String(value);
      if (result === '0' || result === 'prototype' || Object.hasOwn(Object.prototype, result)) {
        fail(field, 'зарезервированный идентификатор');
      }
      return result;
    };
    const date = (value, field) => {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) {
        fail(field, 'ожидается дата YYYY-MM-DD');
      }
      const parsed = new Date(value + 'T00:00:00Z');
      if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        fail(field, 'несуществующая дата');
      }
      return value;
    };
    const choice = (value, allowed, field, fallback) => {
      if (value === undefined && fallback !== undefined) return fallback;
      if (!allowed.includes(value)) fail(field, `допустимо: ${allowed.join(', ')}`);
      return value;
    };
    const number = (value, field, fallback, min, max) => {
      if (value === undefined) return fallback;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
        fail(field, `ожидается число от ${min} до ${max}`);
      }
      return value;
    };
    const unique = (values, field) => {
      const ids = new Set();
      for (const value of values) {
        if (ids.has(value.id)) fail(field, `повторяющийся id ${value.id}`);
        ids.add(value.id);
      }
      return ids;
    };

    object(data, 'Файл');
    if (data.schema_version !== 1) fail('schema_version', 'поддерживается только числовая версия 1');
    object(data.project, 'project');
    const project = {
      id: id(data.project.id, 'project.id'),
      name: text(data.project.name, 'project.name'),
      description: text(data.project.description, 'project.description')
    };
    for (const field of ['created_at', 'updated_at']) {
      if (data.project[field] !== undefined) {
        project[field] = text(data.project[field], `project.${field}`);
        if (!Number.isFinite(Date.parse(project[field]))) fail(`project.${field}`, 'некорректная временная метка');
      }
    }
    if (!Array.isArray(data.items)) fail('items', 'ожидается массив');
    if (data.links !== undefined && !Array.isArray(data.links)) fail('links', 'ожидается массив');
    const items = data.items.map((item, index) => {
      const field = `items[${index}]`;
      object(item, field);
      const type = choice(item.type, ['group', 'task', 'milestone'], `${field}.type`);
      const title = text(item.title, `${field}.title`);
      if (!title.trim()) fail(`${field}.title`, 'название обязательно');
      const start = date(item.start_date, `${field}.start_date`);
      const end = date(item.end_date === undefined && type === 'milestone' ? start : item.end_date, `${field}.end_date`);
      if (end < start || (type === 'task' && end === start)) fail(`${field}.end_date`, 'конец задачи должен быть позже начала (исключительная граница v1)');
      if (type === 'milestone' && end !== start) fail(`${field}.end_date`, 'даты вехи должны совпадать');
      const color = text(item.color, `${field}.color`, '#3b82f6');
      if (!/^#[0-9a-f]{6}$/i.test(color)) fail(`${field}.color`, 'ожидается цвет #RRGGBB');
      if (item.is_expanded !== undefined && typeof item.is_expanded !== 'boolean') fail(`${field}.is_expanded`, 'ожидается boolean');
      return {
        id: id(item.id, `${field}.id`), type,
        parent_id: item.parent_id == null || item.parent_id === 0 || item.parent_id === '0' ? null : id(item.parent_id, `${field}.parent_id`),
        title, start_date: start, end_date: end,
        assignee: text(item.assignee, `${field}.assignee`), color,
        emoji: text(item.emoji, `${field}.emoji`), notes: text(item.notes, `${field}.notes`),
        progress: number(item.progress, `${field}.progress`, 0, 0, 100),
        status: choice(item.status, ['planned', 'in_progress', 'done', 'blocked'], `${field}.status`, 'planned'),
        sort_order: number(item.sort_order, `${field}.sort_order`, 0, 0, Number.MAX_SAFE_INTEGER),
        is_expanded: item.is_expanded !== false
      };
    });
    const itemIds = unique(items, 'items');
    const links = (data.links || []).map((link, index) => {
      const field = `links[${index}]`;
      object(link, field);
      return {
        id: id(link.id, `${field}.id`),
        source_id: id(link.source_id, `${field}.source_id`),
        target_id: id(link.target_id, `${field}.target_id`),
        type: choice(link.type, ['FS', 'SS', 'FF', 'SF'], `${field}.type`)
      };
    });
    unique(links, 'links');

    // Kahn's algorithm avoids recursive traversal of an untrusted hierarchy.
    function checkGraph(edges, field) {
      const next = new Map(items.map(item => [item.id, []]));
      const incoming = new Map(items.map(item => [item.id, 0]));
      for (const [from, to] of edges) {
        if (!itemIds.has(from) || !itemIds.has(to)) fail(field, `ссылка на отсутствующий элемент: ${from} → ${to}`);
        next.get(from).push(to);
        incoming.set(to, incoming.get(to) + 1);
      }
      const queue = items.filter(item => incoming.get(item.id) === 0).map(item => item.id);
      for (let i = 0; i < queue.length; i++) {
        for (const to of next.get(queue[i])) {
          incoming.set(to, incoming.get(to) - 1);
          if (incoming.get(to) === 0) queue.push(to);
        }
      }
      if (queue.length !== items.length) fail(field, 'обнаружен цикл');
    }
    checkGraph(items.filter(item => item.parent_id !== null).map(item => [item.parent_id, item.id]), 'items.parent_id');
    checkGraph(links.map(link => [link.source_id, link.target_id]), 'links');
    return { schema_version: 1, project, items, links };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { prepare };
  else root.ProjectFile = { prepare };
})(globalThis);
