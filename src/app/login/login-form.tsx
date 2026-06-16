"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Alert, Field, Input, Button } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      تسجيل الدخول
    </Button>
  );
}

export function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Field label="اسم المستخدم" htmlFor="username" error={state.fieldErrors?.username?.[0]}>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          placeholder="أدخل اسم المستخدم"
          required
        />
      </Field>

      <Field label="كلمة المرور" htmlFor="password" error={state.fieldErrors?.password?.[0]}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
