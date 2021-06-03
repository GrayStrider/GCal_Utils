function Main() {
  
  const stack = generateEventStack(getEvents(sourceCal))

  const firstEvent = stack[0]
  if (firstEvent) {
    firstEvent.start.setMinutes(firstEvent.start.getMinutes() + 1)
  }
  
  publishEventStack(stack, getEvents(canvasCal))

  colorEvents(getEvents(sourceCal))
  colorEvents(getEvents(canvasCal))

}

function DeleteCanvasEvents() {
  let deleted = 0

  const events = getEvents(canvasCal)
  // .filter(event => event.getTitle().includes('* '))

  for (event of events) {
    event.deleteEvent()
    Utilities.sleep(100)
    deleted++
  }

  log(deleted ? `deleted ${deleted}` : `Nothing deleted`)
}

function getEvents(cal) {
  return cal.getEventsForDay(today)
}