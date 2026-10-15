import LegalPage, { Contact } from "./LegalPage.jsx";
import { site } from "../site.js";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        {site.name} extracts PDF files from JSON that you paste into the page. This policy explains what
        happens to that data and what this site does and does not collect.
      </p>

      <h2>Your JSON and PDFs stay in your browser</h2>
      <p>
        Everything you paste, extract, preview and download is processed locally by your browser. The
        JSON, the decoded PDFs and the ZIP file are not sent to any server operated by this site. There
        are no accounts and no database. The data is held in memory only, so refreshing or closing the
        tab discards it.
      </p>

      <h2>What this site does not do</h2>
      <ul>
        <li>It does not use cookies.</li>
        <li>It does not use analytics, advertising or tracking scripts.</li>
        <li>It does not load fonts or scripts from third-party servers. Fonts are served from this site.</li>
        <li>It does not store anything in your browser storage.</li>
      </ul>

      <h2>Hosting</h2>
      <p>
        The site is hosted on Netlify. Like any web host, Netlify may process technical data such as your
        IP address, the pages requested, your browser type and the time of the request in order to serve
        the site and keep it secure. See Netlify's own privacy policy for how it handles that data.
      </p>

      <h2>Sensitive documents</h2>
      <p>
        The documents you process may contain personal or financial information. Because processing
        happens on your device, that information is not shared with us. You are responsible for who can
        see your screen and for where you save the downloaded files.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes, the date at the top of this page will be updated.</p>

      <Contact />
    </LegalPage>
  );
}
