library(ggplot2)
library(dplyr)


add.alpha <- function(col, alpha=1){
  apply(sapply(col, col2rgb)/255, 2,
        function(x)
          rgb(x[1], x[2], x[3], alpha=alpha))
}

diamonds |>
  mutate(
    alp = case_when(
      cut == "Fair" ~ 0.3,
      cut == "Good" ~ 0.4,
      cut == "Very Good" ~ 0.5,
      cut == "Premium" ~ 0.6,
      cut == "Ideal" ~ 0.7
    ),
    col = add.alpha("#CC4C4C", alp )
  ) |>
  ggplot(aes(carat*-1, group = cut)) +
  geom_density(aes(colour = I(col))) +
  theme_minimal() +
  theme(
    axis.title = element_blank(),
    axis.text  = element_blank(),
    panel.grid.minor   = element_blank(),
    panel.grid.major.y = element_line(
      linetype = "dashed",
      colour = "#aaaaaa89"
    ),
    panel.grid.major.x = element_blank(),
    panel.background   = element_blank(),
    plot.background    = element_blank()
  ) +
  coord_cartesian(xlim = c(-2.5, -0.3))
ggsave("content/skill/growth.png")
