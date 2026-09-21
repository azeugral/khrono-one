# -*- coding: utf-8 -*-
"""khrono-one — site one-page do Khrono (PT na raiz, EN em en/).
Reaproveita assets, painel (dash) e bloco de planos do base-lean; textos desta página ficam em T abaixo."""
import io, os, re, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.normpath(os.path.join(HERE, "..", "base-lean"))
BSRC = os.path.join(BASE, "src")
APP  = "https://azeugral.github.io/khrono-front/cliente/"     # área do cliente real, mostrada dentro dos celulares

def read(p):  return io.open(p, encoding="utf-8").read()
def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True); io.open(p, "w", encoding="utf-8", newline="\n").write(s)

# strings comuns (nav, planos, painel, rodapé) vêm do build do base-lean, sem rodar o build dele
_b = read(os.path.join(BASE, "build.py")); _ns = {"__file__": os.path.join(BASE, "build.py")}
exec(_b[:_b.index("layout = read(")], _ns)
LANGS, MARCA, DOMINIO, OK = _ns["LANGS"], _ns["MARCA"], _ns["DOMINIO"], _ns["OK"]
LANGS["pt"]["s"].update({"plan.ess.m":"Cobrado mensalmente", "plan.pro.m":"Cobrado mensalmente", "plan.note":"Os dois planos com 7 dias grátis. Anual = 10 mensalidades, 12 meses de acesso. Preços em reais, com impostos."})
LANGS["en"]["s"].update({"plan.ess.m":"Billed monthly", "plan.pro.m":"Billed monthly", "plan.note":"Both plans come with 7 days free. Yearly = 10 monthly payments, 12 months of access. Prices in BRL, taxes included."})

T = {
 "pt": dict(
  title="Khrono — agendamento online para o seu negócio", desc="Seu cliente escolhe o horário pelo link. Você organiza a agenda, acompanha a equipe e mantém seus clientes por perto. Para barbearias, salões e clínicas de estética. 7 dias grátis.",
  nav_seg="Segmentos", nav_feat="Funcionalidades", nav_in="Por dentro", nav_plans="Planos", nav_signin="Entrar", nav_start="Começar grátis", url_signin="https://khrono.tech/workspace", url_start="https://khrono.tech/workspace",
  hero_eye="Seu negócio tem o seu tempo", hero_h1a="Menos mensagens.", hero_h1b="Mais tempo para atender.",
  hero_lead="Seu cliente escolhe o horário pelo link. Você organiza a agenda, acompanha a equipe e mantém seus clientes por perto.",
  hero_cta1="Começar grátis", hero_cta2="Conhecer o Khrono", hero_note="7 dias para experimentar · a partir de R$ 59,90/mês",
  seg_eye="Segmentos", seg_h2="Feito para quem cuida de pessoas.", seg_lead="Cada negócio tem seu ritmo. O Khrono ajuda a organizar os serviços, os profissionais e os horários do seu.",
  seg1_h="Barbearias", seg1_p="Cortes, barbas e combinações de serviços. Organize os serviços e a agenda de cada profissional.",
  seg2_h="Salões de beleza", seg2_p="Uma agenda para os diferentes serviços e profissionais do salão, com o histórico dos seus clientes por perto.",
  seg3_h="Clínicas de estética", seg3_p="Organize seus procedimentos, disponibilidades e retornos com uma experiência simples de agendamento.",
  ess_eye="O essencial", ess_h2="Tudo conversa. Seu dia flui.", ess_lead="Da escolha do horário ao acompanhamento do atendimento, as informações ficam no mesmo lugar.",
  ess1_h="Agenda online", ess1_p="Compartilhe o link do seu negócio. O cliente escolhe serviço, profissional e um horário disponível, sem criar conta.",
  ess2_h="Clientes e equipe", ess2_p="Cadastros organizados, disponibilidade de cada profissional e histórico de quem volta. No Pro, programa de fidelidade.",
  ess3_h="Controle financeiro", ess3_p="No plano Pro, acompanhe pagamentos, comissões e resultados para entender o movimento do seu negócio.",
  in_eye="Por dentro", in_h2="Simples para você. Fácil para seu cliente.", in_lead="Duas experiências conectadas: a organização do seu dia e o agendamento de quem vai chegar.",
  in_tab1="Sua operação", in_tab2="Seu painel", in_tab3="Seu cliente",
  in_cap1="Os horários e os atendimentos de cada profissional em uma mesma agenda — o novo agendamento entra sozinho, já confirmado.",
  in_cap2="No Pro, vendas, agendamentos, comandas e ranking por profissional numa tela só.",
  in_cap3="É o link que vai na bio. Pode tocar: é a página do cliente de verdade, rodando aqui dentro.",
  ag_title="Sua agenda", ag_date="Segunda-feira, 21 de setembro", ag_day="Dia", ag_week="Semana", ag_ok="Confirmado", ag_free="Horário livre", ag_new="Novo agendamento", ag_wait="Aguardando",
  ag_p1="Ana", ag_p2="Bruno", ag_p3="Carla",
  ag_s1="Corte e finalização", ag_c1="Marina", ag_s2="Consulta estética", ag_c2="Lucas", ag_s3="Corte e barba", ag_c3="Beatriz", ag_s4="Escova", ag_c4="Helena", ag_s5="Limpeza de pele", ag_c5="Rafael",
  st_eye="Como começar", st_h2="Sua próxima agenda começa aqui.", st_lead="Em vinte minutos o link está no ar.",
  st1_h="Crie sua conta", st1_p="Nome, e-mail e o nome do negócio. Seus 7 dias de teste começam na hora.",
  st2_h="Organize seu negócio", st2_p="Cadastre os serviços, a equipe e os horários disponíveis para atendimento.",
  st3_h="Compartilhe seu link", st3_p="Coloque o agendamento na bio, envie aos clientes e acompanhe sua agenda.",
  f_h="Comece agora", f_p="Sem cartão, sem fidelidade. Cancela pelo painel.", f_nome="Seu nome", f_nome_ph="Como quer ser chamado", f_nome_err="Informe seu nome.",
  f_neg="Nome do negócio", f_neg_ph="Ex.: Studio Luma", f_neg_err="Informe o nome do negócio.", f_email="E-mail", f_email_ph="voce@seunegocio.com.br", f_email_err="Informe um e-mail válido.",
  f_seg="Segmento", f_seg1="Barbearia", f_seg2="Salão de beleza", f_seg3="Clínica de estética", f_seg4="Outro", f_btn="Criar conta grátis", f_fine="7 dias grátis · sem cartão · sem fidelidade",
  pl_eye="Planos", pl_h2="O plano certo para o seu momento.", pl_lead="Comece com o essencial no Básico ou amplie a gestão com o Pro. Experimente por 7 dias grátis.",
  fq_eye="Dúvidas frequentes", fq_h2="Antes de começar.",
  q1="Qual é a diferença entre Básico e Pro?", a1="O Básico atende 1 empresa e inclui catálogo de serviços, gestão de clientes, gestão da equipe, agenda e agendamento público. O Pro atende até 3 empresas e acrescenta financeiro e pagamentos, equipe e permissões e programa de fidelidade.",
  q2="Meu cliente precisa criar uma conta?", a2="Não. Ele agenda pelo link do negócio sem criar conta. O Khrono também oferece uma área do cliente para acompanhar agendamentos e, no plano Pro, a fidelidade.",
  q3="Posso usar no celular?", a3="Sim. O Khrono funciona pelo navegador e se adapta ao celular e ao computador, sem precisar instalar aplicativo.",
  q4="Como começo os 7 dias grátis?", a4="Clique em “Começar grátis” e crie a conta com nome, e-mail e o nome do negócio. Se quiser continuar depois dos sete dias, você escolhe o plano pelo painel.",
  q5="Já tenho uma conta. Onde entro?", a5="Em “Entrar”, no topo da página. Seus clientes continuam usando o link de agendamento do seu negócio e a área do cliente.",
  cta_h="Seu tempo merece uma agenda melhor.", cta_p="Experimente o Khrono e encontre mais espaço para fazer o que você faz bem.", cta_btn="Começar grátis",
  ft_tag1="Gestão de agendamentos.", ft_tag2="Organize sua agenda e acompanhe seus atendimentos em um só lugar.", ft_plat="Plataforma", ft_l0="Conhecer o Khrono", ft_l6="Acessar meu painel", ft_l5="Área do cliente", ft_l4="Entrar", ft_dev="Desenvolvimento e contato", ft_dev_p="Contato da desenvolvedora", ft_by="Desenvolvido por",
  ok_lbl="Incluído", no_lbl="Não incluído",
 ),
 "en": dict(
  title="Khrono — online booking for your business", desc="Clients pick a time through your link. You run the calendar, follow the team and keep clients close. For barbershops, salons and aesthetic clinics. 7 days free.",
  nav_seg="Segments", nav_feat="Features", nav_in="Inside", nav_plans="Plans", nav_signin="Sign in", nav_start="Start free", url_signin="https://khrono.tech/workspace", url_start="https://khrono.tech/workspace",
  hero_eye="Your business runs on your time", hero_h1a="Fewer messages.", hero_h1b="More time to serve.",
  hero_lead="Clients pick a time through your link. You run the calendar, follow the team and keep your clients close.",
  hero_cta1="Start free", hero_cta2="See how it works", hero_note="7 days to try it · from R$ 59.90/month",
  seg_eye="Segments", seg_h2="Made for people who care for people.", seg_lead="Every business has its rhythm. Khrono helps you organize the services, professionals and hours of yours.",
  seg1_h="Barbershops", seg1_p="Cuts, beards and service combos. Organize the services and each professional's calendar.",
  seg2_h="Beauty salons", seg2_p="One calendar for the salon's different services and professionals, with client history close at hand.",
  seg3_h="Aesthetic clinics", seg3_p="Organize procedures, availability and follow-ups with a simple booking experience.",
  ess_eye="The essentials", ess_h2="Everything talks. Your day flows.", ess_lead="From picking a time to following the appointment, the information stays in one place.",
  ess1_h="Online booking", ess1_p="Share your business link. The client picks a service, a professional and an available time — no account needed.",
  ess2_h="Clients and team", ess2_p="Tidy records, each professional's availability and the history of who comes back. On Pro, a loyalty programme.",
  ess3_h="Financial control", ess3_p="On Pro, follow payments, commissions and results to understand how your business is moving.",
  in_eye="Inside", in_h2="Simple for you. Easy for your client.", in_lead="Two connected experiences: the organization of your day and the booking of whoever is coming next.",
  in_tab1="Your operation", in_tab2="Your dashboard", in_tab3="Your client",
  in_cap1="Every professional's hours and appointments in one calendar — the new booking lands on its own, already confirmed.",
  in_cap2="On Pro: sales, bookings, tabs and a ranking per professional on one screen.",
  in_cap3="It's the link that goes in the bio. Go ahead and tap: it's the real client page, running right here.",
  ag_title="Your calendar", ag_date="Monday, 21 September", ag_day="Day", ag_week="Week", ag_ok="Confirmed", ag_free="Free slot", ag_new="New booking", ag_wait="Pending",
  ag_p1="Ana", ag_p2="Bruno", ag_p3="Carla",
  ag_s1="Cut and finish", ag_c1="Marina", ag_s2="Aesthetic consult", ag_c2="Lucas", ag_s3="Cut and beard", ag_c3="Beatriz", ag_s4="Blow-dry", ag_c4="Helena", ag_s5="Facial cleansing", ag_c5="Rafael",
  st_eye="How to start", st_h2="Your next calendar starts here.", st_lead="Your link is live in twenty minutes.",
  st1_h="Create your account", st1_p="Name, e-mail and the business name. Your 7-day trial starts right away.",
  st2_h="Set up your business", st2_p="Add services, the team and the hours available for appointments.",
  st3_h="Share your link", st3_p="Put booking in your bio, send it to clients and follow your calendar.",
  f_h="Start now", f_p="No card, no lock-in. Cancel from the dashboard.", f_nome="Your name", f_nome_ph="What should we call you", f_nome_err="Enter your name.",
  f_neg="Business name", f_neg_ph="e.g. Studio Luma", f_neg_err="Enter the business name.", f_email="E-mail", f_email_ph="you@yourbusiness.com", f_email_err="Enter a valid e-mail.",
  f_seg="Segment", f_seg1="Barbershop", f_seg2="Beauty salon", f_seg3="Aesthetic clinic", f_seg4="Other", f_btn="Create free account", f_fine="7 days free · no card · no lock-in",
  pl_eye="Plans", pl_h2="The right plan for your moment.", pl_lead="Start with the essentials on Basic or expand management with Pro. Both come with 7 days free.",
  fq_eye="Questions", fq_h2="Before you start.",
  q1="What is the difference between Basic and Pro?", a1="Basic covers 1 business and includes the service catalogue, client management, team management, calendar and public booking. Pro covers up to 3 businesses and adds finances and payments, team permissions and the loyalty programme.",
  q2="Do my clients need an account?", a2="No. They book through the business link without an account. Khrono also offers a client area to follow bookings and, on Pro, loyalty.",
  q3="Can I use it on my phone?", a3="Yes. Khrono runs in the browser and adapts to phone and desktop, with nothing to install.",
  q4="How do I start the 7 free days?", a4="Click “Start free” and create the account with your name, e-mail and business name. If you want to carry on after seven days, you pick a plan from the dashboard.",
  q5="I already have an account. Where do I sign in?", a5="Use “Sign in” at the top of the page. Your clients keep using your business booking link and the client area.",
  cta_h="Your time deserves a better calendar.", cta_p="Try Khrono and find more room to do what you do well.", cta_btn="Start free",
  ft_tag1="Appointment management.", ft_tag2="Organize your calendar and follow your appointments in one place.", ft_plat="Platform", ft_l0="Discover Khrono", ft_l6="Open my dashboard", ft_l5="Client area", ft_l4="Sign in", ft_dev="Development and contact", ft_dev_p="Developer contact", ft_by="Developed by",
  ok_lbl="Included", no_lbl="Not included",
 ),
}

# ---------- pedaços reaproveitados do base-lean ----------
def grab(pat, s, flags=re.S):
    m = re.search(pat, s, flags); assert m, pat[:50]; return m.group(1)
base_index = { l: read(os.path.join(BSRC, "pages", l, "index.html")) for l in LANGS }
mosaic = { l: grab(r'(<div class="mosaic" aria-hidden="true">.*?)\n</section>', base_index[l]) for l in LANGS }
icons  = re.findall(r'<div class="ic"><svg.*?</svg></div>', base_index["pt"], re.S); assert len(icons) == 3
icons[1] = '<div class="ic"><svg viewBox="0 0 64 64"><circle cx="26" cy="22" r="9"/><path d="M8 52c1.5-10 8.5-16 18-16s16.5 6 18 16"/><path class="d1" d="M43 15a7 7 0 0 1 0 14M47 36c6 1.5 9.5 6 10.5 13"/><circle class="dot" cx="26" cy="22" r="2.4"/></svg></div>'
dash   = read(os.path.join(BSRC, "partials", "dash.html"))
plans  = read(os.path.join(BSRC, "partials", "plans.html"))
tpl    = read(os.path.join(HERE, "src", "page.html"))
layout = read(os.path.join(HERE, "src", "layout.html"))
agenda = read(os.path.join(HERE, "src", "agenda.html"))

def fill(s, lang):
    L = LANGS[lang]; t = T[lang]
    s = s.replace("{{dash}}", dash).replace("{{plans}}", plans).replace("{{agenda}}", agenda).replace("{{mosaic}}", mosaic[lang])
    for i, ic in enumerate(icons, 1): s = s.replace("{{ic%d}}" % i, ic)
    s = re.sub(r"\[\[t\.(\w+)\]\]", lambda m: t[m.group(1)], s)
    s = re.sub(r"\[\[p:([\w-]+)\]\]", lambda m: {"signup": "#comecar", "pricing": "#planos", "index": "#topo"}.get(m.group(1), "#"), s)
    s = re.sub(r"\[\[([\w.]+)\]\]", lambda m: L["s"][m.group(1)], s)
    s = s.replace("{{base}}", L["base"]).replace("{{marca}}", MARCA).replace("{{dominio}}", DOMINIO).replace("{{ok}}", OK).replace("{{app}}", APP)
    return s

for lang in LANGS:
    L = LANGS[lang]; t = T[lang]
    main = tpl
    # links dos CTAs do herói reaproveitado
    main = main.replace('href="criar-conta.html"', 'href="#comecar"').replace('href="precos.html"', 'href="#planos"').replace('href="sign-up.html"', 'href="#comecar"').replace('href="pricing.html"', 'href="#planos"')
    html = (layout.replace("{{title}}", t["title"]).replace("{{desc}}", t["desc"]).replace("{{main}}", main)
                  .replace("{{lang}}", "pt-BR" if lang == "pt" else "en").replace("{{alt_lang}}", "en" if lang == "pt" else "pt-BR")
                  .replace("{{alt}}", "en/" if lang == "pt" else "../"))
    html = fill(html, lang)
    html = html.replace('href="criar-conta.html"', 'href="#comecar"').replace('href="precos.html"', 'href="#planos"').replace('href="sign-up.html"', 'href="#comecar"').replace('href="pricing.html"', 'href="#planos"')
    assert "[[" not in html and "{{" not in html, re.findall(r"(\[\[[^\]]+\]\]|\{\{[^}]+\}\})", html)[:5]
    write(os.path.join(HERE, L["dir"], "index.html"), html)

# ---------- assets: os do base-lean + os desta página ----------
dst = os.path.join(HERE, "assets")
for sub in ("css", "js", "img"):
    src_dir = os.path.join(BSRC, "assets", sub)
    for root, _, files in os.walk(src_dir):
        rel = os.path.relpath(root, src_dir)
        for fn in files:
            s, d = os.path.join(root, fn), os.path.join(dst, sub, rel, fn) if rel != "." else os.path.join(dst, sub, fn)
            os.makedirs(os.path.dirname(d), exist_ok=True)
            if fn.endswith((".css", ".js", ".svg")): write(d, read(s).replace("{{marca}}", MARCA))
            else: shutil.copy2(s, d)
for fn in ("one.css",): shutil.copy2(os.path.join(HERE, "src", fn), os.path.join(dst, "css", fn))
for fn in ("one.js",):  shutil.copy2(os.path.join(HERE, "src", fn), os.path.join(dst, "js", fn))
print("ok — index.html e en/index.html gerados")
