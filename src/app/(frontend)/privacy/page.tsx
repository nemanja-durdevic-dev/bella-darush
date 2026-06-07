import Link from 'next/link'
import React from 'react'

const PrivacyPage = () => {
  return (
    <div className="p-4">
      <Link href="/" className="hover:underline">
        Tilbake
      </Link>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Personvern & Datasikkerhet</h1>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">1. Hvem er vi?</h3>
          <p>Vi er en barber salong som tilbyr barbering tjenester til kunder.</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">2. Behandling av personopplysninger</h3>
          <p>
            Bella Frisørsalong er opptatt av å beskytte personopplysningen til våre kunder og
            håndterer dette på en kryptert og sikker måte. Personopplysninger blir ikke solgt,
            videreformidlet eller byttet hos oss. Dersom du har noen spørsmål om hvordan vi
            behandler dine personopplysninger kan du ta kontakt med oss via e-post:{' '}
            <Link href="mailto:bellaasalong@gmail.com" className="hover:underline">
              bellaasalong@gmail.com
            </Link>
            .
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">3. Hvorfor samler vi inn personopplysninger?</h3>
          <p>
            Vi samler inn følgende personopplysninger til disse formålene: Gjennomføre en bestilling
            på bellaasalong.com: Fornavn, etternavn, telefonnummer og e-postadresse. Dette skjer med
            ditt samtykke.
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">4. Lojalitetsprogram</h3>
          <p>
            Når du bestiller time, bruker vi e-postadressen din til å knytte bestillingen til
            kundehistorikken din. Dette gjør at vi kan telle klipp bestillinger og gi deg en gratis
            klipp når du oppfyller vilkårene for lojalitetsprogrammet. For at tellingen skal bli
            riktig, må du bruke samme e-postadresse hver gang du bestiller.
          </p>
          <p>
            Vi bruker kun nødvendig informasjon for dette formålet: e-postadresse,
            bestillingshistorikk, valgt tjeneste og status på bestillingen. Opplysningene selges
            ikke og deles ikke med andre. Du kan når som helst kontakte oss hvis du ønsker innsyn,
            endring eller sletting av disse opplysningene.
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">5. Hvilke rettigheter har du?</h3>
          <p>
            Du har rett til å få tilgang til personopplysningene du har gitt oss. Du har også rett
            til å få oppdatere eller slette personopplysningene dine.
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">6. Hvordan kan du kontakte oss?</h3>
          <p>
            Du kan kontakte oss via e-post:{' '}
            <Link href="mailto:bellaasalong@gmail.com" className="hover:underline">
              bellaasalong@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
