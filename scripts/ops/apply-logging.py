#!/usr/bin/env python3
import json,os,pathlib,re,shutil,subprocess
base=pathlib.Path('/home/ubuntu/techenglish-ops');repo=pathlib.Path('/home/ubuntu/apps/English');envfile=repo/'.env.compose'
def command(args,**kwargs):return subprocess.run(args,cwd=repo,check=True,**kwargs)
images={}
for service in ('api','web'):
 cid=command(['docker','compose','--env-file','.env.compose','ps','-q',service],capture_output=True,text=True).stdout.strip()
 images[service]=command(['docker','inspect','--format','{{.Config.Image}}',cid],capture_output=True,text=True).stdout.strip()
text=envfile.read_text();backup=base/'state/app-env-before-logging'
if not backup.exists():shutil.copy2(envfile,backup);backup.chmod(0o600)
override=str(base/'application-logging.yml')
match=re.search(r'^COMPOSE_FILE\s*=\s*(.*)$',text,re.M)
current=match.group(1).strip().strip('"\'') if match else 'docker-compose.yml'
if override not in current.split(':'):
 value=current+':'+override
 if match:text=text[:match.start()]+'COMPOSE_FILE='+value+text[match.end():]
 else:text=text.rstrip()+'\nCOMPOSE_FILE='+value+'\n'
 envfile.write_text(text);envfile.chmod(0o600)
env=dict(os.environ,API_IMAGE=images['api'],WEB_IMAGE=images['web'])
command(['docker','compose','--env-file','.env.compose','config','--quiet'],env=env)
command(['docker','compose','--env-file','.env.compose','up','-d','--no-build','--no-deps','--wait','api','web'],env=env,timeout=180)
print(json.dumps({'ok':True,'logging':{'max_size':'20m','max_file':5},'services':['api','web'],'images_preserved':True}))
