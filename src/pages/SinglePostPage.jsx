import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, increment, query, orderBy } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import CommentForm from '../components/CommentForm';
import { FaHeart, FaShareAlt } from 'react-icons/fa'; // Import heart and share icons
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Plugin for GitHub Flavored Markdown
import remarkMath from 'remark-math'; // Plugin for math syntax
import rehypeKatex from 'rehype-katex'; // Plugin for KaTeX rendering

const SinglePostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  // New states for quiz functionality
  const [votingLoading, setVotingLoading] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No Date';
    // Firebase Timestamps have a toDate() method
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
        const fetchedPost = { id: postSnap.id, ...postSnap.data() };
        setPost(fetchedPost);

        // No client-side like/vote tracking needed.

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
    if (likeLoading) return; // Prevent multiple clicks while loading
    setLikeLoading(true);
    try {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        likes: increment(1),
      });
      // Optimistically update the UI with the new like count
      setPost(prevPost => ({ ...prevPost, likes: (prevPost.likes || 0) + 1 }));

    } catch (err) {
      console.error("Error liking post:", err);
      // Optionally provide user feedback for an error, but not for every successful like
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

  const handleVote = async (option) => {
      if (votingLoading) return; // Prevent multiple clicks while loading
      setVotingLoading(true);
      setError(null);

      try {
          const postRef = doc(db, 'posts', id);
          // Increment the count for the chosen option
          await updateDoc(postRef, {
              [`optionCounts.${option}`]: increment(1),
          });

          // Update local state to reflect the vote immediately
          setPost(prevPost => {
              const newOptionCounts = { ...prevPost.optionCounts };
              newOptionCounts[option] = (newOptionCounts[option] || 0) + 1;
              return { ...prevPost, optionCounts: newOptionCounts };
          });

      } catch (err) {
          console.error("Error submitting vote:", err);
          // Optionally provide user feedback for an error, but not for every successful vote
      } finally {
          setVotingLoading(false);
      }
  };


  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv'];
    // Check if the URL string contains any known video file extension
    // Also, Cloudinary URLs might have a type indicator like /video/upload/
    return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.toLowerCase().includes('/video/upload/');
  };

  // Helper to add Cloudinary transformations
  const getOptimizedImageUrl = (url, width) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    // Example: insert 'f_auto,q_auto,w_WIDTH' after '/upload/'
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen"><ErrorDisplay message={error} /></div>;
  if (!post) return null; // Should ideally be handled by error, but for safety

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <div className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-xl border border-secondary animate-fade-in-up">
        {post.imageUrl && (
          <div className="w-full mb-6 md:mb-8 rounded-lg shadow-md overflow-hidden bg-dark-background flex items-center justify-center max-h-[500px]">
            {isVideo(post.imageUrl) ? (
              <video
                src={post.imageUrl}
                controls
                loading="lazy" // Lazy load video
                className="w-full h-full object-contain max-h-[500px]"
              ></video>
            ) : (
              <img
                src={getOptimizedImageUrl(post.imageUrl, 800)} // Optimize image for display width
                alt={post.title}
                loading="lazy" // Lazy load image
                className="w-full h-full object-contain max-h-[500px] p-2" /* Added padding for better visibility if image touches edges */
                onError={(e) => { e.target.onerror = null; e.target.src = "/logo512.png" }}
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

        {/* Quiz Section - Renders only if the post is a 'quiz' category */}
        {post.category === 'quiz' && post.options && post.options.length > 0 && (
            <div className="mt-8 md:mt-12 bg-dark-background p-6 rounded-lg border border-secondary mb-6 md:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 md:mb-6">Quiz Question:</h2>
                {/* The main post content is the quiz question itself */}
                <div className="prose prose-sm sm:prose-lg max-w-none text-light-text leading-relaxed mb-6 markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        children={post.content}
                    />
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-light-text mb-4">Choose your answer:</h3>

                <div className="space-y-3">
                    {post.options.map((option, index) => {
                        const totalVotes = Object.values(post.optionCounts || {}).reduce((sum, count) => sum + count, 0);
                        const votesForOption = post.optionCounts?.[option] || 0;
                        const percentage = totalVotes > 0 ? ((votesForOption / totalVotes) * 100).toFixed(1) : 0;

                        return (
                            <div key={index} className="flex flex-col group">
                                <button
                                    onClick={() => handleVote(option)}
                                    className="bg-primary text-light-text font-semibold py-2 px-3 rounded-t-lg hover:bg-blue-600 transition-colors duration-300 shadow-md text-base text-left flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={votingLoading}
                                >
                                    <span>{votingLoading ? <LoadingSpinner size="small" /> : option}</span>
                                    {/* Display percentage next to button always */}
                                    <span className="text-sm text-gray-text group-hover:text-light-text transition-colors duration-300">
                                      {votesForOption} votes ({percentage}%)
                                    </span>
                                </button>
                                <div className="w-full bg-medium-dark rounded-b-lg h-2.5 overflow-hidden">
                                    <div
                                        className="bg-accent h-2.5 rounded-b-lg transition-all duration-500 ease-out"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                    {votingLoading && <LoadingSpinner />}
                    {error && <ErrorDisplay message={error} />}
                    <p className="text-gray-text text-sm col-span-full mt-2 text-center">You can vote multiple times for any option.</p>
                </div>
            </div>
        )}

        {/* Regular Content Section - Renders if not a quiz OR if quiz but without options */}
        {!(post.category === 'quiz' && post.options && post.options.length > 0) && (
            <div className="prose prose-sm sm:prose-lg max-w-none text-light-text leading-relaxed mb-6 md:mb-8 markdown-content">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    children={post.content}
                />
            </div>
        )}


        {/* Interaction Buttons */}
        <div className="flex flex-wrap items-center space-x-4 sm:space-x-6 border-t border-b border-secondary py-3 md:py-4 mb-6 md:mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 sm:space-x-2 font-semibold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base
              text-primary hover:text-blue-600`}
            disabled={likeLoading}
            title={"Like this post"}
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