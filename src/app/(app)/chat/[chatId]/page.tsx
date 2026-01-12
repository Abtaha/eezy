export default function ChatPage() {
  return <div>Chat Page</div>;
}

// // components/chat/start-conversation.tsx
// "use client";
//
// import { useRouter } from "next/navigation";
// import { api } from "@/trpc/react";
// import { useState } from "react";
//
// export default function StartConversationButton() {
//   const router = useRouter();
//   const [isCreating, setIsCreating] = useState(false);
//
//   const createConversation = api.conversation.create.useMutation({
//     onSuccess: (conv) => {
//       // Navigate to the chat UI
//       router.push(`/chat/${conv.id}`);
//     },
//   });
//
//   const handleClick = async () => {
//     if (isCreating) return;
//
//     setIsCreating(true);
//     createConversation.mutate();
//   };
//
//   return (
//     <button
//       onClick={handleClick}
//       disabled={isCreating}
//       className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
//     >
//       {isCreating ? "Starting chat…" : "Start chat"}
//     </button>
//   );
// }
