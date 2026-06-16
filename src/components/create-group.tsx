"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Tent } from "lucide-react";
import { createGroupAction, type ActionState } from "@/app/actions/users";
import { Alert, Button, Card, Field, Input } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      <Plus className="h-4 w-4" />
      إضافة فوج
    </Button>
  );
}

export function CreateGroup() {
  const [state, action] = useActionState<ActionState, FormData>(createGroupAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful creation.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card className="mb-6">
      <div className="mb-4 flex items-center gap-2">
        <Tent className="h-5 w-5 text-brand-600" />
        <h3 className="font-semibold">إضافة فوج جديد</h3>
      </div>

      {state.error && <div className="mb-3"><Alert tone="error">{state.error}</Alert></div>}
      {state.success && <div className="mb-3"><Alert tone="success">{state.success}</Alert></div>}

      <form ref={formRef} action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="اسم الفوج" error={state.fieldErrors?.name?.[0]}>
            <Input name="name" placeholder="مثال: فوج الأمل" required />
          </Field>
          <Field label="اسم المستخدم" error={state.fieldErrors?.username?.[0]} hint="للدخول إلى حساب الفوج">
            <Input name="username" dir="ltr" placeholder="group5" autoComplete="off" required />
          </Field>
          <Field label="كلمة المرور" error={state.fieldErrors?.password?.[0]} hint="8 أحرف على الأقل">
            <Input name="password" dir="ltr" type="text" placeholder="••••••••" autoComplete="off" required />
          </Field>
        </div>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </Card>
  );
}
