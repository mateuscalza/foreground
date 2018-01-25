#!/usr/bin/env node
const spawn = require('child_process').spawn
const [startCommand, stopCommand] = require('yargs').argv._

let isStopped = false
let startSpawn = null

if (!startCommand || !stopCommand) {
  console.error('You need to pass the start and stop command.')
}

const [startCommandExec, ...startCommandArgs] = startCommand.split(' ')
const [stopCommandExec, ...stopCommandArgs] = stopCommand.split(' ')

process.stdin.resume()

function start() {
  startCommandContinues = true
  startSpawn = spawn(startCommandExec, startCommandArgs)

  startSpawn.stdout.on('data', data => console.log(data.toString()))
  startSpawn.stderr.on('data', data => console.log(data.toString()))

  startSpawn.on('exit', (code) => {
    startSpawn = null
    // console.log(`Child exited with code ${code}`);
  })
}

function stop() {
  const stopSpawn = spawn(stopCommandExec, stopCommandArgs)

  stopSpawn.stdout.on('data', data => console.log(data.toString()))
  stopSpawn.stderr.on('data', data => console.log(data.toString()))
  stopSpawn.on('exit', () => process.exit())

  if (startSpawn) {
    startSpawn.kill()
  }
}

function exitHandler(err) {
  if (!isStopped) {
    isStopped = true
    stop()
  }
  if (err) console.log(err.stack)
}

// Do something when app is closing
process.on('exit', exitHandler.bind(null))

// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null))

// Catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null))
process.on('SIGUSR2', exitHandler.bind(null))

// Catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null))

start()
