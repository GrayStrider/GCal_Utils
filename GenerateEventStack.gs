function generateEventStack(events) {

  let stack = []

  let eventsData = events.map(e => ({
    id: e.getId(),
    title: e.getTitle(),
    description: e.getDescription(),
    start: e.getStartTime(),
    end: e.getEndTime()
  }))

  for (tag of sortIndex) {

    // keep only events with tag and without prefix
    let tagEvents = eventsData.filter
      (e => e.description.includes(`#${tag}`) && !e.description.includes(PREFIX))

    // remove short events
    tagEvents = tagEvents.filter
      (e => e.start.toString() !== e.end.toString())

    // offset events by 1m for correct visualisation order display
    if (tag === sortIndex[0]) {
      const firstEvent = tagEvents[0]
      if (firstEvent) {
        firstEvent.end.setMinutes(firstEvent.end.getMinutes() - 1)
      }
    }

    // add duration
    tagEvents = tagEvents.map(e => ({
      ...e,
      duration: Number(Math.abs(e.start - e.end))
    }))

    // add tag
    tagEvents = tagEvents.map(e => ({
      ...e,
      tag: e.description.match(/(#.+)\n/)[1]
    }))

    // group by title for further sorting
    tagEvents = groupBy(tagEvents, event => event.title)


    // generate table with total duration for the each title
    const titleDurationTable = Array.from(tagEvents.entries())
      .reduce((acc, [key, value]) => {
        acc[key] = value.reduce
          ((acc, curr) => acc + curr.duration, 0)
        return acc
      }, {})

    // // sort by title alphabetically
    // tagEvents = new Map([...tagEvents].sort
    //   ((a, b) => String(a[0]).localeCompare(b[0])))

    // sort by total duration (a[0] is key, a[1] is value)
    tagEvents = new Map([...tagEvents].sort
      ((a, b) => titleDurationTable[a[0]] - titleDurationTable[b[0]]))

    // unpack
    tagEvents = Array.from(tagEvents.values())

    // sort every title's entries by duration
    tagEvents = tagEvents.map(entries => entries.sort(
      (a, b) => b.duration - a.duration
    ))


    // flatten
    tagEvents = tagEvents.flat()

    // adjust start and stop dates
    tagEvents = tagEvents.reduce((acc, curr) => {
      const startTime = getStartTime(acc, stack)
      const updated = {
        ...curr,
        start: startTime,
        end: new Date(startTime.getTime() + curr.duration)
      }

      acc.push(updated)
      return acc
    }, [])

    // OPTIONAL: merge entries with the same title
    const uniqueTitles = Array.from(new Set(tagEvents.map(event => event.title)))

    tagEvents = uniqueTitles.reduce((acc, curr, index) => {
      const copy = tagEvents.slice()
      const first = copy.find(entry => entry.title === curr)
      const last = copy.reverse().find(entry => entry.title === curr)

      first.end = last.end
      first.duration = Number(Math.abs(first.start - first.end))

      acc[index] = first
      return acc
    }, [])

    // add identifier
    for (event of tagEvents) {
      event.title = '* ' + event.title
    }

    // pad long groups
    // implement check for padded title in PublishEventStack....

    // for (event of tagEvents) {
    //   if (event.duration > 40/* m */ * 60 * 1000) {
    //     event.title = "⠀"/* U+2800 */.repeat(4) + event.title
    //   }
    // } 

    // generate timestamp

    const timeStampEvent = tagEvents
      .slice()
      .reverse()
      // should be tall enough to fit in the calendar
      .find(({ duration, title }) => duration > 10 * 60 * 1000 && title.length < 19)

    if (timeStampEvent) {
      timeStampEvent.title += groupPercentage(tagEvents)
    }

    // for (event of tagEvents) {
    //   event.title = event.title + eventPercentage(event)
    // }

    stack = stack.concat(tagEvents)
  }

  // const lastEvent = stack[stack.length - 1]
  // lastEvent.end.setSeconds(lastEvent.end.getSeconds() + 2)

  // stack

  return stack
}

function groupPercentage(tagEvents) {
  const totalForTag = tagEvents.reduce((prev, curr) => {
    prev += curr.duration
    return prev
  }, 0)

  const TOTAL = (24 - 8 - 4) * (60 * 60 * 1000)

  const percent = (100 * totalForTag / TOTAL)
  if (percent < 4) return ''

  return ` [ ${Math.round(percent)} ]`
}

function eventPercentage(event) {
  const TOTAL = 16 * (60 * 60 * 1000)

  const percent = (100 * event.duration / TOTAL).toFixed(1)
  if (percent < 4) return ''

  return ` [${percent}]`
}

function eventTimestamp(event) {
  let minutes = Math.floor(event.duration / 60000)
  const hours = Math.floor(minutes / 60)
  minutes = minutes - hours * 60

  return ` [${hours}:${pad(minutes)}]`
}

function tagTimestamp(tagEvents) {
  const totalForTag = tagEvents.reduce((prev, curr) => {
    prev += curr.duration
    return prev
  }, 0)

  let minutes = Math.floor(totalForTag / 60000)
  const hours = Math.floor(minutes / 60)
  minutes = minutes - hours * 60

  return ` [${hours}:${pad(minutes)}]`
}

function getStartTime(tagEventArr, mainStackArr) {
  if (tagEventArr.length === 0) { // if no previous event of the current tag present, check main array
    if (mainStackArr.length === 0) { // if no previous element of the main array, set start of the day
      today.setHours(0, 0, 0, 0)
      return today
    }
    return last(mainStackArr).end
  }

  return last(tagEventArr).end

  // otherwise return the end of the last event as the new start time
}

