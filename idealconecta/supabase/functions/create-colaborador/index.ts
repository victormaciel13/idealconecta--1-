// Edge Function: create-colaborador
// Cria um novo colaborador (usuário de login + perfil) a partir do painel admin.
// Roda no servidor do Supabase — usa a service role key, que NUNCA fica no frontend.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Não autenticado.")

    // Cliente com a chave anônima, só para validar QUEM está chamando
    const supabaseCaller = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user: callerUser }, error: callerError } = await supabaseCaller.auth.getUser()
    if (callerError || !callerUser) throw new Error("Sessão inválida.")

    // Cliente com a service role — só usado DEPOIS de confirmar que quem chamou é admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: callerProfile } = await supabaseAdmin
      .from("colaboradores")
      .select("role")
      .eq("id", callerUser.id)
      .single()

    if (!callerProfile || callerProfile.role !== "admin") {
      throw new Error("Apenas administradores podem cadastrar novos colaboradores.")
    }

    const { email, nome, sobrenome, cargo, departamento, data_admissao, role } = await req.json()
    if (!email || !nome || !sobrenome) throw new Error("Nome, sobrenome e e-mail são obrigatórios.")

    // Cria o usuário e dispara um e-mail de convite (ele define a própria senha)
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { nome, sobrenome, full_name: `${nome} ${sobrenome}` },
    })
    if (createError) throw createError

    // O trigger handle_new_user() já criou a linha em "colaboradores" — agora completamos com os dados extras
    const { error: updateError } = await supabaseAdmin
      .from("colaboradores")
      .update({
        cargo: cargo || null,
        departamento: departamento || null,
        data_admissao: data_admissao || null,
        role: role || "colaborador",
      })
      .eq("id", created.user.id)
    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})