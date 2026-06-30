export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

export function roleColor(role) {
  switch (role) {
    case 'ADMIN':   return { bg: 'bg-danger/10',  text: 'text-danger',  border: 'border-danger/20' }
    case 'FACULTY': return { bg: 'bg-brand-50',   text: 'text-brand-700', border: 'border-brand-100' }
    default:        return { bg: 'bg-success/10', text: 'text-success',  border: 'border-success/20' }
  }
}

export function roleBadgeClass(role) {
  switch (role) {
    case 'ADMIN':   return 'bg-red-100 text-red-700'
    case 'FACULTY': return 'bg-brand-100 text-brand-700'
    default:        return 'bg-green-100 text-green-700'
  }
}

export function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60_000)       return 'now'
  if (diff < 3_600_000)    return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000)   return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604_800_000)  return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function formatMessageTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDateGroup(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 86_400_000) return 'Today'
  if (diff < 172_800_000) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

export function getConvDisplayName(conv, currentUserId) {
  if (conv.isGroup) return conv.name || 'Group Chat'
  const other = conv.participants?.find((p) => p.userId !== currentUserId)
  return other?.user?.name || 'Unknown'
}

export function getConvSubtitle(conv) {
  if (conv.isAnnouncement) return 'Announcement channel'
  if (conv.isGroup) {
    const count = conv.participants?.length || 0
    return `${count} member${count !== 1 ? 's' : ''}`
  }
  const other = conv.participants?.find(() => true)
  return other?.user?.department || ''
}
