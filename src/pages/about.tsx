import React, { DetailedHTMLProps } from 'react';
import { AppHeader } from '../components/header';

function ExternalLink(props: DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) {
    return <a {...props}/>;
}

export default function AboutPage() {
    return <>
        <AppHeader backUrl="#">About</AppHeader>
        <h2>What is Matrix Wrench?</h2>
        <p>
            Matrix Wrench is a fast, convenient way to manage Matrix rooms. It&apos;s a user interface for tasks where one would have used the terminal application CURL.
        </p>
        <p>
            A common task is to view and edit a room state, e.g. to change the power levels. It works with access tokens of regular users and appservices (bridges and complex bots). If you give it an appservice token you can access any room the appservice has access to, allowing to easily debug and administrate bridges.
        </p>
        <p>
            Furthermore, a few tasks around homeserver administration are supported, like listing media files in unencrypted rooms. The majority of features use the standardized <ExternalLink href="https://spec.matrix.org/">Matrix protocol</ExternalLink>. If a feature makes use of the Synapse Admin API, this is noted.
        </p>
        <h2>Identities</h2>
        <p>
            You can manage multiple logins to various homeservers. An identity is a combination of a homeserver URL and an access token. The identity name is only used for identification within Matrix Wrench.
        </p>
        <h2>Privacy and Security</h2>
        <p>
            No information about your homeserver or actions is sent to the developer or host of this web application. Identities are optionally stored in your browser&apos;s <ExternalLink href="https://developer.mozilla.org//docs/Web/API/Window/localStorage">localStorage</ExternalLink>. To eliminate the risk of a malicious release which could compromise your Matrix access tokens, download the application&apos;s source code and host it on a static HTTP(S) server.
        </p>
        <p>
            Matrix Wrench is my hobby project without a security audit or peer review. I use it at work and try to apply some best practices from my professional work to the development, however, Matrix Wrench is neither backed nor endorsed by my employer. There are a few unit tests that are automatically run on every commit. The project&apos;s dependencies are currently limited to <ExternalLink href="https://www.npmjs.com/package/htm">htm</ExternalLink> for rendering the interface.
        </p>
        <h2>Development</h2>
        <p>Found a bug? Want a feature? Please use the <ExternalLink href="https://gitlab.com/jaller94/matrix-wrench/-/issues">issue tracker on Gitlab.com</ExternalLink>.</p>
        <ul>
            <li>Code: <ExternalLink href="https://gitlab.com/jaller94/matrix-wrench">Matrix Wrench on Gitlab.com</ExternalLink></li>
            <li>License: <ExternalLink href="https://choosealicense.com/licenses/apache-2.0/">Apache 2.0</ExternalLink></li>
            <li>Author: <ExternalLink href="https://chrpaul.de/about">Christian Paul</ExternalLink></li>
        </ul>
    </>;
}
