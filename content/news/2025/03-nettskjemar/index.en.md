---
title : "Update to R package towards Nettskjema" 
author: 
  - am_mowinckel 
tags: 
  - nettskjema
  - R
  - uio
date: 2025-03-20
summary: |
  Discover the improved `nettskjemar` R package with Nettskjema API v3 integration, enhanced functions, and tidyverse compatibility.
---

A new version of our [nettskjemar](/nettskjemar) R-package has just been released.
The new version connects to the new Nettskjema API v3, which is a wholly new implementation of the API.
The R-package has a full new suite of functions to work with the new API, and includes some exciting new enhancements for working with labelled data. 

The package has extensive documentation [online](/nettskjemar), and we recommend both old and new users have a look through all the materials available to familiarize themselves with the new features. 

This package is designed to help you effortlessly retrieve, process, and analyze survey data, all while being tidyverse-compatible. 
Below, we highlight some of the key features of `nettskjemar` and why it might become your go-to tool for working with Nettskjema.

### Key Features of `nettskjemar`

#### **1. Download Form Submissions with Ease**
With just a few lines of R code, you can pull survey answers into a tidy dataframe. 
This allows you to start working with your data immediately without spending time on manual downloads or file conversions.

```r
install.packages("nettskjemar")

# Download form submissions into R
library(nettskjemar)
formid <- 123823
data <- ns_get_data(formid)
```

#### **2. Raw Data in Long Format**
For those interested in timestamps or a detailed breakdown of how survey respondents interacted with individual questions, the package allows retrieval of **raw data** in long format. 
This structure is perfect for analyzing response times or other granular aspects, and is only available to researchers through the API.

```r
# Fetch raw data in a long format
raw_data <- ns_get_data(formid, type = "long")
```

#### **3. Checkbox Matrix Handling**
Nettskjema includes an advanced checkbox matrix functionality, but the exported data can sometimes be tricky to manage. 
Fortunately, `nettskjemar` offers tools to simplify and reshape checkbox data into user-friendly formats: such as as lists, delimited strings, or separated rows.

For example, here’s how you can transform a checkbox matrix into a delimited string:

```r
# Transform checkbox matrix into a delimited string
ns_get_data(formid) |>
  ns_alter_checkbox(to = "character", sep = ";")
```

#### **4. Tidyverse-Compatible**
The data retrieved with `nettskjemar` is fully compatible with the tidyverse ecosystem, making it an intuitive choice for R users already familiar with `dplyr`, `tidyr`, or `ggplot2`. 
You can chain commands and explore your survey data with remarkable ease.

```r
library(dplyr)
library(tidyr)

# Example: Analyzing survey submissions
data_filtered <- data |>
  filter(radio == 1) |>
  count(checkbox.questionnaires)
```

If you'd rather work with rows for each selected checkbox matrix values, you can separate them for seamless analysis:

```r
# Split delimited checkbox values into individual rows
ns_get_data(formid) |>
  ns_alter_checkbox(to = "character", sep = ";") |>
  separate_rows(checkbox_matrix.1)
```

### **Before Getting Started: Codebook Setup**
To ensure smooth analysis in R, it’s recommended to enable and configure the **codebook** feature in the Nettskjema portal. 
This makes it easier to work with well-labeled, organized data. 
Head to the Nettskjema Portal’s *General Settings* and activate the "Codebook" option for your form. [Learn more about codebooks here](https://www.uio.no/tjenester/it/adm-app/nettskjema/hjelp/kodebok.html) (content in Norwegian).

---

### Why Use `nettskjemar`?

- **Time-Saving**: Skip manual data downloads—seamlessly fetch survey submissions directly into R.
- **Customizable**: Tidy data the way you want—reshape checkbox matrices, fetch raw tall data, or stick with wide-form tibbles.
- **Tidyverse Integration**: Perfect for users who already employ tidyverse tools for analytics.
- **Powerful Features**: Access submission metadata, analyze timestamps, or even work with attachments—`nettskjemar` does it all.
