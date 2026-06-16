"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, Pencil, Save, Tent, ShieldCheck } from "lucide-react";
import {
  updateUserAction,
  changePasswordAction,
  renameGroupAction,
  type ActionState,
} from "@/app/actions/users";
import { Alert, Badge, Button, Card, Field, Input } from "@/components/ui";

type UserRow = {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "GROUP";
  scoutGroup: { id: string; name: string } | null;
};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      {children}
    </Button>
  );
}

function UserCard({ user }: { user: UserRow }) {
  const [tab, setTab] = useState<"info" | "password" | "group">("info");

  const [infoState, infoAction] = useActionState<ActionState, FormData>(updateUserAction, {});
  const [pwState, pwAction] = useActionState<ActionState, FormData>(changePasswordAction, {});
  const [groupState, groupAction] = useActionState<ActionState, FormData>(renameGroupAction, {});

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {user.role === "ADMIN" ? <ShieldCheck className="h-5 w-5" /> : <Tent className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-gray-500">@{user.username}</p>
          </div>
        </div>
        {user.role === "ADMIN" ? <Badge tone="green">مدير</Badge> : <Badge>فوج</Badge>}
      </div>

      {/* tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
        <TabBtn active={tab === "info"} onClick={() => setTab("info")} icon={<Pencil className="h-3.5 w-3.5" />}>
          الاسم واسم المستخدم
        </TabBtn>
        <TabBtn active={tab === "password"} onClick={() => setTab("password")} icon={<KeyRound className="h-3.5 w-3.5" />}>
          كلمة المرور
        </TabBtn>
        {user.scoutGroup && (
          <TabBtn active={tab === "group"} onClick={() => setTab("group")} icon={<Tent className="h-3.5 w-3.5" />}>
            اسم الفوج
          </TabBtn>
        )}
      </div>

      {tab === "info" && (
        <form action={infoAction} className="space-y-3">
          <input type="hidden" name="userId" value={user.id} />
          {infoState.error && <Alert tone="error">{infoState.error}</Alert>}
          {infoState.success && <Alert tone="success">{infoState.success}</Alert>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="الاسم" error={infoState.fieldErrors?.name?.[0]}>
              <Input name="name" defaultValue={user.name} required />
            </Field>
            <Field label="اسم المستخدم" error={infoState.fieldErrors?.username?.[0]}>
              <Input name="username" defaultValue={user.username} dir="ltr" required />
            </Field>
          </div>
          <div className="flex justify-end">
            <SubmitButton>
              <Save className="h-4 w-4" />
              حفظ
            </SubmitButton>
          </div>
        </form>
      )}

      {tab === "password" && (
        <form action={pwAction} className="space-y-3">
          <input type="hidden" name="userId" value={user.id} />
          {pwState.error && <Alert tone="error">{pwState.error}</Alert>}
          {pwState.success && <Alert tone="success">{pwState.success}</Alert>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="كلمة المرور الجديدة" error={pwState.fieldErrors?.password?.[0]}>
              <Input name="password" type="password" dir="ltr" autoComplete="new-password" required />
            </Field>
            <Field label="تأكيد كلمة المرور" error={pwState.fieldErrors?.confirm?.[0]}>
              <Input name="confirm" type="password" dir="ltr" autoComplete="new-password" required />
            </Field>
          </div>
          <div className="flex justify-end">
            <SubmitButton>
              <KeyRound className="h-4 w-4" />
              تغيير كلمة المرور
            </SubmitButton>
          </div>
        </form>
      )}

      {tab === "group" && user.scoutGroup && (
        <form action={groupAction} className="space-y-3">
          <input type="hidden" name="groupId" value={user.scoutGroup.id} />
          {groupState.error && <Alert tone="error">{groupState.error}</Alert>}
          {groupState.success && <Alert tone="success">{groupState.success}</Alert>}
          <Field label="اسم الفوج" error={groupState.fieldErrors?.name?.[0]}>
            <Input name="name" defaultValue={user.scoutGroup.name} required />
          </Field>
          <div className="flex justify-end">
            <SubmitButton>
              <Save className="h-4 w-4" />
              حفظ
            </SubmitButton>
          </div>
        </form>
      )}
    </Card>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export function UserManager({ users }: { users: UserRow[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {users.map((u) => (
        <UserCard key={u.id} user={u} />
      ))}
    </div>
  );
}
