import { redirect } from "next/navigation";

export const metadata = {
  title: "MBA Interview Prep",
  description: "Redirects to the MBA Interview Room (multi-school timed video practice).",
};

export default function MbaInterviewPrepPage() {
  redirect("/mba-interview-room");
}
