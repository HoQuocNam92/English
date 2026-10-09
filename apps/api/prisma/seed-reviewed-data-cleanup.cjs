const {PrismaClient}=require('@prisma/client'),fs=require('fs');const p=new PrismaClient();
(async()=>{const result=await p.$transaction(async tx=>{
 const log={examplesAdded:0,definitionsFixed:0,lessonLinks:0,topicLinks:0,certificateLinks:0,optionExplanationsAdded:0};
 const hello=await tx.vocabulary.findFirst({where:{term:'Hello'},include:{examples:true}});
 if(hello&&!hello.examples.length){await tx.vocabularyExample.create({data:{vocabularyId:hello.id,sentenceEn:'Hello, welcome to the project team.',translationVi:'Xin chào, chào mừng bạn đến với nhóm dự án.',order:0}});log.examplesAdded++;}
 for(const [term,definitionEn,definitionVi,sentenceEn,translationVi] of [
 ['bio','A short personal description displayed on a user profile.','Phần giới thiệu ngắn trên hồ sơ cá nhân; trong giao diện tài khoản, bio không có nghĩa là môn sinh học.','The developer added a short bio describing her role and interests.','Lập trình viên thêm phần giới thiệu ngắn về vai trò và sở thích của mình.'],
 ['commit','A recorded snapshot in Git history, or the action of recording that snapshot.','Commit trong Git ghi lại ảnh chụp trạng thái được chọn vào lịch sử cục bộ; khác với push là gửi bản ghi lên kho từ xa.','The developer created a commit for the bug fix before pushing it.','Lập trình viên tạo bản ghi thay đổi cho phần sửa lỗi trước khi đẩy lên kho từ xa.']]){
 const word=await tx.vocabulary.findFirst({where:{term,status:'draft',domain:{code:'SOFTWARE_ENG'}},include:{examples:true}});if(!word)continue;
 await tx.vocabulary.update({where:{id:word.id},data:{definitionEn,definitionVi,status:'published',tags:[...new Set([...word.tags,'reviewed-meaning'])]}});
 if(word.examples[0])await tx.vocabularyExample.update({where:{id:word.examples[0].id},data:{sentenceEn,translationVi}});log.definitionsFixed++;
 }
 const all=await tx.vocabulary.findMany({where:{status:'published'},select:{id:true,term:true}});
 const link=async(lessonId,terms)=>{for(const term of terms){const v=all.find(x=>x.term.toLowerCase()===term.toLowerCase());if(!v)continue;const key={lessonId_vocabularyId:{lessonId,vocabularyId:v.id}};if(!await tx.lessonVocabulary.findUnique({where:key})){await tx.lessonVocabulary.create({data:{lessonId,vocabularyId:v.id}});log.lessonLinks++;}}};
 await link('1fe2a9d6-aa6c-4949-a7af-a91b5c3e044a',['total cost of ownership (TCO)','TCO','on-demand pricing','finops']);
 await link('182cbf52-c4b7-4f37-b70d-8ea504520218',['Amazon SQS','Amazon SNS','Amazon EventBridge','Amazon SQS queue']);
 const c=await tx.certificate.findUnique({where:{code:'AWS-SAA-C03'}});if(c){const key={lessonId_certificateId:{lessonId:'874c1e8d-3d9b-458a-94a2-93bc35cfcd08',certificateId:c.id}};if(!await tx.lessonCertificate.findUnique({where:key})){await tx.lessonCertificate.create({data:{lessonId:key.lessonId_certificateId.lessonId,certificateId:c.id}});log.certificateLinks++;}}
 // Link vocabulary used in the topic's lesson, only when it belongs to the topic domain or is classified there.
 const topics=await tx.certificationTopic.findMany({include:{lessons:{include:{lesson:{include:{vocabularies:{include:{vocabulary:{include:{domains:true}}}}}}}}}});
 for(const topic of topics)for(const l of topic.lessons)for(const link of l.lesson.vocabularies){const v=link.vocabulary;if(v.domainId!==topic.domainId&&!v.domains.some(x=>x.domainId===topic.domainId))continue;const where={topicId_vocabularyId:{topicId:topic.id,vocabularyId:v.id}};if(!await tx.certificationTopicVocabulary.findUnique({where})){await tx.certificationTopicVocabulary.create({data:{topicId:topic.id,vocabularyId:v.id}});log.topicLinks++;}}
 const questions=await tx.question.findMany({include:{options:true}});
 const dictionary=await tx.vocabulary.findMany({where:{status:'published'}});
 for(const q of questions)for(const option of q.options){if(option.explanation?.trim())continue;
 const word=dictionary.find(v=>v.domainId===q.domainId&&v.term.toLowerCase()===option.text.toLowerCase());if(!word)continue;
 const reason=option.isCorrect?`Phương án đúng: ${word.term}. ${word.definitionVi}\n\nGiải thích câu hỏi: ${q.explanation}`:`Phương án này nói về ${word.term}: ${word.definitionVi}\n\nĐối chiếu với yêu cầu câu hỏi: ${q.explanation}`;
 await tx.questionOption.update({where:{id:option.id},data:{explanation:reason}});log.optionExplanationsAdded++;
 }
 return log;
 },{timeout:60000});fs.writeFileSync('docs/data-audit/final-cleanup-results.json',JSON.stringify(result,null,2));console.log(result);
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>p.$disconnect());
