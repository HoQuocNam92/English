import { lessonReadingText, lessonSectionTitle, isLessonGuidance, lessonStudyGuide } from '../../../../../packages/shared-kernel/src/lesson-presentation';
import { Text, Badge, Button } from '../../shared/ui/primitives';
import React, { useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '../../shared/ui/AppIcon';
import { isRichText } from '../../../../../packages/shared-kernel/src/rich-text';

const textOf = (value: any) => {
  if (typeof value === 'string') return value;
  if (value?.text || value?.html || value?.code) return String(value.text ?? value.html?.replace(/<[^>]+>/g, '') ?? value.code ?? '');
  const ignored = new Set(['method','path','auth','language','status','term','pronunciation','partOfSpeech','documentTitle','sourceLabel']);
  return Object.entries(value ?? {}).filter(([key, item]) => !ignored.has(key) && String(item ?? '').trim()).map(([, item]) => String(item)).join('\n\n');
};

function sectionText(section: any) {
  return lessonReadingText(section.title, textOf(section.content), typeof section.content?.url === 'string' ? section.content.url : undefined);
}
function LessonText({ text, style }: { text: string; style?: any }) {
  if (isRichText(text)) return <Text selectable style={style}>{text}</Text>;
  return <Text selectable style={style}>{text.split(/(https?:\/\/[^\s<>]+)/g).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;
    const url = part.replace(/[.,;]+$/, '');
    return <Text key={index} accessibilityRole="link" accessibilityLabel="Đọc nguồn tham khảo" style={{ color: '#1d4ed8', fontWeight: '700', textDecorationLine: 'underline' }} onPress={() => { void Linking.openURL(url).catch(() => Alert.alert('Không mở được liên kết', 'Vui lòng kiểm tra kết nối mạng và thử lại.')); }}>Đọc nguồn tham khảo{part.slice(url.length)}</Text>;
  })}</Text>;
}

function Meta({ lesson }: { lesson: any }) {
  return <View style={s.meta}><Badge tone={lesson.level?.code === 'beginner' ? 'success' : 'primary'}>{lesson.level?.name}</Badge><Badge tone="muted">{lesson.estimatedMinutes} phút</Badge><Badge tone="primary">{lesson.domain?.name}</Badge></View>;
}


function Terminology({ lesson }: any) {
  const { width } = useWindowDimensions();
  const source = (lesson.sections ?? []).map((x: any) => textOf(x.content)).join(' ');
  const definition = (term: string) => source.match(new RegExp(`${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?:là|means|refers to)\\s+([^.!?]+[.!?]?)`, 'i'))?.[1];
  const termSections = (lesson.sections ?? []).filter((x: any) => x.content?.term);
  const terms = termSections.length ? termSections : (lesson.keyConcepts ?? []).map((term: string, index: number) => ({ id: index, content: { term, definitionVi: definition(term) } }));
  return <><View style={[s.hero, { backgroundColor: '#eef2ff' }]}><Text style={[s.eyebrow, { color: '#3525cd' }]}>Thuật ngữ chuyên ngành</Text><Text style={s.title}>{lesson.title}</Text><Text style={s.summary}>{lesson.summary}</Text><Meta lesson={lesson} /></View><View style={s.sectionHead}><Text style={s.sectionHeadTitle}>Thuật ngữ trong ngữ cảnh</Text><Text style={s.muted}>{terms.length} thuật ngữ</Text></View><View style={s.grid}>{terms.map((section: any, index: number) => { const content=section.content??{}; const term=content.term??`Thuật ngữ ${index+1}`; return <View key={section.id??term} style={[s.termCard, width < 480 && { width: '100%' }]}><Text style={[s.eyebrow, { color: '#3525cd' }]}>{content.partOfSpeech??`Thuật ngữ ${String(index + 1).padStart(2, '0')}`}</Text><Text style={s.term}>{String(term).charAt(0).toLocaleUpperCase() + String(term).slice(1)}</Text>{content.definitionEn&&<Text style={[s.smallBody,{fontWeight:'700',color:'#334155'}]}>{content.definitionEn}</Text>}<Text style={s.smallBody}>{content.definitionVi??definition(term)??'Tìm cách dùng thuật ngữ này trong ngữ cảnh công việc.'}</Text>{content.example&&<Text style={s.example}>“{content.example}”</Text>}</View>;})}</View>{(lesson.sections ?? []).filter((x: any) => x.type !== 'heading' && !x.content?.term && !(x.type !== 'callout' && /^(nội dung|content)$/i.test(x.title?.trim() ?? '') && (lesson.keyConcepts ?? []).length > 0 && (lesson.keyConcepts ?? []).every((term: string) => definition(term)))).map((section: any, index: number) => <View key={section.id ?? index} style={s.card}><Text style={[s.eyebrow, { color: '#3525cd' }]}>Nội dung bài học</Text><Text style={s.cardTitle}>{section.title}</Text><LessonText style={s.body} text={sectionText(section)} /></View>)}</>;
}

function Reading({ lesson }: any) {
  const reading = (lesson.sections ?? []).filter((x: any) => x.type !== 'quiz');
  const quizzes = (lesson.sections ?? []).filter((x: any) => x.type === 'quiz');
  return <><View style={[s.hero, { backgroundColor: '#eef2ff' }]}><Text style={[s.eyebrow, { color: '#3525cd' }]}>Đọc hiểu tài liệu kỹ thuật</Text><Text style={s.title}>{lesson.title}</Text><Text style={s.summary}>{lesson.summary}</Text><Meta lesson={lesson} /></View><View style={s.document}><View style={s.documentBar}><MaterialIcons name="article" size={18} color="#3525cd" /><Text style={[s.eyebrow, { color: '#3525cd' }]}>Nội dung bài đọc</Text></View>{reading.map((section: any, index: number) => <View key={section.id ?? index} style={s.documentSection}><Text style={s.cardTitle}>{section.title || `Phần ${index + 1}`}</Text><LessonText style={s.readingText} text={sectionText(section)} /></View>)}</View>{quizzes.map((section: any, index: number) => null)}</>;
}

function ApiDocs({ lesson }: any) {
  const sections = lesson.sections ?? [];
  const allText = sections.map((x: any) => textOf(x.content)).join(' ');
  const contract = sections.find((x: any) => x.content?.method || x.content?.path)?.content ?? {};
  const endpoint = allText.match(/\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s.,;]*)/i);
  const method = contract.method?.toUpperCase() ?? endpoint?.[1]?.toUpperCase() ?? 'HTTP'; const path = contract.path ?? endpoint?.[2] ?? '/endpoint';
  const codes: string[] = Array.from(new Set<string>([...sections.flatMap((x: any) => [x.content?.status, ...(x.content?.errorCodes?.match(/\b[1-5]\d{2}\b/g)??[])]).filter(Boolean), ...(allText.match(/\b[1-5]\d{2}\b/g) ?? [])]));
  return <><View style={[s.hero, { backgroundColor: '#3525cd' }]}><Text style={[s.eyebrow, { color: '#ffffff' }]}>Đọc tài liệu API</Text><Text style={[s.title, { color: '#fff' }]}>{lesson.title}</Text><Text style={[s.summary, { color: '#ffffff' }]}>{lesson.summary}</Text><View style={s.endpoint}><Text style={s.method}>{method}</Text><Text style={s.path}>{path}</Text></View></View><View style={s.contract}><Text style={s.contractLabel}>Xác thực</Text><Text style={s.contractValue}>{/bearer|authorization|token/i.test(allText) ? 'Bearer token' : 'Theo đặc tả'}</Text><Text style={s.contractLabel}>Thông tin phản hồi</Text><View style={s.statuses}>{codes.map((code: string) => <Text key={code} style={[s.status, { color: code.startsWith('2') ? '#3525cd' : '#b91c1c' }]}>{code}</Text>)}</View></View>{sections.map((section: any, index: number) => section.type === 'quiz' ? null : section.type === 'code' ? <View key={section.id ?? index} style={s.console}><Text style={s.consoleTitle}>{section.title ?? 'Example'} · {section.content?.language ?? 'code'}</Text><ScrollView horizontal><Text style={s.code}>{sectionText(section)}</Text></ScrollView></View> : <View key={section.id ?? index} style={s.card}><Text style={[s.eyebrow, { color: '#3525cd' }]}>Nội dung tài liệu</Text><Text style={s.cardTitle}>{section.title}</Text><LessonText style={s.body} text={sectionText(section)} /></View>)}</>;
}

function SystemDesign({ lesson }: any) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const sections = lesson.sections ?? [];
  const structuredNodes: string[] = sections.flatMap((x: any) => x.content?.components?.split(',').map((v:string)=>v.trim()).filter(Boolean)??[]);
  const designText = sections.map((x: any) => textOf(x.content)).join(' ');
  const candidates: [string, RegExp][] = [['Client', /client|user|request/i], ['Load balancer', /load balanc/i], ['App service', /application server|stateless|service/i], ['Cache', /cache/i], ['Queue', /queue|event/i], ['Data store', /database|partition|storage/i], ['Observability', /monitor|latency|metric/i]];
  const found = candidates.filter(([, pattern]) => pattern.test(designText)).map(([label]) => label); const nodes = structuredNodes.length >= 3 ? structuredNodes : found.length >= 3 ? found : ['Client', 'Load balancer', 'App service', 'Data store'];
  return <><View style={[s.hero, { backgroundColor: '#3525cd' }]}><Text style={[s.eyebrow, { color: '#ffffff' }]}>Thiết kế hệ thống</Text><Text style={[s.title, { color: '#fff' }]}>{lesson.title}</Text><Text style={[s.summary, { color: '#ffffff' }]}>{lesson.summary}</Text></View><View style={s.canvas}><View style={s.labelRow}><MaterialIcons name="account-tree" size={20} color="#3525cd" /><Text style={[s.eyebrow, { color: '#3525cd' }]}>Sơ đồ hệ thống</Text></View><ScrollView horizontal={!compact} showsHorizontalScrollIndicator={!compact} contentContainerStyle={[s.nodeRow, compact && { flexDirection: 'column', alignItems: 'center' }]}>{nodes.map((node, index) => <React.Fragment key={node}><View style={s.node}><MaterialIcons name={index === 0 ? 'devices' : index === nodes.length - 1 ? 'storage' : 'dns'} size={23} color="#3525cd" /><Text style={s.nodeText}>{node}</Text></View>{index < nodes.length - 1 && <MaterialIcons name={compact ? "arrow-downward" : "arrow-forward"} size={20} color="#6366f1" style={compact ? { alignSelf: 'center' } : undefined} />}</React.Fragment>)}</ScrollView></View>{sections.map((section: any, index: number) => section.type === 'quiz' ? null : <View key={section.id ?? index} style={s.card}><Text style={[s.eyebrow, { color: '#3525cd' }]}>{index === 0 ? 'Yêu cầu và quy mô' : 'Quyết định và đánh đổi'}</Text><Text style={s.cardTitle}>{section.title}</Text><LessonText style={s.body} text={sectionText(section)} /></View>)}</>;
}

function CaseStudy({ lesson }: any) {
  const sections = lesson.sections ?? [];
  return <><View style={[s.hero, { backgroundColor: '#eef2ff' }]}><View style={s.caseBadges}><Text style={s.briefBadge}>Tình huống dự án</Text></View><Text style={s.title}>{lesson.title}</Text><Text style={s.summary}>{lesson.summary}</Text><Meta lesson={lesson} /></View>{sections.map((section: any, index: number) => section.type === 'quiz' ? null : <View key={section.id ?? index} style={[s.card, section.type === 'callout' && s.mission]}><Text style={[s.eyebrow, { color: section.type === 'callout' ? '#1e3a8a' : '#3525cd' }]}>{section.type === 'callout' ? 'Nhiệm vụ của bạn' : `Tình huống ${String(index + 1).padStart(2, '0')}`}</Text><Text style={[s.cardTitle, section.type === 'callout' && { color: '#172554' }]}>{section.title}</Text><LessonText style={[s.body, section.type === 'callout' && { color: '#172554' }]} text={sectionText(section)} /></View>)}</>;
}

function Generic({ lesson }: any) { return <><View style={[s.hero, { backgroundColor: '#eef2ff' }]}><Text style={[s.eyebrow, { color: '#3525cd' }]}>{lesson.type === 'certification_review' ? 'Kiến thức luyện thi chứng chỉ' : 'Bài học tiếng Anh CNTT'}</Text><Text style={s.title}>{lesson.title}</Text><Text style={s.summary}>{lesson.summary}</Text><Meta lesson={lesson} /></View>{(lesson.sections ?? []).map((section: any, index: number) => section.type === 'quiz' ? null : <View key={section.id ?? index} style={s.card}><Text style={s.cardTitle}>{section.title}</Text><LessonText style={s.body} text={sectionText(section)} /></View>)}</> }

export function LessonExperience({ lesson }: { lesson: any }) {
  const [showGuide, setShowGuide] = useState(false);
  const Component = useMemo(() => {
    const experiences: Record<string, React.ComponentType<any>> = { terminology: Terminology, technical_reading: Reading, api_documentation: ApiDocs, system_design: SystemDesign, case_study: CaseStudy };
    return experiences[String(lesson.type)] ?? Generic;
  }, [lesson.type]);
  const guidance = (lesson.sections ?? []).filter(isLessonGuidance);
  const sections = (lesson.sections ?? []).filter((section: any) => section.type !== 'quiz' && !isLessonGuidance(section)).map((section: any) => ({ ...section, title: lessonSectionTitle(section.title) }));
  return <><View style={{ borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff', borderRadius: 16, padding: 16, gap: 12, marginBottom: 16 }}>
    <Button mode="outlined" accessibilityState={{ expanded: showGuide }} onPress={() => setShowGuide(value => !value)}>{showGuide ? 'Thu gọn hướng dẫn' : 'Hướng dẫn học bài'}</Button>
    {showGuide && <View style={{ gap: 14 }}><Text style={{ color: '#172554', lineHeight: 24 }}>{lessonStudyGuide}</Text><Text style={{ color: '#172554' }}>Nhấn giữ đoạn tiếng Anh để dịch theo ngữ cảnh.</Text>{guidance.map((section: any, index: number) => <View key={section.id ?? index} style={{ gap: 6 }}><Text style={{ fontWeight: '700' }}>{section.title}</Text><LessonText text={sectionText(section)} style={s.body} /></View>)}</View>}
  </View><Component lesson={{ ...lesson, sections }} /></>;

}

const s = StyleSheet.create({
  hero:{borderRadius:24,padding:22,marginBottom:18},eyebrow:{fontSize:11,fontWeight:'900',letterSpacing:1.2},title:{fontSize:24,fontWeight:'900',color:'#111827',lineHeight:32,marginTop:10},summary:{fontSize:15,color:'#475569',lineHeight:23,marginTop:9},meta:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:15},sectionHead:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginTop:4,marginBottom:10},sectionHeadTitle:{fontSize:20,fontWeight:'900',color:'#111827'},muted:{fontSize:12,color:'#475569'},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},termCard:{width:'48%',minHeight:145,borderWidth:1,borderColor:'#c7c4d8',borderRadius:16,padding:15,backgroundColor:'#fff'},term:{fontSize:19,fontWeight:'900',marginTop:12,color:'#111827'},smallBody:{fontSize:13,lineHeight:19,color:'#475569',marginTop:7},example:{fontSize:12,lineHeight:18,color:'#334155',fontStyle:'italic',marginTop:9,padding:8,backgroundColor:'#eef2ff',borderRadius:8},card:{marginTop:14,padding:18,borderWidth:1,borderColor:'#e2e8f0',borderRadius:18,backgroundColor:'#fff'},cardTitle:{fontSize:19,fontWeight:'900',color:'#111827',marginTop:6,marginBottom:8},body:{fontSize:15,color:'#334155',lineHeight:25},labelRow:{flexDirection:'row',alignItems:'center',gap:7},quiz:{marginTop:14,padding:18,borderWidth:1,borderRadius:18,backgroundColor:'#fff'},input:{marginTop:14,minHeight:96,textAlignVertical:'top',padding:12,borderWidth:1,borderColor:'#cbd5e1',borderRadius:12,backgroundColor:'#fff',fontSize:14},link:{fontWeight:'800',marginTop:12},answer:{marginTop:12,padding:12,borderRadius:10,backgroundColor:'#f7f9fb',color:'#334155',lineHeight:22},strategy:{padding:18,borderRadius:18,backgroundColor:'#f1f5f9',marginBottom:14},strategyTitle:{fontSize:17,fontWeight:'900',color:'#111827',marginBottom:10},strategyStep:{fontSize:13,color:'#475569',lineHeight:24},document:{borderWidth:1,borderColor:'#cbd5e1',borderRadius:18,overflow:'hidden',backgroundColor:'#fff'},documentBar:{flexDirection:'row',alignItems:'center',gap:7,padding:13,backgroundColor:'#f7f9fb'},documentSection:{padding:18,borderTopWidth:1,borderTopColor:'#e2e8f0'},readingText:{fontSize:16,color:'#1e293b',lineHeight:28},endpoint:{flexDirection:'row',alignItems:'center',gap:10,marginTop:18,padding:12,borderRadius:12,backgroundColor:'rgba(0,0,0,.25)'},method:{backgroundColor:'#047857',color:'#fff',paddingHorizontal:9,paddingVertical:6,borderRadius:7,fontWeight:'900',fontSize:11},path:{fontFamily:'monospace',color:'#ede9fe',fontWeight:'800',fontSize:15},contract:{borderWidth:1,borderColor:'#e0e7ff',borderRadius:18,padding:18,backgroundColor:'#f7f9fb'},contractLabel:{fontSize:10,fontWeight:'900',letterSpacing:1,color:'#3525cd',marginTop:5},contractValue:{fontSize:15,fontWeight:'800',marginTop:5,marginBottom:12},statuses:{flexDirection:'row',gap:8,marginTop:8},status:{backgroundColor:'#f7f9fb',paddingHorizontal:10,paddingVertical:6,borderRadius:8,fontFamily:'monospace',fontWeight:'900'},console:{marginTop:14,borderRadius:18,overflow:'hidden',backgroundColor:'#0f172a'},consoleTitle:{padding:12,color:'#cbd5e1',borderBottomWidth:1,borderBottomColor:'#334155',fontSize:11,fontWeight:'800'},code:{padding:16,fontFamily:'monospace',fontSize:13,color:'#e2e8f0',lineHeight:21},canvas:{borderWidth:1,borderColor:'#ffffff',borderRadius:18,padding:16,backgroundColor:'#f5f3ff'},nodeRow:{alignItems:'center',gap:8,paddingTop:14},node:{width:116,height:92,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#ffffff',borderRadius:14,backgroundColor:'#fff',padding:8},nodeText:{fontSize:12,fontWeight:'800',textAlign:'center',marginTop:7,color:'#3525cd'},caseBadges:{flexDirection:'row',gap:8},briefBadge:{backgroundColor:'#3525cd',color:'#fff',fontSize:10,fontWeight:'900',paddingHorizontal:9,paddingVertical:6,borderRadius:7,letterSpacing:.8},mission:{backgroundColor:'#eff6ff',borderColor:'#bfdbfe'},
});
