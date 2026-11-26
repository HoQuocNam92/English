#!/usr/bin/env python3
"""S3 backup uploads and isolated restore tests using the EC2 instance role."""
import argparse,base64,datetime as dt,fcntl,gzip,hashlib,json,os,pathlib,re,shutil,subprocess,tempfile,time
import ops
os.umask(0o077)
CONFIG=ops.BASE/'backup-config.json'
def config():
 c=json.loads(CONFIG.read_text())
 if not re.fullmatch(r'[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]',c['bucket']):raise ValueError('Invalid bucket')
 if not re.fullmatch(r'[A-Za-z0-9_/-]+',c['prefix']) or '..' in c['prefix'].split('/'):raise ValueError('Invalid prefix')
 if not re.fullmatch(r'\d{12}',c['expected_bucket_owner']):raise ValueError('Invalid bucket owner')
 return c

def aws(c,operation,*args,missing=False):
 command=['aws','--no-cli-pager','--region',c['region'],'s3api',operation,'--bucket',c['bucket'],'--expected-bucket-owner',c['expected_bucket_owner'],*map(str,args)]
 r=subprocess.run(command,capture_output=True,text=True,timeout=300)
 if r.returncode:
  if missing and any(x in r.stderr for x in ('(404)','(NoSuchKey)','(NotFound)')):return None
  code=re.search(r'\(([A-Za-z0-9]+)\)',r.stderr)
  raise RuntimeError('S3 '+operation+' failed: '+(code.group(1)if code else 'request rejected'))
 return json.loads(r.stdout or '{}')

def put(c,key,path,immutable=True):
 digest=ops.sha(path);checksum=base64.b64encode(bytes.fromhex(digest)).decode()
 if immutable:
  old=aws(c,'head-object','--key',key,'--checksum-mode','ENABLED',missing=True)
  if old:
   if old.get('Metadata',{}).get('sha256')!=digest or old.get('ContentLength')!=path.stat().st_size:raise RuntimeError('Existing S3 object does not match this snapshot')
   return
 args=['--key',key,'--body',path,'--server-side-encryption','AES256','--checksum-algorithm','SHA256','--checksum-sha256',checksum,'--metadata',json.dumps({'sha256':digest,'application':'techenglish'})]
 if immutable:args+=['--if-none-match','*']
 aws(c,'put-object',*args)
 head=aws(c,'head-object','--key',key,'--checksum-mode','ENABLED')
 if head.get('ChecksumSHA256')!=checksum or head.get('ContentLength')!=path.stat().st_size:raise RuntimeError('S3 checksum verification failed')
 if head.get('ServerSideEncryption')!='AES256':raise RuntimeError('Unexpected object encryption')

def upload():
 c=config()
 with (ops.STATE/'s3-upload.lock').open('w')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX);started=time.time()
  try:
   snapshot=ops.latest();folder=pathlib.Path(snapshot['directory']);stamp=snapshot['snapshot']
   for name,meta in snapshot['manifest']['files'].items():
    if name not in ('database.dump','database.sql.gz','app-state.json') or ops.sha(folder/name)!=meta['sha256']:raise RuntimeError('Local snapshot checksum mismatch')
   prefix=c['prefix'].strip('/')+'/'+stamp
   for name in list(snapshot['manifest']['files'])+['manifest.json','SHA256SUMS']:put(c,prefix+'/'+name,folder/name)
   pointer={'format':1,'snapshot':stamp,'manifest_sha256':ops.sha(folder/'manifest.json'),'completed_timestamp':time.time()}
   with tempfile.TemporaryDirectory()as temporary:
    path=pathlib.Path(temporary)/'latest.json';path.write_text(json.dumps(pointer));put(c,c['prefix'].strip('/')+'/latest.json',path,False)
   result={'last_run_success':1,'last_success':time.time(),'snapshot':stamp,'bucket':c['bucket'],'prefix':c['prefix'],'duration_seconds':time.time()-started,'objects_verified':len(snapshot['manifest']['files'])+2,'last_snapshot_timestamp':snapshot['manifest']['created_timestamp']}
   ops.atomic(ops.STATE/'s3.json',result)
   print(json.dumps({'ok':True,'snapshot':stamp,'destination':'s3://'+c['bucket']+'/'+prefix+'/','objects_verified':len(snapshot['manifest']['files'])+2,'encryption':'AES256'}))
  except Exception:
   state=ops.load(ops.STATE/'s3.json',{});state['last_run_success']=0;state['last_failure']=time.time();ops.atomic(ops.STATE/'s3.json',state);raise

def verify():
 c=config();started=time.time()
 try:
  with tempfile.TemporaryDirectory(prefix='techenglish-s3-restore-')as temporary:
   folder=pathlib.Path(temporary);root=c['prefix'].strip('/')
   aws(c,'get-object','--key',root+'/latest.json',folder/'latest.json')
   pointer=json.loads((folder/'latest.json').read_text());stamp=pointer['snapshot']
   if not re.fullmatch(r'\d{8}T\d{6}Z',stamp):raise ValueError('Invalid remote snapshot')
   prefix=root+'/'+stamp
   for name in ('manifest.json','database.dump','database.sql.gz'):aws(c,'get-object','--key',prefix+'/'+name,folder/name)
   if ops.sha(folder/'manifest.json')!=pointer['manifest_sha256']:raise RuntimeError('Remote manifest checksum mismatch')
   manifest=json.loads((folder/'manifest.json').read_text())
   if 'app-state.json' in manifest['files']:
    aws(c,'get-object','--key',prefix+'/app-state.json',folder/'app-state.json')
    if ops.sha(folder/'app-state.json')!=manifest['files']['app-state.json']['sha256']:raise RuntimeError('File state checksum mismatch')
    state=json.loads((folder/'app-state.json').read_text())
    if not all(isinstance(state.get(name),list)for name in ('adminMfa','auditLog','auditAlert','studyTimeSession')):raise RuntimeError('Invalid file-state backup')
   for name in ('database.dump','database.sql.gz'):
    if ops.sha(folder/name)!=manifest['files'][name]['sha256']:raise RuntimeError('Downloaded backup checksum mismatch')
   with gzip.open(folder/'database.sql.gz','rb')as source,(folder/'database.sql').open('wb')as target:shutil.copyfileobj(source,target)
   if ops.sha(folder/'database.sql')!=manifest['sql_plain_sha256']:raise RuntimeError('Downloaded SQL checksum mismatch')
   ops.verify(folder/'database.dump',folder/'database.sql')
   result={'last_run_success':1,'last_success':time.time(),'snapshot':stamp,'bucket':c['bucket'],'duration_seconds':time.time()-started}
   ops.atomic(ops.STATE/'s3-restore.json',result)
   print(json.dumps({'ok':True,'remote_restore_verified':True,'snapshot':stamp,'dump_and_sql_verified':True}))
 except Exception:
  state=ops.load(ops.STATE/'s3-restore.json',{});state['last_run_success']=0;state['last_failure']=time.time();ops.atomic(ops.STATE/'s3-restore.json',state);raise

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('command',choices=('upload','verify'));args=parser.parse_args()
 try:upload()if args.command=='upload' else verify()
 except Exception as error:print(json.dumps({'ok':False,'operation':args.command,'error_type':type(error).__name__,'message':str(error)if isinstance(error,(RuntimeError,ValueError))else 'Operation failed'}));raise SystemExit(1)
