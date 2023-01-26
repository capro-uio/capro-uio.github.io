library(scholar)
library(dplyr)
library(knitr)
options(knitr.kable.NA = 'Unsorted')

get_pubs <- function(id, file){
  if(is.null(id)) return()
  dt <- get_publications(id) |>
    as_tibble() |>
    arrange(desc(year)) |>
    mutate(
      url = sprintf("https://scholar.google.no/citations?view_op=view_citation&citation_for_view=%s", pubid),
      auth = sapply(author, function(x){
        k <- strsplit(x, ", ")[[1]]
        if(length(k) > 6){
          k <- paste0(k[1:3], collapse=", ")
          k <- paste(k, "et al.", collapse=" ")
        }else{
          n <- length(k)
          j <- paste0(k[1:(n-1)], collapse=", ")
          k <- paste(c(j, "&", k[n]), collapse=" ")
        }
        k
      })
    ) |>
    transmute(
      author = auth,
      title = sprintf("[%s](%s)", title, url),
      journal = sprintf("%s %s", journal, number),
      year
    )

  rows <- dt |>
    mutate(n = row_number()) |>
    group_by(year) |>
    summarise(
      min = min(n),
      max = max(n)
    )


  tbl <- dt |>
    kable(format = "markdown", )

  writeLines(tbl, file)
}


team <- list.files(here::here("content/team"),
           recursive = TRUE,
           pattern = "^index.en.md$",
           full.names = TRUE)

ids <- team |>
  lapply(readLines) |>
  sapply(function(x){
    j <- x[grep("gscholar", x)] |>
      strsplit('\"')
    if(length(j) > 0)
      j[[1]][2]
  })

mapply(get_pubs,
       id = ids,
       file = gsub("index[.]en", "pubs", team))



