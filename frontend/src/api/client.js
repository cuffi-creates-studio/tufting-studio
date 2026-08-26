const API = 'http://127.0.0.1:8000/api'

export const token = {
  get: () => localStorage.getItem('tufting_token'),
  set: (v) => localStorage.setItem('tufting_token', v),
  clear: () => localStorage.removeItem('tufting_token')
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  if (token.get()) headers.set('Authorization', `Bearer ${token.get()}`)
  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(API + path, { ...options, headers })
  if (!res.ok) {
    let msg = 'Request failed'
    try { msg = (await res.json()).detail || msg } catch {}
    throw new Error(msg)
  }
  return res
}

export async function login(username, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  return res.json()
}

export async function getProjects() {
  return (await request('/projects')).json()
}
export async function createProject(data) {
  return (await request('/projects', {method:'POST', body:JSON.stringify(data)})).json()
}
export async function deleteProject(id) {
  return (await request(`/projects/${id}`, {method:'DELETE'})).json()
}
export async function getMaterials() {
  return (await request('/materials')).json()
}
export async function addMaterial(data) {
  return (await request('/materials', {method:'POST', body:JSON.stringify(data)})).json()
}
export async function deleteMaterial(id) {
  return (await request(`/materials/${id}`, {method:'DELETE'})).json()
}
export async function processImage(mode, file, params) {
  const fd = new FormData()
  fd.append('image', file)
  Object.entries(params || {}).forEach(([k,v]) => fd.append(k, v))
  const res = await request(`/image-tools/${mode}`, {method:'POST', body:fd})
  const palette = res.headers.get('X-Palette')?.split(',').filter(Boolean) || []
  const blob = await res.blob()
  return { url: URL.createObjectURL(blob), palette }
}
export async function calculateYarn(data) {
  return (await request('/calculator', {
    method:'POST',
    body: JSON.stringify(data)
  })).json()
}
