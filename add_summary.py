from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
from pathlib import Path
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
a=Path(r'C:\Users\quocnam\Downloads\KLCN028 (1).docx')
b=Path(r'C:\Users\quocnam\Downloads\Tester English - Da sua theo gop y co Dung.docx')
out=Path(r'D:\English\KLCN028 - Bo sung bang tong ket Chuong 5.docx')
def txt(e): return ''.join(e.itertext()) if False else ''.join(e.xpath('.//w:t/text()',namespaces={'w':W[1:-1]}))
with ZipFile(a) as za, ZipFile(b) as zb:
 root=E.fromstring(za.read('word/document.xml')); src=E.fromstring(zb.read('word/document.xml'))
 body=root.find(W+'body'); sb=src.find(W+'body')
 cap=next(p for p in sb if txt(p)=='Bảng 5.24. Tổng hợp kết quả kiểm thử theo nhóm')
 table=deepcopy(cap.getnext())
 rows=table.findall(W+'tr'); data=[[txt(c) for c in r.findall(W+'tc')] for r in rows]
 print(data)
 assert data[-1]==['Tổng cộng','262','216','0','43','2','1'],data[-1]
 anchor=next(p for p in body if txt(p).startswith('Bộ hồ sơ kiểm thử được sử dụng để chọn ca'))
 def para(template,text):
  p=deepcopy(template)
  for child in list(p):
   if child.tag!=W+'pPr':p.remove(child)
  r=E.SubElement(p,W+'r'); t=E.SubElement(r,W+'t');t.text=text
  return p
 existingcap=next(p for p in body if txt(p)=='Bảng 5.5. Kết quả các bộ kiểm tra có hồ sơ thực thi')
 newcap=para(existingcap,'Bảng 5.6. Tổng hợp kết quả kiểm thử theo nhóm')
 # Make header repeat and prevent individual rows splitting.
 for i,r in enumerate(rows):
  pr=r.find(W+'trPr')
  if pr is None:pr=E.SubElement(r,W+'trPr')
  if i==0 and pr.find(W+'tblHeader') is None:E.SubElement(pr,W+'tblHeader')
  if pr.find(W+'cantSplit') is None:E.SubElement(pr,W+'cantSplit')
 idx=body.index(anchor);body.insert(idx,newcap);body.insert(idx+1,table)
 note=para(anchor,'Bảng 5.6 ghi nhận 216/262 ca đạt, tương đương 82,4% tổng số ca thiết kế. Không có ca nào đang ghi trạng thái Không đạt; còn 46 ca chưa thể kết luận, gồm 43 ca Chưa chạy, 2 ca Chưa hoàn tất và 1 ca Bị chặn. Các trạng thái chưa kết luận không được quy đổi thành Đạt hoặc Không đạt.')
 body.insert(idx+2,note)
 with ZipFile(out,'w',ZIP_DEFLATED) as zo:
  for item in za.infolist():zo.writestr(item,E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True) if item.filename=='word/document.xml' else za.read(item.filename))
 print(out)
