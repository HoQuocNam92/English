#!/usr/bin/env python3
"""TechEnglish VPS operations. Database contents never leave the configured backup paths."""
import argparse, datetime as dt, gzip, hashlib, json, os, pathlib, re, shutil, subprocess, sys, tempfile, time, uuid
BASE = pathlib.Path(__file__).resolve().parent.parent
STATE, GEN = BASE/'state', BASE/'generated'
BACKUPS = pathlib.Path.home()/'techenglish-backups'/'automated'
SERVICES = ('api', 'web', 'db')
for directory in (STATE, GEN, BACKUPS):
    directory.mkdir(parents=True, exist_ok=True)
os.chmod(STATE, 0o700)
os.chmod(BACKUPS, 0o700)

def run(args, **kwargs):
    return subprocess.run(args, check=True, timeout=kwargs.pop('timeout',120), **kwargs)
def output(args):
    return run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True).stdout.strip()
def atomic(path, value, mode=0o600):
    temporary = path.with_name(path.name+'.tmp-'+uuid.uuid4().hex)
    temporary.write_text(json.dumps(value,ensure_ascii=False,sort_keys=True)+'\n' if not isinstance(value,str) else value)
    temporary.chmod(mode)
    temporary.replace(path)
def load(path, default):
    return json.loads(path.read_text()) if path.exists() else default

def db_container():
    ids=output(['docker','ps','-q','--filter','label=com.docker.compose.project=techenglish','--filter','label=com.docker.compose.service=db']).splitlines()
    if len(ids)!=1: raise RuntimeError('Expected one running application database')
    return ids[0]
def sql(db, query, database='techenglish'):
    return output(['docker','exec',db,'psql','-X','-U','techenglish','-d',database,'-v','ON_ERROR_STOP=1','-Atc',query])
def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()
def copy_to_db(db,dump):
    remote='/tmp/techenglish-ops-'+uuid.uuid4().hex+'.dump'
    run(['docker','cp',str(dump),db+':'+remote],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    return remote

def backup():
    import fcntl
    with (STATE/'backup.lock').open('w') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        started=time.time(); stamp=dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        target=BACKUPS/'daily'/stamp; temp=BACKUPS/('.partial-'+uuid.uuid4().hex)
        temp.mkdir(mode=0o700); db=db_container(); remote=None
        try:
            with (temp/'database.dump').open('wb') as stream:
                run(['docker','exec',db,'pg_dump','-U','techenglish','-d','techenglish','-Fc','--no-owner','--no-acl'],stdout=stream,stderr=subprocess.PIPE,timeout=900)
            remote=copy_to_db(db,temp/'database.dump')
            run(['docker','exec',db,'pg_restore','--list',remote],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
            plain_hash=hashlib.sha256()
            with tempfile.TemporaryFile() as errors:
                process=subprocess.Popen(['docker','exec',db,'pg_restore','--no-owner','--no-acl','-f','-',remote],stdout=subprocess.PIPE,stderr=errors)
                with (temp/'database.sql.gz').open('wb') as raw:
                    with gzip.GzipFile(fileobj=raw,mode='wb',mtime=0) as compressed:
                        for chunk in iter(lambda:process.stdout.read(1024*1024),b''):
                            compressed.write(chunk); plain_hash.update(chunk)
                if process.wait(timeout=900)!=0: raise RuntimeError('SQL export failed')
            extras=[]
            if sql(db,"SELECT to_regclass('public.admin_mfa') IS NULL;")=='t':
                api_ids=output(['docker','ps','-q','--filter','label=com.docker.compose.project=techenglish','--filter','label=com.docker.compose.service=api']).splitlines()
                if len(api_ids)!=1: raise RuntimeError('Expected one API for file-state checkpoint')
                with (temp/'app-state.json').open('wb') as stream:
                    run(['docker','exec',api_ids[0],'node','/app/docker/checkpoint-file-state.cjs'],stdout=stream,stderr=subprocess.PIPE)
                state=json.loads((temp/'app-state.json').read_text())
                if not all(isinstance(state.get(name),list) for name in ('adminMfa','auditLog','auditAlert','studyTimeSession')): raise RuntimeError('Invalid file-state checkpoint')
                extras=['app-state.json']
            manifest={'format':1,'database':'techenglish','created_at':stamp,'created_timestamp':started,
                      'postgres_version':sql(db,'SHOW server_version;'),
                      'files':{name:{'sha256':sha(temp/name),'bytes':(temp/name).stat().st_size} for name in ['database.dump','database.sql.gz']+extras},
                      'sql_plain_sha256':plain_hash.hexdigest()}
            atomic(temp/'manifest.json',manifest)
            atomic(temp/'SHA256SUMS',''.join(f"{data['sha256']}  {name}\n" for name,data in manifest['files'].items()))
            for f in temp.iterdir(): f.chmod(0o600)
            target.parent.mkdir(exist_ok=True); temp.rename(target)
            now=dt.datetime.now(dt.timezone.utc)
            for kind,keep in (('daily',14),('weekly',8),('monthly',6)):
                folder=BACKUPS/kind;folder.mkdir(exist_ok=True)
                if (kind=='weekly' and now.weekday()==6) or (kind=='monthly' and now.day==1):
                    linked=folder/stamp;linked.mkdir(mode=0o700)
                    for file in target.iterdir(): os.link(file,linked/file.name)
                snapshots=sorted(p for p in folder.iterdir() if p.is_dir() and re.fullmatch(r'\d{8}T\d{6}Z',p.name))
                for stale in snapshots[:-keep]:
                    if stale.resolve().parent!=folder.resolve(): raise RuntimeError('Retention path rejected')
                    allowed={'database.dump','database.sql.gz','manifest.json','SHA256SUMS'}
                    actual={f.name for f in stale.iterdir()}
                    if actual not in (allowed,allowed|{'app-state.json'}): continue
                    allowed=actual
                    for name in allowed: (stale/name).unlink()
                    stale.rmdir()
            atomic(STATE/'backup.json',{'last_run_success':1,'last_success':time.time(),'duration_seconds':time.time()-started,'latest':stamp,'bytes':sum(f.stat().st_size for f in target.iterdir())})
            print(json.dumps({'ok':True,'snapshot':stamp,'duration_seconds':round(time.time()-started,2)}))
        except Exception:
            state=load(STATE/'backup.json',{});state['last_run_success']=0;state['last_failure']=time.time();atomic(STATE/'backup.json',state)
            raise
        finally:
            if remote: run(['docker','exec',db,'rm','-f','--',remote],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)

def latest():
    state=load(STATE/'backup.json',{})
    stamp=state.get('latest','')
    if not re.fullmatch(r'\d{8}T\d{6}Z',stamp): raise RuntimeError('No successful snapshot')
    path=BACKUPS/'daily'/stamp
    manifest=load(path/'manifest.json',{})
    return {'snapshot':stamp,'directory':str(path),'manifest':manifest}

def table_counts(db,database):
    query="SELECT string_agg(format('SELECT %L, count(*)::bigint FROM %I.%I', tablename, schemaname, tablename),' UNION ALL ' ORDER BY tablename) FROM pg_tables WHERE schemaname='public';"
    statement=sql(db,query,database)
    return sql(db,statement,database).splitlines()

def verify(dump=None,plain=None):
    started=time.time();db=db_container();remote=None;created=[]
    snapshot=latest() if dump is None else None
    dump=pathlib.Path(dump) if dump else pathlib.Path(snapshot['directory'])/'database.dump'
    plain=pathlib.Path(plain) if plain else pathlib.Path(snapshot['directory'])/'database.sql.gz'
    if snapshot:
        for name,data in snapshot['manifest']['files'].items():
            if sha(pathlib.Path(snapshot['directory'])/name)!=data['sha256']: raise RuntimeError('Backup checksum mismatch')
    suffix=uuid.uuid4().hex[:12];names=['techenglish_verify_dump_'+suffix,'techenglish_verify_sql_'+suffix]
    try:
        remote=copy_to_db(db,dump)
        for name in names:
            if not re.fullmatch(r'techenglish_verify_(dump|sql)_[0-9a-f]{12}',name) or name=='techenglish': raise RuntimeError('Unsafe temporary database name')
            sql(db,'CREATE DATABASE "'+name+'";', 'postgres');created.append(name)
        run(['docker','exec',db,'pg_restore','-U','techenglish','--no-owner','--no-acl','--exit-on-error','-d',names[0],remote],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,timeout=900)
        with tempfile.TemporaryDirectory(prefix='techenglish-restore-') as temporary:
            source=plain
            if plain.suffix=='.gz':
                source=pathlib.Path(temporary)/'database.sql'
                with gzip.open(plain,'rb') as input_stream,source.open('wb') as out: shutil.copyfileobj(input_stream,out)
                if sha(source)!=snapshot['manifest']['sql_plain_sha256']: raise RuntimeError('Plain SQL checksum mismatch')
            with source.open('rb') as stream:
                run(['docker','exec','-i',db,'psql','-X','-U','techenglish','-d',names[1],'-v','ON_ERROR_STOP=1'],stdin=stream,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,timeout=900)
        first,second=table_counts(db,names[0]),table_counts(db,names[1])
        if not first or first!=second: raise RuntimeError('Restored snapshots disagree')
        result={'ok':True,'last_run_success':1,'last_success':time.time(),'duration_seconds':time.time()-started,'table_count':len(first),'dump_and_sql_match':True,'table_counts':first}
        atomic(STATE/'restore.json',result)
        print(json.dumps({k:v for k,v in result.items() if k!='table_counts'}))
    except Exception:
        state=load(STATE/'restore.json',{});state['last_run_success']=0;state['last_failure']=time.time();atomic(STATE/'restore.json',state);raise
    finally:
        for name in created:
            if re.fullmatch(r'techenglish_verify_(dump|sql)_[0-9a-f]{12}',name): sql(db,'DROP DATABASE "'+name+'";', 'postgres')
        if remote: run(['docker','exec',db,'rm','-f','--',remote],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)

def collect():
    lines=['# TechEnglish host collector. Generated atomically.']
    def metric(name,value,labels=None):
        suffix='{'+','.join(k+'='+json.dumps(str(v)) for k,v in labels.items())+'}' if labels else ''
        lines.append(name+suffix+' '+str(float(value)))
    ids=output(['docker','ps','-aq','--filter','label=com.docker.compose.project=techenglish']).splitlines()
    containers=json.loads(output(['docker','inspect',*ids])) if ids else []
    targets=[];seen=set()
    for c in containers:
        service=c['Config'].get('Labels',{}).get('com.docker.compose.service')
        if service not in SERVICES:continue
        seen.add(service);labels={'service':service};state=c['State'];running=state.get('Running',False)
        metric('techenglish_container_up',int(running),labels)
        metric('techenglish_container_healthy',int(running and state.get('Health',{}).get('Status')=='healthy'),labels)
        metric('techenglish_container_restarts_total',c['RestartCount'],labels)
        if c.get('LogPath'):targets.append({'targets':['localhost'],'labels':{'__path__':c['LogPath'],'job':'docker','service':service,'environment':'production'}})
    for service in set(SERVICES)-seen:
        metric('techenglish_container_up',0,{'service':service});metric('techenglish_container_healthy',0,{'service':service})
    atomic(GEN/'docker-targets.json',targets,0o644)
    stats=output(['docker','stats','--no-stream','--format','{{json .}}',*[c['Id'] for c in containers if c['Config'].get('Labels',{}).get('com.docker.compose.service') in SERVICES]]) if seen else ''
    def byte_value(value):
        match=re.fullmatch(r'([0-9.]+)\s*([A-Za-z]+)',value.strip())
        if not match: return 0
        units={'B':1,'kB':1000,'MB':1000000,'GB':1000000000,'KiB':1024,'MiB':1048576,'GiB':1073741824}
        return float(match.group(1))*units.get(match.group(2),1)
    for row in stats.splitlines():
        item=json.loads(row);service=next((c['Config']['Labels']['com.docker.compose.service'] for c in containers if c['Name'].lstrip('/')==item['Name']),None)
        if not service:continue
        metric('techenglish_container_cpu_percent',float(item['CPUPerc'].rstrip('%')),{'service':service})
        metric('techenglish_container_memory_percent',float(item['MemPerc'].rstrip('%')),{'service':service})
        memory=item['MemUsage'].split(' / '); network=item['NetIO'].split(' / ')
        metric('techenglish_container_memory_bytes',byte_value(memory[0]),{'service':service})
        metric('techenglish_container_memory_limit_bytes',byte_value(memory[1]),{'service':service})
        metric('techenglish_container_network_receive_bytes_total',byte_value(network[0]),{'service':service})
        metric('techenglish_container_network_transmit_bytes_total',byte_value(network[1]),{'service':service})
        metric('techenglish_container_pids',item['PIDs'],{'service':service})
    try:
        db=db_container();values=sql(db,"SELECT pg_database_size(current_database()),numbackends,xact_commit,xact_rollback,deadlocks FROM pg_stat_database WHERE datname=current_database();").split('|')
        for name,value in zip(('database_size_bytes','database_connections','database_commits_total','database_rollbacks_total','database_deadlocks_total'),values):metric('techenglish_'+name,value)
        extra=sql(db,"SELECT (SELECT setting::int FROM pg_settings WHERE name='max_connections'),count(*) FILTER (WHERE state='active'),count(*) FILTER (WHERE state='active' AND wait_event_type='Lock'),count(*) FILTER (WHERE state='active' AND now()-query_start>interval '1 second'),coalesce(max(extract(epoch FROM now()-query_start)) FILTER (WHERE state='active' AND pid<>pg_backend_pid()),0) FROM pg_stat_activity WHERE datname=current_database();").split('|')
        for name,value in zip(('database_max_connections','database_active_queries','database_lock_waiting_queries','database_slow_active_queries','database_longest_active_query_seconds'),extra):metric('techenglish_'+name,value)
        metric('techenglish_database_up',1)
    except Exception:metric('techenglish_database_up',0)
    try:
        import urllib.request, urllib.parse
        queries={
            'api_requests_per_second':'sum(rate({job="http-performance"} | json | service="api.techenglish.click" | __error__="" [5m]))',
            'api_server_errors_per_second':'sum(rate({job="http-performance"} | json | service="api.techenglish.click" | status >= 500 | __error__="" [5m]))',
            'api_latency_p95_seconds':'quantile_over_time(0.95, {job="http-performance"} | json | service="api.techenglish.click" | unwrap duration | __error__="" [5m]) by (service)',
        }
        for name,query in queries.items():
            url='http://127.0.0.1:3101/loki/api/v1/query?'+urllib.parse.urlencode({'query':query})
            with urllib.request.urlopen(url,timeout=5) as response:data=json.load(response)
            values=[float(item['value'][1]) for item in data['data']['result']]
            metric('techenglish_'+name,sum(values) if name!='api_latency_p95_seconds' else max(values,default=0))
        metric('techenglish_api_performance_collection_up',1)
    except Exception:metric('techenglish_api_performance_collection_up',0)
    for kind in ('backup','restore','s3','s3-restore'):
        state=load(STATE/(kind+'.json'),{})
        prefix='techenglish_'+kind.replace('-','_')
        metric(prefix+'_last_success_timestamp_seconds',state.get('last_success',0))
        metric(prefix+'_last_run_success',state.get('last_run_success',0))
        if 'last_snapshot_timestamp' in state:metric(prefix+'_snapshot_timestamp_seconds',state['last_snapshot_timestamp'])
        if 'duration_seconds' in state:metric(prefix+'_duration_seconds',state['duration_seconds'])
        if 'bytes' in state:metric(prefix+'_size_bytes',state['bytes'])
    metric('techenglish_ops_collection_timestamp_seconds',time.time())
    atomic(GEN/'techenglish.prom','\n'.join(lines)+'\n',0o644)
    print(json.dumps({'ok':True,'container_services':sorted(seen)}))

def confirm(stamp,digest):
    if not re.fullmatch(r'\d{8}T\d{6}Z',stamp) or not re.fullmatch(r'[a-fA-F0-9]{64}',digest):raise ValueError('Invalid confirmation')
    manifest=load(BACKUPS/'daily'/stamp/'manifest.json',{})
    if manifest.get('files',{}).get('database.dump',{}).get('sha256','').lower()!=digest.lower():raise ValueError('Confirmation checksum does not match')
    atomic(STATE/'pc-sync.json',{'last_success':time.time(),'last_run_success':1,'snapshot':stamp})
    print(json.dumps({'ok':True,'snapshot':stamp}))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('command',choices=('backup','verify','collect','latest','confirm'));parser.add_argument('--dump');parser.add_argument('--sql');parser.add_argument('--snapshot');parser.add_argument('--sha256');args=parser.parse_args()
    try:
        if args.command=='backup':backup()
        elif args.command=='verify':verify(args.dump,args.sql)
        elif args.command=='collect':collect()
        elif args.command=='latest':print(json.dumps(latest()))
        else:confirm(args.snapshot,args.sha256)
    except Exception as error:
        print(json.dumps({'ok':False,'error_type':type(error).__name__,'operation':args.command}),file=sys.stderr);sys.exit(1)
