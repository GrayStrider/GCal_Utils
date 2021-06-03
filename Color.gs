function colorEvents(events) {
  let colored = 0;

  for (e of events) {
    const tag = e.getDescription().match(tagRegexp)[1]
    const color = tagsColors[tag]

    if (tag && color && !(e.getColor() == tagsColors[tag])) {
      e.setColor(color)
      colored++
      Utilities.sleep(100)
    }
  }

  log(colored ? `Updated color for ${colored} events` : "No color changes made")
}