(function () {
    const KEY = 'punarnirmanam-v1'; const todayKey = keyOf(new Date()); let viewMonth = new Date(); viewMonth.setDate(1); let selectedDate = todayKey; let editingId = null; let toastTimer;
    const defaults = [{ id: 'water', name: 'Drink enough water', emoji: '💧', category: 'Wellbeing' }, { id: 'study', name: 'Focused study session', emoji: '📚', category: 'Study' }, { id: 'move', name: 'Move your body', emoji: '🏃', category: 'Fitness' }, { id: 'read', name: 'Read for 10 minutes', emoji: '📖', category: 'Personal' }];
    function keyOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }
    function parseKey(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
    function shiftKey(s, n) { const d = parseKey(s); d.setDate(d.getDate() + n); return keyOf(d) }
    function load() { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && Array.isArray(x.habits) && x.logs && typeof x.logs === 'object') return x } catch (e) { } return { habits: defaults.map(h => ({ ...h })), logs: {} } }
    let state = load(); function save() { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { showToast('Could not save in this browser.') } }
    function completed(id, date) { return !!(state.logs[date] && state.logs[date][id]) }
    function countDone(date) { return state.habits.filter(h => completed(h.id, date)).length }
    function pct(date) { return state.habits.length ? Math.round(countDone(date) / state.habits.length * 100) : 0 }
    function totalChecks() { return Object.values(state.logs).reduce((sum, day) => sum + Object.values(day).filter(Boolean).length, 0) }
    function streak(id) { let d = keyOf(new Date()), n = 0; if (!completed(id, d)) d = shiftKey(d, -1); while (completed(id, d) && n < 500) { n++; d = shiftKey(d, -1) } return n }
    function bestStreak(id) { const dates = Object.keys(state.logs).filter(d => completed(id, d)).sort(); let best = 0, run = 0, prev = ''; for (const d of dates) { run = prev && shiftKey(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d } return best }
    function allStreaks() { return state.habits.map(h => ({ habit: h, current: streak(h.id), best: bestStreak(h.id) })) }
    function dateFmt(d, opts) { return new Intl.DateTimeFormat(undefined, opts).format(d) }
    function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) }
    function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200) }
    function renderTop() { const now = new Date(); document.getElementById('topDate').textContent = dateFmt(now, { weekday: 'short', month: 'short', day: 'numeric' }); document.getElementById('todayEyebrow').textContent = dateFmt(now, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase(); document.getElementById('greeting').textContent = now.getHours() < 12 ? 'Make this morning count.' : now.getHours() < 17 ? 'Make today count.' : 'Finish today with intention.' }
    function renderToday() {
        const done = countDone(todayKey), total = state.habits.length, p = total ? pct(todayKey) : 0; document.getElementById('completedStat').textContent = done + '/' + total; document.getElementById('completedFoot').textContent = total ? (done === total ? 'Every habit completed!' : (total - done) + ' small promise' + (total - done === 1 ? '' : 's') + ' left') : 'Add a habit to get started'; document.getElementById('rateStat').textContent = p + '%'; const streaks = allStreaks(); document.getElementById('streakStat').innerHTML = Math.max(0, ...streaks.map(x => x.current)) + ' <small style="font-size:13px;letter-spacing:0">days</small>'; document.getElementById('totalStat').textContent = totalChecks(); document.getElementById('habitSubtitle').textContent = dateFmt(new Date(), { month: 'short', day: 'numeric' }) + ' · ' + done + ' of ' + total + ' complete'; document.getElementById('ringPct').textContent = p + '%'; document.getElementById('ringProgress').style.strokeDashoffset = String(308 - (308 * p / 100)); document.getElementById('ringMessage').textContent = !total ? 'Your fresh start' : p === 100 ? 'You showed up!' : p >= 50 ? 'You’re building momentum' : 'One step at a time'; document.getElementById('ringDetail').textContent = !total ? 'Add your first habit.' : p === 100 ? 'All habits done for today.' : (total - done) + ' habit' + (total - done === 1 ? '' : 's') + ' left today'; document.getElementById('legendDone').textContent = done; document.getElementById('legendLeft').textContent = total - done;
        const list = document.getElementById('todayHabits'); list.innerHTML = state.habits.length ? state.habits.map(h => `<div class="habit"><div class="habit-emoji">${esc(h.emoji)}</div><div class="habit-info"><div class="habit-title">${esc(h.name)}</div><div class="habit-meta">${esc(h.category)}</div></div><div class="habit-streak">🔥 ${streak(h.id)}d</div><button class="check ${completed(h.id, todayKey) ? 'done' : ''}" data-check="${esc(h.id)}" aria-label="Mark ${esc(h.name)} ${completed(h.id, todayKey) ? 'incomplete' : 'complete'}">✓</button></div>`).join('') : '<div class="empty">No habits yet. Add one small promise to begin.</div>';
        renderWeek()
    }
    function renderWeek() { const today = parseKey(todayKey), start = new Date(today); start.setDate(today.getDate() - ((today.getDay() + 6) % 7)); document.getElementById('weekGrid').innerHTML = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); const k = keyOf(d), done = countDone(k), p = state.habits.length ? done / state.habits.length : 0; return `<div class="day ${k === todayKey ? 'today' : ''} ${p > 0 ? 'has-progress' : ''} ${p === 1 ? 'complete' : ''}"><div class="dayname">${dateFmt(d, { weekday: 'short' })}</div><div class="daynum">${d.getDate()}</div><div class="daydot"></div></div>` }).join('') }
    function renderCalendar() { const year = viewMonth.getFullYear(), month = viewMonth.getMonth(); document.getElementById('monthLabel').textContent = dateFmt(viewMonth, { month: 'long', year: 'numeric' }); const first = new Date(year, month, 1), start = new Date(year, month, 1); start.setDate(1 - ((first.getDay() + 6) % 7)); let html = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(x => `<div class="cal-label">${x}</div>`).join(''); for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = keyOf(d), done = countDone(k), out = d.getMonth() !== month; html += `<button class="cal-day ${out ? 'outside' : ''} ${k === selectedDate ? 'selected' : ''}" data-date="${k}"><div class="num">${d.getDate()}</div><div class="mini">${state.habits.filter(h => completed(h.id, k)).slice(0, 8).map(() => '<i></i>').join('')}</div></button>` } document.getElementById('calendarGrid').innerHTML = html; renderCalendarDetail() }
    function renderCalendarDetail() { const d = parseKey(selectedDate), done = countDone(selectedDate); document.getElementById('calendarDetail').innerHTML = `<strong>${dateFmt(d, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong><div style="color:var(--muted);margin:5px 0 12px">${done} of ${state.habits.length} habits completed</div>` + (state.habits.length ? state.habits.map(h => `<div style="display:flex;gap:9px;align-items:center;margin-top:8px"><span>${esc(h.emoji)}</span><span style="flex:1">${esc(h.name)}</span><span style="color:${completed(h.id, selectedDate) ? 'var(--accent)' : 'var(--muted)'}">${completed(h.id, selectedDate) ? '✓ Done' : 'Not checked'}</span></div>`).join('') : 'No habits have been added yet.') }
    function renderStats() { const today = parseKey(todayKey), days = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() - (6 - i)); return keyOf(d) }); const vals = days.map(k => pct(k)); document.getElementById('weekRate').textContent = Math.round(vals.reduce((a, b) => a + b, 0) / 7) + '%'; const monthPrefix = todayKey.slice(0, 7); document.getElementById('monthCount').textContent = Object.entries(state.logs).filter(([k]) => k.startsWith(monthPrefix)).reduce((sum, [, v]) => sum + Object.values(v).filter(Boolean).length, 0); const streaks = allStreaks(); document.getElementById('bestStreak').textContent = Math.max(0, ...streaks.map(x => x.best)) + ' days'; document.getElementById('activeCount').textContent = state.habits.length; document.getElementById('weekChart').innerHTML = days.map((k, i) => { const p = vals[i], d = parseKey(k), bar = Math.max(3, p * 1.45); return `<div class="chart-col"><div class="chart-bar-wrap"><div class="chart-bar" style="height:${bar}px;opacity:${p ? 1 : .25}" title="${p}%"></div></div><div class="chart-label">${dateFmt(d, { weekday: 'short' })}</div></div>` }).join(''); document.getElementById('consistencyList').innerHTML = state.habits.length ? state.habits.map(h => { let hits = 0; for (let i = 0; i < 30; i++)if (completed(h.id, shiftKey(todayKey, -i))) hits++; const p = Math.round(hits / 30 * 100); return `<div class="manage-item"><div class="habit-emoji" style="width:36px;height:36px;flex-basis:36px;font-size:18px">${esc(h.emoji)}</div><div class="details"><strong>${esc(h.name)}</strong><div style="height:5px;background:var(--line);border-radius:5px;margin-top:8px;overflow:hidden"><div style="height:100%;width:${p}%;background:var(--accent);border-radius:5px"></div></div></div><span style="font-size:12px;font-weight:800">${p}%</span></div>` }).join('') : '<div class="empty">Add habits to see your consistency here.</div>' }
    function renderManage() { document.getElementById('manageSubtitle').textContent = state.habits.length + ' habit' + (state.habits.length === 1 ? '' : 's') + ' in your library'; document.getElementById('manageList').innerHTML = state.habits.length ? state.habits.map(h => `<div class="manage-item"><div class="habit-emoji" style="width:39px;height:39px;flex-basis:39px">${esc(h.emoji)}</div><div class="details"><strong>${esc(h.name)}</strong><small>${esc(h.category)} · 🔥 ${streak(h.id)} day streak</small></div><button class="icon-btn" data-edit="${esc(h.id)}" aria-label="Edit ${esc(h.name)}">✎</button><button class="icon-btn" data-delete="${esc(h.id)}" aria-label="Delete ${esc(h.name)}">×</button></div>`).join('') : '<div class="empty">Your habit library is empty. Create your first habit.</div>' }
    function renderAll() { renderTop(); renderToday(); renderCalendar(); renderStats(); renderManage() }
    function goto(page) { document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page)); document.querySelectorAll('[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page)); if (page === 'calendar') renderCalendar(); if (page === 'statistics') renderStats(); if (page === 'habits') renderManage() }

    function openModal(id) { editingId = id || null; const h = id ? state.habits.find(x => x.id === id) : null; document.getElementById('modalTitle').textContent = h ? 'Edit habit' : 'Create a habit'; document.getElementById('habitName').value = h ? h.name : ''; document.getElementById('habitEmoji').value = h ? h.emoji : '✨'; document.getElementById('habitCategory').value = h ? h.category : 'Personal'; document.getElementById('modalBackdrop').classList.add('open'); setTimeout(() => document.getElementById('habitName').focus(), 50) } function closeModal() { document.getElementById('modalBackdrop').classList.remove('open') }


    document.addEventListener('click', e => { const nav = e.target.closest('[data-page]'); if (nav) goto(nav.dataset.page); const jump = e.target.closest('[data-goto]'); if (jump) goto(jump.dataset.goto); const check = e.target.closest('[data-check]'); if (check) { const id = check.dataset.check; state.logs[todayKey] ||= {}; state.logs[todayKey][id] = !state.logs[todayKey][id]; if (!state.logs[todayKey][id]) delete state.logs[todayKey][id]; save(); renderAll(); showToast(state.logs[todayKey] && state.logs[todayKey][id] ? 'Habit completed. Nice work!' : 'Check-in updated.') } const date = e.target.closest('[data-date]'); if (date) { selectedDate = date.dataset.date; if (parseKey(selectedDate).getMonth() !== viewMonth.getMonth() || parseKey(selectedDate).getFullYear() !== viewMonth.getFullYear()) { viewMonth = new Date(parseKey(selectedDate)); viewMonth.setDate(1) } renderCalendar() } const edit = e.target.closest('[data-edit]'); if (edit) openModal(edit.dataset.edit); const del = e.target.closest('[data-delete]'); if (del) { const h = state.habits.find(x => x.id === del.dataset.delete); if (h && confirm('Delete “' + h.name + '”? Its check-in history will also be removed.')) { state.habits = state.habits.filter(x => x.id !== h.id); Object.keys(state.logs).forEach(k => delete state.logs[k][h.id]); save(); renderAll(); showToast('Habit removed.') } } });
    document.getElementById('addTop').addEventListener('click', () => openModal()); document.getElementById('addManage').addEventListener('click', () => openModal()); document.getElementById('cancelModal').addEventListener('click', closeModal); document.getElementById('modalBackdrop').addEventListener('click', e => { if (e.target.id === 'modalBackdrop') closeModal() }); document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() }); document.getElementById('habitForm').addEventListener('submit', e => { e.preventDefault(); const name = document.getElementById('habitName').value.trim(), emoji = document.getElementById('habitEmoji').value.trim() || '✨', category = document.getElementById('habitCategory').value; if (!name) return; if (editingId) { const h = state.habits.find(x => x.id === editingId); if (h) Object.assign(h, { name, emoji, category }); showToast('Habit updated.') } else { state.habits.push({ id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, emoji, category }); showToast('New habit added. Start whenever you’re ready.') } save(); closeModal(); renderAll() }); document.getElementById('prevMonth').addEventListener('click', () => { viewMonth.setMonth(viewMonth.getMonth() - 1); renderCalendar() }); document.getElementById('nextMonth').addEventListener('click', () => { viewMonth.setMonth(viewMonth.getMonth() + 1); renderCalendar() });
    document.getElementById('exportData').addEventListener('click', () => {
        const backup = new Blob(
            [JSON.stringify(state, null, 2)],
            { type: 'application/json' }
        );

        const url = URL.createObjectURL(backup);
        const link = document.createElement('a');

        link.href = url;
        link.download = `punarnirmanam-backup-${todayKey}.json`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
        showToast('Backup downloaded!');
    });

    const importButton = document.getElementById('importData');
    const importFile = document.getElementById('importFile');

    importButton.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', async () => {
        const file = importFile.files[0];
        if (!file) return;

        try {
            const imported = JSON.parse(await file.text());

            // Check the basic backup structure.
            if (
                !imported ||
                !Array.isArray(imported.habits) ||
                !imported.logs ||
                typeof imported.logs !== 'object' ||
                Array.isArray(imported.logs)
            ) {
                throw new Error('Invalid backup format');
            }

            // Validate each habit before replacing anything.
            const validHabits = imported.habits.every(h =>
                h &&
                typeof h.id === 'string' &&
                typeof h.name === 'string' &&
                typeof h.emoji === 'string' &&
                typeof h.category === 'string'
            );

            if (!validHabits) {
                throw new Error('Invalid habit data');
            }

            const ids = imported.habits.map(h => h.id);

            if (new Set(ids).size !== ids.length) {
                throw new Error('Duplicate habit IDs');
            }

            const validLogs = Object.entries(imported.logs).every(
                ([date, entries]) =>
                    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
                    entries !== null &&
                    typeof entries === 'object' &&
                    !Array.isArray(entries) &&
                    Object.entries(entries).every(
                        ([id, value]) =>
                            ids.includes(id) && value === true
                    )
            );

            if (!validLogs) {
                throw new Error('Invalid check-in data');
            }

            if (!confirm('Replace your current habits and history with this backup?')) {
                return;
            }

            state = {
                habits: imported.habits,
                logs: imported.logs
            };

            save();
            renderAll();
            showToast('Backup imported successfully!');
        } catch (error) {
            showToast('Import failed. Choose a valid backup.');
            console.error('Backup import error:', error);
        } finally {
            importFile.value = '';
        }
    });

    document.getElementById('resetDemo').addEventListener('click', () => { if (confirm('Reset all habits and check-in history to the original sample habits?')) { state = { habits: defaults.map(h => ({ ...h })), logs: {} }; save(); selectedDate = todayKey; viewMonth = new Date(); viewMonth.setDate(1); renderAll(); showToast('Sample data restored.') } });
    renderAll();
    // {
    //     id: 'your-existing-generated-id',
    //         name,
    //         emoji,
    //         category,
    //         schedule
    // }


})();
