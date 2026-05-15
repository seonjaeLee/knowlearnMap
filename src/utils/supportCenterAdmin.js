/** 고객센터(공지·FAQ·1:1) 관리 기능 노출 기준 */
export function isSupportCenterAdmin(user) {
  return user?.role === 'ADMIN' || user?.email === 'admin';
}
