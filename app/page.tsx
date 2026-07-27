import { redirect } from "next/navigation";

// Entry point: the middleware handles auth redirects, so send everyone to the dashboard.
export default function Home() {
  redirect("/dashboard");
}
