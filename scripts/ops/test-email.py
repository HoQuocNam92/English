import datetime as dt,json,pathlib,re,time,urllib.request
base=pathlib.Path('/home/ubuntu/techenglish-ops')
def metrics():
 with urllib.request.urlopen('http://127.0.0.1:9093/metrics',timeout=10)as r:text=r.read().decode()
 values={}
 for name in ('alertmanager_notifications_total','alertmanager_notifications_failed_total'):
  values[name]=sum(float(m.group(1))for m in re.finditer(r'^'+name+r'\{[^}]*integration="email"[^}]*\}\s+([0-9.e+]+)',text,re.M))
 return values
start=metrics();now=dt.datetime.now(dt.timezone.utc);end=now+dt.timedelta(minutes=2)
alert={'labels':{'alertname':'TechEnglishEmailTest','severity':'info','test':'true','service':'monitoring','instance':'techenglish-vps'},'annotations':{'summary':'Kiểm tra cảnh báo TechEnglish qua email','description':'Hệ thống cảnh báo email đã được cấu hình. Đây là thông báo kiểm tra; không phải sự cố ứng dụng. Dashboard: https://techenglish.click/monitoring/'},'startsAt':now.isoformat(),'endsAt':end.isoformat()}
request=urllib.request.Request('http://127.0.0.1:9093/api/v2/alerts',data=json.dumps([alert],ensure_ascii=False).encode(),headers={'Content-Type':'application/json'},method='POST')
with urllib.request.urlopen(request,timeout=15)as r:assert r.status==200
for _ in range(30):
 time.sleep(2);current=metrics()
 if current['alertmanager_notifications_total']>start['alertmanager_notifications_total']:
  if current['alertmanager_notifications_failed_total']>start['alertmanager_notifications_failed_total']:raise RuntimeError('Email notification attempt failed')
  result={'ok':True,'recipient':'hoquocnam92@gmail.com','email_notification_accepted':True,'telegram_enabled':False}
  (base/'state/email-test.json').write_text(json.dumps(result));print(json.dumps(result));break
else:raise RuntimeError('Email notification did not complete within the test window')
