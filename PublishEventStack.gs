function publishEventStack(stack, events) {
  let created = 0
  let updated = 0

  // let events = eventsRaw.filter(e => e.getDescription().includes(`#${tag}`) && !e.getDescription().includes(PREFIX))


  for ({ id, title, description, start, end, duration,tag } of stack) {

    const withPrefix = `${PREFIX} ${id}`

    // const existing = events.find(e => e.getDescription().includes(withPrefix))

    const timestampRegexp = / \[\d+:\d+\]$/
    const percentageRegexp = / \[ \d+ ]$/
    const stripMetadata = (title) => title.replace(percentageRegexp, '')

    const updated_event = {
      title, description, start, end, 
    }


    const existing = events.find
    (e => stripMetadata(e.getTitle()) === stripMetadata(title) && e.getDescription().includes(tag))

    // const existing_data = {
    //   description: existing.getDescription(),
    //   title: existing.getTitle(),
    //   start: existing.getStartTime(),
    //   end: existing.getEndTime()
    // }

    if (existing) {
      // const getDuration = (start, end) => Number(Math.abs(start - end))

      // const sameDuration = getDuration(start, end) === getDuration(existing.getStartTime(), existing.getEndTime())

      // if (sameDuration) continue

      if (String(existing.getStartTime()) === String(start) && String(existing.getEndTime()) === String(end)) continue

      existing.setTime(start, end) // update position
      Utilities.sleep(500)
      existing.setTitle(title) // update possible timestamp
      updated++
      continue
    }

    canvasCal.createEvent(title, start, end, {
      description: description + '\n' + withPrefix
    })
    Utilities.sleep(500)
    created++
  }

  log(created ? `created ${created} new events` : "No new events created")
  log(updated ? `updated ${updated} events` : "Nothing updated")

}