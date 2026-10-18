---
title : Hva det koster
entities:
  - name: PSI UiO
    id: psi
    percent: 1
  - name: SV UiO
    id: sv
    percent: 1.1
  - name: UiO
    id: uio
    percent: 1.2
  - name: Ikke-kommersiell
    id: nc
    percent: 1.3
  - name: Kommersiell
    id: com
    percent: 2
item :
  - name : Uforpliktende samtale
    price :
      - id: uio
        price: 0
      - id: nc
        price: 1100
      - id: com
        price: 2000
    unit: 1 time
    services:
      - En time med en som gjør jobben selv
      - Et ærlig svar på om vi kan hjelpe
      - Et grovt pris- og tidsoverslag, om du vil ha det
    button:
      label : "Book en tid"
      link : "#contact"

  - name : Prosjekt
    price :
      - id: base
        price: 880
    unit: pr time
    services:
      - En person på prosjektet ditt, ikke en sakskø
      - Kode og dokumentasjon du eier og beholder
      - Noen regnetimer inkludert
      - Direkte kontakt, ikke en support-adresse
#     button:
#       label : "Signup"
#       link : "#"

  # pricing table loop
  - name : Kurs
    price :
      - id: base
        price: 2000
    unit : pr time
    services:
      - Bygget rundt gruppas egne data
      - To timer forberedelse per undervisningstime
      - Materiell dere beholder og kan gjenbruke
      - På nett eller på stedet
#     button:
#       label : "Signup"
#       link : "#"
---

Vi tar betalt per time, og satsen avhenger av hvem du er: jo nærmere
Psykologisk institutt, jo billigere. Prisene under er uten mva.

Satsen dekker vår arbeidstid, ikke regnetid. Trenger prosjektet et sikkert
dataområde som TSD, eller tid på en stor maskin som Saga, søker og betaler du
for det separat — men vi hjelper deg med å finne ut hva du skal be om, og med å
sette det opp når du har det. For mindre prosjekter kan vi noen ganger kjøre
arbeidet på våre egne tjenere i stedet, der regelverket tillater det.

Du kan alltid spørre hva noe vil koste før du forplikter deg til noe.
