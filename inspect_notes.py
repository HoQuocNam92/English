from zipfile import ZipFile
from lxml import etree as E
from pathlib import Path
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
for f in [Path(r'C:\Users\quocnam\Downloads\KLCN028 (1).docx'),Path(r'C:\Users\quocnam\Downloads\Tester English - Da sua theo gop y co Dung.docx')]:
 print('\nFILE:',f.name)
 with ZipFile(f) as z:
  doc=E.fromstring(z.read('word/document.xml'))
  print('Tracked insertions',len(doc.findall('.//w:ins',ns)),'deletions',len(doc.findall('.//w:del',ns)))
  if 'word/comments.xml' not in z.namelist():
   print('NO COMMENTS');continue
  comments=E.fromstring(z.read('word/comments.xml'))
  for c in comments:
   cid=c.get('{'+ns['w']+'}id'); author=c.get('{'+ns['w']+'}author')
   text=' | '.join(''.join(p.xpath('.//w:t/text()',namespaces=ns)) for p in c.findall('.//w:p',ns))
   starts=doc.xpath('//w:commentRangeStart[@w:id="'+cid+'"]',namespaces=ns)
   contexts=[]
   for s in starts:
    p=s
    while p is not None and p.tag!='{'+ns['w']+'}p':p=p.getparent()
    if p is not None:contexts.append(''.join(p.xpath('.//w:t/text()',namespaces=ns)))
   print('COMMENT',cid,'AUTHOR',author,'TEXT',text,'CONTEXT',contexts)
