import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grymcmfaikavirmvgtqx.supabase.co'
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeW1jbWZhaWthdmlybXZndHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mjk1ODksImV4cCI6MjA2NDEwNTU4OX0.0G3FbaAecOAO38oI1aaHWAKMF5vIzwHXTyv_tt-o_28'

export const supabase = createClient(supabaseUrl, supabaseKey)
