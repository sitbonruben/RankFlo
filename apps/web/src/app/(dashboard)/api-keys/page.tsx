import { redirect } from "next/navigation";

export default function APIKeysRedirect() {
  redirect("/settings/api-keys");
}
