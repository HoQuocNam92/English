#!/usr/bin/env python3
import base64,json,pathlib,time,urllib.request,urllib.parse
BASE=pathlib.Path('/home/ubuntu/techenglish-ops')
def request(url,auth=False):
 headers={}
 if auth:
  password=(BASE/'secrets/grafana-admin-password').read_text().strip()
  headers['Authorization']='Basic '+base64.b64encode(('admin:'+password).encode()).decode()
 with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=20) as r:return json.load(r)
result={}
result['grafana_health']=request('https://techenglish.click/monitoring/api/health')['database']
dashboards=request('http://127.0.0.1:3100/monitoring/api/search?query=TechEnglish',True)
result['dashboard_found']=any(d.get('uid')=='techenglish-vps' for d in dashboards)
for source in ('prometheus','loki'):
 result[source+'_datasource']=request('http://127.0.0.1:3100/monitoring/api/datasources/uid/'+source+'/health',True).get('status')
targets=request('http://127.0.0.1:9090/api/v1/targets')['data']['activeTargets']
result['scrape_targets']=[{'job':t['labels']['job'],'instance':t['labels'].get('instance'),'health':t['health'],'error':t.get('lastError','')}for t in targets]
metric='techenglish_container_healthy'
result['container_health']=request('http://127.0.0.1:9090/api/v1/query?'+urllib.parse.urlencode({'query':metric}))['data']['result']
result['loki_services']=request('http://127.0.0.1:3101/loki/api/v1/label/service/values').get('data',[])
rules=request('http://127.0.0.1:9090/api/v1/rules')['data']['groups']
result['alert_rule_count']=sum(len(g['rules'])for g in rules)
result['alerts']=request('http://127.0.0.1:9090/api/v1/alerts')['data']['alerts']
(BASE/'state/verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'down_targets':[t for t in result['scrape_targets'] if t['health']!='up']}))
assert result['grafana_health']=='ok' and result['dashboard_found']
assert all(t['health']=='up' for t in result['scrape_targets'])
assert all(float(t['value'][1])==1 for t in result['container_health']) and len(result['container_health'])==3
assert result['prometheus_datasource']=='OK' and result['loki_datasource']=='OK'
assert result['alert_rule_count']>=17
(BASE/'state/verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'ok':True,'dashboard':result['dashboard_found'],'scrape_targets':len(targets),'log_services':result['loki_services'],'alert_rules':result['alert_rule_count'],'firing_alerts':[a['labels']['alertname']for a in result['alerts']if a['state']=='firing']}))
