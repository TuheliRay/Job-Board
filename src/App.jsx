import { useState , useEffect , useRef} from 'react';

export default function App() {
  const [jobIDs, setJobIDs] = useState(null);
  const [jobs , setJobs] = useState([]);
  const [currPage , setCurrPage] = useState(0);
  const [isLoading , setIsLoading] = useState(false);
  const itemsPerPage = 6;
  function handleClick(){
    setCurrPage(prev => prev + 1);
  }
  useEffect(()=>{
    fetchJobs(currPage)
  } , [currPage]);

  async function fetchJobIDs(currPage){
    let ids = jobIDs;
   if(!jobIDs){
       const res = await fetch("https://hacker-news.firebaseio.com/v0/jobstories.json");
       ids = await res.json();
       setJobIDs(ids);
      }
      const start = currPage * itemsPerPage;
      const end = start + itemsPerPage;
      return ids.slice(start , end);
    }

  async function fetchJobs(currPage){
    const jobIdsForPage = await fetchJobIDs(currPage);
    setIsLoading(true);
   const jobsForPage = await Promise.all(
      jobIdsForPage.map((jobId) =>
        fetch(
          `https://hacker-news.firebaseio.com/v0/item/${jobId}.json`,
        ).then((res) => res.json()),
      ),
    );
    setIsLoading(false);
    const combinedJobs = [...jobs , ...jobsForPage];
    setJobs(combinedJobs);
  }
  return (
    <div className="app">
      <h1 className="title">Hacker News Jobs Board</h1>
      {jobIDs == null ? (
        <p className="loading">Loading...</p>
      ) : (
        <div>
          <div className="jobs" role="list">
            {jobs.map((job) => (
              <JobPosting key={job.id} {...job} />
            ))}
          </div>
          {jobs.length > 0 &&
            currPage * itemsPerPage + itemsPerPage <
              jobIDs.length && (
              <button
                className="load-more-button"
                disabled={isLoading}
                onClick={handleClick}>
                {isLoading
                  ? 'Loading...'
                  : 'Load more jobs'}
              </button>
            )}
        </div>
      )}
    </div>
  );
}
function JobPosting({
  url,
  by,
  time,
  title,
}) {
  return (
    <div className="post" role="listitem">
      <h2 className="post__title">
        {url ? (
          <a href={url} target="_blank" rel="noopener">
            {title}
          </a>
        ) : (
          title
        )}
      </h2>
      <p className="post__metadata">
        By {by} &middot;{' '}
        {new Date(time * 1000).toLocaleString()}
      </p>
    </div>
  );
}

