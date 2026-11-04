export const auditActions: Record<string,string> = {
'auth.login':'Đăng nhập','auth.logout':'Đăng xuất','auth.password_change':'Thay đổi mật khẩu','auth.password_reset':'Đặt lại mật khẩu','auth.session_refresh':'Làm mới phiên đăng nhập',
'mfa.setup':'Chuẩn bị thiết lập MFA','mfa.enroll':'Kích hoạt MFA','mfa.verify':'Xác minh MFA','mfa.reset':'Đặt lại ứng dụng MFA',
'role.assign':'Gán / thay đổi vai trò','role.revoke':'Gỡ vai trò','permission.grant':'Cấp / thay đổi quyền','permission.revoke':'Thu hồi quyền',
'content.bulk_publish':'Xuất bản hàng loạt','content.bulk_draft':'Chuyển về nháp hàng loạt','content.bulk_activate':'Kích hoạt hàng loạt','content.bulk_deactivate':'Ngừng hoạt động hàng loạt',
'user.suspend':'Khóa tài khoản','user.activate':'Mở khóa tài khoản','user.restore':'Khôi phục tài khoản','audit.read':'Xem nhật ký bảo mật','security.access_denied':'Yêu cầu truy cập bị từ chối',
'auth.session_revoke':'Thu hồi phiên đăng nhập',
'content.publish':'Xuất bản nội dung','content.draft':'Chuyển nội dung về bản nháp',
};
export const auditTargets: Record<string,string> = {user:'Tài khoản',role:'Vai trò',permission:'Quyền',user_role:'Vai trò người dùng',lesson:'Bài học',vocabulary:'Từ vựng',question:'Câu hỏi',exam:'Bài kiểm tra',certificate:'Chứng chỉ',level:'Trình độ',mfa:'MFA',audit:'Nhật ký'};
for (const [key,label] of Object.entries(auditTargets)) for (const [action,verb] of [['create','Tạo'],['update','Cập nhật'],['delete','Xóa']]) auditActions[key+'.'+action] = verb+' '+label.toLocaleLowerCase('vi');
export const auditOutcomes:Record<string,string>={success:'Thành công',failure:'Thất bại',noop:'Không có thay đổi',unknown:'Chưa xác nhận nghiệp vụ'};
export const auditSeverities:Record<string,string>={info:'Thông tin',warning:'Cần chú ý',critical:'Quan trọng'};
export function auditLabel(event:{eventKey?:string|null;outcome?:string|null}) { const label = event.eventKey && auditActions[event.eventKey] ? auditActions[event.eventKey] : 'Yêu cầu API (chưa có xác nhận nghiệp vụ)'; return event.eventKey === 'auth.login' && event.outcome === 'success' ? label + ' thành công' : event.eventKey === 'auth.login' && event.outcome === 'failure' ? label + ' thất bại' : label; }
export const auditFields:Record<string,string>={id:'Mã đối tượng',title:'Tiêu đề',term:'Từ vựng',type:'Loại nội dung',skill:'Kỹ năng',code:'Mã',status:'Trạng thái',isActive:'Đang hoạt động',deletedAt:'Thời điểm vô hiệu hóa',publishedAt:'Thời điểm xuất bản',roleId:'Mã vai trò',userId:'Mã người dùng',permissionId:'Mã quyền',expiresAt:'Hết hạn',roles:'Vai trò',permissions:'Quyền',enabled:'MFA đã bật',count:'Số lượng',sectionCount:'Số khối nội dung',contentDigest:'Dấu kiểm SHA-256 của nội dung'};
