library(jsonlite)
library(scholar)

get_pubs <- function(id, file) {
  if (is.null(id)) return()
  dt <- get_publications(id)
  dt <- dt[order(dt$year, decreasing = TRUE), ]
  # dt$url <- sprintf("https://scholar.google.no/citations?view_op=view_citation&citation_for_view=%s", dt$pubid)
  dt$author <- sapply(dt$author, function(x) {
    k <- strsplit(x, ", ")[[1]]
    if (length(k) > 6) {
      k <- paste0(k[1:3], collapse = ", ")
      k <- paste(k, "et al.", collapse = " ")
    } else {
      n <- length(k)
      j <- paste0(k[1:(n - 1)], collapse = ", ")
      k <- paste(c(j, "&", k[n]), collapse = " ")
    }
    k
  })
  dt$journal <- ifelse(
    dt$journal == "",
    "",
    sprintf("%s %s", dt$journal, dt$number)
  )
  dt <- dt[, c("year", "author", "title", "journal", "pubid")]
  row.names(dt) <- NULL

  dir.create(dirname(file), showWarnings = FALSE, recursive = TRUE)
  cat("writing to: ", normalizePath(file), "\n")
  jsonlite::write_json(dt, file, pretty = TRUE, auto_unbox = TRUE)
}


team <- list.files(
  "content/team",
  recursive = TRUE,
  pattern = "^index.en.md$",
  full.names = TRUE
)

ids <- team |>
  lapply(readLines) |>
  sapply(function(x) {
    j <- x[grep("gscholar", x)] |>
      strsplit('\"')
    if (length(j) > 0) j[[1]][2]
  })

j <- mapply(
  get_pubs,
  id = ids,
  file = paste0("data/team/pubs/", basename(dirname(team)), ".json")
)
