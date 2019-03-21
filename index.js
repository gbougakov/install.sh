#!/usr/bin/env node
const meow = require('meow')
const ora = require('ora')
const got = require('got')
const inquirer = require('inquirer')
const execa = require('execa')

const helpText = `
  install.sh - The Universal Install Script
  
	Usage
	  $ install.sh <package-name>

	Examples
	  $ install.sh wget
	  $ install.sh np
`;

(async () => {
  const cli = meow(helpText)

  if (!cli.input[0]) {
    return console.log(helpText)
  }

  const packageName = cli.input[0]
  const results = {}

  const npmSpinner = ora('Searching on NPM').start()
  try {
    const {body} = await got(`https://api.npms.io/v2/package/${packageName}`)
    npmSpinner.succeed('Package found on NPM')
    results.npm = {
      name: JSON.parse(body).collected.metadata.name,
      desc: JSON.parse(body).collected.metadata.description,
      author: JSON.parse(body).collected.metadata.publisher.username
    }
    // Console.log(JSON.parse(body))
  } catch (error) {
    if (error.statusCode === 404) {
      npmSpinner.fail('Package not found on NPM')
    } else {
      npmSpinner.fail(JSON.parse(error.body).message)
    }
  }

  const brewSpinner = ora('Searching on Homebrew').start()
  try {
    const {body} = await got(
      `https://formulae.brew.sh/api/formula/${packageName}.json`)
    brewSpinner.succeed('Package found on Homebrew')
    // Console.log(JSON.parse(body))
    results.brew = {
      name: JSON.parse(body).name,
      desc: JSON.parse(body).desc,
      author: '[not listed]'
    }
  } catch (error) {
    if (error.statusCode === 404) {
      brewSpinner.fail('Package not found on Homebrew')
    } else {
      brewSpinner.fail(error.message)
      throw error
    }
  }

  const pipSpinner = ora('Searching on PyPI').start()
  try {
    const {body} = await got(`https://pypi.org/pypi/${packageName}/json/`)
    pipSpinner.succeed('Package found on PyPI')
    // Console.log(JSON.parse(body))
    results.pip = {
      name: JSON.parse(body).info.name,
      desc: JSON.parse(body).info.summary,
      author: JSON.parse(body).info.author
    }
  } catch (error) {
    if (error.statusCode === 404) {
      pipSpinner.fail('Package not found on PyPI')
    } else {
      pipSpinner.fail(error.message)
      throw error
    }
  }

  const {packagemanager} = await inquirer.prompt([
    {
      type: 'list',
      name: 'packagemanager',
      message: 'What package manager would you like to use?',
      choices: Object.keys(results)
    }
  ])

  const {rusure} = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'rusure',
      message: `Are you sure you want to install ${results[packagemanager].name} (${results[packagemanager].desc}) by ${results[packagemanager].author} from ${packagemanager}?`,
      default: true
    }
  ])

  if (!rusure) {
    return
  }

  if (packagemanager === 'pip') {
    const pmprocess = execa.shell('pip install ' + packageName)
    pmprocess.stdout.pipe(process.stdout)
    pmprocess.stderr.pipe(process.stderr)
  }

  if (packagemanager === 'brew') {
    const pmprocess = execa.shell('brew install ' + packageName)
    pmprocess.stdout.pipe(process.stdout)
    pmprocess.stderr.pipe(process.stderr)
  }

  if (packagemanager === 'npm') {
    const pmprocess = execa.shell('npm i -g ' + packageName)
    pmprocess.stdout.pipe(process.stdout)
    pmprocess.stderr.pipe(process.stderr)
  }
})()
