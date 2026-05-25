export const isAdminUser = (user) => {
  if (!user) return false;

  const roleValues = [
    user.role,
    user.user_role,
    user.userType,
    user.user_type,
    user.accountType,
    user.account_type,
    user.type,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (roleValues.some((value) => value === "admin" || value === "super_admin")) {
    return true;
  }

  const adminFlags = [user.isAdmin, user.is_admin, user.admin, user.is_super_admin];

  return adminFlags.some(
    (value) => value === true || value === 1 || value === "1" || value === "true"
  );
};

export const getDefaultRouteForUser = (user) =>
  isAdminUser(user) ? "/admin/dashboard" : "/dashboard";
