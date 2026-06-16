import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب").max(64),
  password: z.string().min(1, "كلمة المرور مطلوبة").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Username: letters/digits/._- only, no spaces.
const usernameField = z
  .string()
  .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
  .max(64, "اسم المستخدم طويل جداً")
  .regex(/^[A-Za-z0-9._-]+$/, "حروف وأرقام إنجليزية و(. _ -) فقط بدون مسافات");

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2, "الاسم مطلوب").max(120),
  username: usernameField,
});

export const changePasswordSchema = z
  .object({
    userId: z.string().min(1),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").max(128),
    confirm: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirm"],
  });

export const renameGroupSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(2, "اسم الفوج مطلوب").max(120),
});

const attendance = z
  .coerce.number({ invalid_type_error: "يجب إدخال رقم" })
  .int("يجب أن يكون رقماً صحيحاً")
  .min(0, "لا يمكن أن يكون سالباً")
  .max(10000, "القيمة كبيرة جداً");

export const reportSchema = z.object({
  reportDate: z
    .string()
    .min(1, "التاريخ مطلوب")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة"),
  location: z.string().min(2, "مكان الاحياء مطلوب").max(200),
  programItems: z
    .array(z.string().max(300))
    .max(20, "عدد كبير جداً من بنود البرنامج")
    // keep only non-empty after trim, must have at least 1
    .transform((items) => items.map((i) => i.trim()).filter(Boolean))
    .refine((items) => items.length >= 1, "أدخل بند واحد على الأقل في البرنامج"),
  attendanceBaraem: attendance,
  attendanceAshbal: attendance,
  attendanceKashafa: attendance,
  attendanceJawala: attendance,
  attendanceQada: attendance,
});

export type ReportInput = z.infer<typeof reportSchema>;

// Draft is lenient — anything can be empty.
export const draftSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  location: z.string().max(200).optional().default(""),
  programItems: z.array(z.string().max(300)).max(20).optional().default([]),
  attendanceBaraem: z.coerce.number().int().min(0).max(10000).optional().default(0),
  attendanceAshbal: z.coerce.number().int().min(0).max(10000).optional().default(0),
  attendanceKashafa: z.coerce.number().int().min(0).max(10000).optional().default(0),
  attendanceJawala: z.coerce.number().int().min(0).max(10000).optional().default(0),
  attendanceQada: z.coerce.number().int().min(0).max(10000).optional().default(0),
});

export type DraftInput = z.infer<typeof draftSchema>;

export const reportFilterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  groupId: z.string().optional(),
  location: z.string().optional(),
  q: z.string().optional(),
});
