import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMembers() {
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const search = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setResults([])
      return
    }
    setSearching(true)
    const { data } = await supabase
      .from('members')
      .select('id, name, generation, student_id, department, contact')
      .ilike('name', `%${query.trim()}%`)
      .order('generation', { ascending: false })
      .limit(10)
    setResults(data || [])
    setSearching(false)
  }, [])

  const clear = useCallback(() => setResults([]), [])

  return { results, searching, search, clear }
}
