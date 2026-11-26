#!/usr/bin/env python3
import pathlib,subprocess,urllib.request,json,shutil,time
base=pathlib.Path('/home/ubuntu/techenglish-ops')
for _ in range(30):
    try:
        with urllib.request.urlopen('http://127.0.0.1:3100/monitoring/api/health',timeout=3) as r:
            if json.load(r).get('database')=='ok':break
    except Exception:time.sleep(2)
else:raise RuntimeError('Grafana health check failed')
conf=pathlib.Path('/etc/nginx/sites-available/techenglish');text=conf.read_text();backup=base/'state/nginx-before-monitoring.conf'
if not backup.exists():shutil.copy2(conf,backup)
mapfile=pathlib.Path('/etc/nginx/conf.d/techenglish-monitoring-upgrade.conf')
mapfile.write_text("map $http_upgrade $techenglish_connection_upgrade {\n    default upgrade;\n    '' close;\n}\n")
if 'location ^~ /monitoring/' not in text:
    snippet='''    location = /monitoring { return 301 /monitoring/; }
    location ^~ /monitoring/ {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $techenglish_connection_upgrade;
        proxy_read_timeout 120s;
    }

'''
    if text.count('    location / {')<2:raise RuntimeError('Unexpected nginx configuration')
    conf.write_text(text.replace('    location / {',snippet+'    location / {',1))
    result=subprocess.run(['nginx','-t'],capture_output=True)
    if result.returncode:
        conf.write_text(text);raise RuntimeError('Nginx validation rejected the change; original restored')
    subprocess.run(['systemctl','reload','nginx'],check=True)
print(json.dumps({'ok':True,'dashboard':'https://techenglish.click/monitoring/'}))
