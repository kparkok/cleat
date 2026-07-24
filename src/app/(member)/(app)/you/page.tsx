import { redirect } from "next/navigation";

/**
 * The mockup doesn't design a distinct profile screen — the "You" tab's
 * content is the Contacts screen (its mockup frame shows YOU as the active
 * tab). Kept canonical at /contacts since Home also links there directly.
 */
export default function YouPage() {
  redirect("/contacts");
}
