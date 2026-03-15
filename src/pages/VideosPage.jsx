import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaYoutube, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // YouTube icon and sorting icons
import { Link } from 'react-router-dom'; // Import Link

const VideosPage = () => {
  const [allVideos, setAllVideos] = useState([]); // Store all fetched videos
  const [displayedVideos, setDisplayedVideos] = useState([]); // Videos after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('createdAt'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const fetchAllVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedVideos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllVideos(fetchedVideos); // Store all videos
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to load videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllVideos();
  }, [fetchAllVideos]);

  // Effect to filter and sort videos based on user input
  useEffect(() => {
    let tempVideos = [...allVideos];

    // 1. Search Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempVideos = tempVideos.filter(video => {
        const titleMatch = (video.title || '').toLowerCase().includes(lowerCaseSearchTerm);
        const descriptionMatch = (video.description || '').toLowerCase().includes(lowerCaseSearchTerm);
        return titleMatch || descriptionMatch;
      });
    }

    // 2. Sort
    tempVideos.sort((a, b) => {
      let valA, valB;

      if (sortKey === 'createdAt') {
        valA = a.createdAt ? a.createdAt.toDate() : new Date(0);
        valB = b.createdAt ? b.createdAt.toDate() : new Date(0);
      } else { // 'title'
        valA = (a[sortKey] || '').toLowerCase();
        valB = (b[sortKey] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedVideos(tempVideos);
  }, [allVideos, searchTerm, sortKey, sortOrder]);


  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-8 md:mb-10 text-center animate-fade-in-up">Educational Video Library</h1>
      <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        Watch insightful tutorials, problem-solving demonstrations, and engaging lectures from our experts.
      </p>

      {/* Controls: Search, Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 md:mb-10 animate-fade-in-up animation-delay-200">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
        />

        {/* Sort Dropdown */}
        <div className="relative w-full sm:w-auto">
          <select
            value={`${sortKey}-${sortOrder}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split('-');
              setSortKey(key);
              setSortOrder(order);
            }}
            className="w-full sm:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
            {sortOrder === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && displayedVideos.length === 0 && !error && (
        <p className="text-center text-secondary text-base sm:text-xl mt-8 animate-fade-in">No videos available at the moment.</p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {displayedVideos.map((video, index) => (
          <div key={video.id} className="group bg-medium-dark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-secondary flex flex-col animate-fade-in-up transform hover:-translate-y-2 hover:border-accent" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="relative w-full pb-[56.25%] bg-dark-background overflow-hidden border-b-2 border-primary">
              <iframe
                className="absolute top-0 left-0 w-full h-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=0&modestbranding=1&rel=0&controls=1&mute=0`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <h2 className="text-xl sm:text-2xl font-bold text-primary leading-tight mb-2 sm:mb-3">{video.title}</h2>
              <p className="text-sm sm:text-base text-secondary mb-3 sm:mb-4 flex-grow text-balance line-clamp-3">{video.description}</p>
              <a
                href={video.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-3 sm:pt-4 border-t border-secondary inline-flex items-center justify-center bg-primary text-light-text font-bold py-2.5 px-5 sm:px-6 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md text-base sm:text-lg self-start"
              >
                <FaYoutube className="mr-2" /> Watch on YouTube
              </a>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-primary text-light-text p-6 md:p-8 rounded-xl shadow-xl mt-8 md:mt-16 text-center animate-fade-in-up animation-delay-400">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Want to deepen your understanding?</h2>
        <p className="text-base sm:text-lg mb-4 md:mb-6 opacity-90">
          Our comprehensive courses offer structured learning and expert guidance.
        </p>
        <Link to="/courses" className="inline-block bg-accent text-dark-background font-bold py-2.5 px-6 sm:px-8 rounded-full hover:bg-cyan-400 transition-colors duration-300 transform hover:scale-105 shadow-md text-base sm:text-lg">
          Explore Courses
        </Link>
      </section>
    </div>
  );
};

export default VideosPage;