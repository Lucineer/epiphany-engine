interface Env { EPIPHANY_KV: KVNamespace; DEEPSEEK_API_KEY?: string; }

const CSP: Record<string, string> = { 'default-src': "'self'", 'script-src': "'self' 'unsafe-inline' 'unsafe-eval'", 'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com", 'font-src': "'self' https://fonts.gstatic.com", 'img-src': "'self' data: https:", 'connect-src': "'self' https://api.deepseek.com https://*'" };

function json(data: unknown, s = 200) { return new Response(JSON.stringify(data), { status: s, headers: { 'Content-Type': 'application/json', ...CSP } }); }

async function callLLM(key: string, system: string, user: string, model = 'deepseek-chat', max = 1500): Promise<string> {
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: max, temperature: 0.6 })
  });
  return (await resp.json()).choices?.[0]?.message?.content || '';
}

function stripFences(t: string): string {
  t = t.trim();
  while (t.startsWith('```')) { t = t.split('\n').slice(1).join('\n'); }
  while (t.endsWith('```')) { t = t.slice(0, -3).trim(); }
  return t;
}

const FLEET_CAPS: Record<string, string[]> = {
  'cocapn': ['chat', 'reroute'], 'the-seed': ['self-modify', 'evolve'], 'git-agent': ['commit', 'create-file'],
  'makerlog-ai': ['code-review', 'refactor'], 'studylog-ai': ['teach', 'quiz'], 'dmlog-ai': ['narrate', 'roleplay'],
  'dead-reckoning-engine': ['storyboard', 'iterate'], 'skill-evolver': ['propose-skill', 'analyze'],
  'flow-forge': ['workflow', 'chain-steps'], 'fleet-immune': ['detect-threat', 'vaccinate'],
  'context-compactor': ['compress', 'summarize'], 'deckboss-ai': ['monitor', 'coordinate'],
  'cocapn-equipment': ['equip', 'load-module'], 'increments-fleet-trust': ['score', 'audit'],
  'luciddreamer-ai': ['generate-content', 'creative'], 'dogmind-arena': ['breed', 'optimize'],
  'personallog-ai': ['journal', 'reflect'], 'businesslog-ai': ['crm', 'meeting'],
  'fleet-orchestrator': ['discover', 'health-check'],
};

interface SubProblem { id: string; description: string; assignedTo: string; capability: string; }
interface PartialSolution { subproblemId: string; solution: string; confidence: number; vessel: string; }
interface Problem { id: string; description: string; status: string; subproblems: SubProblem[]; solutions: PartialSolution[]; synthesis?: string; created: string; }

function getLanding(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Epiphany Engine — Cocapn</title><style>
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e0e0e0;margin:0;min-height:100vh}
.container{max-width:800px;margin:0 auto;padding:40px 20px}
h1{color:#818cf8;font-size:2.2em}a{color:#818cf8;text-decoration:none}
.sub{color:#8A93B4;margin-bottom:2em}
.card{background:#16161e;border:1px solid #2a2a3a;border-radius:12px;padding:24px;margin:20px 0}
.card h3{color:#818cf8;margin:0 0 12px 0}
.btn{background:#818cf8;color:#0a0a0f;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold}
.btn:hover{background:#6366f1}
textarea{width:100%;background:#0a0a0f;color:#e0e0e0;border:1px solid #2a2a3a;border-radius:8px;padding:12px;box-sizing:border-box;font-family:monospace}
.problem{background:#1a1a2a;padding:16px;border-radius:8px;margin:12px 0;border-left:3px solid #818cf8}
.problem .status{font-size:.85em;padding:2px 8px;border-radius:4px;display:inline-block}
.status-open{background:#f59e0b;color:#0a0a0f}.status-synthesized{background:#22c55e;color:#0a0a0f}
.solution{background:#0a1a0a;border-left:3px solid #22c55e;padding:8px;margin:8px 0;border-radius:0 8px 8px 0;font-size:.9em;color:#8A93B4}
pre{background:#0a0a0f;padding:16px;border-radius:8px;overflow-x:auto;font-size:.85em;color:#8A93B4}
</style></head><body><div class="container">
<h1>💡 Epiphany Engine</h1><p class="sub">Submit a problem. The fleet decomposes it, assigns sub-problems, and synthesizes breakthroughs.</p>
<div class="card"><h3>Submit Problem</h3>
<textarea id="problem" rows="3" placeholder="Describe the problem your fleet should solve..."></textarea>
<div style="margin-top:12px"><button class="btn" onclick="submit()">Decompose & Assign</button></div></div>
<div id="problems" class="card"><h3>Active Problems</h3><p style="color:#8A93B4">Loading...</p></div>
<div id="synthesis" class="card" style="display:none"><h3>Synthesis</h3><pre id="synthOut"></pre></div>
<script>
async function load(){try{const r=await fetch('/api/problems');const p=await r.json();
const el=document.getElementById('problems');
if(!p.length){el.innerHTML='<h3>Active Problems</h3><p style="color:#8A93B4">No problems submitted yet.</p>';return;}
el.innerHTML='<h3>Active Problems ('+p.length+')</h3>'+p.map(x=>'<div class="problem"><strong>'+x.description.substring(0,100)+'</strong> <span class="status status-'+(x.status==='synthesized'?'synthesized':'open')+'">'+x.status+'</span><br><span style="color:#8A93B4;font-size:.85em">'+x.subproblems.length+' sub-problems · '+x.solutions.length+' solutions</span>'+(x.synthesis?'<div class="solution">'+x.synthesis.substring(0,200)+'...</div>':'')+'</div>').join('');}catch(e){}}
async function submit(){const p=document.getElementById('problem').value.trim();if(!p)return;
const btn=document.querySelector('.btn');btn.textContent='Decomposing...';btn.disabled=true;
const r=await fetch('/api/problem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:p})});
const result=await r.json();
if(result.error){alert(result.error);}else{alert('Problem decomposed into '+result.subproblems.length+' sub-problems');document.getElementById('problem').value='';load();}
btn.textContent='Decompose & Assign';btn.disabled=false;}
load();</script>
<div style="text-align:center;padding:24px;color:#475569;font-size:.75rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> · <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>
</div></body></html>`;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/health') return json({ status: 'ok', vessel: 'epiphany-engine' });
    if (url.pathname === '/vessel.json') return json({ name: 'epiphany-engine', type: 'cocapn-vessel', version: '1.0.0', description: 'Swarm problem-solving — decompose, assign, synthesize fleet breakthroughs', fleet: 'https://the-fleet.casey-digennaro.workers.dev', capabilities: ['problem-decomposition', 'vessel-assignment', 'solution-synthesis'] });

    if (url.pathname === '/api/problems') return json((await env.EPIPHANY_KV.get('problems', 'json') as Problem[] || []).slice(0, 10));

    if (url.pathname === '/api/problem' && req.method === 'POST') {
      const { description } = await req.json() as { description: string };
      if (!description || !env.DEEPSEEK_API_KEY) return json({ error: description ? 'no API key' : 'description required' }, 400);

      // Decompose into sub-problems
      const capStr = Object.entries(FLEET_CAPS).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n');
      const raw = await callLLM(env.DEEPSEEK_API_KEY,
        'Decompose a problem into 2-4 sub-problems. Assign each to a fleet vessel based on capabilities. Output JSON array: [{"description":"...","assignedTo":"vessel-name","capability":"..."}]',
        `Problem: ${description}\n\nAvailable vessels:\n${capStr}`, 'deepseek-chat', 1000);

      let subproblems: SubProblem[];
      try {
        const parsed = JSON.parse(stripFences(raw));
        subproblems = (Array.isArray(parsed) ? parsed : [parsed]).map((sp: any, i: number) => ({
          id: `${Date.now()}-${i}`, description: String(sp.description || sp), assignedTo: String(sp.assignedTo || 'cocapn'), capability: String(sp.capability || 'general')
        }));
      } catch { subproblems = [{ id: `${Date.now()}-0`, description, assignedTo: 'cocapn', capability: 'general' }]; }

      const problem: Problem = { id: Date.now().toString(), description: description.substring(0, 500), status: 'open', subproblems, solutions: [], created: new Date().toISOString() };
      const problems = await env.EPIPHANY_KV.get('problems', 'json') as Problem[] || [];
      problems.unshift(problem);
      if (problems.length > 50) problems.length = 50;
      await env.EPIPHANY_KV.put('problems', JSON.stringify(problems));
      return json({ id: problem.id, subproblems });
    }

    if (url.pathname === '/api/solution' && req.method === 'POST') {
      const { problemId, subproblemId, solution, confidence, vessel } = await req.json() as { problemId: string; subproblemId: string; solution: string; confidence: number; vessel: string };
      const problems = await env.EPIPHANY_KV.get('problems', 'json') as Problem[] || [];
      const problem = problems.find((p: Problem) => p.id === problemId);
      if (!problem) return json({ error: 'not found' }, 404);
      problem.solutions.push({ subproblemId, solution: solution.substring(0, 1000), confidence: confidence || 0.5, vessel: vessel || 'unknown' });

      // Auto-synthesize when all sub-problems have solutions
      const solvedIds = new Set(problem.solutions.map(s => s.subproblemId));
      if (problem.subproblems.every(sp => solvedIds.has(sp.id)) && env.DEEPSEEK_API_KEY) {
        const solutionStr = problem.solutions.map(s => `[${s.vessel} (${s.confidence.toFixed(2)}): ${s.solution}]`).join('\n');
        const synth = await callLLM(env.DEEPSEEK_API_KEY,
          'Synthesize partial solutions into a coherent breakthrough answer. Be specific. If solutions conflict, explain why and pick the stronger one.',
          `Problem: ${problem.description}\n\nPartial solutions:\n${solutionStr}`, 'deepseek-chat', 1500);
        problem.synthesis = stripFences(synth);
        problem.status = 'synthesized';
      }

      await env.EPIPHANY_KV.put('problems', JSON.stringify(problems));
      return json({ saved: true, status: problem.status });
    }

    return new Response(getLanding(), { headers: { 'Content-Type': 'text/html;charset=UTF-8', ...CSP } });
  }
};
