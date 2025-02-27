export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    // canAccessDownload: true, // ✅ Nueva regla para acceso libre
  };
}
