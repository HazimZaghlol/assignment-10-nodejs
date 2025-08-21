export const GenderEnum = {
  FEMALE: "female",
  MALE: "male",
};

export const RoleEnum = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const PrivilegeEnum = {
  ADMIN: [RoleEnum.ADMIN],
  ADMINS: [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN],
  SUPER_ADMIN: [RoleEnum.SUPER_ADMIN],
  USER: [RoleEnum.USER],
  ALL: [RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN],
};
