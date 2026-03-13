import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, increment, query, orderBy } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import CommentForm from '../components/CommentForm';
import { FaHeart, FaShareAlt } from 'react-icons/fa'; // Import heart and share icons

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
    if (navigator.share && post) { // Ensure post exists before attempting to share
      navigator.share({
        title: post.title,
        text: `Check out this post from Mathematico: ${post.title}`,
        url: window.location.href,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      alert("Sharing is not supported on this browser or post data is not available. You can manually copy the link!");
      if (post) { // Only try to copy if post is loaded
        navigator.clipboard.writeText(window.location.href)
          .then(() => alert("Link copied to clipboard!"))
          .catch(err => console.error('Failed to copy link:', err));
      }
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
      <div className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-xl border border-secondary animate-fade-in-up">
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
        <span className="text-xs sm:text-sm text-primary font-semibold mb-2 md:mb-3 uppercase inline-block tracking-wide">{post.category}</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-light-text mb-3 md:mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="text-secondary text-xs sm:text-md mb-4 md:mb-6 flex items-center space-x-2 sm:space-x-4">
          <span>By {post.author || 'Admin'}</span>
          <span>&bull;</span>
          <span>{formatDate(post.timestamp)}</span>
        </div>

        <div className="prose prose-sm sm:prose-lg max-w-none text-light-text leading-relaxed mb-6 md:mb-8">
          {/* Using dangerouslySetInnerHTML for plain text, not for rich text editor output */}
          <p className="text-secondary">{post.content}</p>
        </div>

        {/* Interaction Buttons */}
        <div className="flex flex-wrap items-center space-x-4 sm:space-x-6 border-t border-b border-secondary py-3 md:py-4 mb-6 md:mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 sm:space-x-2 text-primary font-semibold hover:text-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base`}
            disabled={likeLoading}
          >
            <FaHeart className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Like ({post.likes || 0})</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 sm:space-x-2 text-accent font-semibold hover:text-cyan-400 transition-colors duration-300 text-sm sm:text-base"
          >
            <FaShareAlt className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-8 md:mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-light-text mb-4 md:mb-6">Comments ({comments.length})</h2>
          {comments.length === 0 ? (
            <p className="text-secondary text-base sm:text-lg">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {comments.map((comment, index) => (
                <div key={comment.id} className="bg-dark-background p-4 sm:p-5 rounded-lg border border-secondary animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-center mb-1 sm:mb-2">
                    <p className="font-semibold text-light-text mr-2 text-sm sm:text-base">{comment.commenterName || 'Anonymous'}</p>
                    <span className="text-gray-text text-xs sm:text-sm">&bull; {formatDate(comment.timestamp)}</span>
                  </div>
                  <p className="text-secondary leading-relaxed text-sm sm:text-base">{comment.commentText}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="mt-8 md:mt-12 animate-fade-in-up" style={{ animationDelay: `${comments.length * 0.05 + 0.1}s` }}>
          <CommentForm postId={id} onCommentAdded={fetchPostAndComments} />
        </div>
      </div>
    </div>
  );
};

export default SinglePostPage;