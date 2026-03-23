(function () {
  var container = document.getElementById("orcid-pubs");
  if (!container) return;

  var orcidId = container.dataset.orcid;
  if (!orcidId) return;

  var loading = document.getElementById("orcid-pubs-loading");
  var error = document.getElementById("orcid-pubs-error");
  var content = document.getElementById("orcid-pubs-content");
  var yearSelect = document.getElementById("orcid-pubs-year-select");
  var tbody = document.getElementById("orcid-pubs-tbody");

  var apiBase =
    "https://api.openalex.org/works?filter=author.orcid:" +
    orcidId +
    "&select=title,publication_year,primary_location,doi,authorships" +
    "&sort=publication_year:desc&per_page=200" +
    "&mailto=a.m.mowinckel@psykologi.uio.no";

  function formatAuthors(authorships) {
    var names = authorships.map(function (a) {
      return a.author.display_name;
    });
    if (names.length > 6) {
      return names.slice(0, 3).join(", ") + " et al.";
    }
    if (names.length > 1) {
      return names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
    }
    return names[0] || "";
  }

  function stripHtml(str) {
    var tmp = document.createElement("span");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }

  function fetchAll(url, collected) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("OpenAlex API error: " + res.status);
        return res.json();
      })
      .then(function (data) {
        collected = collected.concat(data.results);
        if (data.meta.next_cursor) {
          return fetchAll(
            apiBase + "&cursor=" + data.meta.next_cursor,
            collected
          );
        }
        return collected;
      });
  }

  fetchAll(apiBase + "&cursor=*", [])
    .then(function (results) {
      var pubs = [];

      results.forEach(function (w) {
        var title = w.title ? stripHtml(w.title) : "";
        var year = w.publication_year;
        var loc = w.primary_location || {};
        var src = loc.source || {};
        var journal = src.display_name || "";
        var doi = w.doi || null;
        var authors = formatAuthors(w.authorships || []);

        if (title && year) {
          pubs.push({
            title: title,
            journal: journal,
            year: year,
            doi: doi,
            author: authors,
          });
        }
      });

      pubs.sort(function (a, b) {
        return b.year - a.year;
      });

      var years = [];
      pubs.forEach(function (p) {
        if (years.indexOf(p.year) === -1) years.push(p.year);
      });

      years.forEach(function (y) {
        var option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
      });

      var rows = [];

      pubs.forEach(function (p) {
        var tr = document.createElement("tr");
        tr.dataset.year = p.year;

        var tdYear = document.createElement("td");
        tdYear.className = "pub-year";
        tdYear.textContent = p.year;

        var tdAuthor = document.createElement("td");
        tdAuthor.className = "pub-authors";
        tdAuthor.textContent = p.author;

        var tdTitle = document.createElement("td");
        tdTitle.className = "pub-title";
        if (p.doi) {
          var a = document.createElement("a");
          a.href = p.doi;
          a.textContent = p.title;
          a.target = "_blank";
          a.rel = "noopener";
          tdTitle.appendChild(a);
        } else {
          tdTitle.textContent = p.title;
        }

        var tdJournal = document.createElement("td");
        tdJournal.className = "pub-journal";
        tdJournal.textContent = p.journal;

        tr.appendChild(tdYear);
        tr.appendChild(tdAuthor);
        tr.appendChild(tdTitle);
        tr.appendChild(tdJournal);
        tbody.appendChild(tr);
        rows.push(tr);
      });

      loading.style.display = "none";
      content.style.display = "block";

      yearSelect.addEventListener("change", function () {
        var val = yearSelect.value;
        rows.forEach(function (row) {
          row.style.display = (val === "all" || row.dataset.year === val) ? "" : "none";
        });
      });
    })
    .catch(function () {
      loading.style.display = "none";
      error.style.display = "block";
    });
})();
