const SUPER_ADMIN = 'SUPER_ADMIN';
const INITIAL_ADMIN_EMAIL = 'hoquocnam43@gmail.com';

async function seedSuperAdmin(prisma, email = process.env.INITIAL_ADMIN_EMAIL || INITIAL_ADMIN_EMAIL) {
  const normalizedEmail = email.trim().toLowerCase();
  return prisma.$transaction(async tx => {
    const role = await tx.role.upsert({
      where: { code: SUPER_ADMIN },
      update: { isSystem: true, isActive: true },
      create: { code: SUPER_ADMIN, color: 'amber', name: 'Quản trị viên cấp cao', description: 'Quản trị gốc được bảo vệ khỏi thay đổi bởi tài khoản có quyền thấp hơn.', isSystem: true, isActive: true },
    });
    const permissions = await tx.permission.findMany({ select: { id: true } });
    if (permissions.length) await tx.rolePermission.createMany({ data: permissions.map(permission => ({ roleId: role.id, permissionId: permission.id })), skipDuplicates: true });
    const owner = await tx.user.findFirst({ where: { email: { equals: normalizedEmail, mode: 'insensitive' } } });
    if (!owner) {
      // Empty installs are assigned by the normal seed after the owner is created.
      if (await tx.user.count() === 0) return { role: SUPER_ADMIN, assigned: false };
      throw new Error(`Không tìm thấy tài khoản quản trị gốc ${normalizedEmail}; chưa cấp SUPER_ADMIN cho tài khoản nào.`);
    }
    if (owner.deletedAt || owner.status !== 'active') throw new Error('Tài khoản quản trị gốc phải đang hoạt động trước khi cấp SUPER_ADMIN.');
    const admin = await tx.role.findUnique({ where: { code: 'admin' } });
    if (!admin) throw new Error('Chưa cấu hình vai trò admin.');
    for (const roleId of [admin.id, role.id]) await tx.userRole.upsert({
      where: { userId_roleId: { userId: owner.id, roleId } },
      update: { expiresAt: null },
      create: { userId: owner.id, roleId, expiresAt: null },
    });
    return { role: SUPER_ADMIN, assigned: true, userId: owner.id };
  }, { isolationLevel: 'Serializable' });
}

module.exports = { SUPER_ADMIN, INITIAL_ADMIN_EMAIL, seedSuperAdmin };
