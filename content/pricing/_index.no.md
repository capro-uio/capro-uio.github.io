---
title : Våre priser
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
      - 1-1 tid med medarbeider
      - Råd om tjenester
      - Om nødvendig, prisoverslag for et prosjekt eller kurs
    button:
      label : "Book en tid"
      link : "#book"

  - name : Prosjekt
    price :
      - id: base
        price: 1100
    unit: pr time
    services:
      - Noen timer HPC
      - 1-1 tid med medarbeider
      - Kode du vil eie
      - Direkte kontakt med en medarbeider
#     button:
#       label : "Signup"
#       link : "#"

  # pricing table loop
  - name : Kurs
    price :
      - id: base
        price: 2500
    unit : pr time
    services:
      - 2 timer forberedelser per 1 time kurs
      - kursmaterialer
      - Kursholder tilgjengelighet før og etter kurset
      - Mulighet for online kurs
#     button:
#       label : "Signup"
#       link : "#"
---

Tjenestene våre kjøpes på timebasis, og prisene våre inkluderer noe grunnleggende infrastruktur for å komme i gang.
Timebaserte prosjektpriser dekker menneskelig arbeidstid, ikke beregningstimer.
