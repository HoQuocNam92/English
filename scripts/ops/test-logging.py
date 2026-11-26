#!/usr/bin/env python3
import json,subprocess,time,urllib.request,urllib.parse,uuid,pathlib
base=pathlib.Path('/home/ubuntu/techenglish-ops');marker='ops-canary-'+uuid.uuid4().hex;fake='FAKE_SECRET_'+uuid.uuid4().hex
with (base/'state/jobs.log').open('a') as stream:stream.write(marker+' ?token='+fake+'\n')
url='https://techenglish.click/monitoring/api/health?token='+fake
with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':marker}),timeout=10) as r:assert r.status==200
results={}
for _ in range(20):
 for name,selector in [('operations','{job="operations",service="backup-and-collector"}'),('nginx','{job="nginx",service="nginx-access"}')]:
  params=urllib.parse.urlencode({'query':selector+' |= "'+marker+'"','start':str(time.time_ns()-300_000_000_000),'end':str(time.time_ns()),'limit':'20'})
  with urllib.request.urlopen('http://127.0.0.1:3101/loki/api/v1/query_range?'+params,timeout=10) as r:data=json.load(r)
  lines=[v[1]for stream in data.get('data',{}).get('result',[])for v in stream['values']]
  if lines:
   print(json.dumps({'synthetic_stream':name,'redacted':[fake not in line for line in lines],'has_mask':['[REDACTED]' in line for line in lines],'synthetic_lines':lines}))
   assert all(fake not in line and '[REDACTED]' in line for line in lines),name+' redaction failed'
   results[name]=True
 if len(results)==2:break
 time.sleep(3)
assert len(results)==2,'Canary logs did not reach both streams'
result={'ok':True,'operations_log_ingested':True,'nginx_log_ingested':True,'sensitive_values_redacted':True}
(base/'state/logging-test.json').write_text(json.dumps(result))
print(json.dumps(result))
