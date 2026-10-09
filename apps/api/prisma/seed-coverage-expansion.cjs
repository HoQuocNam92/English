/** Reviewed learning content expansion; dry-run by default. Run with --apply to commit. */
const {PrismaClient}=require('@prisma/client');
const fs=require('node:fs'),path=require('node:path');
const prisma=new PrismaClient();
const stamp='coverage-20261009';
const base=path.join(__dirname,'../../../docs/data-audit');
const rows=[];let domainCode,levelCode,certificateCode;
for(const line of fs.readFileSync(path.join(__dirname,'data/coverage-expansion-20261009.txt'),'utf8').split('\n')){
 if(!line.trim())continue;
 if(line.startsWith('# ')){[domainCode,levelCode,certificateCode]=line.slice(2).split('|');continue;}
 const cells=line.split('|');if(cells.length!==5)throw Error('Invalid content row: '+line);
 const [term,definitionEn,definitionVi,sentenceEn,translationVi]=cells;
 rows.push({domainCode,levelCode,certificateCode,term,definitionEn,definitionVi,sentenceEn,translationVi});
}
const levelNames={beginner:'Sơ cấp',intermediate:'Trung cấp',advanced:'Nâng cao',professional:'Chuyên nghiệp'};
const references={SOFTWARE_ENG:['https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview','https://developer.mozilla.org/en-US/docs/Glossary/Idempotent','https://www.postgresql.org/docs/current/transaction-iso.html'],CLOUD:['https://docs.aws.amazon.com/glossary/latest/reference/glos-chap.html','https://docs.cloud.google.com/architecture/landing-zones'],NETWORKING:['https://www.rfc-editor.org/rfc/rfc1034','https://www.rfc-editor.org/rfc/rfc9293','https://www.rfc-editor.org/rfc/rfc768'],CYBERSEC:['https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html','https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],DEVOPS:['https://kubernetes.io/docs/concepts/overview/components/','https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/'],DATA_ENG:['https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/','https://spark.apache.org/docs/3.5.7/structured-streaming-programming-guide.html'],DATA_SCI:['https://scikit-learn.org/stable/common_pitfalls.html','https://scikit-learn.org/stable/modules/model_evaluation.html']};
const certificateReferences={'GCP-ACE':['https://docs.cloud.google.com/compute/docs/access','https://docs.cloud.google.com/storage/docs/access-control/iam'],'AZURE-AZ900':['https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview','https://learn.microsoft.com/en-us/azure/virtual-network/concepts-and-best-practices'],CKA:['https://kubernetes.io/docs/concepts/workloads/','https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/'],'COMPTIA-SECURITY-PLUS':['https://cheatsheetseries.owasp.org/'],'AWS-DVA':['https://docs.aws.amazon.com/lambda/latest/dg/welcome.html','https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html','https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html']};
const fixes=[
 ['ef88ecd9-646c-403d-8eed-8d3ef82b90bf',3,['Buying physical servers for each project','Installing a desktop application','Running only a disconnected local network','Cloud computing'],'Điện toán đám mây cung cấp tài nguyên công nghệ qua mạng theo nhu cầu. Mua máy vật lý hoặc cài ứng dụng cục bộ không tự tạo mô hình dịch vụ đám mây.'],
 ['bbbbbdeb-cbc1-4aa4-91af-0f61d61fa3d3',1,['A fixed fee independent of all usage','Pay as you go','All services are always free','A mandatory lifetime license'],'Mô hình tính phí theo mức sử dụng là nguyên tắc cơ bản của đám mây AWS; công thức tính tùy dịch vụ. Cam kết sử dụng và các ưu đãi có thể áp dụng nhưng không khiến mọi dịch vụ thành miễn phí hoặc yêu cầu giấy phép trọn đời.'],
 ['edbc2957-eac0-411e-8da8-2c3f975c9721',3,['Encrypting stored files','Keeping a fixed capacity forever','Copying backups to removable disks','Elasticity'],'Tính co giãn cho phép tăng tài nguyên khi cần và giảm khi nhu cầu hạ. Mã hóa bảo vệ dữ liệu; sao lưu hỗ trợ phục hồi; giữ năng lực cố định không thể hiện việc co giãn.'],
 ['14fcac38-98d5-4229-b947-43e5ab8d60ed',0,['Right-size resources to match measured demand','Keep every test server running indefinitely','Always choose the largest instance','Ignore utilization measurements'],'Chọn đúng quy mô tài nguyên dựa trên nhu cầu đo được giúp hạn chế trả tiền cho năng lực không sử dụng. Chọn máy lớn nhất hoặc giữ máy thử chạy mãi có thể tăng chi phí mà không tạo giá trị tương ứng.'],
];
async function main(){
 const snapshot=await prisma.$transaction(async tx=>{
 await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
 return {vocabulary:await tx.vocabulary.findMany({include:{examples:true}}),questions:await tx.question.findMany({include:{options:true}}),lessons:await tx.lesson.findMany({include:{sections:true,vocabularies:true,certificates:true,certificationTopics:true}}),levels:await tx.level.findMany(),domains:await tx.domain.findMany(),exams:await tx.exam.findMany({include:{questions:true}})};
 },{timeout:60000});
 const groups=[...new Set(rows.map(x=>x.domainCode+'|'+x.levelCode+'|'+(x.certificateCode??'general')))];
 if(groups.length!==33||rows.length!==132)throw Error('Expected 33 groups and 132 reviewed entries');
 for(const key of groups){const items=rows.filter(x=>x.domainCode+'|'+x.levelCode+'|'+(x.certificateCode??'general')===key);if(items.length!==4||new Set(items.map(x=>x.term.toLowerCase())).size!==4)throw Error('Invalid group '+key);}
 for(const r of rows){if(!snapshot.domains.some(x=>x.code===r.domainCode)||!snapshot.levels.some(x=>x.code===r.levelCode))throw Error('Missing classification '+r.domainCode+'/'+r.levelCode);if(r.definitionEn.length>1000||r.definitionVi.length>1000||r.sentenceEn.length>500||r.translationVi.length>500)throw Error('Content exceeds schema limits');}
 const planned={groups:groups.length,reviewedVocabulary:rows.length,reviewedDrafts:snapshot.vocabulary.filter(x=>x.status==='draft'&&['DATA_ENG','DATA_SCI','NETWORKING'].some(code=>snapshot.domains.find(d=>d.id===x.domainId)?.code===code)).length,questionRepairs:fixes.length};
 if(!process.argv.includes('--apply')){console.log(JSON.stringify(planned,null,2));return;}
 fs.mkdirSync(path.join(base,'backups'),{recursive:true});
 const backupPath=path.join(base,'backups','before-expansion-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');
 fs.writeFileSync(backupPath,JSON.stringify(snapshot,null,2),{flag:'wx'});
 const log=await prisma.$transaction(async tx=>{
 const stats={newVocabulary:0,updatedVocabulary:0,publishedDraftVocabulary:0,publishedDraftLessons:0,publishedDraftQuestions:0,newLessons:0,newQuestions:0,newExams:0,aliasesFixed:0,questionOptionsRebuilt:0,lessonLinksAdded:0};
 const author=await tx.user.findFirst({where:{userRoles:{some:{role:{code:'admin'}}}},select:{id:true}});if(!author)throw Error('No admin author found');
 for(const code of Object.keys(levelNames))await tx.level.update({where:{code},data:{isActive:true}});
 // Publish the 105 source-backed drafts reviewed in this batch, preserving their IDs and progress links.
 const draftDomains=snapshot.domains.filter(x=>['DATA_ENG','DATA_SCI','NETWORKING'].includes(x.code)).map(x=>x.id);
 stats.publishedDraftVocabulary=(await tx.vocabulary.updateMany({where:{status:'draft',domainId:{in:draftDomains}},data:{status:'published'}})).count;
 stats.publishedDraftLessons=(await tx.lesson.updateMany({where:{status:'draft',domainId:{in:draftDomains}},data:{status:'published',publishedAt:new Date()}})).count;
 stats.publishedDraftQuestions=(await tx.question.updateMany({where:{status:'draft',domainId:{in:draftDomains},options:{some:{isCorrect:true}}},data:{status:'published'}})).count;
 for(const key of groups){
 const items=rows.filter(x=>x.domainCode+'|'+x.levelCode+'|'+(x.certificateCode??'general')===key),first=items[0];
 const domain=snapshot.domains.find(x=>x.code===first.domainCode),level=snapshot.levels.find(x=>x.code===first.levelCode);
 const vocabIds=[];
 for(const item of items){
 const existing=await tx.vocabulary.findUnique({where:{term_domainId:{term:item.term,domainId:domain.id}}});
 const data={definitionEn:item.definitionEn,definitionVi:item.definitionVi,levelId:level.id,status:'published',partOfSpeech:['extract','transform','load'].includes(item.term)?'verb':'noun',partsOfSpeech:[['extract','transform','load'].includes(item.term)?'verb':'noun'],tags:[...new Set([...(existing?.tags??[]),stamp,'reviewed-meaning'])]};
 const word=existing?await tx.vocabulary.update({where:{id:existing.id},data}):await tx.vocabulary.create({data:{...data,term:item.term,domainId:domain.id}});
 stats[existing?'updatedVocabulary':'newVocabulary']++;
 const example=await tx.vocabularyExample.findFirst({where:{vocabularyId:word.id,order:0}});
 if(example)await tx.vocabularyExample.update({where:{id:example.id},data:{sentenceEn:item.sentenceEn,translationVi:item.translationVi}});else await tx.vocabularyExample.create({data:{vocabularyId:word.id,order:0,sentenceEn:item.sentenceEn,translationVi:item.translationVi}});
 await tx.vocabularyDomain.upsert({where:{vocabularyId_domainId:{vocabularyId:word.id,domainId:domain.id}},update:{},create:{vocabularyId:word.id,domainId:domain.id}});vocabIds.push(word.id);
 }
 const certificate=first.certificateCode?await tx.certificate.findUnique({where:{code:first.certificateCode}}):null;
 if(first.certificateCode&&!certificate)throw Error('Missing certificate '+first.certificateCode);
 const slug=stamp+'-'+first.domainCode.toLowerCase()+'-'+first.levelCode+(first.certificateCode?'-'+first.certificateCode.toLowerCase():'');
 const title=`${certificate?.name??domain.name}: Thuật ngữ và tình huống ${levelNames[first.levelCode]}`;
 let lesson=await tx.lesson.findUnique({where:{slug}});
 if(!lesson){lesson=await tx.lesson.create({data:{slug,title,summary:`Hiểu và phân biệt ${items.map(x=>x.term).join(', ')} qua định nghĩa song ngữ và tình huống thực tế.`,type:'terminology',domainId:domain.id,levelId:level.id,estimatedMinutes:20,status:'published',publishedAt:new Date(),createdById:author.id,certificates:certificate?{create:[{certificateId:certificate.id}]}:undefined,keyConcepts:items.map(x=>x.term),sections:{create:items.map((x,i)=>({type:'rich_text',order:i+1,title:x.term,content:{text:`${x.definitionEn}\n\nGiải thích: ${x.definitionVi}\n\nVí dụ: ${x.sentenceEn}\n${x.translationVi}`}})).concat([{type:'callout',order:5,title:'Cách phân biệt và vận dụng',content:{text:'Đọc tình huống và xác định điều đang được mô tả: một thành phần, một hành động, hay một tính chất. Đối chiếu cả bốn định nghĩa trước khi chọn. Các ví dụ là tình huống minh họa do nhóm nội dung biên soạn; bài luyện tập này không phải đề thi chính thức.',sources:certificateReferences[first.certificateCode]??references[first.domainCode]}}])}}});stats.newLessons++;}
 for(const id of vocabIds)await tx.lessonVocabulary.upsert({where:{lessonId_vocabularyId:{lessonId:lesson.id,vocabularyId:id}},update:{},create:{lessonId:lesson.id,vocabularyId:id}});
 const questionIds=[];
 for(let i=0;i<items.length;i++){
 const item=items[i],tag=slug+'-q'+i;
 let question=await tx.question.findFirst({where:{topics:{has:tag}}});
 if(!question){const position=items[(i+1)%items.length];const scenario=item.sentenceEn.replace(new RegExp(item.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),'_____');
 question=await tx.question.create({data:{type:'single_choice',skill:'technical_understanding',prompt:`Which term best completes this situation? ${scenario}`,context:'Choose the term that describes the role or behavior in the sentence.',explanation:`Đáp án đúng: ${item.term}. ${item.definitionVi}\nTrong tình huống: ${item.translationVi}\nPhân biệt với ${position.term}: ${position.definitionVi}`,domainId:domain.id,levelId:level.id,topics:[stamp,tag],status:'published',points:1,options:{create:items.map((x,j)=>({key:String.fromCharCode(65+j),text:x.term,isCorrect:i===j,order:j+1,explanation:i===j?`${x.term} phù hợp. ${x.definitionVi}\n${item.translationVi}`:`${x.term}: ${x.definitionVi}\nTình huống đang mô tả ${item.term}. ${item.definitionVi}`}))}}});stats.newQuestions++;}questionIds.push(question.id);
 }
 const examTitle=`Luyện thuật ngữ ${certificate?.code??domain.name}: ${levelNames[first.levelCode]}`;
 if(!await tx.exam.findFirst({where:{topics:{has:slug}}})){await tx.exam.create({data:{title:examTitle,description:'Bài luyện tập bốn tình huống, có giải thích đúng/sai cho từng phương án. Không phải đề thi chứng chỉ chính thức.',domainId:domain.id,levelId:level.id,certificateId:certificate?.id,kind:'practice',durationMinutes:10,maxAttempts:10,passingScorePercent:75,shuffleQuestions:true,status:'published',publishedAt:new Date(),createdById:author.id,topics:[stamp,slug],questions:{create:questionIds.map((questionId,i)=>({questionId,order:i+1}))}}});stats.newExams++;}
 }
 // Resolve the 56 glossary cross-references from actual definitions already present in the same domain.
 for(const word of snapshot.vocabulary.filter(x=>/^See /i.test(x.definitionEn))){
 const target=word.definitionEn.replace(/^See /i,'').replace(/\s*\.$/,'').trim().toLowerCase();
 const normalize=x=>x.toLowerCase().replace(/\s*\([^)]*\)/g,'').trim();
 const candidates=snapshot.vocabulary.filter(x=>x.id!==word.id&&x.domainId===word.domainId&&!/^See /i.test(x.definitionEn));
 const match=candidates.find(x=>x.term.toLowerCase()===target)||candidates.find(x=>normalize(x.term)===normalize(target));
 if(match){const current=await tx.vocabulary.findUnique({where:{id:word.id}});if(/^See /i.test(current.definitionEn)){await tx.vocabulary.update({where:{id:word.id},data:{definitionEn:match.definitionEn,definitionVi:match.definitionVi,tags:[...new Set([...current.tags,'reviewed-meaning','resolved-glossary-alias'])]}});stats.aliasesFixed++;}}
 else if(word.term==='Firehose'&&/^See /i.test((await tx.vocabulary.findUnique({where:{id:word.id}})).definitionEn)){await tx.vocabulary.update({where:{id:word.id},data:{definitionEn:'Amazon Data Firehose is a managed service for delivering streaming data to supported destinations.',definitionVi:'Amazon Data Firehose là dịch vụ được quản lý để đưa dòng dữ liệu vào các đích được hỗ trợ, chẳng hạn nơi lưu trữ hoặc phân tích; khác với tự vận hành máy chủ tiếp nhận.',tags:[...new Set([...word.tags,'reviewed-meaning'])]}});stats.aliasesFixed++;}
 }
 // Re-author only the four recoverable questions already used in published exams. Keep the original IDs and answer-letter positions.
 for(const [id,answerIndex,texts,explanation] of fixes){const q=await tx.question.findUnique({where:{id},include:{options:true}});if(q&&!q.options.length){await tx.question.update({where:{id},data:{explanation,options:{create:texts.map((text,i)=>({key:String.fromCharCode(65+i),text,isCorrect:i===answerIndex,order:i+1,explanation:i===answerIndex?`Đúng. ${explanation}`:`Phương án này không thể hiện yêu cầu của câu hỏi. ${explanation}`}))}}});stats.questionOptionsRebuilt++;}}
 // Link only words explicitly present in each existing lesson's text; do not attach an entire domain indiscriminately.
 const words=await tx.vocabulary.findMany({where:{status:'published'},select:{id:true,term:true,domainId:true}});
 for(const lesson of snapshot.lessons){const text=JSON.stringify(lesson.sections).toLowerCase();const candidates=words.filter(x=>x.domainId===lesson.domainId&&x.term.length>=3&&new RegExp('(^|[^a-z0-9])'+x.term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z0-9]|$)').test(text));for(const word of candidates){const existing=await tx.lessonVocabulary.findUnique({where:{lessonId_vocabularyId:{lessonId:lesson.id,vocabularyId:word.id}}});if(!existing){await tx.lessonVocabulary.create({data:{lessonId:lesson.id,vocabularyId:word.id}});stats.lessonLinksAdded++;}}}
 return stats;
 },{timeout:120000});
 fs.writeFileSync(path.join(base,'expansion-results-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json'),JSON.stringify({at:new Date().toISOString(),backupPath,...log},null,2));console.log(JSON.stringify(log,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>prisma.$disconnect());
