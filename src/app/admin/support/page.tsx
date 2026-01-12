import SupportAgentClient from "./support-agent-client";
import { api } from "@/trpc/server";

export default async function SupportAgentPage() {
  const conversations = await api.conversation.list();

  return <SupportAgentClient initialConversations={conversations} />;
}
