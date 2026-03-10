import { Suspense } from "react";
import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-gray-900" />}>
      <SignUpForm />
    </Suspense>
  );
}
