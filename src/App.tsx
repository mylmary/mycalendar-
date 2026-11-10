import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Menu,
  Plus,
  Search,
  Bell,
  Settings,
  ChartNoAxesColumn,
  LayoutDashboard,
  MoreHorizontal,
  Trash2,
  X,
  Sparkles,
  SlidersHorizontal,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ArrowLeft,
  Sun,
} from 'lucide-react';

const STORE_KEY = 'mycalendar_tasks_v1';
const lavender = '#f0efff';
const todayKey = () => toKey(new Date());
function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}
function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function readTasks() {
  try {
    const value = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function readEvents() {
  try {
    const value = JSON.parse(localStorage.getItem('mycalendar_events_v1') || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
function timeToMinutes(value) {
  if (!value) return 0;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
function sameMonth(a, b) {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [events, setEvents] = useState(readEvents);
  const [calendarView, setCalendarView] = useState('month');
  const [eventOpen, setEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventDraft, setEventDraft] = useState({ title: '', date: todayKey(), startTime: '09:00', endTime: '10:00', location: '', description: '', color: '#dcd8fb', allDay: false });
  const [screen, setScreen] = useState('tasks');
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountPage, setAccountPage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthDirection, setMonthDirection] = useState(1);
  const [notice, setNotice] = useState('');
  const touchStart = useRef(null);
  const edgeStart = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('mycalendar_events_v1', JSON.stringify(events));
  }, [events]);

  const completedCount = tasks.filter(task => task.done).length;
  const selectedTasks = tasks
    .filter(task => task.date === selectedDate)
    .filter(
      task =>
        !searchTerm ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(
      (a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt
    );
  const activeCount = tasks.filter(task => !task.done).length;
  const todayTasks = tasks.filter(task => task.date === todayKey());
  const monthTasks = tasks.filter(task =>
    task.date.startsWith(
      toKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)).slice(
        0,
        7
      )
    )
  );

  const weekDays = useMemo(() => {
    const selected = fromKey(selectedDate);
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [selectedDate]);

  const days = useMemo(() => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [monthDate]);

  function openEvent(date = selectedDate, existing = null) {
    setEditingEvent(existing ? existing.id : null);
    setEventDraft(existing ? {
      title: existing.title || '', date: existing.date || date,
      startTime: existing.startTime || '09:00', endTime: existing.endTime || '10:00',
      location: existing.location || '', description: existing.description || '',
      color: existing.color || '#dcd8fb', allDay: Boolean(existing.allDay),
    } : {
      title: '', date, startTime: '09:00', endTime: '10:00',
      location: '', description: '', color: '#dcd8fb', allDay: false,
    });
    setEventOpen(true);
  }
  function saveEvent(event) {
    event.preventDefault();
    const title = eventDraft.title.trim();
    if (!title || (!eventDraft.allDay && eventDraft.endTime <= eventDraft.startTime)) return;
    const record = {
      ...eventDraft, title,
      id: editingEvent || globalThis.crypto?.randomUUID?.() || String(Date.now()),
      createdAt: editingEvent ? events.find(item => item.id === editingEvent)?.createdAt || Date.now() : Date.now(),
    };
    setEvents(current => editingEvent ? current.map(item => item.id === editingEvent ? record : item) : [...current, record]);
    setSelectedDate(eventDraft.date);
    const date = fromKey(eventDraft.date);
    setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setEventOpen(false);
    setEditingEvent(null);
    setNotice(editingEvent ? 'Event updated' : 'Event added to your calendar');
    window.setTimeout(() => setNotice(''), 1800);
  }
  function deleteEvent(id) {
    setEvents(current => current.filter(item => item.id !== id));
    setEventOpen(false);
    setEditingEvent(null);
    setNotice('Event deleted');
    window.setTimeout(() => setNotice(''), 1600);
  }

  function changeMonth(amount) {
    setMonthDirection(amount);
    setMonthDate(
      current => new Date(current.getFullYear(), current.getMonth() + amount, 1)
    );
  }
  function chooseDate(date) {
    setSelectedDate(toKey(date));
    if (!sameMonth(date, monthDate))
      setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1));
  }
  function addTask(event) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setTasks(current => [
      ...current,
      {
        id:
          globalThis.crypto?.randomUUID?.() ||
          String(Date.now() + Math.random()),
        title,
        date: selectedDate,
        time: newTime,
        done: false,
        createdAt: Date.now(),
      },
    ]);
    setNewTitle('');
    setNewTime('');
    setAddOpen(false);
    setNotice('A little step added');
    window.setTimeout(() => setNotice(''), 1800);
  }
  function toggleTask(id) {
    setTasks(current => {
      const target = current.find(task => task.id === id);
      if (target && !target.done) {
        setNotice('Little win!');
        window.setTimeout(() => setNotice(''), 1600);
      }
      return current.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      );
    });
  }
  function deleteTask(id) {
    setTasks(current => current.filter(task => task.id !== id));
  }
  function goToday() {
    const now = new Date();
    setSelectedDate(todayKey());
    setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }
  function openAccount(page) {
    setAccountPage(page);
    setAccountOpen(false);
  }

  function handleTouchStart(event) {
    const x = event.touches[0].clientX;
    touchStart.current = x;
    if (x < 28) edgeStart.current = x;
  }
  function handleTouchEnd(event) {
    if (touchStart.current == null) return;
    const end = event.changedTouches[0].clientX;
    const delta = end - touchStart.current;
    if (edgeStart.current != null && delta > 65) setSidebarOpen(true);
    if (sidebarOpen && delta < -65) setSidebarOpen(false);
    touchStart.current = null;
    edgeStart.current = null;
  }

  const dateObject = fromKey(selectedDate);
  const isToday = selectedDate === todayKey();

  return (
    <div
      className="app-shell"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="topbar">
        <button
          className="icon-button menu-button"
          aria-label="Open navigation"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </button>
        <button
          className="brand-mark"
          onClick={() => setScreen('tasks')}
          aria-label="MyCalendar home"
        >
          <CalendarCheck size={22} />
        </button>
        <div className="brand-copy">
          <strong>mycalendar</strong>
          <span>
            {screen === 'tasks'
              ? 'A softer way to plan your day'
              : 'Your days, at a glance'}
          </span>
        </div>
        <div className="top-actions">
          <button
            className="icon-button"
            aria-label="Search tasks"
            onClick={() => setSearchOpen(value => !value)}
          >
            <Search />
          </button>
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            onClick={() =>
              setNotice(
                activeCount
                  ? activeCount + ' tasks still to do'
                  : 'You are all caught up'
              )
            }
          >
            <Bell />
          </button>
          <button
            className="account-button"
            aria-label="Account menu"
            onClick={() => setAccountOpen(value => !value)}
          >
            <span className="avatar">M</span>
            <ChevronRight size={15} className="account-chevron" />
          </button>
        </div>
        {searchOpen && (
          <div className="search-popover">
            <Search size={17} />
            <input
              autoFocus
              placeholder="Find a task..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchOpen(false);
              }}
              aria-label="Close search"
            >
              <X size={17} />
            </button>
          </div>
        )}
        {accountOpen && (
          <div className="account-popover">
            <div className="account-intro">
              <span className="avatar large">M</span>
              <div>
                <strong>Mary</strong>
                <small>Your personal calendar</small>
              </div>
            </div>
            <button onClick={() => openAccount('Dashboard')}>
              <LayoutDashboard />
              Dashboard
            </button>
            <button onClick={() => openAccount('Statistics')}>
              <ChartNoAxesColumn />
              Statistics
            </button>
            <button onClick={() => openAccount('More')}>
              <MoreHorizontal />
              More
            </button>
            <button onClick={() => openAccount('Settings')}>
              <Settings />
              Settings
            </button>
          </div>
        )}
      </header>

      <main className="main-area">
        <section
          className={
            'screen-panel ' +
            (screen === 'tasks' ? 'active-screen' : 'away-left')
          }
          aria-hidden={screen !== 'tasks'}
        >
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {isToday
                  ? 'YOUR DAY'
                  : dateObject
                      .toLocaleDateString(undefined, { weekday: 'long' })
                      .toUpperCase()}
              </p>
              <h1>
                {isToday
                  ? 'Today'
                  : dateObject.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
              </h1>
              <p className="subheading">
                {isToday
                  ? 'One thing at a time. You’ve got this.'
                  : 'A little plan for this day.'}
              </p>
            </div>
            {!isToday && (
              <button className="today-link" onClick={goToday}>
                Tap to go today
              </button>
            )}
          </div>
          <div className="wins-card">
            <div className="wins-copy">
              <span className="wins-kicker">A LITTLE CELEBRATION</span>
              <strong>
                {completedCount} <span>little wins</span>
              </strong>
              <p>Every small step counts. Take it easy.</p>
            </div>
            <div className="thumb-art" aria-hidden="true">
              <span className="sun-rays">✳</span>
              <span className="thumb">👍</span>
            </div>
          </div>
          <div className="task-section-heading">
            <div>
              <h2>My tasks</h2>
              <span>
                {selectedTasks.length}{' '}
                {selectedTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <button className="add-small" onClick={() => setAddOpen(true)}>
              <Plus size={17} /> Add task
            </button>
          </div>
          <div className="task-list" aria-live="polite">
            {selectedTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Check size={25} />
                </div>
                <strong>
                  {searchTerm
                    ? 'No matching tasks'
                    : 'Nothing on your list yet'}
                </strong>
                <p>
                  {searchTerm
                    ? 'Try another search.'
                    : 'Make a little plan and give yourself room to breathe.'}
                </p>
                <button
                  className="primary-button"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus size={17} /> Add a task
                </button>
              </div>
            ) : (
              selectedTasks.map(task => (
                <article
                  className={'task-row ' + (task.done ? 'is-done' : '')}
                  key={task.id}
                >
                  <button
                    className="task-check"
                    aria-label={
                      task.done ? 'Mark task incomplete' : 'Complete task'
                    }
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.done && <Check size={15} />}
                  </button>
                  <div className="task-info">
                    <strong>{task.title}</strong>
                    <span>
                      {task.time ||
                        (task.done ? 'Little win completed' : 'Anytime today')}
                    </span>
                  </div>
                  <button
                    className="delete-button"
                    aria-label={'Delete ' + task.title}
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))
            )}
          </div>
          <div className="gentle-note">
            <Sparkles size={16} />
            <span>Progress, not perfection. You’re doing just fine.</span>
          </div>
        </section>

        <section
          className={
            'screen-panel calendar-panel ' +
            (screen === 'calendar' ? 'active-screen' : 'away-right')
          }
          aria-hidden={screen !== 'calendar'}
        >
          <div className="page-heading calendar-heading">
            <div><p className="eyebrow">YOUR PLANS</p><h1>Calendar</h1><p className="subheading">A little look at what’s ahead.</p></div>
            <div className="calendar-heading-actions">
              {selectedDate !== todayKey() && <button className="today-link" onClick={goToday}>Tap to go today</button>}
              <button className="primary-button" onClick={() => openEvent(selectedDate)}><Plus size={17} /> Add event</button>
            </div>
          </div>
          <div className="desktop-calendar">
            <div className="desktop-calendar-toolbar">
              <div className="desktop-date-controls">
                <button className="today-link" onClick={goToday}>Today</button>
                <button className="round-nav" aria-label="Previous period" onClick={() => calendarView === 'month' ? changeMonth(-1) : chooseDate(new Date(fromKey(selectedDate).getFullYear(), fromKey(selectedDate).getMonth(), fromKey(selectedDate).getDate() - (calendarView === 'week' ? 7 : 1)))}><ChevronLeft /></button>
                <button className="round-nav" aria-label="Next period" onClick={() => calendarView === 'month' ? changeMonth(1) : chooseDate(new Date(fromKey(selectedDate).getFullYear(), fromKey(selectedDate).getMonth(), fromKey(selectedDate).getDate() + (calendarView === 'week' ? 7 : 1)))}><ChevronRight /></button>
                <h2>{calendarView === 'month' ? monthLabel(monthDate) : calendarView === 'week' ? weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' – ' + weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : dateObject.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
              </div>
              <div className="desktop-calendar-actions">
                <div className="calendar-view-switch">{['month', 'week', 'day'].map(view => <button key={view} className={calendarView === view ? 'selected-view' : ''} onClick={() => setCalendarView(view)}>{view[0].toUpperCase() + view.slice(1)}</button>)}</div>
                <button className="primary-button" onClick={() => openEvent(selectedDate)}><Plus size={16} /> Create</button>
              </div>
            </div>
            {calendarView === 'month' ? (
              <div className="desktop-month-view">
                <div className="desktop-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div>
                <div className="desktop-month-grid">
                  {days.map(date => {
                    const key = toKey(date);
                    const dayEvents = events.filter(item => item.date === key).sort((a, b) => (a.allDay ? -1 : 1) - (b.allDay ? -1 : 1) || (a.startTime || '').localeCompare(b.startTime || ''));
                    return <div className={'desktop-month-cell ' + (!sameMonth(date, monthDate) ? 'outside-month-cell ' : '') + (key === selectedDate ? 'active-date-cell' : '')} key={key} onClick={() => chooseDate(date)}>
                      <button className={'desktop-date-number ' + (key === todayKey() ? 'desktop-today' : '')} onClick={event => { event.stopPropagation(); chooseDate(date); }}>{date.getDate()}</button>
                      <div className="desktop-month-events">
                        {dayEvents.slice(0, 3).map(item => <button key={item.id} className="desktop-event-chip" style={{ background: item.color }} onClick={event => { event.stopPropagation(); openEvent(key, item); }}><span>{item.allDay ? '' : item.startTime + ' '}</span>{item.title}</button>)}
                        {dayEvents.length > 3 && <span className="more-events">+{dayEvents.length - 3} more</span>}
                      </div>
                      <button className="add-cell-event" aria-label={'Add event on ' + key} onClick={event => { event.stopPropagation(); chooseDate(date); openEvent(key); }}><Plus size={14} /></button>
                    </div>;
                  })}
                </div>
              </div>
            ) : (
              <div className="desktop-time-view">
                <div className="time-view-head" style={{ gridTemplateColumns: '58px repeat(' + (calendarView === 'week' ? 7 : 1) + ', minmax(0, 1fr))' }}><div className="time-gutter-head" />
                  {(calendarView === 'week' ? weekDays : [dateObject]).map(date => <button key={toKey(date)} className={'time-day-head ' + (toKey(date) === todayKey() ? 'time-today' : '')} onClick={() => chooseDate(date)}><span>{date.toLocaleDateString(undefined, { weekday: 'short' })}</span><strong>{date.getDate()}</strong></button>)}
                </div>
                <div className="time-view-scroll">
                  <div className="time-view-body" style={{ gridTemplateColumns: '58px repeat(' + (calendarView === 'week' ? 7 : 1) + ', minmax(110px, 1fr))' }}>
                    <div className="time-label-column">{Array.from({ length: 24 }, (_, hour) => <div className="time-hour-label" key={hour}>{String(hour).padStart(2, '0')}:00</div>)}</div>
                    {(calendarView === 'week' ? weekDays : [dateObject]).map(date => {
                      const key = toKey(date), dayEvents = events.filter(item => item.date === key);
                      return <div className="time-day-column" key={key}>
                        {Array.from({ length: 24 }, (_, hour) => <button className="time-hour-slot" key={hour} aria-label={'Add event at ' + hour + ':00'} onClick={() => { setSelectedDate(key); openEvent(key); setEventDraft(current => ({ ...current, date: key, startTime: String(hour).padStart(2, '0') + ':00', endTime: hour === 23 ? '23:59' : String(hour + 1).padStart(2, '0') + ':00' })); }} />)}
                        {dayEvents.map(item => {
                          const top = item.allDay ? 2 : timeToMinutes(item.startTime);
                          const height = item.allDay ? 30 : Math.max(28, timeToMinutes(item.endTime) - top);
                          return <button key={item.id} className="timed-event-block" style={{ top: top + 'px', height: height + 'px', background: item.color }} onClick={() => openEvent(key, item)}><strong>{item.title}</strong><span>{item.allDay ? 'All day' : item.startTime + ' – ' + item.endTime}</span>{item.location && <small>{item.location}</small>}</button>;
                        })}
                      </div>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="calendar-card">
            <div className="month-toolbar">
              <button
                className="round-nav"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft />
              </button>
              <h2
                key={monthLabel(monthDate)}
                className={monthDirection > 0 ? 'month-next' : 'month-prev'}
              >
                {monthLabel(monthDate)}
              </h2>
              <button
                className="round-nav"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight />
              </button>
            </div>
            <div className="weekday-row">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {days.map(date => {
                const key = toKey(date);
                const hasTasks = tasks.some(task => task.date === key);
                const selected = key === selectedDate;
                const today = key === todayKey();
                return (
                  <button
                    key={key}
                    className={
                      'day-cell ' +
                      (!sameMonth(date, monthDate) ? 'outside-month ' : '') +
                      (selected ? 'selected-day ' : '') +
                      (today ? 'today-day' : '')
                    }
                    onClick={() => chooseDate(date)}
                    aria-label={
                      date.toDateString() + (hasTasks ? ', has tasks' : '')
                    }
                  >
                    <span className="day-number">{date.getDate()}</span>
                    {hasTasks && <i className="task-dot" />}
                  </button>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span>
                <i className="legend-dot" /> Has tasks
              </span>
              <span>
                <i className="legend-circle" /> Selected day
              </span>
            </div>
          </div>
          <div className="selected-day-card">
            <div className="selected-date-label">
              <div className="date-tile">
                <strong>{dateObject.getDate()}</strong>
                <span>
                  {dateObject.toLocaleDateString(undefined, { month: 'short' })}
                </span>
              </div>
              <div>
                <h2>
                  {isToday
                    ? 'Today'
                    : dateObject.toLocaleDateString(undefined, {
                        weekday: 'long',
                      })}
                </h2>
                <p>
                  {selectedTasks.length}{' '}
                  {selectedTasks.length === 1 ? 'task' : 'tasks'} planned
                </p>
              </div>
            </div>
            <button
              className="add-small"
              onClick={() => {
                setScreen('tasks');
                setAddOpen(true);
              }}
            >
              <Plus size={17} /> Add task
            </button>
          </div>
          {events.filter(item => item.date === selectedDate).length > 0 && (
            <div className="calendar-day-tasks mobile-event-list">
              {events.filter(item => item.date === selectedDate).map(item => <button key={item.id} className="mobile-event-row" onClick={() => openEvent(selectedDate, item)}><i style={{ background: item.color }} /><span><strong>{item.title}</strong><small>{item.allDay ? 'All day' : item.startTime + ' – ' + item.endTime}{item.location ? ' · ' + item.location : ''}</small></span></button>)}
            </div>
          )}
          {selectedTasks.length > 0 && (
            <div className="calendar-day-tasks">
              {selectedTasks.map(task => (
                <div key={task.id} className="mini-task">
                  <span
                    className={task.done ? 'mini-check done' : 'mini-check'}
                  >
                    {task.done && <Check size={12} />}
                  </span>
                  <span className={task.done ? 'mini-done' : ''}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {accountPage && (
          <div className="account-page-overlay">
            <div className="account-page-card">
              <button
                className="back-button"
                onClick={() => setAccountPage('')}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <div className="account-page-title">
                <span className="avatar large">M</span>
                <div>
                  <p className="eyebrow">MYCALENDAR</p>
                  <h1>{accountPage}</h1>
                </div>
              </div>
              {accountPage === 'Dashboard' && (
                <div className="stats-grid">
                  <div>
                    <span>Total tasks</span>
                    <strong>{tasks.length}</strong>
                  </div>
                  <div>
                    <span>Completed</span>
                    <strong>{completedCount}</strong>
                  </div>
                  <div>
                    <span>Still to do</span>
                    <strong>{activeCount}</strong>
                  </div>
                </div>
              )}
              {accountPage === 'Statistics' && (
                <div className="stats-grid">
                  <div>
                    <span>Little wins</span>
                    <strong>{completedCount}</strong>
                  </div>
                  <div>
                    <span>Completion</span>
                    <strong>
                      {tasks.length
                        ? Math.round((completedCount / tasks.length) * 100)
                        : 0}
                      %
                    </strong>
                  </div>
                  <div>
                    <span>Days with plans</span>
                    <strong>
                      {new Set(tasks.map(task => task.date)).size}
                    </strong>
                  </div>
                </div>
              )}
              {accountPage === 'Settings' && (
                <div className="settings-line">
                  <div>
                    <strong>Keep tasks on this device</strong>
                    <p>Your tasks are saved in this browser.</p>
                  </div>
                  <span className="settings-status">On</span>
                </div>
              )}
              {accountPage === 'More' && (
                <div className="settings-line">
                  <div>
                    <strong>A gentle reminder</strong>
                    <p>Take your time. Small steps are still progress.</p>
                  </div>
                  <Sun size={22} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        <button
          className={screen === 'tasks' ? 'nav-item active' : 'nav-item'}
          onClick={() => {
            setScreen('tasks');
            setAccountPage('');
          }}
        >
          <span className="nav-icon">
            <Check size={22} />
          </span>
          <span>Tasks</span>
        </button>
        <button
          className={screen === 'calendar' ? 'nav-item active' : 'nav-item'}
          onClick={() => {
            setScreen('calendar');
            setAccountPage('');
          }}
        >
          <span className="nav-icon">
            <CalendarDays size={21} />
          </span>
          <span>Calendar</span>
        </button>
      </nav>

      {sidebarOpen && (
        <div className="overlay-layer" onClick={() => setSidebarOpen(false)}>
          <aside className="sidebar" onClick={event => event.stopPropagation()}>
            <div className="sidebar-top">
              <div className="account-intro">
                <span className="avatar large">M</span>
                <div>
                  <strong>Mary</strong>
                  <small>mycalendar</small>
                </div>
              </div>
              <button
                className="icon-button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X />
              </button>
            </div>
            <div className="sidebar-links">
              <button
                className={
                  screen === 'tasks' ? 'side-link current' : 'side-link'
                }
                onClick={() => {
                  setScreen('tasks');
                  setSidebarOpen(false);
                }}
              >
                <Check size={20} />
                Tasks
              </button>
              <button
                className={
                  screen === 'calendar' ? 'side-link current' : 'side-link'
                }
                onClick={() => {
                  setScreen('calendar');
                  setSidebarOpen(false);
                }}
              >
                <CalendarDays size={20} />
                Calendar
              </button>
            </div>
            <div className="sidebar-bottom">
              <span>Take it easy today.</span>
              <span className="sidebar-spark">✳</span>
            </div>
          </aside>
        </div>
      )}

      {addOpen && (
        <div
          className="overlay-layer add-overlay"
          onClick={() => setAddOpen(false)}
        >
          <section
            className="add-sheet"
            onClick={event => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <div className="sheet-heading">
              <div>
                <p className="eyebrow">A NEW LITTLE PLAN</p>
                <h2>Add a task</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close add task"
                onClick={() => setAddOpen(false)}
              >
                <X />
              </button>
            </div>
            <form onSubmit={addTask}>
              <label htmlFor="task-title">What would you like to do?</label>
              <input
                id="task-title"
                autoFocus
                maxLength={100}
                placeholder="Write your task..."
                value={newTitle}
                onChange={event => setNewTitle(event.target.value)}
              />
              <label htmlFor="task-time">
                Time <span>(optional)</span>
              </label>
              <input
                id="task-time"
                type="time"
                value={newTime}
                onChange={event => setNewTime(event.target.value)}
              />
              <div className="sheet-date">
                <CalendarDays size={17} />
                <span>
                  {dateObject.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <button
                className="primary-button full-button"
                type="submit"
                disabled={!newTitle.trim()}
              >
                <Plus size={18} /> Save task
              </button>
            </form>
          </section>
        </div>
      )}
      {eventOpen && (
        <div className="overlay-layer add-overlay event-overlay" onClick={() => setEventOpen(false)}>
          <section className="add-sheet event-sheet" onClick={event => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-heading"><div><p className="eyebrow">YOUR CALENDAR</p><h2>{editingEvent ? 'Edit event' : 'Create an event'}</h2></div><button className="icon-button" aria-label="Close event form" onClick={() => setEventOpen(false)}><X /></button></div>
            <form onSubmit={saveEvent}>
              <label htmlFor="event-title">Event title</label><input id="event-title" autoFocus maxLength={120} placeholder="Add a title" value={eventDraft.title} onChange={event => setEventDraft(current => ({ ...current, title: event.target.value }))} />
              <div className="event-form-grid">
                <div><label htmlFor="event-date">Date</label><input id="event-date" type="date" value={eventDraft.date} onChange={event => setEventDraft(current => ({ ...current, date: event.target.value }))} /></div>
                <div className="all-day-control"><label><input type="checkbox" checked={eventDraft.allDay} onChange={event => setEventDraft(current => ({ ...current, allDay: event.target.checked }))} /> All day</label></div>
                {!eventDraft.allDay && <><div><label htmlFor="event-start">Start time</label><input id="event-start" type="time" value={eventDraft.startTime} onChange={event => setEventDraft(current => ({ ...current, startTime: event.target.value }))} /></div><div><label htmlFor="event-end">End time</label><input id="event-end" type="time" value={eventDraft.endTime} onChange={event => setEventDraft(current => ({ ...current, endTime: event.target.value }))} /></div>}
              </div>
              {!eventDraft.allDay && eventDraft.endTime <= eventDraft.startTime && <p className="event-validation">End time must be later than start time.</p>}
              <label htmlFor="event-location">Location</label><input id="event-location" placeholder="Add a location" value={eventDraft.location} onChange={event => setEventDraft(current => ({ ...current, location: event.target.value }))} />
              <label htmlFor="event-description">Description</label><textarea id="event-description" rows={3} placeholder="Add notes or details" value={eventDraft.description} onChange={event => setEventDraft(current => ({ ...current, description: event.target.value }))} />
              <label>Event colour</label><div className="event-colour-picker">{[['#dcd8fb','Lavender'],['#d8e8fb','Blue'],['#d8eee3','Mint'],['#f9dfd5','Peach'],['#f6e9b9','Butter'],['#f4dce8','Rose']].map(([color,name]) => <button type="button" key={color} aria-label={name + ' event colour'} title={name} className={eventDraft.color === color ? 'colour-choice chosen-colour' : 'colour-choice'} style={{ background: color }} onClick={() => setEventDraft(current => ({ ...current, color }))} />)}</div>
              <div className="event-form-actions">{editingEvent && <button type="button" className="event-delete-button" onClick={() => deleteEvent(editingEvent)}><Trash2 size={16} /> Delete</button>}<button className="primary-button full-button" type="submit" disabled={!eventDraft.title.trim() || (!eventDraft.allDay && eventDraft.endTime <= eventDraft.startTime)}>{editingEvent ? 'Save changes' : 'Save event'}</button></div>
            </form>
          </section>
        </div>
      )}
      {notice && (
        <div className="toast">
          <Sparkles size={16} />
          {notice}
        </div>
      )}
    </div>
  );
}

export default App;
