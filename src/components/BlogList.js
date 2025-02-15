import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from './LoadingSpinner';
import DeleteBlogButton from './DeleteBlogButton';
import EditBlogButton from './EditBlogButton';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  useEffect(() => {
    setBlogsLoading(true);
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogs(blogsData);
      setBlogsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = blogs.filter(blog =>
      blog.title.toLowerCase().includes(searchQuery)
    );
    setFilteredBlogs(filtered);
    setCurrentPage(1);
  }, [searchQuery, blogs]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleDeleteSuccess = (deletedBlogId) => {
    const updatedBlogs = blogs.filter(blog => blog.id !== deletedBlogId);
    setBlogs(updatedBlogs);
  }

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="blog-list">
      <h2>Blog Posts</h2>

      <input
        type="text"
        placeholder="Search blogs..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-bar"
        style={{
          padding: '10px',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '20px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
      
      {blogsLoading && <LoadingSpinner color='#007BFF'/>}

      {(!currentBlogs.length && !blogsLoading) ? (
        <p>No blogs match your search. Try a different keyword!</p>
      ) : (
        currentBlogs.map((blog) => (
          <div key={blog.id} className="blog-card">
            <div className='blog-infos'>
              <h3>{blog.title}</h3>
              <p>{blog.content}</p>
              <span className="blog-date">
                {blog.createdAt && blog.createdAt.toDate().toLocaleString()}
              </span>
            </div>
            <div className='blog-actions'>
              <EditBlogButton blogId={blog.id} />
              <DeleteBlogButton blogId={blog.id} onDeleteSuccess={() => handleDeleteSuccess(blog.id)} />
            </div>
          </div>
        ))
      )}

      <div className="pagination">
        <button className="pagination-button" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button className="pagination-button" onClick={handleNextPage} disabled={currentPage >= totalPages}>Next</button>
      </div>

    </div>
  );
};

export default BlogList;