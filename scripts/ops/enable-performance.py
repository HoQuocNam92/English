#!/usr/bin/env python3
import pathlib,subprocess,json
base=pathlib.Path('/home/ubuntu/techenglish-ops');conf=pathlib.Path('/etc/nginx/sites-available/techenglish');text=conf.read_text();backup=base/'state/nginx-before-performance.conf'
if not backup.exists():backup.write_text(text);backup.chmod(0o600)
target=pathlib.Path('/etc/nginx/conf.d/techenglish-performance.conf');target.write_text((base/'nginx-performance.conf').read_text())
if 'techenglish-performance.log techenglish_performance' not in text:
 text=text.replace('    server_name techenglish.click;','    server_name techenglish.click;\n    access_log /var/log/nginx/techenglish-performance.log techenglish_performance;').replace('    server_name api.techenglish.click;','    server_name api.techenglish.click;\n    access_log /var/log/nginx/techenglish-performance.log techenglish_performance;');conf.write_text(text)
r=subprocess.run(['nginx','-t'],capture_output=True)
if r.returncode:conf.write_text(backup.read_text());raise RuntimeError('Nginx validation failed')
subprocess.run(['systemctl','reload','nginx'],check=True)
print(json.dumps({'ok':True,'nginx_performance_logging':True}))
