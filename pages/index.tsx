import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Table from "react-bootstrap/Table";
import { useFetch } from "use-http";
import React, { useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";

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
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-GB", options);
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
  const [username, setUsername] = useState<string>("");
  const [fetchedUsername, setFetchedUsername] = useState<string>("");
  const [repos, setRepos] = useState<Repository[]>([]);
  const { get, loading, error } = useFetch<Repository[]>(
    "https://api.github.com/users"
  );

  const sortedRepos = useMemo(() => sortRepos(repos), [repos]);

  const handleSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();
    setFetchedUsername(username);
    const repos = await get(username + "/repos");
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

        <div className={styles.results}>
          {showResults({
            username: fetchedUsername,
            repos: sortedRepos,
            error,
            loading,
          })}
        </div>
      </div>
    </div>
  );
};

interface Results {
  username: string;
  repos: Repository[];
  error: Error | undefined;
  loading: boolean;
}

const showResults = ({ username, repos, error, loading }: Results) => {
  if (error) {
    return (
      <Alert variant="danger">
        Something went wrong, make sure to enter a valid GitHub username.
      </Alert>
    );
  }
  if (loading) {
    return <Alert variant="warning">loading</Alert>;
  }
  if (username.length == 0) {
    return (
      <Alert variant="success">Enter GitHub username to see their repos.</Alert>
    );
  }
  if (repos.length == 0) {
    return <Alert variant="info">No repos to show for {username}</Alert>;
  }

  return (
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
        {repos?.map((repo: Repository) => (
          <tr key={repo.name}>
            <td>{repo.name}</td>
            <td>
              <a href={repo.html_url} target="_blank" className="text-success">
                {repo.html_url}
              </a>
            </td>
            <td>{repo.language}</td>
            <td>{formatDate(repo.updated_at)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Home;
