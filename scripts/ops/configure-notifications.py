#!/usr/bin/env python3
"""Enable email, Telegram, or both; secret values stay on the VPS."""
import argparse,json,os,pathlib,re,subprocess,urllib.request
BASE=pathlib.Path('/home/ubuntu/techenglish-ops');STATE=BASE/'state';SECRETS=BASE/'secrets';DIRECTORY=BASE/'alertmanager'
def envfile(path):
 result={}
 for line in path.read_text().splitlines():
  match=re.match(r'^\s*([A-Z_0-9]+)\s*=\s*(.*?)\s*$',line)
  if match:
   key,value=match.groups();result[key]=value.strip().strip('\"\'')
 return result

def secret(name,value):
 path=SECRETS/name
 with path.open('w')as stream:stream.write(value);stream.flush();os.fsync(stream.fileno())
 path.chmod(0o640)

def configure(reload=True):
 settings=json.loads((BASE/'notifications.json').read_text());DIRECTORY.mkdir(exist_ok=True);DIRECTORY.chmod(0o755)
 receiver={'name':'configured'};global_config={'resolve_timeout':'5m'};enabled=[]
 if settings['email'].get('enabled'):
  recipient=settings['email'].get('to','')
  if not re.fullmatch(r'[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+',recipient):raise ValueError('A valid recipient email is required')
  values=envfile(pathlib.Path('/home/ubuntu/apps/English/apps/api/.env'));values.update(envfile(pathlib.Path('/home/ubuntu/apps/English/.env.compose')))
  host=values.get('SMTP_HOST','');port=int(values.get('SMTP_PORT','587'));username=values.get('SMTP_USER')or values.get('SMTP_USERNAME');password=values.get('SMTP_PASS')or values.get('SMTP_PASSWORD')
  if not host or not username or not password or port!=587:raise ValueError('STARTTLS SMTP configuration is incomplete')
  secret('smtp-password',password)
  global_config.update({'smtp_smarthost':host+':'+str(port),'smtp_from':values.get('SMTP_FROM',username),'smtp_auth_username':username,'smtp_auth_password_file':'/run/secrets/smtp-password','smtp_require_tls':True})
  receiver['email_configs']=[{'to':recipient,'send_resolved':True,'headers':{'Subject':'{{ template "techenglish.subject" . }}'},'html':'{{ template "techenglish.email" . }}'}];enabled.append('email')
 if settings['telegram'].get('enabled'):
  token=(SECRETS/'telegram-token').read_text().strip();chat=str(settings['telegram'].get('chat_id',''))
  if not re.fullmatch(r'\d+:[A-Za-z0-9_-]{20,}',token)or not re.fullmatch(r'-?\d+',chat):raise ValueError('Telegram token and Chat ID are required when enabled')
  secret('telegram-token-runtime',token)
  receiver['telegram_configs']=[{'bot_token_file':'/run/secrets/telegram-token','chat_id':int(chat),'parse_mode':'HTML','send_resolved':True,'message':'TechEnglish — {{ .Status }}\n{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}\n{{ end }}Dashboard: https://techenglish.click/monitoring/'}];enabled.append('telegram')
 result={'templates':['/etc/alertmanager/email.tmpl'],'global':global_config,'route':{'receiver':'configured','group_by':['alertname','instance','service'],'group_wait':'30s','group_interval':'5m','repeat_interval':'6h','routes':[{'receiver':'configured','matchers':['test="true"'],'group_wait':'1s','repeat_interval':'24h'}]},'receivers':[receiver],'inhibit_rules':[{'source_matchers':['severity="critical"'],'target_matchers':['severity="warning"'],'equal':['alertname','instance','service']}]}
 candidate=DIRECTORY/'candidate.yml';candidate.write_text(json.dumps(result,ensure_ascii=False,indent=2));candidate.chmod(0o644)
 subprocess.run(['docker','compose','-f',str(BASE/'compose.yml'),'run','--rm','--no-deps','--entrypoint','/bin/amtool','alertmanager','check-config','/etc/alertmanager/candidate.yml'],cwd=BASE,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 candidate.replace(DIRECTORY/'alertmanager.yml')
 if reload:
  with urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:9093/-/reload',method='POST'),timeout=15)as response:assert response.status==200
 state={'enabled_channels':enabled,'email_to':settings['email'].get('to')if'email'in enabled else None,'telegram_pending':'telegram'not in enabled}
 (STATE/'notifications-status.json').write_text(json.dumps(state))
 print(json.dumps({'ok':True,**state}))

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--no-reload',action='store_true');args=parser.parse_args()
 try:configure(not args.no_reload)
 except Exception as error:print(json.dumps({'ok':False,'error_type':type(error).__name__,'message':str(error)if isinstance(error,ValueError)else'Notification configuration failed; previous configuration kept'}));raise SystemExit(1)
