import { Text, TextInput, TouchableOpacity, Badge } from '../../shared/ui/primitives';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '../../shared/ui/AppIcon';

const textOf = (value: any) => {
  if (typeof value === 'string') return value;
  if (value?.text || value?.html || value?.code) return String(value.text ?? value.html?.replace(/<[^>]+>/g, '') ?? value.code ?? '');
  const ignored = new Set(['method','path','auth','language','status','term','pronunciation','partOfSpeech','documentTitle','sourceLabel']);
  return Object.entries(value ?? {}).filter(([key, item]) => !ignored.has(key) && String(item ?? '').trim()).map(([, item]) => String(item)).join('\n\n');
};

function Quiz({ section, color }: { section: any; color: string }) {
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const content = typeof section.content === 'string' ? { text: section.content } : section.content ?? {};
  return <View style={[s.quiz, { borderColor: color }]}>
    <View style={s.labelRow}><MaterialIcons name="psychology" size={19} color={color} /><Text style={[s.eyebrow, { color }]}>THỬ THÁCH</Text></View>
    <Text style={s.cardTitle}>{section.title || 'Câu hỏi suy luận'}</Text>
    <Text selectable style={s.body}>{content.question ?? content.text}</Text>
    <TextInput multiline value={answer} onChangeText={setAnswer} placeholder="Viết câu trả lời trước khi xem gợi ý..." style={s.input} />
    {!!content.answer && <TouchableOpacity onPress={() => setRevealed(value => !value)}><Text style={[s.link, { color }]}>{revealed ? 'Ẩn đáp án tham khảo' : 'Đối chiếu đáp án'}</Text></TouchableOpacity>}
    {revealed && <Text style={s.answer}>{content.answer}</Text>}
  </View>;
}

function Meta({ lesson }: { lesson: any }) {
  return <View style={s.meta}><Badge tone={lesson.level?.code === 'beginner' ? 'success' : 'primary'}>{lesson.level?.name}</Badge><Badge tone="muted">{lesson.estimatedMinutes} phút</Badge><Badge tone="muted">{lesson.domain?.name}</Badge></View>;
}


function Terminology({ lesson }: any) {
  const source = (lesson.sections ?? []).map((x: any) => textOf(x.content)).join(' ');
  const definition = (term: string) => source.match(new RegExp(`${term}\\s+(?:là|means|refers to)\\s+([^.!?]+[.!?]?)`, 'i'))?.[1];
  const termSections = (lesson.sections ?? []).filter((x: any) => x.content?.term);
  const terms = termSections.length ? termSections : (lesson.keyConcepts ?? []).map((term: string, index: number) => ({ id: index, content: { term, definitionVi: definition(term) } }));
  return <><View style={[s.hero, { backgroundColor: '#eef2ff' }]}><Text style={[s.eyebrow, { color: '#3525cd' }]}>CONTEXTUAL GLOSSARY</Text><Text style={s.title}>{lesson.title}</Text><Text style={s.summary}>{lesson.summary}</Text><Meta lesson={lesson} /></View><View style={s.sectionHead}><Text style={s.sectionHeadTitle}>Thuật ngữ trong ngữ cảnh</Text><Text style={s.muted}>{terms.length} thuật ngữ</Text></View><View style={s.grid}>{terms.map((section: any, index: number) => { const content=section.content??{}; const term=content.term??`Term ${index+1}`; return <View key={section.id??term} style={s.termCard}><Text style={[s.eyebrow, { color: '#3525cd' }]}>{content.partOfSpeech??`TERM ${String(index + 1).padStart(2, '0')}`}</Text><Text style={s.term}>{term}</Text>{content.definitionEn&&<Text style={[s.smallBody,{fontWeight:'700',color:'#334155'}]}>{content.definitionEn}</Text>}<Text style={s.smallBody}>{content.definitionVi??definition(term)??'Tìm cách dùng thuật ngữ này trong ngữ cảnh công việc.'}</Text>{content.example&&<Text style={s.example}>“{content.example}”</Text>}</View>;})}</View>{(lesson.sections ?? []).filter((x: any) => x.type !== 'heading'&&!x.content?.term).map((section: any, index: number) => <View key={section.id ?? index} style={s.card}><Text style={[s.eyebrow, { color: '#3525cd' }]}>IN CONTEXT</Text><Text style={s.cardTitle}>{section.title}</Text><Text selectable style={s.body}>{textOf(section.content)}</Text></View>)}</>;
}

function Reading({ lesson }: any) {
  const reading = (lesson.sections ?? []).filter((x: any) => x.type !== 'quiz');
  const quizzes = (lesson.sections ?? []).filter((x: any) => x.type === 'quiz');
  return <><View style={[s.hero, { backgroundColor: '#eef2ff' }]}><Text style={[s.eyebrow, { color: '#3525cd' }]}>TECHNICAL READING DESK</Text><Text style={s.title}>{lesson.title}</Text><Text style={s.summary}>{lesson.summary}</Text><Meta lesson={lesson} /></View><View style={s.strategy}><Text style={s.strategyTitle}>Đọc có chiến lược</Text><Text style={s.strategyStep}>01  Xác định mục đích tài liệu</Text><Text style={s.strategyStep}>02  Đánh dấu bằng chứng kỹ thuật</Text><Text style={s.strategyStep}>03  Trả lời bằng ý hiểu của bạn</Text></View><View style={s.document}><View style={s.documentBar}><MaterialIcons name="article" size={18} color="#3525cd" /><Text style={[s.eyebrow, { color: '#3525cd' }]}>SOURCE DOCUMENT</Text></View>{reading.map((section: any, index: number) => <View key={section.id ?? index} style={s.documentSection}><Text style={s.cardTitle}>{section.title || `Phần ${index + 1}`}</Text><Text selectable style={s.readingText}>{textOf(section.content)}</Text></View>)}</View>{quizzes.map((section: any, index: number) => <Quiz key={section.id ?? index} section={section} color="#3525cd" />)}</>;
}

function ApiDocs({ lesson }: any) {
  const sections = lesson.sections ?? [];
  const allText = sections.map((x: any) => textOf(x.content)).join(' ');
  const contract = sections.find((x: any) => x.content?.method || x.content?.path)?.content ?? {};
  const endpoint = allText.match(/\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s.,;]*)/i);
  const method = contract.method?.toUpperCase() ?? endpoint?.[1]?.toUpperCase() ?? 'HTTP'; const path = contract.path ?? endpoint?.[2] ?? '/endpoint';
  const codes: string[] = Array.from(new Set<string>([...sections.flatMap((x: any) => [x.content?.status, ...(x.content?.errorCodes?.match(/\b[1-5]\d{2}\b/g)??[])]).filter(Boolean), ...(allText.match(/\b[1-5]\d{2}\b/g) ?? [])]));
  return <><View style={[s.hero, { backgroundColor: '#3525cd' }]}><Text style={[s.eyebrow, { color: '#e0e7ff' }]}>API REFERENCE LAB</Text><Text style={[s.title, { color: '#fff' }]}>{lesson.title}</Text><Text style={[s.summary, { color: '#e0e7ff' }]}>{lesson.summary}</Text><View style={s.endpoint}><Text style={s.method}>{method}</Text><Text style={s.path}>{path}</Text></View></View><View style={s.contract}><Text style={s.contractLabel}>AUTHENTICATION</Text><Text style={s.contractValue}>{/bearer|authorization|token/i.test(allText) ? 'Bearer token' : 'Theo đặc tả'}</Text><Text style={s.contractLabel}>RESPONSE CONTRACT</Text><View style={s.statuses}>{codes.map((code: string) => <Text key={code} style={[s.status, { color: code.startsWith('2') ? '#3525cd' : '#b91c1c' }]}>{code}</Text>)}</View></View>{sections.map((section: any, index: number) => section.type === 'quiz' ? <Quiz key={section.id ?? index} section={section} color="#3525cd" /> : section.type === 'code' ? <View key={section.id ?? index} style={s.console}><Text style={s.consoleTitle}>{section.title ?? 'Example'} · {section.content?.language ?? 'code'}</Text><ScrollView horizontal><Text style={s.code}>{textOf(section.content)}</Text></ScrollView></View> : <View key={section.id ?? index} style={s.card}><Text style={[s.eyebrow, { color: '#3525cd' }]}>SPECIFICATION</Text><Text style={s.cardTitle}>{section.title}</Text><Text selectable style={s.body}>{textOf(section.content)}</Text></View>)}</>;
}

function SystemDesign({ lesson }: any) {
  const sections = lesson.sections ?? [];
  const structuredNodes: string[] = sections.flatMap((x: any) => x.content?.components?.split(',').map((v:string)=>v.trim()).filter(Boolean)??[]);
  const designText = sections.map((x: any) => textOf(x.content)).join(' ');
  const candidates: [string, RegExp][] = [['Client', /client|user|request/i], ['Load balancer', /load balanc/i], ['App service', /application server|stateless|service/i], ['Cache', /cache/i], ['Queue', /queue|event/i], ['Data store', /database|partition|storage/i], ['Observability', /monitor|latency|metric/i]];
  const found = candidates.filter(([, pattern]) => pattern.test(designText)).map(([label]) => label); const nodes = structuredNodes.length >= 3 ? structuredNodes : found.length >= 3 ? found : ['Client', 'Load balancer', 'App service', 'Data store'];
  return <><View style={[s.hero, { backgroundColor: '#3525cd' }]}><Text style={[s.eyebrow, { color: '#c7d2fe' }]}>ARCHITECTURE WORKSHOP</Text><Text style={[s.title, { color: '#fff' }]}>{lesson.title}</Text><Text style={[s.summary, { color: '#c7d2fe' }]}>{lesson.summary}</Text></View><View style={s.canvas}><View style={s.labelRow}><MaterialIcons name="account-tree" size={20} color="#3525cd" /><Text style={[s.eyebrow, { color: '#3525cd' }]}>ARCHITECTURE CANVAS</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.nodeRow}>{nodes.map((node, index) => <React.Fragment key={node}><View style={s.node}><MaterialIcons name={index === 0 ? 'devices' : index === nodes.length - 1 ? 'storage' : 'dns'} size={23} color="#3525cd" /><Text style={s.nodeText}>{node}</Text></View>{index < nodes.length - 1 && <MaterialIcons name="arrow-forward" size={20} color="#a5b4fc" />}</React.Fragment>)}</ScrollView></View>{sections.map((section: any, index: number) => section.type === 'quiz' ? <Quiz key={section.id ?? index} section={section} color="#3525cd" /> : <View key={section.id ?? index} style={s.card}><Text style={[s.eyebrow, { color: '#3525cd' }]}>{index === 0 ? 'REQUIREMENTS & SCALE' : 'DECISION & TRADE-OFF'}</Text><Text style={s.cardTitle}>{section.title}</Text><Text selectable style={s.body}>{textOf(section.content)}</Text></View>)}</>;
}

function CaseStudy({ lesson }: any) {
  const sections = lesson.sections ?? [];
  return <><View style={[s.hero, { backgroundColor: '#eef2ff' }]}><View style={s.caseBadges}><Text style={s.briefBadge}>PROJECT BRIEF</Text></View><Text style={s.title}>{lesson.title}</Text><Text style={s.summary}>{lesson.summary}</Text><Meta lesson={lesson} /></View>{sections.map((section: any, index: number) => section.type === 'quiz' ? <Quiz key={section.id ?? index} section={section} color="#3525cd" /> : <View key={section.id ?? index} style={[s.card, section.type === 'callout' && s.mission]}><Text style={[s.eyebrow, { color: section.type === 'callout' ? '#e0e7ff' : '#3525cd' }]}>{section.type === 'callout' ? 'YOUR MISSION' : `CASE FILE ${String(index + 1).padStart(2, '0')}`}</Text><Text style={[s.cardTitle, section.type === 'callout' && { color: '#fff' }]}>{section.title}</Text><Text selectable style={[s.body, section.type === 'callout' && { color: '#e0e7ff' }]}>{textOf(section.content)}</Text></View>)}</>;
}

function Generic({ lesson }: any) { return <><View style={[s.hero, { backgroundColor: '#eef2ff' }]}><Text style={[s.eyebrow, { color: '#3525cd' }]}>TECHENGLISH LESSON</Text><Text style={s.title}>{lesson.title}</Text><Text style={s.summary}>{lesson.summary}</Text><Meta lesson={lesson} /></View>{(lesson.sections ?? []).map((section: any, index: number) => section.type === 'quiz' ? <Quiz key={section.id ?? index} section={section} color="#3525cd" /> : <View key={section.id ?? index} style={s.card}><Text style={s.cardTitle}>{section.title}</Text><Text selectable style={s.body}>{textOf(section.content)}</Text></View>)}</> }

export function LessonExperience({ lesson }: { lesson: any }) {
  const Component = useMemo(() => {
    const experiences: Record<string, React.ComponentType<any>> = { terminology: Terminology, technical_reading: Reading, api_documentation: ApiDocs, system_design: SystemDesign, case_study: CaseStudy };
    return experiences[String(lesson.type)] ?? Generic;
  }, [lesson.type]);
  return <Component lesson={lesson} />;
}

const s = StyleSheet.create({
  hero:{borderRadius:24,padding:22,marginBottom:18},eyebrow:{fontSize:11,fontWeight:'900',letterSpacing:1.2},title:{fontSize:27,fontWeight:'900',color:'#111827',lineHeight:34,marginTop:10},summary:{fontSize:15,color:'#64748b',lineHeight:23,marginTop:9},meta:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:15},sectionHead:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginTop:4,marginBottom:10},sectionHeadTitle:{fontSize:20,fontWeight:'900',color:'#111827'},muted:{fontSize:12,color:'#64748b'},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},termCard:{width:'48%',minHeight:145,borderWidth:1,borderColor:'#c7c4d8',borderRadius:16,padding:15,backgroundColor:'#fff'},term:{fontSize:19,fontWeight:'900',marginTop:12,color:'#111827'},smallBody:{fontSize:13,lineHeight:19,color:'#64748b',marginTop:7},example:{fontSize:12,lineHeight:18,color:'#334155',fontStyle:'italic',marginTop:9,padding:8,backgroundColor:'#eef2ff',borderRadius:8},card:{marginTop:14,padding:18,borderWidth:1,borderColor:'#e2e8f0',borderRadius:18,backgroundColor:'#fff'},cardTitle:{fontSize:19,fontWeight:'900',color:'#111827',marginTop:6,marginBottom:8},body:{fontSize:15,color:'#334155',lineHeight:25},labelRow:{flexDirection:'row',alignItems:'center',gap:7},quiz:{marginTop:14,padding:18,borderWidth:1,borderRadius:18,backgroundColor:'#fff'},input:{marginTop:14,minHeight:96,textAlignVertical:'top',padding:12,borderWidth:1,borderColor:'#cbd5e1',borderRadius:12,backgroundColor:'#fff',fontSize:14},link:{fontWeight:'800',marginTop:12},answer:{marginTop:12,padding:12,borderRadius:10,backgroundColor:'#f7f9fb',color:'#334155',lineHeight:22},strategy:{padding:18,borderRadius:18,backgroundColor:'#f1f5f9',marginBottom:14},strategyTitle:{fontSize:17,fontWeight:'900',color:'#111827',marginBottom:10},strategyStep:{fontSize:13,color:'#475569',lineHeight:24},document:{borderWidth:1,borderColor:'#cbd5e1',borderRadius:18,overflow:'hidden',backgroundColor:'#fff'},documentBar:{flexDirection:'row',alignItems:'center',gap:7,padding:13,backgroundColor:'#f7f9fb'},documentSection:{padding:18,borderTopWidth:1,borderTopColor:'#e2e8f0'},readingText:{fontSize:16,color:'#1e293b',lineHeight:28},endpoint:{flexDirection:'row',alignItems:'center',gap:10,marginTop:18,padding:12,borderRadius:12,backgroundColor:'rgba(0,0,0,.25)'},method:{backgroundColor:'#059669',color:'#fff',paddingHorizontal:9,paddingVertical:6,borderRadius:7,fontWeight:'900',fontSize:11},path:{fontFamily:'monospace',color:'#ede9fe',fontWeight:'800',fontSize:15},contract:{borderWidth:1,borderColor:'#e0e7ff',borderRadius:18,padding:18,backgroundColor:'#f7f9fb'},contractLabel:{fontSize:10,fontWeight:'900',letterSpacing:1,color:'#3525cd',marginTop:5},contractValue:{fontSize:15,fontWeight:'800',marginTop:5,marginBottom:12},statuses:{flexDirection:'row',gap:8,marginTop:8},status:{backgroundColor:'#f7f9fb',paddingHorizontal:10,paddingVertical:6,borderRadius:8,fontFamily:'monospace',fontWeight:'900'},console:{marginTop:14,borderRadius:18,overflow:'hidden',backgroundColor:'#0f172a'},consoleTitle:{padding:12,color:'#cbd5e1',borderBottomWidth:1,borderBottomColor:'#334155',fontSize:11,fontWeight:'800'},code:{padding:16,fontFamily:'monospace',fontSize:13,color:'#e2e8f0',lineHeight:21},canvas:{borderWidth:1,borderColor:'#c7d2fe',borderRadius:18,padding:16,backgroundColor:'#f5f3ff'},nodeRow:{alignItems:'center',gap:8,paddingTop:14},node:{width:116,height:92,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#c7d2fe',borderRadius:14,backgroundColor:'#fff',padding:8},nodeText:{fontSize:12,fontWeight:'800',textAlign:'center',marginTop:7,color:'#3525cd'},caseBadges:{flexDirection:'row',gap:8},briefBadge:{backgroundColor:'#3525cd',color:'#fff',fontSize:10,fontWeight:'900',paddingHorizontal:9,paddingVertical:6,borderRadius:7,letterSpacing:.8},mission:{backgroundColor:'#3525cd',borderColor:'#3525cd'},
});
