
import React, { useEffect, useState } from "react";
import API from "../../axios";
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import "./EventsTab.css";

const EventsTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [expandedEvent, setExpandedEvent] = useState(null);
  const { user } = useAuth();

  const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const LIMIT = 10;


  // useEffect(() => {
  //   fetchEvents();
  // }, []);

  useEffect(() => {
    fetchEvents(1);
  }, []);
  


  // const fetchEvents = async () => {
  //   try {
  //     setLoading(true);
  
  //     const res = await API.get("/api/events/admin/events");
  
  //     setEvents(res.data?.events || []);
  //   } catch (error) {
  //     console.error("Error fetching events:", error);
  //     toast.error("Error fetching events. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage);
  };
  

  const fetchEvents = async (pageToLoad = 1) => {
    try {
      setLoading(true);
  
      const res = await API.get("/api/events/admin/events", {
        params: {
          page: pageToLoad,
          limit: LIMIT
        }
      });
  
      const newEvents = res.data?.events || [];
      const total = res.data?.total || 0;
  
      setEvents(prev =>
        pageToLoad === 1 ? newEvents : [...prev, ...newEvents]
      );
  
      const loadedCount =
        (pageToLoad === 1 ? 0 : events.length) + newEvents.length;
  
      setHasMore(loadedCount < total);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error fetching events. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  // const fetchEvents = async () => {
  //   try {
  //     // const res = await API.get("/api/events/all_events");

  //     API.get("/api/events/admin/events")

  //     // setEvents(res.data?.events || []);

  //     setEvents(res.data.events);

  //   } catch (error) {
  //     console.error("Error fetching events:", error);
  //     toast.error("Error fetching events. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getTimeRange = (startTime, endTime) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Filter events based on selected filter - fixed logic
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'published') return event.published && !event.draft;
    if (filter === 'draft') return event.draft && !event.published;
    return true;
  });

  const toggleEventExpansion = (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
    }
  };

  if (loading) return <div className="events-tab-loading">Loading events...</div>;

  return (
    <div className="events-tab-container">
      <div className="events-tab-header">
        <h1>All Events</h1>
        <p>View all events in the system</p>
      </div>

      <div className="events-tab-controls">
        <div className="filter-controls">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button 
            className={filter === 'published' ? 'active' : ''} 
            onClick={() => setFilter('published')}
          >
            Published
          </button>
          <button 
            className={filter === 'draft' ? 'active' : ''} 
            onClick={() => setFilter('draft')}
          >
            Drafts
          </button>
        </div>
        <div className="events-count">
          {filteredEvents.length} {filter === 'all' ? 'total' : filter} events
        </div>
      </div>

      <div className="events-table">
        <div className="table-header">
          <div className="header-cell">Event Title</div>
          <div className="header-cell">Category</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Creator</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {filteredEvents.length === 0 ? (
            <div className="no-events">No events found.</div>
          ) : (
            filteredEvents.map(event => (
              <div key={event._id} className="event-row">
                <div 
                  className="event-summary"
                  onClick={() => toggleEventExpansion(event._id)}
                >
                  <div className="event-cell event-title">
                    {event.title}
                  </div>
                  <div className="event-cell event-category">
                    {event.category}
                  </div>
                  <div className="event-cell event-status">
                    <span className={`status-badge ${event.published ? 'published' : 'draft'}`}>
                      {event.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="event-cell event-creator">
                    {event.createdBy?.name || event.creatorName || 'Unknown User'}
                  </div>
                  <div className="event-cell event-date">
                    {formatDate(event.startDate)}
                  </div>
                  <div className="event-cell event-actions">
                    <button 
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/event/${event._id}`, '_blank');
                      }}
                      title="View event details"
                    >
                      👁️
                    </button>
                  </div>
                </div>
                
                {expandedEvent === event._id && (
                  <div className="event-details-expanded">
                    <button 
                      className="close-expanded"
                      onClick={() => setExpandedEvent(null)}
                      title="Close details"
                    >
                      ✕
                    </button>
                    
                    <div className="expanded-content">
                      <div className="expanded-left">
                        <h3>{event.title}</h3>
                        <p className="event-description">{event.description}</p>
                        
                        <div className="event-info">
                          <div className="info-item">
                            <span className="icon">📅</span>
                            <span>{formatDate(event.startDate)} {event.endDate && event.endDate !== event.startDate ? `to ${formatDate(event.endDate)}` : ''}</span>
                          </div>
                          <div className="info-item">
                            <span className="icon">🕒</span>
                            <span>{getTimeRange(event.startTime, event.endTime)}</span>
                          </div>
                          <div className="info-item">
                            <span className="icon">📍</span>
                            <span>{event.venue}</span>
                          </div>
                          <div className="info-item">
                            <span className="icon">👥</span>
                            <span>Capacity: {event.capacity}</span>
                          </div>
                          <div className="info-item">
                            <span className="icon">💰</span>
                            <span>{event.price > 0 ? `$${event.price}` : 'Free'}</span>
                          </div>
                        </div>
                        
                        {event.tags && event.tags.length > 0 && (
                          <div className="event-tags">
                            {event.tags.map((tag, index) => 
                              <span key={index} className="tag">{tag}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="expanded-right">
                        {event.image && (
                          <div className="event-image-expanded">
                            <img 
                              src={event.image} 
                              alt={event.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="image-placeholder">
                              🎉
                            </div>
                          </div>
                        )}
                        
                        <div className="additional-info">
                          <h4>Additional Information</h4>
                          <p><strong>Requirements:</strong> {event.requirements || 'None'}</p>
                          <p><strong>Registration Deadline:</strong> {event.regDeadline ? formatDate(event.regDeadline) : 'None'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {hasMore && !loading && (
  <div className="load-more-container">
    <button className="load-more-btn" onClick={handleLoadMore}>
      Load More Events
    </button>
  </div>
)}

{loading && page > 1 && (
  <div className="loading-more">Loading more events...</div>
)}

    </div>
  );
};

export default EventsTab;

