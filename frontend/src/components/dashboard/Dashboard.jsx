import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../navbar/Navbar";

export default function Dashboard() {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepos, setSuggestedRepos] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [loadingSuggested, setLoadingSuggested] = useState(true);

  useEffect(() => {
    const repoOwner = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      if (!repoOwner) {
        setRepositories([]);
        setLoadingRepos(false);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/repositories/owner/${repoOwner}`,
        );
        if (response.status === 404) {
          setRepositories([]);
          return;
        }
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.log("error fetching repositories:", err.message);
      } finally {
        setLoadingRepos(false);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repositories/all`);
        const data = await response.json();
        setSuggestedRepos(data.repositories || []);
      } catch (err) {
        console.log("error fetching suggested repositories:", err.message);
      } finally {
        setLoadingSuggested(false);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <section id="dashboardContainer">
        {/* Left Column: Suggested Repositories */}
        <aside className="panel-card">
          <h2>Suggested Repositories</h2>
          {loadingSuggested ? (
            <p className="empty-state">Loading suggestions...</p>
          ) : suggestedRepos.length === 0 ? (
            <p className="empty-state">No suggestions yet.</p>
          ) : (
            <div className="repo-list">
              {suggestedRepos
                .filter(
                  (repo) =>
                    repo.visibility === true || repo.visibility === "Public",
                )
                .map((repo) => (
                  <Link
                    to={`/repositories/${repo._id}`}
                    className="repo-row"
                    key={repo._id}
                  >
                    <div className="repo-row-body">
                      <h4>{repo.name}</h4>
                      {repo.owner?.username && (
                        <p className="repo-owner">@{repo.owner.username}</p>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </aside>

        {/* Center Column: Your Repositories */}
        <main className="panel-card">
          <div className="main-header">
            <h2>Your Repositories</h2>
          </div>

          <div id="search">
            <svg
              className="search-icon"
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
            >
              <path d="M10.68 11.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06l-3.04-3.04zM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0z"></path>
            </svg>
            <input
              type="text"
              value={searchQuery}
              placeholder="Find a repository..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loadingRepos ? (
            <p className="empty-state">Loading your repositories...</p>
          ) : searchResults.length === 0 ? (
            <p className="empty-state">
              {searchQuery
                ? "No repositories match your search."
                : "You don't have any repositories yet."}
            </p>
          ) : (
            <div className="repo-list">
              {searchResults
                .filter(
                  (repo) =>
                    repo.visibility === true || repo.visibility === "Public",
                )
                .map((repo) => (
                  <Link
                    to={`/repositories/${repo._id}`}
                    className="repo-row"
                    key={repo._id}
                  >
                    <div className="repo-row-body">
                      <div className="repo-title-line">
                        <div className="title-with-icon">
                          {/* Repository SVG Icon */}
                          <svg
                            className="repo-icon"
                            aria-hidden="true"
                            height="16"
                            viewBox="0 0 16 16"
                            version="1.1"
                            width="16"
                          >
                            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-11h-8a1 1 0 0 0-1 1v11.5a.75.75 0 0 1-1.5 0V2.5zM1.75 6A1.75 1.75 0 0 0 0 7.75v6.5C0 15.216.784 16 1.75 16h8.5A1.75 1.75 0 0 0 12 14.25v-6.5A1.75 1.75 0 0 0 10.25 6h-8.5zM1.5 7.75a.25.25 0 0 1 .25-.25h8.5a.25.25 0 0 1 .25.25v6.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-6.5z"></path>
                          </svg>
                          <h4>{repo.name}</h4>
                        </div>
                        <span className="badge-visibility">
                          {repo.visibility === true ||
                          repo.visibility === "Public"
                            ? "Public"
                            : "Private"}
                        </span>
                      </div>

                      {repo.description && (
                        <p className="repo-desc">{repo.description}</p>
                      )}

                      {/* Only renders language metadata if present in repoModel */}
                      {repo.language && (
                        <div className="repo-meta">
                          <span className="lang-tag">
                            <span
                              className="lang-dot"
                              style={{
                                backgroundColor:
                                  repo.languageColor || "#388bfd",
                              }}
                            ></span>
                            {repo.language}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </main>

        {/* Right Column: Upcoming Events */}
        <aside className="panel-card">
          <h3>Upcoming Events</h3>
          <ul className="events-list">
            <li>
              <div className="event-icon">
                {/* Calendar SVG Icon */}
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                >
                  <path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0zm0 3.5h-2a.25.25 0 0 0-.25.25V5h11V3.75a.25.25 0 0 0-.25-.25h-2V4.5a.75.75 0 0 1-1.5 0V3.5h-5V4.5a.75.75 0 0 1-1.5 0V3.5zM2.5 6.5v7.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V6.5H2.5z"></path>
                </svg>
              </div>
              <div className="event-body">
                <p>Tech Meetup - 1</p>
              </div>
            </li>
            <li>
              <div className="event-icon">
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                >
                  <path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0zm0 3.5h-2a.25.25 0 0 0-.25.25V5h11V3.75a.25.25 0 0 0-.25-.25h-2V4.5a.75.75 0 0 1-1.5 0V3.5h-5V4.5a.75.75 0 0 1-1.5 0V3.5zM2.5 6.5v7.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V6.5H2.5z"></path>
                </svg>
              </div>
              <div className="event-body">
                <p>Tech Meetup - 2</p>
              </div>
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
