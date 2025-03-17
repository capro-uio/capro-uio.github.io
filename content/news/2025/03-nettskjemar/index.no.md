---
title : "Oppdatering av R-pakke mot Nettskjema"
author:
  - am_mowinckel
tags:
  - nettskjema
  - R
  - uio
date: 2025-03-17
slug: nettskjemar-update
summary: "Oppdag den forbedrede `nettskjemar` R-pakken med Nettskjema API v3-integrasjon, utvidede funksjoner og tidyverse-kompatibilitet."
---

En ny versjon av vår [nettskjemar](/nettskjemar) R-pakke er nettopp lansert.  
Den nye versjonen kobler seg til det nye Nettskjema API v3, som er en helt ny implementering av API-et.  
R-pakken har en helt ny serie funksjoner til å jobbe mot det nye API-et, og inkluderer spennende forbedringer for arbeid med kodede data.

Pakken har omfattende dokumentasjon [tilgjengelig på nett](/nettskjemar), og vi anbefaler både gamle og nye brukere å gå gjennom alt tilgjengelig materiale for å bli kjent med de nye funksjonene.  
Denne pakken er designet for å hjelpe deg med å enkelt hente, bearbeide og analysere undersøkelsesdata, alt mens den er kompatibel med tidyverse.  

Nedenfor fremhever vi noen av de viktigste funksjonene i `nettskjemar` og hvorfor det kan bli ditt foretrukne verktøy for å jobbe med Nettskjema.  

---

### Viktige funksjoner i `nettskjemar`

#### **1. Last ned skjemabesvarelser med enkelhet**
Med bare noen få linjer R-kode kan du hente svar til et ryddig data format. 
Dette lar deg starte arbeidet med dataene dine umiddelbart uten å bruke tid på manuelle nedlastinger eller filkonverteringer.

```r
install.packages("nettskjemar")
# Last ned skjemabesvarelser i R
library(nettskjemar)
formid <- 123823
data <- ns_get_data(formid)
```

#### **2. Rådata i langformat**
For de som er interessert i tidsstempler eller en detaljert oversikt over hvordan respondenter har interagert med individuelle spørsmål, tillater pakken henting av **rådata** i langt format.  
Denne strukturen er perfekt for å analysere responstider eller andre detaljer, og er kun tilgjengelig for forskere gjennom API-et.

```r
# Hent rådata i langt format
raw_data <- ns_get_data(formid, type = "long")
```

#### **3. Håndtering av avkrysningsmatrise**
Nettskjema inkluderer et avansert avkrysningsmatriseverktøy (checkbox matrix), men de eksporterte dataene kan noen ganger være utfordrende å jobbe med. 
Heldigvis tilbyr `nettskjemar` verktøy for å forenkle og omstrukturere avkrysningsdata til brukervennlige formater, som lister eller separerte strenger.

Eksempel: Slik kan du transformere en avkrysningsmatrise til en separert streng:

```r
# Konverter avkrysningsmatrise til en separert streng
ns_get_data(formid) |>
  ns_alter_checkbox(to = "character", sep = ";")
```

#### **4. Tidyverse-kompatibel**
Dataene hentet med `nettskjemar` er fullt kompatible med tidyverse-økosystemet, noe som gjør det til et intuitivt valg for R-brukere som allerede er kjent med `dplyr`, `tidyr` eller `ggplot2`. Du kan enkelt kjede kommandoer og utforske undersøkelsesdataene dine.

```r
library(dplyr)
library(tidyr)

# Eksempel: Analyse av skjemabesvarelser
data_filtered <- data |>
  filter(radio == 1) |>
  count(checkbox.questionnaires)
```

Hvis du foretrekker å jobbe med individuelle rader for hver avkrysningsverdi, kan du dele dem for mer sømløs analyse:

```r
# Splitt separerte verdier i individuelt oppførte rader
ns_get_data(formid) |>
  ns_alter_checkbox(to = "character", sep = ";") |>
  separate_rows(checkbox_matrix.1)
```

### **Før du starter: Aktivering av kodeboken**
For å sikre en god arbeidsflyt i R, anbefales det å aktivere og konfigurere **kodebok**-funksjonen i Nettskjema-portalen.  
Dette gjør det enklere å jobbe med godt merkede og organiserte data.

Gå til Nettskjema-portalen under *Generelle innstillinger* og aktiver "Kodebok".  
[Les mer om kodebøker her](https://www.uio.no/tjenester/it/adm-app/nettskjema/hjelp/kodebok.html) (innhold kun tilgjengelig på norsk).  

---

### Hvorfor bruke `nettskjemar`?

- **Tidsbesparende**: Hopp over manuelle nedlastinger—hent besvarelser direkte i R.  
- **Tilpassbart**: Utform dataene slik du ønsker—endre avkrysningsmatriser, jobb med rådata i lange formater eller behold brede dataframes.  
- **Tidyverse-integrasjon**: Perfekt for brukere som allerede bruker tidyverse-verktøy for analyse.  
- **Kraftige funksjoner**: Tilgang til metadata, tidsstempler eller håndtering av vedlegg—alt i én pakke.

Utforsk mer og start i dag med dokumentasjonen tilgjengelig [her](/nettskjemar)! 🎉
