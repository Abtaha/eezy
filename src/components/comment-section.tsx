// components/comment-section.tsx

interface Comment {
  id: string;
  authorName: string;
  authorInitial: string;
  avatarColor: string;
  text: string;
  timestamp: string;
}

interface CommentSectionProps {
  comments: Comment[];
}

export default function CommentSection({ comments }: CommentSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
      
      <div className="space-y-6">
        {comments.map((comment) => (
          <div 
            key={comment.id} 
            className="border-b border-gray-200 pb-4 last:border-b-0"
          >
            <div className="flex items-start gap-3">
              {/* Avatar Circle */}
              <div 
                className={`w-10 h-10 rounded-full ${comment.avatarColor} flex items-center justify-center text-white font-bold flex-shrink-0`}
              >
                {comment.authorInitial}
              </div>
              
              {/* Comment Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {comment.authorName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {comment.timestamp}
                  </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}