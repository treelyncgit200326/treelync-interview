import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://izdgctpwzlqepygdinfc.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6ZGdjdHB3emxxZXB5Z2RpbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjYyNDcsImV4cCI6MjA5MTMwMjI0N30.3xrl97NttLfMMCQbWkytEh2BHw0z2i6dQpI7-5zNayw"

export const supabase = createClient(supabaseUrl, supabaseKey)