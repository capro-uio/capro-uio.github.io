---
title : Cost estimates
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
  - name : Non-binding talks 
    price : 
      - id: uio
        price: Free
      - id: nc
        price: 1100
      - id: com
        price: 2000
    unit : 1 hour
    services:
      - 1:1 with a team member
      - Advice on services
      - If necessary, cost and time estimates for a project or workshop
    
  - name : Project 
    price : 
      - id: base
        price: 1100
    unit : hourly
    services:
      - Some hours of HPC
      - 1-1 time with a team member
      - Code you will own
      - Direct line of contact with team

  - name : Workshop
    price : 
      - id: base
        price: 2500
    unit : hourly
    services:
      - 2 hours prep per 1 hour workshop
      - Workshop materials
      - Team availability before and after workshop
      - Option for online workshop
---

Our services are contracted on an hourly basis, and our prices include some basic infrastructure to get started.
In case of projects needing secure data locations (like TSD) or heavy computational nodes (like Saga), such project infrastructure will not be handled by CAPRO, but we can aid you in setting up data structures and workflows once you have that in place.
We can advise you in your needs prior to any contracted work is begun.
We also have some resources to run smaller projects on our own servers as long as regulatory guidelines are followed.

Hourly project rates cover human work hours, not computational hours. 
