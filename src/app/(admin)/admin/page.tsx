import { permanentRedirect } from "next/navigation";

export default function page() {
  return permanentRedirect("/admin/dashboard");
}
