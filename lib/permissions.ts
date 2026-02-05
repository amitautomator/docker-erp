import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  project: ["create", "share", "update", "delete"],
  invitation: ["create", "delete", "update"], // ✅ ADD THIS
  member: ["create", "update", "delete"], // ✅ ADD THIS
} as const;

const ac = createAccessControl(statement);

const member = ac.newRole({
  // project: ["create"],
  invitation: [], // ✅ Members can't invite
  member: [], // ✅ Members can't manage members
});

const admin = ac.newRole({
  // project: ["create", "update", "delete", "share"],
  invitation: ["create", "delete", "update"], // ✅ Admins can invite
  member: ["create", "update", "delete"], // ✅ Admins can manage members
});

const owner = ac.newRole({
  // project: ["create", "update", "delete", "share"],
  invitation: ["create", "delete", "update"], // ✅ Owners can invite
  member: ["create", "update", "delete"], // ✅ Owners can manage members
});

const manager = ac.newRole({
  // project: ["create", "update"],
  invitation: [], // ✅ Managers can't invite (customize as needed)
  member: [], // ✅ Managers can't manage members (customize as needed)
});

export { ac, member, admin, owner, manager };
