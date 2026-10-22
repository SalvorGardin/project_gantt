/* ============================================================
   GANTTFLOW — Main Application Logic
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // SCHEMA VERSION
  // ============================================================
  const SCHEMA_VERSION = 1;

  // ============================================================
  // SAMPLE PROJECT DATA
  // ============================================================
  const SAMPLE_PROJECT = {
    schema_version: SCHEMA_VERSION,
    project: {
      id: 'proj_001',
      name: 'Разработка медицинской ИС',
      description: 'Система поддержки принятия клинических решений с HL7 FHIR интеграцией',
      created_at: '2026-04-01T09:00:00Z',
      updated_at: '2026-04-16T09:00:00Z'
    },
    items: [
      // Phase 1 — Requirements & Analysis
      { id: 'grp_1', type: 'group', parent_id: null, title: '📦 Анализ и требования', start_date: '2026-04-20', end_date: '2026-05-10', assignee: '', color: '#6366f1', emoji: '📦', progress: 45, status: 'in_progress', sort_order: 1, is_expanded: true, notes: 'Первый этап: сбор требований и проектирование' },
      { id: 'task_1', type: 'task', parent_id: 'grp_1', title: '🧠 Системный анализ', start_date: '2026-04-20', end_date: '2026-04-27', assignee: 'Анна К.', color: '#6366f1', emoji: '🧠', progress: 80, status: 'in_progress', sort_order: 1, is_expanded: true, notes: 'Изучение HL7 FHIR стандартов, анализ текущих систем' },
      { id: 'task_1a', type: 'task', parent_id: 'task_1', title: 'Анализ HL7 стандартов', start_date: '2026-04-20', end_date: '2026-04-23', assignee: 'Анна К.', color: '#818cf8', emoji: '📋', progress: 100, status: 'done', sort_order: 1, is_expanded: false, notes: '' },
      { id: 'task_1b', type: 'task', parent_id: 'task_1', title: 'Интервью со стейкхолдерами', start_date: '2026-04-23', end_date: '2026-04-27', assignee: 'Дмитрий М.', color: '#818cf8', emoji: '💬', progress: 60, status: 'in_progress', sort_order: 2, is_expanded: false, notes: 'Врачи, медсёстры, администраторы' },
      { id: 'task_2', type: 'task', parent_id: 'grp_1', title: '📋 Документация требований', start_date: '2026-04-28', end_date: '2026-05-05', assignee: 'Дмитрий М.', color: '#4f46e5', emoji: '📋', progress: 30, status: 'in_progress', sort_order: 2, is_expanded: false, notes: 'BRD, FRD, Use Cases' },
      { id: 'task_3', type: 'task', parent_id: 'grp_1', title: '🔍 Прототипирование UI', start_date: '2026-05-01', end_date: '2026-05-09', assignee: 'Мария С.', color: '#7c3aed', emoji: '🔍', progress: 10, status: 'in_progress', sort_order: 3, is_expanded: false, notes: 'Wireframes в Figma' },
      { id: 'mil_1', type: 'milestone', parent_id: 'grp_1', title: '🚩 Согласование ТЗ', start_date: '2026-05-10', end_date: '2026-05-10', assignee: 'Иван П.', color: '#dc2626', emoji: '🚩', progress: 0, status: 'planned', sort_order: 4, is_expanded: false, notes: 'Финальное согласование технического задания со всеми стейкхолдерами' },

      // Phase 2 — Architecture & Design
      { id: 'grp_2', type: 'group', parent_id: null, title: '🏗️ Архитектура и дизайн', start_date: '2026-05-11', end_date: '2026-06-07', assignee: '', color: '#0891b2', emoji: '🏗️', progress: 0, status: 'planned', sort_order: 2, is_expanded: true, notes: 'Второй этап: проектирование архитектуры системы' },
      { id: 'task_4', type: 'task', parent_id: 'grp_2', title: '⚙️ Системная архитектура', start_date: '2026-05-11', end_date: '2026-05-22', assignee: 'Алексей В.', color: '#0891b2', emoji: '⚙️', progress: 0, status: 'planned', sort_order: 1, is_expanded: false, notes: 'Микросервисная архитектура, FHIR R4 сервер' },
      { id: 'task_4a', type: 'task', parent_id: 'task_4', title: 'Проектирование FHIR API', start_date: '2026-05-11', end_date: '2026-05-17', assignee: 'Алексей В.', color: '#22d3ee', emoji: '📡', progress: 0, status: 'planned', sort_order: 1, is_expanded: false, notes: '' },
      { id: 'task_4b', type: 'task', parent_id: 'task_4', title: 'Схема базы данных', start_date: '2026-05-17', end_date: '2026-05-22', assignee: 'Алексей В.', color: '#22d3ee', emoji: '💾', progress: 0, status: 'planned', sort_order: 2, is_expanded: false, notes: '' },
      { id: 'task_5', type: 'task', parent_id: 'grp_2', title: '💻 UI/UX Дизайн', start_date: '2026-05-18', end_date: '2026-06-01', assignee: 'Мария С.', color: '#0e7490', emoji: '💻', progress: 0, status: 'planned', sort_order: 2, is_expanded: false, notes: 'Дизайн системы, компонентная библиотека' },
      { id: 'task_6', type: 'task', parent_id: 'grp_2', title: '🔒 Безопасность и HIPAA', start_date: '2026-05-25', end_date: '2026-06-05', assignee: 'Сергей Т.', color: '#155e75', emoji: '🔒', progress: 0, status: 'planned', sort_order: 3, is_expanded: false, notes: 'Анализ требований безопасности, шифрование данных' },
      { id: 'mil_2', type: 'milestone', parent_id: 'grp_2', title: '🎯 Архитектурное ревью', start_date: '2026-06-07', end_date: '2026-06-07', assignee: 'Иван П.', color: '#f59e0b', emoji: '🎯', progress: 0, status: 'planned', sort_order: 4, is_expanded: false, notes: 'Ревью архитектурных решений с командой' },

      // Phase 3 — Development
      { id: 'grp_3', type: 'group', parent_id: null, title: '💊 Разработка и интеграция', start_date: '2026-06-08', end_date: '2026-08-15', assignee: '', color: '#059669', emoji: '💊', progress: 0, status: 'planned', sort_order: 3, is_expanded: true, notes: 'Третий этап: основная разработка модулей' },
      { id: 'task_7', type: 'task', parent_id: 'grp_3', title: '🔬 FHIR-сервер', start_date: '2026-06-08', end_date: '2026-07-05', assignee: 'Алексей В.', color: '#059669', emoji: '🔬', progress: 0, status: 'planned', sort_order: 1, is_expanded: false, notes: 'HAPI FHIR server, ресурсы Patient, Observation, Condition' },
      { id: 'task_8', type: 'task', parent_id: 'grp_3', title: '📱 Клиентское приложение', start_date: '2026-06-15', end_date: '2026-07-20', assignee: 'Мария С.', color: '#10b981', emoji: '📱', progress: 0, status: 'planned', sort_order: 2, is_expanded: false, notes: 'React + TypeScript, компоненты карточки пациента, шкалы риска' },
      { id: 'task_9', type: 'task', parent_id: 'grp_3', title: '📊 Модуль клинических шкал', start_date: '2026-07-01', end_date: '2026-07-25', assignee: 'Анна К.', color: '#34d399', emoji: '📊', progress: 0, status: 'planned', sort_order: 3, is_expanded: false, notes: 'SCORE2, AUDIT, ASRS, Спилбергер-Ханин' },
      { id: 'task_10', type: 'task', parent_id: 'grp_3', title: '🌐 HL7 интеграция', start_date: '2026-07-15', end_date: '2026-08-10', assignee: 'Алексей В.', color: '#6ee7b7', emoji: '🌐', progress: 0, status: 'planned', sort_order: 4, is_expanded: false, notes: 'Интеграция с МИС, лабораторными системами' },
      { id: 'mil_3', type: 'milestone', parent_id: 'grp_3', title: '🚀 Alpha-версия', start_date: '2026-08-01', end_date: '2026-08-01', assignee: 'Иван П.', color: '#d97706', emoji: '🚀', progress: 0, status: 'planned', sort_order: 5, is_expanded: false, notes: 'Внутренняя alpha-версия для тестирования' },
      { id: 'mil_4', type: 'milestone', parent_id: 'grp_3', title: '🏁 Beta-версия', start_date: '2026-08-15', end_date: '2026-08-15', assignee: 'Иван П.', color: '#059669', emoji: '🏁', progress: 0, status: 'planned', sort_order: 6, is_expanded: false, notes: 'Beta-версия для пилотного клинического тестирования' },

      // Phase 4 — Testing & Launch
      { id: 'grp_4', type: 'group', parent_id: null, title: '✅ Тестирование и запуск', start_date: '2026-08-16', end_date: '2026-09-30', assignee: '', color: '#d97706', emoji: '✅', progress: 0, status: 'planned', sort_order: 4, is_expanded: true, notes: 'Финальный этап: тестирование и запуск в продуктив' },
      { id: 'task_11', type: 'task', parent_id: 'grp_4', title: '🧪 Тестирование', start_date: '2026-08-16', end_date: '2026-09-05', assignee: 'Команда QA', color: '#d97706', emoji: '🧪', progress: 0, status: 'planned', sort_order: 1, is_expanded: false, notes: 'Unit, Integration, E2E, нагрузочное тестирование' },
      { id: 'task_12', type: 'task', parent_id: 'grp_4', title: '🏥 Пилот в клинике', start_date: '2026-09-01', end_date: '2026-09-20', assignee: 'Дмитрий М.', color: '#f59e0b', emoji: '🏥', progress: 0, status: 'planned', sort_order: 2, is_expanded: false, notes: 'Пилотное внедрение в 2-3 отделениях' },
      { id: 'task_13', type: 'task', parent_id: 'grp_4', title: '📝 Документация', start_date: '2026-09-01', end_date: '2026-09-25', assignee: 'Анна К.', color: '#fbbf24', emoji: '📝', progress: 0, status: 'planned', sort_order: 3, is_expanded: false, notes: 'Инструкции пользователя, API документация, руководство администратора' },
      { id: 'mil_5', type: 'milestone', parent_id: 'grp_4', title: '🎉 Запуск в продуктив', start_date: '2026-09-30', end_date: '2026-09-30', assignee: 'Иван П.', color: '#dc2626', emoji: '🎉', progress: 0, status: 'planned', sort_order: 4, is_expanded: false, notes: 'Финальный запуск системы в промышленную эксплуатацию' }
    ],
    links: [
      { id: 'link_1', source_id: 'task_1', target_id: 'task_2', type: 'FS' },
      { id: 'link_2', source_id: 'task_2', target_id: 'mil_1', type: 'FS' },
      { id: 'link_3', source_id: 'task_3', target_id: 'mil_1', type: 'FS' },
      { id: 'link_4', source_id: 'mil_1', target_id: 'task_4', type: 'FS' },
      { id: 'link_5', source_id: 'task_4', target_id: 'task_5', type: 'SS' },
      { id: 'link_6', source_id: 'task_5', target_id: 'mil_2', type: 'FS' },
      { id: 'link_7', source_id: 'task_6', target_id: 'mil_2', type: 'FS' },
      { id: 'link_8', source_id: 'mil_2', target_id: 'task_7', type: 'FS' },
      { id: 'link_9', source_id: 'task_7', target_id: 'task_8', type: 'SS' },
      { id: 'link_10', source_id: 'task_8', target_id: 'task_9', type: 'SS' },
      { id: 'link_11', source_id: 'task_7', target_id: 'task_10', type: 'FS' },
      { id: 'link_12', source_id: 'task_9', target_id: 'mil_3', type: 'FS' },
      { id: 'link_13', source_id: 'mil_3', target_id: 'task_10', type: 'SS' },
      { id: 'link_14', source_id: 'task_10', target_id: 'mil_4', type: 'FS' },
      { id: 'link_15', source_id: 'mil_4', target_id: 'task_11', type: 'FS' },
      { id: 'link_16', source_id: 'task_11', target_id: 'task_12', type: 'SS' },
      { id: 'link_17', source_id: 'task_12', target_id: 'mil_5', type: 'FS' },
      { id: 'link_18', source_id: 'task_13', target_id: 'mil_5', type: 'FS' }
    ]
  };

  // ============================================================
  // STATE
  // ============================================================
  let state = {
    project: null,
    isDirty: false,
    pendingImport: null,
    pendingDelete: null,
    editingTaskId: null,
    editingLinkId: null,
    contextTaskId: null,
    currentZoom: 'week',
    selectedTaskId: null
  };

  // ============================================================
  // DHTMLX GANTT CONFIGURATION
  // ============================================================

  let applyingProject = false;
  let importReadVersion = 0;
  let recoveryProject = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  function initGantt() {
    gantt.config.xml_date = '%Y-%m-%d';
    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.date_grid = '%d.%m.%Y';

    gantt.config.row_height = 36;
    gantt.config.bar_height = 22;
    gantt.config.min_column_width = 40;

    gantt.config.drag_move = true;
    gantt.config.drag_resize = true;
    gantt.config.drag_progress = true;
    gantt.config.drag_links = true;
    gantt.config.drag_project = true;   // allow moving group bars too
    gantt.config.drag_sort  = true;     // allow reordering rows
    gantt.config.order_branch = 'marker'; // show position marker while reordering
    gantt.config.order_branch_free = true; // allow reordering across branches

    gantt.config.show_progress = true;
    gantt.config.fit_tasks = true;
    gantt.config.auto_scheduling = false;

    gantt.config.link_line_width = 2;
    gantt.config.link_arrow_size = 8;

    gantt.config.open_tree_initially = true;

    gantt.config.grid_width = 530;
    gantt.config.keep_grid_width = false;
    gantt.config.grid_resize = true;

    // Task types — use DHTMLX standard string values so drag/link logic works correctly
    gantt.config.types = {
      task:      gantt.config.types.task,      // 'task'
      project:   gantt.config.types.project,  // 'project'
      milestone: gantt.config.types.milestone // 'milestone'
    };

    // Link types — DHTMLX v9 standard values
    gantt.config.links = {
      finish_to_start:  0,
      start_to_start:   1,
      finish_to_finish: 2,
      start_to_finish:  3
    };
    // Default link type when drag-creating a dependency
    gantt.config.default_link_type = gantt.config.links.finish_to_start;

    // Columns: Задача | Начало | Окончание | Дней | Прогресс
    gantt.config.columns = [
      {
        name: 'text',
        label: 'Задача',
        tree: true,
        width: 200,
        resize: true,
        template: function (task) {
          const emoji = escapeHtml(task.emoji);
          const statusDot = getStatusDot(task.status);
          return `<span class="task-cell-text">${emoji ? emoji + ' ' : ''}${escapeHtml(task.text)}</span>${statusDot}`;
        }
      },
      {
        name: 'start_date',
        label: 'Начало',
        align: 'center',
        width: 70,
        resize: true,
        template: function (task) {
          if (!task.start_date) return '';
          return gantt.date.date_to_str('%d.%m')(task.start_date);
        }
      },
      {
        name: 'end_date',
        label: 'Оконч.',
        align: 'center',
        width: 70,
        resize: true,
        template: function (task) {
          if (task.type === 'milestone') return gantt.date.date_to_str('%d.%m')(task.start_date);
          if (!task.end_date) return '';
          // DHTMLX end_date is exclusive (next day), so subtract 1 day
          const d = new Date(task.end_date);
          d.setDate(d.getDate() - 1);
          return gantt.date.date_to_str('%d.%m')(d);
        }
      },
      {
        name: 'duration',
        label: 'Дней',
        align: 'center',
        width: 48,
        resize: true,
        template: function (task) {
          if (task.type === 'milestone') return '—';
          return task.duration || '';
        }
      },
      {
        name: 'progress',
        label: 'Прогресс',
        align: 'center',
        width: 80,
        template: function (task) {
          if (task.type === 'milestone') return '—';
          const pct = Math.round((task.progress || 0) * 100);
          return `<span class="col-progress"><span class="col-progress-track"><span class="col-progress-bar" style="width:${pct}%"></span></span><span class="col-progress-label">${pct}%</span></span>`;
        }
      }
    ];

    // Plugins (must be called before init)
    gantt.plugins({ tooltip: true, marker: true });

    // Scales — week view by default
    setScale('week');
    gantt.config.tooltip_offset_x = 10;
    gantt.config.tooltip_offset_y = 20;
    gantt.templates.tooltip_text = function (start, end, task) {
      const fmt = gantt.date.date_to_str('%d.%m.%Y');
      const assignee = task.assignee ? `<br><b>Ответственный:</b> ${escapeHtml(task.assignee)}` : '';
      const progress = task.type !== 'milestone' ? `<br><b>Прогресс:</b> ${Math.round((task.progress || 0) * 100)}%` : '';
      const status = task.status ? `<br><b>Статус:</b> ${escapeHtml(getStatusLabel(task.status))}` : '';
      const notes = task.notes ? `<br><span style="color:#8b949e">${escapeHtml(task.notes)}</span>` : '';
      // Display the inclusive last day without changing DHTMLX's exclusive end.
      const endForTooltip = new Date(end);
      endForTooltip.setDate(endForTooltip.getDate() - 1);
      const dates = task.type === 'milestone'
        ? `<br><b>Дата:</b> ${fmt(start)}`
        : `<br><b>Период:</b> ${fmt(start)} — ${fmt(endForTooltip)}`;
      return `<b>${escapeHtml(task.text)}</b>${dates}${assignee}${progress}${status}${notes}`;
    };

    // Task templates
    gantt.templates.task_text = function (start, end, task) {
      if (task.type === 'milestone') return '';
      return escapeHtml(task.text);
    };

    gantt.templates.task_row_class = function (start, end, task) {
      return 'gantt_row_item';
    };

    gantt.templates.leftside_text = function (start, end, task) {
      return '';
    };

    gantt.templates.rightside_text = function (start, end, task) {
      if (task.type === 'milestone') return escapeHtml(task.text);
      if (task.assignee) return `<span style="font-size:11px;color:#8b949e;padding-left:6px">${escapeHtml(task.assignee)}</span>`;
      return '';
    };

    // Bar style — milestones via --dhx-gantt-task-background (v9 inline color mechanism)
    gantt.templates.bar_style = function (start, end, task) {
      const color = task.color || '#3b82f6';
      if (task.type === gantt.config.types.milestone) {
        // DHTMLX v9 reads --dhx-gantt-task-background when gantt_task_inline_color class present
        return '--dhx-gantt-task-background:' + color + ';';
      }
      const opacity = task.type === gantt.config.types.project ? '0.85' : '1';
      return 'background-color:' + color + ';opacity:' + opacity + ';';
    };

    // task_class — add type classes for styling
    gantt.templates.task_class = function (start, end, task) {
      const classes = [];
      if (task.type === gantt.config.types.milestone) classes.push('gf-milestone');
      if (task.status === 'blocked') classes.push('gantt-blocked');
      if (task.status === 'done')    classes.push('gantt-done');
      if (end < new Date() && task.type !== gantt.config.types.milestone
          && task.status !== 'done') classes.push('gantt-overdue');
      return classes.join(' ');
    };

    // Today marker (using plugin)
    setTimeout(() => {
      if (typeof gantt.addMarker === 'function') {
        gantt.addMarker({
      start_date: new Date(),
      css: 'today_marker',
      text: 'Сегодня',
      title: 'Сегодня'
        });
      }
    }, 100);

    // Weekend highlight
    gantt.templates.scale_cell_class = function (date) {
      if (date.getDay() === 0 || date.getDay() === 6) return 'week_end';
      return '';
    };
    gantt.templates.task_cell_class = function (item, date) {
      if (date.getDay() === 0 || date.getDay() === 6) return 'week_end';
      return '';
    };

    // ---- EVENTS ----

    // Double click → open editor
    gantt.attachEvent('onTaskDblClick', function (id) {
      openTaskEditor(id);
      return false;
    });

    // Right click → context menu
    gantt.attachEvent('onContextMenu', function (taskId, linkId, event) {
      if (taskId) {
        event.preventDefault();
        showContextMenu(event, taskId);
        return false;
      }
    });

    // Click on add button
    gantt.attachEvent('onTaskCreated', function (task) {
      const id = 'task_' + Date.now();
      task.id = id;
      task.color = '#3b82f6';
      task.status = 'planned';
      task.progress = 0;
      task.emoji = '📋';
      openTaskEditor(null, task, true);
      return false;
    });

    // Task moved/resized → recalc parent group dates + mark dirty
    gantt.attachEvent('onAfterTaskDrag', function (id) {
      const task = gantt.getTask(id);
      if (task) {
        task.start_date_str = gantt.date.date_to_str('%Y-%m-%d')(task.start_date);
        task.end_date_str = gantt.date.date_to_str('%Y-%m-%d')(task.end_date);
        recalcParentDates(id);
      }
      markDirty();
    });

    // Task added/updated → recalc parent group dates
    gantt.attachEvent('onAfterTaskAdd', function (id) {
      recalcParentDates(id);
    });
    gantt.attachEvent('onAfterTaskUpdate', function (id) {
      recalcParentDates(id);
    });

    // Track selected task (for toolbar + Задача / + Веха context)
    gantt.attachEvent('onTaskClick', function (id) {
      state.selectedTaskId = id;
      updateStatusBar();
      return true;
    });
    gantt.attachEvent('onEmptyClick', function () {
      state.selectedTaskId = null;
      updateStatusBar();
    });

    // Track first-time link creation to show hint
    let _linkHintShown = false;

    // Force FS type on every drag-created link BEFORE it is stored
    gantt.attachEvent('onBeforeLinkAdd', function (id, link) {
      if (applyingProject) return true;
      link.type = gantt.config.links.finish_to_start; // new drag-created links only
      return true;
    });

    // Link created → validate + mark dirty
    gantt.attachEvent('onAfterLinkAdd', function (id, link) {
      if (applyingProject) return;
      if (detectCycle(link.source, link.target)) {
        gantt.deleteLink(id);
        showToast('Циклическая зависимость невозможна', 'error');
        return;
      }
      markDirty();
    });

    // Link double-click → edit
    gantt.attachEvent('onLinkDblClick', function (id) {
      openLinkEditor(id);
      return false;
    });

    // After task open/collapse
    gantt.attachEvent('onTaskOpened', function () { markDirty(); });
    gantt.attachEvent('onTaskClosed', function () { markDirty(); });

    let previousParent;
    function rememberParent(id) {
      previousParent = gantt.getTask(id).parent;
      return true;
    }
    function recalcMovedTask(id) {
      recalcParentDates(previousParent, true);
      recalcParentDates(id);
      markDirty();
    }
    gantt.attachEvent('onBeforeTaskMove', rememberParent);
    gantt.attachEvent('onAfterTaskMove', recalcMovedTask);
    // Marker-mode row dragging has its own events.
    gantt.attachEvent('onRowDragStart', rememberParent);
    gantt.attachEvent('onRowDragEnd', recalcMovedTask);
    gantt.attachEvent('onAfterTaskDelete', function (id, task) {
      recalcParentDates(task.parent, true);
      markDirty();
    });
    gantt.attachEvent('onAfterLinkDelete', markDirty);

    // Initialize
    gantt.init('gantt-container');

    // Bug 3 fix: full wheel scroll support
    // DHTMLX handles horizontal deltaX natively but ignores vertical deltaY.
    // We add vertical scroll + ensure horizontal works from the grid column too.
    setTimeout(function () {
      var ganttContainer = document.getElementById('gantt-container');
      if (!ganttContainer) return;

      ganttContainer.addEventListener('wheel', function (e) {
        var state = gantt.getScrollState();
        // Horizontal: trackpad deltaX, or Shift+deltaY
        var dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
        // Vertical: plain deltaY without shift
        var dy = (!e.shiftKey && e.deltaX === 0) ? e.deltaY : 0;

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          var newX = dx !== 0 ? state.x + dx : null;
          var newY = dy !== 0 ? state.y + dy : null;
          gantt.scrollTo(newX, newY);
        }
      }, { passive: false });
    }, 200);
  }

  // ============================================================
  // SCALE HELPERS
  // ============================================================

  function setScale(zoom) {
    state.currentZoom = zoom;

    // DHTMLX Gantt v9 uses gantt.config.scales array
    switch (zoom) {
      case 'day':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%M %Y' },
          { unit: 'day',   step: 1, format: '%d %D',
            css: function(d) { return (d.getDay()===0||d.getDay()===6)?'week_end':''; }
          }
        ];
        gantt.config.min_column_width = 44;
        break;
      case 'week':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%M %Y' },
          { unit: 'week',  step: 1, format: function(d) {
              var end = gantt.date.add(d, 6, 'day');
              var fmt = gantt.date.date_to_str('%d');
              return 'Нед ' + fmt(d) + '–' + fmt(end);
            }
          },
          { unit: 'day', step: 1, format: '%d',
            css: function(d) { return (d.getDay()===0||d.getDay()===6)?'week_end':''; }
          }
        ];
        gantt.config.min_column_width = 28;
        break;
      case 'month':
        gantt.config.scales = [
          { unit: 'year',  step: 1, format: '%Y' },
          { unit: 'month', step: 1, format: '%M' },
          { unit: 'week',  step: 1, format: 'Нед.%W' }
        ];
        gantt.config.min_column_width = 60;
        break;
      case 'quarter':
        gantt.config.scales = [
          { unit: 'year',    step: 1, format: '%Y' },
          { unit: 'quarter', step: 1, format: function(d) {
              return 'Q' + (Math.floor(d.getMonth()/3)+1);
            }
          },
          { unit: 'month',   step: 1, format: '%M' }
        ];
        gantt.config.min_column_width = 90;
        break;
    }

    gantt.render();
    document.querySelectorAll('.zoom-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.zoom === zoom);
    });
  }

  // ============================================================
  // DATA CONVERSION: spec-format ↔ dhtmlx-format
  // ============================================================

  function specToGantt(items, links) {
    const tasks = [...items].sort((a, b) => a.sort_order - b.sort_order).map(item => {
      // Strip any leading emoji from title to avoid duplication
      const cleanTitle = item.title.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}️⃣‍\s]+/u, '').trim() || item.title;
      const t = {
        id: item.id,
        text: cleanTitle,
        raw_title: item.title,
        start_date: item.start_date,
        end_date: item.end_date || item.start_date,
        parent: item.parent_id || 0,
        progress: (item.progress || 0) / 100,
        color: item.color || '#3b82f6',
        emoji: item.emoji || '',
        assignee: item.assignee || '',
        status: item.status || 'planned',
        notes: item.notes || '',
        sort_order: item.sort_order || 0,
        open: item.is_expanded !== false
      };

      if (item.type === 'group') {
        t.type = gantt.config.types.project;
        t.$open = item.is_expanded !== false;
      } else if (item.type === 'milestone') {
        t.type = gantt.config.types.milestone;
        t.start_date = item.start_date;
        t.end_date = item.start_date;
        t.duration = 0;
      } else {
        t.type = gantt.config.types.task;
      }

      return t;
    });

    const ganttLinks = (links || []).map(link => ({
      id: link.id,
      source: link.source_id,
      target: link.target_id,
      type: linkTypeToNum(link.type)
    }));

    return { data: tasks, links: ganttLinks };
  }

  function ganttToSpec() {
    const result = { items: [], links: [] };
    const typeMap = {
      [gantt.config.types.project]: 'group',
      [gantt.config.types.milestone]: 'milestone',
      [gantt.config.types.task]: 'task'
    };
    const fmt = gantt.date.date_to_str('%Y-%m-%d');

    const siblingOrder = new Map();
    gantt.eachTask(function (task) {
      const parentKey = String(task.parent || 0);
      siblingOrder.set(parentKey, (siblingOrder.get(parentKey) || 0) + 1);
      const title = task.raw_title || task.text.replace(/^[\p{Emoji}\s]+/u, '').trim() || task.text;
      const item = {
        id: task.id,
        type: typeMap[task.type] || 'task',
        parent_id: task.parent && task.parent !== '0' && task.parent !== 0 ? String(task.parent) : null,
        title: title,
        start_date: fmt(task.start_date),
        end_date: fmt(task.end_date),
        assignee: task.assignee || '',
        color: task.color || '#3b82f6',
        emoji: task.emoji || '',
        progress: Math.round((task.progress || 0) * 100),
        status: task.status || 'planned',
        sort_order: siblingOrder.get(parentKey),
        is_expanded: task.$open !== false,
        notes: task.notes || ''
      };
      result.items.push(item);
    });

    gantt.getLinks().forEach(link => {
      result.links.push({
        id: link.id,
        source_id: String(link.source),
        target_id: String(link.target),
        type: numToLinkType(link.type)
      });
    });

    return result;
  }

  function linkTypeToNum(type) {
    const map = { FS: 0, SS: 1, FF: 2, SF: 3 };
    return map[type] !== undefined ? map[type] : 0;
  }
  function numToLinkType(num) {
    const map = { 0: 'FS', 1: 'SS', 2: 'FF', 3: 'SF' };
    return map[num] !== undefined ? map[num] : 'FS';
  }

  // ============================================================
  // LOAD PROJECT
  // ============================================================

  function loadProject(input) {
    const data = ProjectFile.prepare(input);
    const ganttData = specToGantt(data.items, data.links);
    const previous = JSON.parse(JSON.stringify(gantt.serialize()));
    const oldState = { ...state };
    const oldName = document.getElementById('project-name').value;
    const oldScroll = gantt.getScrollState();
    const backup = recoveryProject || (state.project ? {
      schema_version: SCHEMA_VERSION,
      project: { ...state.project.project, name: oldName },
      ...ganttToSpec()
    } : null);
    applyingProject = true;
    try {
      gantt.clearAll();
      gantt.parse(ganttData, 'json');
      state.project = data;
      state.selectedTaskId = null;
      state.editingTaskId = null;
      state.editingLinkId = null;
      state.contextTaskId = null;
      document.getElementById('project-name').value = data.project.name;
      updateStatusBar();
      markClean();
      hideWelcome();
      recoveryProject = null;
      importReadVersion++;
    } catch (error) {
      Object.assign(state, oldState);
      document.getElementById('project-name').value = oldName;
      try {
        gantt.clearAll();
        gantt.parse(previous, 'json');
        if (oldState.selectedTaskId && gantt.isTaskExists(oldState.selectedTaskId)) {
          gantt.selectTask(oldState.selectedTaskId);
        }
        gantt.scrollTo(oldScroll.x, oldScroll.y);
        updateStatusBar();
      } catch (restoreError) {
        // Keep a downloadable copy even if the chart itself can no longer render.
        recoveryProject = backup;
        state.isDirty = !!backup;
        throw new Error(backup
          ? 'Не удалось восстановить диаграмму. Нажмите «Сохранить», чтобы скачать предыдущий план. ' + restoreError.message
          : 'Не удалось восстановить пустую диаграмму. Обновите страницу. ' + restoreError.message);
      } finally {
        document.getElementById('status-unsaved').classList.toggle('hidden', !state.isDirty);
        document.getElementById('status-saved').classList.toggle('hidden', state.isDirty || !state.project);
      }
      throw error;
    } finally {
      applyingProject = false;
    }
    scrollToToday();
    setTimeout(() => {
      if (state.project === data && data.items.length > 1) showLinkHint();
    }, 1500);
  }

  function replaceProject(data, onSuccess) {
    const apply = () => {
      try {
        loadProject(data);
        onSuccess();
      } catch (error) {
        showToast('Проект не загружен: ' + error.message, 'error');
      }
    };
    if (state.isDirty) {
      openConfirm('Заменить текущий проект? Несохранённые изменения будут потеряны.', apply);
    } else {
      apply();
    }
  }

  function readProjectFile(event, preview) {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;
    const version = ++importReadVersion;
    state.pendingImport = null;
    closeModal('import-modal-overlay');
    document.getElementById('btn-confirm-import').disabled = true;
    const reader = new FileReader();
    const failed = message => {
      if (version === importReadVersion) showToast('Ошибка чтения файла: ' + message, 'error');
    };
    reader.onerror = () => failed('не удалось прочитать файл');
    reader.onabort = () => failed('чтение прервано');
    reader.onload = () => {
      if (version !== importReadVersion) return;
      try {
        const data = ProjectFile.prepare(JSON.parse(reader.result));
        if (preview) {
          document.getElementById('import-warning').style.display = 'none';
          document.getElementById('import-name').textContent = data.project.name || '—';
          document.getElementById('import-schema').textContent = data.schema_version;
          document.getElementById('import-count').textContent = data.items.length;
          document.getElementById('import-links').textContent = data.links.length;
          state.pendingImport = data;
          document.getElementById('btn-confirm-import').disabled = false;
          openModal('import-modal-overlay', 'btn-cancel-import');
        } else {
          replaceProject(data, () => showToast('Проект загружен', 'success'));
        }
      } catch (error) {
        failed(error.message);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  // ============================================================
  // SAVE PROJECT
  // ============================================================

  function saveProject() {
    if (!state.project && !recoveryProject) {
      showToast('Сначала создайте или загрузите проект', 'info');
      return;
    }
    try {
      const projectName = document.getElementById('project-name').value.trim() || 'Проект';
      const data = ProjectFile.prepare(recoveryProject || {
        schema_version: SCHEMA_VERSION,
        project: {
          ...state.project.project,
          name: projectName,
          created_at: state.project.project.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        ...ganttToSpec()
      });
      const link = document.createElement('a');
      link.download = (data.project.name.replace(/[^а-яёa-z0-9_\-\s]/gi, '').trim() || 'project') + '_gantt.json';
      link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      document.body.appendChild(link);
      try { link.click(); } finally { link.remove(); }
      if (!recoveryProject) markClean();
      showToast('Скачивание JSON начато. Проверьте файл в загрузках браузера.', 'success');
    } catch (error) {
      showToast('Не удалось начать скачивание JSON: ' + error.message, 'error');
    }
  }

  // ============================================================
  // TASK EDITOR
  // ============================================================

  let newTaskBuffer = null;

  function openTaskEditor(id, newTask, isNew) {
    let task;
    if (isNew && newTask) {
      newTaskBuffer = newTask;
      task = newTask;
      document.getElementById('modal-title').textContent = 'Новая задача';
      document.getElementById('btn-delete-task').style.display = 'none';
    } else {
      newTaskBuffer = null;
      task = gantt.getTask(id);
      if (!task) return;
      document.getElementById('modal-title').textContent = 'Редактировать задачу';
      document.getElementById('btn-delete-task').style.display = '';
    }
    state.editingTaskId = id;

    // Fill form
    document.getElementById('edit-id').value = task.id || '';
    const titleEl = document.getElementById('edit-title');
    titleEl.value = task.raw_title || task.text.replace(/^[\p{Emoji}\s]+/u, '').trim() || '';

    const emoji = task.emoji || '📋';
    document.getElementById('emoji-trigger').textContent = emoji;

    // Type
    const typeSelect = document.getElementById('edit-type');
    const typeMap = {
      [gantt.config.types.project]: 'group',
      [gantt.config.types.milestone]: 'milestone',
      [gantt.config.types.task]: 'task'
    };
    typeSelect.value = typeMap[task.type] || 'task';

    // Status
    document.getElementById('edit-status').value = task.status || 'planned';

    // Dates — handle both Date objects and strings (e.g. for new tasks from addItemOfType)
    const fmt = gantt.date.date_to_str('%Y-%m-%d');
    const toDateStr = (v) => {
      if (!v) return '';
      if (typeof v === 'string') return v; // already 'YYYY-MM-DD'
      return fmt(v); // Date object
    };
    document.getElementById('edit-start').value = toDateStr(task.start_date);

    const endDateGroup = document.getElementById('end-date-group');
    if (task.type === gantt.config.types.milestone) {
      endDateGroup.style.display = 'none';
    } else {
      endDateGroup.style.display = '';
      // DHTMLX stores end_date exclusive (next day after last day).
      // Show the user the inclusive last day: subtract 1 day.
      const endForEdit = new Date(task.end_date);
      endForEdit.setDate(endForEdit.getDate() - 1);
      document.getElementById('edit-end').value = fmt(endForEdit);
    }

    // Progress
    const prog = Math.round((task.progress || 0) * 100);
    document.getElementById('edit-progress').value = prog;
    document.getElementById('progress-display').textContent = prog + '%';

    // Milestone hides progress
    const progressRow = document.getElementById('progress-row');
    progressRow.style.display = (task.type === gantt.config.types.milestone) ? 'none' : '';

    // Color
    document.getElementById('edit-color').value = task.color || '#3b82f6';
    document.querySelectorAll('.color-preset').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === task.color);
    });

    // Assignee / Notes
    document.getElementById('edit-assignee').value = task.assignee || '';
    document.getElementById('edit-notes').value = task.notes || '';

    openModal('modal-overlay', 'edit-title');
  }

  function saveTaskEdit() {
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value.trim();
    if (!title) { showToast('Название обязательно', 'error'); return; }

    const typeVal = document.getElementById('edit-type').value;
    const typeMap = { group: gantt.config.types.project, milestone: gantt.config.types.milestone, task: gantt.config.types.task };
    const ganttType = typeMap[typeVal] || gantt.config.types.task;

    const startStr = document.getElementById('edit-start').value;
    const endStr = typeVal === 'milestone'
      ? startStr
      : document.getElementById('edit-end').value;

    if (!startStr) { showToast('Укажите дату начала', 'error'); return; }
    if (typeVal !== 'milestone' && !endStr) { showToast('Укажите дату окончания', 'error'); return; }

    const startDate = gantt.date.str_to_date('%Y-%m-%d')(startStr);
    // User enters inclusive end date → convert to exclusive (next day) for DHTMLX
    const endDateInclusive = gantt.date.str_to_date('%Y-%m-%d')(endStr);
    const endDate = new Date(endDateInclusive);
    if (typeVal !== 'milestone') endDate.setDate(endDate.getDate() + 1);

    if (typeVal !== 'milestone' && endDateInclusive < startDate) {
      showToast('Дата окончания не может быть раньше даты начала', 'error'); return;
    }

    const emoji = document.getElementById('emoji-trigger').textContent.trim();
    const color = document.getElementById('edit-color').value;
    const progress = parseInt(document.getElementById('edit-progress').value) / 100;
    const status = document.getElementById('edit-status').value;
    const assignee = document.getElementById('edit-assignee').value.trim();
    const notes = document.getElementById('edit-notes').value.trim();

    if (newTaskBuffer) {
      // New task — add to gantt
      // text stores ONLY the title; emoji is stored separately and rendered by column template
      const newId = typeVal + '_' + Date.now();
      // end_date for addTask: if passed as string DHTMLX adds 1 day automatically;
      // pass as Date object (already +1 day) to keep consistent with updateTask path.
      gantt.addTask({
        id: newId,
        text: title,
        raw_title: title,
        start_date: startDate,
        end_date: endDate,  // exclusive Date object
        type: ganttType,
        color: color,
        emoji: emoji,
        progress: progress,
        status: status,
        assignee: assignee,
        notes: notes,
        parent: newTaskBuffer.parent || 0,
        open: true
      });
      newTaskBuffer = null;
    } else {
      // Update existing
      const task = gantt.getTask(id);
      if (!task) return;
      // text stores ONLY the title; emoji stored separately
      task.text = title;
      task.raw_title = title;
      task.start_date = startDate;
      task.end_date = endDate;
      task.type = ganttType;
      task.color = color;
      task.emoji = emoji;
      task.progress = progress;
      task.status = status;
      task.assignee = assignee;
      task.notes = notes;
      gantt.updateTask(id);
    }

    markDirty();
    closeModal('modal-overlay');
    showToast('Изменения применены к плану', 'success');
  }

  function deleteTask(id) {
    if (!id) return;
    const task = gantt.getTask(id);
    if (!task) return;
    const name = task.raw_title || task.text;
    openConfirm(`Удалить «${name}» и все дочерние элементы?`, () => {
      gantt.deleteTask(id);
      markDirty();
      showToast('Удалено', 'success');
    });
  }

  // ============================================================
  // LINK EDITOR
  // ============================================================

  function openLinkEditor(id) {
    const link = gantt.getLink(id);
    if (!link) return;
    state.editingLinkId = id;
    document.getElementById('link-type').value = link.type || 0;
    openModal('link-modal-overlay', 'link-type');
  }

  function saveLinkEdit() {
    if (!state.editingLinkId) return;
    const link = gantt.getLink(state.editingLinkId);
    if (!link) return;
    link.type = parseInt(document.getElementById('link-type').value);
    gantt.updateLink(state.editingLinkId);
    markDirty();
    closeModal('link-modal-overlay');
    showToast('Зависимость обновлена', 'success');
  }

  function deleteLinkEdit() {
    if (!state.editingLinkId) return;
    openConfirm('Удалить эту зависимость?', () => {
      gantt.deleteLink(state.editingLinkId);
      markDirty();
      closeModal('link-modal-overlay');
      showToast('Зависимость удалена', 'success');
    });
  }

  // ============================================================
  // CONTEXT MENU
  // ============================================================

  function showContextMenu(event, taskId) {
    state.contextTaskId = taskId;
    const menu = document.getElementById('context-menu');
    menu.classList.remove('hidden');
    const x = Math.min(event.clientX, window.innerWidth - 200);
    const y = Math.min(event.clientY, window.innerHeight - 180);
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }

  function hideContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
    state.contextTaskId = null;
  }

  // ============================================================
  // CONFIRM DIALOG
  // ============================================================

  function openConfirm(text, onConfirm) {
    document.getElementById('confirm-text').textContent = text;
    state.pendingDelete = onConfirm;
    openModal('confirm-modal-overlay', 'btn-cancel-confirm');
  }

  // ============================================================
  // MODALS
  // ============================================================

  const modalStack = [];
  function modalControls(el) {
    return [...el.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')]
      .filter(control => !control.disabled && control.tabIndex >= 0 && control.getClientRects().length);
  }

  function openModal(id, focusId) {
    const el = document.getElementById(id);
    if (!modalStack.some(entry => entry.el === el)) {
      modalStack.push({ el, opener: document.activeElement });
    }
    el.classList.remove('hidden');
    (document.getElementById(focusId) || modalControls(el)[0] || el).focus();
  }

  function closeModal(id) {
    if (id === 'import-modal-overlay') state.pendingImport = null;
    if (id === 'confirm-modal-overlay') state.pendingDelete = null;
    const el = document.getElementById(id);
    const index = modalStack.findIndex(entry => entry.el === el);
    const wasTop = index >= 0 && index === modalStack.length - 1;
    const entry = index >= 0 ? modalStack.splice(index, 1)[0] : null;
    if (el) el.classList.add('hidden');
    document.getElementById('emoji-picker')?.classList.add('hidden');
    if (wasTop) {
      const top = modalStack.at(-1)?.el;
      const opener = entry.opener;
      if (opener && opener !== document.body && !opener.disabled && opener.isConnected && opener.getClientRects().length
          && (!top || top.contains(opener))) {
        opener.focus();
      } else {
        (top ? modalControls(top)[0] || top : document.getElementById('gantt-container')).focus();
      }
    }
  }

  // ============================================================
  // STATUS / DIRTY
  // ============================================================

  function markDirty() {
    if (applyingProject || !state.project) return;
    state.isDirty = true;
    document.getElementById('status-unsaved').classList.remove('hidden');
    document.getElementById('status-saved').classList.add('hidden');
    updateStatusBar();
  }

  function markClean() {
    state.isDirty = false;
    document.getElementById('status-unsaved').classList.add('hidden');
    document.getElementById('status-saved').classList.remove('hidden');
  }

  function updateStatusBar() {
    let taskCount = 0;
    try { gantt.eachTask(() => taskCount++); } catch (e) {}
    document.getElementById('status-tasks').textContent = `${taskCount} элементов`;
    const selected = state.selectedTaskId && gantt.isTaskExists(state.selectedTaskId)
      ? gantt.getTask(state.selectedTaskId) : null;
    if (!selected) state.selectedTaskId = null;
    document.getElementById('status-selected').textContent = selected
      ? `Выбрано: ${selected.raw_title || selected.text}` : 'Ничего не выбрано';
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function scrollToToday() {
    setTimeout(() => {
      const today = new Date();
      const state = gantt.getScrollState();
      const pos = gantt.posFromDate(today);
      // Center today in the viewport; clamp to 0 if before timeline start
      const centerOffset = Math.floor(state.inner_width / 2);
      const targetX = Math.max(0, pos - centerOffset);
      gantt.scrollTo(targetX, null);
    }, 100);
  }

  // ============================================================
  // GROUP DATE RECALCULATION
  // ============================================================
  let recalculatingParents = false;
  function recalcParentDates(taskId, includeSelf = false) {
    if (applyingProject || recalculatingParents || !gantt.isTaskExists(taskId)) return;
    recalculatingParents = true;
    try {
      let parentId = includeSelf ? taskId : gantt.getTask(taskId).parent;
      while (parentId && parentId !== '0' && gantt.isTaskExists(parentId)) {
        const parent = gantt.getTask(parentId);
        const children = gantt.getChildren(parentId).map(id => gantt.getTask(id));
        if (children.length && parent.type !== gantt.config.types.milestone) {
          const start = new Date(Math.min(...children.map(child => +child.start_date)));
          const end = new Date(Math.max(...children.map(child => +child.end_date)));
          const duration = gantt.calculateDuration({ start_date: start, end_date: end, task: parent });
          if (+parent.start_date !== +start || +parent.end_date !== +end || parent.duration !== duration) {
            parent.start_date = start;
            parent.end_date = end;
            parent.duration = duration;
            gantt.updateTask(parentId);
          }
        }
        parentId = parent.parent;
      }
    } finally {
      recalculatingParents = false;
    }
  }

  // ============================================================
  // LINK CREATION HINT
  // ============================================================
  let _linkHintVisible = false;

  function showLinkHint() {
    if (_linkHintVisible) return;
    _linkHintVisible = true;
    let hint = document.getElementById('link-hint-bar');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'link-hint-bar';
      hint.className = 'link-hint-bar';
      hint.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        <span>
          <strong>Создание связи:</strong> наведите мышь на правый край полосы задачи — появится кружок-якорь,
          перетащите его на другую задачу. Двойной клик по стрелке — изменить тип.
        </span>
        <button class="link-hint-close" id="link-hint-close" aria-label="Закрыть подсказку">✕</button>
      `;
      document.body.appendChild(hint);
      document.getElementById('link-hint-close').addEventListener('click', hideLinkHint);
    } else {
      hint.classList.remove('hidden');
    }
  }

  function hideLinkHint() {
    _linkHintVisible = false;
    const hint = document.getElementById('link-hint-bar');
    if (hint) hint.classList.add('hidden');
  }

  function detectCycle(sourceId, targetId) {
    sourceId = String(sourceId);
    const visited = new Set();
    function dfs(id) {
      if (id === sourceId) return true;
      if (visited.has(id)) return false;
      visited.add(id);
      const links = gantt.getLinks().filter(l => String(l.source) === String(id));
      for (const l of links) {
        if (dfs(String(l.target))) return true;
      }
      return false;
    }
    return dfs(String(targetId));
  }

  function getStatusDot(status) {
    const colors = {
      planned: '#6366f1', in_progress: '#0891b2', done: '#16a34a', blocked: '#dc2626'
    };
    const col = colors[status] || 'transparent';
    return `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${col};margin-left:6px;flex-shrink:0;"></span>`;
  }

  function getStatusLabel(status) {
    const map = { planned: 'Запланировано', in_progress: 'В работе', done: 'Завершено', blocked: 'Блокировано' };
    return map[status] || status;
  }

  // Toast notification
  function showToast(msg, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type || 'info'}`;
    toast.textContent = msg;
    toast.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:9999;
      padding:10px 16px; border-radius:8px; font-size:13px; font-weight:500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: toastIn 200ms cubic-bezier(0.16,1,0.3,1);
      color:white;
      background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#0284c7'};
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 300ms'; setTimeout(() => toast.remove(), 300); }, 2500);
  }

  // Returns the group/task id that should be the parent for a new item.
  // If parentId is explicitly provided, use it.
  // Otherwise, if a task is selected: for groups add at root; for task/milestone
  // add inside the selected task's parent group (or the task itself if it's a group).
  function resolveParentId(type, explicitParentId) {
    if (explicitParentId !== undefined) return explicitParentId;
    if (type === 'group') return 0; // groups always at root
    const selId = state.selectedTaskId;
    if (!selId || !gantt.isTaskExists(selId)) return 0;
    const sel = gantt.getTask(selId);
    // If selected is a project/group, add inside it
    if (sel.type === gantt.config.types.project) return selId;
    // Otherwise add inside the selected task's parent
    const parentId = sel.parent;
    if (parentId && parentId !== 0 && parentId !== '0' && gantt.isTaskExists(parentId)) {
      return parentId;
    }
    return 0;
  }

  function addItemOfType(type, parentId) {
    // Guard: must have a project open
    if (!state.project) {
      showToast('Сначала создайте или загрузите проект', 'info');
      return;
    }
    const defaults = {
      group: { emoji: '📦', title: 'Новая группа', color: '#6366f1' },
      task: { emoji: '📋', title: 'Новая задача', color: '#3b82f6' },
      milestone: { emoji: '🚩', title: 'Новая веха', color: '#f59e0b' }
    };
    const def = defaults[type] || defaults.task;
    const today = new Date();
    const todayStr = gantt.date.date_to_str('%Y-%m-%d')(today);
    const endDate = new Date(today); endDate.setDate(endDate.getDate() + 7);
    const endStr = gantt.date.date_to_str('%Y-%m-%d')(endDate);

    const typeMap = { group: gantt.config.types.project, milestone: gantt.config.types.milestone, task: gantt.config.types.task };

    const newTask = {
      id: type + '_' + Date.now(),
      text: def.emoji + ' ' + def.title,
      raw_title: def.title,
      start_date: todayStr,
      end_date: type === 'milestone' ? todayStr : endStr,
      type: typeMap[type],
      color: def.color,
      emoji: def.emoji,
      progress: 0,
      status: 'planned',
      assignee: '',
      notes: '',
      parent: resolveParentId(type, parentId),
      open: true
    };

    openTaskEditor(null, newTask, true);
  }

  // ============================================================
  // COLUMN RESIZE (custom, since DHTMLX GPL doesn't expose it)
  // ============================================================

  function initColumnResize() {
    const HANDLE_W = 6; // px from right edge of header cell = drag zone
    const MIN_W    = 36;

    let dragState = null;

    function attachHandles() {
      const heads = document.querySelectorAll('.gantt_grid_head_cell');
      heads.forEach((cell, idx) => {
        // Avoid double-binding
        if (cell.__colResizeAttached) return;
        cell.__colResizeAttached = true;

        cell.addEventListener('mousemove', (e) => {
          const rect = cell.getBoundingClientRect();
          const fromRight = rect.right - e.clientX;
          cell.style.cursor = fromRight <= HANDLE_W ? 'col-resize' : '';
        });
        cell.addEventListener('mouseleave', () => {
          if (!dragState) cell.style.cursor = '';
        });
        cell.addEventListener('mousedown', (e) => {
          const rect = cell.getBoundingClientRect();
          const fromRight = rect.right - e.clientX;
          if (fromRight > HANDLE_W) return;
          e.preventDefault();
          e.stopPropagation();
          dragState = { colIdx: idx, startX: e.clientX, startW: gantt.config.columns[idx]?.width || 100 };
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        });
      });
    }

    document.addEventListener('mousemove', (e) => {
      if (!dragState) return;
      const delta = e.clientX - dragState.startX;
      const newW  = Math.max(MIN_W, dragState.startW + delta);
      const col   = gantt.config.columns[dragState.colIdx];
      if (!col || newW === col.width) return;
      // Store the delta vs original to adjust grid_width by the same amount,
      // leaving every OTHER column width untouched.
      const widthDelta = newW - col.width;
      col.width = newW;
      gantt.config.grid_width = (gantt.config.grid_width || 530) + widthDelta;
      gantt.render();
      requestAnimationFrame(attachHandles);
    });

    document.addEventListener('mouseup', () => {
      if (!dragState) return;
      dragState = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });

    // Initial attach + re-attach after every render
    gantt.attachEvent('onGanttRender', () => {
      requestAnimationFrame(attachHandles);
    });
    requestAnimationFrame(attachHandles);
  }

  // ============================================================
  // EVENT BINDINGS
  // ============================================================

  function bindUI() {
    // Theme toggle
    const themeBtn = document.querySelector('[data-theme-toggle]');
    const html = document.documentElement;
    let theme = 'light';
    html.setAttribute('data-theme', theme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', theme);
        gantt.render();
      });
    }

    // Zoom buttons
    document.querySelectorAll('.zoom-btn').forEach(btn => {
      btn.addEventListener('click', () => setScale(btn.dataset.zoom));
    });

    // Link help button
    document.getElementById('btn-link-help')?.addEventListener('click', showLinkHint);

    // Today button
    document.getElementById('btn-today')?.addEventListener('click', scrollToToday);

    // Export dropdown toggle
    const exportDropdown = document.getElementById('export-dropdown');
    const exportBtn      = document.getElementById('btn-export');
    if (exportDropdown && exportBtn) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportDropdown.classList.toggle('open');
      });
      document.addEventListener('click', () => {
        exportDropdown.classList.remove('open');
      });
    }

    for (const format of ['png', 'jpeg', 'pdf', 'xlsx']) {
      document.getElementById('btn-export-' + format)?.addEventListener('click', () => {
        exportDropdown?.classList.remove('open');
        exportGantt(format);
      });
    }

    // Add buttons
    document.getElementById('btn-add-group')?.addEventListener('click', () => addItemOfType('group'));
    document.getElementById('btn-add-task')?.addEventListener('click', () => addItemOfType('task'));
    document.getElementById('btn-add-milestone')?.addEventListener('click', () => addItemOfType('milestone'));

    document.getElementById('project-name').addEventListener('input', markDirty);
    document.getElementById('btn-new-project')?.addEventListener('click', openNewProjectModal);
    document.getElementById('btn-save')?.addEventListener('click', saveProject);
    document.getElementById('file-input')?.addEventListener('change', e => readProjectFile(e, true));

    document.getElementById('btn-confirm-import')?.addEventListener('click', () => {
      const data = state.pendingImport;
      if (!data) return;
      closeModal('import-modal-overlay');
      replaceProject(data, () => showToast('Проект загружен', 'success'));
    });
    document.getElementById('btn-cancel-import')?.addEventListener('click', () => closeModal('import-modal-overlay'));
    document.getElementById('import-modal-close')?.addEventListener('click', () => closeModal('import-modal-overlay'));

    // Task editor
    document.getElementById('modal-close')?.addEventListener('click', () => closeModal('modal-overlay'));
    document.getElementById('btn-cancel-edit')?.addEventListener('click', () => closeModal('modal-overlay'));
    document.getElementById('btn-save-task')?.addEventListener('click', saveTaskEdit);
    document.getElementById('btn-delete-task')?.addEventListener('click', () => {
      closeModal('modal-overlay');
      deleteTask(state.editingTaskId);
    });

    // Progress slider
    document.getElementById('edit-progress')?.addEventListener('input', function () {
      document.getElementById('progress-display').textContent = this.value + '%';
    });

    // Type change — hide/show end date & progress for milestone
    document.getElementById('edit-type')?.addEventListener('change', function () {
      const isMilestone = this.value === 'milestone';
      document.getElementById('end-date-group').style.display = isMilestone ? 'none' : '';
      document.getElementById('progress-row').style.display = isMilestone ? 'none' : '';
    });

    // Emoji picker
    const emojiTrigger = document.getElementById('emoji-trigger');
    const emojiPicker = document.getElementById('emoji-picker');
    if (emojiTrigger && emojiPicker) {
      emojiTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('hidden');
      });
      // Build emoji items from text
      const emojis = emojiPicker.querySelector('.emoji-grid').textContent.trim().split(/\s+/);
      emojiPicker.querySelector('.emoji-grid').innerHTML = '';
      emojis.forEach(em => {
        if (!em) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'emoji-picker-item';
        button.textContent = em;
        button.title = em;
        button.addEventListener('click', () => {
          emojiTrigger.textContent = em;
          emojiPicker.classList.add('hidden');
          emojiTrigger.focus();
        });
        emojiPicker.querySelector('.emoji-grid').appendChild(button);
      });
      document.addEventListener('click', () => emojiPicker.classList.add('hidden'));
    }

    // Color presets
    document.querySelectorAll('.color-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('edit-color').value = btn.dataset.color;
        document.querySelectorAll('.color-preset').forEach(b => b.classList.toggle('selected', b === btn));
      });
    });

    // Link editor
    document.getElementById('link-modal-close')?.addEventListener('click', () => closeModal('link-modal-overlay'));
    document.getElementById('btn-cancel-link')?.addEventListener('click', () => closeModal('link-modal-overlay'));
    document.getElementById('btn-save-link')?.addEventListener('click', saveLinkEdit);
    document.getElementById('btn-delete-link')?.addEventListener('click', deleteLinkEdit);

    // New project modal
    document.getElementById('new-project-close')?.addEventListener('click', () => {
      closeModal('new-project-modal-overlay');
      if (!state.project) showWelcome();
    });
    document.getElementById('btn-cancel-new-project')?.addEventListener('click', () => {
      closeModal('new-project-modal-overlay');
      if (!state.project) showWelcome();
    });
    document.getElementById('btn-create-project')?.addEventListener('click', createNewProject);
    document.getElementById('new-project-name')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') createNewProject();
    });

    // Confirm modal
    document.getElementById('btn-cancel-confirm')?.addEventListener('click', () => closeModal('confirm-modal-overlay'));
    document.getElementById('btn-ok-confirm')?.addEventListener('click', () => {
      const action = state.pendingDelete;
      closeModal('confirm-modal-overlay');
      if (action) action();
    });

    // Context menu
    document.getElementById('ctx-edit')?.addEventListener('click', () => {
      const id = state.contextTaskId;
      hideContextMenu();
      if (id) openTaskEditor(id);
    });
    document.getElementById('ctx-add-child')?.addEventListener('click', () => {
      const id = state.contextTaskId;
      hideContextMenu();
      if (id) addItemOfType('task', id);
    });
    document.getElementById('ctx-duplicate')?.addEventListener('click', () => {
      const id = state.contextTaskId;
      hideContextMenu();
      if (!id) return;
      const original = gantt.getTask(id);
      if (!original) return;
      const copy = Object.assign({}, original, {
        id: 'task_' + Date.now(),
        text: original.text + ' (копия)',
        raw_title: (original.raw_title || original.text) + ' (копия)'
      });
      gantt.addTask(copy, original.parent);
      markDirty();
      showToast('Элемент дублирован', 'success');
    });
    document.getElementById('ctx-delete')?.addEventListener('click', () => {
      const id = state.contextTaskId;
      hideContextMenu();
      if (id) deleteTask(id);
    });

    // Close context menu on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#context-menu')) hideContextMenu();
    });
    document.addEventListener('focusin', (e) => {
      const top = modalStack.at(-1)?.el;
      if (top && !top.contains(e.target)) (modalControls(top)[0] || top).focus();
    });
    document.addEventListener('keydown', (e) => {
      const top = modalStack.at(-1)?.el;
      if (e.key === 'Tab' && top) {
        const controls = modalControls(top);
        const first = controls[0] || top;
        const last = controls.at(-1) || top;
        if (e.shiftKey ? document.activeElement === first || !controls.includes(document.activeElement)
          : document.activeElement === last || !controls.includes(document.activeElement)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        const picker = document.getElementById('emoji-picker');
        if (top?.id === 'modal-overlay' && !picker.classList.contains('hidden')) {
          picker.classList.add('hidden');
          document.getElementById('emoji-trigger').focus();
        } else if (top) {
          closeModal(top.id);
          if (top.id === 'new-project-modal-overlay' && !state.project) showWelcome();
        }
        hideContextMenu();
      }
    });

    // Warn about unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }


  // ============================================================
  // WELCOME / EMPTY STATE
  // ============================================================

  function showWelcome() {
    gantt.clearAll();
    document.getElementById('project-name').value = '';
    document.getElementById('status-tasks').textContent = '0 элементов';
    document.getElementById('status-unsaved').classList.add('hidden');
    document.getElementById('status-saved').classList.add('hidden');
    state.isDirty = false;
    state.project = null;
    state.selectedTaskId = null;
    updateStatusBar();

    // Show welcome overlay inside gantt container
    const container = document.getElementById('gantt-container');
    let overlay = document.getElementById('welcome-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'welcome-overlay';
      overlay.innerHTML = `
        <div class="welcome-card">
          <div class="welcome-logo">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" width="56" height="56">
              <rect x="4" y="12" width="20" height="7" rx="3" fill="#2563eb"/>
              <rect x="16" y="22" width="26" height="7" rx="3" fill="#10b981"/>
              <rect x="6" y="32" width="18" height="7" rx="3" fill="#2563eb" opacity="0.5"/>
              <circle cx="38" cy="15" r="4" fill="#f59e0b"/>
            </svg>
          </div>
          <h1 class="welcome-title">GanttFlow</h1>
          <p class="welcome-subtitle">Дорожная карта вашего проекта</p>
          <div class="welcome-actions">
            <button class="btn btn--primary welcome-btn" id="welcome-new-btn" data-testid="button-welcome-new">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Создать новый проект
            </button>
            <label class="btn btn--outline welcome-btn" data-testid="button-welcome-load" style="cursor:pointer;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Загрузить из файла
              <input type="file" id="welcome-file-input" accept=".json" style="display:none;" />
            </label>
            <button class="btn btn--ghost welcome-btn welcome-demo-btn" id="welcome-demo-btn" data-testid="button-welcome-demo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
              Открыть демо-проект
            </button>
          </div>
          <p class="welcome-hint">Drag &amp; drop · Зависимости · JSON экспорт/импорт · Темная тема</p>
        </div>
      `;
      container.style.position = 'relative';
      container.appendChild(overlay);

      overlay.querySelector('#welcome-new-btn').addEventListener('click', () => {
        hideWelcome();
        openNewProjectModal();
      });
      overlay.querySelector('#welcome-demo-btn').addEventListener('click', () => {
        replaceProject(SAMPLE_PROJECT, () => showToast('Демо-проект загружен', 'success'));
      });
      overlay.querySelector('#welcome-file-input').addEventListener('change', e => readProjectFile(e, false));
    } else {
      overlay.classList.remove('hidden');
    }
  }

  function hideWelcome() {
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function openNewProjectModal() {
    document.getElementById('new-project-name').value = 'Новый проект';
    document.getElementById('new-project-desc').value = '';
    openModal('new-project-modal-overlay', 'new-project-name');
    document.getElementById('new-project-name').select();
  }

  function createNewProject() {
    const name = document.getElementById('new-project-name').value.trim();
    if (!name) { showToast('Укажите название проекта', 'error'); return; }
    const desc = document.getElementById('new-project-desc').value.trim();
    const now = new Date().toISOString();
    const blankProject = {
      schema_version: SCHEMA_VERSION,
      project: {
        id: 'proj_' + Date.now(),
        name: name,
        description: desc,
        created_at: now,
        updated_at: now
      },
      items: [],
      links: []
    };
    replaceProject(blankProject, () => {
      closeModal('new-project-modal-overlay');
      markDirty();
      showToast('Проект «' + name + '» создан', 'success');
    });
  }

  // ============================================================
  // EXPORT DIAGRAM
  // ============================================================

  function showExportOverlay() {
    let ov = document.getElementById('export-progress-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'export-progress-overlay';
      ov.className = 'export-overlay';
      ov.innerHTML = '<div class="export-overlay-card"><div class="export-spinner"></div><span>Подготовка файла…</span></div>';
      document.body.appendChild(ov);
    }
    ov.style.display = 'flex';
  }

  function hideExportOverlay() {
    const ov = document.getElementById('export-progress-overlay');
    if (ov) ov.style.display = 'none';
  }

  async function loadExportLibrary(name, url) {
    if (window[name]) return window[name];
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        script.remove();
        if (window[name]) resolve(window[name]);
        else reject(new Error('Библиотека экспорта недоступна'));
      };
      script.onerror = () => {
        script.remove();
        reject(new Error('Не удалось загрузить библиотеку экспорта. Проверьте интернет и повторите.'));
      };
      document.head.appendChild(script);
    });
  }

  async function exportPdf(png, width, height, name) {
    const bytes = new Uint8Array(await png.arrayBuffer());
    const { PDFDocument, PageSizes } = await loadExportLibrary('PDFLib', 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
    const pdf = await PDFDocument.create();
    pdf.setTitle(name);
    const page = pdf.addPage([PageSizes.A4[1], PageSizes.A4[0]]);
    const picture = await pdf.embedPng(bytes);
    // ponytail: one landscape sheet; paginate if readable printed large plans are required.
    const scale = Math.min((page.getWidth() - 56) / width, (page.getHeight() - 56) / height);
    page.drawImage(picture, { x: (page.getWidth() - width * scale) / 2,
      y: (page.getHeight() - height * scale) / 2, width: width * scale, height: height * scale });
    return new Blob([await pdf.save()], { type: 'application/pdf' });
  }

  async function exportExcel(name, plan) {
    const { Workbook } = await loadExportLibrary('ExcelJS', 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js');
    const workbook = new Workbook();
    workbook.creator = 'GanttFlow';
    workbook.title = name;
    workbook.calcProperties.fullCalcOnLoad = true;
    const tasks = workbook.addWorksheet('Диаграмма');
    tasks.columns = [
      ['ID', 18], ['ID родителя', 18], ['Тип', 12], ['Название', 36],
      ['Начало', 14], ['Окончание', 14], ['Прогресс', 12], ['Статус', 18],
      ['Ответственный', 24], ['Заметки', 55]
    ].map(([header, width]) => ({ header, width }));
    const types = { group: 'Группа', task: 'Задача', milestone: 'Веха' };
    const depths = new Map();
    let firstDate = Infinity, lastDate = -Infinity;
    for (const item of plan.items) {
      // UTC calendar dates avoid shifting Excel dates in different browser time zones.
      const start = new Date(item.start_date + 'T00:00:00Z');
      const end = new Date(item.end_date + 'T00:00:00Z');
      if (item.type !== 'milestone') end.setUTCDate(end.getUTCDate() - 1);
      const row = tasks.addRow([String(item.id), item.parent_id || '', types[item.type], item.title,
        start, end, item.progress / 100, getStatusLabel(item.status), item.assignee, item.notes]);
      firstDate = Math.min(firstDate, start.getTime());
      lastDate = Math.max(lastDate, end.getTime(), start.getTime());
      const depth = item.parent_id ? (depths.get(item.parent_id) || 0) + 1 : 0;
      depths.set(String(item.id), depth);
      row.outlineLevel = Math.min(depth, 7);
      row.getCell(4).alignment = { indent: Math.min(depth, 15), vertical: 'middle' };
      if (item.type === 'group') row.font = { bold: true };
      row.height = 24;
    }
    tasks.getColumn(5).numFmt = tasks.getColumn(6).numFmt = 'dd.mm.yyyy';
    tasks.getColumn(7).numFmt = '0%';
    const links = workbook.addWorksheet('Связи');
    links.columns = [['ID', 18], ['ID предшественника', 24], ['ID последователя', 24], ['Тип', 12]]
      .map(([header, width]) => ({ header, width }));
    for (const link of plan.links) links.addRow([String(link.id), link.source_id, link.target_id, link.type]);
    for (const sheet of [tasks, links]) {
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: sheet.rowCount, column: sheet === tasks ? 10 : 4 } };
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      sheet.getRow(1).height = 24;
      sheet.eachRow(row => { row.eachCell(cell => { cell.alignment = { ...cell.alignment, vertical: 'middle', wrapText: true }; }); });
    }
    // Keep metadata available without pushing the calendar off-screen.
    for (const column of [1, 2, 8, 9, 10]) tasks.getColumn(column).hidden = true;
    tasks.views = [{ state: 'frozen', xSplit: 7, ySplit: 1, topLeftCell: 'K2', showGridLines: true }];
    tasks.properties.outlineProperties = { summaryBelow: false };
    const day = 86400000;
    if (!plan.items.length) {
      const today = new Date();
      firstDate = lastDate = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    }
    // ponytail: a fixed daily grid plus 30 days; extend columns for larger edits in Excel.
    const days = Math.round((lastDate - firstDate) / day) + 31;
    if (days > 16374) throw new Error('Период слишком большой для дневной шкалы Excel (максимум 16374 столбца дат).');
    const lastRow = Math.max(2, tasks.rowCount);
    for (let offset = 0; offset < days; offset++) {
      const col = tasks.getColumn(11 + offset);
      col.width = 5;
      const cell = tasks.getCell(1, 11 + offset);
      const dateSerial = firstDate / day + 25569 + offset;
      cell.value = { formula: plan.items.length
        ? `MIN($E$2:$E$${lastRow})+${offset}` : `TODAY()+${offset}`, result: dateSerial };
      cell.numFmt = 'dd.mm';
      cell.alignment = { horizontal: 'center', vertical: 'middle', textRotation: 90 };
    }
    tasks.getRow(1).height = 48;
    tasks.getCell('K1').note = 'Дневная шкала от минимальной даты начала, запас 30 дней. Меняйте даты и прогресс в строках. При большом продлении расширьте сетку или выгрузите файл заново.';
    const lastColumn = tasks.getColumn(10 + days).letter;
    plan.items.forEach((item, index) => {
      const row = index + 2;
      const valid = `AND(ISNUMBER($E${row}),ISNUMBER($F${row}),K$1>=$E${row},K$1<=$F${row})`;
      const color = 'FF' + item.color.replace('#', '').toUpperCase();
      const edge = { style: 'thin', color: { argb: 'FF334155' } };
      const border = { top: edge, bottom: edge };
      const fill = argb => ({ border, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb }, bgColor: { argb } } });
      tasks.addConditionalFormatting({ ref: `K${row}:${lastColumn}${row}`, rules: [
        { type: 'expression', formulae: [`AND(${valid},K$1=$E${row},K$1=$F${row})`],
          style: { border: { ...border, left: edge, right: edge } } },
        { type: 'expression', formulae: [`AND(${valid},K$1=$E${row})`],
          style: { border: { ...border, left: edge } } },
        { type: 'expression', formulae: [`AND(${valid},K$1=$F${row})`],
          style: { border: { ...border, right: edge } } },
        { type: 'expression', formulae: [`AND(${valid},K$1<$E${row}+ROUND(($F${row}-$E${row}+1)*$G${row},0))`],
          style: fill('FF1E3A5F') },
        { type: 'expression', formulae: [valid], style: fill(color) }
      ] });
    });
    return new Blob([await workbook.xlsx.writeBuffer()], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  let exportingFile = false;

  async function exportGantt(format) {
    if (exportingFile) return;
    if (!state.project) {
      showToast('Откройте проект перед экспортом', 'error');
      return;
    }
    if (!['png', 'jpeg', 'pdf', 'xlsx'].includes(format)) return;
    exportingFile = true;
    let downloadLink = null;
    let downloadUrl = null;
    try {
      const name = document.getElementById('project-name').value;
      const projectName = name.replace(/[^а-яёa-z0-9_\-\s]/gi, '').trim() || 'gantt';
      const today = new Date();
      const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
      let blob;
      showExportOverlay();
      if (format === 'xlsx') {
        blob = await exportExcel(name, ganttToSpec());
      } else {
        const container = document.getElementById('gantt-container');
        const savedScroll = gantt.getScrollState();
        const savedHeight = container.style.height;
        const savedMinHeight = container.style.minHeight;
        const savedWidth = container.style.width;
        const savedMinWidth = container.style.minWidth;
        const savedGridWidth = gantt.config.grid_width;
        const savedKeepGridWidth = gantt.config.keep_grid_width;
        const panels = [...document.querySelectorAll('.toolbar, .status-bar, .link-hint-bar')]
          .map(element => ({ element, visibility: element.style.visibility }));
        const backgroundColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '#161b22' : '#ffffff';
        const painted = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        let imageWidth, imageHeight;
        try {
          panels.forEach(({ element }) => { element.style.visibility = 'hidden'; });
          const chart = container.querySelector('.gantt_task');
          const scale = container.querySelector('.gantt_task_scale');
          if (!chart || !scale) throw new Error('Диаграмма не готова к экспорту');
          const totalHeight = scale.offsetHeight + Math.max(1, gantt.getVisibleTaskCount()) * gantt.config.row_height;
          const timelineX = Math.round(chart.getBoundingClientRect().left - container.getBoundingClientRect().left);
          const totalWidth = timelineX + scale.scrollWidth;
          if (totalWidth <= 0 || totalHeight <= 0) throw new Error('Недостаточно места для экспорта диаграммы');
          const scrollbarHeight = container.offsetHeight - chart.offsetHeight;
          const scrollbarWidth = container.offsetWidth - timelineX - chart.clientWidth;
          // html-to-image clones DOM, not scroll offsets. Render the whole chart at scroll=0.
          // ponytail: one full canvas; use tiled rendering if browser canvas limits become a requirement.
          gantt.config.keep_grid_width = true;
          gantt.config.grid_width = container.querySelector('.gantt_grid').offsetWidth;
          container.style.width = container.style.minWidth = (totalWidth + scrollbarWidth) + 'px';
          container.style.height = container.style.minHeight = (totalHeight + scrollbarHeight) + 'px';
          gantt.setSizes();
          gantt.scrollTo(0, 0);
          await painted();
          const canvas = await htmlToImage.toCanvas(container, {
            backgroundColor, pixelRatio: 1, skipFonts: true, cacheBust: false,
            width: totalWidth, height: totalHeight
          });
          imageWidth = canvas.width;
          imageHeight = canvas.height;
          blob = await new Promise((resolve, reject) => canvas.toBlob(
            result => result ? resolve(result) : reject(new Error('Не удалось закодировать изображение')),
            format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.92
          ));
        } finally {
          panels.forEach(({ element, visibility }) => { element.style.visibility = visibility; });
          container.style.height = savedHeight;
          container.style.minHeight = savedMinHeight;
          container.style.width = savedWidth;
          container.style.minWidth = savedMinWidth;
          gantt.config.grid_width = savedGridWidth;
          gantt.config.keep_grid_width = savedKeepGridWidth;
          try { gantt.setSizes(); } finally { gantt.scrollTo(savedScroll.x, savedScroll.y); }
        }
        if (format === 'pdf') {
          blob = await exportPdf(blob, imageWidth, imageHeight, name);
        }
      }
      downloadUrl = URL.createObjectURL(blob);
      downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${projectName}_${date}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      showToast('Скачивание ' + format.toUpperCase() + ' начато', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Ошибка экспорта: ' + error.message, 'error');
    } finally {
      downloadLink?.remove();
      if (downloadUrl) {
        const url = downloadUrl;
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
      hideExportOverlay();
      exportingFile = false;
    }
  }

  // ============================================================
  // INIT
  // ============================================================

  document.addEventListener('DOMContentLoaded', function () {
    initGantt();
    bindUI();
    initColumnResize();
    setScale('week');
    showWelcome();

    // Add CSS for toast animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes toastIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      .gantt-blocked .gantt_task_content { text-decoration: line-through; opacity: 0.7; }
      .gantt-done .gantt_task_line { opacity: 0.6; }
      .gantt-overdue .gantt_task_line { box-shadow: inset 0 0 0 2px rgba(220,38,38,0.5) !important; }
      .today_marker { background: #dc2626; width: 2px; }
      .today_marker .gantt_marker_content { color: #dc2626; font-size: 11px; font-weight: 600; top: -18px; }
      .task-cell-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .gantt_grid_column_resize_wrap { background: var(--color-primary, #2563eb); opacity: 0; }
      .gantt_grid_column_resize_wrap:hover { opacity: 0.3; }
    `;
    document.head.appendChild(style);
  });

})();
