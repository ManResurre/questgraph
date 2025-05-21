import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://qhdklzevqkxdodmhuqqf.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZGtsemV2cWt4ZG9kbWh1cXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODM2MDgsImV4cCI6MjA2MzA1OTYwOH0.JCIx8yrL-_jrhRNjnFozw-_la7qw-s9kmxpWWTd2mq8";
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase;
