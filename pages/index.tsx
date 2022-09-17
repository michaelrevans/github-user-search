import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Table from "react-bootstrap/Table";
import { useFetch } from "use-http";
import React, { useMemo, useState } from "react";

interface Repository extends Record<string, any> {
  name: string;
  html_url: string;
  language: string;
  updated_at: string;
}

interface FetchError {
  message: string;
  documentation_url: string;
}

const formatDate = (rawDate: string): string => {
  const date = new Date(rawDate);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
};

const sortRepos = (
  repoList: Repository[] | FetchError | undefined
): Repository[] => {
  if (repoList === undefined) return [];
  if ((repoList as FetchError).message) return [];
  return (repoList as Repository[]).sort(
    (repoA: Repository, repoB: Repository) =>
      new Date(repoB.updated_at).getTime() -
      new Date(repoA.updated_at).getTime()
  );
};

const Home: NextPage = () => {
  const [username, setUsername] = useState<string>("michaelrevans");
  const [repos, setRepos] = useState<Repository[]>([]);
  const { get, loading, error } = useFetch<Repository[]>(
    "https://api.github.com/users"
  );

  const sortedRepos = useMemo(() => sortRepos(repos), [repos]);

  const handleSubmit = async () => {
    event?.preventDefault();
    const repos = await get(username + '/repos');
    setRepos(repos);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>GitHub User Search</title>
        <meta
          name="description"
          content="GitHub User Search - enter a GitHub username to view the repos"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1 className={styles.title}>GitHub User Repo Search</h1>
        <p>
          Enter a Github username and click the submit button to see a list of
          that user's repositories.
        </p>
        <Form onSubmit={handleSubmit}>
          <InputGroup className={styles.fieldGroup}>
            <Form.Control
              placeholder="Username"
              id="username"
              value={username}
              onChange={handleChange}
            />
            <Button type="submit">Submit</Button>
          </InputGroup>
        </Form>

        {loading ? (
          <div>Loading</div>
        ) : error ? (
          <div>Something went wrong, please try again</div>
        ) : (
          <div className={styles.results}>
            <Table striped bordered hover>
              <thead>
                <tr className="bg-info bg-opacity-25">
                  <th>Repo name</th>
                  <th>Link</th>
                  <th>Language</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {sortedRepos?.map((repo: Repository) => (
                  <tr key={repo.name}>
                    <td>{repo.name}</td>
                    <td>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        className="text-success"
                      >
                        {repo.html_url}
                      </a>
                    </td>
                    <td>{repo.language}</td>
                    <td>{formatDate(repo.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
