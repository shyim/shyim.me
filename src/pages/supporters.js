import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

function Supports() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Supports`}
      description="Supports">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">Supports</h1>
          <p className="hero__subtitle">This awesome people are supporting me</p>
          <div className={styles.buttons}>
          </div>
        </div>
      </header>
      <main>
          <div className="main-wrapper">
              <div className="container margin-vert--lg">
                  <h2 id="github-sponsors">Github Sponsors</h2>
                  <ul>
                      <li>Thanks &lt;3 to <a href="https://www.webversiert.de/">Webversiert GmbH</a> for sponsoring me &lt;3<ul>
                          <li>Thanks &lt;3 to <a href="https://github.com/MBDealer">Rafael Prukop</a> for sponsoring me &lt;3</li>
                          <li><a href="https://github.com/ChristopherDosin">Christopher Dosin</a> for sponsoring me &lt;3</li>
                          <li><a href="https://github.com/mkreusch">Marcus Kreusch</a> for sponsoring me &lt;3</li>
                          <li><a href="https://github.com/xndrdev">Alexander Wolf</a> for sponsoring me &lt;3</li>
                      </ul>
                      </li>
                  </ul>
                  <h2 id="paypal-supporters">PayPal Supporters</h2>
                  <ul>
                      <li>Kai Neuwerth (13,37€)</li>
                      <li>Sebastian Langer (5€)</li>
                      <li>Martin Schneider (6,66€)</li>
                      <li>Uwe Kleinmann (5€)</li>
                      <li>Joshua Behrens (4,20€)</li>
                      <li>Michael Telgmann (6,66€)</li>
                      <li>Christopher Puschmann (5,77€)</li>
                      <li>Alea123 (6,66€)</li>
                      <li>Rafael Prukop (25€)</li>
                      <li>Nils Vosgröne (0,68€)</li>
                      <li>Lars Borchert (6,66€)</li>
                      <li>Lars Lohmann (5€)</li>
                      <li>Sebastian König (5€)</li>
                      <li>Alexander W.H. Wachert (5€)</li>
                      <li>Johan Moormann (75€)</li>
                      <li>David Neustadt (5€)</li>
                      <li>Christian Voss (50€)</li>
                      <li>Stefano Rutishauser (15€)</li>
                  </ul>
                  <p>Moneypool-Link: <a href="https://www.paypal.com/pools/c/7ZiGCZH8iU">https://www.paypal.com/pools/c/7ZiGCZH8iU</a></p>
              </div>
          </div>
      </main>
    </Layout>
  );
}

export default Supports;
