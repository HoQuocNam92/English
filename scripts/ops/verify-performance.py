import json,pathlib,time,urllib.parse,urllib.request,subprocess
base=pathlib.Path('/home/ubuntu/techenglish-ops')
def get(port,path,params=None):
 url='http://127.0.0.1:'+str(port)+path+('?' + urllib.parse.urlencode(params) if params else '')
 with urllib.request.urlopen(url,timeout=30)as r:return json.load(r)
dashboard=json.loads((base/'dashboards/techenglish.json').read_text());tested=[]
for panel in dashboard['panels']:
 if panel['datasource']['uid']!='loki':continue
 for target in panel['targets']:
  expr=target['expr'];params={'query':expr}
  if panel['type']=='logs':path='/loki/api/v1/query_range';params.update({'start':str(time.time_ns()-300_000_000_000),'end':str(time.time_ns()),'limit':'10'})
  else:path='/loki/api/v1/query'
  data=get(3101,path,params);assert data['status']=='success',panel['title'];tested.append({'title':panel['title'],'series':len(data['data']['result'])})
metrics=(base/'generated/techenglish.prom').read_text()
for name in ['techenglish_container_memory_bytes','techenglish_container_network_receive_bytes_total','techenglish_database_active_queries','techenglish_backup_size_bytes','techenglish_api_latency_p95_seconds']:assert name in metrics,name
assert any(x['title']=='API p95 latency' and x['series']>0 for x in tested)
result={'ok':True,'queries_validated':tested,'dashboard_panels':len(dashboard['panels'])};(base/'state/performance-verification.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
