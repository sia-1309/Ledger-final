const LOG_KEY = 'ledger_activity_log'

export function getActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
  } catch { return [] }
}

export function addActivity(action, entityType, entityName, details = '') {
  const log = getActivityLog()
  log.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    action,
    entityType,
    entityName,
    details,
    timestamp: new Date().toISOString(),
  })
  if (log.length > 200) log.length = 200
  localStorage.setItem(LOG_KEY, JSON.stringify(log))
  return log
}
