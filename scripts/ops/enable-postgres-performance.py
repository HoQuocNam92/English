#!/usr/bin/env python3
import pathlib,subprocess,json
base=pathlib.Path('/home/ubuntu/techenglish-ops')
db=subprocess.check_output(['docker','ps','-q','--filter','label=com.docker.compose.project=techenglish','--filter','label=com.docker.compose.service=db'],text=True).strip()
def sql(q):return subprocess.check_output(['docker','exec',db,'psql','-X','-U','techenglish','-d','techenglish','-v','ON_ERROR_STOP=1','-Atc',q],text=True).strip()
state=base/'state/postgres-before-performance.json'
if not state.exists():state.write_text(sql("SELECT json_object_agg(name,setting) FROM pg_settings WHERE name IN ('log_duration','log_statement','log_min_duration_statement','log_parameter_max_length','log_parameter_max_length_on_error');"));state.chmod(0o600)
for q in ["ALTER SYSTEM SET log_duration = 'on'","ALTER SYSTEM SET log_statement = 'none'","ALTER SYSTEM SET log_min_duration_statement = '-1'","ALTER SYSTEM SET log_parameter_max_length = '0'","ALTER SYSTEM SET log_parameter_max_length_on_error = '0'"]:sql(q)
sql('SELECT pg_reload_conf()');print(json.dumps({'ok':True,'duration_logging':True,'sql_text_logging':False}))
