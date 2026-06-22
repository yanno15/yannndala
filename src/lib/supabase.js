import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables Supabase manquantes. Ajoutez-les dans votre fichier .env')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Projects ──────────────────────────────────────────────────────────────────

export const getProjects = async (filters = {}) => {
  let query = supabase
    .from('projects')
    .select('*')
    .order('order_index', { ascending: true })

  if (filters.featured) query = query.eq('featured', true)
  if (filters.category) query = query.eq('category', filters.category)

  const { data, error } = await query
  return { data, error }
}

export const getProject = async (slug) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()
  return { data, error }
}

export const createProject = async (project) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
  return { data, error }
}

export const updateProject = async (id, updates) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteProject = async (id) => {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  return { error }
}

// ── Skills ────────────────────────────────────────────────────────────────────

export const getSkills = async () => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category', { ascending: true })
    .order('level', { ascending: false })
  return { data, error }
}

export const createSkill = async (skill) => {
  const { data, error } = await supabase
    .from('skills')
    .insert([skill])
    .select()
  return { data, error }
}

export const updateSkill = async (id, updates) => {
  const { data, error } = await supabase
    .from('skills')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteSkill = async (id) => {
  const { error } = await supabase.from('skills').delete().eq('id', id)
  return { error }
}

// ── Services ──────────────────────────────────────────────────────────────────

export const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('order_index', { ascending: true })
  return { data, error }
}

export const createService = async (service) => {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
  return { data, error }
}

export const updateService = async (id, updates) => {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteService = async (id) => {
  const { error } = await supabase.from('services').delete().eq('id', id)
  return { error }
}

// ── Experiences ───────────────────────────────────────────────────────────────

export const getExperiences = async () => {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('start_date', { ascending: false })
  return { data, error }
}

export const createExperience = async (exp) => {
  const { data, error } = await supabase
    .from('experiences')
    .insert([exp])
    .select()
  return { data, error }
}

export const updateExperience = async (id, updates) => {
  const { data, error } = await supabase
    .from('experiences')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteExperience = async (id) => {
  const { error } = await supabase.from('experiences').delete().eq('id', id)
  return { error }
}

// ── Messages (Contact) ────────────────────────────────────────────────────────

export const sendMessage = async (message) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
  return { data, error }
}

export const getMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const markMessageRead = async (id) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', id)
    .select()
  return { data, error }
}

// ── Profile ───────────────────────────────────────────────────────────────────

export const getProfile = async () => {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .single()
  return { data, error }
}

export const updateProfile = async (updates) => {
  const { data, error } = await supabase
    .from('profile')
    .update(updates)
    .eq('id', 1)
    .select()
  return { data, error }
}

// ── Storage (upload images) ───────────────────────────────────────────────────

export const uploadImage = async (file, bucket = 'portfolio') => {
  const filename = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file)

  if (error) return { url: null, error }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename)

  return { url: publicUrl, error: null }
}
