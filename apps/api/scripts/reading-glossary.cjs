// Only reviewed changes of sense, supported by a sentence and its surrounding paragraph.
const rules = [
  ['api-expose', /\bexposes?\b/gi, /API|endpoint|task list/i, 'cung cấp chức năng hoặc dữ liệu qua giao diện API', 'make functionality or data accessible through an API', 'phơi bày, vạch trần'],
  ['http-body', /\bbody\b/gi, /request|JSON|HTTP|Idempotency|productId|quantity/i, 'phần nội dung dữ liệu của yêu cầu HTTP', 'the data payload of an HTTP request', 'cơ thể; phần thân của vật'],
  ['response-return', /\breturns?\b/gi, /server|request|HTTP|endpoint|\bAPI\b|\b(?:200|201|400|404|409)\b|job identifier|controlled error/i, 'gửi lại kết quả hoặc phản hồi cho bên gọi', 'send a result or response back to the caller', 'quay trở lại; đem trả một vật'],
  ['function-return', /\breturns?\b/gi, /function|cart.*zero|caller|quantity|unitPrice/i, 'đưa giá trị đầu ra của hàm về cho đoạn mã gọi hàm', 'provide a function result to its caller', 'quay trở lại; trả lại đồ vật'],
  ['container-image', /\bimages?\b/gi, /container|Docker|rollout|rolling update|image identifiers|processes are running/i, 'bản đóng gói phần mềm dùng để khởi tạo ứng dụng', 'a packaged software image used to start application instances', 'hình ảnh, ảnh chụp'],
  ['git-branch', /\bbranch(?:es)?\b/gi, /repository|feature branch|default branch|\bGit\b|source file/i, 'nhánh phát triển trong hệ thống quản lý phiên bản', 'a separate line of development in version control', 'cành cây; chi nhánh'],
  ['git-commit', /\bcommits?\b/gi, /files related|source file|repository|\bGit\b|checks the diff/i, 'ghi lại một phiên bản thay đổi mã nguồn vào lịch sử Git', 'record source changes as a version-control revision', 'cam kết; phạm một hành vi'],
  ['transaction-commit', /\bcommit(?:s|ting)?\b/gi, /transaction|durable storage|payment in the other service|progress commits/i, 'xác nhận và ghi nhận bền vững thay đổi của giao dịch', 'finalize and persist a transaction change', 'cam kết; một commit mã nguồn'],
  ['software-build', /\bbuilds?\b/gi, /source files|runnable artifact|successful build|build fails|build result|immutable artifact/i, 'biên dịch hoặc đóng gói mã nguồn thành sản phẩm phần mềm', 'compile or package source into a runnable software artifact', 'xây dựng công trình'],
  ['payment-checkout', /\bcheckout\b/gi, /payment|orders?|Pay\b|cards|bank transfer|promotional|user journey/i, 'luồng hoàn tất đơn hàng và thanh toán của ứng dụng', 'the order completion and payment flow', 'trả phòng; thao tác chuyển phiên bản trong Git'],
  ['cache-hit', /\bhits?\b/gi, /cache|cached representation/i, 'lần tìm thấy dữ liệu cần dùng trong bộ nhớ đệm', 'a lookup that finds the requested data in the cache', 'đánh trúng; va chạm'],
  ['cache-miss', /\bmiss(?:es)?\b/gi, /cache|read the database and populate/i, 'lần không tìm thấy dữ liệu cần dùng trong bộ nhớ đệm', 'a lookup that does not find the requested data in the cache', 'bỏ lỡ; nhớ nhung'],
  ['switch-port', /\bports?\b/gi, /switch|LAN|printer's port/i, 'cổng giao tiếp trên thiết bị mạng để nối đường truyền', 'a network-interface connection on a switch or device', 'cảng biển; cổng số của TCP/UDP'],
  ['transport-port', /\bport(?= numbers?)/gi, /TCP|UDP|transport/i, 'cổng số ở tầng giao vận để phân biệt ứng dụng hoặc dịch vụ', 'a transport-layer port number identifying an application endpoint', 'cảng biển; cổng vật lý trên switch'],
  ['dns-resolution', /\bresolution\b/gi, /DNS|recursive|iterative|name resolution/i, 'quá trình phân giải tên miền để tìm thông tin đích', 'the process of resolving a domain name through DNS', 'độ phân giải hình ảnh; cách giải quyết vấn đề'],
  ['database-table', /\btables?\b/gi, /database|SQL|query|rows?|columns?|staging|customer table|order table|DataFrame/i, 'bảng dữ liệu gồm các hàng hoặc bản ghi và cột', 'a structured data table of records and columns', 'cái bàn'],
  ['ml-fit', /\bfit\b/gi, /model|train|preprocess|learn|estimator|Pipeline|Scikit/i, 'học các tham số hoặc thống kê từ dữ liệu huấn luyện', 'learn parameters or statistics from the training data', 'vừa vặn; phù hợp'],
  ['ml-feature', /\bfeatures?\b/gi, /model|train|predict|supervised|learning|labels/i, 'đặc trưng đầu vào được dùng để mô hình đưa ra dự đoán', 'an input variable used by a predictive model', 'tính năng của ứng dụng; nét đặc biệt'],
  ['ml-label', /\blabels?\b/gi, /model|train|predict|supervised|learning|features/i, 'giá trị đích hoặc đáp án của mẫu trong học có giám sát', 'the target value for a supervised-learning example', 'nhãn dán; thẻ phân loại giao diện'],
  ['ml-recall', /\brecall\b/gi, /model|positives|metrics|accuracy|security alert/i, 'tỷ lệ trường hợp dương tính thật mà mô hình tìm ra', 'the fraction of actual positives that the model identifies', 'nhớ lại; thu hồi sản phẩm'],
  ['ml-precision', /\bprecision\b/gi, /model|predicted positive|metrics|predictions/i, 'tỷ lệ dự đoán dương tính thực sự đúng', 'the fraction of positive predictions that are correct', 'độ chính xác nói chung; độ tỉ mỉ'],
  ['trace-span', /\bspans?\b/gi, /trace|tracing|telemetry|correlation/i, 'một đơn vị công việc có thời gian trong dấu vết phân tán', 'a timed unit of work in a distributed trace', 'khoảng, nhịp; kéo dài qua'],
  ['message-consumer', /\bconsumers?\b/gi, /event|message|queue|delivery|deduplication|inbox|broker|acknowledg/i, 'thành phần nhận và xử lý sự kiện hoặc thông điệp', 'a component receiving and processing messages or events', 'người tiêu dùng mua hàng'],
  ['queue-worker', /\bworkers?\b/gi, /jobs?|queue|message|resource pools|durable processing/i, 'tiến trình xử lý tác vụ hoặc thông điệp ở phía sau', 'a process that executes queued jobs or messages', 'công nhân, người lao động'],
];
function buildAnnotations(text) {
  const annotations = [];
  for (const { segment, index } of new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)) {
    const sentence = segment.trim();
    const previousBreak = text.lastIndexOf('\n\n', index);
    const nextBreak = text.indexOf('\n\n', index + segment.length);
    const paragraph = text.slice(previousBreak < 0 ? 0 : previousBreak + 2, nextBreak < 0 ? text.length : nextBreak);
    for (const [senseId, pattern, cue, definitionVi, definitionEn, standaloneMeaning] of rules) {
      if (!cue.test(sentence) && !cue.test(paragraph)) continue;
      if (senseId.startsWith('ml-') && !/\bmodel\b|training|prediction|supervised|machine learning|scikit|estimator|\bmetrics\b|positives/i.test(paragraph)) continue;
      if (senseId === 'api-expose' && !/API|endpoint|task list/i.test(sentence)) continue;
      if (senseId === 'software-build' && !/build result|successful build|build fails|source files|immutable artifact/i.test(sentence)) continue;
      if (senseId === 'ml-fit' && !/model|train|preprocess|learn|estimator|Pipeline|Scikit/i.test(sentence)) continue;
      if (senseId === 'function-return' && !/function|cart.*zero|caller|unitPrice/i.test(sentence)) continue;
      if (senseId === 'message-consumer' && !/event|message|queue|delivery|deduplication|inbox|broker|acknowledg|offset/i.test(sentence)) continue;
      if (senseId === 'git-commit' && !/files|source|repository|Git|diff/i.test(sentence)) continue;
      if (senseId === 'transaction-commit' && !/transaction|durable|payment|progress commits/i.test(sentence)) continue;
      if (senseId === 'cache-hit' && !/cache|cached|On a hit/i.test(sentence)) continue;
      if (senseId === 'cache-miss' && !/cache|On a miss/i.test(sentence)) continue;
      for (const match of segment.matchAll(pattern)) {
        if (senseId === 'switch-port' && /^ numbers?/i.test(segment.slice(match.index + match[0].length))) continue;
        const start = index + match.index, end = start + match[0].length;
        if (annotations.some(a => a.senseId === senseId || (start < a.end && end > a.start))) continue;
        annotations.push({ start, end, term: match[0], senseId, definitionVi, definitionEn, standaloneMeaning, sourceSentence: sentence, contextDependent: true,
          contextExplanation: `Trong câu “${sentence}”, “${match[0]}” chỉ ${definitionVi}; không phải nghĩa “${standaloneMeaning}”.`,
        });
        break;
      }
    }
  }
  return annotations.sort((a,b)=>a.start-b.start);
}
module.exports = { buildAnnotations };
