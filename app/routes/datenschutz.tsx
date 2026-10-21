import type {Route} from './+types/datenschutz';
import {LegalPage} from '~/components/layout/LegalPage';

export const meta: Route.MetaFunction = () => [
  {title: 'Datenschutz | ateso'},
  {name: 'robots', content: 'noindex'},
];

export default function Datenschutz() {
  return (
    <LegalPage title="Datenschutz">
      <h2>1. Verantwortlicher</h2>
      <p>[Name und Anschrift des Verantwortlichen]</p>
      <h2>2. Hosting und Shop-System</h2>
      <p>
        [Angaben zu Shopify / Oxygen bzw. Self-Hosting, Auftragsverarbeitung]
      </p>
      <h2>3. Cookies und Warenkorb</h2>
      <p>[Session-Cookie für den Warenkorb, Analytics/Consent]</p>
      <h2>4. Newsletter</h2>
      <p>[Anbieter, Double-Opt-in, Widerruf]</p>
      <h2>5. Ihre Rechte</h2>
      <p>[Auskunft, Berichtigung, Löschung, Beschwerderecht]</p>
    </LegalPage>
  );
}
