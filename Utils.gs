const secrets = PropertiesService.getScriptProperties()

const pad = (num) => String(num).padStart(2, '0')
const last = (arr) => {
  if (arr.length === 0) throw new Error(`Can't get the last element, array is empty`)
  return arr[arr.length - 1]
}
const log = (args) => console.log(args)


let today = new Date()
// today.setDate(today.getDate() - 1) // yesterday

const canvasCal = CalendarApp.getCalendarById(secrets.getProperty('canvasCalId'))

const sourceCal = CalendarApp.getCalendarById(secrets.getProperty('sourceCalId'))

const tagRegexp = /\#(\S+)/

// function Main () {
//   Logger.log(secrets.getProperty('canvasCalId'))
//   Logger.log(canvasCal)
// }