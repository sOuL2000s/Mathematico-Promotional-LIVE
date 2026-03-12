import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, increment, query, orderBy } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import CommentForm from '../components/CommentForm';

const SinglePostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchPostAndComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const postRef = doc(db, 'posts', id);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        setPost({ id: postSnap.id, ...postSnap.data() });

        // Fetch comments for this post
        const commentsQuery = query(collection(db, 'posts', id, 'comments'), orderBy('timestamp', 'desc'));
        const commentsSnap = await getDocs(commentsQuery);
        const fetchedComments = commentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(fetchedComments);
      } else {
        setError("Post not found.");
      }
    } catch (err) {
      console.error("Error fetching post or comments:", err);
      setError("Failed to load post. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        likes: increment(1),
      });
      setPost(prevPost => ({ ...prevPost, likes: (prevPost.likes || 0) + 1 }));
    } catch (err) {
      console.error("Error liking post:", err);
      alert("Failed to like post. Please try again.");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: `Check out this post from Mathematico: ${post.title}`,
        url: window.location.href,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      alert("Sharing is not supported on this browser. You can copy the link!");
      // Fallback for desktop: copy link to clipboard (optional)
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen"><ErrorDisplay message={error} /></div>;
  if (!post) return null; // Should ideally be handled by error, but for safety

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-100">
        {post.imageUrl && (
          <div className="w-full h-auto max-h-[500px] mb-6 md:mb-8 rounded-lg shadow-md overflow-hidden">
            {isVideo(post.imageUrl) ? (
              <video src={post.imageUrl} controls className="w-full h-full object-cover"></video>
            ) : (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/800x400?text=Mathematico+Post" }}
              />
            )}
          </div>
        )}
        <span className="text-xs sm:text-sm text-primary font-semibold mb-2 md:mb-3 uppercase inline-block">{post.category}</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-dark mb-3 md:mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="text-gray-500 text-xs sm:text-md mb-4 md:mb-6 flex items-center space-x-2 sm:space-x-4">
          <span>By {post.author || 'Admin'}</span>
          <span>&bull;</span>
          <span>{formatDate(post.timestamp)}</span>
        </div>

        <div className="prose prose-sm sm:prose-lg max-w-none text-gray-800 leading-relaxed mb-6 md:mb-8">
          {/* Using dangerouslySetInnerHTML for plain text, not for rich text editor output */}
          <p>{post.content}</p>
        </div>

        {/* Interaction Buttons */}
        <div className="flex flex-wrap items-center space-x-4 sm:space-x-6 border-t border-b border-gray-200 py-3 md:py-4 mb-6 md:mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 sm:space-x-2 text-primary font-semibold hover:text-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base`}
            disabled={likeLoading}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
            <span>Like ({post.likes || 0})</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 sm:space-x-2 text-secondary font-semibold hover:text-blue-600 transition-colors duration-300 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.476-.117-.93-.319-1.332m0 2.664a4 4 0 00.319-1.332m0 2.664c-.394 0-.75-.075-1.077-.211"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.25V19"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 21.25V17"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 21.25V17"></path></svg>
            <span>Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-8 md:mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-4 md:mb-6">Comments ({comments.length})</h2>
          {comments.length === 0 ? (
            <p className="text-gray-600 text-base sm:text-lg">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <p className="font-semibold text-dark mr-2 text-sm sm:text-base">{comment.commenterName || 'Anonymous'}</p>
                    <span className="text-gray-500 text-xs sm:text-sm">&bull; {formatDate(comment.timestamp)}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{comment.commentText}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="mt-8 md:mt-12">
          <CommentForm postId={id} onCommentAdded={fetchPostAndComments} />
        </div>
      </div>
    </div>
  );
};

export default SinglePostPage;