import { site } from "../site.js";

export default function Footer() {
  return (
    <footer className="footer">
      <span>{site.name}</span>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms and Conditions</a>
    </footer>
  );
}
