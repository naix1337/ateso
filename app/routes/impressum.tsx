import type {Route} from './+types/impressum';
import {LegalPage} from '~/components/layout/LegalPage';

export const meta: Route.MetaFunction = () => [
  {title: 'Impressum | ateso'},
  {name: 'robots', content: 'noindex'},
];

export default function Impressum() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        [Firmenname]
        <br />
        [Straße Nr.]
        <br />
        [PLZ Ort]
      </p>
      <h2>Kontakt</h2>
      <p>E-Mail: [kontakt@ateso.store]</p>
      <h2>Vertreten durch</h2>
      <p>[Name der vertretungsberechtigten Person]</p>
      <h2>Registereintrag / USt-IdNr.</h2>
      <p>[Registergericht, Registernummer, USt-IdNr.]</p>
    </LegalPage>
  );
}
