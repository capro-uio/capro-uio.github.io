---
title : What it costs
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
  - name: Non-commercial
    id: nc
    percent: 1.3
  - name: Commercial
    id: com
    percent: 2
item :
  - name : A first conversation
    price : 
      - id: uio
        price: 0
      - id: nc
        price: 1100
      - id: com
        price: 2000
    unit : 1 hour
    services:
      - An hour with someone who does the work
      - An honest answer on whether we can help
      - A rough price and timeline, if you want one
    button:
      label : "Book a time"
      link : "#contact"
    
  - name : Project work
    price : 
      - id: base
        price: 880
    unit : hour
    services:
      - Someone on your project, not a ticket queue
      - Code and documentation you own and keep
      - Some computing hours included
      - Direct contact, not a support address

  - name : Workshop
    price : 
      - id: base
        price: 2000
    unit : hour
    services:
      - Built around your group's own data
      - Two hours of preparation per teaching hour
      - Materials you keep and can reuse
      - Online or in person
---

We charge by the hour, and the rate depends on who you are: the closer to the
Department of Psychology, the cheaper. Public agencies and private companies
are welcome too, at the non-commercial and commercial rates. Prices below
exclude VAT.

The rate covers our working hours, not computing time. If your project needs a
secure data area like TSD, or time on a large machine like Saga, you apply for
and pay for that separately — but we will help you work out what to ask for and
set it up once you have it. For smaller projects we can sometimes host the work
on our own servers instead, where the rules allow it.

You can always ask what something would cost before committing to anything.
