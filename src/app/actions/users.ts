"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  updateUserSchema,
  changePasswordSchema,
  renameGroupSchema,
  createGroupSchema,
} from "@/lib/validations";
import { Role } from "@prisma/client";

export type ActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function requireAdminUser() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("هذا الإجراء متاح للمدير فقط");
  }
  return session.user;
}

/** Rename a user (name) and/or change their username. */
export async function updateUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminUser();

  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, error: "يرجى تصحيح الأخطاء" };
  }
  const { userId, name, username } = parsed.data;

  // Username must stay unique.
  const clash = await prisma.user.findFirst({
    where: { username, NOT: { id: userId } },
    select: { id: true },
  });
  if (clash) return { error: "اسم المستخدم مستخدم بالفعل" };

  await prisma.user.update({ where: { id: userId }, data: { name, username } });
  revalidatePath("/admin/users");
  return { success: "تم تحديث بيانات المستخدم" };
}

/** Set a new password for any user. */
export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminUser();

  const parsed = changePasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, error: "يرجى تصحيح الأخطاء" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash },
  });
  revalidatePath("/admin/users");
  return { success: "تم تغيير كلمة المرور" };
}

/** Rename a scout group. */
export async function renameGroupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminUser();

  const parsed = renameGroupSchema.safeParse({
    groupId: formData.get("groupId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, error: "يرجى تصحيح الأخطاء" };
  }
  const { groupId, name } = parsed.data;

  const clash = await prisma.scoutGroup.findFirst({
    where: { name, NOT: { id: groupId } },
    select: { id: true },
  });
  if (clash) return { error: "اسم الفوج مستخدم بالفعل" };

  await prisma.scoutGroup.update({ where: { id: groupId }, data: { name } });
  revalidatePath("/admin/users");
  return { success: "تم تحديث اسم الفوج" };
}

/** Create a new scout group together with its login user. */
export async function createGroupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminUser();

  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, error: "يرجى تصحيح الأخطاء" };
  }
  const { name, username, password } = parsed.data;

  const [groupClash, userClash] = await Promise.all([
    prisma.scoutGroup.findUnique({ where: { name }, select: { id: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
  ]);
  if (groupClash) return { error: "اسم الفوج مستخدم بالفعل" };
  if (userClash) return { error: "اسم المستخدم مستخدم بالفعل" };

  const passwordHash = await bcrypt.hash(password, 10);

  // Create the group and its GROUP user atomically.
  await prisma.scoutGroup.create({
    data: {
      name,
      users: {
        create: {
          name,
          username,
          passwordHash,
          role: Role.GROUP,
        },
      },
    },
  });

  revalidatePath("/admin/users");
  return { success: `تم إنشاء فوج "${name}" وحساب الدخول الخاص به` };
}
