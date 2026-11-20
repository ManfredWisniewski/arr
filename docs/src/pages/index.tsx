import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main style={{maxWidth: '60rem', margin: '0 auto', padding: '4rem 1rem'}}>
        <Heading as="h1">{siteConfig.title}</Heading>
        <p>{siteConfig.tagline}</p>
        <p>
          This documentation ships inside the arr image — it always matches
          the version you are running.
        </p>
        <ul>
          <li>
            <Link to="/dev/intro">Developer documentation</Link> — setup,
            architecture, content sync, deployment
          </li>
          <li>
            <Link to="/editor/">Editor documentation</Link> — publishing and
            the review flow
          </li>
          <li>
            <Link to="/blog">Blog</Link> — release notes and news
          </li>
        </ul>
      </main>
    </Layout>
  );
}
