import chalk from 'chalk'

export function error (str: string) {
  console.log(chalk.red(str))
}

export function warn (str: string) {
  console.log(chalk.yellow(str))
}
