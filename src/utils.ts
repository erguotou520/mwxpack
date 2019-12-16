import chalk from 'chalk'

export function debug(str: string) {
  console.log(chalk.grey(str))
}

export function log(str: string) {
  console.log(chalk.blue(str))
}

export function error(str: string) {
  console.log(chalk.red(str))
}

export function warn(str: string) {
  console.log(chalk.yellow(str))
}
