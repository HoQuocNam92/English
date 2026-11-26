import subprocess,time,json,urllib.request,urllib.parse,pathlib
base=pathlib.Path('/home/ubuntu/techenglish-ops');db=subprocess.check_output(['docker','ps','-q','--filter','label=com.docker.compose.project=techenglish','--filter','label=com.docker.compose.service=db'],text=True).strip()
p=subprocess.Popen(['docker','exec',db,'psql','-X','-U','techenglish','-d','techenglish','-c','SELECT pg_sleep(6);'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
time.sleep(2);subprocess.run(['python3',str(base/'bin/ops.py'),'collect'],check=True)
metrics=(base/'generated/techenglish.prom').read_text();assert 'techenglish_database_slow_active_queries 1.0' in metrics or any(line.startswith('techenglish_database_slow_active_queries ')and float(line.split()[-1])>=1 for line in metrics.splitlines())
assert p.wait(timeout=15)==0
query='{job="docker",service="db"} | regexp `duration: (?P<duration_ms>[0-9.]+) ms` | duration_ms >= 1000 | __error__=""'
for attempt in range(15):
 params=urllib.parse.urlencode({'query':query,'start':str(time.time_ns()-120_000_000_000),'end':str(time.time_ns()),'limit':10})
 with urllib.request.urlopen('http://127.0.0.1:3101/loki/api/v1/query_range?'+params,timeout=15) as r:data=json.load(r)
 if data['data']['result']:break
 time.sleep(2)
else:raise RuntimeError('Slow PostgreSQL timing log did not reach Loki')
subprocess.run(['python3',str(base/'bin/ops.py'),'collect'],check=True)
result={'ok':True,'active_slow_query_detected':True,'completed_slow_operation_logged':True,'sql_text_not_required':True};(base/'state/slow-query-test.json').write_text(json.dumps(result));print(json.dumps(result))
